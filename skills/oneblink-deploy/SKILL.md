---
name: oneblink-deploy
description: Deploy a OneBlink hosted API or a CDN static site using the MCP server CLI-backed tools (deploy_hosted_api, deploy_cdn) - including the production fail-closed guard and the destructive --prune safety. Use when the user wants to deploy/publish a hosted API or a static site to a OneBlink environment, or to push a CDN project.
triggers: oneblink deploy, deploy hosted api, deploy cdn, publish oneblink site, deploy_hosted_api, deploy_cdn, oneblink api deploy, push to oneblink
status: accepted
last_verified: 2026-10-12
verified_against: oneblink-mcp docs/tools/deploy_hosted_api.md, deploy_cdn.md; src/workflows/deploy-hosted-api.ts (scope is a free-form string the tool passes to `oneblink api scope`); scope naming convention <organisation>-<subdomain>.api.oneblink.io is Console-enforced and must be constructed by the agent
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
| `scope` | Optional — API scope domain. **Must follow the Console naming convention** `<organisation>-<subdomain>.api.oneblink.io` — see [Scope-domain naming](#scope-domain-naming) below. When set, `oneblink api scope <scope>` runs before deploy. |
| `env` | `dev` (default) / `test` / `prod`. First deploy to a new env auto-provisions it. |
| `confirmProduction` | **Required `true` to deploy to `prod`** — fails closed otherwise, before any subprocess. |

To scaffold the project first, load `scaffold-hosted-api`. To wire the deployed
API to a form, load `oneblink-submission-events` (webhook) or
`oneblink-personalisation` (prefill). The combined
`upsert_api_submission_event_with_deploy` (`source: deploy`) deploys and wires
in one call.

## Scope-domain naming

The OneBlink Console **enforces** a fixed shape for a hosted-API scope domain.
Any `scope` you pass (and the `api.hosting` value scaffolded into
`.blinkmrc.json`) MUST be built as:

```
<organisation>-<subdomain>.api.oneblink.io
```

- `<organisation>` — the name of the organisation the Developer Key has access
  to. **The user cannot change this.** It is fixed by the credential and is
  always the prefix.
- `<subdomain>` — the **only** user-modifiable segment. This is the single piece
  the user chooses/supplies (e.g. a project or app name).
- The suffix is always a literal `-` joiner, then the user's subdomain, then the
  literal `.api.oneblink.io`.

**Construct it, never accept it whole.** Treat the user's input as the
`<subdomain>` only, then prepend the organisation name + `-` yourself:

```
scope = <organisation> + "-" + <subdomain> + ".api.oneblink.io"
```

Example — organisation `acme`, user asks for subdomain `intake`:

```
acme-intake.api.oneblink.io
```

### Getting the organisation name

The MCP server does **not** currently expose a tool that returns the
organisation name, so you cannot fetch it programmatically through these
skills. Obtain it one of two ways, in order:

1. If the user already stated their organisation name (or it is visible in an
   existing scope domain they gave you), reuse it.
2. Otherwise **ask the user** for their organisation name as shown in the
   OneBlink Console (Console → API Hosting shows existing scope domains in the
   `<organisation>-<subdomain>.api.oneblink.io` form, so the prefix before the
   first `-` is the organisation name). Do not guess it.

### Guard against double-prefixing

If the user's supplied `<subdomain>` already looks like a full domain or already
starts with `<organisation>-`, do **not** prepend again — strip it back to the
bare subdomain first. The final string must contain the organisation name and
`.api.oneblink.io` **exactly once**. Reject a value that cannot be reduced to a
single `<organisation>-<subdomain>.api.oneblink.io`.

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

- `scope` must be `<organisation>-<subdomain>.api.oneblink.io`. Prepend the
  organisation name + `-` yourself; treat user input as the `<subdomain>` only.
  Never accept a full domain whole, and never let the org name or
  `.api.oneblink.io` appear twice.
- Never set `confirmProduction:true` or `prune:true` to bypass a guard —
  both require explicit user intent.
- Default to `dev`. Treat `prod` as a one-way-door action needing sign-off.
- Deploys may need the CLI deploy key headers; otherwise the SDK key is reused.
