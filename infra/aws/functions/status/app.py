from __future__ import annotations

import json
import hmac
import os
from decimal import Decimal

import boto3
from boto3.dynamodb.conditions import Key


dynamodb = boto3.resource("dynamodb")
s3 = boto3.client("s3")
table = dynamodb.Table(os.environ["INVESTIGATIONS_TABLE"])


def _json_default(value):
    if isinstance(value, Decimal):
        return float(value) if value % 1 else int(value)
    raise TypeError(f"Not JSON serializable: {type(value)!r}")


def _response(status_code: int, body: dict) -> dict:
    return {
        "statusCode": status_code,
        "headers": {"content-type": "application/json"},
        "body": json.dumps(body, default=_json_default),
    }


def _authorized(event: dict) -> bool:
    headers = event.get("headers") or {}
    supplied = next((str(value) for key, value in headers.items() if str(key).lower() == "x-cognis-api-key"), "")
    expected = os.environ.get("COGNIS_API_KEY", "")
    return bool(expected) and hmac.compare_digest(supplied, expected)


def handler(event, context):
    if not _authorized(event):
        return _response(401, {"error": "Unauthorized"})

    investigation_id = (
        event.get("pathParameters", {}) or {}
    ).get("investigation_id")

    if not investigation_id:
        return _response(400, {"error": "investigation_id is required"})

    result = table.get_item(Key={"investigation_id": investigation_id})
    item = result.get("Item")

    if item is None:
        return _response(404, {"error": "Investigation not found"})

    query = event.get("queryStringParameters") or {}
    if query.get("artifact") == "patched":
        bucket = item.get("result_bucket")
        key = item.get("patched_repository_key")
        if not bucket or not key:
            return _response(404, {"error": "Patched artifact is not available"})
        url = s3.generate_presigned_url(
            "get_object",
            Params={"Bucket": bucket, "Key": key},
            ExpiresIn=300,
        )
        return _response(200, {"url": url, "expires_in": 300})

    if query.get("document") == "live":
        publication = item.get("publication")
        if not publication:
            return _response(404, {"error": "No verified live document has been published for this investigation"})
        return _response(200, {"publication": publication})

    return _response(200, item)
