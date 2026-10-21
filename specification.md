# contextura-core: specification

Version 0.18 (draft), 2026-10-21. Belongs to contextura-core 0.22.0. Text under CC BY 4.0; the
reference implementation under MIT.

This document describes the format itself, apart from the code: whoever reads it must be able to build
their own implementation that reads and judges the same brain in the same way. The schemas
(`schema/*.schema.json`) belong to this text. The reference implementation (contextura-core: pure
functions in TypeScript, without files or processes) appears with version 1.0; the function names in
this text are those of contextura-core. Where this text and the code differ, that is an error in one
of the two; until version 1.0 the code wins and the text is updated.

**Must**, **may** and **not** are binding. An implementation conforms when it judges the examples in the
conformance tests of contextura-core the same way: the same errors, the same warnings, the same
graph. A case is data (JSON in `conformance/<group>/<name>.json`: a description, the function, the input
and the expected result), independent of a language; `conformance/README.md` describes the shape per
function. The messages of the cases are English; a few cases with `language: nl` expect the Dutch
translation.

Version 0.15 gives every name of the format an English name. The Dutch names of 0.14 are still read
until 1.0, with a warning; §15 describes the transition and the migration. Version 0.16 extends the kit
(`kit/2`: the sources notes and connection, the actions note and share) and the tile (`tile/2`: `button`, and
`input` on an action of a list); a file that was valid stays valid. Version 0.17 adds the client folder
(`client/<client>/`, §2): the knowledge of a client in one place, with the ordinary folders inside. Version 0.18
makes the score of the twin fairer with few predictions (§7), adds the gallery to the app manifest (`app/3`, §10c) and
the view floorplan to the kit (`kit/3`), each with its Dutch names in the table (§15).

## 1. Concepts

- **Brain**: a folder with Markdown notes and their attachments. A brain belongs to one owner.
- **Note**: a `.md` file with frontmatter (§3), on a path that is a note (§2).
- **Hub**: a note in `areas/` (or `client/<client>/areas/`) with the tag `area`; one per area of life, or per
  client.
- **Index**: a note that names every note from its folder, also from that folder in a client folder
  (`projects/projects.md`, `ideas/ideas.md`, `documents/documents.md`, and `areas/areas.md` for the hubs).
- **Error**: breaks the contract. **Warning**: a recommendation.
- **Persona**: the shareable, context-free part of what an owner knows about themselves (§9).
- **Pack**: shareable knowledge about a subject, with roles instead of the owner's own data (§10).

### Four layers

What a person or an organization keeps is in one of four layers. The format of a brain is the same in all of them;
the layers say where something belongs.

| Layer | Answers | Holds | Kept by |
|---|---|---|---|
| **Workspace** | how we work | tools and the rules of play: the registry (§11), shared agreements, hooks, checks, shared skills and agents | one platform team (at home: the owner) |
| **Organization context** | what we know and decide | concepts, architecture, decisions, ownership; shared knowledge that is not of one product | the organization |
| **Project** | what we build | one product per repo: its code, its plan and its own documentation | the team of that product |
| **Brain** | what the person knows | notes, people, documents, ideas, the persona, and personal skills and agents | one person |

Rule of thumb: what runs or is enforced for everyone belongs to the workspace; knowledge or a decision belongs to the
organization context; what belongs to one product belongs to the project; what belongs to the person belongs to the
brain. Personal skills and agents never bypass the workspace: what everyone should use goes as a proposal to the
workspace or the context. At home there is no shared context: the workspace and the brain are enough.

## 2. Folders

| Folder | What | Notes? |
|---|---|---|
| `inbox/` | raw input, not yet processed | no |
| `areas/` | the hubs, `areas/areas.md`, `todo` | yes |
| `notes/` | conversations, reports, memos, lists for an area | yes |
| `projects/` | one note per project | yes |
| `ideas/` | ideas that are not a project yet | yes |
| `documents/` | one note per digitized document | yes |
| `topics/` | knowledge per subject | yes |
| `people/` | people | yes |
| `attachments/` | originals (`attachments/<name>/`) | no |
| `requests/` | work for another project (messages) | no |
| `apps/` | settings of apps, `apps/<app-id>.yaml`; an own app from the kit also `apps/<app-id>.data.yaml` | no |
| `persona/` | the imported persona layer, read-only | yes, with its own contract (§9) |
| `client/` | the knowledge of clients: one folder `client/<client>/` per client, with the ordinary folders inside | yes, with `source: client` |
| `persona-proposal/`, `pack-proposal/`, `packs/`, `data-proposal/`, `data/`, `docs/` | proposals, packs, data packs, explanation | no |

