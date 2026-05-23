# KDNA Studio

**Guided authoring environment for creating, testing, and publishing KDNA domain judgment packages.**

KDNA Studio transforms expert knowledge into structured, testable KDNA domains through a five-stage workflow. It is the authoring counterpart to [kdna-cli](https://github.com/knowledge-dna/kdna-cli) — CLI handles runtime and distribution; Studio handles creation and quality.

Part of the [KDNA](https://github.com/knowledge-dna/KDNA) ecosystem.

## Philosophy

Writing KDNA JSON by hand is error-prone. Studio replaces raw JSON editing with:

- **Interview-driven extraction** — the agent interviews the domain expert, not the other way around
- **Judgment Cards** — each axiom, misunderstanding, and boundary is a draggable, lockable card
- **Test-first quality** — every card must pass eval cases before lock
- **Human Judgment Lock** — locked cards can only be changed with explicit justification

## Five-Stage Workflow

```
Stage 1: Evidence Room    →  Gather raw material (docs, transcripts, notes)
Stage 2: Interview Room   →  Extract explicit judgment from implicit expertise
Stage 3: Judgment Cards   →  Structure into lockable KDNA elements
Stage 4: Test Lab         →  Validate against real cases (A/B comparison)
Stage 5: Export           →  Compile to .kdna / .kdnae container
```

## Quick Start

```bash
# From kdna-cli:
kdna studio scaffold my_domain        # Create Studio project
kdna studio compile project.json      # Compile locked cards → KDNA domain
kdna studio readiness project.json    # Show readiness card

# Full workflow:
# 1. Scaffold → 2. Author cards → 3. Lock → 4. Compile → 5. Publish
```

## Project Structure

```
my_domain/
  studio.project.json      # Project manifest
  cards/
    axioms/                # One JSON per axiom
    ontology/              # Concepts and boundaries
    misunderstandings/     # Common errors
    boundaries/            # Scope and out-of-scope
    self_checks/           # Yes/no answerable questions
  evals/                   # Test cases (before/after pairs)
  exports/                 # Compiled output directory
```

## Development

```bash
git clone https://github.com/knowledge-dna/kdna-studio.git
cd kdna-studio
npm install
npm test
```

## Related

- [KDNA SPEC](https://github.com/knowledge-dna/KDNA) — Protocol specification
- [kdna-cli](https://github.com/knowledge-dna/kdna-cli) — CLI runtime
- [KDNA Registry](https://github.com/knowledge-dna/kdna-registry) — Domain distribution
- [aikdna.com](https://aikdna.com) — Website

## License

Apache-2.0
