from __future__ import annotations

import re
from dataclasses import dataclass
from typing import List, Optional

from agent.tools import SandboxRunner

_FENCE_PATTERN = re.compile(r"```(?P<lang>\w*)\n(?P<code>.*?)```", re.DOTALL)


@dataclass
class ExampleResult:
    file: str
    index: int
    language: str
    ran: bool
    stdout: str
    stderr: str
    error: Optional[str] = None


def extract_examples(doc_text: str, file: str) -> List[dict]:
    examples = []
    for i, m in enumerate(_FENCE_PATTERN.finditer(doc_text)):
        examples.append({
            "file": file,
            "index": i,
            "language": (m.group("lang") or "text").strip().lower(),
            "code": m.group("code"),
        })
    return examples


def run_example(example: dict, runner: Optional[SandboxRunner], timeout_seconds: int = 10) -> ExampleResult:
    if runner is None:
        return ExampleResult(
            file=example["file"], index=example["index"], language=example["language"],
            ran=False, stdout="", stderr="", error="No sandbox runtime provider is configured.",
        )

    result = runner.run(code=example["code"], language=example["language"], timeout_seconds=timeout_seconds)

    return ExampleResult(
        file=example["file"], index=example["index"], language=example["language"],
        ran=result.get("ran", False),
        stdout=result.get("stdout", ""),
        stderr=result.get("stderr", ""),
        error=result.get("error"),
    )


def check_doc_examples(doc_text: str, file: str, runner: Optional[SandboxRunner]) -> List[ExampleResult]:
    return [run_example(ex, runner) for ex in extract_examples(doc_text, file)]