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
  const report = { messageId: 'noInline', node };
  context.report(report);
}

/**
 * Whether a call's callee earns the callback exemption.
 *
 * Evaluated per call site rather than inherited from the enclosing call: when
 * an argument is itself a call, the exemptions belong to *that* callee. So
 * `new Map(entries.map(toId))` checks `toId` against `.map`, not against the
 * constructor.
 */
function allowsCallbackHere(
  callee: ESTree.Expression,
  allowHooks: boolean,
  allowArrayCallbacks: boolean,
): boolean {
  if (callee.type === 'V8IntrinsicExpression') {
    return false;
  }
  return isAllowedCallbackCallee(callee, allowHooks, allowArrayCallbacks);
}

function checkCallArguments(
  context: RuleContext,
  node: ESTree.CallExpression | ESTree.NewExpression,
  allowCallbackHere: boolean,
  allowHooks: boolean,
  allowArrayCallbacks: boolean,
  consumed: Set<Node>,
): void {
  for (const arg of node.arguments) {
    if (arg.type === 'SpreadElement') {
      if (isInlineLiteral(arg.argument)) {
        reportInlineLiteral(context, arg);
      }
      continue;
    }

    // Descend: a literal buried inside a nested call is still inline. The
    // nested node is marked so the visitor does not check it again when
    // traversal reaches it, which would report the same literal twice.
    if (arg.type === 'CallExpression' || arg.type === 'NewExpression') {
      if (consumed.has(arg)) {
        continue;
      }
      consumed.add(arg);
      checkCallArguments(
        context,
        arg,
        allowsCallbackHere(arg.callee, allowHooks, allowArrayCallbacks),
        allowHooks,
        allowArrayCallbacks,
        consumed,
      );
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

    // Nested calls are checked by the outermost call that contains them. The
    // visitor still fires for them, so this set is what stops a second report.
    const consumed = new Set<Node>();

    return {
      CallExpression(node: ESTree.CallExpression) {
        if (consumed.has(node)) {
          return;
        }
        checkCallArguments(
          context,
          node,
          allowsCallbackHere(node.callee, allowHooks, allowArrayCallbacks),
          allowHooks,
          allowArrayCallbacks,
          consumed,
        );
      },
      JSXAttribute(node: ESTree.JSXAttribute) {
        checkJsxAttribute(context, node);
      },
      NewExpression(node: ESTree.NewExpression) {
        if (consumed.has(node)) {
          return;
        }
        // A constructor gets no callback exemption of its own.
        checkCallArguments(context, node, false, allowHooks, allowArrayCallbacks, consumed);
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
