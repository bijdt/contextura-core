# Conformance tests

An implementation of contextura-core conforms when it gives the same result for every case in this folder: the
same errors, the same warnings, the same graph. The cases are data (JSON), independent of a language or an
implementation.

Each case is a file `<group>/<name>.json`:

```json
{
  "description": "What the case pins down.",
  "function": "brain.check",
  "input": { "files": { "notes/roof.md": "---\nname: roof\n..." } },
  "expected": { "notes/roof.md": { "errors": ["..."], "warnings": [] } }
}
```

| Function | Input | Expected |
|---|---|---|
| `brain.check` | `files`: path to text (`null` for a file without text, such as an attachment); optional `language` (`en` or `nl`) for the messages | per path with something: `errors` and `warnings` |
| `brain.graph` | `files` | the graph: `nodes`, `edges`, `deadLinks`, `bundles`, `colors` |
| `twin.check` | `twin`: the content of `twin.json` | `errors` |
| `export.validate` | `files`, optional `language` (`en` or `nl`) | `valid`, `findings` (path, kind, severity, text), `counts` |
| `registry.tracks` | `registry` (the content of `projects.json`) and `brain` | the tracks |

JSON files at the root (`bundles.json`, `readers.json`, `twin.json`, `brain.json`, `metrics.json`) are text in
`files`; attachments are the paths under `attachments/` and `client/<client>/attachments/`. The check of a brain
depends on the day (no date in the future): the cases use only dates in the past, or a date far in the future.

The messages are English; a case with `language: nl` expects the Dutch translation. The group `legacy` holds the
Dutch names of 0.14, which a reader accepts until 1.0 with a warning per old name (specification, Migration from
0.14).

No case with a real key or token: such a file would itself contain a secret. The detection of secrets is in the
specification (§12) and in the unit tests of the reference implementation.

`conformance.ts` is the runner of the reference implementation: it couples a case to its functions. Another
implementation writes its own runner and compares its result with `expected`.
