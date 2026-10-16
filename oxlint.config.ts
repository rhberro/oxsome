import { defineConfig } from 'oxlint';

import { oxlint } from './src/index.ts';

export default defineConfig({
  extends: [oxlint],
});
