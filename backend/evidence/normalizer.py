from __future__ import annotations

import hashlib
import json
import re
from typing import Any, Iterable, List

from .models import Evidence


def normalize_text(value: Any) -> str:
    if value is None:
        return ""

    text = str(value)

    text = text.replace("\r\n", "\n")
    text = text.replace("\r", "\n")

    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)

    return text.strip()


def normalize_identifier(value: Any) -> str:
    text = normalize_text(value).lower()

    text = re.sub(r"\s+", "_", text)
    text = re.sub(r"[^a-z0-9._:/@+\-]+", "_", text)

    return text.strip("_")


def stable_evidence_id(
    kind: str,
    subject: str,
    predicate: str,
    value: Any,
    provenance_file: str = "",
    provenance_line: Any = "",
) -> str:
    payload = {
        "kind": kind,
        "subject": subject,
        "predicate": predicate,
        "value": value,
        "file": provenance_file,
        "line": provenance_line,
    }

    serialized = json.dumps(
        payload,
        sort_keys=True,
        ensure_ascii=False,
        default=str,
    )

    digest = hashlib.sha256(serialized.encode("utf-8")).hexdigest()

    return f"ev_{digest[:32]}"


def normalize_evidence(evidence: Evidence) -> Evidence:
    evidence.subject = normalize_identifier(evidence.subject)
    evidence.predicate = normalize_identifier(evidence.predicate)

    if isinstance(evidence.value, str):
        evidence.value = normalize_text(evidence.value)

    evidence.confidence = max(0.0, min(1.0, float(evidence.confidence)))

    if evidence.tags:
        evidence.tags = sorted(
            {
                normalize_identifier(tag)
                for tag in evidence.tags
                if normalize_identifier(tag)
            }
        )

    return evidence


def normalize_many(
    evidence_items: Iterable[Evidence],
) -> List[Evidence]:
    return [
        normalize_evidence(item)
        for item in evidence_items
    ]