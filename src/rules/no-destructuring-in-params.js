function isPattern(node) {
  return node && (node.type === 'ObjectPattern' || node.type === 'ArrayPattern');
}

export default {
  createOnce(context) {
    function checkParams(params) {
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
        if (param.type === 'RestElement' && isPattern(param.argument)) {
          const report = { messageId: 'noParams', node: param.argument };
          context.report(report);
        }
      }
    }
    return {
      ArrowFunctionExpression(node) {
        checkParams(node.params);
      },
      FunctionDeclaration(node) {
        checkParams(node.params);
      },
      FunctionExpression(node) {
        checkParams(node.params);
      },
      MethodDefinition(node) {
        const value = node.value;
        if (
          value &&
          (value.type === 'FunctionExpression' || value.type === 'ArrowFunctionExpression')
        ) {
          checkParams(value.params);
        }
      },
      PropertyDefinition(node) {
        const value = node.value;
        if (
          value &&
          (value.type === 'FunctionExpression' || value.type === 'ArrowFunctionExpression')
        ) {
          checkParams(value.params);
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
