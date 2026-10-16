import { type OxlintConfig, defineConfig } from 'oxlint';

import { oxsome } from './src/index.ts';

// Our own plugin is loaded through the published specifier so `npm run lint`
// exercises the exact path consumers hit.
const config: OxlintConfig = {
  extends: [oxsome.recommended],

  // Consumers write `jsPlugins: ["@rhberro/oxsome/plugin"]`. We point at the
  // source instead because oxlint's config loader does not resolve package
  // self-references — but the plugin object and rule names are identical.
  jsPlugins: [{ name: 'oxsome', specifier: './src/plugin/index.ts' }],

  rules: {
    // Both target application code, not build scripts: our tooling legitimately
    // passes callbacks and inline literals to execFileSync/JSON.stringify.
    'oxsome/no-arrow-functions': 'off',
    'oxsome/no-inline-functions-objects-arrays': 'off',
  },
};

export default defineConfig(config);
