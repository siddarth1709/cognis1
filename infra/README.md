# Cognis AWS infrastructure

This directory is intentionally separate from both `apps/web` and `backend`.

Planned AWS boundary from the Cognis build plan:

- Lambda for request-driven compute
- Step Functions for Observe → Understand → Reason → Challenge → Decide → Verify
- DynamoDB for contract/evidence state and drift memory
- S3 for snapshots, evidence artifacts, published state, and audit records
- API Gateway / EventBridge for ingress and scheduled triggers where required
- CloudWatch for logs, metrics, and alarms
- Amazon Bedrock for model reasoning

The infrastructure implementation should be added incrementally and verified with synthesis/tests before deployment.