A path (relative, with `/`) is a note when it ends in `.md`, no part starts with a dot, the first
part is not a folder from the "no" rows (except `persona/`) and the file name is not `AGENTS.md`,
`CLAUDE.md` or `README.md` (`isNotePath`). Other folders are allowed and contain notes.

### Client folder

Knowledge from a client (`source: client`) is in one place: `client/<client>/`, one folder per client, its name a
slug (`client/acme/`). The name `client/` is fixed, so a server or an app can leave out everything under it
without a setting. Inside are the ordinary folders: `areas/`, `notes/`, `people/`, `projects/`, `topics/`,
`documents/` and `attachments/` (the hub of the client is usually `client/<client>/areas/<client>.md`; a finished
engagement stays one folder). A note there counts as a note in the ordinary folder (`innerPath`, `folderOf`): it can
be a hub, belongs in the index of its folder at the root (`projects/projects.md`, `areas/areas.md`, ...), has
`area`, aliases and links like any other note, and its `name` is unique across the whole brain. A folder from the
"no" rows inside a client folder (`client/<client>/attachments/`, `client/<client>/inbox/`) holds no notes either.

- A note in `client/` **must** have `source: client`; a note directly in `client/` (outside the folder of a
  client) and a client folder whose name is not a slug are errors.
- A note with `source: client` outside `client/` is an error. Transition: as long as the brain has no note under
  `client/`, it is a warning, so a brain can move its client knowledge in its own time.
- Readers (§5) and bundles (§6) are unchanged: `source: client` is the owner only and never shared.
- In the graph a node in a client folder has `folder` the ordinary folder and `client` the name of the client.

## 3. Frontmatter

Every note starts with `---` and ends the frontmatter with `---` (or `...`). In between, lines
`key: value`, a list as `[a, b]` or as lines `- a` under `key:`. Values may be in single or double
quotes. No YAML comment in the fields `name`, `type`, `source`, `status`, `updated`, `idea`, `area`,
`kind`, `date`, `valid-until`, `reviewed`, `keep-until`, `superseded-by` and `experience`.

| Field | Required | Value |
|---|---|---|
| `name` | yes | slug `[a-z0-9]` with hyphens, equal to the file name, unique across all folders |
| `type` | yes | `note`, `decision` or `reference` |
| `source` | yes | `own`, `client` (confidential, from a client; only in `client/`, §2) or `public` |
| `status` | yes | `raw`, `distilled` or `archived` |
| `updated` | yes | `YYYY-MM-DD`, an existing date, not in the future |
| `description` | recommended (warning) | one line, at most 250 characters |
| `area` | no | name of a hub |
| `aliases`, `tags`, `attachments` | no | list of text; aliases unique across all notes |
| `idea` | no | `new`, `exploring`, `project`, `parked` or `rejected` |
| `scope` | no | `private`, `work` or `persona` (only in `persona/`) |
| `experience` | no | `engagement`, `employer`, `education`, `thesis`, `course` or `certificate` (§7) |
| `kind` | no | the kind of a document or project, in the owner's words |
| `date` | no | the date of a document |
| `valid-until` | no | date until which a document is valid |
| `original` | no | only `none`: there is no original to upload (§7) |
| `reviewed` | no | date of a deliberate check, not in the future |
| `keep-until` | no | date |
| `superseded-by` | no | `name` of an existing other note |
| `bundles` | no | list of bundles (§6); the first is the main bundle |
| `share` | no | only `never` |
| `readers` | no | list of readers (§5); empty is the owner only |

Other fields are allowed. "Future" is relative to the date in the earliest time zone (UTC+14).
Schema: `note.schema.json` (`note/3`). The frontmatter is read with `parseFrontmatter`, a note with
`noteFrom`, all notes with `notesFrom`; the check of a brain is `check` in `brain.ts`.

## 4. Links, hubs, indexes and attachments

- A link is `[[target]]`, `[[target|text]]` or `[[target#heading]]`, outside code. The target is resolved on
  `name`, then case-insensitively on `name`, then case-insensitively on an alias. A link that
  does not resolve is an error ("dead link").
