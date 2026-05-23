# KDNA Studio Core v0.5.0 — Integration-Ready Beta

## What This Version Can Do

- **Create Studio Projects** with structured card templates
- **Enforce 6-state card machine** (Draft→Revised→Locked→Tested→Published→Deprecated)
- **Require Human Lock** on every card before compilation
- **Validate cards** for anti-vagueness, anti-SOP, anti-straw-man patterns
- **Run quality gates** with 4-grade readiness scoring
- **Compile locked cards** into SPEC-compatible KDNA JSON files (6 files max)
- **Validate output** with `kdna validate` (passes KDNA SPEC v1.0-rc)
- **Pack output** into `.kdna` containers
- **Generate README** from card metadata
- **Track provenance** with build IDs and content fingerprints
- **Run A/B comparison** via `kdna compare` and produce Judgment Delta reports
- **Integrate via pipeline API** — single `createStudioPipeline()` call

## What This Version Cannot Do (Yet)

- Provide a graphical UI (Studio Core is pure logic)
- Run as a standalone macOS/Web application
- Auto-generate complete domains from prompts (by design — see [why-not-generator.md](./why-not-generator.md))
- Manage multi-user collaboration
- Sync projects to cloud
- Publish to the KDNA registry (use `kdna-cli` for that)
- Serve as a production-grade marketplace for domains

## Stable API

| Module | Key Functions |
|--------|-------------|
| `project` | `createProject`, `validateProject`, `loadProject`, `saveProject` |
| `cards` | `createCard`, `transitionCard`, `lockCard`, `unlockCard`, `getLockedCards` |
| `compile` | `compileDomain`, `generateReadme` |
| `quality` | `computeReadiness` |
| `provenance` | `buildProvenance` |
| `pipeline` | `createStudioPipeline` → `runAll()`, `toResult()`, `toArtifacts()` |

These APIs follow semver. Breaking changes only in MAJOR releases.

## Recommended Integration Path

1. `npm install @aikdna/studio-core`
2. Follow [third-party-integration.md](./third-party-integration.md)
3. Run `node examples/minimal-domain/run.js` as a reference
4. Use `createStudioPipeline()` for production code
5. Use Stable APIs only for production integrations
6. Call `kdna-cli` for validate/pack/publish via `packaging` module or `execFileSync`

## Examples

- `examples/minimal-domain/run.js` — minimal end-to-end pipeline
- `examples/leadership-master/run.js` — realistic domain with 10 cards

## Version Compatibility

| studio-core | kdna-cli | kdna-core | KDNA SPEC |
|:----------:|:--------:|:---------:|:---------:|
| 0.5.x | >=0.16.0 | >=0.3.0 | 1.0-rc |
| 0.4.x | >=0.16.0 | >=0.3.0 | 1.0-rc |
| 0.3.x | >=0.16.0 | >=0.3.0 | 1.0-rc |
| 0.2.x | >=0.16.0 | >=0.3.0 | 1.0-rc |
| 0.1.x | >=0.16.0 | >=0.3.0 | 1.0-rc |

## Architecture

```
Human Expert
   ↓
Judgment Cards + Human Lock
   ↓
@aikdna/studio-core
   ↓
KDNA domain files
   ↓
kdna-cli validate / pack
   ↓
KDNAChat / Codex / Claude Code / OpenCode
```
