import { type OxlintConfig, defineConfig } from 'oxlint';

import { oxsome } from './dist/index.js';

// All four rules are enforced on this repo, including the one that rejects
// inline object literals in call arguments. If a rule fights legitimate code,
// the rule gets fixed -- not switched off here.
const config: OxlintConfig = {
  extends: [oxsome.recommended],

  // Consumers write `@rhberro/oxsome/plugin`. We point at the built output
  // because oxlint's config loader does not resolve package self-references.
  jsPlugins: [{ name: 'oxsome', specifier: './dist/plugin.js' }],
};

export default defineConfig(config);
