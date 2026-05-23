/**
 * KDNA Studio — Guided authoring environment for KDNA domain judgment packages.
 *
 * Studio implements the five-stage authoring workflow:
 *   1. Evidence Room  — gather raw material
 *   2. Interview Room — extract expert judgment
 *   3. Judgment Cards — structure into lockable KDNA elements
 *   4. Test Lab       — validate against real cases
 *   5. Export         — compile to .kdna / .kdnae container
 *
 * Studio is NOT a replacement for kdna-cli. CLI handles runtime and
 * distribution; Studio handles creation and quality.
 */

const fs = require('fs');
const path = require('path');

// Re-export from @aikdna/kdna-core for convenience
const kdnaCore = require('@aikdna/kdna-core');

module.exports = {
  ...kdnaCore,
};
