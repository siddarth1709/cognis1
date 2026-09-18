from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional


@dataclass(frozen=True)
class Provenance:
    repository: Optional[str] = None
    commit: Optional[str] = None
    file: Optional[str] = None
    start_line: Optional[int] = None
    end_line: Optional[int] = None
    source_type: Optional[str] = None
    extractor: Optional[str] = None
    confidence: float = 1.0
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "repository": self.repository,
            "commit": self.commit,
            "file": self.file,
            "start_line": self.start_line,
            "end_line": self.end_line,
            "source_type": self.source_type,
            "extractor": self.extractor,
            "confidence": self.confidence,
            "metadata": self.metadata,
        }


@dataclass
class Evidence:
    id: str
    kind: str
    subject: str
    predicate: str
    value: Any
    provenance: Provenance
    confidence: float = 1.0
    tags: List[str] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "kind": self.kind,
            "subject": self.subject,
            "predicate": self.predicate,
            "value": self.value,
            "provenance": self.provenance.to_dict(),
            "confidence": self.confidence,
            "tags": self.tags,
            "metadata": self.metadata,
        }


@dataclass
class BehavioralFact:
    subject: str
    predicate: str
    value: Any
    evidence_ids: List[str] = field(default_factory=list)
    confidence: float = 1.0
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "subject": self.subject,
            "predicate": self.predicate,
            "value": self.value,
            "evidence_ids": self.evidence_ids,
            "confidence": self.confidence,
            "metadata": self.metadata,
        }