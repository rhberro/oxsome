# @rhberro/oxsome

Um plugin de **oxlint** com 4 regras autorais, mais uma config compartilhada de
**oxfmt**. Instale uma vez em cada projeto e pare de duplicar configuração.

- Plugin JS para oxlint, carregado por specifier de pacote.
- Config de formatação via spread.
- Build dual (ESM + CJS) com tipos. Uma dependência de runtime
  (`@oxlint/plugins`).

## As 4 regras

| Regra                                       | O que proíbe                                                                           |
| ------------------------------------------- | -------------------------------------------------------------------------------------- |
| `oxsome/no-arrow-functions`                 | Arrow function em qualquer posição. Declare uma função nomeada e passe por referência. |
| `oxsome/no-destructuring-in-params`         | Desestruturação na assinatura. Desestruture dentro do corpo.                           |
| `oxsome/no-inline-functions-objects-arrays` | Funções, objetos e arrays inline como argumento de call ou prop de JSX.                |
| `oxsome/no-jsx-inline-computation`          | Computação dentro de `{...}` em JSX. Extraia para uma constante nomeada.               |

`no-inline-functions-objects-arrays` aceita opções:

```jsonc
{
  "rules": {
    "oxsome/no-inline-functions-objects-arrays": [
      "error",
      {
        "allowHooks": true, // permite `useEffect(() => ...)`, `useMemo(...)`, ...
        "allowArrayCallbacks": true, // permite `.map(...)`, `.filter(...)`, ...
      },
    ],
  },
}
```

`then` / `catch` / `finally` são sempre permitidos.

## Uso

```sh
npm install -D @rhberro/oxsome oxlint
```

```ts
// oxlint.config.ts
import { oxsome } from '@rhberro/oxsome';
import { defineConfig } from 'oxlint';

export default defineConfig({
  extends: [oxsome.recommended],
  jsPlugins: ['@rhberro/oxsome/plugin'],
});
```

> **Por que as duas linhas?** O `extends` do oxlint só herda `rules`, `plugins`
> e `overrides`. `jsPlugins` **não** é herdável, então o caminho do plugin
> precisa ser declarado no projeto. E `extends` com import de pacote só
> funciona em `oxlint.config.ts`, nunca em `.oxlintrc.json`.
>
> Sem o `jsPlugins` o oxlint falha alto (`Plugin 'oxsome' not found`). Sem o
> `extends` ele roda em silêncio e não reporta nada — cuidado com isso.

### Sobrescrever regras

O merge vai da esquerda para a direita, então regras locais vencem:

```ts
export default defineConfig({
  extends: [oxsome.recommended],
  jsPlugins: ['@rhberro/oxsome/plugin'],
  rules: {
    'oxsome/no-arrow-functions': 'off',
  },
});
```

### Aliasar o plugin

Na forma string, o oxlint deriva o prefixo das regras do `meta.name` do plugin
(`oxsome`). Se preferir outro prefixo, use a forma objeto:

```ts
jsPlugins: [{ name: "house-style", specifier: "@rhberro/oxsome/plugin" }],
```

e as regras passam a ser `house-style/no-arrow-functions` — inclusive as de
`extends`, que precisam ser renomeadas junto.

## Format

O `oxfmt` **não tem `extends`**, então cada projeto faz spread:

```sh
npm install -D @rhberro/oxsome oxfmt
```

```ts
// oxfmt.config.ts
import { oxfmt } from '@rhberro/oxsome';
import { defineConfig } from 'oxfmt';

export default defineConfig({
  ...oxfmt,
  printWidth: 120, // suas opções por cima
});
```

Defaults: `printWidth: 100`, `semi: true`, `singleQuote: true`,
`trailingComma: "all"`, imports ordenados, `package.json` ordenado.

## Scripts

```jsonc
{
  "scripts": {
    "lint": "oxlint",
    "lint:fix": "oxlint --fix",
    "format": "oxfmt .",
    "format:check": "oxfmt --check .",
  },
}
```

## Desenvolvimento

```sh
npm ci
npm test
```

`npm test` roda typecheck, lint, format check, build e o `npm run verify`, que
empacota o pacote, instala o tarball num projeto temporário e roda
`oxlint`/`oxfmt` de verdade lá dentro — incluindo um arquivo que viola as 4
regras e um que cumpre todas. É o que garante que a publicação não quebra na
hora de consumir.

As regras vivem em [`src/rules/`](./src/rules) e são JS puro, sem etapa de
build. Para mudar o comportamento de alguma delas, edite o arquivo e rode
`npm test`.

### Como o repo se dogfooda

O [`oxlint.config.ts`](./oxlint.config.ts) deste repo carrega o próprio plugin
por path local, então `npm run lint` exercita o caminho real de specifier — o
loader do oxlint não resolve auto-referência de pacote. As duas regras mais
agressivas ficam desligadas aqui porque elas foram escritas para código de
aplicação, não para os scripts de build deste repo.

> **Cuidado ao escrever seu config:** `no-inline-functions-objects-arrays` reprova
> `defineConfig({ ... })`, porque o objeto literal é argumento de call. Declare
> uma variável e passe para o `defineConfig`:
>
> ```ts
> const config = { extends: [oxsome.recommended] };
> export default defineConfig(config);
> ```

## Publicação

Primeira vez, manual:

```sh
npm login
npm run build
npm publish --access public --provenance
```

Depois, publicar é só criar uma tag — a [workflow de publish](./.github/workflows/publish.yml)
faz o resto via npm Trusted Publishing (OIDC, sem token no repositório):

```sh
npm version patch
git push --follow-tags
```

> Trusted Publishing precisa estar habilitado em npmjs.com → _Package settings_
> → _Trusted Publisher_, apontando para o repo `rhberro/oxsome` e o workflow
> `publish.yml`. Enquanto não estiver configurado, a primeira publicação tem que
> ser manual.

## Licença

MIT
