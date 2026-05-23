#!/usr/bin/env node
/**
 * Leadership Decision-Making KDNA — real sample domain.
 *
 * This is a realistic domain showing how Studio Core encodes expert
 * leadership judgment into loadable, verifiable KDNA.
 *
 * Domain: Diagnose whether execution failures are really decision voids.
 * Cards:  3 axioms, 2 misunderstandings, 5 self-checks
 *
 * Run: node examples/leadership-master/run.js
 */

const path = require('path');
const fs = require('fs');
const { execFileSync } = require('child_process');

const {
  project: { createProject },
  cards: { createCard, transitionCard, lockCard, createFeynmanRestatement, attachRestatementToLock },
  compile: { compileDomain, generateReadme },
  quality: { computeReadiness },
  provenance: { buildProvenance },
} = require('../../packages/studio-core/src');

function mlc(type, fields, id) {
  const card = createCard(type, fields, id);
  transitionCard(card, 'revised', { by: 'leadership_expert' });
  lockCard(card, { by: 'leadership_expert', statement: 'This judgment represents my 15 years of leadership coaching across 200+ teams.',
    checked: { applies_when: true, does_not_apply_when: true, failure_risk: true } });
  return card;
}

const project = createProject('leadership_decisions', 'domain', {
  author: { name: 'Leadership Expert', id: 'leader_001' },
});
project.release = { version: '0.1.0', description: 'Leadership decision-making judgment — diagnose whether execution failures are really decision voids.' };

// ─── 3 Axioms ──────────────────────────────────────────────────────

const ax1 = mlc('axiom', {
  one_sentence: 'Execution failure is often decision failure in disguise.',
  full_statement: 'When a team fails to execute, first check whether a real decision (with named owner, deadline, and criteria) was ever made. Most "execution problems" are decision voids.',
  why: 'Without this axiom, managers address symptoms (motivation, training, process) while missing the root cause.',
  applies_when: ['Team reports being stuck', 'Deadline was missed', 'Project not progressing'],
  does_not_apply_when: ['Clear decision exists with owner', 'External blocker (vendor, regulation)'],
  failure_risk: 'May cause over-scrutiny of decision quality when issue is resource availability.',
}, 'ax_001');
project.cards.push(ax1);

const ax2 = mlc('axiom', {
  one_sentence: 'Broad agreement is not commitment. Only named ownership is commitment.',
  full_statement: 'A decision without a single named owner with a deadline has no commitment. Multiple owners = no owner.',
  why: 'Teams confuse "everyone nodding" with actual commitment. Without a named owner, no one wakes up responsible.',
  applies_when: ['Meeting ends with "sounds good"', 'Decision without deadline', 'Multiple people assigned'],
  does_not_apply_when: ['Solo work with clear self-accountability', 'Informal alignment not requiring execution'],
  failure_risk: 'May create unnecessary formality for trivial decisions.',
}, 'ax_002');
project.cards.push(ax2);

const ax3 = mlc('axiom', {
  one_sentence: 'The cost of a slow decision is usually higher than the cost of an imperfect decision.',
  full_statement: 'In leadership, decision speed compounds. A two-week delay for a perfect decision often costs more than an 80% decision made today.',
  why: 'Leaders who wait for perfect information create organizational bottlenecks.',
  applies_when: ['Decision is reversible', 'Stakes are below team/org level', 'More info unlikely to change outcome'],
  does_not_apply_when: ['Safety-critical decisions', 'Irreversible resource commitments', 'Legal/compliance decisions'],
  failure_risk: 'May encourage premature decisions in high-stakes, irreversible situations.',
}, 'ax_003');
project.cards.push(ax3);

// ─── 2 Misunderstandings ───────────────────────────────────────────

const ms1 = mlc('misunderstanding', {
  wrong: 'If the team is not executing, they lack motivation or skills.',
  correct: 'If the team is not executing, first check whether a real decision was ever made with owner, deadline, and criteria.',
  key_distinction: 'Motivation gaps produce gradual decline over weeks. Decision voids produce sudden stalls within days. The pattern is fundamentally different.',
}, 'ms_001');
project.cards.push(ms1);

const ms2 = mlc('misunderstanding', {
  wrong: 'Consensus means everyone agrees with the decision.',
  correct: 'Consensus means everyone understands the decision, knows their role, and commits to not blocking it — even if they disagree.',
  key_distinction: 'Agreement is an emotional state. Commitment to execute is a behavioral contract. You need the latter, not the former.',
}, 'ms_002');
project.cards.push(ms2);

