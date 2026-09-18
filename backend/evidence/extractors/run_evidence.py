from __future__ import annotations

import argparse
import json

from .pipeline import EvidencePipeline


def main() -> None:
    parser = argparse.ArgumentParser()

    parser.add_argument(
        "repository",
        help="Path to repository checkout",
    )

    parser.add_argument(
        "--repository-id",
        default=None,
    )

    args = parser.parse_args()

    pipeline = EvidencePipeline()

    result = pipeline.analyze(
        root=args.repository,
        repository=args.repository_id,
    )

    print(
        json.dumps(
            result.to_dict(),
            indent=2,
            ensure_ascii=False,
            default=str,
        )
    )


if __name__ == "__main__":
    main()