import type { CreateOnceRule, ESTree } from '@oxlint/plugins';

type Node = ESTree.Node;

function isPrimitiveType(node: ESTree.TSType): boolean {
  if (node.type === 'TSParenthesizedType') {
    return isPrimitiveType(node.typeAnnotation);
  }
  if (node.type === 'TSUnionType') {
    return node.types.every(isPrimitiveType);
  }
  return (
    node.type === 'TSStringKeyword' ||
    node.type === 'TSNumberKeyword' ||
    node.type === 'TSBooleanKeyword' ||
    node.type === 'TSBigIntKeyword' ||
    node.type === 'TSSymbolKeyword' ||
    node.type === 'TSNullKeyword' ||
    node.type === 'TSUndefinedKeyword' ||
    node.type === 'TSAnyKeyword' ||
    node.type === 'TSUnknownKeyword' ||
    node.type === 'TSNeverKeyword' ||
    node.type === 'TSLiteralType'
  );
}

function isInlineStructuralType(node: Node): boolean {
  if (
    node.type === 'TSTypeLiteral' ||
    node.type === 'TSFunctionType' ||
    node.type === 'TSConstructorType' ||
    node.type === 'TSTupleType'
  ) {
    return true;
  }
  if (node.type === 'TSArrayType') {
    return !isPrimitiveType(node.elementType);
  }
  return (
    node.type === 'TSTypeReference' &&
    node.typeName.type === 'Identifier' &&
    (node.typeName.name === 'Array' || node.typeName.name === 'ReadonlyArray') &&
    (node.typeArguments?.params.length !== 1 || !isPrimitiveType(node.typeArguments.params[0]!))
  );
}

function shouldReport(node: Node): boolean {
  let parent: Node | null = node.parent;

  while (parent) {
    if (parent.type === 'TSTypeAliasDeclaration') {
      return false;
    }
    if (isInlineStructuralType(parent)) {
      return false;
    }
    parent = parent.parent;
  }
  return true;
}

const rule: CreateOnceRule = {
  createOnce(context) {
    function check(node: Node): void {
      if (shouldReport(node)) {
        const report = { messageId: 'noInlineType', node };
        context.report(report);
      }
    }
    return {
      TSArrayType(node: ESTree.TSArrayType) {
        if (isInlineStructuralType(node)) {
          check(node);
        }
      },
      TSConstructorType: check,
      TSFunctionType: check,
      TSTupleType: check,
      TSTypeLiteral: check,
      TSTypeReference(node: ESTree.TSTypeReference) {
        if (isInlineStructuralType(node)) {
          check(node);
        }
      },
    };
  },
  meta: {
    messages: {
      noInlineType:
        'Give object, function, constructor, tuple and non-primitive array types ' +
        'a name with type or interface before using them.',
    },
  },
};

export default rule;
