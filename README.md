# @rhberro/oxsome

Opinionated lint rules for [oxlint](https://oxc.rs/docs/guide/usage/linter.html), written in TypeScript against oxc's own AST types.

These are deliberately **aggressive** and **narrow**. They are not a general-purpose style guide and they are not trying to be one. They encode a few very specific opinions about how code should be shaped, opinions strong enough that most teams would argue with at least one of them:

- No arrow functions, anywhere.
- No destructuring in a function signature.
- No inline function, object or array literals as a call's first argument.
- No inline structural types in annotations.
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

### Configuring

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

### Formatting

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

## Rules

| Rule                                                            | What it forbids                                                              |
| --------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| [`no-arrow-functions`](./CODING_STYLES.md#arrow-functions)                 | Arrow functions in any position.                                             |
| [`no-destructuring-in-params`](./CODING_STYLES.md#parameters-and-destructuring) | Destructuring in a function signature.                                       |
| [`no-inline-functions-objects-arrays`](./CODING_STYLES.md#inline-functions-objects-and-arrays) | Function, object or array literals as the first call or constructor argument. |
| [`no-inline-structural-types`](./CODING_STYLES.md#inline-structural-types) | Anonymous function, object, tuple, constructor or non-primitive array types. |
| [`no-jsx-inline-computation`](./CODING_STYLES.md#jsx-expressions)          | Expressions inside `{...}` in JSX.                                           |
| [`prefer-generic-array-types`](./CODING_STYLES.md#generic-array-types) | `T[]` type syntax; use `Array<T>` or `ReadonlyArray<T>`. |

These rules favor named values and types. React Hook dependency arrays remain inline as later arguments, so React can inspect them.

[`CODING_STYLES.md`](./CODING_STYLES.md) explains every rule with valid and invalid examples. It is written to be handed to an AI agent, and it is the single source of truth for the examples.

## Coding agents

The rules ship as a document written for language models: [`CODING_STYLES.md`](./CODING_STYLES.md). One section per rule, each with valid and invalid examples. It installs with the package, so the document your agent reads is always the version that matches the linter your project actually runs.

Point your agent at it from `AGENTS.md`:

| Documentation | Description | When to consult | Where |
| --- | --- | --- | --- |
| Coding Styles | How functions, parameters, call arguments, types and JSX must be written. | Whenever writing, changing or reviewing code. | `node_modules/@rhberro/oxsome/CODING_STYLES.md` |

`AGENTS.md` is the convention most agents read, but the name does not matter much — `CLAUDE.md`, `.cursorrules` and `.github/copilot-instructions.md` work the same way, as long as the agent is told to consult it.

Do not paraphrase the rules in your own instructions. Point at the file instead, so there is one source of truth: when a rule changes or a defect is fixed, every project picks it up on the next dependency bump instead of drifting.

## Development

```sh
npm ci
npm test
```

`npm test` builds with `tsc`, runs oxlint and checks formatting. The rules are TypeScript, typed against `ESTree` — the oxc AST types that `@oxlint/plugins` exports.

The repo dogfoods the package: every rule runs here, and `oxfmt.config.ts` spreads the preset it ships.

The [Bun example](./example) is a separate playground for these rules. Build this package first, then run `bun install` and `bun run check` in `example/`; `bun run start` renders the sample component.

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
