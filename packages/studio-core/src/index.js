/**
 * KDNA Studio Core — Pure logic for authoring KDNA domain judgment.
 *
 * This is the canonical open-source implementation of the Studio authoring
 * workflow. Every exported function is pure logic — no UI dependencies.
 *
 * Modules:
 *   project/      Studio Project CRUD, validation, lifecycle
 *   evidence/     Evidence import, span extraction, card linkage
 *   cards/        Card state machine, human lock, Feynman restatement
 *   quality/      Quality gates, readiness scoring
 *   compile/      Locked cards → KDNA JSON files
 *   testlab/      Test case model, comparison runner
 *   provenance/   Build metadata, content fingerprinting
 *   packaging/    .kdna / .kdnae pack adapters
 *   versioning/   Judgment diff, changelog generation
 *   cli-bridge/   Adapter to kdna-cli subprocess calls
 */

const cards = require('./cards');
const compile = require('./compile');
const evidence = require('./evidence');
const packaging = require('./packaging');
const project = require('./project');
const provenance = require('./provenance');
const quality = require('./quality');
const testlab = require('./testlab');
const versioning = require('./versioning');
const feynman = require('./cards/feynman');
const contradiction = require('./quality/contradiction');
const validateCards = require('./quality/validate-cards');
const delta = require('./testlab/delta');

module.exports = {
  cards,
  compile,
  evidence,
  packaging,
  project,
  provenance,
  quality,
  testlab,
  versioning,
  feynman,
  contradiction,
  validateCards,
  delta,
};
