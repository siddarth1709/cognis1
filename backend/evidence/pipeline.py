from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Iterable, List, Optional

from .discovery.capabilities import (
    RepositoryCapabilities,
    discover_capabilities,
)
from .discovery.files import (
    FileRecord,
    discover_files,
)
from .discovery.manifests import (
    ManifestRecord,
    discover_manifests,
)
from .discovery.repository import (
    RepositorySnapshot,
    discover_repository,
)
from .extractors.ci import CIExtractor
from .extractors.dependencies import (
    DependencyExtractor,
)
from .extractors.docs import (
    DocumentationExtractor,
)
from .extractors.schemas import (
    SchemaExtractor,
)
from .extractors.source import (
    SourceExtractor,
)
from .extractors.tests import (
    TestExtractor,
)
from .graph import EvidenceGraph
from .models import Evidence
from .normalizer import normalize_many
from .parsers.registry import ParserRegistry


@dataclass
class EvidenceResult:
    repository: RepositorySnapshot
    capabilities: RepositoryCapabilities
    files: List[FileRecord]
    manifests: List[ManifestRecord]
    evidence: List[Evidence]
    graph: EvidenceGraph

    def to_dict(self) -> Dict[str, object]:
        return {
            "repository": {
                "root": str(
                    self.repository.root
                ),
                "repository": (
                    self.repository.repository
                ),
                "commit": self.repository.commit,
                "branch": self.repository.branch,
                "fingerprint": (
                    self.repository.fingerprint
                ),
                "metadata": (
                    self.repository.metadata
                ),
            },
            "capabilities": (
                self.capabilities.to_dict()
            ),
            "files": [
                {
                    "path": item.relative_path,
                    "size": item.size,
                    "mime_type": item.mime_type,
                    "suffix": item.suffix,
                }
                for item in self.files
            ],
            "manifests": [
                {
                    "path": item.path.relative_to(
                        self.repository.root
                    ).as_posix(),
                    "format": item.format,
                }
                for item in self.manifests
            ],
            "evidence": [
                item.to_dict()
                for item in self.evidence
            ],
            "graph": self.graph.to_dict(),
        }


class EvidencePipeline:
    def __init__(
        self,
        parser_registry: Optional[
            ParserRegistry
        ] = None,
        extractors: Optional[
            Iterable[object]
        ] = None,
    ) -> None:
        self.parser_registry = (
            parser_registry
            or ParserRegistry()
        )

        if extractors is None:
            self.extractors = [
                SourceExtractor(
                    self.parser_registry
                ),
                TestExtractor(),
                DocumentationExtractor(),
                SchemaExtractor(),
                CIExtractor(),
                DependencyExtractor(),
            ]
        else:
            self.extractors = list(
                extractors
            )

    def analyze(
        self,
        root: str | Path,
        repository: str | None = None,
    ) -> EvidenceResult:
        snapshot = discover_repository(
            root,
            repository=repository,
        )

        files = list(
            discover_files(
                snapshot.root
            )
        )

        capabilities = (
            discover_capabilities(
                snapshot.root,
                files,
            )
        )

        manifests = list(
            discover_manifests(
                snapshot.root
            )
        )

        source_files = [
            item.path
            for item in files
        ]

        all_evidence: List[Evidence] = []

        for extractor in self.extractors:
            evidence = self._run_extractor(
                extractor,
                snapshot,
                source_files,
                manifests,
            )

            all_evidence.extend(
                evidence
            )

        normalized = normalize_many(
            all_evidence
        )

        deduplicated = self._deduplicate(
            normalized
        )

        graph = EvidenceGraph()

        graph.add_many(
            deduplicated
        )

        return EvidenceResult(
            repository=snapshot,
            capabilities=capabilities,
            files=files,
            manifests=manifests,
            evidence=deduplicated,
            graph=graph,
        )

    def _run_extractor(
        self,
        extractor: object,
        snapshot: RepositorySnapshot,
        files: List[Path],
        manifests: List[ManifestRecord],
    ) -> List[Evidence]:
        if isinstance(
            extractor,
            (
                SourceExtractor,
                TestExtractor,
                DocumentationExtractor,
                CIExtractor,
            ),
        ):
            return extractor.extract(
                root=snapshot.root,
                files=files,
                repository=snapshot.repository,
                commit=snapshot.commit,
            )

        if isinstance(
            extractor,
            (
                SchemaExtractor,
                DependencyExtractor,
            ),
        ):
            return extractor.extract(
                root=snapshot.root,
                manifests=manifests,
                repository=snapshot.repository,
                commit=snapshot.commit,
            )

        method = getattr(
            extractor,
            "extract",
            None,
        )

        if method is None:
            return []

        try:
            result = method(
                root=snapshot.root,
                files=files,
                manifests=manifests,
                repository=snapshot.repository,
                commit=snapshot.commit,
            )

            return list(result or [])

        except TypeError:
            try:
                result = method(
                    snapshot.root
                )

                return list(
                    result or []
                )

            except Exception:
                return []

        except Exception:
            return []

    @staticmethod
    def _deduplicate(
        evidence: List[Evidence],
    ) -> List[Evidence]:
        seen = set()
        result = []

        for item in evidence:
            if item.id in seen:
                continue

            seen.add(item.id)
            result.append(item)

        return result