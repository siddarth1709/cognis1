from __future__ import annotations

import re
from pathlib import Path
from typing import Iterable, List

from ..models import Evidence
from ..normalizer import stable_evidence_id
from ..provenance import file_provenance


_MARKUP_PATTERN = re.compile(
    r"(^#{1,6}\s+.+$)|"
    r"(```[\s\S]*?```)|"
    r"(^[-*+]\s+.+$)|"
    r"(^>\s+.+$)|"
    r"(\[[^\]]+\]\([^)]+\))",
    re.MULTILINE,
)


class DocumentationExtractor:
    name = "documentation"

    def extract(
        self,
        root: Path,
        files: Iterable[Path],
        repository: str | None,
        commit: str | None,
    ) -> List[Evidence]:
        result: List[Evidence] = []

        for path in files:
            try:
                text = path.read_text(
                    encoding="utf-8"
                )
            except (
                OSError,
                UnicodeDecodeError,
            ):
                continue

            if not text.strip():
                continue

            signals = list(
                _MARKUP_PATTERN.finditer(text)
            )

            if not signals:
                continue

            relative = path.relative_to(
                root
            )

            line_count = (
                text.count("\n") + 1
            )

            subject = relative.as_posix()

            value = {
                "line_count": line_count,
                "markup_signals": len(
                    signals
                ),
                "headings": self._headings(
                    text
                ),
            }

            provenance = file_provenance(
                repository=repository,
                commit=commit,
                path=relative,
                source_type="documentation",
                extractor=self.name,
                start_line=1,
                end_line=line_count,
            )

            evidence_id = stable_evidence_id(
                "documentation",
                subject,
                "contains_documentation",
                value,
                provenance.file or "",
            )

            result.append(
                Evidence(
                    id=evidence_id,
                    kind="documentation",
                    subject=subject,
                    predicate="contains_documentation",
                    value=value,
                    provenance=provenance,
                    confidence=0.8,
                    tags=[
                        "documentation",
                        "text",
                    ],
                )
            )

        return result

    @staticmethod
    def _headings(
        text: str,
    ) -> List[str]:
        return [
            match.group(1).strip()
            for match in re.finditer(
                r"^#{1,6}\s+(.+)$",
                text,
                re.MULTILINE,
            )
        ]