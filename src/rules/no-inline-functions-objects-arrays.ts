import type { CreateOnceRule, ESTree } from '@oxlint/plugins';

type RuleContext = Parameters<CreateOnceRule['createOnce']>[0];
type Node = ESTree.Node;
type Expression = ESTree.Expression;

function isInlineLiteral(expression: Node): expression is Expression {
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

/**
 * Checks every argument of a call, descending into nested calls so a literal
 * buried a level down is still caught.
 *
 * No argument is exempt. The previous version allowed callbacks for React
 * hooks, array methods and promise methods, which was incoherent: the allowlist
 * could never be complete (`queue.add(fn)` failed while `items.map(fn)`
 * passed), and `new Promise(fn)` failed while `promise.then(fn)` passed. Those
 * exemptions mostly existed to let inline arrow functions through, which
 * `no-arrow-functions` already forbids.
 */
function checkCallArguments(
  context: RuleContext,
  node: ESTree.CallExpression | ESTree.NewExpression,
  consumed: Set<Node>,
): void {
  for (const arg of node.arguments) {
    if (arg.type === 'SpreadElement') {
      if (isInlineLiteral(arg.argument)) {
        reportInlineLiteral(context, arg);
      }
      continue;
    }

    if (arg.type === 'CallExpression' || arg.type === 'NewExpression') {
      if (consumed.has(arg)) {
        continue;
      }
      consumed.add(arg);
      checkCallArguments(context, arg, consumed);
      continue;
    }

    if (isInlineLiteral(arg)) {
      reportInlineLiteral(context, arg);
    }
  }
}

function checkJsxAttribute(context: RuleContext, node: ESTree.JSXAttribute): void {
  const value = node.value;
  if (!value || value.type !== 'JSXExpressionContainer') {
    return;
  }
  const { expression } = value;
  if (expression.type !== 'JSXEmptyExpression' && isInlineLiteral(expression)) {
    reportInlineLiteral(context, expression);
  }
}

const rule: CreateOnceRule = {
  createOnce(context) {
    // Nested calls are checked by the outermost call that contains them. The
    // visitor still fires for them, so this set is what stops a second report.
    const consumed = new Set<Node>();

    return {
      CallExpression(node: ESTree.CallExpression) {
        if (consumed.has(node)) {
          return;
        }
        checkCallArguments(context, node, consumed);
      },
      JSXAttribute(node: ESTree.JSXAttribute) {
        checkJsxAttribute(context, node);
      },
      NewExpression(node: ESTree.NewExpression) {
        if (consumed.has(node)) {
          return;
        }
        checkCallArguments(context, node, consumed);
      },
    };
  },
  meta: {
    messages: {
      noInline:
        "Declare functions, objects, and arrays before use. Don't pass " +
        'them inline as call arguments, constructor arguments or JSX props.',
    },
  },
};

export default rule;
