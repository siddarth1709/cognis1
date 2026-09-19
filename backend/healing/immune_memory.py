from __future__ import annotations

from dataclasses import dataclass
from typing import Any, List

from evidence.graph import EvidenceGraph

from .transaction import HealTransaction


@dataclass
class RegressionCheck:
    check_id: str
    contract_id: str
    subject: str
    predicate: str
    expected_value: Any


@dataclass
class CheckResult:
    check: RegressionCheck
    passed: bool
    actual_value: Any


def generate_check(tx: HealTransaction, subject: str, predicate: str) -> RegressionCheck:
    return RegressionCheck(
        check_id=f"immune:{tx.transaction_id}",
        contract_id=tx.contract_id,
        subject=subject,
        predicate=predicate,
        expected_value=tx.plan.replace_text,
    )


def run_checks(checks: List[RegressionCheck], graph: EvidenceGraph) -> List[CheckResult]:
    results: List[CheckResult] = []
    for check in checks:
        matches = [
            e for e in graph.by_subject(check.subject)
            if e.predicate == check.predicate
        ]
        actual = str(matches[0].value) if matches else None
        results.append(CheckResult(
            check=check,
            passed=(actual == str(check.expected_value)),
            actual_value=actual,
        ))
    return results