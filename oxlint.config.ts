import { type OxlintConfig, defineConfig } from 'oxlint';

import { oxsome } from './dist/index.js';

// Every rule is on. If a rule fights the build scripts, fix the script.
const config: OxlintConfig = {
  extends: [oxsome.recommended],

  // Consumers write `@rhberro/oxsome/plugin`. We point at the built output
  // because oxlint's config loader does not resolve package self-references.
  jsPlugins: [{ name: 'oxsome', specifier: './dist/plugin.js' }],

  rules: {
    // This rule forbids `defineConfig({ ... })` and inline arrays in call
    // arguments -- exactly what a config file is made of.
    'oxsome/no-inline-functions-objects-arrays': 'off',
  },
};

export default defineConfig(config);
