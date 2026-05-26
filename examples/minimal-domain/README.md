# Minimal Domain Example

A complete Studio Core pipeline demonstrating the creation of a simple KDNA domain for editorial writing judgment.

## Run

```bash
cd kdna-studio
npm install
node examples/minimal-domain/run.js
```

## What it Produces

```
1. Studio Project      → project model with cards
2. Judgment Cards      → 1 axiom + 1 misunderstanding + 1 self-check (all locked)
3. Feynman Restatements → expert explains each card in simple terms
4. Readiness Score     → quality gate evaluation
5. Compile             → KDNA_Core.json + KDNA_Patterns.json + KDNA_Reasoning.json + KDNA_Evolution.json + kdna.json
6. Validate            → kdna dev validate passes
7. Pack                → .kdna container created
8. README              → auto-generated from card metadata
9. Provenance          → build ID + content fingerprint
```

## Expected Output

```
✓ project valid
✓ 3 cards ready (3 locked)
grade: human_controlled
output: 5 KDNA files (3 locked, 0 excluded)
✓ KDNA domain valid
✓ Packed: writing_judgment.kdna
✓ README generated
build_id: build_...
fingerprint: sha256:...
```

## Key Concepts

- **Human Lock**: Every card is explicitly confirmed by the expert before compilation
- **Feynman Restatement**: Each axiom is explained in simple terms a non-expert would understand
- **Compile Rules**: Only locked cards enter KDNA output; draft cards are silently excluded
- **Quality Gate**: `computeReadiness()` evaluates whether the domain is publishable
