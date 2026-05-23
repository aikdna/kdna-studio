/**
 * Studio Project lifecycle.
 *
 * Responsibilities:
 *   - Create, load, save, validate Studio Project manifests
 *   - Manage project-level state transitions
 *   - Schema validation against studio.project.schema.json
 */

const projectSchema = require('../../../studio-schemas/studio.project.schema.json');

function createProject(name, type = 'domain', options = {}) {
  const project = {
    studio_version: '0.1.0',
    project_id: `studio_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    name,
    type,
    created: new Date().toISOString().slice(0, 10),
    updated: new Date().toISOString().slice(0, 10),
    author: options.author || { name: '', id: '' },
    status: 'drafting',
    cards: [],
    evidence: [],
    tests: [],
    stages: {
      evidence_room: { status: 'pending', evidence_count: 0 },
      interview_room: { status: 'pending', questions_asked: 0 },
      judgment_cards: { status: 'pending', locked: 0, total: 0 },
      test_lab: { status: 'pending', evals_passed: 0, evals_total: 0 },
      export: { status: 'pending' },
    },
  };
  return project;
}

function loadProject(json) {
  const project = typeof json === 'string' ? JSON.parse(json) : json;
  // TODO: validate against schema
  return project;
}

function saveProject(project) {
  project.updated = new Date().toISOString().slice(0, 10);
  return JSON.stringify(project, null, 2);
}

function validateProject(project) {
  // TODO: full schema validation using ajv + studio.project.schema.json
  const issues = [];
  if (!project.name) issues.push('Missing project name');
  if (!project.type || !['domain', 'cluster'].includes(project.type)) issues.push('Invalid project type');
  if (!Array.isArray(project.cards)) issues.push('cards must be an array');
  return { valid: issues.length === 0, issues };
}

function upgradeProject(project, fromVersion, toVersion) {
  // TODO: migration logic across studio_version changes
  project.studio_version = toVersion;
  return project;
}

module.exports = { createProject, loadProject, saveProject, validateProject, upgradeProject };
