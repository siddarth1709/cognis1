from __future__ import annotations

import time
import uuid
from dataclasses import dataclass, field
from typing import Any, Dict, Optional

from .patcher import PatchResult
from .planner import HealPlan

STATUS_PENDING_VERIFICATION = "pending_verification"
STATUS_VERIFIED = "verified"
STATUS_PATCHED = "patched"
STATUS_REJECTED = "rejected"


@dataclass
class HealTransaction:
    transaction_id: str
    contract_id: str
    plan: HealPlan
    status: str
    created_at: float
    verified: Optional[bool] = None
    verification_detail: Dict[str, Any] = field(default_factory=dict)
    patch_result: Optional[PatchResult] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "transaction_id": self.transaction_id,
            "contract_id": self.contract_id,
            "plan": {
                "target_file": self.plan.target_file,
                "find_text": self.plan.find_text,
                "replace_text": self.plan.replace_text,
                "rationale": self.plan.rationale,
                "confidence": self.plan.confidence,
                "operation": self.plan.operation,
            },
            "status": self.status,
            "created_at": self.created_at,
            "verified": self.verified,
            "verification_detail": self.verification_detail,
            "patch_result": (
                {
                    "applied": self.patch_result.applied,
                    "target_file": self.patch_result.target_file,
                    "diff": self.patch_result.diff,
                    "error": self.patch_result.error,
                }
                if self.patch_result is not None else None
            ),
        }


def open_transaction(plan: HealPlan) -> HealTransaction:
    return HealTransaction(
        transaction_id=str(uuid.uuid4()),
        contract_id=plan.contract_id,
        plan=plan,
        status=STATUS_PENDING_VERIFICATION,
        created_at=time.time(),
    )


def mark_verified(tx: HealTransaction, verified: bool, detail: Dict[str, Any]) -> HealTransaction:
    tx.verified = verified
    tx.verification_detail = detail
    tx.status = STATUS_VERIFIED if verified else STATUS_REJECTED
    return tx


def mark_patched(tx: HealTransaction, patch_result: PatchResult) -> HealTransaction:
    tx.patch_result = patch_result
    if patch_result.applied:
        tx.status = STATUS_PATCHED
    return tx
