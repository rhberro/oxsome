function reportArrow(context, node) {
  const report = { messageId: 'noArrow', node };
  context.report(report);
}

export default {
  createOnce(context) {
    return {
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
