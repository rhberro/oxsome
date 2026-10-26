import { oxsome } from '@rhberro/oxsome';
import { type OxlintConfig, defineConfig } from 'oxlint';

const config: OxlintConfig = {
  extends: [oxsome.recommended],
  jsPlugins: ['@rhberro/oxsome/plugin'],
  rules: {
    'sort-keys': 'error',
    'sort-vars': 'error',
  },
};

export default defineConfig(config);
