---
name: oneblink-deploy
description: Deploy a OneBlink hosted API or a CDN static site using the MCP server CLI-backed tools (deploy_hosted_api, deploy_cdn) - including the production fail-closed guard and the destructive --prune safety. Use when the user wants to deploy/publish a hosted API or a static site to a OneBlink environment, or to push a CDN project.
triggers: oneblink deploy, deploy hosted api, deploy cdn, publish oneblink site, deploy_hosted_api, deploy_cdn, oneblink api deploy, push to oneblink
status: accepted
last_verified: 2026-10-11
verified_against: oneblink-mcp docs/tools/deploy_hosted_api.md, deploy_cdn.md
---

# oneblink-deploy

Deploy via the CLI-backed MCP tools (the SDK has no api-hosting or CDN
surface). Assumes a working connection (see `oneblink-mcp-connect`). Deploys may
use a separate CLI deploy key — see `oneblink-mcp-connect` for the
`X-OneBlink-CLI-*-Key` headers (omit to reuse the SDK key).

## Hosted API — `deploy_hosted_api`

Create or update a hosted API by deploying its project directory.

| Input | Notes |
|---|---|
| `projectDir` | Required — absolute path to the codebase (contains `.blinkmrc.json`); used as CLI cwd. |
| `scope` | Optional — API scope domain, e.g. `customer-project.api.oneblink.io`. When set, `oneblink api scope <scope>` runs before deploy. |
| `env` | `dev` (default) / `test` / `prod`. First deploy to a new env auto-provisions it. |
| `confirmProduction` | **Required `true` to deploy to `prod`** — fails closed otherwise, before any subprocess. |

To scaffold the project first, load `scaffold-hosted-api`. To wire the deployed
API to a form, load `oneblink-submission-events` (webhook) or
`oneblink-personalisation` (prefill). The combined
`upsert_api_submission_event_with_deploy` (`source: deploy`) deploys and wires
in one call.

## CDN static site — `deploy_cdn`

Create CDN hosting and deploy a static asset directory.

| Input | Notes |
|---|---|
| `projectDir` | Required — CDN project dir (contains `.blinkmrc.json`). |
| `deployDir` | Required — folder whose contents map to CDN root, e.g. `public` or `www`. |
| `scope` | Optional — CDN scope/domain, e.g. `customer-project.cdn.oneblink.io`. When set, runs `cdn scope` first. |
| `env` | `dev` (default) / `test` / `prod`. |
| `prune` | **Destructive** — adds `--prune` to remove CDN files no longer present locally. Default false. |
| `confirmProduction` | **Required `true` when `env=prod`** — fails closed otherwise. |
| `cdnConfig` | Optional `.blinkmrc.json` cdn patch (`scope`, `isSinglePageApplication`, `disableSecurityResponseHeaders`, `waf`). Omit to leave the file as-is. |

## Production safety

- `prod` deploys **fail closed** unless `confirmProduction: true` is explicitly
  set. Never set it to get past the guard without the user's explicit intent to
  ship to production.
- `--prune` (CDN) permanently removes remote files absent locally. Confirm with
  the user before combining `prune:true` with `env:prod` — a stale/partial
  local tree would delete live assets.
- `confirmProduction` fails closed **before** any subprocess runs, so a refused
  prod deploy makes no change.

## Pre-flight

1. Confirm `projectDir` is absolute and contains `.blinkmrc.json`.
2. Confirm the target `env`; default to `dev` unless the user said otherwise.
3. For `prod`, confirm the user explicitly wants production, then set
   `confirmProduction: true`.
4. For CDN `deployDir`, confirm it is the folder that maps to the site root.

## Rules

- Never set `confirmProduction:true` or `prune:true` to bypass a guard —
  both require explicit user intent.
- Default to `dev`. Treat `prod` as a one-way-door action needing sign-off.
- Deploys may need the CLI deploy key headers; otherwise the SDK key is reused.
