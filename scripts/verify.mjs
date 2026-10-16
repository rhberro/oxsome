/**
 * End-to-end proof that the published artifact actually works.
 *
 * 1. `npm pack` the repo
 * 2. install the tarball into a throwaway consumer project
 * 3. wire `oxlint.config.ts` / `oxfmt.config.ts` to import from the package
 * 4. run `oxlint` and `oxfmt` and assert the preset is really applied
 *
 * Run with `npm run verify` (after `npm run build`).
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const work = mkdtempSync(join(tmpdir(), 'oxsome-verify-'));
const sandbox = join(work, 'consumer');

const run = (cmd, args, cwd) =>
  execFileSync(cmd, args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });

const runExpectFailure = (cmd, args, cwd) => {
  try {
    run(cmd, args, cwd);
    return { ok: true, output: '' };
  } catch (error) {
    const output = `${error.stdout ?? ''}${error.stderr ?? ''}`;
    return { ok: false, output };
  }
};

let failed = false;
const assert = (label, condition, detail = '') => {
  if (condition) {
    console.log(`  ok  ${label}`);
  } else {
    failed = true;
    console.error(`  FAIL ${label}\n${detail}`);
  }
};

try {
  console.log('> packing');
  const packOutput = run('npm', ['pack', '--silent', '--pack-destination', work], root);
  const tarball = join(work, packOutput.trim().split('\n').at(-1));

  console.log('> creating consumer project');
  mkdirSync(sandbox, { recursive: true });

  writeFileSync(
    join(sandbox, 'package.json'),
    JSON.stringify({ name: 'consumer', private: true, version: '0.0.0', type: 'module' }, null, 2),
  );

  writeFileSync(join(sandbox, '.gitignore'), 'node_modules\n');

  run(
    'npm',
    ['install', '--silent', '--no-audit', '--no-fund', tarball, 'oxlint', 'oxfmt'],
    sandbox,
  );

  writeFileSync(
    join(sandbox, 'oxlint.config.ts'),
    [
      'import { oxlint } from "@rhberro/oxsome";',
      'import { defineConfig } from "oxlint";',
      '',
      'export default defineConfig({',
      '  extends: [oxlint],',
      '});',
      '',
    ].join('\n'),
  );

  writeFileSync(
    join(sandbox, 'oxfmt.config.ts'),
    [
      'import { oxfmt } from "@rhberro/oxsome";',
      'import { defineConfig } from "oxfmt";',
      '',
      'export default defineConfig({',
      '  ...oxfmt,',
      '});',
      '',
    ].join('\n'),
  );

  // Violates eslint/no-self-compare, unicorn/throw-new-error and
  // promise/always-return from the shared preset. `unicorn`/`promise` plugins
  // are only enabled by that preset, so firing on them proves it was applied.
  writeFileSync(
    join(sandbox, 'bad.ts'),
    [
      'const x = 1;',
      'if (x === x) {',
      "  throw Error('boom');",
      '}',
      'export const pending = new Promise((resolve) => resolve(x)).then(() => {',
      '  console.log("done");',
      '});',
      '',
    ].join('\n'),
  );

  writeFileSync(
    join(sandbox, 'good.ts'),
    [
      'const x = 1;',
      'if (x === 2) {',
      "  throw new TypeError('boom');",
      '}',
      'export const ok = x;',
      '',
    ].join('\n'),
  );

  console.log('> oxlint (expects failures on bad.ts, clean on good.ts)');
  const lint = runExpectFailure('npx', ['--no-install', 'oxlint'], sandbox);
  const lintOutput = lint.output;

  assert('oxlint ran', lintOutput.length > 0, lintOutput);
  assert(
    'preset rule eslint/no-self-compare fired',
    lintOutput.includes('no-self-compare'),
    lintOutput,
  );
  // `unicorn` and `promise` plugins are only enabled by our preset, so a rule
  // from those scopes firing proves the package config was really loaded.
  assert(
    'preset rule unicorn/throw-new-error fired',
    lintOutput.includes('unicorn(throw-new-error)'),
    lintOutput,
  );
  assert(
    'preset rule promise/always-return fired',
    lintOutput.includes('promise(always-return)'),
    lintOutput,
  );
  assert('exit code signals lint errors', lint.ok === false, lintOutput);

  console.log('> oxlint on a clean file only');
  rmSync(join(sandbox, 'bad.ts'));
  const clean = runExpectFailure('npx', ['--no-install', 'oxlint'], sandbox);
  assert('clean file passes', clean.ok === true, clean.output);

  console.log('> oxfmt (single quotes + sorted imports must come from the preset)');
  writeFileSync(
    join(sandbox, 'fmt.ts'),
    [
      'import { z } from "zzz";',
      'import { a } from "aaa";',
      'export const value   =   "double";',
      '',
    ].join('\n'),
  );
  run('npx', ['--no-install', 'oxfmt', 'fmt.ts'], sandbox);

  const formatted = await import('node:fs').then((fs) =>
    fs.readFileSync(join(sandbox, 'fmt.ts'), 'utf8'),
  );

  assert('singleQuote applied', formatted.includes("'double'"), formatted);
  assert(
    'printWidth/spacing applied',
    formatted.includes("export const value = 'double';"),
    formatted,
  );
  assert(
    'sortImports applied (aaa before zzz)',
    formatted.indexOf("'aaa'") < formatted.indexOf("'zzz'"),
    formatted,
  );

  console.log('> format:check on already-formatted output');
  run('npx', ['--no-install', 'oxfmt', '.'], sandbox);
  const check = runExpectFailure('npx', ['--no-install', 'oxfmt', '--check', '.'], sandbox);
  assert('format:check clean', check.ok === true, check.output);

  console.log('> CommonJS interop (dist/cjs)');
  const cjs = join(sandbox, 'cjs-probe.cjs');
  writeFileSync(
    cjs,
    'const { oxlint, oxfmt } = require("@rhberro/oxsome");\n' +
      "if (!oxlint.rules || oxfmt.printWidth !== 100) { throw new Error('bad cjs build'); }\n" +
      "console.log('cjs ok');\n",
  );
  const cjsOut = run('node', [cjs], sandbox);
  assert('require() resolves dist/cjs', cjsOut.includes('cjs ok'), cjsOut);
} finally {
  rmSync(work, { recursive: true, force: true });
}

if (failed) {
  console.error('\nverify: FAILED');
  process.exit(1);
}
console.log('\nverify: OK');
