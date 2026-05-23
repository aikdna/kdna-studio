# Judgment Loop

The Judgment Loop is the core authoring cycle in KDNA Studio. It describes how human expertise is extracted, structured, validated, and locked into a KDNA domain.

## The Five Roles

| Role | Who | Responsibility |
|------|-----|---------------|
| **Expert** | Human | Source of domain judgment |
| **Interviewer** | AI | Extracts implicit judgment through structured questions |
| **Challenger** | AI | Surfaces contradictions, gaps, over-generalizations |
| **Compiler** | AI/System | Transforms locked cards into valid KDNA JSON |
| **Evaluator** | AI/System | Runs A/B tests against LLM to measure judgment impact |

## The Loop

```
┌──────────────────────────────────────────────┐
│                                              │
│  1. EXPERT provides raw material             │
│     ↓                                        │
│  2. INTERVIEWER extracts candidate judgment  │
│     ↓                                        │
│  3. CHALLENGER surfaces issues               │
│     ↓                                        │
│  4. EXPERT revises, supplements, locks       │
│     ↓                                        │
│  5. COMPILER produces KDNA JSON              │
│     ↓                                        │
│  6. EVALUATOR runs A/B tests                 │
│     ↓                                        │
│  7. EXPERT reviews results, iterates → (2)   │
│                                              │
└──────────────────────────────────────────────┘
```

## Detailed Stages

### 1. Evidence Import

The expert provides raw material: documents, transcripts, notes, examples, recorded conversations.

The AI interviewer reads everything and produces a "domain brief" — a summary of what was understood, with candidate patterns highlighted.

**Output:** Evidence entries with candidate pattern annotations.

### 2. Interview Extraction

The AI interviewer asks structured questions mapped to KDNA elements:

| Question | KDNA Element |
|----------|-------------|
| "What principles do you always start from?" | Axiom |
| "What concepts do you define differently from most people?" | Ontology |
| "What words mislead people in this domain?" | Banned Terms |
| "What do beginners consistently get wrong?" | Misunderstanding |
| "What questions do you ask yourself before deciding?" | Self-Check |
| "When should someone NOT use this approach?" | Boundary |
| "What's a judgment call you made that colleagues disagreed with?" | Stance |
| "Walk me through a recent decision, step by step." | Framework |
| "What changed your mind in the last 5 years?" | Evolution |

**Output:** Draft judgment cards with AI-proposed content.

### 3. Challenge Phase

The AI challenger reviews all draft cards for:

- **Contradiction:** Do any two axioms conflict?
- **Missing boundary:** Does every axiom have `does_not_apply_when`?
- **Weak distinction:** Are misunderstandings actually distinct concepts?
- **Over-generalization:** Is the axiom too broad to be testable?
- **Straw man:** Does the misunderstanding describe something no one believes?

**Output:** Challenge list with specific issues per card.

### 4. Human Revision + Lock

The expert reviews each card, answers challenges, and locks the ones they confirm represent their true judgment.

Locking requires:
- Explicit confirmation statement in the expert's own words
- Confirmation of checking `applies_when`, `does_not_apply_when`, and `failure_risk`
- Feynman restatement: the expert explains the judgment to a non-expert

**Output:** Locked cards ready for compilation.

### 5. Compilation

The compiler transforms locked cards into KDNA standard files. Only locked cards enter the output.

**Output:** KDNA_Core.json, KDNA_Patterns.json, and optional Scenarios/Cases/Reasoning/Evolution.

### 6. A/B Test

The evaluator runs comparison tests: the same LLM prompt with and without the new KDNA domain loaded. The expert rates whether the KDNA-loaded response better reflects their judgment.

**Output:** Judgment Delta reports with human ratings.

### 7. Iteration

Based on test results, the expert may revise cards, add new ones, or deprecate old ones. The loop continues.

## Anti-Patterns

| Anti-Pattern | Why It's Wrong |
|-------------|----------------|
| AI locks cards | Judgment ownership must be human |
| Skip challenge phase | Unchallenged axioms often have hidden contradictions |
| Lock all at once | Per-card lock enables granular audit |
| Skip Feynman | Agreement ≠ understanding |
| Compile without tests | Untested domains may not actually change agent behavior |
| One-click generate | Produces low-quality KDNA that erodes ecosystem trust |
