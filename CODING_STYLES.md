# Coding Styles

The four conventions below are enforced by the [`@rhberro/oxsome`](https://www.npmjs.com/package/@rhberro/oxsome) oxlint plugin. Follow them when writing, changing or reviewing code. Every one of them has a lint rule that will fail the build if it is ignored.

## Referencing this file

Point your agent at this file from the project's `AGENTS.md`. The lint rules are the backstop; this document is the intent, so the agent knows the rule _before_ it writes the code instead of discovering it from a failure.

```md
<!-- in AGENTS.md -->

| Coding Styles | Code conventions: how functions, parameters, call arguments and JSX must be written. | Whenever writing, changing or reviewing code. | `docs/CODING_STYLES.md` |
```

A project only needs its own copy of the sections that apply. Keep this file in sync with the rules themselves: `oxsome.all` in [`src/index.ts`](./src/index.ts) covers everything listed here, and a new rule added to the plugin joins it automatically. A project extending `oxsome.recommended` may be missing a newer rule until this document catches up.

## Arrow functions

None. Not anywhere — components, callbacks, event handlers, `then`/`catch`, `map`/`filter`, hooks. Every function is declared with `function`, named, defined before use, and passed by reference.

Rule: [`no-arrow-functions`](https://www.npmjs.com/package/@rhberro/oxsome).

Do this:

```ts
function renderItem(item: Item) {
  return <li>{item.label}</li>;
}

items.map(renderItem);
```

Avoid this:

```ts
items.map((item) => <li>{item.label}</li>);
```

Do this:

```ts
function myEffect() {
  doThing();
}

const deps: unknown[] = [dependency];

useEffect(myEffect, deps);
```

Avoid this:

```ts
useEffect(() => {
  doThing();
}, [dependency]);
```

## Parameters and destructuring

Destructure inside the function body, never in the signature. A destructured signature hides what the function actually requires from anyone reading the call site.

Rule: [`no-destructuring-in-params`](https://www.npmjs.com/package/@rhberro/oxsome).

Do this:

```ts
function updatePlayer(props: UpdatePlayerProps) {
  const { id, name } = props;
  // ...
}
```

Avoid this:

```ts
function updatePlayer({ id, name }: UpdatePlayerProps) {
  // ...
}
```

The same applies to array patterns, default values and rest parameters.

Do this:

```ts
function first(args: number[]) {
  const [head] = args;
  return head;
}
```

Avoid this:

```ts
function first([head]: number[]) {
  return head;
}
```

## Inline functions, objects and arrays

Never pass a function, object or array literal straight into a call or a JSX prop. A literal written inline is anonymous: it has no name, so it cannot be reused, referenced or tested. Extract it to a named constant and pass the name.

Rule: [`no-inline-functions-objects-arrays`](https://www.npmjs.com/package/@rhberro/oxsome).

Do this:

```ts
const options = { retries: 2 };

run(options);
```

Avoid this:

```ts
run({ retries: 2 });
```

The rule also covers `new`:

Do this:

```ts
const config = { id: 1 };

const thing = new Thing(config);
```

Avoid this:

```ts
const thing = new Thing({ id: 1 });
```

A literal passed as a JSX prop is the same violation:

Do this:

```ts
<Box style={panelStyle} />
```

Avoid this:

```ts
<Box style={{ margin: 0 }} />;
```

The callback argument is exempt when the call is a React hook, an array method or a promise method, so these stay as they are:

```ts
items.map(toId);
promise.then(unwrap);
useEffect(setup, deps);
```

Watch the remaining arguments. Only the callback is exempt — everything else still has to be hoisted, including a React dependency array:

```ts
// flagged: the [] is an inline literal
useEffect(setup, []);
```

Do this:

```ts
const deps: Item[] = [];

useEffect(setup, deps);
```

## JSX expressions

A JSX expression container holds a name, nothing else. JSX describes what is on screen; it is not the place where values get computed. Extract the computation into a named constant first.

Rule: [`no-jsx-inline-computation`](https://www.npmjs.com/package/@rhberro/oxsome).

Do this:

```tsx
function PlayerCard(props: PlayerCardProps) {
  const { name, level } = props;
  const label = `${name} — level ${level}`;

  return <span>{label}</span>;
}
```

Avoid this:

```tsx
function PlayerCard(props: PlayerCardProps) {
  const { name, level } = props;

  return <span>{`${name} — level ${level}`}</span>;
}
```

Inside `{}` these are all fine, because each one is a reference rather than a computation:

```tsx
<span>{label}</span>
<span>{props.level}</span>
<span>{"static text"}</span>
<span>{"no interpolation"}</span>
```

## Known limitations

Three cases are stricter than intended. All three are lint errors today, so do not write them expecting them to pass.

- **Dependency arrays are flagged.** The hook exemption covers the callback only, so `useEffect(setup, [])` reports the `[]`. Hoist it into a variable.
- **`new Promise(fn)` is flagged.** `Promise` is a constructor, and constructors get no callback exemption. Use `Promise.resolve().then(fn)` or hoist the executor.
- **The `key` exemption does not apply.** `isJsxKeyAttribute` compares the attribute name against `"Identifier"` while oxc names that node `JSXIdentifier`, so the check never matches. `key={() => 1}` is reported.
