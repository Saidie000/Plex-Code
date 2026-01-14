import { Position } from '../lexer/token-types.js';

export enum NodeType {
  FILE = 'FILE',
  STATEMENT = 'STATEMENT',
  COMMAND = 'COMMAND',
  INTENT = 'INTENT',
  PARAMETER = 'PARAMETER',
  BLOCK = 'BLOCK',
  CONDITION = 'CONDITION',
  SHELL_CALL = 'SHELL_CALL',
  REFERENCE = 'REFERENCE',
  IDENTIFIER = 'IDENTIFIER',
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  LIST = 'LIST',
  ATTRIBUTE_REF = 'ATTRIBUTE_REF',
}

export interface ASTNode {
  type: NodeType;
  position: Position;
  children?: ASTNode[];
  value?: string | number | boolean | any;
}

export interface FileNode extends ASTNode {
  type: NodeType.FILE;
  statements: StatementNode[];
}

export interface StatementNode extends ASTNode {
  type: NodeType.STATEMENT;
  command: string;
  parameters: ParameterNode[];
  children: StatementNode[];
  shellBridge?: string;
  indentLevel?: number;
}

export interface ParameterNode extends ASTNode {
  type: NodeType.PARAMETER;
  key?: string;
  value: string | ReferenceNode | ListNode | number;
}

export interface ReferenceNode extends ASTNode {
  type: NodeType.REFERENCE;
  path: string;
}

export interface ListNode extends ASTNode {
  type: NodeType.LIST;
  items: (string | number | ReferenceNode)[];
}

export interface IdentifierNode extends ASTNode {
  type: NodeType.IDENTIFIER;
  name: string;
}

export interface StringNode extends ASTNode {
  type: NodeType.STRING;
  value: string;
}

export interface NumberNode extends ASTNode {
  type: NodeType.NUMBER;
  value: number;
}

export interface ShellCallNode extends ASTNode {
  type: NodeType.SHELL_CALL;
  command: string;
  raw: string;
}

export function createFileNode(position: Position, statements: StatementNode[]): FileNode {
  return {
    type: NodeType.FILE,
    position,
    statements,
    children: statements
  };
}

export function createStatementNode(
  position: Position,
  command: string,
  parameters: ParameterNode[],
  children: StatementNode[] = [],
  shellBridge?: string,
  indentLevel?: number
): StatementNode {
  return {
    type: NodeType.STATEMENT,
    position,
    command,
    parameters,
    children,
    shellBridge,
    indentLevel
  };
}

export function createParameterNode(
  position: Position,
  value: string | ReferenceNode | ListNode | number,
  key?: string
): ParameterNode {
  return {
    type: NodeType.PARAMETER,
    position,
    key,
    value
  };
}

export function createReferenceNode(position: Position, path: string): ReferenceNode {
  return {
    type: NodeType.REFERENCE,
    position,
    path,
    value: path
  };
}

export function createListNode(position: Position, items: (string | number | ReferenceNode)[]): ListNode {
  return {
    type: NodeType.LIST,
    position,
    items,
    value: items.map(i => typeof i === 'object' ? i.path : i).join(', ')
  };
}

export function createIdentifierNode(position: Position, name: string): IdentifierNode {
  return {
    type: NodeType.IDENTIFIER,
    position,
    name,
    value: name
  };
}

export function createStringNode(position: Position, value: string): StringNode {
  return {
    type: NodeType.STRING,
    position,
    value
  };
}

export function createNumberNode(position: Position, value: number): NumberNode {
  return {
    type: NodeType.NUMBER,
    position,
    value
  };
}

export function createShellCallNode(position: Position, command: string, raw: string): ShellCallNode {
  return {
    type: NodeType.SHELL_CALL,
    position,
    command,
    raw,
    value: command
  };
}
