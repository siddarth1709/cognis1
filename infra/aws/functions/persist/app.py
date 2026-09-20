from __future__ import annotations

import json
import os
import time
from decimal import Decimal

import boto3

s3 = boto3.client("s3")
dynamodb = boto3.resource("dynamodb")
TABLE_NAME = os.environ["INVESTIGATIONS_TABLE"]
PUBLISHED_DOCUMENTS_TABLE = os.environ.get("PUBLISHED_DOCUMENTS_TABLE")
PUBLISHED_DOCS_BUCKET = os.environ.get("PUBLISHED_DOCS_BUCKET")
PUBLISHED_DOCS_CLOUDFRONT_URL = os.environ.get("PUBLISHED_DOCS_CLOUDFRONT_URL", "").rstrip("/")


def _failure_message(error: object) -> str:
    if isinstance(error, str):
        return error[:1000]
    return json.dumps(error, default=str)[:1000]


def _published_document(result: dict, event: dict, investigation_id: str) -> tuple[str, str] | None:
    """Create a reviewable, evidence-led document only after the gate passes."""
    transactions = result.get("transactions") or []
    verified = [tx for tx in transactions if tx.get("status") in {"verified", "patched"}]
    rejected = [tx for tx in transactions if tx.get("status") == "rejected"]
    # Publication is all-or-nothing: a pending or rejected repair cannot be
    # laundered into a trustworthy documentation claim by its verified peers.
    if not transactions or rejected or len(verified) != len(transactions):
        return None

    lines = [
        f"# {event['repository']} — Cognis verified reference",
        "",
        "> **Publication status: verified.** This document was generated from repository evidence and passed Cognis's publication gate. It records observed behavior, not unverified architectural intent.",
        "",
        "## Executive reading",
        "",
        f"Cognis examined `{event['owner']}/{event['repository']}` at `{event['ref']}` and reconciled its implementation, tests, and documentation surfaces. The resulting reference is deliberately conservative: every published conclusion below is tied to a verified repair transaction, so downstream engineers and AI coding agents can distinguish an observed contract from a plausible but unsupported inference.",
        "",
        "## Verified behavioral contracts",
        "",
    ]
    for tx in verified:
        plan = tx.get("plan") or {}
        lines.extend((
            f"### `{tx.get('contract_id', 'unnamed-contract')}`",
            "",
            f"**Evidence location:** `{plan.get('target_file', 'unknown')}`  ",
            f"**Reconciled assertion:** `{plan.get('find_text', '')}` → `{plan.get('replace_text', '')}`  ",
            f"**Confidence:** {float(plan.get('confidence', 0)):.2f}",
            "",
            str(plan.get("rationale") or "The published assertion was reconciled against implementation evidence."),
            "",
        ))
    lines.extend((
        "## Interpretation boundary",
        "",
        "This surface is a living publication, not a substitute for source review. Cognis publishes only after verification and preserves the investigation identifier below so readers can trace the document to its evidence record. A later scan creates a new version; it never silently rewrites a prior publication.",
        "",
        f"- Investigation: `{investigation_id}`",
        f"- Generated at: `{int(time.time())}` (Unix seconds)",
        "",
    ))
    return "\n".join(lines), f"published/{event['owner']}/{event['repository']}/{investigation_id}/index.md"


def _publish_document(result: dict, event: dict, investigation_id: str) -> dict | None:
    if not (PUBLISHED_DOCUMENTS_TABLE and PUBLISHED_DOCS_BUCKET):
        return None
    generated = _published_document(result, event, investigation_id)
    if generated is None:
        return None
    body, key = generated
    now = int(time.time())
    s3.put_object(
        Bucket=PUBLISHED_DOCS_BUCKET,
        Key=key,
        Body=body.encode("utf-8"),
        ContentType="text/markdown; charset=utf-8",
        CacheControl="public, max-age=60, must-revalidate",
        Metadata={"investigation-id": investigation_id, "publication-status": "verified"},
    )
    document = {
        "document_id": f"doc#{investigation_id}",
        "investigation_id": investigation_id,
        "repository_key": f"{event['owner']}/{event['repository']}",
        "repository": event["repository"],
        "owner": event["owner"],
        "ref": event["ref"],
        "status": "PUBLISHED",
        "published_at": now,
        "s3_key": key,
        "url": f"{PUBLISHED_DOCS_CLOUDFRONT_URL}/{key}" if PUBLISHED_DOCS_CLOUDFRONT_URL else None,
    }
    dynamodb.Table(PUBLISHED_DOCUMENTS_TABLE).put_item(Item={k: v for k, v in document.items() if v is not None})
    return document


def handler(event, context):
    investigation_id = event["investigation_id"]
    table = dynamodb.Table(TABLE_NAME)

    if event.get("error"):
        table.put_item(
            Item={
                "investigation_id": investigation_id,
                "status": "FAILED",
                "repository": event["repository"],
                "owner": event["owner"],
                "ref": event["ref"],
                "created_at": int(time.time()),
                "error": _failure_message(event["error"]),
            }
        )
        return {"investigation_id": investigation_id, "status": "FAILED"}

    engine = event["engine"]
    bucket = engine["result_bucket"]
    key = engine["result_key"]

    object_body = s3.get_object(Bucket=bucket, Key=key)["Body"].read()
    # DynamoDB rejects Python floats. Parsing JSON decimals as Decimal preserves
    # the engine output's numeric values while making the complete nested result
    # safe to persist.
    result = json.loads(object_body, parse_float=Decimal)
    publication = _publish_document(result, event, investigation_id)

    table.put_item(
        Item={
            "investigation_id": investigation_id,
            "status": "SUCCEEDED",
            "repository": event["repository"],
            "owner": event["owner"],
            "ref": event["ref"],
            "created_at": int(time.time()),
            "result_bucket": bucket,
            "result_key": key,
            "patched_repository_key": engine.get("patched_repository_key"),
            "result": result,
            "publication": publication,
        }
    )

    return {"investigation_id": investigation_id, "status": "SUCCEEDED"}
