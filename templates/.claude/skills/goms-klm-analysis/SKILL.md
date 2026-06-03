---
name: goms-klm-analysis
description: "GOMS and Keystroke-Level Model analysis for decomposing UI workflows into goals, operators, methods, selections, and expert-user execution estimates. Use when the user asks to compare task flows, count interaction cost, reduce clicks or keystrokes, evaluate command/menu/navigation choices, model expert performance, or redesign a workflow using GOMS, KLM, CMN-GOMS, or cognitive walkthrough style reasoning."
---

# GOMS / KLM Analysis

Use this skill when the useful artifact is an explicit workflow model. It is best for repeatable tasks with known steps, such as dashboard triage, form submission, search/refine/open flows, command palettes, editor workflows, and mobile settings tasks.

## Choose The Model

- Use **KLM** when the task is procedural and the user already knows what to do. It estimates expert, error-free execution time.
- Use **GOMS** when there are meaningful alternatives, decision rules, or multiple methods to achieve the same goal.
- Use a lightweight cognitive walkthrough when the risk is discoverability, comprehension, or first-time use rather than speed.

## KLM Operators

Start with these operator families and adjust for the product context:

- `K`: keystroke, tap, click, button press, or discrete command.
- `P`: point to or visually acquire a target.
- `M`: mental preparation before a chunk of action.
- `H`: hand movement between input devices or postures.
- `R`: system response wait time.
- `V`: visual verification or reading needed to continue.

Do not overfit exact timings. Count removed operators and wait states first; add timings only when comparison needs a rough total.

## Workflow

1. Name the task and user expertise level.
2. Capture the current method as numbered user actions.
3. Mark operators for each action.
4. Insert mental operators before decisions, strategy shifts, mode changes, or non-obvious commands.
5. Insert response waits only when the UI blocks the next action.
6. Build the proposed method with the same operator rules.
7. Compare operator counts, waits, and error-prone transitions.
8. Recommend the smallest UI changes that remove operators or make the selected method obvious.

## Selection Rules

For GOMS, make selection rules explicit:

- If the user knows the exact item name, use search.
- If the item is recent or spatially stable, use recents or pinned navigation.
- If the task requires comparison, use a list/table with persistent controls.
- If the task is destructive, use a slower method only when it reduces error risk.

Bad selection rules reveal design problems. If the rules depend on hidden knowledge, redesign the flow instead of documenting the rule.

## Output

For a single flow:

```text
Task:
User:
Current method:
Operator model:
Findings:
Recommendations:
```

For alternatives:

```text
Option A:
- Operators:
- Waits:
- Error-prone transitions:

Option B:
- Operators:
- Waits:
- Error-prone transitions:

Decision:
```

## Guardrails

- KLM models skilled, error-free performance; do not use it as the only lens for onboarding, accessibility, or confusing flows.
- Do not count implementation steps. Count user-observable operations.
- Keep safety and confidence in the model. A slower confirmation can be correct for irreversible actions.
- If the design is for an Apple platform, pair this skill with Apple HIG guidance for platform conventions.
