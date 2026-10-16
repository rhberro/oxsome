# @rhberro/oxsome

Plugin de **oxlint** com 4 regras autorais, mais uma config compartilhada de
**oxfmt**. Instale uma vez em cada projeto e pare de duplicar configuração.

As regras são TypeScript, tipadas com os nós da AST do oxc (`ESTree`) que o
próprio `@oxlint/plugins` exporta. `tsc` compila para `dist/` — é o único passo
de build.

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
[`src/plugin.ts`](./src/plugin.ts).

Ela **não** entra no `oxsome.recommended` sozinha: a lista é escrita à mão, de
propósito. Uma regra nova nasce opt-in e só vira recommended quando você a
adicionar em [`src/index.ts`](./src/index.ts). O compilador aceita os dois
comportamentos — o que ele recusa é um **typo** no nome da regra.

### Por que as regras precisam ser compiladas

O oxlint aceita plugin `.ts` (o Node faz type-stripping), **mas só fora de
`node_modules`**:

```
ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING:
  Stripping types is currently unsupported for files under node_modules
```

Então um pacote publicado tem que entregar JS compilado. É o que o `tsc` faz —
`dist/` é o que vai no npm, e `src/` fica de fora.

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

## Desenvolvimento

```sh
npm ci
npm test
```

`npm test` compila, roda o oxlint e o format check. Os dois configs deste repo
apontam para `dist/`, então `prelint` compila antes — nada é lintado contra
código velho.

O repo se dogfooda: as 4 regras valem aqui também (só
`no-inline-functions-objects-arrays` fica desligada, porque reprovaria o
próprio `defineConfig({ ... })`), e o `oxfmt.config.ts` faz spread do preset que
o pacote exporta.

## Publicação

Primeira vez, manual:

```sh
npm login
npm run build
npm publish --access public --provenance
```

`prepublishOnly` roda `npm test` (build + lint + format check), então publicar
com regra quebrada falha.

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
