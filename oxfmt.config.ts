import { defineConfig } from 'oxfmt';

import { oxfmt } from './src/index.js';

// Dogfoods the preset this package ships. Remove it and the repo falls back to
// oxfmt defaults (double quotes), which is not what consumers get.
const config = { ...oxfmt };

export default defineConfig(config);
