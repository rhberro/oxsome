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
import { mkdtempSync, readFileSync, rmSync, writeFileSync, mkdirSync } from 'node:fs';
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

  // oxlint honors .gitignore, so keep dependencies out of the lint run.
  writeFileSync(join(sandbox, '.gitignore'), 'node_modules\n');

  run(
    'npm',
    ['install', '--silent', '--no-audit', '--no-fund', tarball, 'oxlint', 'oxfmt'],
    sandbox,
  );

  writeFileSync(
    join(sandbox, 'oxlint.config.ts'),
    [
      "import { oxsome } from '@rhberro/oxsome';",
      "import { defineConfig } from 'oxlint';",
      '',
      'export default defineConfig({',
      '  extends: [oxsome.recommended],',
      "  jsPlugins: ['@rhberro/oxsome/plugin'],",
      '});',
      '',
    ].join('\n'),
  );

  writeFileSync(
    join(sandbox, 'oxfmt.config.ts'),
    [
      "import { oxfmt } from '@rhberro/oxsome';",
      "import { defineConfig } from 'oxfmt';",
      '',
      'export default defineConfig({',
      '  ...oxfmt,',
      '});',
      '',
    ].join('\n'),
  );

  // One violation per rule, all in a single file.
  writeFileSync(
    join(sandbox, 'bad.tsx'),
    [
      'export function Widget({ value }) {',
      '  return <p>{value + 1}</p>;',
      '}',
      '',
      'export const inline = run(() => 1, { retries: 2 });',
      '',
    ].join('\n'),
  );

  writeFileSync(
    join(sandbox, 'good.tsx'),
    [
      'export function Widget(props) {',
      '  const total = props.value + 1;',
      '  return <p>{total}</p>;',
      '}',
      '',
      'function increment() {',
      '  return 1;',
      '}',
      '',
      'const options = { retries: 2 };',
      '',
      'export const inline = run(increment, options);',
      '',
    ].join('\n'),
  );

  console.log('> oxlint: every rule must fire on bad.tsx');
  const lint = runExpectFailure('npx', ['--no-install', 'oxlint', 'bad.tsx'], sandbox);
  const lintOutput = lint.output;

  assert('oxlint ran', lintOutput.length > 0, lintOutput);
  for (const rule of [
    'no-arrow-functions',
    'no-destructuring-in-params',
    'no-inline-functions-objects-arrays',
    'no-jsx-inline-computation',
  ]) {
    assert(`rule oxsome/${rule} fired`, lintOutput.includes(`oxsome(${rule})`), lintOutput);
  }
  assert('exit code signals lint errors', lint.ok === false, lintOutput);

  console.log('> oxlint: good.tsx must pass');
  const clean = runExpectFailure('npx', ['--no-install', 'oxlint', 'good.tsx'], sandbox);
  assert('compliant file passes', clean.ok === true, clean.output);

  console.log('> oxlint: per-project override must win over extends');
  writeFileSync(
    join(sandbox, 'oxlint.config.ts'),
    [
      "import { oxsome } from '@rhberro/oxsome';",
      "import { defineConfig } from 'oxlint';",
      '',
      'export default defineConfig({',
      '  extends: [oxsome.recommended],',
      "  jsPlugins: ['@rhberro/oxsome/plugin'],",
      '  rules: {',
      "    'oxsome/no-arrow-functions': 'off',",
      '  },',
      '});',
      '',
    ].join('\n'),
  );
  const overridden = runExpectFailure('npx', ['--no-install', 'oxlint', 'bad.tsx'], sandbox);
  assert(
    'rule can be disabled locally',
    !overridden.output.includes('oxsome(no-arrow-functions)') &&
      overridden.output.includes('oxsome(no-jsx-inline-computation)'),
    overridden.output,
  );

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

  const formatted = readFileSync(join(sandbox, 'fmt.ts'), 'utf8');

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

  console.log('> subpath exports resolve');
  const pluginProbe = join(sandbox, 'plugin-probe.mjs');
  writeFileSync(
    pluginProbe,
    "import plugin from '@rhberro/oxsome/plugin';\n" +
      'const names = Object.keys(plugin.rules ?? {});\n' +
      "if (names.length !== 4) { throw new Error('expected 4 rules, got ' + names.length); }\n" +
      "console.log(names.sort().join(','));\n",
  );
  const pluginOut = run('node', [pluginProbe], sandbox);
  assert(
    '@rhberro/oxsome/plugin exports 4 rules',
    pluginOut.trim().split('\n').at(-1).split(',').length === 4,
    pluginOut,
  );

  console.log('> meta.name must match what a bare-string jsPlugins entry produces');
  const metaProbe = join(sandbox, 'meta-probe.mjs');
  writeFileSync(
    metaProbe,
    "import plugin from '@rhberro/oxsome/plugin';\n" +
      "if (plugin.meta?.name !== 'oxsome') { throw new Error('meta.name is ' + plugin.meta?.name); }\n" +
      'console.log(plugin.meta.name);\n',
  );
  assert(
    'plugin.meta.name is "oxsome" (rule prefix)',
    run('node', [metaProbe], sandbox).trim().endsWith('oxsome'),
  );

  console.log('> CommonJS interop (dist/cjs)');
  const cjs = join(sandbox, 'cjs-probe.cjs');
  writeFileSync(
    cjs,
    'const { oxfmt, oxsome } = require("@rhberro/oxsome");\n' +
      "if (oxfmt.printWidth !== 100) { throw new Error('bad cjs build'); }\n" +
      "if (Object.keys(oxsome.recommended.rules).length !== 4) { throw new Error('bad recommended'); }\n" +
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
