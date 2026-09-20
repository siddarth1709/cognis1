from __future__ import annotations

import json
from pathlib import Path

import yaml


class CloudFormationLoader(yaml.SafeLoader):
    pass


def _cf_constructor(loader, node):
    if isinstance(node, yaml.ScalarNode):
        return loader.construct_scalar(node)
    if isinstance(node, yaml.SequenceNode):
        return loader.construct_sequence(node)
    return loader.construct_mapping(node)


for _tag in ("!Ref", "!Sub", "!GetAtt", "!Join", "!If", "!Select"):
    CloudFormationLoader.add_constructor(_tag, _cf_constructor)

ROOT = Path(__file__).resolve().parents[1]


def test_required_files_exist():
    required = [
        "template.yaml",
        "statemachine/pipeline.asl.json",
        "schemas/investigation-request.schema.json",
        "functions/ingress/app.py",
        "functions/observe/app.py",
        "functions/engine/app.py",
        "functions/persist/app.py",
        "functions/status/app.py",
        "functions/engine/Dockerfile",
    ]
    for relative in required:
        assert (ROOT / relative).is_file(), relative


def test_template_has_resources_and_core_services():
    template = yaml.load((ROOT / "template.yaml").read_text(), Loader=CloudFormationLoader)
    resources = template["Resources"]

    assert resources
    types = {resource["Type"] for resource in resources.values()}
    assert "AWS::Serverless::Function" in types
    assert "AWS::Serverless::StateMachine" in types
    assert "AWS::DynamoDB::Table" in types
    assert "AWS::S3::Bucket" in types


def test_state_machine_is_valid_json():
    definition = json.loads((ROOT / "statemachine/pipeline.asl.json").read_text())
    assert definition["StartAt"] == "Observe"
    assert set(["Observe", "Engine", "Persist", "Succeeded", "Failed"]).issubset(
        definition["States"]
    )
