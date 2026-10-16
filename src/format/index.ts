import type { OxfmtConfig } from 'oxfmt';

/**
 * Base format preset.
 *
 * Oxfmt has no `extends` mechanism, so consuming projects spread this object
 * into their own `oxfmt.config.ts`. See the README for the exact snippet.
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
} satisfies OxfmtConfig;

/** Shape of the base preset, useful when composing presets locally. */
export type OxsomeFmtConfig = OxfmtConfig;
