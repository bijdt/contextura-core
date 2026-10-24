// Tests of check.mjs on a small repository built in a temporary folder. Run with: node --test checks/check.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { check } from './check.mjs';

const schema = JSON.stringify({ $id: 'https://schema.contextura.io/note/1.json', type: 'object' }, null, 2) + '\n';

function repo(change = () => {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'core-check-'));
  const files = {
    'specification.md': '# Specification\n\nVersion 0.18 (draft), 2026-10-21.\n',
    'README.md': '| specification.md | The specification (version 0.18, draft) |\n',
    'schema/note.schema.json': schema,
    'docs/note/1.json': schema,
    'docs/index.html': '<a href="note/1.json">note</a> <a href="design/0.1.0/tokens.json">tokens</a>',
    'design/VERSION': '0.1.0\n',
    'design/README.md': 'not copied\n',
    'design/tokens.json': '{"a": 1}\n',
    'docs/design/0.1.0/tokens.json': '{"a": 1}\n',
  };
  change(files);
  for (const [f, text] of Object.entries(files)) {
    if (text === null) continue;
    fs.mkdirSync(path.dirname(path.join(root, f)), { recursive: true });
    fs.writeFileSync(path.join(root, f), text);
  }
  return root;
}

test('a consistent repository passes', () => {
  assert.deepEqual(check(repo()), []);
});

test('this repository passes', () => {
  assert.deepEqual(check(path.join(import.meta.dirname, '..')), []);
});

test('invalid JSON is reported', () => {
  assert.match(check(repo((f) => { f['conformance/case.json'] = '{'; })).join('\n'), /conformance\/case\.json: not valid JSON/);
});

test('a schema that differs from its published copy is reported', () => {
  assert.match(check(repo((f) => { f['docs/note/1.json'] = schema.replace('object', 'array'); })).join('\n'), /schema\/note\.schema\.json: differs from docs\/note\/1\.json/);
});

test('an unpublished schema is reported', () => {
  assert.match(check(repo((f) => { f['docs/note/1.json'] = null; })).join('\n'), /not published at docs\/note\/1\.json/);
});

test('a published file at the wrong path or missing from the index is reported', () => {
  const errors = check(repo((f) => { f['docs/note/2.json'] = schema; })).join('\n');
  assert.match(errors, /docs\/note\/2\.json: \$id .* does not match its path/);
  assert.match(errors, /docs\/note\/2\.json: not listed in docs\/index\.html/);
});

test('a released design version that differs from design/ is reported', () => {
  const errors = check(repo((f) => { f['design/tokens.json'] = '{"a": 2}\n'; f['design/extra.css'] = ''; })).join('\n');
  assert.match(errors, /design\/tokens\.json: differs from docs\/design\/0\.1\.0\/tokens\.json/);
  assert.match(errors, /design\/extra\.css: missing in docs\/design\/0\.1\.0\//);
});

test('an unreleased design version is not compared', () => {
  assert.deepEqual(check(repo((f) => { f['design/VERSION'] = '0.2.0\n'; f['design/tokens.json'] = '{"a": 2}\n'; })), []);
});

test('a README that names another version of the specification is reported', () => {
  assert.match(check(repo((f) => { f['README.md'] = '(version 0.17, draft)'; })).join('\n'), /README\.md: does not name version 0\.18/);
});
