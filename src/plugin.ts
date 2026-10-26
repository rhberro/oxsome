import { type Plugin, type Rule, eslintCompatPlugin } from '@oxlint/plugins';

import noArrowFunctions from './rules/no-arrow-functions.js';
import noDestructuringInParams from './rules/no-destructuring-in-params.js';
import noInlineFunctionsObjectsArrays from './rules/no-inline-functions-objects-arrays.js';
import noInlineStructuralTypes from './rules/no-inline-structural-types.js';
import noJsxInlineComputation from './rules/no-jsx-inline-computation.js';
import preferGenericArrayTypes from './rules/prefer-generic-array-types.js';

/**
 * Declared separately so the rule names stay literal types. `eslintCompatPlugin`
 * returns `Plugin`, whose `rules` is `Record<string, Rule>` -- that would widen
 * every key to `string` and make the typo guard on `recommended` useless.
 */
const RULES = {
  'no-arrow-functions': noArrowFunctions,
  'no-destructuring-in-params': noDestructuringInParams,
  'no-inline-functions-objects-arrays': noInlineFunctionsObjectsArrays,
  'no-inline-structural-types': noInlineStructuralTypes,
  'no-jsx-inline-computation': noJsxInlineComputation,
  'prefer-generic-array-types': preferGenericArrayTypes,
} satisfies Record<string, Rule>;

/**
 * The `oxsome` oxlint plugin.
 *
 * `meta.name` is what oxlint uses as the rule prefix when the plugin is listed
 * in `jsPlugins` as a bare string.
 */
const PLUGIN: Plugin = { meta: { name: 'oxsome' }, rules: RULES };

const plugin = eslintCompatPlugin(PLUGIN);

/** Rule name without the `oxsome/` prefix. */
export type RuleName = keyof typeof RULES;

export default plugin;
