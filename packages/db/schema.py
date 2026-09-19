from __future__ import annotations

import os


def get_dynamodb_resource(endpoint_url: str | None = None, region: str | None = None):
    import boto3

    kwargs = {"region_name": region or os.environ.get("AWS_REGION", "us-east-1")}
    endpoint = endpoint_url or os.environ.get("COGNIS_DYNAMODB_ENDPOINT")
    if endpoint:
        kwargs["endpoint_url"] = endpoint
    return boto3.resource("dynamodb", **kwargs)


TABLE_DEFS = [
    {
        "TableName": "cognis-contracts",
        "KeySchema": [{"AttributeName": "contract_id", "KeyType": "HASH"}],
        "AttributeDefinitions": [{"AttributeName": "contract_id", "AttributeType": "S"}],
        "BillingMode": "PROVISIONED",
        "ProvisionedThroughput": {"ReadCapacityUnits": 5, "WriteCapacityUnits": 5},
    },
    {
        "TableName": "cognis-evidence",
        "KeySchema": [
            {"AttributeName": "contract_id", "KeyType": "HASH"},
            {"AttributeName": "evidence_id", "KeyType": "RANGE"},
        ],
        "AttributeDefinitions": [
            {"AttributeName": "contract_id", "AttributeType": "S"},
            {"AttributeName": "evidence_id", "AttributeType": "S"},
        ],
        "BillingMode": "PROVISIONED",
        "ProvisionedThroughput": {"ReadCapacityUnits": 5, "WriteCapacityUnits": 5},
    },
    {
        "TableName": "cognis-investigation-trace",
        "KeySchema": [
            {"AttributeName": "investigation_id", "KeyType": "HASH"},
            {"AttributeName": "step_index", "KeyType": "RANGE"},
        ],
        "AttributeDefinitions": [
            {"AttributeName": "investigation_id", "AttributeType": "S"},
            {"AttributeName": "step_index", "AttributeType": "N"},
        ],
        "BillingMode": "PROVISIONED",
        "ProvisionedThroughput": {"ReadCapacityUnits": 5, "WriteCapacityUnits": 5},
    },
    {
        "TableName": "cognis-autonomy-config",
        "KeySchema": [{"AttributeName": "repo_id", "KeyType": "HASH"}],
        "AttributeDefinitions": [{"AttributeName": "repo_id", "AttributeType": "S"}],
        "BillingMode": "PROVISIONED",
        "ProvisionedThroughput": {"ReadCapacityUnits": 5, "WriteCapacityUnits": 5},
    },
]


def create_tables(dynamodb_resource, tables: list[dict] = TABLE_DEFS) -> list[str]:
    existing = {t.name for t in dynamodb_resource.tables.all()}
    created = []
    for table_def in tables:
        if table_def["TableName"] in existing:
            continue
        dynamodb_resource.create_table(**table_def)
        created.append(table_def["TableName"])
    return created


def make_trace_sink(dynamodb_resource, investigation_id: str):
    table = dynamodb_resource.Table("cognis-investigation-trace")

    def sink(step) -> None:
        table.put_item(Item={
            "investigation_id": investigation_id,
            "step_index": step.step_index,
            "timestamp": step.timestamp,
            "kind": step.kind,
            "detail": step.detail,
        })

    return sink


def load_trace(dynamodb_resource, investigation_id: str) -> list[dict]:
    table = dynamodb_resource.Table("cognis-investigation-trace")
    resp = table.query(
        KeyConditionExpression="investigation_id = :iid",
        ExpressionAttributeValues={":iid": investigation_id},
        ScanIndexForward=True,
    )
    return resp.get("Items", [])