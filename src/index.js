import plugin from './plugin.js';

const RULE_NAMES = Object.keys(plugin.rules);

/**
 * Named presets, following the `plugin.configs.recommended` convention from
 * ESLint shareable configs.
 *
 * oxlint has no equivalent: `extends` only accepts file paths (JSON) or
 * imported objects (TS), never a plugin name. Hence the export here.
 */
export const oxsome = {
  /**
   * Every rule in the plugin, enabled as an error.
   *
   * Built from the plugin itself, so adding a rule to `src/rules/` is enough to
   * have it show up here.
   */
  recommended: {
    rules: Object.fromEntries(RULE_NAMES.map((name) => [`oxsome/${name}`, 'error'])),
  },
};

export { plugin as oxsomePlugin };

/**
 * Base format preset.
 *
 * Oxfmt has no `extends`, so consuming projects spread this into their own
 * `oxfmt.config.ts`.
 */
export const oxfmt = {
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
