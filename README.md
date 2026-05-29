# KDNA Studio Archive

This repository is no longer an active package or authoring entry.

The KDNA Studio implementation has been split into the current public
repositories below:

| Repository | Package | Command | Role |
| --- | --- | --- | --- |
| [`aikdna/kdna-studio-core`](https://github.com/aikdna/kdna-studio-core) | `@aikdna/kdna-studio-core` | none | Studio SDK and compiler kernel |
| [`aikdna/kdna-studio-cli`](https://github.com/aikdna/kdna-studio-cli) | `@aikdna/kdna-studio-cli` | `kdna-studio` | Official command-line authoring entry |
| [`aikdna/kdna-studio-swift`](https://github.com/aikdna/kdna-studio-swift) | SwiftPM `kdna-studio-swift` | none | Native Apple authoring core |
| [`aikdna/kdna-cli`](https://github.com/aikdna/kdna-cli) | `@aikdna/kdna-cli` | `kdna` | Runtime CLI for existing `.kdna` assets |

## Install

For command-line KDNA creation:

```bash
npm install -g @aikdna/kdna-studio-cli
kdna-studio --help
```

For JavaScript applications that need the authoring kernel:

```bash
npm install @aikdna/kdna-studio-core
```

## Boundary

`kdna-studio` creates, locks, compiles, and exports trusted `.kdna` assets.

`kdna` verifies, installs, loads, compares, publishes existing `.kdna` assets,
and records runtime traces.

This old monorepo is kept only for development history. Do not install packages
from this repository and do not treat it as the canonical Studio implementation.

## License

Apache-2.0
