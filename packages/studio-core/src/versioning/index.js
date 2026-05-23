/**
 * Versioning — Judgment-aware version management.
 *
 * KDNA versioning tracks judgment changes, not just text diffs.
 * A version bump is based on:
 *   - PATCH: wording fixes, clarifications (no judgment change)
 *   - MINOR: new axioms, misunderstandings, self-checks added
 *   - MAJOR: axioms removed, domain scope changed, access mode changed
 *
 * Provides:
 *   - Judgment diff between two project snapshots
 *   - Changelog generation from audit logs
 *   - Version bump recommendation
 *   - Semantic version tracking
 */

function diffProjects(oldProject, newProject) {
  const oldCards = oldProject.cards || [];
  const newCards = newProject.cards || [];

  const oldById = new Map(oldCards.map(c => [c.id, c]));
  const newById = new Map(newCards.map(c => [c.id, c]));

  const added = [];
  const removed = [];
  const changed = [];
  const unchanged = [];

  for (const [id, newCard] of newById) {
    if (!oldById.has(id)) {
      added.push({ id, type: newCard.type, one_sentence: newCard.fields?.one_sentence || newCard.fields?.question || '' });
    } else {
      const oldCard = oldById.get(id);
      if (JSON.stringify(oldCard.fields) !== JSON.stringify(newCard.fields)) {
        const fieldChanges = diffFields(oldCard.fields || {}, newCard.fields || {});
        changed.push({ id, type: newCard.type, changes: fieldChanges });
      } else if (oldCard.status !== newCard.status) {
        changed.push({ id, type: newCard.type, status_change: { from: oldCard.status, to: newCard.status } });
      } else {
        unchanged.push(id);
      }
    }
  }

  for (const [id, oldCard] of oldById) {
    if (!newById.has(id)) {
      removed.push({ id, type: oldCard.type, one_sentence: oldCard.fields?.one_sentence || oldCard.fields?.question || '' });
    }
  }

  return {
    added,
    removed,
    changed,
    unchanged: unchanged.length,
    summary: {
      added_count: added.length,
      removed_count: removed.length,
      changed_count: changed.length,
      unchanged_count: unchanged.length,
    },
  };
}

function diffFields(oldFields, newFields) {
  const changes = {};
  for (const key of new Set([...Object.keys(oldFields), ...Object.keys(newFields)])) {
    const oldVal = JSON.stringify(oldFields[key] || null);
    const newVal = JSON.stringify(newFields[key] || null);
    if (oldVal !== newVal) {
      changes[key] = { before: oldFields[key] || null, after: newFields[key] || null };
    }
  }
  return changes;
}

function recommendVersionBump(diff) {
  const { added, removed, changed } = diff;

  // MAJOR: axioms removed or domain structure changed
  const axiomsRemoved = removed.filter(c => c.type === 'axiom').length;
  const misunderstandingsRemoved = removed.filter(c => c.type === 'misunderstanding').length;
  if (axiomsRemoved > 0 || misunderstandingsRemoved > 0) return 'major';

  // MINOR: new axioms, misunderstandings, or field changes on existing cards
  const axiomsAdded = added.filter(c => c.type === 'axiom').length;
  const misunderstandingsAdded = added.filter(c => c.type === 'misunderstanding').length;
  if (axiomsAdded > 0 || misunderstandingsAdded > 0 || changed.length > 0) return 'minor';

  // PATCH: wording-only changes (status changes, new self-checks, new boundaries)
  if (added.length > 0 || changed.length > 0) return 'patch';

  return 'none';
}

function generateChangelog(diff, oldVersion, newVersion, options = {}) {
  const lines = [];
  lines.push(`# ${options.domain || 'domain'} v${newVersion}`);
  lines.push('');
  lines.push(`**Previous:** v${oldVersion}`);
  lines.push(`**Bump:** ${recommendVersionBump(diff).toUpperCase()}`);
  lines.push('');

  if (diff.summary.added_count > 0) {
    lines.push('## Added');
    lines.push('');
    for (const card of diff.added) {
      lines.push(`- **${card.type}** \`${card.id}\`: ${card.one_sentence}`);
    }
    lines.push('');
  }

  if (diff.summary.removed_count > 0) {
    lines.push('## Removed');
    lines.push('');
    for (const card of diff.removed) {
      lines.push(`- **${card.type}** \`${card.id}\`: ${card.one_sentence}`);
    }
    lines.push('');
  }

  if (diff.summary.changed_count > 0) {
    lines.push('## Changed');
    lines.push('');
    for (const card of diff.changed) {
      lines.push(`- **${card.type}** \`${card.id}\``);
      if (card.status_change) {
        lines.push(`  - Status: ${card.status_change.from} → ${card.status_change.to}`);
      }
      if (card.changes && Object.keys(card.changes).length > 0) {
        for (const [field, change] of Object.entries(card.changes)) {
          const before = typeof change.before === 'string' ? change.before.slice(0, 80) : JSON.stringify(change.before).slice(0, 80);
          const after = typeof change.after === 'string' ? change.after.slice(0, 80) : JSON.stringify(change.after).slice(0, 80);
          lines.push(`  - ${field}: "${before}" → "${after}"`);
        }
      }
    }
    lines.push('');
  }

  if (diff.summary.added_count === 0 && diff.summary.removed_count === 0 && diff.summary.changed_count === 0) {
    lines.push('No judgment changes detected.');
    lines.push('');
  }

  return lines.join('\n');
}

function bumpVersion(currentVersion, bumpType) {
  const parts = currentVersion.split('.').map(Number);
  switch (bumpType) {
    case 'major': return `${parts[0] + 1}.0.0`;
    case 'minor': return `${parts[0]}.${parts[1] + 1}.0`;
    case 'patch': return `${parts[0]}.${parts[1]}.${parts[2] + 1}`;
    default: return currentVersion;
  }
}

function markBreakingChange(diff) {
  const axiomsRemoved = diff.removed.filter(c => c.type === 'axiom').length;
  const scopeChanges = diff.changed.filter(c =>
    c.changes && ('applies_when' in c.changes || 'does_not_apply_when' in c.changes)
  ).length;
  return {
    breaking: axiomsRemoved > 0,
    reason: axiomsRemoved > 0
      ? `${axiomsRemoved} axiom(s) removed — breaking change`
      : scopeChanges > 0
        ? `${scopeChanges} scope change(s) — may affect existing agent behavior`
        : null,
    recommended_bump: recommendVersionBump(diff),
  };
}

module.exports = {
  diffProjects,
  recommendVersionBump,
  generateChangelog,
  bumpVersion,
  markBreakingChange,
};
