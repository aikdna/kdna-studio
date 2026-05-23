/**
 * Enhanced Quality Gates — 4-grade readiness scoring with detailed rules.
 *
 * Grades:
 *   draft_grade       — Core+Patterns exist, ≥3 human-reviewed cards
 *   human_controlled  — All core axioms locked, each with applies_when/does_not_apply_when/failure_risk
 *   tested_grade      — ≥5 eval cases, ≥3 comparison tests
 *   publishable_grade — ≥10 evals, README complete, known limitations, kdna verify passes
 */
const contradiction = require('./contradiction');

function computeReadiness(project) {
  const cards = project.cards || [];
  const tests = project.tests || [];
  const locked = cards.filter(c => c.locked);
  const lockedAxioms = locked.filter(c => c.type === 'axiom');
  const lockedSelfChecks = locked.filter(c => c.type === 'self_check');
  const ratedTests = tests.filter(t => t.result);

  const blocking = [];
  const warnings = [];

  // ── Minimum Structure ──────────────────────────────────────────
  if (project.cards.length === 0) {
    blocking.push('Project has no cards');
    return buildResult('draft_grade', blocking, warnings, project);
  }
  if (locked.length === 0) {
    blocking.push('No locked cards — nothing to compile');
    return buildResult('draft_grade', blocking, warnings, project);
  }

  // ── Axiom Checks ──────────────────────────────────────────────
  for (const ax of lockedAxioms) {
    if (!ax.fields?.one_sentence || ax.fields.one_sentence.length < 10) {
      blocking.push(`${ax.id}: one_sentence too short or missing`);
    }
    if (!ax.fields?.full_statement || ax.fields.full_statement.length < 30) {
      warnings.push(`${ax.id}: full_statement too short — may be vague`);
    }
    if (!ax.fields?.why || ax.fields.why.length < 10) {
      warnings.push(`${ax.id}: missing "why" — explains what the agent gets wrong without this`);
    }
    if (!ax.fields?.applies_when || ax.fields.applies_when.length === 0) {
      blocking.push(`${ax.id}: missing applies_when`);
    }
    if (!ax.fields?.does_not_apply_when || ax.fields.does_not_apply_when.length === 0) {
      blocking.push(`${ax.id}: missing does_not_apply_when`);
    }
    if (!ax.fields?.failure_risk) {
      blocking.push(`${ax.id}: missing failure_risk`);
    }
    if (!ax.human_lock) {
      blocking.push(`${ax.id}: not locked — must be locked before compile`);
    }
    if (!ax.feynman_restatement) {
      warnings.push(`${ax.id}: missing Feynman restatement`);
    }
  }

  // ── Self-check Checks ──────────────────────────────────────────
  for (const sc of lockedSelfChecks) {
    const q = sc.fields?.question || '';
    if (!q.endsWith('?')) {
      blocking.push(`${sc.id}: self_check must be a question ending with ?`);
    }
    if (q.length < 15) {
      warnings.push(`${sc.id}: self_check question too short — may be too vague`);
    }
    if (/\b(is this good|is this correct|is this helpful|is this clear|good enough)\b/i.test(q)) {
      warnings.push(`${sc.id}: self_check is generic — should be domain-specific`);
    }
  }

  // ── Misunderstanding Checks ────────────────────────────────────
  const lockedMisunderstandings = locked.filter(c => c.type === 'misunderstanding');
  for (const ms of lockedMisunderstandings) {
    if (!ms.fields?.key_distinction || ms.fields.key_distinction.length < 20) {
      blocking.push(`${ms.id}: key_distinction missing or too short`);
    }
    if (!ms.fields?.wrong || ms.fields.wrong.length < 10) {
      warnings.push(`${ms.id}: wrong belief very short — may be a straw man`);
    }
    if (!ms.fields?.correct || ms.fields.correct.length < 10) {
      warnings.push(`${ms.id}: correct belief very short`);
    }
  }

  // ── Boundary Checks ────────────────────────────────────────────
  const lockedBoundaries = locked.filter(c => c.type === 'boundary');
  for (const bd of lockedBoundaries) {
    if (bd.fields?.acceptable_exceptions && bd.fields.acceptable_exceptions.length === 0) {
      warnings.push(`${bd.id}: no acceptable_exceptions — every boundary has justified exceptions`);
    }
  }

  // ── Contradiction Check ────────────────────────────────────────
  const contradictions = contradiction.detectContradictions(cards);
  for (const c of contradictions) {
    if (c.severity === 'blocking') blocking.push(c.message);
    else warnings.push(c.message);
  }

  // ── Test Count Checks ──────────────────────────────────────────
  if (ratedTests.length === 0 && locked.length >= 3) {
    warnings.push('No rated tests — domain may not actually change agent behavior');
  }
  if (ratedTests.length < 3 && ratedTests.length > 0) {
    warnings.push(`Only ${ratedTests.length} rated tests — recommend at least 3 for confidence`);
  }

  // ── Determine Grade ────────────────────────────────────────────
  const axiomsComplete = lockedAxioms.length >= 1 &&
    lockedAxioms.every(ax =>
      ax.fields?.applies_when?.length &&
      ax.fields?.does_not_apply_when?.length &&
      ax.fields?.failure_risk &&
      ax.human_lock
    );

  const boundariesComplete = lockedBoundaries.length === 0 ||
    lockedBoundaries.every(b => b.fields?.scope && b.fields?.out_of_scope);

  let grade = 'draft_grade';
  if (locked.length >= 3 && axiomsComplete) {
    grade = 'human_controlled';
  }
  if (grade === 'human_controlled' && ratedTests.length >= 5 && lockedSelfChecks.length >= 3 && boundariesComplete) {
    grade = 'tested_grade';
  }
  if (grade === 'tested_grade' &&
      ratedTests.length >= 10 &&
      lockedAxioms.length >= 3 &&
      lockedSelfChecks.length >= 5 &&
      blocking.length === 0) {
    grade = 'publishable_grade';
  }

  return buildResult(grade, blocking, warnings, project);
}

function buildResult(grade, blocking, warnings, project) {
  const lockedCount = (project.cards || []).filter(c => c.locked).length;
  const ratedTests = (project.tests || []).filter(t => t.result).length;

  return {
    grade,
    publishable: grade === 'publishable_grade' && blocking.length === 0,
    blocking,
    warnings,
    score: Math.max(0, 100 - blocking.length * 15 - warnings.length * 3),
    stats: {
      total_cards: (project.cards || []).length,
      locked_cards: lockedCount,
      locked_axioms: (project.cards || []).filter(c => c.type === 'axiom' && c.locked).length,
      locked_self_checks: (project.cards || []).filter(c => c.type === 'self_check' && c.locked).length,
      total_tests: (project.tests || []).length,
      rated_tests: ratedTests,
    },
    next_step: grade === 'draft_grade'
      ? 'Lock at least 3 axioms with applies_when, does_not_apply_when, and failure_risk.'
      : grade === 'human_controlled'
        ? 'Add 5+ eval cases and run kdna compare to reach tested grade.'
        : grade === 'tested_grade'
          ? 'Add 10+ evals, 3+ axioms, 5+ self-checks, and pass kdna verify --judgment to reach publishable.'
          : 'Ready to publish. Run kdna pack and kdna publish.',
  };
}

function getBlockingIssues(project) {
  const result = computeReadiness(project);
  return result.blocking;
}

module.exports = { computeReadiness, getBlockingIssues };
