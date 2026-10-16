import { type OxlintConfig, defineConfig } from 'oxlint';

import { oxsome } from './dist/index.js';

// All four rules are enforced on this repo, including the one that rejects
// inline object literals in call arguments. If a rule fights legitimate code,
// the rule gets fixed -- not switched off here.
const config: OxlintConfig = {
  extends: [oxsome.recommended],

  // Same shape consumers use (`['@rhberro/oxsome/plugin']`), just pointed at the
  // built output because oxlint's loader does not resolve self-references.
  // The `oxsome` prefix comes from the plugin's own meta.name.
  jsPlugins: ['./dist/plugin.js'],
};

export default defineConfig(config);
