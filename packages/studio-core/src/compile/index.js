/**
 * Compile locked cards into KDNA domain JSON files.
 *
 * Only locked cards enter compilation output.
 * Draft/Revised cards are silently excluded.
 * Supports full 6-file output: Core / Patterns / Scenarios / Cases / Reasoning / Evolution.
 */
const provenance = require('../provenance');

function compileCore(cards) {
  const axioms = cards.filter(c => c.type === 'axiom' && c.locked).map(c => ({ id: c.id, ...c.fields }));
  const ontology = cards.filter(c => c.type === 'ontology' && c.locked).map(c => ({ id: c.id, ...c.fields }));
  const frameworks = [];
  const stances = [];
  const boundaries = cards.filter(c => c.type === 'boundary' && c.locked).map(c => ({
    id: c.id,
    scope: c.fields?.scope || '',
    out_of_scope: c.fields?.out_of_scope || '',
    acceptable_exceptions: c.fields?.acceptable_exceptions || [],
  }));
  const risks = cards.filter(c => c.type === 'risk' && c.locked).map(c => ({ id: c.id, ...c.fields }));

  return { axioms, ontology, frameworks, stances, boundaries, risks };
}

function compilePatterns(cards) {
  const misunderstandings = cards.filter(c => c.type === 'misunderstanding' && c.locked).map(c => ({
    id: c.id,
    wrong: c.fields?.wrong || '',
    correct: c.fields?.correct || '',
    key_distinction: c.fields?.key_distinction || '',
    failure_risk: c.fields?.failure_risk || null,
    applies_when: c.fields?.applies_when || [],
    does_not_apply_when: c.fields?.does_not_apply_when || [],
  }));
  const selfCheckQuestions = cards.filter(c => c.type === 'self_check' && c.locked).map(c => c.fields?.question || '');
  const aesthetics = cards.filter(c => c.type === 'aesthetic' && c.locked).map(c => ({ id: c.id, ...c.fields }));

  const terminology = {
    standard_terms: [],
    banned_terms: [],
  };

  return { terminology, misunderstandings, self_check: selfCheckQuestions, aesthetics };
}

function compileScenarios(cards) {
  const locked = cards.filter(c => c.type === 'scenario' && c.locked);
  if (locked.length === 0) return [];
  return locked.map(c => ({ id: c.id, ...c.fields }));
}

function compileCases(cards) {
  const locked = cards.filter(c => c.type === 'case' && c.locked);
  if (locked.length === 0) return [];
  return locked.map(c => ({ id: c.id, ...c.fields }));
}

function compileReasoning(cards) {
  // Reasoning chains from axiom implications
  const lockedAxioms = cards.filter(c => c.type === 'axiom' && c.locked);
  if (lockedAxioms.length === 0) return [];
  return lockedAxioms.map(ax => ({
    id: `chain_${ax.id}`,
    from: ax.fields?.one_sentence || '',
    logic: [ax.fields?.full_statement || ''],
    so_what: ax.fields?.why || 'Agent judgment changes when this axiom is loaded.',
  }));
}

function compileEvolution(cards) {
  const lockedCards = cards.filter(c => c.locked);
  if (lockedCards.length === 0) return { stages: [], capability_layers: [], measurements: [] };

  // Build evolution from audit logs
  const stages = [];
  const seenAxioms = new Set();
  for (const card of lockedCards) {
    if (seenAxioms.has(card.id)) continue;
    seenAxioms.add(card.id);
    for (const entry of (card.audit_log || [])) {
      if (entry.event === 'locked' || entry.event === 'published') {
        stages.push({
          card_id: card.id,
          event: entry.event,
          at: entry.at,
          by: entry.by,
        });
      }
    }
  }

  return {
    stages: stages.sort((a, b) => a.at.localeCompare(b.at)),
    capability_layers: [
      { layer: 1, name: 'Foundation', description: 'Core axioms and patterns established.' },
    ],
    measurements: [
      { metric: 'locked_axioms', value: lockedCards.filter(c => c.type === 'axiom').length },
      { metric: 'locked_misunderstandings', value: lockedCards.filter(c => c.type === 'misunderstanding').length },
      { metric: 'self_checks', value: lockedCards.filter(c => c.type === 'self_check').length },
    ],
  };
}

