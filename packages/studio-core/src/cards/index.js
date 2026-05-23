/**
 * Judgment Card state machine and lifecycle.
 *
 * Responsibilities:
 *   - Card CRUD operations
 *   - State machine enforcement (Draft → Revised → Locked → Tested → Published → Deprecated)
 *   - Human Lock protocol
 *   - Feynman Restatement
 *   - Audit trail management
 */

const VALID_STATES = ['draft', 'revised', 'locked', 'tested', 'published', 'deprecated'];
const CARD_TYPES = ['axiom', 'ontology', 'misunderstanding', 'boundary', 'self_check', 'risk', 'aesthetic', 'scenario', 'case'];

const TRANSITIONS = {
  draft: ['revised', 'deprecated'],
  revised: ['locked', 'draft', 'deprecated'],
  locked: ['tested', 'revised', 'deprecated'],
  tested: ['published', 'locked', 'deprecated'],
  published: ['deprecated'],
  deprecated: [],
};

function createCard(type, fields = {}, id = null) {
  if (!CARD_TYPES.includes(type)) throw new Error(`Invalid card type: ${type}`);
  const card = {
    id: id || `${type.slice(0, 2)}_${Date.now().toString(36)}`,
    type,
    status: 'draft',
    locked: false,
    fields,
    evidence_refs: [],
    test_refs: [],
    human_lock: null,
    feynman_restatement: null,
    audit_log: [
      { at: new Date().toISOString(), event: 'created', by: 'ai' }
    ],
  };
  return card;
}

function transitionCard(card, toState, transitionContext = {}) {
  if (!VALID_STATES.includes(toState)) throw new Error(`Invalid state: ${toState}`);
  if (!TRANSITIONS[card.status].includes(toState)) {
    throw new Error(`Invalid transition: ${card.status} → ${toState}`);
  }
  const from = card.status;
  card.status = toState;
  card.locked = ['locked', 'tested', 'published'].includes(toState);
  card.audit_log.push({
    at: new Date().toISOString(),
    event: toState,
    by: transitionContext.by || 'system',
    ...(transitionContext.reason && { reason: transitionContext.reason }),
  });
  return card;
}

function lockCard(card, lockPayload) {
  if (!lockPayload.by) throw new Error('lockPayload.by is required');
  if (!lockPayload.statement) throw new Error('lockPayload.statement is required (expert confirmation in own words)');
  if (!lockPayload.checked?.applies_when) throw new Error('Must confirm applies_when reviewed');
  if (!lockPayload.checked?.does_not_apply_when) throw new Error('Must confirm does_not_apply_when reviewed');
  if (!lockPayload.checked?.failure_risk) throw new Error('Must confirm failure_risk reviewed');

  card.human_lock = {
    by: lockPayload.by,
    at: new Date().toISOString(),
    statement: lockPayload.statement,
    checked: lockPayload.checked,
  };

  return transitionCard(card, 'locked', { by: lockPayload.by });
}

function unlockCard(card, reason, by) {
  if (!reason) throw new Error('Unlock requires a reason');
  card.human_lock = null;
  return transitionCard(card, 'revised', {
    by,
    reason: `unlocked: ${reason}`,
  });
}

function getLockedCards(project) {
  return project.cards.filter(c => ['locked', 'tested', 'published'].includes(c.status));
}

function getPublishableCards(project) {
  return project.cards.filter(c => c.status === 'tested' || c.status === 'locked');
}

module.exports = {
  CARD_TYPES,
  VALID_STATES,
  TRANSITIONS,
  createCard,
  transitionCard,
  lockCard,
  unlockCard,
  getLockedCards,
  getPublishableCards,
  // Feynman restatement (re-exported from feynman.js)
  createFeynmanRestatement: require('./feynman').createFeynmanRestatement,
  evaluateRestatementQuality: require('./feynman').evaluateRestatementQuality,
  attachRestatementToLock: require('./feynman').attachRestatementToLock,
  validateRestatementCard: require('./feynman').validateRestatementCard,
};
