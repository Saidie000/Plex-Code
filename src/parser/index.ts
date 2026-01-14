export { tokenize, Tokenizer } from './lexer/tokenizer.js';
export { TokenType, Token, Position, createToken } from './lexer/token-types.js';

export { parse, Parser } from './parser/parser.js';
export {
  NodeType,
  ASTNode,
  FileNode,
  StatementNode,
  ParameterNode,
  ReferenceNode,
  ListNode,
  IdentifierNode,
  StringNode,
  NumberNode,
  ShellCallNode,
  createFileNode,
  createStatementNode,
  createParameterNode,
  createReferenceNode,
  createListNode,
  createIdentifierNode,
  createStringNode,
  createNumberNode,
  createShellCallNode,
} from './parser/ast-nodes.js';

export {
  ParserError,
  createParserError,
  createUnknownCommandError,
  createMissingParameterError,
  createInvalidSyntaxError,
  createUnresolvedReferenceError,
} from './errors/error-handler.js';

export {
  Diagnostic,
  DiagnosticSeverity,
  createDiagnostic,
  formatDiagnostic,
  formatDiagnostics,
} from './errors/diagnostics.js';

export {
  Intent,
  IntentCategory,
  Backend,
  IntentBackend,
  BUILTIN_INTENTS,
} from './resolver/builtins.js';

export {
  Resolver,
  ResolvedIntent,
  ResolutionContext,
  createResolver,
  resolveIntent,
} from './resolver/resolver.js';

import { tokenize } from './lexer/tokenizer.js';
import { parse } from './parser/parser.js';
import { createResolver } from './resolver/resolver.js';

export function parseSource(source: string) {
  const tokens = tokenize(source);
  const { ast, errors } = parse(tokens);
  return { tokens, ast, errors };
}

export function parseAndResolve(source: string, backend: 'html' | 'python' | 'shell' | 'ncom' = 'shell') {
  const { tokens, ast, errors } = parseSource(source);
  
  if (!ast || errors.length > 0) {
    return { tokens, ast, errors, intents: [] };
  }

  const resolver = createResolver({ backend });
  const intents = resolver.resolveAll(ast.statements);

  return { tokens, ast, errors, intents };
}
