/** @type {readonly string[]} */
const REACT_HOOKS = [
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

/** @type {readonly string[]} */
const ARRAY_METHODS = [
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

/** @type {readonly string[]} */
const PROMISE_METHODS = ['then', 'catch', 'finally'];

/**
 * @param {any} expression
 * @returns {boolean}
 */
function isInlineLiteral(expression) {
  const { type } = expression;
  return (
    type === 'ArrowFunctionExpression' ||
    type === 'FunctionExpression' ||
    type === 'ObjectExpression' ||
    type === 'ArrayExpression'
  );
}

/**
 * @param {any} expression
 * @returns {boolean}
 */
function isFunctionLiteral(expression) {
  const { type } = expression;
  return type === 'ArrowFunctionExpression' || type === 'FunctionExpression';
}

/**
 * @param {string} name
 * @returns {boolean}
 */
function isAllowedHookName(name) {
  return REACT_HOOKS.includes(name);
}

/**
 * @param {string} name
 * @returns {boolean}
 */
function isAllowedArrayMethodName(name) {
  return ARRAY_METHODS.includes(name);
}

/**
 * @param {string} name
 * @returns {boolean}
 */
function isPromiseMethodName(name) {
  return PROMISE_METHODS.includes(name);
}

/**
 * @param {any} calleeNode
 * @param {boolean} allowHooks
 * @param {boolean} allowArrayCallbacks
 * @returns {boolean}
 */
function isAllowedIdentifierCallee(calleeNode, allowHooks, allowArrayCallbacks) {
  const { name } = calleeNode;
  if (allowHooks && isAllowedHookName(name)) {
    return true;
  }
  if (allowArrayCallbacks && isAllowedArrayMethodName(name)) {
    return true;
  }
  if (isPromiseMethodName(name)) {
    return true;
  }
  return false;
}

/**
 * @param {any} calleeNode
 * @param {boolean} allowArrayCallbacks
 * @returns {boolean}
 */
function isAllowedMemberCallee(calleeNode, allowArrayCallbacks) {
  const { property } = calleeNode;
  if (!property || property.type !== 'Identifier') {
    return false;
  }
  if (allowArrayCallbacks && isAllowedArrayMethodName(property.name)) {
    return true;
  }
  if (isPromiseMethodName(property.name)) {
    return true;
  }
  return false;
}

/**
 * @param {any} calleeNode
 * @param {boolean} allowHooks
 * @param {boolean} allowArrayCallbacks
 * @returns {boolean}
 */
function isAllowedCallbackCallee(calleeNode, allowHooks, allowArrayCallbacks) {
  if (!calleeNode) {
    return false;
  }
  if (calleeNode.type === 'Identifier') {
    return isAllowedIdentifierCallee(calleeNode, allowHooks, allowArrayCallbacks);
  }
  if (calleeNode.type === 'MemberExpression') {
    return isAllowedMemberCallee(calleeNode, allowArrayCallbacks);
  }
  return false;
}

/**
 * @param {any} context
 * @param {unknown} node
 */
function reportInlineLiteral(context, node) {
  const report = { messageId: 'noInline', node };
  context.report(report);
}

/**
 * @param {any} context
 * @param {any} node
 * @param {boolean} allowHooks
 * @param {boolean} allowArrayCallbacks
 */
function checkCallArguments(context, node, allowHooks, allowArrayCallbacks) {
  const allowCallbackHere = isAllowedCallbackCallee(node.callee, allowHooks, allowArrayCallbacks);
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

/**
 * @param {any} node
 * @returns {boolean}
 */
function isJsxKeyAttribute(node) {
  return node.name.type === 'Identifier' && node.name.name === 'key';
}

/**
 * @param {any} value
 * @returns {boolean}
 */
function isJsxExpressionContainer(value) {
  return Boolean(value) && value.type === 'JSXExpressionContainer';
}

/**
 * @param {any} context
 * @param {any} node
 */
function checkJsxAttribute(context, node) {
  const { value } = node;
  if (!isJsxExpressionContainer(value)) {
    return;
  }
  if (isJsxKeyAttribute(node)) {
    return;
  }
  const { expression } = value;
  if (expression && expression.type !== 'JSXEmptyExpression' && isInlineLiteral(expression)) {
    reportInlineLiteral(context, expression);
  }
}

/**
 * @typedef {{ allowHooks?: boolean, allowArrayCallbacks?: boolean }} RuleOptions
 */

export default {
  /**
   * @param {any} context
   */
  createOnce(context) {
    const options = (context.options && context.options[0]) || {};
    const allowHooks = options.allowHooks !== false;
    const allowArrayCallbacks = options.allowArrayCallbacks !== false;

    return {
      /**
       * @param {any} node
       */
      CallExpression(node) {
        checkCallArguments(context, node, allowHooks, allowArrayCallbacks);
      },
      /**
       * @param {any} node
       */
      JSXAttribute(node) {
        checkJsxAttribute(context, node);
      },
      /**
       * @param {any} node
       */
      NewExpression(node) {
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
