# Judgment Card State Machine

Every judgment card in KDNA Studio follows a strict state machine. States are enforced at the Core level — no UI can bypass them.

## State Definitions

| State | Meaning | Who Can Transition |
|-------|---------|-------------------|
| **Draft** | AI-proposed or template-initialized. Not yet reviewed by human. | AI or human |
| **Revised** | Human has edited the card content. | Human only |
| **Locked** | Human has explicitly confirmed this judgment is theirs. Locked cards enter compilation. | Human only |
| **Tested** | At least one eval case is linked to this card. | System (after test run) |
| **Published** | Card is included in a released version. | System (on release) |
| **Deprecated** | Card is retired but kept for audit history. | Human |

## Valid Transitions

```
         ┌──────────┐
         │  Draft   │  ← AI proposes, template scaffolds
         └────┬─────┘
              │ revise (human edits fields)
              ▼
         ┌──────────┐
    ┌───│ Revised  │◄──────────────────────┐
    │   └────┬─────┘                       │
    │        │ lock (human confirms)        │ unlock (reason required)
    │        ▼                              │
    │   ┌──────────┐                       │
    │   │  Locked  │───────────────────────┘
    │   └────┬─────┘
    │        │ test (eval case linked)
    │        ▼
    │   ┌──────────┐
    │   │  Tested  │
    │   └────┬─────┘
    │        │ publish (included in release)
    │        ▼
    │   ┌──────────┐
    │   │Published │
    │   └────┬─────┘
    │        │ deprecate (retired)
    │        ▼
    │   ┌──────────┐
    │   │Deprecated│
    │   └──────────┘
    │
    └── (discard from Draft or Revised)
```

## Forbidden Transitions

These transitions are ALWAYS rejected:

| From | To | Why Rejected |
|------|----|-------------|
| Draft | Locked | Must be revised by human first |
| Draft | Tested | Cannot test unreviewed judgment |
| Draft | Published | Cannot publish unreviewed judgment |
| Locked | Draft | Locked cards cannot be downgraded to draft (unlock → Revised instead) |
| Published | Draft | Published cards are immutable |
| Published | Revised | Published cards are immutable (deprecate instead) |
| Any | Locked | Locking requires human_lock payload |
| Any | Published | Publishing is a system action on release |

## Card Data Structure

```json
{
  "id": "card_ax001",
  "type": "axiom",
  "status": "locked",
  "fields": {
    "one_sentence": "Price objections are certainty deficits, not price problems.",
    "full_statement": "When a buyer says 'too expensive', the agent must first diagnose which of four uncertainties is blocking the decision...",
    "why": "Without this axiom, agents default to offering discounts, which lowers price without resolving uncertainty.",
    "applies_when": ["User reports price objection", "Buyer hesitates on cost"],
    "does_not_apply_when": ["User explicitly requests discount comparison", "Budget is genuinely fixed"],
    "failure_risk": "Misapplying this axiom can make the agent seem evasive when a direct price question is asked."
  },
  "evidence_refs": ["ev_001", "ev_003"],
  "test_refs": ["test_001"],
  "human_lock": {
    "by": "author_id",
    "at": "2026-05-23T10:00:00Z",
    "statement": "I've seen this pattern for 15 years. Price objections hide uncertainty 90% of the time.",
    "checked": { "applies_when": true, "does_not_apply_when": true, "failure_risk": true }
  },
  "feynman_restatement": {
    "text": "When a customer says it's too expensive, don't just lower the price. Ask questions to find out what they're really worried about.",
    "evaluated_at": "2026-05-23T10:05:00Z",
    "score": { "not_just_repeat": true, "not_too_abstract": true, "has_concrete_example": true, "clarifies_boundary": true, "ordinary_person_understands": true }
  },
  "audit_log": [
    { "at": "2026-05-23T09:00:00Z", "event": "created", "by": "ai" },
    { "at": "2026-05-23T09:30:00Z", "event": "revised", "by": "author_id" },
    { "at": "2026-05-23T10:00:00Z", "event": "locked", "by": "author_id" }
  ]
}
```

## Card Types (9 total)

Core supports 9 card types for encoding different aspects of judgment:

| Type | Maps to KDNA File | Field Examples |
|------|------------------|----------------|
| `axiom` | KDNA_Core.json | one_sentence, full_statement, applies_when, does_not_apply_when |
| `ontology` | KDNA_Core.json | concept, essence, boundary, trigger_signal |
| `misunderstanding` | KDNA_Patterns.json | wrong, correct, key_distinction |
| `boundary` | KDNA_Core.json | scope, out_of_scope, acceptable_exceptions |
| `self_check` | KDNA_Patterns.json | question (must end with ?) |
| `risk` | KDNA_Core.json | failure_mode, likelihood, mitigation |
| `aesthetic` | KDNA_Patterns.json | preference, rationale, counter_example |
| `scenario` | KDNA_Scenarios.json | trigger, sub_scenarios, action_template |
| `case` | KDNA_Cases.json | situation, judgment_applied, outcome |

MVP releases support 5 types: axiom, ontology, misunderstanding, boundary, self_check.

## Compile Rules

When compiling a Studio Project to KDNA domain files:

1. **Only locked cards are included** — Draft and Revised cards are silently excluded
2. **Deprecated cards are excluded from current version** — They remain in audit history only
3. **Published cards carry version metadata** — `published_in: "0.1.0"`
4. **All output passes KDNA SPEC validation** — Failed validation blocks compilation
5. **Cards map to KDNA files by type:**
   - Axiom, Ontology, Boundary, Risk → KDNA_Core.json
   - Misunderstanding, Self-Check, Aesthetic → KDNA_Patterns.json
   - Scenario → KDNA_Scenarios.json
   - Case → KDNA_Cases.json
