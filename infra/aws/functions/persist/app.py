from __future__ import annotations

import json
import os
import time

import boto3

s3 = boto3.client("s3")
dynamodb = boto3.resource("dynamodb")
TABLE_NAME = os.environ["INVESTIGATIONS_TABLE"]


def handler(event, context):
    investigation_id = event["investigation_id"]
    engine = event["engine"]
    bucket = engine["result_bucket"]
    key = engine["result_key"]

    object_body = s3.get_object(Bucket=bucket, Key=key)["Body"].read()
    result = json.loads(object_body)

    table = dynamodb.Table(TABLE_NAME)
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
