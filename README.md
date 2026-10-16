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

| Rule                                                                        | What it forbids                                                              |
| --------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| [`no-arrow-functions`](#no-arrow-functions)                                 | Arrow functions in any position.                                             |
| [`no-destructuring-in-params`](#no-destructuring-in-params)                 | Destructuring in a function signature.                                       |
| [`no-inline-functions-objects-arrays`](#no-inline-functions-objects-arrays) | Function, object and array literals passed inline into a call or a JSX prop. |
| [`no-jsx-inline-computation`](#no-jsx-inline-computation)                   | Expressions inside `{...}` in JSX.                                           |

### no-arrow-functions

Arrow functions hide the function's identity: you cannot name it, you cannot reference it later, and you cannot pass it around without re-creating it. Every arrow function has to be declared as a named function and passed by reference.

Callbacks are included — including the ones people expect to be exempt.

Invalid:

```ts
const double = (n: number) => n * 2;

const ids = items.map((item) => item.id);

<Button onClick={() => close()} />;
```

Valid:

```ts
function double(n: number) {
  return n * 2;
}

function toId(item: Item) {
  return item.id;
}

const ids = items.map(toId);
```

### no-destructuring-in-params

Destructuring in a signature makes the function's contract invisible at the call site. Read the body to find out what the function actually needs.

Invalid:

```ts
function Widget({ value }) {
  return value;
}

function Greeting({ name } = {}) {
  return name;
}

function first(...[head]) {
  return head;
}
```

Valid:

```ts
function Widget(props) {
  const { value } = props;
  return value;
}
```

### no-inline-functions-objects-arrays

A literal written inline is anonymous: there is no name for it, so it cannot be reused, tested, or memoized. Extract it to a named constant and pass the name.

Invalid:

```ts
run({ retries: 2 });

new Thing({ id: 1 });

run(() => 1);

<Box style={{ margin: 0 }} />;
```

Valid:

```ts
const options = { retries: 2 };
run(options);

items.map(toId);
promise.then(unwrap);
useEffect(setup, deps);
```

The callback argument is exempt when it belongs to a React hook, an array method (`map`, `filter`, `reduce`, ...) or a promise method (`then`, `catch`, `finally`). `NewExpression` is always checked.

Options:

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

### no-jsx-inline-computation

JSX is a description of what is on screen, not the place where values get computed. Anything inside `{...}` should be a name you could read out loud.

Invalid:

```tsx
<p>{props.value + 1}</p>;

<p>{`total: ${props.value}`}</p>;
```

Valid:

```tsx
const total = props.value + 1;

return <p>{total}</p>;
return <p>{props.label}</p>;
return <p>{'static text'}</p>;
```

Allowed inside `{}`: identifiers, member expressions, literals, nested JSX elements, and template literals without interpolation.

### Known limitations

Two cases behave worse than intended. Both are documented so they do not surprise you:

- **React dependency arrays are flagged.** The hook exemption covers the callback, not the other arguments, so `useEffect(setup, [])` is reported on the `[]`. Hoist it: `const deps = []`.
- **The `key` exemption does not apply.** `isJsxKeyAttribute` compares `name.type` against `'Identifier'`, but oxc types the attribute name as `JSXIdentifier`, so the check never matches and `key={() => 1}` is reported.

## Coding agents

If your project uses an AI agent, point it at [`CODING_STYLES.md`](./CODING_STYLES.md). The file states the same four rules in prose with examples, which gives you validation in two places: the agent knows the rule before it writes a line, and the lint rules catch whatever slips through.

Copy it into your project, or reference it straight from the repository:

```md
<!-- in AGENTS.md -->

| Coding Styles | How functions, parameters, call arguments and JSX must be written. | Whenever writing, changing or reviewing code. | `docs/CODING_STYLES.md` |
```

`AGENTS.md` is the convention most agents read, but the name does not matter much — `CLAUDE.md`, `.cursorrules`, `.github/copilot-instructions.md` and similar files work just as well, as long as the agent is told to consult it.

Do not paraphrase the rules from memory in your own instructions file. Point at [`CODING_STYLES.md`](./CODING_STYLES.md) instead, so there is a single source of truth: when a rule changes or a defect is fixed, every project picks it up on the next update instead of drifting.

That file also carries a _Known limitations_ section. Read it before generating code — two cases are stricter than intended, and an agent that has not seen them will write code the linter then rejects.

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
