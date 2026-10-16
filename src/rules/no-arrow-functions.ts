import type { CreateOnceRule, ESTree } from '@oxlint/plugins';

type RuleContext = Parameters<CreateOnceRule['createOnce']>[0];

function reportArrow(context: RuleContext, node: ESTree.Node): void {
  const report = { messageId: 'noArrow', node };
  context.report(report);
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
