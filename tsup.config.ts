import { defineConfig } from 'tsup';

const entry = ['src/index.ts', 'src/plugin/index.ts'];

const shared = {
  entry,
  target: 'node20',
  dts: true,
  sourcemap: true,
  clean: false,
  treeshake: true,
  splitting: false,
  // Must resolve from the consumer's node_modules, otherwise the plugin ends
  // up bundling its own copy of the ESLint-compat shim.
  external: ['@oxlint/plugins'],
};

export default defineConfig([
  { ...shared, format: ['esm'], outDir: 'dist/esm' },
  { ...shared, format: ['cjs'], outDir: 'dist/cjs' },
]);
