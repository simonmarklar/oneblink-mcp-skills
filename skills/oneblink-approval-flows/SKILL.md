---
name: oneblink-approval-flows
description: Design and set a OneBlink form's approval flow using the MCP server set_approval_flow tool - the ordered steps (STANDARD sequential / CONCURRENT parallel) that decide which group approves a submission and in what order. Covers replace-not-additive semantics and locked-form handling. Use when the user wants to configure who approves a form, set up an approval chain, or change approval steps.
triggers: oneblink approval flow, set approval steps, who approves the form, approval chain, concurrent approval, set_approval_flow, form approvals
status: accepted
last_verified: 2026-10-11
verified_against: oneblink-mcp docs/tools/set_approval_flow.md
---

# oneblink-approval-flows

Configure who approves a form's submissions and in what order. Assumes a
working connection (see `oneblink-mcp-connect`) and an existing form.

## What this does — and does not

`set_approval_flow` reads the form, **replaces** its `approvalSteps` (NOT
additive), optionally writes `approvalConfiguration`, and saves. It configures
the *flow definition*. It does **not** approve or deny actual submissions —
that is an Approvals-app operator action outside the SDK.

## Replace semantics — read first

`steps` **replaces the entire existing flow**. If you intend to add or tweak a
step, you must supply the **whole** desired ordered flow, not just the delta.
Read the form's current `approvalSteps` first and build the full new array, or
you will silently drop existing steps.

## Step shapes

Each step: `label`, `group`, `type`, optional `nodes[]`, plus conditional
fields.

| `type` | Meaning |
|---|---|
| `STANDARD` | Sequential — this group approves, then the flow advances to the next step. |
| `CONCURRENT` | Parallel — the step's `nodes[]` groups approve in parallel; use `nodes[]` to list them. |

Example (sequential, two groups):

```json
[
  { "label": "Team lead", "group": "team-leads", "type": "STANDARD" },
  { "label": "Finance",   "group": "finance",     "type": "STANDARD" }
]
```

Example (first step concurrent, then one sequential):

```json
[
  { "label": "Dept reviews", "type": "CONCURRENT",
    "nodes": [ { "label": "Legal", "group": "legal" },
               { "label": "Risk",  "group": "risk" } ] },
  { "label": "Director", "group": "directors", "type": "STANDARD" }
]
```

`approvalConfiguration` (optional) is written **verbatim** when supplied and
left untouched otherwise.

## Inputs

| Input | Notes |
|---|---|
| `formId` | Required. |
| `steps` | Required — the FULL ordered flow; replaces the existing flow. |
| `approvalConfiguration` | Optional — whole-flow config, written verbatim. |
| `overrideLock` | Optional — see below. |

## Locked forms

A locked form stops with a **permission request**. Report the lock and get
explicit permission before `overrideLock:true` — never implicit.

## Rules

- `steps` is a full replacement — always build the complete desired flow.
- Use `CONCURRENT` + `nodes[]` for parallel groups; `STANDARD` for sequential.
- This sets the flow, it does not act on live submissions.
- Never set `overrideLock` without the user's explicit permission.
