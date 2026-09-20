from __future__ import annotations

import base64
import hmac
import json
import os
import time
import uuid

import boto3


sfn = boto3.client("stepfunctions")
dynamodb = boto3.resource("dynamodb")
STATE_MACHINE_ARN = os.environ["STATE_MACHINE_ARN"]
TABLE_NAME = os.environ["INVESTIGATIONS_TABLE"]


def _response(status_code: int, body: dict) -> dict:
    return {
        "statusCode": status_code,
        "headers": {"content-type": "application/json"},
        "body": json.dumps(body),
    }


def _body(event: dict) -> dict:
    raw = event.get("body")
    if raw is None:
        return event if isinstance(event, dict) else {}
    if event.get("isBase64Encoded"):
        raw = base64.b64decode(raw).decode("utf-8")
    if isinstance(raw, dict):
        return raw
    return json.loads(raw)


def _authorized(event: dict) -> bool:
    headers = event.get("headers") or {}
    supplied = next((str(value) for key, value in headers.items() if str(key).lower() == "x-cognis-api-key"), "")
    expected = os.environ.get("COGNIS_API_KEY", "")
    return bool(expected) and hmac.compare_digest(supplied, expected)


def _validate(payload: dict) -> None:
    for field in ("owner", "repository", "ref"):
        if not isinstance(payload.get(field), str) or not payload[field].strip():
            raise ValueError(f"'{field}' is required")

    threshold = payload.get("autonomy_threshold")
    if threshold is not None:
        threshold = float(threshold)
        if not 0 <= threshold <= 1:
            raise ValueError("autonomy_threshold must be between 0 and 1")
    if "force_documentation" in payload and not isinstance(payload["force_documentation"], bool):
        raise ValueError("force_documentation must be a boolean")


def handler(event, context):
    if not _authorized(event):
        return _response(401, {"error": "Unauthorized"})

    try:
        payload = _body(event)
        _validate(payload)
    except (ValueError, TypeError, json.JSONDecodeError) as exc:
        return _response(400, {"error": str(exc)})

    investigation_id = str(uuid.uuid4())
    input_payload = {
        "investigation_id": investigation_id,
        "owner": payload["owner"].strip(),
        "repository": payload["repository"].strip(),
        "ref": payload["ref"].strip(),
        "autonomy_threshold": payload.get(
            "autonomy_threshold",
            float(os.environ.get("DEFAULT_AUTONOMY_THRESHOLD", "0.75")),
        ),
        "force_documentation": payload.get("force_documentation", False),
    }

    execution = sfn.start_execution(
        stateMachineArn=STATE_MACHINE_ARN,
        name=investigation_id,
        input=json.dumps(input_payload),
    )

    dynamodb.Table(TABLE_NAME).put_item(
        Item={
            "investigation_id": investigation_id,
            "status": "RUNNING",
            "repository": input_payload["repository"],
            "owner": input_payload["owner"],
            "ref": input_payload["ref"],
            "created_at": int(time.time()),
        }
    )

    return _response(
        202,
        {
            "investigation_id": investigation_id,
            "execution_arn": execution["executionArn"],
            "status": "RUNNING",
        },
    )