- A note with `area` must be in that hub (a link to its `name`), unless it is archived
  or the hub has a generated block. A hub must be in `areas/areas.md`; a note in
  `projects/`, `ideas/` or `documents/` in its index, with the same exception. The same goes for a hub and a note in
  a client folder: `client/<client>/areas/<hub>.md` is a hub, and a note in `client/<client>/projects/` belongs in
  `projects/projects.md`.
- **Generated block**: between `<!-- brain:list begin -->` and `<!-- brain:list end -->` is a
  list that follows entirely from the frontmatter. A block that differs from what the frontmatter gives is
  a warning. The shape of the block is that of the reference implementation (`hubBlocks`); its headings
  follow the language of the brain (§8). The explanation after the count on the first line
  (`_12 notes, <explanation>._`) does not count: a tool may put its own explanation there. `setBlock`
  puts a block in a note.
- A note in `topics/` or `people/` that nothing links to is a warning ("orphan").
- Every path in `attachments` must be a file in the brain. A file under `attachments/` or
  `client/<client>/attachments/` (except `.gitkeep`, `isAttachmentPath`) that occurs in no frontmatter and in no
  text as `attachments/...` is a warning; in the text of a note in a client folder, `attachments/...` (relative, as
  `../attachments/...`) also counts for the attachments of that client.
- From 400 lines a note is "long" (warning). Two notes in the same folder (a client folder counts as the ordinary
  folder) with an equal or
  nearly equal name or alias are a warning (see `similarNames`).
- The title (the first heading `#`) is plain language with a capital letter; the slug stays in `name` and the
  file name. A title equal to the slug is a warning (except when archived).

## 5. Readers

`readers.json` at the root (optional, `readers.schema.json`): `readers` (id, name, role), `default` and
per hub `hubs`. Who besides the owner may read a note, from strong to weak: nobody with
`source: client`; the frontmatter `readers`; the readers of the hub (`area`, or the hub itself); `default`.
Without `readers.json` nobody. The owner always reads and is not in the list. An app that fetches for
a reader **must** shield with this rule when fetching, not in a prompt (`readersOf`).

## 6. Bundles and never sharing

`bundles.json` at the root (optional, `bundles.schema.json`): bundles with slug, title, kind
(`application`, `pack`, `persona`, `data`, `internal`), color (`light` and `dark`), for an application the
project, and rules (`folders`, `areas`, `tags`, `notes`); besides that `never` with rules and color, and `none`
with the color of what is unclassified. A bundle of kind `data` (a data set, such as prices) also has `source`
(where the data comes from, at most 300 characters), `license` (only one that allows passing it on: `own`,
`public-domain`, `CC0-1.0`, `PDDL-1.0`, `CC-BY-4.0`, `CC-BY-SA-4.0`, `ODC-By-1.0`, `ODbL-1.0`) and `refresh`
(`once`, `daily`, `weekly`, `monthly`, `yearly`); another bundle does not have those fields. The graph
(`graphFrom`) passes them on.

A note belongs to bundles, from strong to weak: its frontmatter `bundles`; the rules of the
bundles in the order of the file; the application whose project note it is or which it
links to (not a hub or index). It is **never shared** with `share: never`, `source: client`
or a rule of `never`; never always wins over a bundle (`classificationOf`).

## 7. Twin and metrics

`twin.json` (optional, `twin.schema.json`): version 1, settings (`dailyLimit` 1 to 100, `closed`
domains), test questions and a log of asked questions (form, layer, status, landing, with form `guess` a
score 0, 1 or 2, with a skipped question optionally the reason `known`, `irrelevant` or `personal`).
Optionally the state of the user: `milestones` (the milestones the user already saw, each once) and `record`
(`points` and `date` of the best result of a challenge). Never the answers themselves: those become
notes. Questions are never made from notes with `source: client` or `share: never`, or about a
closed domain. A fixed pool of questions belongs to the application (`questionsFor`, option `pool`).

The forms: `this-or-that`, `true-false`, `opinion`, `guess`, `gap` and `like` (short: one tap or one sentence),
`tell` and `upload` (heavy: at most 15 % of the questions of a day, at least one) and `resolve` (maintenance).
The layers: `thinking`, `knowing`, `judging` and `rhythm`.

- **tell**: an open question with one follow-up, about a note with `experience` without a heading about what the
  owner learned (`## What I learned`, `## What I know`, `## Lessons`, or in Dutch `## Wat ik leerde`,
  `## Wat ik weet`, `## Lessen`), about a project that moved in the last 30 days (ongoing learning), or about a
  knowledge area: a tag in at least three notes of which none has such a heading and that no persona note
  carries. The answer goes under that heading in the note about the experience or the area; client details only
  in a note with `source: client`, general lessons in a note of their own without client names.
