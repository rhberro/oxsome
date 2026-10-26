import type { CreateOnceRule, ESTree } from '@oxlint/plugins';

const rule: CreateOnceRule = {
  createOnce(context) {
    return {
      TSArrayType(node: ESTree.TSArrayType) {
        const report = { messageId: 'preferGenericArray', node };
        context.report(report);
      },
    };
  },
  meta: {
    messages: {
      preferGenericArray: 'Write array types as Array<T> or ReadonlyArray<T>, not T[].',
    },
  },
};

export default rule;
