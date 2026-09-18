from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional

@dataclass
class Provenance:
    file: str
    line_start: Optional[int] = None
    line_end: Optional[int] = None
    symbol: Optional[str] = None
    commit: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "file": self.file,
            "line_start": self.line_start,
            "line_end": self.line_end,
            "symbol": self.symbol,
            "commit": self.commit,
        }

@dataclass
class Evidence:
    envidence_id: str
    repo_id: str
    type: str
    source: str
    content: str
    provenance: Provenance
    normalized: Dict[str, Any] = field(default_factory = dict)
    confidence: float = 1.0
    supports: List[str] = field(default_factory = list)
    contradicts: List[str] = field(default_factory = list)
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "envidence_id": self.envidence_id,
            "repo_id": self.repo_id,
            "type": self.type,
            "source": self.source,
            "content": self.content,
            "provenance": self.provenance.to_dict(),
            "normalized": self.normalized,
            "confidence": self.confidence,
            "supports": self.supports,
            "contradicts": self.contradicts,
            "metadata": self.metadata,
        }

@dataclass
class BehavioralFact:
    fact_id: str
    subject: str
    predicate: str
    value: Any
    envidence_id: str
    evidence_type: str
    confidence: float = 1.0
    provenance: Optional[Provenance] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "fact_id": self.fact_id,
            "subject": self.subject,
            "predicate": self.predicate,
            "value": self.value,
            "evidence_id": self.evidence_id,
            "evidence_type": self.evidence_type,
            "confidence": self.confidence,
            "provenance": (
                self.provenance.to_dict()
                if self.provenance
                else None
            ),
        }
