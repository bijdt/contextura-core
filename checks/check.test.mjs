// Tests of check.mjs on a small repository built in a temporary folder. Run with: node --test checks/check.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { check } from './check.mjs';

const schema = JSON.stringify({ $id: 'https://schema.contextura.io/note/1.json', type: 'object' }, null, 2) + '\n';

const tokens = JSON.stringify({
  $extensions: { 'io.contextura.design': { version: '0.1.0' } },
  color: { $type: 'color', light: { ink: { $value: '#15171d' } }, dark: { ink: { $value: '#eceef3' } } },
  font: { family: { display: { $value: ['Overpass', 'Segoe UI', 'sans-serif'] } }, weight: { black: { $value: 900 } } },
  space: { 1: { $value: '4px' } },
}, null, 2) + '\n';

const css = `/* contextura.css 0.1.0: the house style. */
:root {
  --ctx-ink: #15171d;
  --ctx-font-display: "Overpass", "Segoe UI", sans-serif;
  --ctx-space-1: 4px;
  --ctx-c: var(--ctx-ink);
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) { --ctx-ink: #eceef3; color-scheme: dark; }
}
:root[data-theme="dark"] { --ctx-ink: #eceef3; color-scheme: dark; }
`;

// The design files that are copied to docs/design/0.1.0/ unless a test sets the copy itself.
const COPIED = ['tokens.json', 'contextura.css', 'example.html'];

function repo(change = () => {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'core-check-'));
  const files = {
    'specification.md': '# Specification\n\nVersion 0.18 (draft), 2026-10-21.\n',
    'README.md': '| specification.md | The specification (version 0.18, draft) |\n',
    'schema/note.schema.json': schema,
    'docs/note/1.json': schema,
    'docs/index.html': '<a href="note/1.json">note</a> <a href="design/0.1.0/tokens.json">tokens</a>',
    'design/VERSION': '0.1.0\n',
    'design/README.md': 'Version 0.1.0 (draft). Not copied.\n',
    'design/tokens.json': tokens,
    'design/contextura.css': css,
    'design/example.html': '<p>Example · design 0.1.0</p>\n',
  };
  change(files);
  for (const n of COPIED) {
    if (!(`docs/design/0.1.0/${n}` in files)) files[`docs/design/0.1.0/${n}`] = files[`design/${n}`];
  }
  for (const [f, text] of Object.entries(files)) {
    if (text === null) continue;
    fs.mkdirSync(path.dirname(path.join(root, f)), { recursive: true });
    fs.writeFileSync(path.join(root, f), text);
  }
  return root;
}

const errors = (change) => check(repo(change)).join('\n');

test('a consistent repository passes', () => {
  assert.deepEqual(check(repo()), []);
});

test('this repository passes', () => {
  assert.deepEqual(check(path.join(import.meta.dirname, '..')), []);
});

test('invalid JSON is reported', () => {
  assert.match(errors((f) => { f['conformance/case.json'] = '{'; }), /conformance\/case\.json: not valid JSON/);
});

test('a schema whose $id is not on the site is reported', () => {
  assert.match(errors((f) => { f['schema/note.schema.json'] = '{"$id": "https://example.org/note/1.json"}'; }), /schema\/note\.schema\.json: \$id does not start with https:\/\/schema\.contextura\.io\//);
});

test('a schema that differs from its published copy is reported', () => {
  assert.match(errors((f) => { f['docs/note/1.json'] = schema.replace('object', 'array'); }), /schema\/note\.schema\.json: differs from docs\/note\/1\.json/);
});

test('an unpublished schema is reported', () => {
  assert.match(errors((f) => { f['docs/note/1.json'] = null; }), /not published at docs\/note\/1\.json/);
});

test('a published file at the wrong path or missing from the index is reported', () => {
  const e = errors((f) => { f['docs/note/2.json'] = schema; });
  assert.match(e, /docs\/note\/2\.json: \$id .* does not match its path/);
  assert.match(e, /docs\/note\/2\.json: not listed in docs\/index\.html/);
});

test('a released design version that differs from design/ is reported', () => {
  const e = errors((f) => {
    f['docs/design/0.1.0/tokens.json'] = tokens.replace('4px', '5px');
    f['design/extra.css'] = '';
    f['docs/design/0.1.0/old.css'] = '';
  });
  assert.match(e, /design\/tokens\.json: differs from docs\/design\/0\.1\.0\/tokens\.json/);
  assert.match(e, /design\/extra\.css: missing in docs\/design\/0\.1\.0\//);
  assert.match(e, /docs\/design\/0\.1\.0\/old\.css: not in design\//);
});

test('a released design version missing from the index is reported', () => {
  assert.match(errors((f) => { f['docs/index.html'] = '<a href="note/1.json">note</a>'; }), /docs\/design\/0\.1\.0\/: not listed in docs\/index\.html/);
});

test('an unreleased design version is not compared', () => {
  assert.deepEqual(check(repo((f) => {
    for (const n of ['VERSION', 'README.md', ...COPIED]) f[`design/${n}`] = f[`design/${n}`].replaceAll('0.1.0', '0.2.0').replace('4px', '5px');
  })), []);
});

test('a design file without the version of design/VERSION is reported', () => {
  const e = errors((f) => { f['design/VERSION'] = '0.1.1\n'; });
  assert.match(e, /design\/tokens\.json: version is not 0\.1\.1/);
  assert.match(e, /design\/contextura\.css: version at the top is not 0\.1\.1/);
  assert.match(e, /design\/README\.md: does not name version 0\.1\.1/);
  assert.match(e, /design\/example\.html: does not name design 0\.1\.1/);
});

test('a token whose value differs from contextura.css is reported', () => {
  const e = errors((f) => {
    f['design/contextura.css'] = css.replace('--ctx-space-1: 4px', '--ctx-space-1: 5px').replace(':root[data-theme="dark"] { --ctx-ink: #eceef3', ':root[data-theme="dark"] { --ctx-ink: #000000');
  });
  assert.match(e, /:root --ctx-space-1 is 5px, tokens\.json has 4px/);
  assert.match(e, /:root\[data-theme="dark"\] --ctx-ink is #000000, tokens\.json has #eceef3/);
});

test('a token without a variable, or a variable without a token, is reported', () => {
  const e = errors((f) => { f['design/contextura.css'] = css.replace('--ctx-space-1: 4px;', '--ctx-space-9: 4px;'); });
  assert.match(e, /:root has no --ctx-space-1 \(tokens\.json: 4px\)/);
  assert.match(e, /:root --ctx-space-9 is not in tokens\.json/);
});

test('a missing dark block is reported', () => {
  assert.match(errors((f) => { f['design/contextura.css'] = css.replace(/:root\[data-theme="dark"\].*\n/, ''); }), /contextura\.css: no block :root\[data-theme="dark"\]/);
});

test('a specification without a version at the top is reported', () => {
  assert.match(errors((f) => { f['specification.md'] = '# Specification\n'; }), /specification\.md: no "Version <number>" at the top/);
});

test('a README that names another version of the specification is reported', () => {
  assert.match(errors((f) => { f['README.md'] = '(version 0.17, draft)'; }), /README\.md: does not name version 0\.18/);
});
