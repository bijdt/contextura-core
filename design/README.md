# contextura-core: design

The house style of Contextura, shared by every surface that shows it: generated pages, workplaces, apps and sites.
It is the style of the metro maps: each process is a line in its own colour, a brain is a station, content passes
gates on its way to the exchange.

Version 0.1.0 (draft), 2026-10-21. The version is in [`VERSION`](VERSION) and at the top of each file.

| File | What |
|---|---|
| [`tokens.json`](tokens.json) | The tokens: colours with a meaning (light and dark), fonts, spacing, radii and the stroke widths of the map, in the format of the W3C Design Tokens Community Group |
| [`contextura.css`](contextura.css) | The tokens as CSS variables (`--ctx-…`) for light and dark, the fonts from Google Fonts, and the parts of the metro map as classes (`.ctx-…`); no JavaScript |
| [`example.html`](example.html) | The teaser metro map rebuilt with the stylesheet only |
| [`components.html`](components.html) | Every token and every part on one page |

## Colours

| Token | Light | Dark | Meaning |
|---|---|---|---|
| `home` | `#f7931e` | `#f5a54a` | The home brain: personal and family knowledge |
| `work` | `#1565c0` | `#5aa6f0` | The work brain |
| `company` | `#0a9a5a` | `#3fc48a` | The company brain: shared context of an organization |
| `platform` | `#7b3fb5` | `#b48cf0` | Sharing: the exchange, personas, packs |
| `alert` | `#c62828` | `#ef6b6b` | Errors, what never leaves |
| `muted` | `#8a8f99` | `#7d8290` | Connections, inactive parts |
| `paper` | `#fdfdfb` | `#121419` | Page background |
| `surface` | `#ffffff` | `#1a1d24` | Cards, the inside of a station |
| `ink` | `#15171d` | `#eceef3` | Text, the person, transfers, the terminus |

Also `platform-ink`, `ink-soft`, `rule`, and the lamp colours `ok` and `warn`; see `tokens.json`.

## Use

```html
<link rel="stylesheet" href="contextura.css">
<body class="ctx-page">
  <svg class="ctx-map" viewBox="0 0 400 200">
    <path class="ctx-line ctx-work" d="M40 100 H360"/>
    <circle class="ctx-station ctx-work" cx="200" cy="100" r="60"/>
    <text class="ctx-station-name" x="200" y="106" text-anchor="middle">Work</text>
  </svg>
</body>
```

- A line colour (`.ctx-home`, `.ctx-work`, `.ctx-company`, `.ctx-platform`, `.ctx-alert`, `.ctx-muted`, `.ctx-ink`)
  sets `--ctx-c`; every part inside that element takes it.
- Dark follows `prefers-color-scheme`; `data-theme="light"` or `data-theme="dark"` on the root element fixes one.
- The stylesheet styles no bare elements: a page that includes it changes only where it uses a `ctx-` class.

## Versions

An implementation takes the folder over as a copy, with its version (for example `vendor/contextura-core/design/`),
like the specification. A published version never changes: a change to a token value, a class name or the meaning
of a part is a new version. Until 1.0 a minor version may rename or remove; from 1.0 that is a major version.