- **upload**: the original of a note with `experience` `education`, `thesis`, `course` or `certificate`,
  or of a document, without `attachments`. The file comes through the inbox into `attachments/`; if the
  owner does not have it, then `original: none` in the frontmatter.
- **resolve**: a note without `area` (with the hubs as choices) and every error or warning of the check
  (`gapsFor`, third parameter: a list `{ source, message }`, also from a consistency check or from a
  model that found contradicting facts).

Tell and upload fill the coverage of the layer `knowing`, each their own gap (also about the same note);
resolve does not count as coverage.

**Score** (`scoreFor`): per layer and per domain, half accuracy and half coverage, from what there is.

- **Accuracy**: the points of the last 20 answered predictions (form `guess`, 0, 1 or 2 each) against the maximum,
  only from `MIN_GUESSES` (3) answered predictions; below that `accuracy` is null, so that one wrong guess does not
  put a layer at 0 % and an application can show "not enough yet".
- **Coverage**: the filled gaps against the filled and still open ones. Filled is an answered question with a source
  in the brain (not `like` or `resolve`), and an answered `gap` question from the pool of the application
  (`pool#<key>`, in a log of 0.14 `voorraad#<key>`); another question from the pool and a test question
  (`twin.json#<id>`) fill nothing. Open is a gap `gapsFor` still finds and that is not filled.
- A layer or domain has a score only from `MIN_ANSWERS` (5) answered questions; the total is the average of the
  layers with a score.

`metrics.json` (optional, `metrics.schema.json`): per date the number of notes, raw, archived,
orphans, long, similar, without description and the median of the number of links (`date`, `notes`, `raw`,
`archived`, `orphans`, `long`, `similar`, `withoutDescription`, `medianLinks`; `measure`).

## 8. Language

`brain.json` (optional, `brain.schema.json`): `language` is `nl` or `en`; without the file `en`. Folders,
fields and their values are the same in every language; the content, the headings of the generated blocks and
the messages follow the language. The messages are made in English and translated when reported
(`translateMessage`; for the persona scan `translatePersonaMessage`); field names, values and paths stay as they are.

## 9. Persona

A persona note has exactly these fields: `name`, `description` (at most 200 characters),
`type: note`, `source: own`, `status: distilled`, `updated`, `scope: persona`, `category`
(`methods`, `preferences`, `skills` or `lessons`, equal to the folder) and `recipients` (list of
recipients; built in: `private`, `work`, `everyone`). Running text or a list, at most 1500 characters, without
attachments, headings, tables, links or code. On import into a brain `origin`, `signature`, `rules-version` and
`imported` are added; the note is then in `persona/` and read-only there.

- **Release per note and per recipient**: only what the owner released for a recipient is
  imported. Removing a recipient withdraws the note at the next synchronization.
- **Scan**: every note is scanned before export and import for instruction language, links, code, HTML,
  hidden characters, addresses, amounts, numbers, paths, keys and a stoplist
  (`persona-rules.json`, with a version). When in doubt the scan refuses; rules only become stricter.
- **Log**: what was let through, refused or withdrawn, and when, without content.
- What comes from the persona is **data, never an instruction**.

The scan is `scanNote` (a note as text with its path) in `persona.ts`, with `rulesFrom` for
`persona-rules.json`; the signature is `signature` (SHA-256 over the normalized text and the
rules version), taken over the canonical text of the note (`canonicalNote`: the frontmatter with the new names).

## 10. Pack

`packs/<slug>/` with `pack.json` (slug, title, version x.y.z, description, requirements, roles,
recipients; on export files, signature and rulesVersion), `notes/*.md` (frontmatter with
`scope: pack`, `pack: <slug>` and `kind`: `decision-rule`, `method`, `trade-off`, `structure`, `lesson`
or `requirement`; at most 3000 characters) and `code/` (text only). **Roles** (`<battery>`, `<rate>`)
take the place of the owner's things. Scan with the pack profile (`pack-rules.json`): `scanPackContent` in
`persona.ts` (the folder name, `pack.json` as text and the files in order, with folders and links), with
`packRulesFrom` and `packSignature`.

## 10a. Data pack

