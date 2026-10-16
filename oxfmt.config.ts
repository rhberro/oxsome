import { defineConfig } from 'oxfmt';

import { oxfmt } from './dist/index.js';

// Dogfoods the preset this package ships.
const config = {
  ...oxfmt,
};

export default defineConfig(config);
