# Cognis

Cognis is an autonomous behavioral verification engine for codebase contract drift.

## Monorepo Layout

```text
cognis/
├── apps/
│   └── web/                 # Next.js web application & dashboard
├── backend/                 # Evidence extraction, contracts, verification, agent, and healing
├── infra/                   # AWS infrastructure (Lambda, Step Functions, DynamoDB, Bedrock)
├── docs/                    # Architectural documents & guides
└── .github/workflows/       # CI / CD automation
```

## Quick Start (Web)

```bash
# Install workspace dependencies
pnpm install

# Run the Next.js frontend dev server
pnpm dev

# Build the frontend application
pnpm build
```

## Backend (Python)

```bash
cd backend
python -m pip install -r requirements.txt
```