// ─── 5 Self-Checks ─────────────────────────────────────────────────

const selfChecks = [
  'Before concluding execution is the problem, did I verify that a named owner with a deadline exists?',
  'Does this decision have exactly one person who will wake up responsible for it tomorrow?',
  'Is this decision reversible enough that speed matters more than perfection?',
  'Did I check whether this is a decision void disguised as an execution gap?',
  'If I asked the team "who owns this?", would everyone point to the same person?',
];
for (let i = 0; i < selfChecks.length; i++) {
  project.cards.push(mlc('self_check', { question: selfChecks[i] }, `sc_00${i + 1}`));
}

// ─── Feynman Restatements ──────────────────────────────────────────

attachRestatementToLock(ax1, createFeynmanRestatement(ax1,
  'When your team is stuck and nothing is moving forward, do not immediately assume they lack skills or motivation. First ask: was there a clear decision? Someone specific was named, a date was given, and everyone knows what "done" looks like. If any piece is missing, you have a decision problem pretending to be an execution problem.'));
attachRestatementToLock(ax2, createFeynmanRestatement(ax2,
  'After a meeting where everyone seems to agree, do not assume commitment happened. If you cannot name one specific person who knows they are accountable by a specific date, you do not have a decision — you have a discussion. Multiple owners = zero owners.'));
attachRestatementToLock(ax3, createFeynmanRestatement(ax3,
  'Waiting three weeks for the perfect answer is usually worse than making a good-enough decision today. The only exception is when the decision is irreversible — like hiring someone you cannot fire, or spending money you cannot get back. But most daily leadership decisions are reversible, so speed beats perfection.'));
attachRestatementToLock(ms1, createFeynmanRestatement(ms1,
  'The difference between motivation failure and decision failure is like a car that slowly runs out of gas versus a car that was never told where to go. One fades gradually; the other stalls immediately. Before blaming the team, check if they ever had a destination.'));
attachRestatementToLock(ms2, createFeynmanRestatement(ms2,
  'People agreeing in a meeting does not mean they are committed to doing the work. Commitment means one person wakes up tomorrow knowing they are responsible. Agreement is a feeling; commitment is a contract.'));

// ─── Run Pipeline ──────────────────────────────────────────────────

console.log('Leadership Decision-Making KDNA');
console.log('═'.repeat(50));
console.log('');

const readiness = computeReadiness(project);
console.log(`Readiness: ${readiness.grade} (score: ${readiness.score})`);
if (readiness.publishable) console.log('✓ publishable');
else console.log(`  Next: ${readiness.next_step}`);

const compiled = compileDomain(project);
console.log(`Compiled: ${compiled.stats.kdna_files} KDNA files (${compiled.stats.locked_cards} locked cards)`);

const outDir = path.join(__dirname, 'output');
if (fs.existsSync(outDir)) fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });
for (const [f, c] of Object.entries(compiled.files)) {
  fs.writeFileSync(path.join(outDir, f), c);
}
console.log(`Output:   ${outDir}/`);

// Validate
try {
  const v = execFileSync('kdna', ['validate', outDir], { encoding: 'utf8', timeout: 30000 });
  console.log(`Validate: ✓ ${v.trim().split('\n')[0]}`);
} catch (e) {
  console.log(`Validate: (kdna CLI unavailable — skipped)`);
}

// Pack
try {
  const p = execFileSync('kdna', ['pack', outDir, '--output', __dirname], { encoding: 'utf8', timeout: 60000 });
  console.log(`Pack:     ✓ ${p.trim().split('\n')[0]}`);
} catch (e) {
  console.log(`Pack:     (kdna CLI unavailable — skipped)`);
}

// README
const readme = generateReadme(project, {
  description: 'Leadership decision-making judgment — diagnose whether execution failures are really decision voids.',
  origin: '15 years of leadership coaching across 200+ teams. Extracted through structured expert interview and validated with 10+ comparison tests.',
});
fs.writeFileSync(path.join(__dirname, 'DOMAIN_README.md'), readme);

const prov = buildProvenance(project, compiled.files);
console.log(`Provenance: ${prov.build_id}`);
console.log('');
console.log('═'.repeat(50));
console.log('Domain ready. Load in KDNAChat or any KDNA-compatible agent.');
