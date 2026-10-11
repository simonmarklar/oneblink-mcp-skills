#!/usr/bin/env node
// Deterministic installer for the OneBlink MCP Skills pack (LOCAL installs only).
// Copies skills/<name>/ from this pack into a target skills directory.
// No network, no dependencies. For https:// installs, the agent copies by hand
// per INSTALL.md instead of running this.
//
//   node scripts/install.mjs --target <dir> [--dry-run]
//
// --target   Destination skills dir, e.g. ~/.kiro/crew/skills or .claude/skills
// --dry-run  Print the file set without writing.

import { readdirSync, statSync, mkdirSync, copyFileSync, existsSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const SKILLS = [
  'oneblink-mcp-connect',
  'oneblink-form-authoring',
  'oneblink-submission-events',
  'oneblink-personalisation',
  'oneblink-approval-flows',
  'oneblink-deploy',
]

function parseArgs(argv) {
  const out = { target: null, dryRun: false }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--dry-run') out.dryRun = true
    else if (a === '--target') out.target = argv[++i]
    else if (a.startsWith('--target=')) out.target = a.slice('--target='.length)
  }
  return out
}

function fail(msg) {
  console.error('install.mjs: ' + msg)
  process.exit(1)
}

function expandHome(p) {
  if (p === '~' || p.startsWith('~/') || p.startsWith('~\\')) {
    const home = process.env.HOME || process.env.USERPROFILE
    if (!home) fail('cannot expand ~ (no HOME/USERPROFILE)')
    return join(home, p.slice(1))
  }
  return p
}

function walk(dir, base, acc) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    const rel = base ? join(base, name) : name
    if (statSync(full).isDirectory()) walk(full, rel, acc)
    else acc.push(rel)
  }
  return acc
}

const args = parseArgs(process.argv.slice(2))
if (!args.target) fail('missing --target <dir>')

const here = dirname(fileURLToPath(import.meta.url))
const packRoot = resolve(here, '..')
const skillsRoot = join(packRoot, 'skills')
const target = resolve(expandHome(args.target))

if (!existsSync(skillsRoot)) fail('skills/ not found next to the installer at ' + skillsRoot)

let count = 0
for (const skill of SKILLS) {
  const src = join(skillsRoot, skill)
  if (!existsSync(src)) fail('missing skill directory: ' + src)
  const files = walk(src, '', [])
  for (const rel of files) {
    const from = join(src, rel)
    const to = join(target, skill, rel)
    if (args.dryRun) {
      console.log('would write ' + to)
    } else {
      mkdirSync(dirname(to), { recursive: true })
      copyFileSync(from, to)
      console.log('wrote ' + to)
    }
    count++
  }
}

console.log(
  (args.dryRun ? 'DRY RUN: ' : '') +
    count + ' file(s) across ' + SKILLS.length + ' skill(s) -> ' + target,
)
