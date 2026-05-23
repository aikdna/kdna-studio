/**
 * Compile locked cards into KDNA domain JSON files.
 *
 * Only locked cards enter compilation output.
 * Draft/Revised cards are silently excluded.
 */

function compileCore(cards) {
  const axioms = cards.filter(c => c.type === 'axiom' && c.locked).map(c => ({
    id: c.id,
    ...c.fields,
  }));
  const ontology = cards.filter(c => c.type === 'ontology' && c.locked).map(c => ({
    id: c.id,
    ...c.fields,
  }));
  const frameworks = [];
  const stances = [];
  const boundaries = cards.filter(c => c.type === 'boundary' && c.locked).map(c => ({
    id: c.id,
    scope: c.fields.scope,
    out_of_scope: c.fields.out_of_scope,
    acceptable_exceptions: c.fields.acceptable_exceptions || [],
  }));

  const risks = cards.filter(c => c.type === 'risk' && c.locked).map(c => ({
    id: c.id,
    failure_mode: c.fields.failure_mode,
    likelihood: c.fields.likelihood,
    mitigation: c.fields.mitigation,
  }));

  return { axioms, ontology, frameworks, stances, boundaries, risks };
}

function compilePatterns(cards) {
  const misunderstandings = cards.filter(c => c.type === 'misunderstanding' && c.locked).map(c => ({
    id: c.id,
    wrong: c.fields.wrong,
    correct: c.fields.correct,
    key_distinction: c.fields.key_distinction,
    failure_risk: c.fields.failure_risk,
  }));
  const selfChecks = cards.filter(c => c.type === 'self_check' && c.locked).map(c => c.fields.question);
  const bannedTerms = [];
  const aesthetics = cards.filter(c => c.type === 'aesthetic' && c.locked).map(c => ({
    id: c.id,
    preference: c.fields.preference,
    rationale: c.fields.rationale,
  }));

  const terminology = {
    standard_terms: [],
    banned_terms: bannedTerms,
  };

  return { terminology, misunderstandings, self_check: selfChecks, aesthetics };
}

function compileScenarios(cards) {
  return cards.filter(c => c.type === 'scenario' && c.locked).map(c => ({
    id: c.id,
    ...c.fields,
  }));
}

function compileCases(cards) {
  return cards.filter(c => c.type === 'case' && c.locked).map(c => ({
    id: c.id,
    ...c.fields,
  }));
}

function compileManifest(project) {
  const lockedCount = project.cards.filter(c => c.locked).length;
  return {
    kdna_spec: '1.0-rc',
    name: project.name,
    version: project.release?.version || '0.1.0',
    status: 'experimental',
    access: project.release?.access || 'open',
    author: project.author,
    description: project.release?.description || project.name,
    file_count: 2, // Core + Patterns minimum
    created: project.created,
    updated: project.updated,
  };
}

function compileDomain(project) {
  const cards = project.cards || [];
  const core = compileCore(cards);
  const patterns = compilePatterns(cards);
  const scenarios = compileScenarios(cards);
  const cases = compileCases(cards);
  const manifest = compileManifest(project);

  const files = {};
  files['KDNA_Core.json'] = JSON.stringify(core, null, 2);
  files['KDNA_Patterns.json'] = JSON.stringify(patterns, null, 2);
  if (scenarios.length > 0) files['KDNA_Scenarios.json'] = JSON.stringify(scenarios, null, 2);
  if (cases.length > 0) files['KDNA_Cases.json'] = JSON.stringify(cases, null, 2);
  files['kdna.json'] = JSON.stringify(manifest, null, 2);

  const excludedCount = (project.cards || []).filter(c => !c.locked && !['deprecated'].includes(c.status)).length;

  return {
    files,
    stats: {
      total_cards: (project.cards || []).length,
      locked_cards: (project.cards || []).filter(c => c.locked).length,
      excluded_cards: excludedCount,
      deprecated_cards: (project.cards || []).filter(c => c.status === 'deprecated').length,
    },
  };
}

module.exports = { compileDomain, compileCore, compilePatterns, compileScenarios, compileCases, compileManifest };
