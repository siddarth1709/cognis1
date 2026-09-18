from __future__ import annotations

import hashlib
from pathlib import Path
from typing import Optional

from .models import Provenance


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def sha256_text(text: str) -> str:
    return sha256_bytes(text.encode("utf-8", errors="replace"))


def file_provenance(
    repository: Optional[str],
    commit: Optional[str],
    path: Path,
    source_type: str,
    extractor: str,
    start_line: Optional[int] = None,
    end_line: Optional[int] = None,
    confidence: float = 1.0,
    metadata: Optional[dict] = None,
) -> Provenance:
    return Provenance(
        repository=repository,
        commit=commit,
        file=path.as_posix(),
        start_line=start_line,
        end_line=end_line,
        source_type=source_type,
        extractor=extractor,
        confidence=max(0.0, min(1.0, confidence)),
        metadata=metadata or {},
    )