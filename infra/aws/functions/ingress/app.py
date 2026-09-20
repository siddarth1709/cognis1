from __future__ import annotations

import base64
import json
import os
import uuid

import boto3


sfn = boto3.client("stepfunctions")
STATE_MACHINE_ARN = os.environ["STATE_MACHINE_ARN"]


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


def _validate(payload: dict) -> None:
    for field in ("owner", "repository", "ref"):
        if not isinstance(payload.get(field), str) or not payload[field].strip():
            raise ValueError(f"'{field}' is required")

    threshold = payload.get("autonomy_threshold")
    if threshold is not None:
        threshold = float(threshold)
        if not 0 <= threshold <= 1:
            raise ValueError("autonomy_threshold must be between 0 and 1")


def handler(event, context):
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
    }

    execution = sfn.start_execution(
        stateMachineArn=STATE_MACHINE_ARN,
        name=investigation_id,
        input=json.dumps(input_payload),
    )

    return _response(
        202,
        {
            "investigation_id": investigation_id,
            "execution_arn": execution["executionArn"],
            "status": "RUNNING",
        },
    )
