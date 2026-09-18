from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, List, Set

from .files import FileRecord


@dataclass
class RepositoryCapabilities:
    file_count: int = 0
    total_size: int = 0
    suffixes: Set[str] = field(default_factory=set)
    mime_types: Set[str] = field(default_factory=set)
    directories: Set[str] = field(default_factory=set)
    hidden_files: int = 0

    def to_dict(self) -> Dict[str, object]:
        return {
            "file_count": self.file_count,
            "total_size": self.total_size,
            "suffixes": sorted(self.suffixes),
            "mime_types": sorted(self.mime_types),
            "directories": sorted(self.directories),
            "hidden_files": self.hidden_files,
        }


def discover_capabilities(
    root: str | Path,
    files: List[FileRecord],
) -> RepositoryCapabilities:
    repository = Path(root).resolve()

    result = RepositoryCapabilities()

    for record in files:
        result.file_count += 1
        result.total_size += record.size

        if record.suffix:
            result.suffixes.add(
                record.suffix
            )

        if record.mime_type:
            result.mime_types.add(
                record.mime_type
            )

        if record.is_hidden:
            result.hidden_files += 1

        relative_parent = Path(
            record.relative_path
        ).parent

        for index in range(
            1,
            len(relative_parent.parts) + 1,
        ):
            result.directories.add(
                str(
                    Path(
                        *relative_parent.parts[
                            :index
                        ]
                    )
                )
            )

    return result