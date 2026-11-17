#!/usr/bin/env node
// Checks a translated locale against English: same keys, every string non-empty, emergency numbers kept,
// and a label for every taxonomy label. Usage: node scripts/check-locale.mjs <code>
import fs from "fs";
import path from "path";
import { createRequire } from "module";
const code = process.argv[2];
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const require = createRequire(import.meta.url);
const ts = require("typescript");
function load(file) {
  const src = fs.readFileSync(file, "utf8");
  const js = ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const m = { exports: {} };
  new Function("module", "exports", "require", js)(m, m.exports, () => ({}));
  return m.exports.default;
}
const en = load(path.join(root, "src/lib/i18n/en.ts"));
const tr = load(path.join(root, `src/lib/i18n/${code}.ts`));
const problems = [];
function walk(e, t, at) {
  if (typeof e === "string") {
    if (typeof t !== "string" || !t.trim()) return problems.push(`${at}: missing`);
    for (const n of ["108", "112"]) if (e.includes(n) && !t.includes(n)) problems.push(`${at}: lost ${n}`);
    if (/\{[a-z]+\}/i.test(e)) for (const p of e.match(/\{[a-z]+\}/gi)) if (!t.includes(p)) problems.push(`${at}: lost placeholder ${p}`);
  } else if (Array.isArray(e)) {
    if (!Array.isArray(t) || t.length !== e.length) return problems.push(`${at}: array length ${t?.length} != ${e.length}`);
    e.forEach((x, i) => walk(x, t[i], `${at}[${i}]`));
  } else if (e && typeof e === "object") {
    if (!t || typeof t !== "object") return problems.push(`${at}: missing object`);
    for (const k of Object.keys(e)) walk(e[k], t[k], at ? `${at}.${k}` : k);
    for (const k of Object.keys(t)) if (!(k in e)) problems.push(`${at}.${k}: extra key`);
  }
}
walk(en, tr, "");
const want = Object.keys(JSON.parse(fs.readFileSync(path.join(root, "src/lib/i18n/labels/_source.json"), "utf8")));
const labels = JSON.parse(fs.readFileSync(path.join(root, `src/lib/i18n/labels/${code}.json`), "utf8"));
for (const k of want) if (!labels[k]?.trim()) problems.push(`label missing: ${k}`);
for (const k of Object.keys(labels)) if (!want.includes(k)) problems.push(`label extra: ${k}`);
console.log(problems.length ? problems.join("\n") : `${code}: OK`);
process.exit(problems.length ? 1 : 0);
