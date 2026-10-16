# Coding Styles

Code in this project must follow the four rules below. Each one is enforced by a lint rule, so a violation fails the build — but write code that already complies rather than relying on the linter to catch it.

Rules not covered here are up to you.

## Arrow functions

None. Not anywhere — components, callbacks, event handlers, `then`/`catch`, `map`/`filter`, hooks. Every function is declared with `function`, named, defined before use, and passed by reference.

Rule: `oxsome/no-arrow-functions`

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

Rule: `oxsome/no-destructuring-in-params`

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

Rule: `oxsome/no-inline-functions-objects-arrays`

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

And a literal passed as a JSX prop is the same violation:

Do this:

```ts
<Box style={panelStyle} />
```

Avoid this:

```ts
<Box style={{ margin: 0 }} />;
```

This holds however deeply the literal is nested:

Do this:

```ts
const settings = { retries: 2 };

run(normalize(settings));
```

Avoid this:

```ts
run(normalize({ retries: 2 }));
```

The callback argument is exempt when the call is a React hook, an array method or a promise method, so these stay as they are:

```ts
items.map(toId);
promise.then(unwrap);
useEffect(setup, deps);
```

Only the callback is exempt. Every other argument still has to be hoisted, including a React dependency array:

Do this:

```ts
const deps: Item[] = [];

useEffect(setup, deps);
```

Avoid this:

```ts
useEffect(setup, []);
```

## JSX expressions

A JSX expression container holds a name, nothing else. JSX describes what is on screen; it is not the place where values get computed. Extract the computation into a named constant first.

Rule: `oxsome/no-jsx-inline-computation`

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
- **The `key` exemption does not apply.** `key={() => 1}` is reported. Hoist the callback.
