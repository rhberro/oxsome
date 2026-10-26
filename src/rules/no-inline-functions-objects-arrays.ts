import type { CreateOnceRule, ESTree } from '@oxlint/plugins';

type RuleContext = Parameters<CreateOnceRule['createOnce']>[0];

type Node = ESTree.Node;

function isInlineLiteral(expression: Node): boolean {
  return (
    expression.type === 'ArrowFunctionExpression' ||
    expression.type === 'FunctionExpression' ||
    expression.type === 'ObjectExpression' ||
    expression.type === 'ArrayExpression'
  );
}

function reportInlineLiteral(context: RuleContext, node: Node): void {
  const report = { messageId: 'noInline', node };
  context.report(report);
}

/** Every nested call is visited separately, so only inspect this call's first argument. */
function checkFirstArgument(
  context: RuleContext,
  node: ESTree.CallExpression | ESTree.NewExpression,
): void {
  const first = node.arguments[0];
  if (!first) {
    return;
  }
  if (first.type === 'SpreadElement') {
    if (isInlineLiteral(first.argument)) {
      reportInlineLiteral(context, first);
    }
    return;
  }
  if (isInlineLiteral(first)) {
    reportInlineLiteral(context, first);
  }
}

const rule: CreateOnceRule = {
  createOnce(context) {
    return {
      CallExpression(node: ESTree.CallExpression) {
        checkFirstArgument(context, node);
      },
      NewExpression(node: ESTree.NewExpression) {
        checkFirstArgument(context, node);
      },
    };
  },
  meta: {
    messages: {
      noInline:
        'Declare a function, object or array before passing it as the first ' +
        'argument of a call or constructor.',
    },
  },
};

export default rule;
