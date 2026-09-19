import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from agent import CognisAgentLoop, FakeModelClient, default_registry


def test_loop_calls_tool_then_decides():
    """The loop should dispatch a tool call, feed the result back, then stop on a decision."""
    scripted = [
        json.dumps({
            "action": "call_tool",
            "tool": "fetch_evidence",
            "args": {"subject": "RetryPolicy"},
            "thought": "need to see prior evidence before deciding",
        }),
        json.dumps({
            "action": "decide",
            "verdict": "confirmed_drift",
            "confidence": 0.87,
            "summary": "Doc claims 3 retries; code implements 5. Evidence supports contradiction.",
        }),
    ]
    model = FakeModelClient(scripted)
    registry = default_registry()
    loop = CognisAgentLoop(model_client=model, tool_registry=registry, max_iterations=5)

    result = loop.run({"contract_id": "c-123", "claim": "retries 3 times"})

    assert result.stopped_reason == "decided"
    assert result.verdict == "confirmed_drift"
    assert result.confidence == 0.87
    kinds = [step.kind for step in result.trace]
    assert kinds == ["model_call", "tool_call", "model_call", "decision"]
    assert result.trace[1].detail["tool"] == "fetch_evidence"


def test_loop_stops_at_max_iterations_if_model_never_decides():
    scripted = [
        json.dumps({"action": "call_tool", "tool": "fetch_evidence", "args": {"subject": "c-1"}})
        for _ in range(10)
    ]
    model = FakeModelClient(scripted)
    registry = default_registry()
    loop = CognisAgentLoop(model_client=model, tool_registry=registry, max_iterations=3)

    result = loop.run({"contract_id": "c-1"})

    assert result.stopped_reason == "max_iterations"
    assert result.verdict is None


def test_loop_handles_malformed_model_output():
    model = FakeModelClient(["this is not json"])
    registry = default_registry()
    loop = CognisAgentLoop(model_client=model, tool_registry=registry)

    result = loop.run({"contract_id": "c-1"})

    assert result.stopped_reason == "error"
    assert result.trace[-1].kind == "error"


def test_loop_handles_unknown_tool_without_crashing():
    scripted = [
        json.dumps({"action": "call_tool", "tool": "not_a_real_tool", "args": {}}),
        json.dumps({"action": "decide", "verdict": "unresolved", "confidence": 0.1, "summary": "gave up"}),
    ]
    model = FakeModelClient(scripted)
    registry = default_registry()
    loop = CognisAgentLoop(model_client=model, tool_registry=registry)

    result = loop.run({"contract_id": "c-1"})

    assert result.stopped_reason == "decided"
    assert result.trace[1].detail["error"] is not None


if __name__ == "__main__":
    test_loop_calls_tool_then_decides()
    test_loop_stops_at_max_iterations_if_model_never_decides()
    test_loop_handles_malformed_model_output()
    test_loop_handles_unknown_tool_without_crashing()
    print("All tests passed.")