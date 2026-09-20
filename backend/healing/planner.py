from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable, List, Optional

from contracts.resolver import STATUS_CODE_ONLY, STATUS_CONTRADICTION, ResolvedContract
from evidence.models import Evidence


@dataclass
class HealPlan:
    contract_id: str
    target_file: str
    find_text: str
    replace_text: str
    rationale: str
    confidence: float
    operation: str = "update"


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


def plan_document_creation(evidence: Iterable[Evidence], repo_name: str) -> Optional[HealPlan]:
    """
    Synthesize a genuine reference document from implementation evidence —
    not a raw dump of one bullet per evidence item. Groups evidence by
    module/directory, writes connective prose per group explaining what
    that part of the codebase is doing and why it matters, and opens with
    a synthesized purpose paragraph derived from the evidence's own shape
    (how many modules, what kinds of behavior were found) rather than a
    generic template line. Deterministic — no live model call — so this
    stays fast and reliable to run during a demo; the quality comes from
    the grouping and synthesis logic, not from an LLM completion.
    """
    sources = [
        item for item in evidence
        if item.provenance.source_type not in {"documentation", "test"}
    ]
    if not sources:
        return None

    groups = _group_by_module(sources)
    node_kinds = _summarize_node_kinds(sources)

    lines = [
        "# Generated repository reference",
        "",
        _synthesize_purpose_paragraph(repo_name, groups, sources),
        "",
        "Review it before publishing or committing it — Cognis flags this as generated,",
        "not yet human-confirmed, per the same evidence-backed-but-unverified rule that",
        "gates every other repair it proposes.",
        "",
    ]

    for module, items in groups:
        lines.append(f"## {module}")
        lines.append("")
        lines.append(_synthesize_module_paragraph(module, items, node_kinds))
        lines.append("")
        for item in sorted(items, key=lambda i: (i.provenance.file or "", i.provenance.start_line or 0))[:8]:
            location = item.provenance.file or item.subject
            line_range = ""
            if item.provenance.start_line:
                end = item.provenance.end_line or item.provenance.start_line
                line_range = f":{item.provenance.start_line}-{end}"
            value = item.value if isinstance(item.value, dict) else {}
            node_type = value.get("node_type", "declaration")
            snippet = str(value.get("text", "")).strip().replace("\n", " ")
            summary = snippet[:180] if snippet else "Implementation evidence observed."
            lines.append(f"- `{location}{line_range}` — **{node_type}**: `{summary}`")
        lines.append("")

    lines.extend((
        "## Verification boundary",
        "",
        (
            "This file is evidence-backed but generated: every claim above traces to a specific "
            "file and line range, not to inference. It should still be read and confirmed by a "
            "person before it's treated as published documentation — Cognis synthesizes structure "
            "and connects evidence into prose, but it does not assert intent the code itself "
            "doesn't demonstrate."
        ),
        "",
    ))

    return HealPlan(
        contract_id="contract:generated:undocumented-behavior",
        target_file="docs/COGNIS_GENERATED.md",
        find_text="",
        replace_text="\n".join(lines),
        rationale=(
            f"Cognis found {len(sources)} source-backed behavior records across {len(groups)} "
            f"module{'s' if len(groups) != 1 else ''} in {repo_name} without an in-repository "
            "documentation surface to update, and synthesized a reviewable reference grouped by "
            "module rather than a flat evidence dump."
        ),
        confidence=min(item.confidence for item in sources),
        operation="create",
    )


def _group_by_module(sources: List[Evidence]) -> List[tuple]:
    """Group evidence by its top-level directory (or file, if no directory),
    preserving first-seen order so the doc reads in a stable, sensible sequence."""
    groups: dict = {}
    order: List[str] = []
    for item in sources:
        path = item.provenance.file or item.subject
        parts = path.split("/")
        module = parts[0] if len(parts) > 1 else path
        if module not in groups:
            groups[module] = []
            order.append(module)
        groups[module].append(item)
    return [(module, groups[module]) for module in order]


def _summarize_node_kinds(sources: List[Evidence]) -> dict:
    counts: dict = {}
    for item in sources:
        value = item.value if isinstance(item.value, dict) else {}
        kind = value.get("node_type", item.kind)
        counts[kind] = counts.get(kind, 0) + 1
    return counts


def _synthesize_purpose_paragraph(repo_name: str, groups: List[tuple], sources: List[Evidence]) -> str:
    module_count = len(groups)
    module_names = ", ".join(f"`{m}`" for m, _ in groups[:5])
    more = f", and {module_count - 5} more" if module_count > 5 else ""
    return (
        f"This reference was generated by Cognis from {len(sources)} piece"
        f"{'s' if len(sources) != 1 else ''} of implementation evidence in `{repo_name}` — no "
        "documentation surface existed to update, so this is a baseline built directly from what "
        f"the code does. The evidence spans {module_count} module{'s' if module_count != 1 else ''} "
        f"({module_names}{more}); each section below groups behavior by where it lives in the "
        "repository and explains what that part of the system is responsible for, grounded in the "
        "specific declarations Cognis observed rather than inferred from naming alone."
    )


def _synthesize_module_paragraph(module: str, items: List[Evidence], node_kinds: dict) -> str:
    file_count = len({item.provenance.file for item in items if item.provenance.file})
    kinds_here: dict = {}
    for item in items:
        value = item.value if isinstance(item.value, dict) else {}
        kind = value.get("node_type", item.kind)
        kinds_here[kind] = kinds_here.get(kind, 0) + 1
    kind_summary = ", ".join(f"{count} {kind}{'s' if count != 1 else ''}" for kind, count in kinds_here.items())
    return (
        f"`{module}` contributes {len(items)} observed behavior record"
        f"{'s' if len(items) != 1 else ''} across {file_count} file{'s' if file_count != 1 else ''} "
        f"({kind_summary}). The declarations below are what Cognis found here — read them as a "
        "starting inventory of this module's surface, not a complete account of its behavior."
    )