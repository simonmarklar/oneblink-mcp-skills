---
name: oneblink-form-authoring
description: Author a OneBlink form end to end using the MCP server tools - discover the environment/workspace ids, create the form from a CSV or SDK FormElement[], then wire any submission events and verify. Use when the user wants to create or build a OneBlink form, turn a spreadsheet or field list into a form, or stand up a form with its workflow in one pass.
triggers: create oneblink form, build a form, author a form, oneblink form from csv, new oneblink form, make a form, form elements csv, create_form
status: accepted
last_verified: 2026-10-11
verified_against: oneblink-mcp docs/tools/create_form.md, list_forms_app_environments.md, list_workspaces.md, list_forms.md
---

# oneblink-form-authoring

Create a OneBlink form and its workflow using the MCP server, in the right
order. Assumes a working connection (see `oneblink-mcp-connect`).

## Order of operations

1. **Discover ids.** You need a `formsAppEnvironmentId` to create a form. Call
   `list_forms_app_environments` (page mode) to get environment ids and their
   `workspaceId`. Use `list_workspaces` if you need the distinct workspace ids
   first. Never guess an id.
2. **Create the form** with `create_form`. Supply elements EITHER as
   `elementsCsv` XOR `elements` — exactly one source.
3. **Wire submission events** if the form needs them → load
   `oneblink-submission-events`.
4. **Attach personalisation** if the form prefills from an API → load
   `oneblink-personalisation`.
5. **Set approvals** if the form routes for approval → load
   `oneblink-approval-flows`.
6. **Verify** with `list_forms` scoped to the environment/workspace to confirm
   the form exists.

## create_form inputs

| Input | Notes |
|---|---|
| `name` | Required. |
| `formsAppEnvironmentId` | Required — from `list_forms_app_environments`. |
| `elementsCsv` *or* `elements` | Exactly one. CSV for human/spreadsheet authors; `elements` for a machine-built SDK `FormElement[]`. |
| `description`, `formsAppIds`, `isAuthenticated` | Optional. |
| `isMultiPage` | Omit to infer from elements (true iff root is `pages`). |
| `postSubmissionAction` / `cancelAction` | `FORMS_LIBRARY` (default) \| `URL` \| `CLOSE` \| `BACK`. |
| `redirectUrl` | Required when an action is `URL`. |

`organisationId` is derived server-side from the credential — never pass it.

## The CSV format

One element per row. Columns:

```
label,type,parent,required,options,prop:*
```

- `type` matches the SDK element type set **case-insensitively**.
- element `name` is derived from the `label` when not given.
- `options` are `Label:value` tokens (for choice elements).
- nesting is expressed by a `parent` column (or by nested `elements` on the SDK
  path).

Example:

```csv
label,type,required
Full name,text,true
Email,email,true
State,select,true
```

For a select/radio/checkbox add options:

```csv
label,type,required,options
State,select,true,New South Wales:NSW|Victoria:VIC|Queensland:QLD
```

### Deterministic "required" subsets

If a spec says "random/some elements required", resolve it to a **fixed**
documented subset before building — forms and tests must be reproducible. Do
not actually randomise which fields are required.

## Validation

`create_form` validates the **whole input fail-fast** before any API call and
returns human- and machine-readable errors. Fix reported errors and re-run;
nothing is created on a validation failure.

## Rules

- Discover ids with the list tools; never hardcode or guess an id.
- CSV XOR SDK elements — supplying both (or neither) is an error.
- Keep the author's intent in a comment/row label, not in prose elsewhere.
- After creating, verify with `list_forms` rather than assuming success.
