import type { CreateOnceRule, ESTree } from '@oxlint/plugins';

function isSimpleTemplateLiteral(node: ESTree.Node): boolean {
  return node.type === 'TemplateLiteral' && node.expressions.length === 0;
}

const ALLOWED_TYPES: readonly ESTree.Node['type'][] = [
  'Identifier',
  'MemberExpression',
  'Literal',
  'JSXElement',
  'JSXFragment',
];

const rule: CreateOnceRule = {
  createOnce(context) {
    return {
      JSXExpressionContainer(node: ESTree.JSXExpressionContainer) {
        const { expression } = node;
        if (expression.type === 'JSXEmptyExpression') {
          return;
        }
        if (ALLOWED_TYPES.includes(expression.type)) {
          return;
        }
        if (expression.type === 'TemplateLiteral' && isSimpleTemplateLiteral(expression)) {
          return;
        }
        context.report({ messageId: 'noInline', node: expression });
      },
    };
  },
  meta: {
    messages: {
      noInline:
        'JSX expression containers must hold only a reference, prop access, ' +
        'or simple template literal. Compute this into a named constant ' +
        'before the return.',
    },
  },
};

export default rule;
