import { defineConfig } from 'oxlint';

import { oxsomeRules } from './src/index.ts';

export default defineConfig({
  extends: [oxsomeRules],

  // Our own plugin has to be loaded the same way consumers load it, so the
  // repo exercises the real specifier path on every `npm run lint`.
  jsPlugins: [{ name: 'oxsome', specifier: './src/plugin/index.ts' }],

  rules: {
    // Both target application code, not build scripts: our tooling legitimately
    // passes callbacks and inline literals to execFileSync/JSON.stringify.
    'oxsome/no-arrow-functions': 'off',
    'oxsome/no-inline-functions-objects-arrays': 'off',
  },
});
