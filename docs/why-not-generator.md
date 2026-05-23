# Why KDNA Studio Is Not a Generator

A common first impression: "This tool takes expert notes and generates KDNA domains automatically."

That impression is wrong, and correcting it is essential to KDNA's integrity.

## What Studio Does

KDNA Studio is an **authoring environment** for human judgment. It provides structure, enforcement, and verification — but the judgment itself comes from the expert, not the machine.

| Studio Does | Studio Does NOT Do |
|-------------|-------------------|
| Provides card templates for axioms, misunderstandings, boundaries, self-checks | Auto-generate axioms from a prompt |
| Validates that every card has required fields | Decide whether a card's content is correct |
| Enforces that cards must be locked before compilation | Lock cards on behalf of the expert |
| Runs A/B comparison tests to measure judgment impact | Judge whether the KDNA result is better |
| Compiles locked cards into KDNA JSON files | Choose which cards to include in output |

## The Human Lock: Why It Exists

Every KDNA domain compiled by Studio Core requires **Human Lock** on every card. This is not a checkbox. It is the mechanism that guarantees:

1. **The expert confirms this judgment is theirs** — in their own words
2. **The expert has reviewed when it applies and when it does not**
3. **The expert understands what could go wrong** (failure_risk)
4. **The expert can explain it to a non-expert** (Feynman restatement)

Without Human Lock, KDNA domains would be filled with AI-synthesized platitudes that sound right but carry no expert weight.

## AI's Role: Assistant, Not Authority

AI has four legitimate roles in Studio:

| Role | What It Does |
|------|-------------|
| **Interviewer** | Asks structured questions to extract implicit expertise |
| **Challenger** | Surfaces contradictions, missing boundaries, weak distinctions |
| **Compiler** | Transforms locked cards into valid KDNA JSON |
| **Evaluator** | Runs A/B comparison tests against an LLM |

AI can propose judgment candidates. AI cannot confirm judgment.

## Why One-Click Generation Is Dangerous

If KDNA Studio offered a "Generate Domain" button:

1. **Low-quality domains would flood the registry** — AI-synthesized KDNA would sound plausible but carry no real expertise
2. **Trust would erode** — If anyone can generate a KDNA, no one can trust that a KDNA represents real expertise
3. **The protocol loses meaning** — KDNA's value proposition is "this is expert judgment, not AI consensus"

## The Enforced Workflow

```
AI proposes card     →  status: draft
Human revises card   →  status: revised
Human locks card     →  status: locked    ← REQUIRED for compilation
System tests card    →  status: tested
System publishes     →  status: published
```

Draft cards are NEVER included in compiled domain output. Only locked cards enter.

## What This Means for Developers

If you are building a third-party app that integrates Studio Core:

- You CAN build a guided interview UI that helps experts articulate their judgment
- You CAN use AI to suggest candidate cards
- You CANNOT bypass the lock requirement in compile output
- You CANNOT present AI-suggested cards as confirmed without human lock
- Your generated .kdna will carry provenance proving it came from your tool

This is not a limitation — it is the guarantee that makes every .kdna trustworthy.
