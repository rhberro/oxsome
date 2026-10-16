export { oxfmt, type OxsomeFmtConfig } from './format/index.ts';
export { default as oxsomePlugin } from './plugin/index.ts';

/**
 * Ready-to-use `jsPlugins` entry pointing at the bundled plugin.
 *
 * `jsPlugins` is one of the config fields oxlint's `extends` does **not**
 * inherit, so every consumer has to declare it explicitly:
 *
 * ```ts
 * import { oxsomePluginEntry } from "@rhberro/oxsome";
 * import { defineConfig } from "oxlint";
 *
 * export default defineConfig({
 *   extends: [oxsomeRules],
 *   jsPlugins: [oxsomePluginEntry],
 * });
 * ```
 */
export const oxsomePluginEntry = {
  name: 'oxsome',
  specifier: '@rhberro/oxsome/plugin',
} as const;

/**
 * The four rules from this plugin, already namespaced and enabled.
 *
 * Pass it through `extends` so a project can override individual rules:
 *
 * ```ts
 * export default defineConfig({
 *   extends: [oxsomeRules],
 *   rules: { "oxsome/no-arrow-functions": "off" },
 * });
 * ```
 *
 * Note this intentionally sets no `plugins`: the rules work on any JS/TS/JSX
 * source and enabling extra oxlint plugins here would silently turn on their
 * default-category rules in every consuming project.
 */
export const oxsomeRules = {
  rules: {
    'oxsome/no-arrow-functions': 'error',
    'oxsome/no-destructuring-in-params': 'error',
    'oxsome/no-inline-functions-objects-arrays': 'error',
    'oxsome/no-jsx-inline-computation': 'error',
  },
} as const;