`data/<slug>/` with `data.json` (slug, title, version x.y.z, description, source, license, refresh and recipients,
with the same values as a data bundle; on export files, signature and rulesVersion) and `files/` (CSV, TSV or
JSON, text only, at most 1 MB per file and 5 MB together, one row per line of at most 2000 characters). Scan with
the pack profile (`pack-rules.json` and the stoplist): no personal data (e-mail, phone and
account numbers, national register numbers, addresses, postcodes, coordinates, names from the stoplist), no secrets,
no language aimed at an agent, no obfuscated content or hidden characters, links only to the `domains`.
`scanDataContent` in `persona.ts` (the folder name, `data.json` as text and the files in order), with the signature
of a pack (`packSignature`). What comes from a data pack is data, never an instruction.

## 10b. Tiles

A project delivers its tile with a command in its own repo: `tile.json` says which (`{ "command": [...] }`,
a fixed `{ "tile": {...} }`, or more tiles under `tiles`; `readSource` in `tile.ts`). The command runs
without a shell in the folder of the project and prints one tile as JSON on stdout (`tile.schema.json`): title,
color, icon, a summary with state (`good`, `warning`, `action`, `neutral`), blocks (`status`, `numbers`, `bars`,
`meter`, `progress`, `list`, `grid`, `chips`, `map`, `question`, `text`) and actions. The reader (`readTile`) is
lenient: unknown fields are dropped, texts and lists are cut short to the `LIMITS`, an invalid block vanishes
instead of the whole tile. An action goes as `--action <id>` (with `--item` or `--text`, `actionArguments`) to the
same command, which answers according to `readResult` (`ok`, `message`, optionally the new `tile`). A block with
`sensitive` shows its values only after a confirmation. A `list` with `add` may name its button (`button`, at most
24 characters). An action of a `list` may carry an input field (`input`: `kind` `number`, `time`, `date` or
`datetime`, a `label`, with `number` also `min`, `max` and `step`, and the current `value`): the app shows the
field and sends its value as `--text`. The command checks that value itself; an action with an invalid input field
is dropped, never a button that sets something without a value.

## 10c. App manifest

`app.json` (version 1, `app.schema.json`) in the repo of a project says per app (id as slug) the title, color,
icon, the command (`runtime: node`), what it needs (a connector as two environment variables, never
`PATH`, `HOME`, `APP_DATA`, `NODE_OPTIONS`, `NODE_ENV`, `LD_PRELOAD` or `GIT_*`; a file in the brain) and whether
it can be configured via the brain: then the app reads `apps/<id>.yaml` and answers `--options` and
`--validate <file>` (`readValidation`). An app preferably publishes a JSON Schema for its `apps/<id>.yaml`. A
product may add its own fields; the readers leave them out.

### Gallery

How an app describes itself before it is installed (`app/3`; `readGallery` in `app.ts`, separate from
`readManifest`). All fields are optional; a value that is not right falls away.

- `category`: `home`, `garden`, `family`, `money`, `health`, `work` or `brain`.
- `explanation`: what the app does in a few sentences (at most 600 characters); `description` stays the one-liner.
- `brainConfig`: at most 8 conditions on the brain, so that an application can show what is already there and what
  is missing: `{ kind: file, path, explanation }` (a file in the brain), `{ kind: notes, folder, field?, minimum,
  explanation }` (at least `minimum` notes in a folder, optionally with `field` in the frontmatter) or
  `{ kind: text, explanation }` (not to be checked yet). Paths are relative, without `..` or hidden folders.
- `example`: a tile (§10b) with made-up data, shown before installing.
- `withoutModel`: at most 6 short texts (30 characters): what the app can do without a language model.
- `points`: what the app adds to the brain and the chat, 1 to 5: 1 by itself at the right moment, 2 live data or
  actions through a connector, 3 fixed rules as code, 4 quick capture without the chat, 5 showing what text cannot.
- `translations`: per language (two letters) `title`, `description` and `explanation`; a missing field falls back
  to the ordinary one.

The Dutch names of before are in the table (§15, kind `app.json`): `categorie`, `uitleg` (→ `explanation`,
not `description`, which is `beschrijving`), `voorbeeld` (with the names of a tile), `zonderModel`, `punten`,
`vertalingen`, and in a condition `soort` (`bestand`, `notities`, `tekst`), `pad`, `map` and `veld`.

## 11. Registry and workspaces

