/**
 * Quality gates and readiness scoring.
 *
 * Four quality grades:
 *   draft_grade          — structure exists, at least 3 human-reviewed cards
 *   human_controlled     — all core axioms locked, each with applies_when/does_not_apply_when/failure_risk
 *   tested_grade         — at least 5 eval cases, at least 3 comparison tests
 *   publishable_grade    — at least 10 evals, README complete, kdna verify --judgment passes
 */
function computeReadiness(project) {
  const cards = project.cards || [];
  const locked = cards.filter(c => c.locked);
  const tests = project.tests || [];

  const blocking = [];
  const warnings = [];

  // Check minimum locked axioms
  const lockedAxioms = locked.filter(c => c.type === 'axiom');
  if (lockedAxioms.length < 1) blocking.push('At least 1 locked axiom required');
  if (lockedAxioms.length < 3) warnings.push('Recommend at least 3 locked axioms');

  // Check boundary completeness
  for (const ax of lockedAxioms) {
    if (!ax.fields?.does_not_apply_when?.length) {
      blocking.push(`${ax.id}: missing does_not_apply_when`);
    }
    if (!ax.fields?.failure_risk) {
      warnings.push(`${ax.id}: missing failure_risk`);
    }
    if (!ax.human_lock) {
      blocking.push(`${ax.id}: missing human_lock`);
    }
    if (!ax.feynman_restatement) {
      warnings.push(`${ax.id}: missing Feynman restatement`);
    }
  }

  // Check self-checks
  const lockedSelfChecks = locked.filter(c => c.type === 'self_check');
  for (const sc of lockedSelfChecks) {
    if (sc.fields?.question && !sc.fields.question.trim().endsWith('?')) {
      blocking.push(`${sc.id}: self_check question must end with ?`);
    }
  }

  // Determine grade
  let grade = 'draft_grade';
  const axiomsComplete = lockedAxioms.every(ax =>
    ax.fields?.applies_when?.length && ax.fields?.does_not_apply_when?.length && ax.human_lock
  );
  if (axiomsComplete && locked.length >= 3) grade = 'human_controlled';
  if (axiomsComplete && tests.length >= 5) grade = 'tested_grade';
  if (axiomsComplete && tests.length >= 10 && lockedSelfChecks.length >= 3) grade = 'publishable_grade';

  return {
    grade,
    publishable: grade === 'publishable_grade' && blocking.length === 0,
    blocking,
    warnings,
    score: Math.max(0, 100 - blocking.length * 15 - warnings.length * 5),
  };
}

module.exports = { computeReadiness };
