# Coding Styles

Code in this project must follow the rules below. Each one is enforced by a lint rule, so a violation fails the build — but write code that already complies rather than relying on the linter to catch it.

Rules not covered here are up to you.

## Arrow functions

None. Not anywhere — components, callbacks, event handlers, `then`/`catch`, `map`/`filter`, hooks. Use `function` declarations or named function expressions. When a function is the first call argument, declare it before the call and pass it by reference.

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
items.map(
  (item) => <li>{item.label}</li>
);
```

Do this:

```ts
function myEffect() {
  doThing();
}

useEffect(
  myEffect,
  [dependency]
);
```

Avoid this:

```ts
useEffect(
  () => {
    doThing();
  },
  [dependency]
);
```

## Parameters and destructuring

Destructure inside the function body, never in the signature. A destructured signature hides what the function actually requires from anyone reading the call site.

Rule: `oxsome/no-destructuring-in-params`

Do this:

```ts
function updatePlayer(props: UpdatePlayerProps) {
  const { id, name } = props;
}
```

Avoid this:

```ts
function updatePlayer(
  { id, name }: UpdatePlayerProps
) {}
```

The same applies to array patterns, default values and rest parameters.

Do this:

```ts
type Numbers = Array<number>;

function first(args: Numbers) {
  const [head] = args;
  return head;
}
```

Avoid this:

```ts
function first(
  [head]: Numbers
) {
  return head;
}
```

## Inline functions, objects and arrays

Do not pass a function, object or array literal as the first argument of a call or constructor. Give that value a name before the call. Later arguments may contain inline literals.

Rule: `oxsome/no-inline-functions-objects-arrays`

Do this:

```ts
const options = { retries: 2 };

run(options);
```

Avoid this:

```ts
run(
  { retries: 2 }
);
```

The rule also covers `new`:

Do this:

```ts
const config = { id: 1 };

const thing = new Thing(config);
```

Avoid this:

```ts
const thing = new Thing(
  { id: 1 }
);
```

Each nested call has its own first argument, so this also applies inside another call:

Do this:

```ts
const settings = { retries: 2 };

run(
  normalize(settings)
);
```

Avoid this:

```ts
run(
  normalize(
    { retries: 2 }
  )
);
```

Inline literals in later arguments are allowed by this rule:

```ts
run(
  options,
  { retries: 2 }
);

run(
  options,
  [item]
);

run(
  options,
  function handleResult() {}
);
```

Arrow functions are still forbidden by `oxsome/no-arrow-functions`, regardless of argument position. JSX expression containers follow `oxsome/no-jsx-inline-computation`.

Passing a function by reference works everywhere:

```ts
items.map(toId);

queue.add(toAdd);

promise.then(unwrap);

new Promise(executor);

useEffect(
  setup,
  [dependency]
);
```

React dependency arrays naturally fit this rule because they are later arguments. There is no hook-specific exception or import check.

Do this:

```tsx
function calculate() {
  return filterItems(items, filter);
}

const visibleItems = useMemo(
  calculate,
  [items, filter]
);
```

The callback is still the first argument, so declare it before the hook call. React's dependency lint can inspect the inline array.

## Inline structural types

Name structural types before using them. Function, constructor, object, tuple and arrays of non-primitive types must be declared with `type` or `interface`. Primitive annotations such as `string`, `number` and `boolean`, and arrays of primitive types such as `Array<number>`, can be used directly. The rule also catches structural types nested inside a generic annotation, while allowing them inside the declaration of a named type.

Rule: `oxsome/no-inline-structural-types`

Do this:

```ts
type Callback = (value: string) => void;

type Result = { success: boolean };

function process(items: Array<string>, callback: Callback): Result {}
```

Avoid this:

```ts
function process(items: Array<string>, callback: (value: string) => void): { success: boolean } {}
```

Generic types can keep their type parameter in a named alias: `type Callback<T> = (value: T) => void;`. A union of primitives such as `string | undefined` is still allowed directly.

An array of a named object type still needs its own name:

```ts
type Items = Array<Item>;

function processItems(items: Items) {}
```

## Generic array types

Always write `Array<T>` or `ReadonlyArray<T>`, including inside type aliases. The shorthand `T[]` is rejected independently of the inline structural type rule.

Rule: `oxsome/prefer-generic-array-types`

Do this:

```ts
function sum(values: Array<number>): number {}
```

Avoid this:

```ts
function sum(
  values: number[]
): number {}
```

## JSX expressions

A JSX expression container holds a name, nothing else. JSX describes what is on screen; it is not the place where values get computed. Extract the computation into a named constant first.

Rule: `oxsome/no-jsx-inline-computation`

Do this:

```tsx
function PlayerCard(props: PlayerCardProps) {
  const { name, level } = props;
  const label = name + ' — ' + level;
  return <span>{label}</span>;
}
```

Avoid this:

```tsx
function PlayerCard(props: PlayerCardProps) {
  const { name, level } = props;
  return <span>{name + ' — ' + level}</span>;
}
```

Inside `{}` these are all fine, because each one is a reference rather than a computation:

```tsx
<span>{label}</span>

<span>{props.level}</span>

<span>{"static text"}</span>

<span>{"no interpolation"}</span>
```
