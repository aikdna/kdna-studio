/**
 * createStudioPipeline(project, options) — Official convenience API.
 *
 * Provides the recommended Studio workflow as a single callable pipeline.
 * Third-party apps should use this instead of manually calling individual modules.
 *
 * Stable API (semver guaranteed).
 */

const { validateProject } = require('./project');
const { computeReadiness } = require('./quality');
const { compileDomain, generateReadme } = require('./compile');
const { buildProvenance } = require('./provenance');
const { validateAllCards } = require('./quality/validate-cards');

function createStudioPipeline(project, options = {}) {
  return new StudioPipeline(project, options);
}

class StudioPipeline {
  constructor(project, options = {}) {
    this.project = project;
    this.options = options;
    this.results = {};
  }

  validateProject() {
    const r = validateProject(this.project);
    this.results.project_valid = r;
    return this;
  }

  validateCards() {
    const issues = validateAllCards(this.project);
    this.results.card_validation = { total: issues.length, issues };
    return this;
  }

  computeReadiness() {
    const r = computeReadiness(this.project);
    this.results.readiness = r;
    return this;
  }

  compile() {
    const r = compileDomain(this.project);
    this.results.compile = r;
    return this;
  }

  generateReadme(readmeOptions = {}) {
    const r = generateReadme(this.project, readmeOptions);
    this.results.readme = r;
    return this;
  }

  buildProvenance() {
    if (!this.results.compile) throw new Error('Must call compile() before buildProvenance()');
    const r = buildProvenance(this.project, this.results.compile.files);
    this.results.provenance = r;
    return this;
  }

  runAll(options = {}) {
    this.validateProject();
    this.validateCards();
    this.computeReadiness();
    this.compile();
    if (options.generateReadme !== false) this.generateReadme(options.readmeOptions);
    if (options.buildProvenance !== false) this.buildProvenance();
    return this.toResult();
  }

  get readyness() { return this.results.readiness; }
  get compiled() { return this.results.compile; }
  get kdnaFiles() { return this.results.compile?.files || {}; }
  get isPublishable() { return this.results.readiness?.publishable === true; }

  toResult() {
    return {
      project_valid: this.results.project_valid?.valid === true,
      card_issues: this.results.card_validation?.total || 0,
      readiness: this.results.readiness?.grade || 'unknown',
      publishable: this.results.readiness?.publishable || false,
      score: this.results.readiness?.score || 0,
      kdna_files: this.results.compile?.stats?.kdna_files || 0,
      locked_cards: this.results.compile?.stats?.locked_cards || 0,
      excluded_cards: this.results.compile?.stats?.excluded_cards || 0,
      build_id: this.results.provenance?.build_id || null,
      fingerprint: this.results.provenance?.content_fingerprint || null,
      blocking: this.results.readiness?.blocking || [],
      warnings: this.results.readiness?.warnings || [],
      next_step: this.results.readiness?.next_step || '',
    };
  }
}

module.exports = { createStudioPipeline };