The registry belongs to the workspace layer (§1): it says which projects, brains and contexts belong to one
workspace, not what they contain. `projects.json` (`projects.schema.json`, version 1 and 2) describes which projects there are. In
version 2 a workspace (id, kind `device`, `service` or `organization`, owner as party id, members)
and parties: `person:<slug>`, `household:<slug>` or `company:<slug>`. Between two workspaces the relation is
**access** (same owner, no members) or **sharing** (everything else); with sharing only what is
released goes, and `source: client` never (see `relationOf` and `mayShareTo` in `model.ts`;
`normalizeRegistry` reads version 1 as version 2). The catalog `workspaces.json` follows in a later version. A
new workspace of one person is `planWorkspace` in `workspace.ts`: the registry (version 1, with a brain and a
persona, linked with recipient `private`) and per repo the files from the templates, with in the brain a person
note for the owner (`people/<name as slug>.md`), linked with every hub and back; an extra brain is `planBrain`,
the check `checkRegistry`. A brain can have **tracks** (one session per subject): per track a list of hubs, or an
object with `description`, `hubs`, `todo` (the lists of the to-dos of that track) and `rest` (this track gets what
belongs to no other); `tracksOf` in `model.ts` reads both shapes.

### Kit

An own app without code: `apps/<id>.yaml` with `kit: 1`, title, color, image, source, view, actions and
who (`kit.schema.json`), and the data separately in `apps/<id>.data.yaml` (`items`, at most 200;
`kit-data.schema.json`). The source is `own` (the data file), `brain` (a YAML file in the brain, with `write` to
change it), `notes` (notes with a `type`, `tag` or in a `folder`; the frontmatter, read only) or `connection`
(`service` `home-assistant` with `entities`, or `calendar` with `search` words in the title and `days` ahead, 1
to 62). A connection with Home Assistant may control what is in `write` (at most 10: `entity`, `operation`,
`label`, `min`, `max`, `step`), and only this: `on-off` for light, switch and input_boolean, `activate` for a
scene, `start` for a script, `open-close` and `position` for a cover, `temperature` for climate (`min` and `max`
required, between 10 and 25 in steps of 0.5), `number` for input_number and `datetime` for input_datetime; never
lock or alarm_control_panel. A source that only reads allows the actions `note` and `share` only (they do not
touch the data), and a timeline over notes or a connection needs no `every`: the date itself is the moment. The view `floorplan` (`kit/3`) places
every item on a site: `site: { width, depth }` in meters (required with a floorplan, not allowed with another view),
and in the data each item has the fixed keys `x`, `y`, `width` and `depth`, in meters from the top left corner of
the site; they are not in `fields`, which say what a tap on an item shows. An item without a place, or outside the
site, is only in the list. A floorplan allows the actions `add`, `note` and `share`. A data file without an app is an error. The data contains nothing with
`source: client` and nothing that is never shared: it is in the brain and goes along in export and clone. The
schemas are derived from the first application that uses the kit.

## 12. Export

An export is a brain: all notes with their frontmatter in the same folders, the attachments, the
JSON files at the root and `apps/`, plus a `README.md` with what is in it and the date. An export
**must** pass the check of §3 to §8 without errors and contain no secrets, and must be openable without the
application that made it (as a folder, or as a repo in a workspace of its own). No logs of
that application and no data of other users.

`validateExport` (`export.ts`) validates an export as a list of files: `README.md` at the root, the check of §3 to
§8 without errors, no data file in `apps/` without its app, no key, token, private key or secret with
a value, and no `.env` or key file. A reference to the secret store is allowed; `.git/` is not
validated. Personal data is no error: it is the user's own brain. Every finding has a
path, a fixed kind (`readme`, `format`, `orphan`, `secret`, `key-file`), a severity (`error` or `warning`) and
a text in the requested language (`en` or `nl`, by default `en`), so that an app shows them in its own words
without parsing the text. `belongsInExport` says which files belong in it: everything of the user (the inbox
too), not the hidden folders (`.git`, `.claude`, `.github`), `node_modules` and files that never belong in an
export; what only the application knows, it excludes itself.

## 13. Registry of the documentation

`documentation.json` at the root of the brain (optional, `documentation.schema.json`): `version` 1 and per
document an `id`, the `title`, `location` (a URL or `<repo>:<path>`), the `owner` (a project), the `kind`
(`generated`, with the `command` that makes it, or `manual`), whether it is `living` (by default yes), the `sources`
it follows from (`registry`, `data:<path>` or `<repo>:<path>`) and optionally a `note`. A living document is
**stale** when a source changed after its last publication; a document in a repo is published at its last
commit; a snapshot (`living: false`) is never stale. When something was published does not belong in the
registry but with the workspace that publishes (see `checkDocumentation` and `stateOf` in `documentation.ts`).

