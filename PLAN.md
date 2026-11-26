# PLAN.md — contextura-core

This repository is public: this plan uses the same public terms as the rest of it (no names, no internal references).

## Analysis

contextura-core is an open standard: a specification, JSON Schemas, conformance cases as data and a house style, with
the schemas published at https://schema.contextura.io. Until version 1.0 the specification, the schemas and the cases
are copied here from the reference implementation; with 1.0 the implementation moves here and this repository becomes
the source.

## Publication

- **How the site deploys**: GitHub Pages, classic build from the folder `docs/` on `main` (custom domain
  `schema.contextura.io` in `docs/CNAME`, HTTPS enforced). Every merge into `main` publishes; there is no separate
  release step and no workflow involved.
- **What is live**: the commit of the latest Pages build, read with
  `gh api repos/bijdt/contextura-core/pages/builds/latest --jq '.status, .commit'`. Live equals `main` when that build
  has status `built` and its commit is `origin/main`. Only changes under `docs/` change the site.
- On 2026-10-24 the latest build is `b348dbb` (`built`), equal to `main`: specification 0.18, the twelve current schemas,
  the schemas of 0.14 to 0.17 and design 0.1.0.

## Steps

| # | Step | Status | Note |
|---|---|---|---|
| 1 | Specification and twelve schemas published, schemas at their `$id` on schema.contextura.io | klaar | specification 0.18 (draft, 2026-10-21) |
| 2 | Format in English (0.15), with the migration from the Dutch names of 0.14 | klaar | `migration/nl-en.json` |
| 3 | `main` only through a pull request | klaar | `AGENTS.md`, ruleset "main via pull request" on GitHub |
| 4 | House style `design/` 0.1.0, released and published | klaar | tag `design-0.1.0`, `docs/design/0.1.0/` |
| 5 | Audit 2026-10-22 | klaar | `docs/audit-2026-10-22.md`; findings followed up below |
| 6 | Follow up the audit of 2026-10-22: this plan, the findings as rows, how the site deploys and what is live | klaar | PR #7 |
| 7 | Version 1.0: the reference implementation and the runner of the conformance cases move into this repository | open · later | when the specification is 1.0 |

Status: `open`, `bezig`, `klaar`, `geparkeerd`, followed by the priority: `· nu`, `· later` or `· parkeren`.

## Backlog

The findings of the audit of 2026-10-22 (`docs/audit-2026-10-22.md`), numbered as there.

| # | Finding | Status | Note |
|---|---|---|---|
| A1 | No automated check guards the rules in `AGENTS.md` | klaar | `checks/check.mjs` with tests, run by `.github/workflows/check.yml` on every pull request and push to `main`; B1 and B2 close what it did not cover |
| A2 | No `.gitignore` | klaar | `.gitignore` with `.env*`, local tool and editor settings |
| A3 | The version 0.22.0 in the header of the specification is not explained | klaar | one sentence in the README (section Status) |
| A4 | `contextura.css` loads its fonts from Google Fonts | open · later | in a next design version: host the fonts or mention it in `design/README.md`; 0.1.0 stays unchanged |
| A5 | Placeholder `{{eigenaar}}` in schema descriptions | open · later | with the next version of the `projects` schema, a neutral placeholder; published versions stay unchanged |
| A6 | Branch `specificatie-0.18` merged but not deleted | open · nu | the owner may delete it |
| A7 | The language of commit messages is not set | klaar | `AGENTS.md`, section Git: commit messages and pull requests in English |
| B1 | The check does not compare `tokens.json` with `contextura.css` | klaar | from A1; `designTokens` in `checks/check.mjs`, with tests |
| B2 | The check does not compare `design/VERSION` with the top of the design files, and several of its branches have no test | klaar | `designVersion` in `checks/check.mjs`; every error the check reports now has a test |

## Decisions

| Date | Decision | Why |
|---|---|---|
| 2026-10-24 | A `PLAN.md` in this repository, written in public terms only: steps, decisions and backlog, without names or references to anything outside it | the audit findings were followed up nowhere; an earlier plan with references to internal work could not be public |
| 2026-10-24 | The check (`checks/check.mjs`) is plain Node.js without dependencies, run by a GitHub workflow on pull requests and on `main` | nothing to install; the same command runs locally and in CI |
| 2026-10-24 | The check compares a design version with `design/` only once it is released (`docs/design/<VERSION>/` exists) | work on a next design version happens in `design/` before it is released |
| 2026-10-24 | What is live on schema.contextura.io is the commit of the latest Pages build | Pages builds `docs/` on `main` by itself; the build's commit is what is served |
| 2026-10-27 | The check compares every token of `tokens.json` that has a CSS variable with `contextura.css`, both ways: light tokens in `:root`, dark colours in both dark blocks; font weights have no variable, quotes around font names do not count | `AGENTS.md` says the two files carry the same values; until now only an audit by hand checked it |
