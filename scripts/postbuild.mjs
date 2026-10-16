import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// The root package.json declares "type": "module". These markers make each
// output directory self-describing so the dual build stays correct no matter
// what the consuming project's package.json says.
for (const [dir, type] of [
  ['esm', 'module'],
  ['cjs', 'commonjs'],
]) {
  const target = join(root, 'dist', dir);
  mkdirSync(target, { recursive: true });
  writeFileSync(join(target, 'package.json'), `${JSON.stringify({ type }, null, 2)}\n`);
}

console.log('postbuild: wrote dist/esm/package.json and dist/cjs/package.json');