## 14. Versions

- This text has its own version (0.x until publication, then 1.0). A change that makes a brain that was
  valid until then invalid raises the major version.
- Every schema carries its name and version in its `$id`, a fixed web address:
  `https://schema.contextura.io/<name>/<version>.json`. A schema version no longer changes once it is
  published; a change that makes a file that was valid until then invalid is a new version. The schemas of
  0.18: `note/3`, `twin/3`, `brain/2`, `app/3`, `readers/1`, `bundles/1`, `metrics/1`, `documentation/1`,
  `projects/1`, `tile/2`, `kit/3` and `kit-data/1` (0.16 and 0.17 had `app/2` and `kit/2`, 0.15 also `tile/1` and
  `kit/1`).
- The code (`contextura-core`) follows semver and names the version of this text that it implements.

## 15. Migration from 0.14

Version 0.15 renames the format: every file, folder, field and value that had a Dutch name in 0.14 gets an
English one. The content of a brain (its notes, its headings, its language) does not change.

### Transition

- Until and including the last 0.x release, a reader **must** accept the old names. Each old name gives a
  warning, not an error, in the form `old name 'lezers': use 'readers'` (`oldName`), once per old name and file,
  and is read as the new name. When a key is present under both names, the new one wins, with the warning
  `both 'lezers' and 'readers': 'readers' wins`.
- A tool **must** write only the new names.
- From 1.0 an old name is an error.
- The conformance group `legacy` holds cases with the names of 0.14.

### The table

The renames are data: `migration/nl-en.json` in the standard. Readers (`legacy.ts`: `normalizeJson`,
`normalizeFrontmatter`, `newPath`, `oldFileNames`) and the migration (`migrateBrain`) both use that file, so they
cannot drift apart. Another implementation reads the same file. Keys are old names, values new names. The kinds:

- **files**: the JSON files of a brain and a project: `lezers.json` → `readers.json`, `bundels.json` →
  `bundles.json`, `metingen.json` → `metrics.json`, `documentatie.json` → `documentation.json`, `projecten.json` →
  `projects.json`, `werkplekken.json` → `workspaces.json`, `tegel.json` → `tile.json`, `persona-regels.json` →
  `persona-rules.json`, `pakket-regels.json` → `pack-rules.json`.
- **folders** (the first part of a path): `opdrachten/` → `requests/`, `persona-voorstel/` → `persona-proposal/`,
  `pakket-voorstel/` → `pack-proposal/`, `pakketten/` → `packs/`, `data-voorstel/` → `data-proposal/`.
- **paths**: the index notes (`projects/projecten.md` → `projects/projects.md`, `ideas/ideeen.md` →
  `ideas/ideas.md`, `documents/documenten.md` → `documents/documents.md`) and the persona category folders
  (`werkwijze/` → `methods/`, `voorkeuren/` → `preferences/`, `vaardigheden/` → `skills/`, `lessen/` → `lessons/`,
  in `persona/` and `persona-proposal/`).
- **patterns**: inside packs and data packs `pakket.json` → `pack.json`, `notities/` → `notes/`, `gegevens/` →
  `files/`; the data of a kit app `apps/<id>.gegevens.yaml` → `apps/<id>.data.yaml`.
- **aliases**: a renamed index note keeps its old name as an alias (`projects/projects.md` with
  `aliases: [projecten]`), so every existing `[[projecten]]` keeps resolving.
- **markers**: the generated block `<!-- brain:lijst begin -->` / `<!-- brain:lijst einde -->` →
  `<!-- brain:list begin -->` / `<!-- brain:list end -->`.
- **frontmatter**: keys (such as `idee` → `idea`, `ervaring` → `experience`, `bundels` → `bundles`, `delen` →
  `share`, `lezers` → `readers`, `soort` → `kind`, `categorie` → `category`, `vrijgave` → `recipients`,
  `handtekening` → `signature`, `pakket` → `pack`) and the values of known fields, keyed by the new field (such as
  `status: archief` → `archived`, `share: nooit` → `never`, `scope: prive` → `private`, the values of `idea`,
  `experience`, `category`, `kind` and `recipients`).
