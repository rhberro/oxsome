import plugin, { type RuleName } from './plugin.js';

type PluginRuleName = `oxsome/${RuleName}`;

/**
 * The rules `oxsome.recommended` turns on.
 *
 * Hand-written on purpose: adding a rule to `src/plugin.ts` must NOT silently
 * promote it to recommended. A new rule stays opt-in until it is listed here.
 *
 * `satisfies Partial<Record<PluginRuleName, 'error'>>` keeps the list honest
 * without forcing completeness -- a typo fails the build, a missing rule does
 * not.
 */
const RECOMMENDED_RULES = {
  'oxsome/no-arrow-functions': 'error',
  'oxsome/no-destructuring-in-params': 'error',
  'oxsome/no-inline-functions-objects-arrays': 'error',
  'oxsome/no-inline-structural-types': 'error',
  'oxsome/no-jsx-inline-computation': 'error',
  'oxsome/prefer-generic-array-types': 'error',
} satisfies Partial<Record<PluginRuleName, 'error'>>;

/**
 * Named presets, following the `plugin.configs.recommended` convention from
 * ESLint shareable configs.
 *
 * oxlint has no equivalent: `extends` only accepts file paths (JSON) or
 * imported objects (TS), never a plugin name. Hence the export here.
 */
export const oxsome = {
  /** The curated rules listed above, enabled as errors. */
  recommended: {
    rules: RECOMMENDED_RULES,
  },
};

export { plugin as oxsomePlugin };

type StringList = Array<string>;

interface SortImportsPreset {
  ignoreCase: boolean;
  internalPattern: StringList;
  newlinesBetween: boolean;
  order: 'asc' | 'desc';
}

interface SortPackageJsonPreset {
  sortScripts: boolean;
}

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
  sortImports: SortImportsPreset;
  sortPackageJson: SortPackageJsonPreset;
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
