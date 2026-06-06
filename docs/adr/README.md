# Architecture Decision Records

This folder records significant architectural decisions for the portfolio monorepo
(frontend + backend). Each ADR captures the context, the decision, and its
consequences at a point in time — so the *why* behind the code survives.

**Format:** MADR-lite — `Status`, `Context`, `Decision`, `Consequences`.

**Naming:** `NNNN-kebab-title.md`, numbered sequentially (`0001-…`, `0002-…`).

**Status lifecycle:** `Proposed → Accepted → Superseded`. An ADR is never edited
to reverse a decision; instead a new ADR supersedes it, and the old one is marked
`Superseded by ADR-NNNN`.

## Index

- [0001 — Python + RAG chatbot backend](0001-python-rag-chatbot-backend.md) — *Superseded by 0002*
- [0002 — Migrate chatbot to Vercel AI SDK on Nitro](0002-migrate-to-vercel-ai-sdk.md) — *Accepted*
