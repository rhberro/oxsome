import { eslintCompatPlugin } from '@oxlint/plugins';

import noArrowFunctions from './rules/no-arrow-functions.js';
import noDestructuringInParams from './rules/no-destructuring-in-params.js';
import noInlineFunctionsObjectsArrays from './rules/no-inline-functions-objects-arrays.js';
import noJsxInlineComputation from './rules/no-jsx-inline-computation.js';

/**
 * The `oxsome` oxlint plugin.
 *
 * `meta.name` is what oxlint uses as the rule prefix when the plugin is listed
 * in `jsPlugins` as a bare string.
 */
const plugin = eslintCompatPlugin({
  meta: { name: 'oxsome' },
  rules: {
    'no-arrow-functions': noArrowFunctions,
    'no-destructuring-in-params': noDestructuringInParams,
    'no-inline-functions-objects-arrays': noInlineFunctionsObjectsArrays,
    'no-jsx-inline-computation': noJsxInlineComputation,
  },
});

export default plugin;