- **json**: per kind of file the keys and the values of known keys: `readers.json`, `bundles.json`, `twin.json`,
  `metrics.json`, `brain.json` (`taal` → `language`), `documentation.json`, `projects.json`, `tile.json`, the
  tile a command prints (`tile`), `app.json` (since 0.18 with the gallery and the names of a tile for its
  `example`), the answer to `--validate` (`validation`), the YAML of a kit app (`kit`, with `bouwdoos` → `kit`, and
  since 0.18 `plattegrond` → `floorplan`, `terrein` → `site`, `breedte` → `width`, `diepte` → `depth`), the data
  of a floorplan (`kit-data`: `breedte` and `diepte`; only for the data of a floorplan, other data keeps its own
  field names), `pack.json`, `data.json`, `persona-rules.json` and `pack-rules.json`.
- **prefixes**: party ids `persoon:` → `person:`, `gezin:` → `household:`, `bedrijf:` → `company:` (anywhere in
  `projects.json`) and the pool questions in the log of `twin.json` (`source`: `voorraad#` → `pool#`).

A few names are not in the table because they are not stored in a file: the answer of a tile command to an
action (`melding` → `message`, `tegel` → `tile`, read by `readResult` with a warning) and the command-line
arguments of tiles and apps (`--actie` → `--action`, `--tekst` → `--text`, `--keuzelijst` → `--options`,
`--toets` → `--validate`), which a project changes in its own command.

The schemas get English names: `lezers/1` → `readers/1`, `bundels/2` → `bundles/1`, `metingen/1` → `metrics/1`,
`documentatie/1` → `documentation/1`, `projecten/1` → `projects/1`, `tegel/1` → `tile/1`, `bouwdoos/1` → `kit/1`,
`bouwdoos-gegevens/1` → `kit-data/1`; the schemas that already had an English name get a new version:
`note/3`, `twin/3`, `brain/2`, `app/2`. The published schemas of 0.14 and earlier stay available at their
addresses, unchanged: a published version never changes, and a file of 0.14 can still be validated against them.

### The migration

`migrateBrain` (`migration.ts`) takes the files of a brain (or of a project repo with `tile.json` and `app.json`)
as data and returns what to rename (`renames`), what to rewrite (`edits`, the new text under the new path, with
the changes) and what it skipped (`skipped`, with the reason). A tool carries it out, preferably with a rename that
keeps the history of each file.

What it changes:

- folder and file names, the index notes (with `name` following the file name and the old name as an alias) and
  the persona category folders;
- the keys and the values of known fields in the frontmatter of notes, line by line, quoting and everything else
  as it is;
- the markers of the generated block;
- the JSON files at the root, in packs and in data packs, and the YAML of a kit app in `apps/` (a file with a top-level
  `kit` or `bouwdoos` key; its data file only for a floorplan, kind `kit-data`). The settings of an ordinary app
  (`apps/<id>.yaml` without that key) follow the schema of that app, not of the format, and stay as they are;
- `brain.json`: an existing brain without `brain.json` gets `{"language": "nl"}`, because its content is Dutch and
  the default changes (below).

What it never touches: running text, headings (such as `## Wat ik leerde`, which is recognized in both
languages), unknown fields, the name slugs of ordinary notes, links (they keep working through the aliases) and
the Markdown in `inbox/`, `requests/` and `docs/` and in `AGENTS.md`, `CLAUDE.md` and `README.md`. A rename whose
target already exists is skipped, as is a JSON file that is not valid JSON.

The migration is idempotent: on a migrated brain the result is empty.

### Signatures

Persona notes and packs are signed over their content with the new names. A persona note is signed over its
canonical text (`canonicalNote`: the old keys and values in the frontmatter renamed in place, the rest byte for
byte), so migrating a note does not change its signature. A pack is signed over `pack.json` with the new names,
the canonical paths of its files and the signatures of their canonical texts (`packSignature`); the hash itself
is the same as in 0.14. A signature made under the 0.14 names (over the old text) is still accepted, with the
warning "signed under the 0.14 names: export again", until the pack is exported again; for a persona note
`scanNote` gives that old signature next to the new one (`legacySignature`) so the tooling can accept it in the
same way.

### Default language

Without `brain.json` the language of a brain is now `en` (in 0.14 it was `nl`). The migration writes
`{"language": "nl"}` into every existing brain without `brain.json`, so its messages and generated blocks stay
Dutch. The conformance cases expect English messages; a few use `language: nl` to test the Dutch translation.

## 16. Not yet in this version

The schema for `apps/<app-id>.yaml` of an ordinary app (the app delivers that itself) and the catalog
`workspaces.json` (the workspaces of a party and who is a member of them).
