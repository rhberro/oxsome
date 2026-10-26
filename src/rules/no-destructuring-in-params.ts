import type { CreateOnceRule, ESTree } from '@oxlint/plugins';

type RuleContext = Parameters<CreateOnceRule['createOnce']>[0];

type Params = Array<ESTree.ParamPattern>;

function isPattern(node: ESTree.Node | null | undefined): boolean {
  if (node) {
    return node.type === 'ObjectPattern' || node.type === 'ArrayPattern';
  }
  return false;
}

/**
 * A rest param is the only `ParamPattern` carrying `argument`, so this is
 * equivalent to matching on `type === "RestElement"` without relying on the
 * declared union narrowing.
 */
function isRestParam(param: ESTree.ParamPattern): param is ESTree.FormalParameterRest {
  return 'argument' in param;
}

function checkParams(context: RuleContext, params: Params): void {
  for (const param of params) {
    if (isPattern(param)) {
      const report = { messageId: 'noParams', node: param };
      context.report(report);
      continue;
    }
    if (param.type === 'AssignmentPattern' && isPattern(param.left)) {
      const report = { messageId: 'noParams', node: param.left };
      context.report(report);
      continue;
    }
    if (isRestParam(param) && isPattern(param.argument)) {
      const report = { messageId: 'noParams', node: param.argument };
      context.report(report);
    }
  }
}

const rule: CreateOnceRule = {
  createOnce(context) {
    return {
      ArrowFunctionExpression(node: ESTree.ArrowFunctionExpression) {
        checkParams(context, node.params);
      },
      FunctionDeclaration(node: ESTree.Function) {
        checkParams(context, node.params);
      },
      FunctionExpression(node: ESTree.Function) {
        checkParams(context, node.params);
      },
      MethodDefinition(node: ESTree.MethodDefinition) {
        // `value` is declared narrower than what the runtime can hand us, so it
        // is widened to Node before the type checks.
        const value = node.value as ESTree.Node | null;
        if (
          value &&
          (value.type === 'FunctionExpression' || value.type === 'ArrowFunctionExpression')
        ) {
          checkParams(context, value.params);
        }
      },
      PropertyDefinition(node: ESTree.PropertyDefinition) {
        const value = node.value as ESTree.Node | null;
        if (
          value &&
          (value.type === 'FunctionExpression' || value.type === 'ArrowFunctionExpression')
        ) {
          checkParams(context, value.params);
        }
      },
    };
  },
  meta: {
    messages: {
      noParams: 'Destructure inside the function body, not in the signature.',
    },
    schema: [],
  },
};

export default rule;
