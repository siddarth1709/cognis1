from __future__ import annotations

import difflib
from dataclasses import dataclass
from pathlib import Path
from typing import Optional

from .planner import HealPlan


@dataclass
class PatchResult:
    applied: bool
    target_file: str
    diff: Optional[str] = None
    error: Optional[str] = None


def apply_patch(repo_root: Path, plan: HealPlan) -> PatchResult:
    path = repo_root / plan.target_file

    try:
        original = path.read_text(encoding="utf-8")
    except OSError as e:
        return PatchResult(applied=False, target_file=plan.target_file, error=str(e))

    if plan.find_text not in original:
        return PatchResult(
            applied=False, target_file=plan.target_file,
            error=f"find_text {plan.find_text!r} not found in {plan.target_file}",
        )

    updated = original.replace(plan.find_text, plan.replace_text, 1)

    diff = "".join(difflib.unified_diff(
        original.splitlines(keepends=True),
        updated.splitlines(keepends=True),
        fromfile=f"a/{plan.target_file}",
        tofile=f"b/{plan.target_file}",
    ))

    path.write_text(updated, encoding="utf-8")

    return PatchResult(applied=True, target_file=plan.target_file, diff=diff)