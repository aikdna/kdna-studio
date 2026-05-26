# KDNA Studio — Architecture

## Layer Model

```
┌──────────────────────────────────────────────────┐
│  Official KDNA Studio   │  Third-party Apps       │  ← UI Layer
│  (macOS / Web / iOS)   │  (any framework)        │
├──────────────────────────────────────────────────┤
│              KDNA Studio SDK                       │  ← Integration Layer
│  (adapters: node / swift / web / cli-bridge)     │
├──────────────────────────────────────────────────┤
│              KDNA Studio Core                      │  ← Logic Layer (this repo)
│  (pure logic, no UI, no framework dependency)     │
├──────────────────────────────────────────────────┤
│    kdna-cli       │    kdna-core    │  KDNA SPEC  │  ← Protocol Layer
└──────────────────────────────────────────────────┘
```

## Component Map

```
studio-core/
  src/
    project/           Studio Project lifecycle
    evidence/          Evidence import and annotation
    cards/             Card CRUD + state machine + lock + Feynman
    quality/           Quality gates and readiness scoring
    compile/           Locked cards → KDNA JSON files
    testlab/           Test case model and comparison runner
    provenance/        Build metadata and content fingerprinting
    packaging/         signed .kdna asset builders
    versioning/        Judgment diff and changelog
    cli-bridge/        Call kdna-cli commands (validate, verify, pack)
```

## Data Flow

```
Evidence Import
    │
    ▼
Candidate Patterns (AI-proposed, human-reviewed)
    │
    ▼
Judgment Cards ──(lock)──► Locked Cards ──(compile)──► KDNA JSON
    │                         │                           │
    ▼                         ▼                           ▼
Quality Gates             Provenance                  Validate
    │                         │                           │
    ▼                         ▼                           ▼
Readiness Score          Fingerprint               Pack .kdna
                                                         │
                                                         ▼
                                                    Publish
```

## Key Design Decisions

### 1. Core is UI-agnostic

Studio Core exports pure functions. No SwiftUI, no React, no DOM dependencies. Every function takes structured data in, returns structured data out. Any UI framework can wrap it.

```js
// Example: Studio Core API
const { createProject, lockCard, compileDomain } = require('@aikdna/studio-core');
```

### 2. Core delegates to kdna-cli

Studio Core does not re-implement validation, verification, or packing. It calls kdna-cli as a subprocess or imports kdna-core directly for schema validation.

```
Studio Core  →  import kdna-core   (validate schemas)
Studio Core  →  exec kdna-cli      (pack, verify, publish)
```

### 3. SDK provides framework adapters

The SDK layer handles framework-specific concerns:

- **Node adapter**: File I/O, CLI bridging, npm packaging
- **Swift adapter**: macOS file handling, SwiftUI state binding
- **Web adapter**: Browser storage, API calls, React state

### 4. Schemas are the contract

Every data structure has a JSON Schema. The schema is the source of truth for what third-party apps can expect.

```json
// studio.project.schema.json — canonical project structure
// judgment-card.schema.json   — canonical card structure
// evidence.schema.json        — canonical evidence structure
```

## Module Integration Points

### With kdna-cli

```js
// studio-core calls kdna-cli for:
const { execSync } = require('child_process');
execSync('kdna dev validate ./output/');    // validate compiled dev source
execSync('kdna dev pack ./output/');        // build .kdna asset
execSync('kdna verify ./dist/output.kdna --json'); // full asset verification
execSync('kdna license generate ...');      // generate license
```

### With kdna-core

```js
// studio-core imports kdna-core directly for:
const { validateSchema } = require('@aikdna/kdna-core');
validateSchema(project, 'studio.project');    // validate project structure
validateSchema(card, 'judgment-card');         // validate card structure
validateSchema(domain, 'KDNA_Core');           // validate compiled output
```

### With third-party apps

```js
// Any app using Studio Core SDK:
import { StudioProject } from '@aikdna/studio-sdk';
const project = await StudioProject.load('./my_domain');
await project.addEvidence({ type: 'text', content: '...' });
const card = await project.createCard('axiom', { one_sentence: '...' });
await card.lock({ by: 'author_id', statement: 'I confirm...' });
await project.compile();
```

## Security Model

1. **Locked cards cannot be modified by AI** — enforced at the Core level
2. **Provenance is immutable** — every build gets a unique ID
3. **Content fingerprints** — sha256 of locked card set before compilation
4. **Signatures** — delegated to kdna-cli's Ed25519 signing
5. **No network requirement** — Core operates entirely offline; network only for registry publish
