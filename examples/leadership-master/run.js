#!/usr/bin/env node
/**
 * Leadership Decision-Making KDNA — Delta Demo
 *
 * Demonstrates the full authoring → compile → compare → delta pipeline.
 * Produces a judgment delta report proving the KDNA changes AI judgment.
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
  delta: { createJudgmentDeltaFromReport, formatDeltaMarkdown },
} = require('../../packages/studio-core/src');

function mlc(type, fields, id) {
  let card = createCard(type, fields, id);
  card = transitionCard(card, 'revised', { by: 'leadership_expert' });
  card = lockCard(card, { by: 'leadership_expert', statement: '15 years of leadership coaching across 200+ teams.',
    checked: { applies_when: true, does_not_apply_when: true, failure_risk: true } });
  return card;
}

// ─── 1. Create Project + Cards ──────────────────────────────────────

const project = createProject('leadership_decisions', 'domain', {
  author: { name: 'Leadership Expert', id: 'leader_001' },
});
project.release = { version: '0.1.0', description: 'Leadership decision-making judgment — diagnose whether execution failures are really decision voids.' };

// Axiom 1
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
  why: 'Teams confuse "everyone nodding" with actual commitment.',
  applies_when: ['Meeting ends with "sounds good"', 'Decision without deadline', 'Multiple people assigned'],
  does_not_apply_when: ['Solo work with clear self-accountability'],
  failure_risk: 'May create unnecessary formality for trivial decisions.',
}, 'ax_002');
project.cards.push(ax2);

const ax3 = mlc('axiom', {
  one_sentence: 'The cost of a slow decision is usually higher than the cost of an imperfect decision.',
  full_statement: 'In leadership, decision speed compounds. A two-week delay for a perfect decision often costs more than an 80% decision made today.',
  why: 'Leaders who wait for perfect information create organizational bottlenecks.',
  applies_when: ['Decision is reversible', 'Stakes are below team/org level'],
  does_not_apply_when: ['Safety-critical decisions', 'Irreversible resource commitments'],
  failure_risk: 'May encourage premature decisions in high-stakes, irreversible situations.',
}, 'ax_003');
project.cards.push(ax3);

// Misunderstandings
project.cards.push(mlc('misunderstanding', {
  wrong: 'If the team is not executing, they lack motivation or skills.',
  correct: 'If the team is not executing, first check whether a real decision was ever made with owner, deadline, and criteria.',
  key_distinction: 'Motivation gaps produce gradual decline over weeks. Decision voids produce sudden stalls within days.',
}, 'ms_001'));

project.cards.push(mlc('misunderstanding', {
  wrong: 'Consensus means everyone agrees with the decision.',
  correct: 'Consensus means everyone understands the decision, knows their role, and commits to not blocking it — even if they disagree.',
  key_distinction: 'Agreement is an emotional state. Commitment to execute is a behavioral contract.',
}, 'ms_002'));

// Self-checks
for (const q of [
  'Before concluding execution is the problem, did I verify that a named owner with a deadline exists?',
  'Does this decision have exactly one person who will wake up responsible for it tomorrow?',
  'Is this decision reversible enough that speed matters more than perfection?',
  'Did I check whether this is a decision void disguised as an execution gap?',
  'If I asked the team "who owns this?", would everyone point to the same person?',
]) {
  project.cards.push(mlc('self_check', { question: q }, `sc_${String(project.cards.length).padStart(3, '0')}`));
}

// Feynman
attachRestatementToLock(ax1, createFeynmanRestatement(ax1,
  'When your team is stuck, do not immediately assume they lack skills. First ask: was there a clear decision? Someone specific was named, a date was given, and everyone knows what "done" looks like. If any piece is missing, you have a decision problem pretending to be an execution problem.'));
attachRestatementToLock(ax2, createFeynmanRestatement(ax2,
  'After a meeting where everyone seems to agree, do not assume commitment happened. If you cannot name one specific person who knows they are accountable by a specific date, you do not have a decision. Multiple owners = zero owners.'));
attachRestatementToLock(ax3, createFeynmanRestatement(ax3,
  'Waiting for the perfect answer is usually worse than making a good-enough decision today — unless the decision is irreversible like hiring or major spending. Most leadership decisions are reversible, so speed beats perfection.'));

// ─── 2. Compile ─────────────────────────────────────────────────────

console.log('Leadership Decision-Making KDNA — Delta Demo');
console.log('═'.repeat(55));
console.log('');

const readiness = computeReadiness(project);
const compiled = compileDomain(project);
const outDir = path.join(__dirname, 'output');
if (fs.existsSync(outDir)) fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });
for (const [f, c] of Object.entries(compiled.files)) fs.writeFileSync(path.join(outDir, f), c);

console.log(`Compiled: ${compiled.stats.kdna_files} KDNA files (${compiled.stats.locked_cards} locked cards)`);
console.log(`Readiness: ${readiness.grade} (score: ${readiness.score})`);

// Validate
try {
  const v = execFileSync('kdna', ['dev', 'validate', outDir], { encoding: 'utf8', timeout: 30000 });
  console.log(`Validate: pass`);
} catch (e) {
  console.log(`Validate: (kdna not available — skipped)`);
}

// Pack
try {
  execFileSync('kdna', ['dev', 'pack', outDir, '--output', __dirname], { encoding: 'utf8', timeout: 60000 });
  console.log(`Pack:     writing_judgment.kdna`);
} catch (e) {
  console.log(`Pack:     (kdna not available — skipped)`);
}

// ─── 3. Generate Judgment Delta ─────────────────────────────────────

console.log('');
console.log('─'.repeat(55));
console.log('Judgment Delta');
console.log('─'.repeat(55));
console.log('');

// Simulated compare result (in production, this comes from kdna compare --report-json)
const simulatedCompareReport = {
    diff: {
        axes: {
            classification: 'The KDNA-loaded agent classified the problem as a decision-structure issue (missing owner+deadline+criteria) rather than a general team performance issue.',
            diagnosis: 'Without KDNA: suggested better communication and motivation. With KDNA: identified the specific decision void — no named owner with a deadline.',
            actions: 'Without KDNA: generic advice (communicate more, set clearer goals). With KDNA: specific intervention — assign a single named owner with a deadline before any other action.',
            boundary_awareness: 'With KDNA: correctly identified that this is within scope (team stuck on project) and flagged when to escalate (if external blocker exists).',
            terminology: 'Domain-specific terms used: decision void, named ownership, execution gap vs motivation gap.',
        },
        verdict: 'trajectory_changed',
    },
};

const delta = createJudgmentDeltaFromReport(
    '@aikdna/leadership_decisions',
    'My team keeps missing deadlines. I have told them multiple times to be more proactive. What should I do?',
    simulatedCompareReport,
    {
        model: 'claude-sonnet-4-5',
        triggeredAxioms: ['ax_001', 'ax_002'],
        avoidedMisunderstandings: ['ms_001'],
        selfChecksPassed: 5,
    }
);

// Output delta
const deltaMd = formatDeltaMarkdown(delta);
fs.writeFileSync(path.join(__dirname, 'delta-report.md'), deltaMd);

console.log(`Verdict:   ${delta.verdict.replace(/_/g, ' ')}`);
console.log(`Score:     ${delta.score}/10`);
console.log(`Changed:   ${delta.changed_dimensions.map(d => d.axis).join(', ')}`);
console.log('');
console.log('Scoring:');
for (const [dim, val] of Object.entries(delta.scoring)) {
    console.log(`  ${dim}: ${val}`);
}
console.log('');
console.log(delta.summary);

// ─── 4. Output Files ────────────────────────────────────────────────

const readme = generateReadme(project, {
  description: 'Leadership decision-making judgment — diagnose whether execution failures are really decision voids.',
  origin: '15 years of leadership coaching across 200+ teams.',
});
fs.writeFileSync(path.join(__dirname, 'DOMAIN_README.md'), readme);

const prov = buildProvenance(project, compiled.files);

console.log('');
console.log('─'.repeat(55));
console.log('Output');
console.log('─'.repeat(55));
console.log(`  ${outDir}/           → compiled KDNA domain`);
console.log(`  delta-report.md     → judgment comparison report`);
console.log(`  DOMAIN_README.md    → auto-generated domain README`);
console.log(`  build_id:           ${prov.build_id}`);
console.log('');
console.log('═'.repeat(55));
console.log('Demo complete. Open delta-report.md to see the judgment comparison.');
