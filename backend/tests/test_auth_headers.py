"""Regression check for Authentication header schema invariants."""
import unittest


def validate_auth_header(header_value: str) -> bool:
    """Enforces standard RFC 6750 Bearer authentication schema."""
    if not header_value:
        return False
    parts = header_value.strip().split(" ")
    if len(parts) != 2:
        return False
    scheme, token = parts
    return scheme == "Bearer" and len(token) > 8


class TestAuthHeaderSchema(unittest.TestCase):
    def test_bearer_token_accepted(self):
        """RFC 6750 Bearer headers must validate successfully."""
        self.assertTrue(validate_auth_header("Bearer cog_live_valid_token_12345"))

    def test_legacy_token_scheme_rejected(self):
        """Legacy 'Token <key>' scheme in docs/API.md must be rejected by middleware."""
        legacy_header = "Token cog_live_99x817293847291823719"
        self.assertFalse(
            validate_auth_header(legacy_header),
            "Security invariant: legacy 'Token' scheme must be rejected in favor of 'Bearer'."
        )


if __name__ == "__main__":
    unittest.main()
