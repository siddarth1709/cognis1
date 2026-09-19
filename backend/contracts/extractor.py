from __future__ import annotations

import re
from collections import defaultdict
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple

from evidence.graph import EvidenceGraph
from evidence.models import Evidence

DOC_SOURCE_TYPES = {"documentation"}
CODE_SOURCE_TYPES = {"source", "test", "schema", "ci", "dependency"}


@dataclass
class Contract:
    contract_id: str
    subject: str
    predicate: str
    doc_evidence: List[Evidence] = field(default_factory=list)
    code_evidence: List[Evidence] = field(default_factory=list)

    @property
    def has_doc_side(self) -> bool:
        return len(self.doc_evidence) > 0

    @property
    def has_code_side(self) -> bool:
        return len(self.code_evidence) > 0


def stable_contract_id(subject: str, predicate: str) -> str:
    return f"contract:{subject}:{predicate}"


def extract_contracts(graph: EvidenceGraph) -> List[Contract]:
    grouped: Dict[Tuple[str, str], Dict[str, List[Evidence]]] = defaultdict(
        lambda: {"doc": [], "code": []}
    )

    for item in graph.evidence.values():
        source_type = item.provenance.source_type or ""
        if source_type in DOC_SOURCE_TYPES:
            bucket = "doc"
        elif source_type in CODE_SOURCE_TYPES:
            bucket = "code"
        else:
            continue
        grouped[(item.subject, item.predicate)][bucket].append(item)

    contracts: List[Contract] = []
    for (subject, predicate), sides in grouped.items():
        contracts.append(Contract(
            contract_id=stable_contract_id(subject, predicate),
            subject=subject,
            predicate=predicate,
            doc_evidence=sides["doc"],
            code_evidence=sides["code"],
        ))
    return contracts


@dataclass
class RetryContract:
    contract_id: str
    doc_file: str
    doc_value: int
    code_file: str
    code_value: int


_RETRY_PATTERN = re.compile(r"retr(?:y|ies)\D{0,20}?(\d+)\s*times?", re.IGNORECASE)


def _find_retry_claim(text: str) -> Optional[int]:
    match = _RETRY_PATTERN.search(text)
    return int(match.group(1)) if match else None


def extract_retry_contracts(
    doc_texts: Dict[str, str],
    source_texts: Dict[str, str],
) -> List[RetryContract]:
    doc_claims = {path: value for path, text in doc_texts.items()
                  if (value := _find_retry_claim(text)) is not None}
    code_claims = {path: value for path, text in source_texts.items()
                   if (value := _find_retry_claim(text)) is not None}

    contracts: List[RetryContract] = []
    for doc_path, doc_value in doc_claims.items():
        for code_path, code_value in code_claims.items():
            contracts.append(RetryContract(
                contract_id=f"contract:retry:{doc_path}:{code_path}",
                doc_file=doc_path,
                doc_value=doc_value,
                code_file=code_path,
                code_value=code_value,
            ))
    return contracts
