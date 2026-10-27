// Checks the rules of AGENTS.md that hold between files: every JSON file parses, every schema in schema/ is published
// byte for byte under docs/ at its $id, every published JSON file sits at the path of its $id and is listed in
// docs/index.html, design/VERSION is at the top of every design file, tokens.json and contextura.css carry the same
// values, a released design version equals design/, and the README names the version of the specification.
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
const read = (root, f) => (fs.existsSync(path.join(root, f)) ? fs.readFileSync(path.join(root, f), 'utf8') : null);
const sameBytes = (a, b) => fs.readFileSync(a).equals(fs.readFileSync(b));

// Every JSON file parses; returns the parsed files by relative path.
function parseJson(root, errors) {
  const json = new Map();
  for (const f of walk(root).filter((f) => f.endsWith('.json'))) {
    try { json.set(rel(root, f), JSON.parse(fs.readFileSync(f, 'utf8'))); }
    catch (e) { errors.push(`${rel(root, f)}: not valid JSON (${e.message})`); }
  }
  return json;
}

// Every schema is published at its $id, byte for byte.
function schemasPublished(root, json, errors) {
  for (const [file, doc] of json) {
    if (!/^schema\/[^/]+\.schema\.json$/.test(file)) continue;
    const id = doc.$id;
    if (typeof id !== 'string' || !id.startsWith(SITE)) { errors.push(`${file}: $id does not start with ${SITE}`); continue; }
    const at = `docs/${id.slice(SITE.length)}`;
    if (!fs.existsSync(path.join(root, at))) errors.push(`${file}: not published at ${at}`);
    else if (!sameBytes(path.join(root, at), path.join(root, file))) errors.push(`${file}: differs from ${at}`);
  }
}

// Every published JSON file with a $id sits at that path and is listed in the index.
function publishedListed(json, index, errors) {
  for (const [file, doc] of json) {
    if (!file.startsWith('docs/') || file.startsWith('docs/design/') || typeof doc.$id !== 'string') continue;
    const at = file.slice('docs/'.length);
    if (doc.$id !== SITE + at) errors.push(`${file}: $id ${doc.$id} does not match its path`);
    if (!index.includes(`href="${at}"`)) errors.push(`${file}: not listed in docs/index.html`);
  }
}

// design/VERSION is at the top of tokens.json, contextura.css, the README and the example pages.
function designVersion(root, version, json, errors) {
  const tokens = json.get('design/tokens.json');
  if (tokens && tokens.$extensions?.['io.contextura.design']?.version !== version) errors.push(`design/tokens.json: version is not ${version}`);
  const css = read(root, 'design/contextura.css');
  if (css !== null && !css.startsWith(`/* contextura.css ${version}`)) errors.push(`design/contextura.css: version at the top is not ${version}`);
  const readme = read(root, 'design/README.md');
  if (readme !== null && !readme.includes(`Version ${version} `)) errors.push(`design/README.md: does not name version ${version}`);
  for (const n of fs.readdirSync(path.join(root, 'design')).filter((n) => n.endsWith('.html'))) {
    if (!read(root, `design/${n}`).toLowerCase().includes(`design ${version}`)) errors.push(`design/${n}: does not name design ${version}`);
  }
}

