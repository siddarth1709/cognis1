from __future__ import annotations

from pathlib import Path
from typing import Iterable, Optional

from .base import (
    ParsedNode,
    Parser,
    ParserContext,
)

try:
    import tree_sitter
except ImportError:
    tree_sitter = None


class TreeSitterParser(Parser):
    name = "tree-sitter"

    def __init__(
        self,
        language_name: str,
        language: object,
    ) -> None:
        self.language_name = language_name
        self.language = language

        self._parser = None

        if tree_sitter is not None:
            try:
                self._parser = tree_sitter.Parser(
                    language
                )
            except TypeError:
                self._parser = tree_sitter.Parser()
                self._parser.set_language(
                    language
                )

    def can_parse(
        self,
        context: ParserContext,
    ) -> bool:
        return (
            self._parser is not None
            and bool(context.text)
        )

    def score(
        self,
        context: ParserContext,
    ) -> float:
        if not self.can_parse(context):
            return 0.0

        return 1.0

    def parse(
        self,
        context: ParserContext,
    ) -> Iterable[ParsedNode]:
        if self._parser is None:
            return []

        source = context.text.encode(
            "utf-8",
            errors="replace",
        )

        tree = self._parser.parse(source)

        return self._walk(
            tree.root_node,
            source,
        )

    def _walk(
        self,
        node,
        source: bytes,
    ) -> Iterable[ParsedNode]:
        stack = [node]

        while stack:
            current = stack.pop()

            try:
                text = source[
                    current.start_byte:
                    current.end_byte
                ].decode(
                    "utf-8",
                    errors="replace",
                )
            except Exception:
                text = ""

            yield ParsedNode(
                node_type=current.type,
                start_line=current.start_point[0] + 1,
                end_line=current.end_point[0] + 1,
                start_column=current.start_point[1],
                end_column=current.end_point[1],
                text=text,
                metadata={
                    "named": bool(
                        getattr(
                            current,
                            "is_named",
                            False,
                        )
                    ),
                    "language": self.language_name,
                    "child_count": len(
                        current.children
                    ),
                },
            )

            children = list(
                current.children
            )

            for child in reversed(children):
                stack.append(child)