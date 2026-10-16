/**
 * @param {any} context oxlint rule context
 * @param {unknown} node
 */
function reportArrow(context, node) {
  const report = { messageId: 'noArrow', node };
  context.report(report);
}

export default {
  /**
   * @param {any} context
   */
  createOnce(context) {
    return {
      /**
       * @param {unknown} node
       */
      ArrowFunctionExpression(node) {
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
