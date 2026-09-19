from __future__ import annotations

from dataclasses import dataclass
from typing import List

from .extractor import Contract, RetryContract

STATUS_CONSISTENT = "consistent"
STATUS_CONTRADICTION = "contradiction"
STATUS_DOC_ONLY = "doc_only"
STATUS_CODE_ONLY = "code_only"
STATUS_UNRESOLVED = "unresolved"


@dataclass
class ResolvedContract:
    contract: Contract
    status: str
    reason: str


def resolve(contract: Contract) -> ResolvedContract:
    if contract.has_doc_side and not contract.has_code_side:
        return ResolvedContract(
            contract, STATUS_DOC_ONLY,
            "Documentation makes a claim with no matching code-side evidence found.",
        )
    if contract.has_code_side and not contract.has_doc_side:
        return ResolvedContract(
            contract, STATUS_CODE_ONLY,
            "Code-side evidence exists with no matching documentation.",
        )
    if not contract.has_doc_side and not contract.has_code_side:
        return ResolvedContract(contract, STATUS_UNRESOLVED, "No evidence on either side.")

    doc_values = {str(e.value) for e in contract.doc_evidence}
    code_values = {str(e.value) for e in contract.code_evidence}
    if doc_values == code_values:
        return ResolvedContract(contract, STATUS_CONSISTENT, "Doc and code evidence agree.")
    return ResolvedContract(
        contract, STATUS_CONTRADICTION,
        f"Doc evidence {sorted(doc_values)} disagrees with code evidence {sorted(code_values)}.",
    )


def resolve_all(contracts: List[Contract]) -> List[ResolvedContract]:
    return [resolve(c) for c in contracts]


def contradictions(resolved: List[ResolvedContract]) -> List[ResolvedContract]:
    return [r for r in resolved if r.status == STATUS_CONTRADICTION]


@dataclass
class ResolvedRetryContract:
    contract: RetryContract
    status: str
    reason: str


def resolve_retry_contract(rc: RetryContract) -> ResolvedRetryContract:
    if rc.doc_value == rc.code_value:
        return ResolvedRetryContract(rc, STATUS_CONSISTENT, "Doc and code agree on retry count.")
    return ResolvedRetryContract(
        rc, STATUS_CONTRADICTION,
        f"{rc.doc_file} claims {rc.doc_value} retries; {rc.code_file} implements {rc.code_value}.",
    )