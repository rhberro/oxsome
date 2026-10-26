import { oxfmt, type OxfmtPreset } from '@rhberro/oxsome';
import { defineConfig, type OxfmtConfig } from 'oxfmt';

const base = {
  ignorePatterns: ['*.md'],
};

const config: OxfmtConfig = Object.assign<OxfmtPreset, OxfmtConfig>(oxfmt, base);

export default defineConfig(config);
