from __future__ import annotations

import json
import time
import uuid
from dataclasses import dataclass, field
from typing import Any

from .bedrock_client import ModelClient
from .tools import ToolRegistry
SYSTEM_PROMPT_TEMPLATE = """You are the Cognis Agent, investigating a possible behavioral contract \
drift between code and documentation.

You have these tools available:
{tool_catalog}

On every turn, respond with a single JSON object and nothing else, in one of two shapes:

To call a tool:
{{"action": "call_tool", "tool": "<tool name>", "args": {{...}}, "thought": "<why you're calling this>"}}

To finish the investigation:
{{"action": "decide", "verdict": "confirmed_drift" | "no_drift" | "unresolved", \
"confidence": <0-1 float>, "summary": "<see below>"}}

The summary is read by a person deciding whether to trust an automated repair, and by future
investigations replaying this one — it is the one place your reasoning becomes visible, so make
it earn that attention. A single clause like "doc says 3, code says 5" is not enough. Cover, in
a few connected sentences rather than a fragment:
  - What the evidence actually shows, citing the specific files/values you gathered via tools —
    not a restatement of the contradiction you were handed.
  - Why the discrepancy matters in practice: what breaks, for whom, if it goes uncorrected —
    a downstream caller relying on the stale claim, an AI coding agent generating code against
    the wrong assumption, a user hitting the gap directly.
  - What in the evidence made you confident (or not) that code, rather than documentation, is
    the side to trust here — confidence should track the strength of what you actually found,
    not a default number.
Write it as an explanation a colleague could act on without re-doing the investigation themselves,
not as a caption for the diff.

Always respond with valid JSON only. No prose outside the JSON object.
"""


@dataclass
class TraceStep:
    step_index: int
    timestamp: float
    kind: str  
    detail: dict


@dataclass
class InvestigationResult:
    investigation_id: str
    verdict: str | None
    confidence: float | None
    summary: str | None
    trace: list[TraceStep] = field(default_factory=list)
    stopped_reason: str = "decided" 

class AgentLoopError(Exception):
    pass


class CognisAgentLoop:
    def __init__(
        self,
        model_client: ModelClient,
        tool_registry: ToolRegistry,
        max_iterations: int = 8,
        trace_sink=None,  
    ):
        self.model_client = model_client
        self.tool_registry = tool_registry
        self.max_iterations = max_iterations
        self.trace_sink = trace_sink

    def _system_prompt(self) -> str:
        catalog = self.tool_registry.catalog()
        catalog_text = "\n".join(
            f"- {t['name']}({t['parameters']}): {t['description']}" for t in catalog
        )
        return SYSTEM_PROMPT_TEMPLATE.format(tool_catalog=catalog_text)

    def _record(self, trace: list[TraceStep], kind: str, detail: dict) -> None:
        step = TraceStep(step_index=len(trace), timestamp=time.time(), kind=kind, detail=detail)
        trace.append(step)
        if self.trace_sink is not None:
            self.trace_sink(step)

    def _parse_model_output(self, raw: str) -> dict:
        raw = raw.strip()
        if raw.startswith("```"):
            raw = raw.strip("`")
            if raw.startswith("json"):
                raw = raw[4:]
            raw = raw.strip()
        try:
            return json.loads(raw)
        except json.JSONDecodeError as e:
            raise AgentLoopError(f"Model output was not valid JSON: {e}\nRaw output: {raw!r}")

    def run(self, contradiction_context: dict) -> InvestigationResult:
        investigation_id = str(uuid.uuid4())
        trace: list[TraceStep] = []
        system_prompt = self._system_prompt()
        messages: list[dict] = [
            {"role": "user", "content": f"Investigate this contradiction:\n{json.dumps(contradiction_context, indent=2)}"}
        ]

        for iteration in range(self.max_iterations):
            raw_output = self.model_client.invoke(system_prompt, messages)
            self._record(trace, "model_call", {"iteration": iteration, "raw_output": raw_output})

            try:
                parsed = self._parse_model_output(raw_output)
            except AgentLoopError as e:
                self._record(trace, "error", {"iteration": iteration, "error": str(e)})
                return InvestigationResult(
                    investigation_id=investigation_id,
                    verdict=None, confidence=None, summary=None,
                    trace=trace, stopped_reason="error",
                )

            action = parsed.get("action")

            if action == "decide":
                self._record(trace, "decision", parsed)
                return InvestigationResult(
                    investigation_id=investigation_id,
                    verdict=parsed.get("verdict"),
                    confidence=parsed.get("confidence"),
                    summary=parsed.get("summary"),
                    trace=trace,
                    stopped_reason="decided",
                )

            if action == "call_tool":
                tool_name = parsed.get("tool")
                args = parsed.get("args", {})
                try:
                    result = self.tool_registry.call(tool_name, args)
                    error = None
                except Exception as e:  
                    result = None
                    error = str(e)

                self._record(trace, "tool_call", {
                    "iteration": iteration, "tool": tool_name, "args": args,
                    "result": result, "error": error, "thought": parsed.get("thought"),
                })

                messages.append({"role": "assistant", "content": raw_output})
                tool_feedback = {"tool": tool_name, "result": result, "error": error}
                messages.append({"role": "user", "content": f"Tool result:\n{json.dumps(tool_feedback, indent=2)}"})
                continue

            self._record(trace, "error", {"iteration": iteration, "error": f"Unknown action: {action!r}"})
            messages.append({"role": "assistant", "content": raw_output})
            messages.append({"role": "user", "content": 'Invalid action. Respond with a "call_tool" or "decide" JSON object only.'})

        return InvestigationResult(
            investigation_id=investigation_id,
            verdict=None, confidence=None, summary=None,
            trace=trace, stopped_reason="max_iterations",
        )
