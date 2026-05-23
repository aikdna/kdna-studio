/**
 * Evidence management.
 *
 * Evidence is raw material (text, files, URLs, chat transcripts) that supports
 * judgment extraction. Evidence proves "here is material" — it does NOT prove
 * "this is judgment."
 */
function addEvidence(project, evidence) {
  project.evidence = project.evidence || [];
  project.evidence.push(evidence);
  project.stages.evidence_room.evidence_count = project.evidence.length;
  return project;
}

function createEvidenceEntry(type, title, content, source) {
  const crypto = require('crypto');
  return {
    id: `ev_${Date.now().toString(36)}`,
    type,
    title,
    content_hash: `sha256:${crypto.createHash('sha256').update(content || '').digest('hex')}`,
    source,
    spans: [],
  };
}

module.exports = { addEvidence, createEvidenceEntry };
