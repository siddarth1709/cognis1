from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

from contracts.resolver import STATUS_CONTRADICTION, ResolvedContract


@dataclass
class HealPlan:
    contract_id: str
    target_file: str
    find_text: str
    replace_text: str
    rationale: str
    confidence: float


def plan_doc_repair(resolved: ResolvedContract) -> Optional[HealPlan]:
    if resolved.status != STATUS_CONTRADICTION:
        return None
    if not resolved.contract.doc_evidence or not resolved.contract.code_evidence:
        return None

    doc_ev = resolved.contract.doc_evidence[0]
    code_ev = resolved.contract.code_evidence[0]

    return HealPlan(
        contract_id=resolved.contract.contract_id,
        target_file=doc_ev.provenance.file or "",
        find_text=str(doc_ev.value),
        replace_text=str(code_ev.value),
        rationale=(
            f"Code evidence ({code_ev.provenance.file}, confidence {code_ev.confidence}) "
            f"shows {code_ev.value!r}; documentation ({doc_ev.provenance.file}) claims "
            f"{doc_ev.value!r}."
        ),
        confidence=min(doc_ev.confidence, code_ev.confidence),
    )