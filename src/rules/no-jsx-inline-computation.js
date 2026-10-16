function isSimpleTemplateLiteral(node) {
  return node.type === 'TemplateLiteral' && node.expressions.length === 0;
}

export default {
  createOnce(context) {
    return {
      JSXExpressionContainer(node) {
        const { expression } = node;
        if (!expression || expression.type === 'JSXEmptyExpression') {
          return;
        }
        const report = { messageId: 'noInline', node: expression };
        switch (expression.type) {
          case 'Identifier':
          case 'MemberExpression':
          case 'Literal':
          case 'JSXElement':
          case 'JSXFragment':
            return;
          case 'TemplateLiteral':
            if (isSimpleTemplateLiteral(expression)) {
              return;
            }
            context.report(report);
            return;
          default:
            context.report(report);
        }
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
