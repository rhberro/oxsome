import { type OxlintConfig, defineConfig } from 'oxlint';

import { oxsome } from './dist/index.js';

const config: OxlintConfig = { extends: [oxsome.recommended], jsPlugins: ['./dist/plugin.js'] };

export default defineConfig(config);
