from __future__ import annotations

from typing import Iterable, List, Optional

from .base import Parser, ParserContext


class ParserRegistry:
    def __init__(
        self,
        parsers: Optional[
            Iterable[Parser]
        ] = None,
    ) -> None:
        self._parsers: List[Parser] = []

        for parser in parsers or []:
            self.register(parser)

    def register(
        self,
        parser: Parser,
    ) -> None:
        if not isinstance(
            parser,
            Parser,
        ):
            raise TypeError(
                "parser must implement Parser"
            )

        if parser not in self._parsers:
            self._parsers.append(
                parser
            )

    def unregister(
        self,
        parser: Parser,
    ) -> None:
        if parser in self._parsers:
            self._parsers.remove(
                parser
            )

    def all(
        self,
    ) -> List[Parser]:
        return list(
            self._parsers
        )

    def candidates(
        self,
        context: ParserContext,
    ) -> List[Parser]:
        candidates = []

        for parser in self._parsers:
            try:
                score = float(
                    parser.score(
                        context
                    )
                )
            except Exception:
                score = 0.0

            if score > 0:
                candidates.append(
                    (
                        score,
                        parser,
                    )
                )

        candidates.sort(
            key=lambda item: item[0],
            reverse=True,
        )

        return [
            parser
            for _, parser in candidates
        ]

    def for_file(
        self,
        context: ParserContext,
    ) -> Optional[Parser]:
        candidates = self.candidates(
            context
        )

        if not candidates:
            return None

        return candidates[0]