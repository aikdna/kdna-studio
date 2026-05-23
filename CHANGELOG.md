# Changelog

## v0.5.0 (2026-05-23)

**Integration-Ready Beta**

- Added `examples/minimal-domain/`: end-to-end pipeline demo (project→cards→lock→compile→validate→pack)
- Added `examples/leadership-master/`: realistic domain (3 axioms, 2 misunderstandings, 5 self-checks)
- Added `pipeline.createStudioPipeline()`: official convenience API (Stable)
- Added `docs/why-not-generator.md`: explains Human Lock philosophy
- Added `docs/third-party-integration.md`: integration guide with React/Swift/Electron examples
- Export tiers stabilized: Stable/Experimental/Internal

## v0.4.1 (2026-05-23)

**SPEC Field Alignment + E2E Tests**

- Fixed `reasoning_chains[].from` → `one_sentence` (SPEC §7.3)
- Fixed `evolution.stages[]` to include `id/name/description/indicators` (SPEC §7.4)
- Fixed `measurements` → `measurement` (SPEC §7.4)
- Fixed misunderstandings to include required `why` field
- Added 6 E2E tests: compile→validate→pack→inspect round-trip
- Added `docs/api.md`: Stable/Experimental/Internal API reference

## v0.4.0 (2026-05-23)

**SPEC Compatibility + Security**

- Added `meta { version, domain, created, purpose, load_condition }` to all compile output files
- Fixed `file_count` from hardcoded to actual KDNA file count
- Fixed packaging: `execSync(string)` → `execFileSync('kdna', args)`
- Integrated `validateAllCards()` into `computeReadiness()`
- publishable_grade now requires allFeynman + Feynman ratio tracking
- Refined `recommendVersionBump()`: core meaning/scope changes → major

## v0.3.0 (2026-05-23)

**Judgment Delta + Versioning**

- Added `testlab/delta.js`: parseCompareOutput, createJudgmentDelta, D1-D7 scoring, formatDeltaMarkdown
- Added `versioning/index.js`: diffProjects, recommendVersionBump, generateChangelog, bumpVersion

## v0.2.0 (2026-05-23)

**Quality Gates + Full Compile + Card Validation**

- 4-grade readiness scoring (draft/human_controlled/tested/publishable)
- Anti-vagueness card validation (anti-slogan, anti-SOP, anti-straw-man)
- Full 6-file compile (Core/Patterns/Scenarios/Cases/Reasoning/Evolution)
- Auto-generated README from card metadata

## v0.1.0 (2026-05-23)

**Cards + Evidence + Feynman + Contradiction Check**

- 6-state card machine (Draft→Revised→Locked→Tested→Published→Deprecated)
- Human Lock protocol with mandatory fields
- Feynman Restatement with 5-dimension scoring
- Contradiction detection (missing boundaries, over-generalized axioms, weak self-checks)
- Evidence management with span extraction and card linkage
- Test Lab: test case model, human rating, evals export
- Packaging adapter delegating to kdna-cli

## v0.0.1 (2026-05-23)

**Repository Initialization + Constitution**

- 6 architecture docs, 2 JSON Schemas, 10 module skeletons
- project/, cards/, compile/, quality/, provenance/ initial implementation
