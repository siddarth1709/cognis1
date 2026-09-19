
from __future__ import annotations

import json
import os
from typing import Protocol


class ModelClient(Protocol):

    def invoke(self, system_prompt: str, messages: list[dict]) -> str:
        ...


class BedrockModelClient:

    def __init__(self, model_id: str | None = None, region: str | None = None):
        import boto3  

        self.model_id = model_id or os.environ.get(
            "COGNIS_MODEL_ID", "anthropic.claude-3-5-sonnet-20241022-v2:0"
        )
        self.client = boto3.client(
            "bedrock-runtime", region_name=region or os.environ.get("AWS_REGION", "us-east-1")
        )

    def invoke(self, system_prompt: str, messages: list[dict]) -> str:
        
        body = {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 1024,
            "system": system_prompt,
            "messages": messages,
        }
        response = self.client.invoke_model(
            modelId=self.model_id,
            body=json.dumps(body),
            contentType="application/json",
            accept="application/json",
        )
        payload = json.loads(response["body"].read())

        return "".join(
            block.get("text", "") for block in payload.get("content", []) if block.get("type") == "text"
        )


class FakeModelClient:
    def __init__(self, scripted_responses: list[str]):
        self._responses = list(scripted_responses)
        self.calls: list[tuple[str, list[dict]]] = []

    def invoke(self, system_prompt: str, messages: list[dict]) -> str:
        self.calls.append((system_prompt, messages))
        if not self._responses:
            raise AssertionError("FakeModelClient ran out of scripted responses")
        return self._responses.pop(0)
