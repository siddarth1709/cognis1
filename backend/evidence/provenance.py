from pathlib import Path
from typing import Optional

from .models import Provenance

def get_line_range(
    file_path:str,
    start_line: int,
    end_line: Optional[int] = None,
) -> str:
    end_line = end_line or start_line

    path = Path(file_path)

    if not path.exists():
        return ""

    lines = path.read_text(
        encoding = "utf-8",
        errors = "replace",
    ).splitlines()

    selected = lines[start_line - 1:end_line]

    return "\n".join(selected)

def create_provenance(
    file_path: str,
    line_start: Optional[int] = None,
    line_end: Optional[int] = None,
    symbol = Optional[str] = None,
    commit = Optional[str] = None,
) -> Provenance:
    return Provenance(
        file = str(file_path),
        line_start = line_start,
        line_end = line_end,
        symbol = symbol,
        commit = commit,
    )
