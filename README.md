# @rhberro/oxsome

Configuração compartilhada de **oxlint** e **oxfmt**. Instale uma vez em cada
projeto e passe a herdar as mesmas regras, sem duplicar configuração.

- Zero dependências em runtime — o pacote só exporta objetos de configuração.
- TypeScript com `.d.ts`, build dual (ESM + CJS).
- Publicado como `@rhberro/oxsome` no npm.

## Uso

```sh
npm install -D @rhberro/oxsome oxlint oxfmt
```

### Lint

O `oxlint` suporta `extends` com objeto importado de um pacote, mas **apenas em
`oxlint.config.ts`** (não funciona em `.oxlintrc.json`).

```ts
// oxlint.config.ts
import { oxlint } from '@rhberro/oxsome';
import { defineConfig } from 'oxlint';

export default defineConfig({
  extends: [oxlint],

  // `env` e `globals` NÃO são herdados — defina por projeto.
  env: { browser: true },
  globals: { React: 'readonly' },

  // Suas regras locais sobrescrevem as do pacote (merge da esquerda para a direita).
  rules: {
    'no-console': 'off',
  },
});
```

### Format

O `oxfmt` **não tem `extends`**. Cada projeto precisa de um
`oxfmt.config.ts` que faz spread do objeto:

```ts
// oxfmt.config.ts
import { oxfmt } from '@rhberro/oxsome';
import { defineConfig } from 'oxfmt';

export default defineConfig({
  ...oxfmt,

  // suas opções por cima
  printWidth: 120,
});
```

### Scripts

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

## O que é herdado (e o que não é)

O `extends` do oxlint mescla somente três campos:

| Campo            | Herdado via `extends` |
| ---------------- | --------------------- |
| `rules`          | ✅                    |
| `plugins`        | ✅                    |
| `overrides`      | ✅                    |
| `env`            | ❌                    |
| `globals`        | ❌                    |
| `settings`       | ❌                    |
| `categories`     | ❌                    |
| `options`        | ❌                    |
| `ignorePatterns` | ❌                    |

Isso é intencional: `env` e `globals` dependem do runtime do projeto (browser,
node, workers), então ficam com o consumidor.

## O preset

- Plugins: `eslint`, `oxc`, `unicorn`, `promise`, `import`
- Regras focadas em **correção**, não em estilo — estilo é território do
  `oxfmt`, e duplicar as duas coisas só gera churn.
- Formatação: `printWidth: 100`, `semi: true`, `singleQuote: true`,
  `trailingComma: "all"`, imports ordenados, `package.json` ordenado.

Edite [`src/lint/index.ts`](./src/lint/index.ts) e
[`src/format/index.ts`](./src/format/index.ts) para mudar as regras.

## Desenvolvimento

```sh
npm ci
npm test
```

`npm test` roda typecheck, lint, format check, build e o `npm run verify`, que
empacota o pacote, instala o tarball num projeto temporário e executa
`oxlint`/`oxfmt` de verdade lá dentro. É o que garante que a publishes não
quebra na hora de consumir.

## Publicação

Publicação manual (primeira vez):

```sh
npm login
npm run build
npm publish --access public --provenance
```

Depois disso, publicar é só criar uma tag — a [workflow de publish](./.github/workflows/publish.yml)
faz o resto via npm Trusted Publishing (OIDC, sem token no repositório):

```sh
npm version patch   # commita a tag v0.1.1
git push --follow-tags
```

> Trusted Publishing precisa estar habilitado em
> npmjs.com → _Package settings_ → _Trusted Publisher_, apontando para o repo
> `rhberro/oxsome` e o workflow `publish.yml`. Enquanto não estiver
> configurado, a primeira publicação tem que ser manual.

## Licença

MIT
