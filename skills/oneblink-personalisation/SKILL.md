---
name: oneblink-personalisation
description: Prefill a OneBlink form from a hosted-API endpoint BEFORE the user starts filling it, using the MCP server - scaffold the API, deploy it, then point the form at it with set_form_personalisation. Use when the user wants a form pre-populated on load, a prefill/personalisation endpoint, or to connect a form to a hosted API for prefill.
triggers: oneblink personalisation, prefill a form, form prefill endpoint, set_form_personalisation, populate form on load, personalisation endpoint, form prefill api
status: accepted
last_verified: 2026-10-11
verified_against: oneblink-mcp docs/tools/set_form_personalisation.md; scaffold-hosted-api skill; deploy_hosted_api
---

# oneblink-personalisation

Personalisation prefills a form with data **before** the user starts — distinct
from submission events, which fire after submit. Assumes a working connection
(see `oneblink-mcp-connect`).

## End-to-end order

1. **Scaffold** a hosted API with a personalisation route (if one does not
   exist yet). Load the `scaffold-hosted-api` skill — it writes
   `.blinkmrc.json` + a `{ post }` handler that returns
   `{ submission: { <elementName>: value } }`. OneBlink prefills by matching
   those keys to form element `name`s on load, so the handler's keys MUST equal
   the target form's element names.
2. **Deploy** the API → load `oneblink-deploy` (`deploy_hosted_api`). Note the
   scope domain and environment it deployed to.
3. **Point the form at it** with `set_form_personalisation`.
4. **Verify** by loading the form in a Forms App and confirming it prefills.

## set_form_personalisation inputs

| Input | Notes |
|---|---|
| `formId` | Required — the form to attach the endpoint to. |
| `apiId` | Required — the **full scope domain**, e.g. `oneblink-mcp-test.api.oneblink.io` (not a short id). |
| `apiEnvironment` | Required — `dev` / `test` / `prod`. |
| `apiEnvironmentRoute` | Required — must start with `/`, e.g. `/test`. |
| `overrideLock` | Optional — see locked forms. |

It reads the form, sets `form.personalisation` to a `ONEBLINK_API` endpoint
config, and writes it back.

## Element-name contract

The prefill only works when the handler's returned keys match the form's
element `name`s **exactly**. If prefill does nothing on load:
- confirm the element `name`s on the form (not the labels),
- confirm the handler returns `{ submission: { <name>: value } }` with those
  same keys,
- confirm `apiEnvironmentRoute` matches the deployed route.

## Locked forms

A locked form stops with a **permission request**. Report it and get explicit
permission before `overrideLock:true` — never implicit.

## Rules

- `apiId` is the full scope domain, not a short id.
- Route must start with `/` and match the deployed route.
- Handler keys == form element names, or nothing prefills.
- Never set `overrideLock` without the user's explicit go-ahead.
