# KDNA Studio — Product Principles

These principles are the constitution of KDNA Studio Core. They are non-negotiable.

---

## Principle 1: Humans are the source of judgment. AI is an assistant.

AI has four legitimate roles in Studio:

| Role | What it does | What it does NOT do |
|------|-------------|---------------------|
| **Interviewer** | Asks structured questions to extract implicit expertise | Declare answers to be true |
| **Challenger** | Surfaces contradictions, missing boundaries, weak distinctions | Resolve contradictions on its own |
| **Compiler** | Transforms locked cards into valid KDNA JSON | Choose which cards to include |
| **Evaluator** | Runs A/B comparison tests against an LLM | Judge which result is better |

AI can propose judgment candidates. AI cannot confirm judgment. Every judgment entering a formal KDNA domain MUST pass through explicit human lock.

---

## Principle 2: Workflow belongs to Studio. Judgment quality belongs to the KDNA domain.

Studio Core is responsible for:

- Stage sequencing
- State transitions
- Lock enforcement
- Compilation rules
- Quality gate orchestration
- Provenance tracking

The `kdna_authoring` domain (when loaded) is responsible for:

- Identifying candidate judgment patterns
- Generating follow-up interview questions
- Evaluating answer quality
- Detecting judgment deltas between AI proposals and human locks

**The boundary:** Studio Core hardcodes HOW judgment must be produced, validated, and locked. It does NOT hardcode WHAT counts as good judgment. That belongs to the domain.

---

## Principle 3: No "one-click domain generation."

The Studio MUST NOT offer a "Generate Domain" button that produces a complete KDNA without human review.

Why:

- One-click generation produces low-quality KDNA
- Low-quality KDNA erodes trust in the ecosystem
- KDNA's value is expert judgment, not AI-synthesized consensus

The enforced workflow:

```
AI proposes     →  status: draft
Human revises   →  status: revised
Human locks     →  status: locked    ← REQUIRED for compilation
Human tests     →  status: tested
Release         →  status: published
```

Draft cards are NEVER included in compiled domain output. Only locked cards may enter.

---

## Principle 4: .kdna correctness is guaranteed by the open-source core.

The ecosystem must not depend on the official Studio being the only source of valid KDNA.

Any tool — official, third-party, internal — that integrates Studio Core should produce correct, verifiable KDNA.

Studio Core guarantees correctness through:

- **Unified data model** — studio.project.json with canonical schema
- **Unified card state machine** — enforced transitions, no shortcuts
- **Unified lock rules** — per-card locking with mandatory fields
- **Unified compile rules** — only locked cards enter output
- **Unified quality gate** — readiness scores with blocking/warning rules
- **Unified provenance** — build ID, author ID, content fingerprints
- **Unified pack/sign interface** — consistent with kdna-cli

---

## What Studio Core Does NOT Do

| Does NOT do | Why |
|-------------|-----|
| Generate axioms from a prompt | Judgment must be extracted from humans, not synthesized |
| Auto-lock cards | Locking is a deliberate human act |
| Run without card state enforcement | Shortcuts produce untrustworthy domains |
| Provide a default UI | Core is UI-agnostic; any framework can consume it |
| Replace kdna-cli | CLI handles runtime; Studio handles authoring |
| Bundle commercial features | Open Core is the foundation; commercial features are in apps |
