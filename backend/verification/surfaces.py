from __future__ import annotations

from dataclasses import dataclass
from typing import List

from contracts.resolver import (
    STATUS_CONSISTENT,
    STATUS_CONTRADICTION,
    ResolvedContract,
)


@dataclass
class ConsistencyBadge:
    total_contracts: int
    consistent: int
    contradictions: int
    consistency_percent: float


def compute_badge(resolved: List[ResolvedContract]) -> ConsistencyBadge:
    scored = [r for r in resolved if r.status in (STATUS_CONSISTENT, STATUS_CONTRADICTION)]
    consistent = sum(1 for r in scored if r.status == STATUS_CONSISTENT)
    contradictions = sum(1 for r in scored if r.status == STATUS_CONTRADICTION)
    total = len(scored)

    percent = 100.0 if total == 0 else round(100.0 * consistent / total, 1)

    return ConsistencyBadge(
        total_contracts=total,
        consistent=consistent,
        contradictions=contradictions,
        consistency_percent=percent,
    )