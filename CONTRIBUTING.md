# Contributing to KDNA Studio Core

## Core Rules

These rules protect the integrity of the KDNA ecosystem. They are non-negotiable.

### 1. Never bypass Human Lock

- Draft cards must NEVER enter compilation output
- AI must NEVER lock cards on behalf of humans
- Locked cards must ALWAYS have `human_lock.by`, `human_lock.statement`, and `checked` fields
- There is no "Lock All" operation

### 2. Never add one-click generation

- Studio Core must NEVER auto-generate complete domains from a prompt
- AI can propose candidates; humans must confirm, revise, and lock
- Any feature that looks like "Generate Domain" must be rejected in PR review

### 3. Never violate KDNA SPEC

- Do NOT add new required KDNA JSON files beyond the 6 standard files
- Do NOT rename or change the semantics of standard fields
- Do NOT embed executable code or workflow steps in KDNA files
- All compile output MUST pass `kdna dev validate` before merge

### 4. New fields must go through schema discussion

- New fields in compile output must be added to the schema first
- Discuss in an issue before implementing
- Reference the KDNA SPEC section you intend to extend

### 5. Stable APIs follow semver

- `project`, `cards`, `compile`, `quality`, `provenance`, `pipeline` are Stable
- Breaking changes to Stable APIs require a MAJOR version bump
- Experimental APIs may change in MINOR releases with deprecation notice

## Development

```bash
git clone https://github.com/aikdna/kdna-studio.git
cd kdna-studio
npm install
npm test
```

## Pull Request Checklist

- [ ] All existing tests pass (`npm test` in `packages/studio-core/`)
- [ ] New features have tests in `packages/studio-core/tests/`
- [ ] Examples in `examples/` still run correctly
- [ ] No draft cards enter compile output
- [ ] Human Lock is enforced on all locked cards
- [ ] Compile output passes `kdna dev validate` (if applicable)
- [ ] Stable API changes are documented in CHANGELOG
- [ ] Schema changes are reflected in `packages/studio-schemas/`

## Architecture Constraints

- **Studio Core is UI-agnostic** — no DOM, no React, no SwiftUI dependencies
- **Studio Core delegates to kdna-cli** — do not re-implement validate/pack/verify
- **Package structure is monorepo** — core code is in `packages/studio-core/src/`
- **Templates belong in `templates/`** — not hardcoded in source

## License

Apache-2.0. All contributions are under this license.
