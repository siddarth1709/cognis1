from __future__ import annotations

import json


def handler(event: dict, context) -> dict:
    try:
        body = json.loads(event.get("body") or "{}")
    except json.JSONDecodeError:
        return _response(400, {"error": "invalid JSON body"})

    github_event = (event.get("headers") or {}).get("x-github-event", "unknown")
    repo = (body.get("repository") or {}).get("full_name", "unknown-repo")

    # Full pipeline, once a checked-out copy of the repo is available at /tmp:
    #
    #   from evidence.pipeline import EvidencePipeline
    #   from contracts.extractor import extract_contracts
    #   from contracts.resolver import resolve_all, contradictions
    #   from agent import CognisAgentLoop, BedrockModelClient, default_registry
    #   from agent.tools import SubprocessSandboxRunner
    #
    #   result = EvidencePipeline().analyze(root="/tmp/repo", repository=repo)
    #   resolved = resolve_all(extract_contracts(result.graph))
    #   for r in contradictions(resolved):
    #       registry = default_registry(
    #           graph=result.graph,
    #           sandbox_runner=SubprocessSandboxRunner(runtimes={"python": ["python3"]}),
    #       )
    #       loop = CognisAgentLoop(BedrockModelClient(), registry)
    #       investigation = loop.run({"contract_id": r.contract.contract_id,
    #                                  "subject": r.contract.subject,
    #                                  "predicate": r.contract.predicate,
    #                                  "reason": r.reason})
    #       # -> Decide stage routes investigation.verdict to auto-heal or escalate

    return _response(200, {
        "received": True,
        "github_event": github_event,
        "repo": repo,
    })


def _response(status_code: int, payload: dict) -> dict:
    return {
        "statusCode": status_code,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps(payload),
    }