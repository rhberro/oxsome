import type { CreateOnceRule, ESTree } from '@oxlint/plugins';

function reportArrow(
  context: Parameters<CreateOnceRule['createOnce']>[0],
  node: ESTree.Node,
): void {
  context.report({ messageId: 'noArrow', node });
}

const rule: CreateOnceRule = {
  createOnce(context) {
    return {
      ArrowFunctionExpression(node: ESTree.ArrowFunctionExpression) {
        reportArrow(context, node);
      },
    };
  },
  meta: {
    messages: {
      noArrow:
        'Arrow functions are not allowed in any position. Declare a named ' +
        'function before use and pass it by reference.',
    },
  },
};

export default rule;
