// Hand-written so consumers get autocomplete without a build step.
// Deliberately does not import types from `oxlint`, so this file resolves even
// when oxlint's own types are not installed.

/** Named presets shipped by this package. */
export declare const oxsome: {
  /**
   * Every rule in the plugin, enabled as an error.
   *
   * ```ts
   * extends: [oxsome.recommended]
   * ```
   */
  readonly recommended: {
    rules: Record<string, "error">;
  };
};

/** Base format preset, spread into the project's own `oxfmt.config.ts`. */
export declare const oxfmt: {
  printWidth: number;
  tabWidth: number;
  useTabs: boolean;
  semi: boolean;
  singleQuote: boolean;
  jsxSingleQuote: boolean;
  trailingComma: "all" | "es5" | "none";
  bracketSpacing: boolean;
  bracketSameLine: boolean;
  arrowParens: "always" | "avoid";
  endOfLine: "lf" | "crlf" | "cr";
  insertFinalNewline: boolean;
  objectWrap: "preserve" | "collapse";
  quoteProps: "as-needed" | "consistent" | "preserve";
  sortImports: {
    order: "asc" | "desc";
    ignoreCase: boolean;
    newlinesBetween: boolean;
    internalPattern: string[];
  };
  sortPackageJson: {
    sortScripts: boolean;
  };
};

/** The raw oxlint plugin object, for advanced `jsPlugins` wiring. */
export declare const oxsomePlugin: {
  meta: { name: string };
  rules: Record<string, unknown>;
};