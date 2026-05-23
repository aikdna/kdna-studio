# Human Lock

Human Lock is the mechanism that guarantees judgment ownership in KDNA. It is not a checkbox. It is a deliberate, auditable, per-card confirmation that the human expert stands behind a specific judgment.

## Why Human Lock Exists

Without Human Lock:

- AI-generated axioms could enter a domain without review
- Experts could "agree" without truly understanding the encoded judgment
- There would be no audit trail of who confirmed what and when
- Locked cards could be silently modified later

With Human Lock:

- Every card in a compiled domain has a traceable author
- The expert must restate the judgment in their own words (Feynman)
- Modifications require explicit unlock with justification
- The audit trail is immutable

## Lock Requirements

To lock a card, the following MUST be present:

```json
{
  "human_lock": {
    "by": "author_id",
    "at": "2026-05-23T10:00:00Z",
    "statement": "I confirm this judgment represents my expert understanding of this domain.",
    "checked": {
      "applies_when": true,
      "does_not_apply_when": true,
      "failure_risk": true
    }
  }
}
```

### Required Fields

| Field | Description |
|-------|-------------|
| `by` | Author identifier (matches `author.id` in kdna.json) |
| `at` | ISO 8601 timestamp of lock event |
| `statement` | Expert's own words confirming this judgment is theirs |
| `checked.applies_when` | Expert confirms they reviewed the applicability conditions |
| `checked.does_not_apply_when` | Expert confirms they reviewed the exclusion conditions |
| `checked.failure_risk` | Expert confirms they reviewed what could go wrong |

## Feynman Restatement

The Feynman Restatement is a verification step: the expert explains the judgment in simple terms a non-expert would understand. This proves understanding, not just agreement.

```json
{
  "feynman_restatement": {
    "text": "This axiom says: when someone says the price is too high, don't immediately offer a discount. First figure out which kind of uncertainty is actually blocking them.",
    "evaluated_at": "2026-05-23T10:05:00Z",
    "score": {
      "not_just_repeat": true,
      "not_too_abstract": true,
      "has_concrete_example": true,
      "clarifies_boundary": true,
      "ordinary_person_understands": true
    }
  }
}
```

### Evaluation Criteria

| Criterion | Question |
|-----------|----------|
| Not just repeat | Is this different from the original text, or just paraphrased? |
| Not too abstract | Does it contain a concrete example or scenario? |
| Has concrete example | Can the reader picture a specific situation? |
| Clarifies boundary | Does it explain when the axiom does NOT apply? |
| Ordinary person understands | Could a non-expert understand this? |

## Lock Rules

1. **Per-card locking only** — There is no "Lock All" operation
2. **Locked cards cannot be modified by AI** — Any AI-proposed change to a locked card is rejected
3. **Unlock requires justification** — The `unlock_reason` is recorded in the audit log
4. **Locked cards enter compilation** — Only locked cards are included in compiled KDNA output
5. **Published cards are immutable** — Once published in a release, cards cannot be modified (only deprecated)

## Lock State Machine

```
Draft ──(revise)──► Revised ──(lock)──► Locked ──(test)──► Tested ──(publish)──► Published
  │                    │                   │                  │                      │
  └──(discard)──► X    │                   │                  │                      │
                       └──(discard)──► X   │                  │                      │
                                           └──(unlock)──► Revised                  │
                                              (reason required)                     │
                                                                                    │
                                           Deprecated ◄──(deprecate)── Published ──┘
```

## Audit Trail

Every card maintains an immutable audit log:

```json
{
  "audit_log": [
    { "at": "2026-05-23T09:00:00Z", "event": "created", "by": "ai" },
    { "at": "2026-05-23T09:30:00Z", "event": "revised", "by": "author_id", "changes": ["one_sentence", "applies_when"] },
    { "at": "2026-05-23T10:00:00Z", "event": "locked", "by": "author_id", "lock_statement": "..." },
    { "at": "2026-05-23T11:00:00Z", "event": "tested", "by": "system", "test_id": "test_001" },
    { "at": "2026-05-23T12:00:00Z", "event": "published", "by": "author_id", "version": "0.1.0" }
  ]
}
```

## Implementation in Studio Core

```js
// Studio Core exports:
const {
  requestHumanLock,     // Validate lock payload
  applyHumanLock,       // Apply lock to card
  unlockCard,           // Unlock with reason
  createFeynmanRestatement,  // Create Feynman entry
  evaluateRestatement,  // Score the restatement
  getLockAuditTrail,    // Return immutable audit log
} = require('@aikdna/studio-core');
```
