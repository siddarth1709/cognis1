from __future__ import annotations

from dataclasses import dataclass
from typing import Callable, List


@dataclass
class QASnapshot:
    question: str
    expected_substring: str


@dataclass
class QAResult:
    question: str
    expected_substring: str
    actual_answer: str
    passed: bool


def run_regression_suite(
    snapshots: List[QASnapshot],
    answer_fn: Callable[[str], str],
) -> List[QAResult]:
    results = []
    for snap in snapshots:
        answer = answer_fn(snap.question)
        results.append(QAResult(
            question=snap.question,
            expected_substring=snap.expected_substring,
            actual_answer=answer,
            passed=snap.expected_substring.lower() in answer.lower(),
        ))
    return results


def regressions(results: List[QAResult]) -> List[QAResult]:
    return [r for r in results if not r.passed]