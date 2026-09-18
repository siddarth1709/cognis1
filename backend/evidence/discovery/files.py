from __future__ import annotations

import mimetypes
import os
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, Iterator, Optional


@dataclass(frozen=True)
class FileRecord:
    path: Path
    relative_path: str
    size: int
    mime_type: Optional[str]
    suffix: str
    name: str
    is_hidden: bool
    depth: int


def _is_probably_binary(path: Path) -> bool:
    try:
        with path.open(
            "rb"
        ) as handle:
            sample = handle.read(8192)

        if b"\x00" in sample:
            return True

        return False

    except OSError:
        return True


def _record(
    root: Path,
    path: Path,
) -> FileRecord:
    relative = path.relative_to(root)

    mime_type, _ = mimetypes.guess_type(
        path.name
    )

    return FileRecord(
        path=path,
        relative_path=relative.as_posix(),
        size=path.stat().st_size,
        mime_type=mime_type,
        suffix=path.suffix.lower(),
        name=path.name,
        is_hidden=any(
            part.startswith(".")
            for part in relative.parts
        ),
        depth=len(relative.parts),
    )


def discover_files(
    root: str | Path,
    include_hidden: bool = False,
    max_file_size: int = 5 * 1024 * 1024,
) -> Iterator[FileRecord]:
    repository = Path(root).resolve()

    for current, directories, filenames in os.walk(
        repository
    ):
        current_path = Path(current)

        directories[:] = [
            directory
            for directory in directories
            if not (
                directory == ".git"
                and current_path == repository
            )
        ]

        for filename in filenames:
            path = current_path / filename

            try:
                stat = path.stat()
            except OSError:
                continue

            if stat.st_size > max_file_size:
                continue

            try:
                relative = path.relative_to(
                    repository
                )
            except ValueError:
                continue

            if not include_hidden:
                if any(
                    part.startswith(".")
                    for part in relative.parts
                ):
                    continue

            if _is_probably_binary(path):
                continue

            yield _record(
                repository,
                path,
            )