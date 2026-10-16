import type { OxlintConfig } from 'oxlint';

/**
 * Base lint preset.
 *
 * Scoped to correctness and bug-prevention. Stylistic rules are intentionally
 * omitted: `oxfmt` owns formatting, so encoding style twice only creates churn.
 *
 * When consumed via `extends`, only `rules`, `plugins` and `overrides` are
 * inherited. `env` and `globals` must be declared by each consuming project,
 * because they depend on the runtime (browser, node, workers, ...).
 */
export const oxlint = {
  plugins: ['eslint', 'oxc', 'unicorn', 'promise', 'import'],

  rules: {
    // --- eslint: correctness -------------------------------------------------
    'eslint/no-async-promise-executor': 'error',
    'eslint/no-await-in-loop': 'warn',
    'eslint/no-class-assign': 'error',
    'eslint/no-compare-neg-zero': 'error',
    'eslint/no-cond-assign': 'error',
    'eslint/no-const-assign': 'error',
    'eslint/no-constant-binary-expression': 'error',
    'eslint/no-constant-condition': 'warn',
    'eslint/no-dupe-class-members': 'error',
    'eslint/no-dupe-else-if': 'error',
    'eslint/no-dupe-keys': 'error',
    'eslint/no-duplicate-case': 'error',
    'eslint/no-ex-assign': 'error',
    'eslint/no-fallthrough': 'error',
    'eslint/no-func-assign': 'error',
    'eslint/no-import-assign': 'error',
    'eslint/no-inner-declarations': 'error',
    'eslint/no-irregular-whitespace': 'error',
    'eslint/no-loss-of-precision': 'error',
    'eslint/no-misleading-character-class': 'error',
    'eslint/no-obj-calls': 'error',
    'eslint/no-self-assign': 'error',
    'eslint/no-self-compare': 'error',
    'eslint/no-setter-return': 'error',
    'eslint/no-shadow-restricted-names': 'error',
    'eslint/no-sparse-arrays': 'error',
    'eslint/no-template-curly-in-string': 'error',
    'eslint/no-unmodified-loop-condition': 'error',
    'eslint/no-unreachable-loop': 'error',
    'eslint/no-unsafe-finally': 'error',
    'eslint/no-unsafe-negation': 'error',
    'eslint/no-unsafe-optional-chaining': 'error',
    'eslint/no-unused-expressions': 'error',
    'eslint/no-useless-assignment': 'error',
    'eslint/no-useless-backreference': 'error',
    'eslint/no-useless-catch': 'error',
    'eslint/no-useless-constructor': 'error',
    'eslint/no-useless-escape': 'error',
    'eslint/no-useless-rename': 'error',
    'eslint/no-useless-return': 'error',
    'eslint/no-var': 'error',
    'eslint/prefer-numeric-literals': 'error',
    'eslint/require-await': 'error',
    'eslint/require-yield': 'error',
    'eslint/symbol-description': 'error',
    'eslint/use-isnan': 'error',
    'eslint/valid-typeof': 'error',

    // --- oxc -----------------------------------------------------------------
    'oxc/no-accumulating-spread': 'error',
    'oxc/no-map-spread': 'error',

    // --- unicorn -------------------------------------------------------------
    'unicorn/no-await-expression-member': 'error',
    'unicorn/no-unnecessary-await': 'error',
    'unicorn/error-message': 'error',
    'unicorn/escape-case': 'error',
    'unicorn/no-await-in-promise-methods': 'error',
    'unicorn/no-instanceof-builtins': 'error',
    'unicorn/no-negated-condition': 'error',
    'unicorn/no-useless-undefined': 'error',
    'unicorn/prefer-node-protocol': 'error',
    'unicorn/prefer-number-properties': 'error',
    'unicorn/prefer-string-starts-ends-with': 'error',
    'unicorn/prefer-type-error': 'error',
    'unicorn/throw-new-error': 'error',

    // --- promise -------------------------------------------------------------
    'promise/param-names': 'error',
    'promise/no-nesting': 'warn',
    'promise/no-return-wrap': 'error',
    'promise/always-return': 'warn',

    // --- import --------------------------------------------------------------
    'import/no-duplicates': 'warn',
    'import/no-mutable-exports': 'error',
    'import/no-self-import': 'error',
  },

  overrides: [
    {
      files: ['**/__tests__/**/*.{ts,tsx,js,jsx}', '**/*.{test,spec}.{ts,tsx,js,jsx}'],
      rules: {
        'eslint/no-console': 'off',
      },
    },
  ],
} satisfies OxlintConfig;

/** Shape of the base preset, useful when composing presets locally. */
export type OxsomeLintConfig = OxlintConfig;
