---
name: oneblink-submission-events
description: Choose and wire a OneBlink form submission event using the MCP server - email/PDF events, or a hosted-API (ONEBLINK_API) webhook pointing at an existing or newly-deployed API. Covers append-vs-replace, locked-form handling, and secret ids. Use when the user wants a form to email a submission, generate a PDF, call a webhook on submit, or add/update a submission event.
triggers: oneblink submission event, form webhook, email submission event, pdf submission event, oneblink_api event, wire form to api, form submit email, submission events
status: accepted
last_verified: 2026-10-11
verified_against: oneblink-mcp docs/tools/upsert_email_submission_event.md, upsert_api_submission_event.md, upsert_api_submission_event_with_deploy.md
---

# oneblink-submission-events

Submission events fire **after** a submit. Pick the right tool, then wire it.
Assumes a working connection (see `oneblink-mcp-connect`) and an existing form.

## Which tool

| Goal | Tool |
|---|---|
| Email the submission (optionally with a PDF attachment) | `upsert_email_submission_event` (`eventType: EMAIL`) |
| Generate a submission PDF and email it | `upsert_email_submission_event` (`eventType: PDF`, the default) |
| Call an **already-deployed** hosted API on submit | `upsert_api_submission_event` |
| Deploy a NEW hosted API, then wire it on submit (one call) | `upsert_api_submission_event_with_deploy` (`source: deploy`) |

> Prefill BEFORE a user fills the form is **personalisation**, not a submission
> event → load `oneblink-personalisation`.

## Email / PDF event

`upsert_email_submission_event` loads the form, resolves the Email Template in
the form's own environment, splices the event in, and saves.

- `email`: `{ toEmail[], ccEmail?, bccEmail?, subjectLine? }` — at least one
  `toEmail` required.
- `pdf`: `{ fileName?, includeSubmissionId?, includeExternalId?, excludedElementIds?, excludedCSSClasses? }`.
- `emailTemplate`: link an existing one by `{ id }`, or create/update by
  `{ name, bodyHtml, type? }`.

## Hosted-API webhook event

`upsert_api_submission_event` points at an **existing** API+route:

- `apiId`, `apiEnvironment` (dev/test/prod), `apiEnvironmentRoute` (must start
  with `/`). `apiId` is the full scope domain
  `<organisation>-<subdomain>.api.oneblink.io` — build it per the naming
  convention in `oneblink-deploy`, never accept a bare subdomain or full domain
  without checking the org prefix.
- `organisationManagedSecretId` (optional) verifies request authenticity —
  only its id is handled, never logged.

`upsert_api_submission_event_with_deploy` with `source: deploy` deploys a new
API from `projectDir` **then** wires it — a failed deploy writes no event. Deploy
details (scope, env, prod confirmation) → load `oneblink-deploy`.

## Append vs replace

- Omit `replaceIndex` to **append** a new event.
- Set `replaceIndex` to replace the event at that exact index. **Never guess
  the index** — read the form's current `submissionEvents` first if you need to
  target one.

## Locked forms

If the form is locked, the tool stops with a **permission request**. Report the
lock to the user and get explicit permission before setting `overrideLock:true`
— never set it implicitly (risks clobbering a concurrent builder edit). Fail
closed; let the user grant the override on a re-call.

## Common options

`conditionallyExecute` (run only when conditions pass), `isRetryable` (retry a
failed delivery), `label` (identify the event).

## Rules

- Never guess `replaceIndex`; append unless you know the target index.
- Never set `overrideLock` without explicit user permission.
- Secret ids are ids only — never log or echo a secret value.
