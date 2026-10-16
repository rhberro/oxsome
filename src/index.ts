import type { OxlintConfig } from 'oxlint';

import plugin from './plugin.js';

const RULE_NAMES = Object.keys(plugin.rules);

/**
 * Named presets, following the `plugin.configs.recommended` convention from
 * ESLint shareable configs.
 *
 * oxlint has no equivalent: `extends` only accepts file paths (JSON) or
 * imported objects (TS), never a plugin name. Hence the export here.
 */
export const oxsome: { recommended: OxlintConfig } = {
  /**
   * Every rule in the plugin, enabled as an error.
   *
   * Built from the plugin itself, so adding a rule to `src/rules/` and
   * registering it in `src/plugin.ts` is enough to have it show up here.
   */
  recommended: {
    rules: Object.fromEntries(
      RULE_NAMES.map(function toRule(name: string): [string, 'error'] {
        return [`oxsome/${name}`, 'error'];
      }),
    ) as OxlintConfig['rules'],
  },
};

export { plugin as oxsomePlugin };

/**
 * Structural shape of the format preset.
 *
 * Deliberately not `OxfmtConfig`: referencing it would make the emitted
 * `.d.ts` import from `oxfmt`, and a consumer that only lints (no oxfmt
 * installed, `skipLibCheck` off) would fail to resolve it.
 */
export interface OxfmtPreset {
  arrowParens: 'always' | 'avoid';
  bracketSameLine: boolean;
  bracketSpacing: boolean;
  endOfLine: 'cr' | 'crlf' | 'lf';
  insertFinalNewline: boolean;
  jsxSingleQuote: boolean;
  objectWrap: 'collapse' | 'preserve';
  printWidth: number;
  quoteProps: 'as-needed' | 'consistent' | 'preserve';
  semi: boolean;
  singleQuote: boolean;
  sortImports: {
    ignoreCase: boolean;
    internalPattern: string[];
    newlinesBetween: boolean;
    order: 'asc' | 'desc';
  };
  sortPackageJson: {
    sortScripts: boolean;
  };
  tabWidth: number;
  trailingComma: 'all' | 'es5' | 'none';
  useTabs: boolean;
}

/**
 * Base format preset.
 *
 * Oxfmt has no `extends`, so consuming projects spread this into their own
 * `oxfmt.config.ts`.
 */
export const oxfmt: OxfmtPreset = {
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  jsxSingleQuote: false,
  trailingComma: 'all',
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'always',
  endOfLine: 'lf',
  insertFinalNewline: true,
  objectWrap: 'preserve',
  quoteProps: 'as-needed',
  sortImports: {
    order: 'asc',
    ignoreCase: true,
    newlinesBetween: true,
    internalPattern: ['~/', '@/', '#'],
  },
  sortPackageJson: {
    sortScripts: false,
  },
};
