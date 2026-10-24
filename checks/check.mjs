// Checks the rules of AGENTS.md that hold between files: every JSON file parses, every schema in schema/ is published
// byte for byte under docs/ at its $id, every published JSON file sits at the path of its $id and is listed in
// docs/index.html, a released design version equals design/, and the README names the version of the specification.
// Node 22 or later, no dependencies. Usage: node checks/check.mjs [root]; exits 1 with one line per error.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = 'https://schema.contextura.io/';
const SKIP = new Set(['.git', 'node_modules']);

function walk(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

const rel = (root, p) => path.relative(root, p).split(path.sep).join('/');

export function check(root) {
  const errors = [];
  const json = new Map();
  for (const f of walk(root).filter((f) => f.endsWith('.json'))) {
    try { json.set(rel(root, f), JSON.parse(fs.readFileSync(f, 'utf8'))); }
    catch (e) { errors.push(`${rel(root, f)}: not valid JSON (${e.message})`); }
  }

  // Every schema is published at its $id, byte for byte.
  for (const [file, doc] of json) {
    if (!/^schema\/[^/]+\.schema\.json$/.test(file)) continue;
    const id = doc.$id;
    if (typeof id !== 'string' || !id.startsWith(SITE)) { errors.push(`${file}: $id does not start with ${SITE}`); continue; }
    const published = path.join(root, 'docs', id.slice(SITE.length));
    if (!fs.existsSync(published)) errors.push(`${file}: not published at docs/${id.slice(SITE.length)}`);
    else if (!fs.readFileSync(published).equals(fs.readFileSync(path.join(root, file)))) errors.push(`${file}: differs from docs/${id.slice(SITE.length)}`);
  }

  // Every published JSON file with a $id sits at that path and is listed in the index.
  const indexPath = path.join(root, 'docs', 'index.html');
  const index = fs.existsSync(indexPath) ? fs.readFileSync(indexPath, 'utf8') : '';
  for (const [file, doc] of json) {
    if (!file.startsWith('docs/') || file.startsWith('docs/design/') || typeof doc.$id !== 'string') continue;
    const at = file.slice('docs/'.length);
    if (doc.$id !== SITE + at) errors.push(`${file}: $id ${doc.$id} does not match its path`);
    if (!index.includes(`href="${at}"`)) errors.push(`${file}: not listed in docs/index.html`);
  }

  // A released design version (docs/design/<VERSION>/) equals design/; an unreleased one is not checked.
  const versionFile = path.join(root, 'design', 'VERSION');
  if (fs.existsSync(versionFile)) {
    const version = fs.readFileSync(versionFile, 'utf8').trim();
    const released = path.join(root, 'docs', 'design', version);
    if (fs.existsSync(released)) {
      const names = (d) => fs.readdirSync(d).filter((n) => !['README.md', 'VERSION'].includes(n)).sort();
      const source = names(path.join(root, 'design'));
      const copy = names(released);
      for (const n of source.filter((n) => !copy.includes(n))) errors.push(`design/${n}: missing in docs/design/${version}/`);
      for (const n of copy.filter((n) => !source.includes(n))) errors.push(`docs/design/${version}/${n}: not in design/`);
      for (const n of source.filter((n) => copy.includes(n))) {
        if (!fs.readFileSync(path.join(root, 'design', n)).equals(fs.readFileSync(path.join(released, n)))) errors.push(`design/${n}: differs from docs/design/${version}/${n}`);
      }
      if (!index.includes(`href="design/${version}/`)) errors.push(`docs/design/${version}/: not listed in docs/index.html`);
    }
  }

  // The README names the version at the top of the specification.
  const spec = path.join(root, 'specification.md');
  const readme = path.join(root, 'README.md');
  if (fs.existsSync(spec) && fs.existsSync(readme)) {
    const m = fs.readFileSync(spec, 'utf8').match(/^Version (\d+\.\d+)/m);
    if (!m) errors.push('specification.md: no "Version <number>" at the top');
    else if (!fs.readFileSync(readme, 'utf8').includes(`version ${m[1]}`)) errors.push(`README.md: does not name version ${m[1]} of the specification`);
  }
  return errors;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = path.resolve(process.argv[2] ?? path.join(path.dirname(fileURLToPath(import.meta.url)), '..'));
  const errors = check(root);
  for (const e of errors) console.error(e);
  console.log(errors.length ? `${errors.length} error(s)` : 'all checks pass');
  process.exit(errors.length ? 1 : 0);
}