// The CSS variables (--ctx-<name>) declared in the first block of css with this selector.
function cssVariables(css, selector) {
  const start = css.indexOf(`${selector} {`);
  if (start < 0) return null;
  const block = css.slice(start, css.indexOf('}', start));
  return new Map([...block.matchAll(/--ctx-([\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
}

// The tokens of tokens.json that contextura.css carries, by variable name and theme (light or dark). Font weights
// have no variable.
function tokenVariables(tokens) {
  const vars = { light: new Map(), dark: new Map() };
  const values = (group) => Object.entries(group ?? {}).filter(([k]) => !k.startsWith('$')).map(([k, t]) => [k, t.$value]);
  for (const theme of ['light', 'dark']) for (const [k, v] of values(tokens.color?.[theme])) vars[theme].set(k, String(v));
  for (const [k, v] of values(tokens.font?.family)) vars.light.set(`font-${k}`, v.join(', '));
  for (const group of ['space', 'radius', 'stroke']) for (const [k, v] of values(tokens[group])) vars.light.set(`${group}-${k}`, String(v));
  return vars;
}

// tokens.json and contextura.css carry the same values: the light tokens in :root, the dark colours in both dark
// blocks (the media query and data-theme="dark"). Quotes around font names do not count.
function designTokens(root, json, errors) {
  const tokens = json.get('design/tokens.json');
  const css = read(root, 'design/contextura.css');
  if (!tokens || css === null) return;
  const norm = (v) => v.replace(/"/g, '').toLowerCase();
  const want = tokenVariables(tokens);
  const blocks = [
    [':root', want.light],
    [':root:not([data-theme="light"])', want.dark],
    [':root[data-theme="dark"]', want.dark],
  ];
  for (const [selector, tokensHere] of blocks) {
    const vars = cssVariables(css, selector);
    if (!vars) { errors.push(`design/contextura.css: no block ${selector}`); continue; }
    for (const [k, v] of tokensHere) {
      if (!vars.has(k)) errors.push(`design/contextura.css: ${selector} has no --ctx-${k} (tokens.json: ${v})`);
      else if (norm(vars.get(k)) !== norm(v)) errors.push(`design/contextura.css: ${selector} --ctx-${k} is ${vars.get(k)}, tokens.json has ${v}`);
    }
    for (const [k, v] of vars) {
      if (!v.startsWith('var(') && !tokensHere.has(k)) errors.push(`design/contextura.css: ${selector} --ctx-${k} is not in tokens.json`);
    }
  }
}

// A released design version (docs/design/<VERSION>/) equals design/; an unreleased one is not checked.
function designReleased(root, version, index, errors) {
  const released = path.join(root, 'docs', 'design', version);
  if (!fs.existsSync(released)) return;
  const names = (d) => fs.readdirSync(d).filter((n) => !['README.md', 'VERSION'].includes(n)).sort();
  const source = names(path.join(root, 'design'));
  const copy = names(released);
  for (const n of source.filter((n) => !copy.includes(n))) errors.push(`design/${n}: missing in docs/design/${version}/`);
  for (const n of copy.filter((n) => !source.includes(n))) errors.push(`docs/design/${version}/${n}: not in design/`);
  for (const n of source.filter((n) => copy.includes(n))) {
    if (!sameBytes(path.join(root, 'design', n), path.join(released, n))) errors.push(`design/${n}: differs from docs/design/${version}/${n}`);
  }
  if (!index.includes(`href="design/${version}/`)) errors.push(`docs/design/${version}/: not listed in docs/index.html`);
}

// The README names the version at the top of the specification.
function specVersion(root, errors) {
  const spec = read(root, 'specification.md');
  const readme = read(root, 'README.md');
  if (spec === null || readme === null) return;
  const m = spec.match(/^Version (\d+\.\d+)/m);
  if (!m) errors.push('specification.md: no "Version <number>" at the top');
  else if (!readme.includes(`version ${m[1]}`)) errors.push(`README.md: does not name version ${m[1]} of the specification`);
}

export function check(root) {
  const errors = [];
  const json = parseJson(root, errors);
  const index = read(root, 'docs/index.html') ?? '';
  schemasPublished(root, json, errors);
  publishedListed(json, index, errors);
  const version = read(root, 'design/VERSION')?.trim();
  if (version) {
    designVersion(root, version, json, errors);
    designReleased(root, version, index, errors);
  }
  designTokens(root, json, errors);
  specVersion(root, errors);
  return errors;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = path.resolve(process.argv[2] ?? path.join(path.dirname(fileURLToPath(import.meta.url)), '..'));
  const errors = check(root);
  for (const e of errors) console.error(e);
  console.log(errors.length ? `${errors.length} error(s)` : 'all checks pass');
  process.exit(errors.length ? 1 : 0);
}
