"""Regression check for RetryPolicy contract invariants."""
import unittest


class RetryPolicyResolver:
    DEFAULT_RETRY_COUNT = 5
    MAX_EXPONENTIAL_JITTER = 2.5

    def __init__(self, retry_count: int = DEFAULT_RETRY_COUNT):
        self.retry_count = retry_count

    def compute_max_attempts(self) -> int:
        return self.retry_count


class TestRetryPolicyEnforcement(unittest.TestCase):
    def setUp(self):
        self.resolver = RetryPolicyResolver()

    def test_default_retry_count_is_five(self):
        """Invariants require retry count to be 5, not legacy 2 or 3."""
        self.assertEqual(
            self.resolver.compute_max_attempts(),
            5,
            "Runtime invariant violated: retry count must be 5."
        )

    def test_retry_count_exceeds_stale_doc_claims(self):
        """Verify contradiction against stale documentation (docs/API.md claimed 2)."""
        stale_doc_claim = 2
        actual_enforced = self.resolver.compute_max_attempts()
        self.assertGreater(
            actual_enforced,
            stale_doc_claim,
            f"Doc asserts {stale_doc_claim}, but code executes {actual_enforced}."
        )


if __name__ == "__main__":
    unittest.main()
