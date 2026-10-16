# @rhberro/oxsome

Plugin de **oxlint** com 4 regras autorais, mais uma config compartilhada de
**oxfmt**. Instale uma vez em cada projeto e pare de duplicar configuração.

JS puro, sem etapa de build. O que está em `src/` é exatamente o que é publicado.

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
> e `overrides` — `jsPlugins` não é herdável, então o caminho do plugin precisa
> ser declarado no projeto. E `extends` com import de pacote só funciona em
> `oxlint.config.ts`, nunca em `.oxlintrc.json`.
>
> Sem o `jsPlugins` o oxlint falha alto (`Plugin 'oxsome' not found`). Sem o
> `extends` ele roda em silêncio e não reporta nada.

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

### Adicionar uma regra

Jogue o arquivo em [`src/rules/`](./src/rules) e registre em
[`src/plugin.js`](./src/plugin.js). O `oxsome.recommended` é gerado a partir das
chaves do plugin, então a regra nova entra sozinha — sem mexer em mais nada.

### Cuidado ao escrever seu config

`no-inline-functions-objects-arrays` reprova `defineConfig({ ... })`, porque o
objeto literal vira argumento de call — e ela também vale para o próprio
arquivo de config. Declare uma variável:

```ts
const config = { extends: [oxsome.recommended] };
export default defineConfig(config);
```

## Format

O `oxfmt` **não tem `extends`**, então cada projeto faz spread:

```sh
npm install -D @rhberro/oxsome oxfmt
```

```ts
// oxfmt.config.ts
import { oxfmt } from '@rhberro/oxsome';
import { defineConfig } from 'oxfmt';

const config = { ...oxfmt };

export default defineConfig(config);
```

Defaults: `printWidth: 100`, `semi: true`, `singleQuote: true`,
`trailingComma: "all"`, imports ordenados, `package.json` ordenado.

## Publicação

Primeira vez, manual:

```sh
npm login
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
