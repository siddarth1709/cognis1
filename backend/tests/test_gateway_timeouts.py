"""Regression check for Gateway SLA timeout invariants."""
import unittest

LAMBDA_TIMEOUT_SECONDS = 15


def check_gateway_timeout_ceiling(requested_timeout_seconds: int) -> bool:
    """Verifies that client timeout does not exceed Lambda/Serverless ceiling."""
    return requested_timeout_seconds <= LAMBDA_TIMEOUT_SECONDS


class TestGatewayTimeoutCeiling(unittest.TestCase):
    def test_enforced_ceiling_is_fifteen_seconds(self):
        """Serverless execution limit is 15 seconds."""
        self.assertEqual(LAMBDA_TIMEOUT_SECONDS, 15)

    def test_stale_doc_timeout_exceeds_ceiling(self):
        """Docs claim 60 seconds, which exceeds the 15-second infrastructure ceiling."""
        stale_doc_claim = 60
        self.assertFalse(
            check_gateway_timeout_ceiling(stale_doc_claim),
            f"Doc asserts {stale_doc_claim}s, but Lambda limit is {LAMBDA_TIMEOUT_SECONDS}s."
        )


if __name__ == "__main__":
    unittest.main()
