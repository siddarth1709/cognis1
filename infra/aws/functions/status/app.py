from __future__ import annotations

import json
import os
from decimal import Decimal

import boto3
from boto3.dynamodb.conditions import Key


dynamodb = boto3.resource("dynamodb")
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


def handler(event, context):
    investigation_id = (
        event.get("pathParameters", {}) or {}
    ).get("investigation_id")

    if not investigation_id:
        return _response(400, {"error": "investigation_id is required"})

    result = table.get_item(Key={"investigation_id": investigation_id})
    item = result.get("Item")

    if item is None:
        return _response(404, {"error": "Investigation not found"})

    return _response(200, item)
