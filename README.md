# @rhberro/oxsome

Four opinionated lint rules for [oxlint](https://oxc.rs/docs/guide/usage/linter.html), written in TypeScript against oxc's own AST types.

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

export default defineConfig({
  extends: [oxsome.recommended],
  jsPlugins: ['@rhberro/oxsome/plugin'],
});
```

`extends` carries the rules. `jsPlugins` tells oxlint where the plugin lives — and oxlint's `extends` does not inherit `jsPlugins`, so it has to be declared per project. Both are mandatory, and they fail differently: omit `jsPlugins` and oxlint stops with `Plugin 'oxsome' not found`; omit `extends` and it runs silently, reporting nothing.

This only works in `oxlint.config.ts`, never in `.oxlintrc.json`.

### Turning rules off

Local rules win, left to right:

```ts
export default defineConfig({
  extends: [oxsome.recommended],
  jsPlugins: ['@rhberro/oxsome/plugin'],
  rules: {
    'oxsome/no-arrow-functions': 'off',
  },
});
```

### Presets

| Preset               | What it contains                                                    | New rule behaviour                  |
| -------------------- | ------------------------------------------------------------------- | ----------------------------------- |
| `oxsome.recommended` | A curated list, written by hand in [`src/index.ts`](./src/index.ts) | Stays opt-in until someone lists it |
| `oxsome.all`         | Every rule the plugin ships, derived from the plugin itself         | Included automatically              |

Use `recommended` to accept the package's opinion. Use `all` to take everything it has, including rules added later.

```ts
export default defineConfig({
  extends: [oxsome.all],
  jsPlugins: ['@rhberro/oxsome/plugin'],
});
```

Today both contain the same four rules, so they behave identically. They diverge the moment a fifth rule lands: `recommended` will not have it, `all` will.

If you depend on `all`, a new rule can fail your build on a minor version bump.

### Formatting

[oxfmt](https://oxc.rs/docs/guide/usage/formatter.html) has no `extends`, so spread the preset:

```sh
npm install -D @rhberro/oxsome oxfmt
```

```ts
// oxfmt.config.ts
import { oxfmt } from '@rhberro/oxsome';
import { defineConfig } from 'oxfmt';

export default defineConfig({
  ...oxfmt,
});
```

Defaults: `printWidth: 100`, `semi: true`, `singleQuote: true`, `trailingComma: 'all'`, sorted imports, sorted `package.json`.

## Rules

| Rule                                                            | What it forbids                                                              |
| --------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| [`no-arrow-functions`](./CODING_STYLES.md#arrow-functions)                 | Arrow functions in any position.                                             |
| [`no-destructuring-in-params`](./CODING_STYLES.md#parameters-and-destructuring) | Destructuring in a function signature.                                       |
| [`no-inline-functions-objects-arrays`](./CODING_STYLES.md#inline-functions-objects-and-arrays) | Function, object and array literals passed inline into a call or a JSX prop. |
| [`no-jsx-inline-computation`](./CODING_STYLES.md#jsx-expressions)          | Expressions inside `{...}` in JSX.                                           |

Each rule exists to force a named, reusable value where an anonymous one would do. An arrow function cannot be referenced later; a destructured signature hides the function's contract from its call sites; an inline literal has no name to test or reuse; a JSX container is a description of the screen, not a place to compute.

[`CODING_STYLES.md`](./CODING_STYLES.md) explains every rule with valid and invalid examples. It is written to be handed to an AI agent, and it is the single source of truth for the examples.

### Options

`no-inline-functions-objects-arrays` accepts options that control which callbacks are exempt. Both default to `true`:

```jsonc
{
  "rules": {
    "oxsome/no-inline-functions-objects-arrays": [
      "error",
      {
        "allowHooks": true, // false to also reject hook callbacks
        "allowArrayCallbacks": true, // false to also reject array-method callbacks
      },
    ],
  },
}
```

### Known limitations

Three cases are stricter than intended, all three are lint errors today:

- **React dependency arrays are flagged.** The hook exemption covers the callback, not the other arguments, so `useEffect(setup, [])` is reported on the `[]`. Hoist it: `const deps = []`.
- **`new Promise(fn)` is flagged.** `Promise` is a constructor, and constructors get no callback exemption, while the allowlist only covers `then`, `catch` and `finally`. Write `Promise.resolve().then(fn)` or hoist the executor.
- **The `key` exemption does not apply.** `key={() => 1}` is reported. Hoist the callback.

## Coding agents

If your project uses an AI agent, give it [`CODING_STYLES.md`](./CODING_STYLES.md). It states the four rules in prose with examples, which gives you validation in two places: the agent knows the rule before it writes a line, and the lint rules catch whatever slips through.

The file is self-contained: no paths back to this repository, no links to follow, nothing to resolve. Copy it into your project as `docs/CODING_STYLES.md` or paste it straight into your agent instructions, then point the agent at it:

```md
<!-- in AGENTS.md -->

| Coding Styles | How functions, parameters, call arguments and JSX must be written. | Whenever writing, changing or reviewing code. | `docs/CODING_STYLES.md` |
```

`AGENTS.md` is the convention most agents read, but the name does not matter much — `CLAUDE.md`, `.cursorrules`, `.github/copilot-instructions.md` and similar files work just as well, as long as the agent is told to consult it.

Do not paraphrase the rules from memory in your own instructions. Point at the file instead, so there is one source of truth: when a rule changes or a defect is fixed, every project picks it up on the next update instead of drifting.

Read the _Known limitations_ section before generating code. Three cases are stricter than intended, and an agent that has not seen them will write code the linter then rejects.

## Development

```sh
npm ci
npm test
```

`npm test` builds with `tsc`, runs oxlint and checks formatting. The rules are TypeScript, typed against `ESTree` — the oxc AST types that `@oxlint/plugins` exports.

The repo dogfoods the package: all four rules run here, and `oxfmt.config.ts` spreads the preset it ships.

To add a rule, drop the file in [`src/rules/`](./src/rules) and register it in [`src/plugin.ts`](./src/plugin.ts). It stays out of `oxsome.recommended` until you list it in [`src/index.ts`](./src/index.ts). The compiler rejects a typo in that list, but not a missing entry.

### Why the rules are compiled

oxlint accepts TypeScript plugins — Node strips the types — but only outside `node_modules`:

```
ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING:
  Stripping types is currently unsupported for files under node_modules
```

So a published package has to ship JavaScript. `tsc` builds `dist/`, which is what goes on npm; `src/` stays behind.

## Publishing

Releases are driven by tags and authenticated with [Trusted Publishing](https://docs.npmjs.com/trusted-publishers) — no npm token lives in this repository.

```sh
npm version patch
git push --follow-tags
```

The workflow verifies the tag matches `package.json`, runs the test suite, and publishes. `prepublishOnly` also runs the suite, so a broken rule blocks the publish locally.

npm propagates a new version to the registry over a few minutes — a `404` right after a successful run is normal, not a failure.

Configure the trusted publisher on npmjs.com under _Package settings_ → _Trusted Publisher_, pointing at this repository and `publish.yml`, with `npm publish` allowed.

## License

MIT
