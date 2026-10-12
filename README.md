# OneBlink MCP Skills

Agent **skills** that complement the [OneBlink MCP server](https://github.com/oneblink/sdk-node-js)
(`@oneblink/mcp-server`). They teach any coding agent *how to drive* the MCP
server's workflow tools well, and cover the local-only tasks the server
deliberately does not (it is HTTP-only and holds no filesystem — see "Why not
MCP tools" below).

Portable `SKILL.md` format (the Agent Skills standard read by Claude Code,
Codex, Cursor, Gemini CLI, Kiro and 30+ tools). One prompt installs them into
whichever agent you are using.

## Install via prompt

Paste this to your agent (Kiro, Claude Code, Cursor, Codex, Gemini CLI, …):

```
Install the skills from https://raw.githubusercontent.com/simonmarklar/oneblink-mcp-skills/main/INSTALL.md
```

A local checkout works too:

```
Install the skills from file:///C:/Users/simon/.kiro/crew/workspace/oneblink-mcp-skills/INSTALL.md
```

The agent fetches `INSTALL.md`, detects which agent it is, and copies the
`skills/` tree into that agent's own skills directory. No build step, no
network calls beyond the fetch.

## What's inside

| Skill | What it does |
|---|---|
| `oneblink-mcp-connect` | Connect an agent/Inspector to the HTTP server with per-session credential headers; diagnose 401/no-OAuth. |
| `oneblink-form-authoring` | Author a form end to end: discover env/workspace ids → `create_form` (CSV or SDK elements) → wire submission events → publish-verify. |
| `oneblink-submission-events` | Choose and wire email/PDF vs hosted-API webhook submission events; append-vs-replace, locked-form handling. |
| `oneblink-personalisation` | Prefill a form from a hosted API: scaffold → deploy → `set_form_personalisation`. |
| `oneblink-approval-flows` | Design and set approval flows (STANDARD/CONCURRENT), replace-not-additive semantics, lock handling. |
| `oneblink-deploy` | Deploy hosted APIs and CDN sites via the CLI-backed tools; prod fail-closed, `--prune` safety. |

Each skill is self-contained: `skills/<name>/SKILL.md` plus any scripts/assets.

## Why skills, not more MCP tools

The server's charter (per its security steering) is **credentialed,
workflow-focused SDK/CLI operations**. A capability belongs in a skill — not
the server — when it is a pure local operation: templating, choosing which tool
to call, interpreting a result, or writing files to the caller's own disk. The
server is HTTP-only and cannot see your filesystem, so anything that takes a
local path (scaffolding, config patching) is a skill. These skills orchestrate
the server's tools; they do not duplicate them.

## Layout

```
oneblink-mcp-skills/
  INSTALL.md            # the prompt-driven installer (agent reads + executes this)
  AGENTS.md             # cross-tool pointer registered on install
  skills/
    oneblink-mcp-connect/SKILL.md
    oneblink-form-authoring/SKILL.md
    oneblink-submission-events/SKILL.md
    oneblink-personalisation/SKILL.md
    oneblink-approval-flows/SKILL.md
    oneblink-deploy/SKILL.md
  scripts/
    install.mjs         # optional deterministic installer (Node, no deps)
```
