import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['esm'],
    outDir: 'dist/esm',
    target: 'node20',
    dts: true,
    sourcemap: true,
    clean: false,
    treeshake: true,
    splitting: false,
  },
  {
    entry: ['src/index.ts'],
    format: ['cjs'],
    outDir: 'dist/cjs',
    target: 'node20',
    dts: true,
    sourcemap: true,
    clean: false,
    treeshake: true,
    splitting: false,
  },
]);
