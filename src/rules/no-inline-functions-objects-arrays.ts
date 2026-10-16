import type { CreateOnceRule, ESTree } from '@oxlint/plugins';

type RuleContext = Parameters<CreateOnceRule['createOnce']>[0];
type Node = ESTree.Node;
type Expression = ESTree.Expression;

const REACT_HOOKS: readonly string[] = [
  'useEffect',
  'useLayoutEffect',
  'useMemo',
  'useCallback',
  'useImperativeHandle',
  'useReducer',
  'useState',
  'useTransition',
  'useDeferredValue',
  'useId',
  'useSyncExternalStore',
  'useRef',
  'useContext',
  'use',
  'useResource',
];

const ARRAY_METHODS: readonly string[] = [
  'map',
  'filter',
  'reduce',
  'reduceRight',
  'sort',
  'find',
  'findIndex',
  'findLast',
  'findLastIndex',
  'flatMap',
  'forEach',
  'some',
  'every',
  'slice',
];

const PROMISE_METHODS: readonly string[] = ['then', 'catch', 'finally'];

function isInlineLiteral(expression: Node): expression is Expression {
  return (
    expression.type === 'ArrowFunctionExpression' ||
    expression.type === 'FunctionExpression' ||
    expression.type === 'ObjectExpression' ||
    expression.type === 'ArrayExpression'
  );
}

function isFunctionLiteral(expression: Node): boolean {
  return expression.type === 'ArrowFunctionExpression' || expression.type === 'FunctionExpression';
}

function isAllowedHookName(name: string): boolean {
  return REACT_HOOKS.includes(name);
}

function isAllowedArrayMethodName(name: string): boolean {
  return ARRAY_METHODS.includes(name);
}

function isPromiseMethodName(name: string): boolean {
  return PROMISE_METHODS.includes(name);
}

function isAllowedIdentifierCallee(
  calleeNode: ESTree.IdentifierReference,
  allowHooks: boolean,
  allowArrayCallbacks: boolean,
): boolean {
  const { name } = calleeNode;
  if (allowHooks && isAllowedHookName(name)) {
    return true;
  }
  if (allowArrayCallbacks && isAllowedArrayMethodName(name)) {
    return true;
  }
  return isPromiseMethodName(name);
}

function isAllowedMemberCallee(
  calleeNode: ESTree.MemberExpression,
  allowArrayCallbacks: boolean,
): boolean {
  const { property } = calleeNode;
  if (property.type !== 'Identifier') {
    return false;
  }
  if (allowArrayCallbacks && isAllowedArrayMethodName(property.name)) {
    return true;
  }
  return isPromiseMethodName(property.name);
}

function isAllowedCallbackCallee(
  calleeNode: Expression,
  allowHooks: boolean,
  allowArrayCallbacks: boolean,
): boolean {
  if (calleeNode.type === 'Identifier') {
    return isAllowedIdentifierCallee(calleeNode, allowHooks, allowArrayCallbacks);
  }
  if (calleeNode.type === 'MemberExpression') {
    return isAllowedMemberCallee(calleeNode, allowArrayCallbacks);
  }
  return false;
}

function reportInlineLiteral(context: RuleContext, node: Node): void {
  context.report({ messageId: 'noInline', node });
}

function checkCallArguments(
  context: RuleContext,
  node: ESTree.CallExpression | ESTree.NewExpression,
  allowHooks: boolean,
  allowArrayCallbacks: boolean,
): void {
  const callee = node.callee;
  const allowCallbackHere =
    callee.type === 'V8IntrinsicExpression'
      ? false
      : isAllowedCallbackCallee(callee, allowHooks, allowArrayCallbacks);

  for (const arg of node.arguments) {
    if (arg.type === 'SpreadElement') {
      if (isInlineLiteral(arg.argument)) {
        reportInlineLiteral(context, arg);
      }
      continue;
    }
    if (!isInlineLiteral(arg)) {
      continue;
    }
    if (allowCallbackHere && isFunctionLiteral(arg)) {
      continue;
    }
    reportInlineLiteral(context, arg);
  }
}

function isJsxKeyAttribute(node: ESTree.JSXAttribute): boolean {
  // Widened: the declared `name` type is a union that does not overlap with
  // "Identifier", but the runtime is what decides. See KNOWN_ISSUE below.
  const name = node.name as { type: string; name?: string };
  return name.type === 'Identifier' && name.name === 'key';
}

function checkJsxAttribute(context: RuleContext, node: ESTree.JSXAttribute): void {
  const { value } = node;
  if (!value || value.type !== 'JSXExpressionContainer') {
    return;
  }
  if (isJsxKeyAttribute(node)) {
    return;
  }
  const { expression } = value;
  if (expression.type !== 'JSXEmptyExpression' && isInlineLiteral(expression)) {
    reportInlineLiteral(context, expression);
  }
}

interface RuleOptions {
  allowArrayCallbacks?: boolean;
  allowHooks?: boolean;
}

const rule: CreateOnceRule = {
  createOnce(context) {
    // oxlint calls `createOnce` during plugin registration with a null context,
    // so this stays defensive even though the declared type is non-nullable.
    const rawOptions = context.options as unknown[] | null;
    const options = (rawOptions?.[0] ?? {}) as RuleOptions;
    const allowHooks = options.allowHooks !== false;
    const allowArrayCallbacks = options.allowArrayCallbacks !== false;

    return {
      CallExpression(node: ESTree.CallExpression) {
        checkCallArguments(context, node, allowHooks, allowArrayCallbacks);
      },
      JSXAttribute(node: ESTree.JSXAttribute) {
        checkJsxAttribute(context, node);
      },
      NewExpression(node: ESTree.NewExpression) {
        checkCallArguments(context, node, false, false);
      },
    };
  },
  meta: {
    messages: {
      noInline:
        "Declare functions, objects, and arrays before use. Don't pass " +
        'them inline as JSX props or callback arguments.',
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          allowArrayCallbacks: { default: true, type: 'boolean' },
          allowHooks: { default: true, type: 'boolean' },
        },
        type: 'object',
      },
    ],
  },
};

export default rule;
