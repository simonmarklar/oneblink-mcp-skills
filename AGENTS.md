# AGENTS.md — OneBlink MCP Skills

Skills that complement the OneBlink MCP server. They teach an agent how to drive
the server's workflow tools and cover the local-only tasks the HTTP-only server
cannot.

## Installed skills

Load the matching `SKILL.md` on demand (under this agent's skills directory):

| Skill | Load when the task involves |
|---|---|
| `oneblink-mcp-connect` | connecting to the server, credential headers, 401/transport errors |
| `oneblink-form-authoring` | creating/building a form, CSV→form, form + workflow in one pass |
| `oneblink-submission-events` | email/PDF or hosted-API webhook events on submit |
| `oneblink-personalisation` | prefilling a form on load from a hosted API |
| `oneblink-approval-flows` | configuring approval steps (STANDARD/CONCURRENT) |
| `oneblink-deploy` | deploying a hosted API or CDN site (prod fail-closed) |

Credentials for the OneBlink MCP server ride **request headers**
(`X-OneBlink-Access-Key` / `X-OneBlink-Secret-Key`), never tool arguments or
committed files.

<!-- oneblink-mcp-skills -->
