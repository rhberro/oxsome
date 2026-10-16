import { eslintCompatPlugin } from '@oxlint/plugins';

import noArrowFunctions from '../rules/no-arrow-functions.js';
import noDestructuringInParams from '../rules/no-destructuring-in-params.js';
import noInlineFunctionsObjectsArrays from '../rules/no-inline-functions-objects-arrays.js';
import noJsxInlineComputation from '../rules/no-jsx-inline-computation.js';

/**
 * The `oxsome` oxlint plugin.
 *
 * The `meta.name` here is only a fallback: oxlint takes the plugin namespace
 * from the `name` field of the `jsPlugins` entry that loads it. Consumers must
 * use `oxsomePluginEntry` (or a matching literal) so rules resolve as
 * `oxsome/<rule>`.
 */
const plugin = {
  meta: { name: 'oxsome' },
  rules: {
    'no-arrow-functions': noArrowFunctions,
    'no-destructuring-in-params': noDestructuringInParams,
    'no-inline-functions-objects-arrays': noInlineFunctionsObjectsArrays,
    'no-jsx-inline-computation': noJsxInlineComputation,
  },
};

export default eslintCompatPlugin(plugin);
