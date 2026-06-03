---
name: human-processor-model
description: "Human Processor Model workflow for estimating interaction time, cognitive load, motor/perceptual bottlenecks, and memory risk in product flows. Use when the user asks to evaluate usability, estimate task completion time without a study, compare UI alternatives by interaction cost, audit working-memory burden, or apply Card-Moran-Newell style MHP reasoning to a prototype, design, app, or workflow."
---

# Human Processor Model

Use this skill to make a fast, explicit usability estimate from a concrete task. The goal is not false precision; it is to expose where perception, cognition, memory, or motor action makes the flow slow or fragile.

## Inputs

Collect or infer:

- Target user and relevant constraints: novice/expert, older adult, motor impairment, low vision, stress, interruption risk.
- The exact task goal and success state.
- The current method: screens, controls, labels, data entry, navigation path, and feedback.
- Competing method, if the user wants a comparison.

If the UI is not provided, ask for the smallest missing artifact that determines the steps: screenshot, route, prototype, task list, or current implementation path.

## Workflow

1. Define one narrow task, for example "create a refund for order 1042" rather than "use the billing app".
2. Write the observable user steps from start state to success state.
3. Break each step into perceptual, cognitive, motor, and memory operations.
4. State assumptions before calculating: user expertise, reading load, device, input method, error-free path, and whether information can remain visible.
5. Estimate each operation with the defaults below, adjusting only when the interface or user population justifies it.
6. Sum the time and call out bottlenecks separately from the numeric total.
7. Recommend changes that remove whole operations, keep needed information visible, reduce mode switches, or make feedback immediate.

## Default Estimates

Use these as rough planning constants:

| Operation | Default |
|---|---:|
| Eye movement or visual target acquisition | 230 ms |
| Perceptual processor cycle | 100 ms |
| Cognitive processor cycle | 70 ms |
| Motor processor cycle | 70 ms |
| Visual image storage half-life | 200 ms |
| Auditory storage half-life | 1500 ms |
| Working-memory effective capacity | 5-9 chunks |
| Working-memory practical capacity | about 3 chunks |

Use a range instead of a single number when the UI is underspecified or the user group changes the estimate. Older, distracted, impaired, or unfamiliar users usually need slower cycle assumptions and more recovery time.

## Memory Risk

Flag memory risk when the user must retain:

- More than 3 unrelated chunks.
- A value that disappears before it is used.
- A code, date, name, or identifier while continuing to read or navigate.
- A decision rule hidden in prior copy.

When a recall probability estimate is useful, model decay qualitatively unless the task provides a clear elapsed time and known memory type. Prefer design fixes over math: keep the source value visible, duplicate it near the destination, or convert recall into recognition.

## Output

For audits, structure the answer as:

- Task modeled.
- Assumptions.
- Step table with operation type, estimate, and issue.
- Total best estimate or range.
- Top bottlenecks.
- Design changes ranked by removed operations or reduced memory burden.

For comparisons, show both methods with the same assumptions and highlight the operation count delta, not just the final time.

## Guardrails

- Do not present estimates as study results.
- Do not invent empirical validation.
- Do not optimize only for speed when safety, confidence, accessibility, or error prevention matters more.
- If the flow is high-stakes, recommend observing real users after the model narrows the hypotheses.
