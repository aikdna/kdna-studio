# Third-Party Integration Guide

How to integrate `@aikdna/kdna-studio-core` into any app, tool, or platform that creates KDNA domains.

## Quick Start

```bash
npm install @aikdna/kdna-studio-core
```

```js
const { project, cards, compile, quality, pipeline } = require('@aikdna/kdna-studio-core');

// 1. Create a project
const p = project.createProject('my_domain', 'domain', {
  author: { name: 'Expert', id: 'expert_id' },
});

// 2. Add a judgment card
const card = cards.createCard('axiom', {
  one_sentence: 'Price objections are certainty deficits, not price problems.',
  full_statement: 'When a buyer says "too expensive," first diagnose which type of uncertainty is blocking them.',
  why: 'Without this axiom, agents default to offering discounts instead of diagnosing.',
  applies_when: ['User reports price objection'],
  does_not_apply_when: ['User explicitly requests price comparison'],
  failure_risk: 'May cause agent to seem evasive when price is genuinely the issue.',
});

// 3. Lock the card (requires explicit human confirmation)
cards.transitionCard(card, 'revised', { by: 'expert_id' });
cards.lockCard(card, {
  by: 'expert_id',
  statement: 'I confirm this judgment represents my expert understanding.',
  checked: { applies_when: true, does_not_apply_when: true, failure_risk: true },
});

// 4. Check readiness
const readiness = quality.computeReadiness(p);
console.log(`Grade: ${readiness.grade}, Publishable: ${readiness.publishable}`);

// 5. Compile to KDNA
const result = compile.compileDomain(p);
// result.files['KDNA_Core.json'] → validated KDNA JSON
// result.files['KDNA_Patterns.json'] → validated KDNA JSON
// result.files['kdna.json'] → manifest

// 6. Save to disk
const fs = require('fs');
for (const [filename, content] of Object.entries(result.files)) {
  fs.writeFileSync(`./output/${filename}`, content);
}

// 7. Validate with kdna-cli
const { execFileSync } = require('child_process');
execFileSync('kdna', ['dev', 'validate', './output/']);
execFileSync('kdna', ['dev', 'pack', './output/']);
```

## Convenience Pipeline

For simpler integration, use the official pipeline:

```js
const { pipeline } = require('@aikdna/kdna-studio-core');

const p = pipeline.createStudioPipeline(project);
const result = p.runAll();

// → { readiness: 'human_controlled', kdna_files: 4, locked_cards: 3, ... }
```

## Stable vs Experimental APIs

| Tier | Modules | Semver Guarantee |
|------|---------|:----------------:|
| **Stable** | `project`, `cards`, `compile`, `quality`, `provenance`, `pipeline` | Only breaks in MAJOR |
| **Experimental** | `evidence`, `testlab`, `delta`, `feynman`, `contradiction`, `validateCards`, `versioning` | May change in MINOR with deprecation |
| **Internal** | `packaging`, `cli-bridge` | No guarantees |

Only use Stable APIs for production integrations. See [API Reference](./api.md).

## What Your Generated .kdna Carries

Every domain compiled by Studio Core includes provenance:

```json
{
  "provenance": {
    "studio_core": "aikdna/kdna-studio",
    "studio_core_version": "0.4.1",
    "build_id": "build_...",
    "project_id": "studio_...",
    "author_id": "...",
    "locked_card_count": 5,
    "content_fingerprint": "sha256:..."
  }
}
```

This proves:
- Which tool created the domain
- Which version of Studio Core was used
- Who authored the locked cards
- The content fingerprint for verification

## Integrating with UI Frameworks

Studio Core is pure logic — no UI dependencies. Use with any framework:

**React:**
```jsx
import { createStudioPipeline } from '@aikdna/kdna-studio-core';

function CompileButton({ project }) {
  const handleCompile = () => {
    const pipeline = createStudioPipeline(project);
    const result = pipeline.runAll().toResult();
    const artifacts = pipeline.toArtifacts();
    console.log(`Compiled: ${result.kdna_files} files, grade: ${result.readiness}`);
    // artifacts.files → { 'KDNA_Core.json': '...', ... }
    // artifacts.readme → generated README text
  };
  return <button onClick={handleCompile}>Compile</button>;
}
```

**Swift (via CLI bridge):**
```swift
// Call kdna-cli via Process
// Studio Core logic accessed through kdna-cli commands
// Or use @aikdna/kdna-studio-core via JavaScriptCore bridge
```

**Tauri/Electron:**
```js
// Install as npm dependency, call from renderer via IPC
const { compileDomain } = window.__TAURI__.invoke ?
  await import('@aikdna/kdna-studio-core') :
  require('@aikdna/kdna-studio-core');
```

## Building a Complete Authoring App

The recommended stack:

1. **Data layer**: `@aikdna/kdna-studio-core` (project model, cards, state machine)
2. **Validation layer**: `@aikdna/kdna-core` (schema validation)
3. **Distribution layer**: `@aikdna/kdna-cli` (dev validate, build, sign, publish)
4. **UI layer**: Your choice (React, SwiftUI, Tauri, Electron)
5. **License layer** (commercial): licensed `.kdna` encrypted entries + entitlement activation

## Testing Your Integration

```bash
# Verify your tool's output
npm install @aikdna/kdna-cli
kdna dev validate ./output/
kdna publish ./output/ --output ./dist/output.kdna --check
kdna verify ./dist/output.kdna --judgment
kdna inspect ./dist/output.kdna --json
```

## Examples

- [minimal-domain](../examples/minimal-domain/run.js) — minimal working example
- [leadership-master](../examples/leadership-master/run.js) — realistic domain
