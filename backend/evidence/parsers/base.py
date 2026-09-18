from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, Iterable, Optional


@dataclass
class ParserContext:
    repository: Optional[str]
    commit: Optional[str]
    root: Path
    file: Path
    text: str
    metadata: Dict[str, Any] = field(
        default_factory=dict
    )


@dataclass
class ParsedNode:
    node_type: str
    start_line: int
    end_line: int
    start_column: int
    end_column: int
    text: str
    metadata: Dict[str, Any] = field(
        default_factory=dict
    )


class Parser(ABC):
    name = "parser"

    @abstractmethod
    def can_parse(
        self,
        context: ParserContext,
    ) -> bool:
        ...

    @abstractmethod
    def parse(
        self,
        context: ParserContext,
    ) -> Iterable[ParsedNode]:
        ...

    def score(
        self,
        context: ParserContext,
    ) -> float:
        return (
            1.0
            if self.can_parse(context)
            else 0.0
        )