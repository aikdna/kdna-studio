# KDNA Studio Monorepo

> ⚠️ **This monorepo has been split.** The core authoring logic is now available as a standalone npm package: **`@aikdna/kdna-studio`** ([GitHub](https://github.com/aikdna/kdna-studio-core)).
>
> This repository retains the monorepo structure (studio-core, schemas, examples) for development history. For new integrations, use the standalone package:
> ```bash
> npm install -g @aikdna/kdna-studio
> kdna-studio --help
> ```

This repository is historical and is not the canonical CLI or npm package. The
current public authoring surfaces are:

- `@aikdna/kdna-studio` from `aikdna/kdna-studio-core` — SDK plus `kdna-studio` CLI.
- `kdna-studio-swift` — native Swift authoring kernel.
- `kdna-cli` — runtime control plane for existing `.kdna` assets only.

**KDNA Studio turns raw human experience into AI-loadable cognitive kernels. AI may propose judgment candidates. Humans must confirm judgment. Only human-locked judgment can compile into KDNA.**

It is not a one-click generator. It is a judgment extraction, validation, locking, testing, and publishing engine.

KDNA Studio 是一个开源创作内核，用于把人的经验、洞察和偏好转化为 AI 可加载的认知内核。AI 可以提出候选判断，人必须确认判断，只有被人确认并锁定的判断才能编译成 KDNA。它不是一键生成器，而是判断提取、校验、锁定、测试与发布引擎。

---

## Why Open Source

.kdna should not only be creatable by the official KDNA Studio.

Any third-party app, Mac App, web tool, or enterprise internal system — as long as it integrates this open-source Studio Core — should produce .kdna that is correct, verifiable, loadable, and distributable.

**The ecosystem principle:**

| Layer | Role | License |
|-------|------|---------|
| **KDNA Studio Core** | Guarantee .kdna correctness for everyone | Open Source (Apache-2.0) |
| **KDNA Studio SDK** | Integration adapters for apps | Open Source |
| **Official KDNA Studio** | Flagship authoring experience | Commercial OK |
| **Third-party Apps** | Any app built on Studio Core | Commercial OK |

## What Studio Core Is NOT

- **Not a one-click domain generator** — AI proposes candidates; humans confirm judgment
- **Not a prompt engineering tool** — It encodes judgment structure, not phrasing
- **Not a KDNAChat replacement** — Studio is for authoring; Chat is for consumption
- **Not a UI framework** — Core is pure logic; UI is an implementation choice

## Architecture

```
Third-party Apps  ─┬─  KDNAChat  ─┬─  Official Studio
                   │              │
         KDNA Studio SDK (integration adapters)
                   │
         KDNA Studio Core (pure logic)
                   │
    ┌──────────────┼──────────────┐
    │              │              │
  kdna-cli    kdna-core      KDNA SPEC
```

Studio Core provides the canonical implementation of:
- **Project Model** — studio.project.json structure and lifecycle
- **Card State Machine** — Draft → Revised → Locked → Tested → Published → Deprecated
- **Human Lock** — Mandatory human confirmation of every judgment card
- **Feynman Restatement** — Verify understanding, not just agreement
- **Quality Gates** — Four readiness grades with clear pass/fail criteria
- **Compile Pipeline** — Locked cards → valid KDNA_Core.json / KDNA_Patterns.json
- **Provenance** — Every generated .kdna carries its authoring history
- **Test Lab** — A/B comparison proving judgment improvement

## Five-Stage Workflow

```
Stage 1: Evidence Room   →  Import raw material; extract candidate patterns
Stage 2: Interview Room  →  AI interviews the expert; extracts judgment
Stage 3: Judgment Cards  →  Structure into lockable, verifiable cards
Stage 4: Test Lab        →  Validate with A/B comparison against LLM
Stage 5: Export          →  Compile → validate → canonical .kdna → sign → publish
```

At every stage, the human is the authority. AI is only an interviewer, challenger, compiler, and evaluator — never the judge.

## Quick Start

```bash
# Create a Studio project
kdna-studio create my_domain --name @yourscope/my_domain

# Author judgment cards and Human Lock them

# Check readiness
kdna-studio report my_domain

# Export a canonical .kdna asset
kdna-studio export my_domain --out ./dist/my_domain.kdna --sign

# Runtime verification and publication happen after export
kdna verify ./dist/my_domain.kdna --judgment
kdna publish ./dist/my_domain.kdna
```

## Repository Structure

```
kdna-studio/
  README.md
  packages/
    studio-core/         # Pure logic — no UI dependencies
      src/
        project/         # Project CRUD, validation
        evidence/        # Evidence import, span extraction
        cards/           # Card state machine, lock, Feynman
        quality/         # Quality gates, readiness checks
        compile/         # Compile locked cards → KDNA JSON
        testlab/         # Test case model, comparison
        provenance/      # Build ID, fingerprints, audit trail
        packaging/       # Build signed .kdna assets
        versioning/      # Judgment diff, changelog
      tests/
    studio-schemas/      # JSON Schemas for all data models
      studio.project.schema.json
      judgment-card.schema.json
      evidence.schema.json
  docs/
    product-principles.md
    architecture.md
    judgment-loop.md
    card-state-machine.md
    human-lock.md
```

## Related

- [KDNA SPEC](https://github.com/aikdna/kdna) — Protocol specification
- [kdna-cli](https://github.com/aikdna/kdna-cli) — CLI runtime and distribution
- [kdna-registry](https://github.com/aikdna/kdna-registry) — Domain catalog
- [aikdna.com](https://aikdna.com) — Website

## License

Apache-2.0
