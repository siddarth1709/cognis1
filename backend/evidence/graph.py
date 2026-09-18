from __future__ import annotations

from collections import defaultdict
from typing import Dict, Iterable, List, Set

from .models import BehavioralFact, Evidence


class EvidenceGraph:
    def __init__(self) -> None:
        self.evidence: Dict[str, Evidence] = {}
        self.edges: Dict[str, Set[str]] = defaultdict(set)

    def add(self, evidence: Evidence) -> None:
        self.evidence[evidence.id] = evidence

        subject_key = f"subject:{evidence.subject}"
        predicate_key = f"predicate:{evidence.predicate}"

        self.edges[subject_key].add(evidence.id)
        self.edges[predicate_key].add(evidence.id)

    def add_many(self, evidence: Iterable[Evidence]) -> None:
        for item in evidence:
            self.add(item)

    def get(self, evidence_id: str) -> Evidence | None:
        return self.evidence.get(evidence_id)

    def by_subject(self, subject: str) -> List[Evidence]:
        return [
            item
            for item in self.evidence.values()
            if item.subject == subject
        ]

    def by_predicate(self, predicate: str) -> List[Evidence]:
        return [
            item
            for item in self.evidence.values()
            if item.predicate == predicate
        ]

    def facts(self) -> List[BehavioralFact]:
        grouped: Dict[tuple, List[Evidence]] = defaultdict(list)

        for item in self.evidence.values():
            grouped[
                (
                    item.subject,
                    item.predicate,
                    str(item.value),
                )
            ].append(item)

        result: List[BehavioralFact] = []

        for (subject, predicate, _), items in grouped.items():
            confidence = max(
                item.confidence
                for item in items
            )

            result.append(
                BehavioralFact(
                    subject=subject,
                    predicate=predicate,
                    value=items[0].value,
                    evidence_ids=[
                        item.id
                        for item in items
                    ],
                    confidence=confidence,
                )
            )

        return result

    def to_dict(self) -> dict:
        return {
            "evidence": [
                item.to_dict()
                for item in self.evidence.values()
            ],
            "facts": [
                fact.to_dict()
                for fact in self.facts()
            ],
        }