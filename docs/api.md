# KDNA Studio Core — Public API Reference

## Stability Tiers

| Tier | Meaning | Breaking Changes |
|------|---------|:----------------:|
| **Stable** | Production-ready. Semver-guaranteed. | Only in MAJOR releases |
| **Experimental** | Usable but evolving. May change in MINOR. | With deprecation notice |
| **Internal** | Implementation detail. May change any time. | No guarantees |

---

## Stable API

### Project

```js
const { project } = require('@aikdna/studio-core');
project.createProject(name, type, options)  // → StudioProject
project.loadProject(json)                     // → StudioProject
project.saveProject(project)                  // → string
project.validateProject(project)              // → { valid, issues }
```

### Cards (State Machine)

```js
const { cards } = require('@aikdna/studio-core');
cards.createCard(type, fields, id)            // → JudgmentCard
cards.transitionCard(card, toState, context)  // → JudgmentCard
cards.lockCard(card, lockPayload)             // → JudgmentCard
cards.unlockCard(card, reason, by)            // → JudgmentCard
cards.getLockedCards(project)                 // → JudgmentCard[]
cards.CARD_TYPES                               // → string[]
cards.VALID_STATES                             // → string[]
```

### Compile

```js
const { compile } = require('@aikdna/studio-core');
compile.compileDomain(project)                // → { files, stats }
compile.generateReadme(project, options)       // → string
```

### Quality

```js
const { quality } = require('@aikdna/studio-core');
quality.computeReadiness(project)             // → ReadinessResult { grade, publishable, blocking, warnings, score, stats }
```

### Provenance

```js
const { provenance } = require('@aikdna/studio-core');
provenance.buildProvenance(project, files)    // → { studio_core, build_id, content_fingerprint, ... }
```

### Governance

```js
const { governance } = require('@aikdna/studio-core');
governance.computeRiskLevel(project)            // → 'R0'|'R1'|'R2'|'R3'
governance.validateGovernance(project)          // → { valid, issues, risk_level, requires_expert_review }
governance.generateKdnaCard(project, stats, provenance) // → KDNA Card object
```

---

## Experimental API

### Feynman Restatement

```js
const { feynman } = require('@aikdna/studio-core');
feynman.createFeynmanRestatement(card, text)          // → FeynmanRestatement
feynman.evaluateRestatementQuality(card, text)        // → Score
feynman.attachRestatementToLock(card, restatement)    // → JudgmentCard
feynman.validateRestatementCard(card)                 // → Issue[]
```

### Contradiction Check

```js
const { contradiction } = require('@aikdna/studio-core');
contradiction.detectContradictions(cards)              // → Issue[]
contradiction.summarizeContradictions(issues)          // → Summary
```

### Card Validation

```js
const { validateCards } = require('@aikdna/studio-core');
validateCards.validateCard(card)                       // → Issue[]
validateCards.validateAllCards(project)                // → { card_id, issues }[]
```

### Evidence

```js
const { evidence } = require('@aikdna/studio-core');
evidence.createEvidenceEntry(type, title, content, source)  // → Evidence
evidence.addEvidence(project, evidence)                      // → StudioProject
evidence.extractSpan(evidence, start, end, pattern)          // → Span
evidence.linkEvidenceToCard(evidence, spanId, card)          // → JudgmentCard
```

### Test Lab

```js
const { testlab } = require('@aikdna/studio-core');
testlab.createTestCase(input, options)               // → TestCase
testlab.recordHumanRating(testCase, result, by, notes) // → TestCase
testlab.linkTestToCards(testCase, cardIds)            // → TestCase
testlab.generateTestSummary(project)                  // → Summary
testlab.exportEvals(project)                          // → Eval[]
```

### Judgment Delta

```js
const { delta } = require('@aikdna/studio-core');
delta.parseCompareOutput(diffText)                            // → { axes, verdict }
delta.parseCompareReportJson(report)                          // → { axes, verdict }
delta.createJudgmentDelta(domain, input, respA, respB, diffText, opts) // → Delta
delta.createJudgmentDeltaFromReport(domain, input, report, opts)      // → Delta
delta.compareDeltas(delta1, delta2)                          // → Comparison
delta.formatDeltaMarkdown(delta)                              // → string
```

### Versioning

```js
const { versioning } = require('@aikdna/studio-core');
versioning.diffProjects(oldProject, newProject)          // → Diff
versioning.recommendVersionBump(diff)                     // → 'major' | 'minor' | 'patch' | 'none'
versioning.generateChangelog(diff, oldVer, newVer, opts)  // → string
versioning.bumpVersion(current, bumpType)                 // → string
versioning.markBreakingChange(diff)                       // → { breaking, reason }
```

---

## Internal API

These modules are implementation details and may change without notice:

| Module | Reason |
|--------|--------|
| `packaging/` | Calls kdna-cli subprocess. Interface may change with kdna-cli evolution. |
| `cli-bridge/` | Placeholder. Not yet implemented. |
| `compile.compileCore()`, `compilePatterns()`, `compileScenarios()`, etc. | Internal compilation steps. Use `compileDomain()` instead. |
| `quality.getBlockingIssues()` | Wrapper. Use `computeReadiness()` instead. |

---

## Deprecation Policy

- **Experimental APIs** → Stable: 1 MINOR release notice minimum
- **API removal** → Deprecation warning for 1 MAJOR release minimum
- **Field name changes** → Handled as MAJOR bumps (semver)

## Version Compatibility

| @aikdna/studio-core | @aikdna/kdna-core | @aikdna/kdna-cli | KDNA SPEC |
|:-------------------:|:-----------------:|:----------------:|:---------:|
| 0.4.x | ≥0.3.0 | ≥0.16.0 | 1.0-rc |
| 0.3.x | ≥0.3.0 | ≥0.16.0 | 1.0-rc |
| 0.2.x | ≥0.3.0 | ≥0.16.0 | 1.0-rc |
| 0.1.x | ≥0.3.0 | ≥0.16.0 | 1.0-rc |