function compileManifest(project) {
  const lockedCount = (project.cards || []).filter(c => c.locked).length;
  const cards = project.cards || [];
  const hasScenarios = cards.some(c => c.type === 'scenario' && c.locked);
  const hasCases = cards.some(c => c.type === 'case' && c.locked);
  const fileCount = 2 + (hasScenarios ? 1 : 0) + (hasCases ? 1 : 0) + 2; // Core+Patterns+Reasoning+Evolution (+ Scenarios + Cases)
  return {
    kdna_spec: '1.0-rc',
    name: project.name,
    version: (project.release && project.release.version) || '0.1.0',
    status: 'experimental',
    access: (project.release && project.release.access) || 'open',
    author: project.author || { name: '', id: '' },
    description: project.name,
    file_count: 2,
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
  const reasoning = compileReasoning(cards);
  const evolution = compileEvolution(cards);
  const manifest = compileManifest(project);

  const files = {};
  files['KDNA_Core.json'] = JSON.stringify(core, null, 2);
  files['KDNA_Patterns.json'] = JSON.stringify(patterns, null, 2);
  if (scenarios.length > 0) files['KDNA_Scenarios.json'] = JSON.stringify({ scenes: scenarios }, null, 2);
  if (cases.length > 0) files['KDNA_Cases.json'] = JSON.stringify({ cases }, null, 2);
  if (reasoning.length > 0) files['KDNA_Reasoning.json'] = JSON.stringify({ chains: reasoning }, null, 2);
  if (evolution.stages && evolution.stages.length > 0) files['KDNA_Evolution.json'] = JSON.stringify(evolution, null, 2);
  files['kdna.json'] = JSON.stringify(manifest, null, 2);

  const excludedCount = cards.filter(c => !c.locked && !['deprecated'].includes(c.status)).length;

  return {
    files,
    stats: {
      total_cards: cards.length,
      locked_cards: cards.filter(c => c.locked).length,
      excluded_cards: excludedCount,
      deprecated_cards: cards.filter(c => c.status === 'deprecated').length,
      files_output: Object.keys(files).length,
    },
  };
}

function generateReadme(project, options = {}) {
  const cards = project.cards || [];
  const locked = cards.filter(c => c.locked);
  const lockedAxioms = locked.filter(c => c.type === 'axiom');
  const lockedMisunderstandings = locked.filter(c => c.type === 'misunderstanding');
  const lockedSelfChecks = locked.filter(c => c.type === 'self_check');
  const lockedBoundaries = locked.filter(c => c.type === 'boundary');
  const tests = project.tests || [];

  const lines = [];
  lines.push(`# ${project.name}`);
  lines.push('');
  if (options.description) {
    lines.push(options.description);
    lines.push('');
  }

  // Four Questions
  lines.push('## Where it comes from');
  lines.push('');
  lines.push(options.origin || `Domain expertise encoded into ${locked.length} judgment cards through structured interview and human lock.`);
  lines.push('');

  lines.push('## Where it applies');
  lines.push('');
  const appliesWhen = [...new Set(lockedAxioms.flatMap(ax => ax.fields?.applies_when || []))];
  if (appliesWhen.length > 0) {
    appliesWhen.forEach(w => lines.push(`- ${w}`));
  } else {
    lines.push('- As declared in each axiom\'s applies_when field.');
  }
  lines.push('');

  lines.push('## How it is verified');
  lines.push('');
  lines.push(`- ${tests.length} eval cases (${tests.filter(t => t.result).length} rated)`);
  lines.push(`- ${lockedAxioms.length} locked axioms with applies_when / does_not_apply_when / failure_risk`);
  lines.push(`- ${lockedSelfChecks.length} self-check questions`);
  lines.push(`- ${lockedMisunderstandings.length} misunderstanding patterns`);
  lines.push('');

  lines.push('## When it does NOT apply');
  lines.push('');
  const notApply = [...new Set(lockedAxioms.flatMap(ax => ax.fields?.does_not_apply_when || []))];
  if (notApply.length > 0) {
    notApply.forEach(w => lines.push(`- ${w}`));
  }
  const outOfScope = lockedBoundaries.flatMap(b => [b.fields?.out_of_scope || '']).filter(Boolean);
  for (const oos of outOfScope) {
    if (!notApply.includes(oos)) lines.push(`- ${oos}`);
  }
  lines.push('');

  // Top Axioms
  if (lockedAxioms.length > 0) {
    lines.push('## Top Axioms');
    lines.push('');
    lockedAxioms.forEach(ax => {
      lines.push(`- **${ax.fields?.one_sentence || ax.id}**`);
      if (ax.fields?.failure_risk) lines.push(`  - Failure risk: ${ax.fields.failure_risk}`);
    });
    lines.push('');
  }

  // Top Misunderstandings
  if (lockedMisunderstandings.length > 0) {
    lines.push('## Top Misunderstandings');
    lines.push('');
    lockedMisunderstandings.forEach(ms => {
      lines.push(`- WRONG: ${ms.fields?.wrong}`);
      lines.push(`  CORRECT: ${ms.fields?.correct}`);
    });
    lines.push('');
  }

  // Self-checks
  if (lockedSelfChecks.length > 0) {
    lines.push('## Eval Score');
    lines.push('');
    lines.push(`- quality_badge: ${tests.filter(t => t.result === 'with_kdna_better').length >= 5 ? 'tested' : 'untested'}`);
    lines.push(`- eval cases: ${tests.length}`);
    lines.push('');
  }

  // Files
  lines.push('## Files');
  lines.push('');
  const fileCount = 2
    + (cards.filter(c => c.type === 'scenario' && c.locked).length > 0 ? 1 : 0)
    + (cards.filter(c => c.type === 'case' && c.locked).length > 0 ? 1 : 0)
    + (lockedAxioms.length > 0 ? 1 : 0)
    + (cards.filter(c => c.status === 'locked' || c.status === 'tested').length > 0 ? 1 : 0);
  lines.push(`${fileCount} KDNA JSON files + evals/ + demo/`);
  lines.push('');

  return lines.join('\n');
}

module.exports = { compileDomain, compileCore, compilePatterns, compileScenarios, compileCases, compileReasoning, compileEvolution, compileManifest, generateReadme };
