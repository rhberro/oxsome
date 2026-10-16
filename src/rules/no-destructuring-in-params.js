/**
 * @param {any} node
 * @returns {boolean}
 */
function isPattern(node) {
  return node && (node.type === 'ObjectPattern' || node.type === 'ArrayPattern');
}

export default {
  /**
   * @param {any} context
   */
  createOnce(context) {
    /**
     * @param {any[]} params
     */
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
      /**
       * @param {any} node
       */
      ArrowFunctionExpression(node) {
        checkParams(node.params);
      },
      /**
       * @param {any} node
       */
      FunctionDeclaration(node) {
        checkParams(node.params);
      },
      /**
       * @param {any} node
       */
      FunctionExpression(node) {
        checkParams(node.params);
      },
      /**
       * @param {any} node
       */
      MethodDefinition(node) {
        const value = node.value;
        if (
          value &&
          (value.type === 'FunctionExpression' || value.type === 'ArrowFunctionExpression')
        ) {
          checkParams(value.params);
        }
      },
      /**
       * @param {any} node
       */
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
