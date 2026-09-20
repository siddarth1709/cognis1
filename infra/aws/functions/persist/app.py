from __future__ import annotations

import json
import os
import time
from decimal import Decimal

import boto3

s3 = boto3.client("s3")
dynamodb = boto3.resource("dynamodb")
TABLE_NAME = os.environ["INVESTIGATIONS_TABLE"]


def _failure_message(error: object) -> str:
    if isinstance(error, str):
        return error[:1000]
    return json.dumps(error, default=str)[:1000]


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
        }
    )

    return {"investigation_id": investigation_id, "status": "SUCCEEDED"}
