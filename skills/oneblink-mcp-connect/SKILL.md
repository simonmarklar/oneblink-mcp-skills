---
name: oneblink-mcp-connect
description: Connect a coding agent or the MCP Inspector to the OneBlink MCP server over its HTTP transport using per-session credential headers, and diagnose connection failures (401 with no OAuth, wrong transport, missing headers). Use when setting up the OneBlink MCP server in an agent, when a OneBlink tool call fails with an auth/connection error, or when the user asks how to supply their Developer Key.
triggers: connect oneblink mcp, oneblink mcp credentials, oneblink developer key, x-oneblink-access-key, oneblink mcp 401, oneblink mcp headers, oneblink mcp inspector, oneblink mcp transport
status: accepted
last_verified: 2026-10-11
verified_against: oneblink-mcp README + .env.example + src/lib/auth/header-credentials.ts (HTTP-only, per-session header credentials, no OAuth)
---

# oneblink-mcp-connect

The OneBlink MCP server is **HTTP-only** and holds **no credentials**. Every
session supplies its own OneBlink Developer Key via **request headers**. Get
this right first — every other OneBlink skill assumes a working connection.

## The one rule

Credentials ride **headers, never tool arguments or env vars**. The server
reads them from the per-request context and never logs or returns them.

| Header | Purpose |
|---|---|
| `X-OneBlink-Access-Key` | SDK Developer Key access key (required) |
| `X-OneBlink-Secret-Key` | SDK Developer Key secret key (required) |
| `X-OneBlink-CLI-Access-Key` | Separate CLI *deploy* key — optional |
| `X-OneBlink-CLI-Secret-Key` | Separate CLI *deploy* key — optional |

When the CLI pair is omitted, deploy workflows reuse the SDK pair (the common
case: one key does both).

Server-side env vars are **non-secret** and per-host only: `HTTP_BIND`,
`HTTP_PORT`, optional `ONEBLINK_TENANT` (`oneblink` | `oneblink-us` |
`civicplus`), optional `ONEBLINK_CLI_BIN`. Nothing in `.env` is a credential.

## Connecting an MCP client (agent config)

Point the client at the Streamable HTTP endpoint and attach the headers. There
is **no stdio transport** — do not configure a command/stdio server.

```jsonc
// Example MCP client config (shape varies per agent)
{
  "oneblink": {
    "type": "http",
    "url": "http://127.0.0.1:3000/mcp",
    "headers": {
      "X-OneBlink-Access-Key": "<your access key>",
      "X-OneBlink-Secret-Key": "<your secret key>"
    }
  }
}
```

Keep real keys out of version control and shell history — reference environment
variables in the config where the agent supports it, or use the agent's secret
store.

## Running the server locally

```bash
npm install
npm run build
npm run start:http      # binds 127.0.0.1:3000 by default
```

## MCP Inspector (local dev)

The Inspector is a **local dev dependency**, not a global command — run it via
`npx` or the `npm run inspect:*` scripts, always from the project dir that has
`node_modules`.

```bash
npm run inspect:http    # opens the Inspector against http://127.0.0.1:3000/mcp
```

In the Inspector UI add the credential headers under **Transport → Headers**
before clicking **Connect**. CLI smoke test (no UI):

```bash
export ONEBLINK_ACCESS_KEY='<your access key>'
export ONEBLINK_SECRET_KEY='<your secret key>'
npx mcp-inspector --cli --transport http --server-url http://127.0.0.1:3000/mcp \
  --header "X-OneBlink-Access-Key: $ONEBLINK_ACCESS_KEY" \
  --header "X-OneBlink-Secret-Key: $ONEBLINK_SECRET_KEY" \
  --method tools/list
```

## Troubleshooting

| Symptom | Cause → fix |
|---|---|
| `401` from `/mcp`, every tool fails | Missing/typo'd credential headers. The 401 carries **no** `WWW-Authenticate` — this is expected; it is **not** OAuth. Add the two `X-OneBlink-*-Key` headers. |
| "Dynamic Client Registration rejected (HTTP 404)" | You are on an **old build** that advertised OAuth. Rebuild (`npm run build`) — current builds carry no OAuth. |
| Client tries stdio / spawns a command | Wrong transport. This server is HTTP-only; configure an `http` server pointed at `/mcp`. |
| Connection refused on 127.0.0.1:3000 | Server not running, or a different `HTTP_PORT`. Start `npm run start:http`; check `.env`. |
| Permission errors on a tool, auth OK | The Developer Key lacks the role permission / app association that workflow needs. Grant it in the OneBlink Console. |
| Keys appear in logs/transcript | They should not — if they do, you put them in a **tool argument**. Move them to headers. |

## Rules

- Never put a credential in a tool argument, env var, or any file you commit.
- A hosted deployment MUST terminate TLS in front so headers never travel in
  the clear.
- Pick the tenant with `ONEBLINK_TENANT` (server-side), not per call.
