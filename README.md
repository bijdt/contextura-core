# contextura-core

An open format for a personal knowledge base that an AI assistant can read and extend: a **brain** (notes in
Markdown with frontmatter, hubs, links and attachments), a **persona** (the shareable, context-free part of it),
**packs**, the **twin**, **readers** and **bundles** (what may be shared and what never), **tiles** and **apps**, the
**registry** of a workspace and the **export format**.

A brain is a plain folder of text files: readable without special software, manageable with git, open in any
editor. This standard defines what a valid brain is, so different programs read, check and share the same brain in
the same way.

## Contents

| Path | What |
|---|---|
| [`specification.md`](specification.md) | The specification (version 0.16, draft) |
| [`schema/`](schema/) | JSON Schemas for the files the specification describes |
| [`conformance/`](conformance/) | The conformance tests: cases as data (input and expected result), independent of a language |
| [`migration/`](migration/) | The translation table from the Dutch names of 0.14 to the English names of 0.15 (`nl-en.json`), used by readers and by the migration |
| [`docs/`](docs/) | The site at https://schema.contextura.io: every schema at its `$id` (`<name>/<version>.json`), made from `schema/` |

## Status

Draft. Until version 1.0 the format can still change; each version is at the top of the specification. An
implementation conforms when it gives the same result for every case in `conformance/`. The reference
implementation (pure functions in TypeScript, without files or processes, with the runner of the cases) appears in
this repo with version 1.0.

Version 0.15 renamed the format from Dutch to English. Until the last 0.x release a reader accepts the Dutch names
of 0.14 with a warning; see the chapter "Migration from 0.14" of the specification. The schemas of 0.14 stay
published under their Dutch names.

## License

- The text of the specification: [CC BY 4.0](LICENSE) (free to use, implement and cite, with attribution).
- The schemas in `schema/`, the cases in `conformance/` and the table in `migration/`: MIT
  ([schema/LICENSE](schema/LICENSE), [conformance/LICENSE](conformance/LICENSE), [migration/LICENSE](migration/LICENSE)),
  so an implementation can include them without conditions.

© 2026 BIJDT
