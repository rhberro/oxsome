# @rhberro/oxsome

Opinionated lint rules for [oxlint](https://oxc.rs/docs/guide/usage/linter.html), written in TypeScript against oxc's own AST types.

These are deliberately **aggressive** and **narrow**. They are not a general-purpose style guide and they are not trying to be one. They encode a few very specific opinions about how code should be shaped, opinions strong enough that most teams would argue with at least one of them:

- No arrow functions, anywhere.
- No destructuring in a function signature.
- No inline literals passed into calls.
- No computation inside JSX.

If any of those fights your codebase, turn that rule off — see [Using](#using). Nothing here is non-negotiable.

## Contents

- [Installing](#installing)
- [Using](#using)
- [Rules](#rules)
- [Coding agents](#coding-agents)
- [Development](#development)
- [Publishing](#publishing)
- [License](#license)

## Installing

```sh
npm install -D @rhberro/oxsome oxlint
```

## Using

Two entries, both required:

```ts
// oxlint.config.ts
import { oxsome } from '@rhberro/oxsome';
import { defineConfig } from 'oxlint';

export default defineConfig(
  {
    extends: [oxsome.recommended],
    jsPlugins: ['@rhberro/oxsome/plugin'],
  }
);
```

`extends` carries the rules. `jsPlugins` tells oxlint where the plugin lives — and oxlint's `extends` does not inherit `jsPlugins`, so it has to be declared per project. Both are mandatory, and they fail differently: omit `jsPlugins` and oxlint stops with `Plugin 'oxsome' not found`; omit `extends` and it runs silently, reporting nothing.

This only works in `oxlint.config.ts`, never in `.oxlintrc.json`.

### Turning rules off

Local rules win, left to right:

```ts
export default defineConfig(
  {
    extends: [oxsome.recommended],
    jsPlugins: ['@rhberro/oxsome/plugin'],
    rules: {
      'oxsome/no-arrow-functions': 'off',
    },
  }
);
```

### Adding a rule

`recommended` is a curated list, written by hand. A rule added to the plugin does not join it — it stays opt-in until someone lists it in [`src/index.ts`](./src/index.ts). The compiler rejects a typo in that list, but not a missing entry.

### Formatting

[oxfmt](https://oxc.rs/docs/guide/usage/formatter.html) has no `extends`, so spread the preset:

```sh
npm install -D @rhberro/oxsome oxfmt
```

```ts
// oxfmt.config.ts
import { oxfmt } from '@rhberro/oxsome';
import { defineConfig } from 'oxfmt';

export default defineConfig(
  { ...oxfmt }
);
```

Defaults: `printWidth: 100`, `semi: true`, `singleQuote: true`, `trailingComma: 'all'`, sorted imports, sorted `package.json`.

## Rules

| Rule                                                            | What it forbids                                                              |
| --------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| [`no-arrow-functions`](./CODING_STYLES.md#arrow-functions)                 | Arrow functions in any position.                                             |
| [`no-destructuring-in-params`](./CODING_STYLES.md#parameters-and-destructuring) | Destructuring in a function signature.                                       |
| [`no-inline-functions-objects-arrays`](./CODING_STYLES.md#inline-functions-objects-and-arrays) | Any function, object or array literal passed inline. No exemptions.       |
| [`no-jsx-inline-computation`](./CODING_STYLES.md#jsx-expressions)          | Expressions inside `{...}` in JSX.                                           |

Each rule exists to force a named, reusable value where an anonymous one would do. An arrow function cannot be referenced later; a destructured signature hides the function's contract from its call sites; an inline literal has no name to test or reuse; a JSX container is a description of the screen, not a place to compute.

[`CODING_STYLES.md`](./CODING_STYLES.md) explains every rule with valid and invalid examples. It is written to be handed to an AI agent, and it is the single source of truth for the examples.

## Coding agents

The rules ship as a document written for language models: [`CODING_STYLES.md`](./CODING_STYLES.md). One section per rule, each with valid and invalid examples. It installs with the package, so the document your agent reads is always the version that matches the linter your project actually runs.

Point your agent at it from `AGENTS.md`:

| Documentation  | Description                                                                             | When to consult                                     | Where                                                    |
| -------------- | --------------------------------------------------------------------------------------- | --------------------------------------------------- | -------------------------------------------------------- |
| Coding Styles  | How functions, parameters, call arguments and JSX must be written.                        | Whenever writing, changing or reviewing code.        | `node_modules/@rhberro/oxsome/CODING_STYLES.md`          |

`AGENTS.md` is the convention most agents read, but the name does not matter much — `CLAUDE.md`, `.cursorrules` and `.github/copilot-instructions.md` work the same way, as long as the agent is told to consult it.

Do not paraphrase the rules in your own instructions. Point at the file instead, so there is one source of truth: when a rule changes or a defect is fixed, every project picks it up on the next dependency bump instead of drifting.


## Development

```sh
npm ci
npm test
```

`npm test` builds with `tsc`, runs oxlint and checks formatting. The rules are TypeScript, typed against `ESTree` — the oxc AST types that `@oxlint/plugins` exports.

The repo dogfoods the package: every rule runs here, and `oxfmt.config.ts` spreads the preset it ships.

To add a rule, drop the file in [`src/rules/`](./src/rules) and register it in [`src/plugin.ts`](./src/plugin.ts). It stays out of `oxsome.recommended` until you list it in [`src/index.ts`](./src/index.ts).

## Publishing

Releases are driven by tags and authenticated with [Trusted Publishing](https://docs.npmjs.com/trusted-publishers) — no npm token lives in this repository.

```sh
npm version patch
git push --follow-tags
```

The workflow verifies the tag matches `package.json`, runs the test suite, and publishes. `prepublishOnly` also runs the suite, so a broken rule blocks the publish locally.

## License

MIT
