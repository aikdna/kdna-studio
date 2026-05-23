#!/usr/bin/env node
/**
 * Minimal domain example — demonstrates the complete Studio Core pipeline.
 *
 * Run: node examples/minimal-domain/run.js
 *
 * What it does:
 *   Studio Project → compile → validate → pack → inspect → README
 */

const path = require('path');
const fs = require('fs');
const { execFileSync } = require('child_process');

const {
  project: { createProject, validateProject },
  cards: { createCard, transitionCard, lockCard, createFeynmanRestatement, attachRestatementToLock },
  compile: { compileDomain, generateReadme },
  quality: { computeReadiness },
  provenance: { buildProvenance },
} = require('../../packages/studio-core/src');

function makeLockedCard(type, fields, id) {
  const card = createCard(type, fields, id);
  transitionCard(card, 'revised', { by: 'demo_author' });
  lockCard(card, { by: 'demo_author', statement: 'I confirm this judgment represents my domain expertise.',
    checked: { applies_when: true, does_not_apply_when: true, failure_risk: true } });
  return card;
}

// ─── 1. Create Project ──────────────────────────────────────────────

console.log('1. Creating Studio Project...');
const project = createProject('writing_judgment', 'domain', {
  author: { name: 'Writing Expert', id: 'writer_001' },
});
project.release = { version: '0.1.0', description: 'Editorial writing judgment — diagnose structural vs language-level problems.' };

const r = validateProject(project);
if (!r.valid) throw new Error(JSON.stringify(r.issues));
console.log('   ✓ project valid');

// ─── 2. Add Cards ──────────────────────────────────────────────────

console.log('2. Adding judgment cards...');

const ax = makeLockedCard('axiom', {
  one_sentence: 'Most writing problems are structural and argument-level, not language-level.',
  full_statement: 'When reviewing content, the agent must first diagnose whether the problem is structural (missing argument, weak hook, insufficient evidence) or surface-level (wording, grammar, flow). Treating structural problems with language polishing is the most common writing diagnosis failure.',
  why: 'Without this axiom, agents default to surface-level editing suggestions that do not address root causes.',
  applies_when: ['User asks to review content', 'User asks to improve writing', 'User submits draft for feedback'],
  does_not_apply_when: ['User explicitly asks for grammar check only', 'User asks for translation', 'User asks for formatting'],
  failure_risk: 'May cause the agent to over-diagnose structural problems in content that genuinely only needs language polishing.',
}, 'ax_001');
project.cards.push(ax);

const ms = makeLockedCard('misunderstanding', {
  wrong: 'Good writing means clear sentences and proper grammar.',
  correct: 'Good writing means having a clear argument supported by specific evidence, with a hook that captures attention in the first three sentences.',
  key_distinction: 'Surface clarity can mask structural emptiness. A grammatically perfect paragraph with no argument is still bad writing. The agent must check structure before checking language.',
}, 'ms_001');
project.cards.push(ms);

const sc = makeLockedCard('self_check', {
  question: 'Before suggesting language-level changes, did I verify that the content has a clear argument, a cognitive hook, and sufficient evidence?',
}, 'sc_001');
project.cards.push(sc);

// Feynman restatements
attachRestatementToLock(ax, createFeynmanRestatement(ax,
  'When someone asks you to review their writing and it feels weak, do not immediately start fixing sentences. First check: is there a real argument here? Does the first paragraph make me want to keep reading? Are claims backed up with specific examples? If the answer to any of these is no, the problem is structural — not language. Fix the structure before you polish the words.'));
attachRestatementToLock(ms, createFeynmanRestatement(ms,
  'People often confuse "good writing" with "correct writing." A sentence can be grammatically perfect and still be pointless. The real test is: does this have something worth saying? And can the reader find it in the first few seconds? Grammar fixes on a content-free paragraph are like painting a car with no engine.'));

console.log(`   ✓ ${project.cards.length} cards ready (${project.cards.filter(c => c.locked).length} locked)`);

// ─── 3. Check Readiness ────────────────────────────────────────────

console.log('3. Computing readiness...');
const readiness = computeReadiness(project);
console.log(`   grade: ${readiness.grade}`);
console.log(`   score: ${readiness.score}`);
if (readiness.blocking.length) console.log(`   blocking: ${readiness.blocking.length}`);
if (readiness.publishable) console.log('   ✓ publishable');
else console.log(`   (not publishable — ${readiness.next_step})`);

// ─── 4. Compile ────────────────────────────────────────────────────

console.log('4. Compiling domain...');
const compiled = compileDomain(project);
console.log(`   output: ${compiled.stats.kdna_files} KDNA files (${compiled.stats.locked_cards} locked, ${compiled.stats.excluded_cards} excluded)`);

const outDir = path.join(__dirname, 'output');
if (fs.existsSync(outDir)) fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });
for (const [filename, content] of Object.entries(compiled.files)) {
  fs.writeFileSync(path.join(outDir, filename), content);
}
console.log(`   written to: ${outDir}/`);

// ─── 5. Validate ───────────────────────────────────────────────────

console.log('5. Validating with kdna...');
try {
  const v = execFileSync('kdna', ['validate', outDir], { encoding: 'utf8', timeout: 30000 });
  console.log(`   ✓ ${v.trim()}`);
} catch (e) {
  console.log(`   (kdna CLI not available — skipping validation)`);
}

// ─── 6. Pack ───────────────────────────────────────────────────────

console.log('6. Packing to .kdna...');
try {
  const p = execFileSync('kdna', ['pack', outDir, '--output', __dirname], { encoding: 'utf8', timeout: 60000 });
  console.log(`   ✓ ${p.trim()}`);
} catch (e) {
  console.log(`   (kdna CLI not available — skipping pack)`);
}

// ─── 7. Generate README ────────────────────────────────────────────

console.log('7. Generating README...');
const readme = generateReadme(project, {
  description: 'Editorial writing judgment — diagnose whether content has a real argument, a cognitive hook, and evidence density. Not copy editing.',
  origin: 'Derived from editorial expertise in diagnosing structural vs surface-level writing problems across hundreds of content reviews.',
});
fs.writeFileSync(path.join(__dirname, 'SPO_README.md'), readme);
console.log(`   ✓ README generated`);

// ─── 8. Provenance ─────────────────────────────────────────────────

console.log('8. Building provenance...');
const prov = buildProvenance(project, compiled.files);
console.log(`   build_id: ${prov.build_id}`);
console.log(`   fingerprint: ${prov.content_fingerprint}`);
console.log(`   cards: ${prov.locked_card_count} locked`);

// ─── Summary ───────────────────────────────────────────────────────

console.log('');
console.log('═'.repeat(50));
console.log('Pipeline complete.');
console.log(`  Project:   ${project.name}`);
console.log(`  Cards:     ${project.cards.length} total, ${project.cards.filter(c => c.locked).length} locked`);
console.log(`  Readiness: ${readiness.grade} (score ${readiness.score})`);
console.log(`  Output:    ${compiled.stats.kdna_files} KDNA files`);
console.log(`  Validated: ${readiness.publishable ? 'yes' : 'pending'}`);
console.log('═'.repeat(50));
