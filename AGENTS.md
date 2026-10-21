# contextura-core: instructions for agents

This public repository holds the open standard contextura-core: the specification (`specification.md`), the JSON
Schemas (`schema/`), the conformance cases (`conformance/`), the translation table of 0.15 (`migration/`) and the
site at https://schema.contextura.io (`docs/`). Everything here is public: no secrets, no personal data, no names of
clients or people, no local paths and no references to internal repositories or notes.

## How the content changes

- Until version 1.0 the specification, the schemas and the conformance cases are maintained together with the
  reference implementation and copied here as one version. Do not edit them here by hand: a change made only here
  drifts from the implementation that produces the expected results of the cases.
- Each version of the specification states its number and date at the top; the README names the same version.
- A published schema version never changes. A schema is published as `docs/<name>/<version>.json` at the URL of its
  `$id`, and `docs/index.html` lists it. A change that makes a valid file invalid is a new version.
- The conformance cases are data. A new case or a changed expected result comes with the change to the
  specification that explains it.

## Git

- `main` is protected: every change goes through a pull request, and the owner merges it. Never push to `main`
  directly, never force-push, never delete `main`.
- Open the pull request as a draft, mark it ready with `gh pr ready` when it is complete, and leave it open for
  review. Do not merge your own pull request.
- A new version of the specification (its number at the top, the README, a tag) is released only when the owner asks
  for it.
- Commits use the identity configured in this clone (the organization), never a personal name.
