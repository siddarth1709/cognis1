from __future__ import annotations

from pathlib import Path
from typing import Iterable, List

from ..models import Evidence
from ..normalizer import stable_evidence_id
from ..parsers.base import ParserContext
from ..parsers.registry import ParserRegistry
from ..provenance import file_provenance


class SourceExtractor:
    name = "source"

    def __init__(
        self,
        parser_registry: ParserRegistry,
    ) -> None:
        self.parser_registry = parser_registry

    def extract(
        self,
        root: Path,
        files: Iterable[Path],
        repository: str | None,
        commit: str | None,
    ) -> List[Evidence]:
        evidence: List[Evidence] = []

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

            context = ParserContext(
                repository=repository,
                commit=commit,
                root=root,
                file=path,
                text=text,
            )

            parser = (
                self.parser_registry.for_file(
                    context
                )
            )

            if parser is None:
                continue

            try:
                nodes = parser.parse(
                    context
                )
            except Exception:
                continue

            for node in nodes:
                if not node.metadata.get(
                    "named",
                    False,
                ):
                    continue

                subject = (
                    f"{path.relative_to(root).as_posix()}"
                    f"#{node.start_line}"
                )

                value = {
                    "node_type": node.node_type,
                    "text": node.text[:2000],
                    "language": node.metadata.get(
                        "language"
                    ),
                }

                provenance = file_provenance(
                    repository=repository,
                    commit=commit,
                    path=path.relative_to(root),
                    source_type="source",
                    extractor=self.name,
                    start_line=node.start_line,
                    end_line=node.end_line,
                    metadata={
                        "parser": parser.name,
                    },
                )

                evidence_id = stable_evidence_id(
                    "source",
                    subject,
                    "contains_syntax_node",
                    value,
                    provenance.file or "",
                    node.start_line,
                )

                evidence.append(
                    Evidence(
                        id=evidence_id,
                        kind="source",
                        subject=subject,
                        predicate="contains_syntax_node",
                        value=value,
                        provenance=provenance,
                        confidence=1.0,
                        tags=[
                            "source",
                            "syntax",
                            parser.name,
                        ],
                    )
                )

        return evidence