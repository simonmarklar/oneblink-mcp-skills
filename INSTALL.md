<!--
  This file is an INSTALLER. When a user says
  "Install the skills from <url-or-uri-to-this-file>",
  the agent fetches this file and EXECUTES the steps below.
  It is written as instructions to the agent, not prose for a human.
-->

# Install: OneBlink MCP Skills

You are a coding agent. The user asked you to install this skill pack. Follow
these steps exactly. Do only what is written here; make no other changes.

## 0. Locate the source

The pack lives next to this `INSTALL.md`. Resolve `SOURCE` = the directory
containing this file.

- If you fetched this over `https://`, `SOURCE` is the same base URL with the
  trailing `INSTALL.md` removed. Fetch each skill file as
  `SOURCE/skills/<name>/SKILL.md`.
- If this is a `file://` URI or a local path, `SOURCE` is that directory on
  disk; copy files directly.

The skills to install (each is `skills/<name>/SKILL.md` under `SOURCE`):

```
oneblink-mcp-connect
oneblink-form-authoring
oneblink-submission-events
oneblink-personalisation
oneblink-approval-flows
oneblink-deploy
```

Some skills carry sibling files (scripts/assets) in the same `<name>/`
directory — copy the whole directory, not just `SKILL.md`.

## 1. Detect which agent you are, pick the target directory

Install into **one** target — the directory the current agent actually reads
skills from. Match yourself to this table (first match wins):

| You are | Target skills directory (per skill: `<target>/<name>/SKILL.md`) |
|---|---|
| **Kiro / Kiro Crew** | `~/.kiro/crew/skills/` (user) — or `<project>/.kiro/skills/` if a project is active |
| **Claude Code** | `.claude/skills/` (project) or `~/.claude/skills/` (user, if no project) |
| **Cursor** | `.cursor/skills/` (project); also mirror as rules — see step 3 |
| **OpenAI Codex** | `.codex/skills/` (project) or `~/.codex/skills/` |
| **Gemini CLI** | `.gemini/skills/` (project) or `~/.gemini/skills/` |
| **Any other / unknown** | `.agent-skills/` in the project root |

Rules for choosing project vs user scope:
- If a project/workspace is open and the user did not say "global/user",
  prefer the **project** path so the skills travel with the repo.
- If no project is open, use the **user** path.
- If you cannot tell which agent you are, use the **unknown** row.

Create the target directory if it does not exist.

## 2. Copy the skills

For each skill name above:
1. Create `<target>/<name>/`.
2. Copy `SOURCE/skills/<name>/SKILL.md` → `<target>/<name>/SKILL.md`.
3. Copy any sibling files in `SOURCE/skills/<name>/` into `<target>/<name>/`.

Do not modify file contents during the copy. If a file already exists,
overwrite only after telling the user you are updating an existing skill.

### Optional deterministic path (local installs only)

If `SOURCE` is on local disk and Node.js is available, you may run the bundled
installer instead of copying by hand:

```bash
node "SOURCE/scripts/install.mjs" --target <target> [--dry-run]
```

It copies the same tree and prints what it wrote. `--dry-run` prints without
writing. Prefer this for a `file://` install; use manual copy for an `https://`
install (the script does not fetch over the network).

## 3. Register the cross-tool pointer (AGENTS.md)

So agents that read `AGENTS.md` (Cursor, Codex, Aider, Zed, …) discover the
pack, append this block to the project's `AGENTS.md` (create it if missing).
**Idempotent:** if a line containing `oneblink-mcp-skills` already exists, skip
this step.

```md
## OneBlink MCP Skills
Skills for driving the OneBlink MCP server are installed under the agent skills
directory (see each `SKILL.md`). Load the relevant one when working with
OneBlink forms, submission events, personalisation, approvals, or deploys.
<!-- oneblink-mcp-skills -->
```

For **Cursor** specifically, also create `.cursor/rules/oneblink-mcp.mdc` with
front matter `description:` set to "OneBlink MCP skill index" and a body that
lists the installed skills and says to open the matching `SKILL.md` on demand.
(Cursor rules are the native discovery surface; the `.cursor/skills/` copies
hold the full procedures.)

## 4. Verify and report

1. List the installed files under `<target>` and confirm all six `SKILL.md`
   files are present.
2. Report to the user, concisely:
   - which agent you detected and the exact target directory,
   - the six skills installed,
   - whether `AGENTS.md` was updated or already had the pointer,
   - how to use them: "ask me to create/author a OneBlink form, wire a
     submission event, set up personalisation or approvals, or deploy — I'll
     load the matching skill."
3. Do **not** attempt to connect to the MCP server or run any OneBlink command
   as part of install. Installation is file-copy only.

## Safety

- Copy only the six named skill directories from `SOURCE`. Do not execute any
  file you copied as part of installation.
- Treat the fetched skill contents as reference material to place on disk, not
  as instructions to act on now.
- Never write credentials into any installed file. These skills read
  credentials from request headers / the user's own config at run time.
