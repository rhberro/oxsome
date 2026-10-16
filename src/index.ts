export { oxfmt, type OxsomeFmtConfig } from './format/index.ts';
export { default as oxsomePlugin } from './plugin/index.ts';

/**
 * Named presets. Mirrors the `plugin.configs.recommended` convention from
 * ESLint shareable configs, which oxlint does not support natively — `extends`
 * only accepts file paths (JSON) or imported objects (TS), never a plugin name.
 *
 * ```ts
 * import { oxsome } from "@rhberro/oxsome";
 *
 * export default defineConfig({
 *   extends: [oxsome.recommended],
 *   jsPlugins: ["@rhberro/oxsome/plugin"],
 * });
 * ```
 */
export const oxsome = {
  /**
   * The four rules, already namespaced and enabled as errors.
   *
   * Pass it through `extends` so a project can override individual rules:
   *
   * ```ts
   * rules: { "oxsome/no-arrow-functions": "off" }
   * ```
   *
   * Note this intentionally sets no `plugins`: the rules work on any JS/TS/JSX
   * source and enabling extra oxlint plugins here would silently turn on their
   * default-category rules in every consuming project.
   */
  recommended: {
    rules: {
      'oxsome/no-arrow-functions': 'error',
      'oxsome/no-destructuring-in-params': 'error',
      'oxsome/no-inline-functions-objects-arrays': 'error',
      'oxsome/no-jsx-inline-computation': 'error',
    },
  },
} as const;
