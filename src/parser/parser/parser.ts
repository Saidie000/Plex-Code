import { Token, TokenType } from '../lexer/token-types.js';
import {
  FileNode,
  StatementNode,
  ParameterNode,
  ReferenceNode,
  ListNode,
  createFileNode,
  createStatementNode,
  createParameterNode,
  createReferenceNode,
  createListNode,
} from './ast-nodes.js';
import { ParserError } from '../errors/error-handler.js';

export class Parser {
  private tokens: Token[];
  private current: number;
  private errors: ParserError[];

  constructor(tokens: Token[]) {
    this.tokens = tokens.filter(t => t.type !== TokenType.WHITESPACE);
    this.current = 0;
    this.errors = [];
  }

  parse(): { ast: FileNode | null; errors: ParserError[] } {
    try {
      const statements = this.parseStatements();
      const ast = createFileNode(this.tokens[0]?.position || { line: 1, column: 1, index: 0 }, statements);
      return { ast, errors: this.errors };
    } catch (error) {
      if (error instanceof ParserError) {
        this.errors.push(error);
      }
      return { ast: null, errors: this.errors };
    }
  }

  private parseStatements(indentLevel: number = 0): StatementNode[] {
    const statements: StatementNode[] = [];

    while (!this.isAtEnd()) {
      this.skipNewlines();
      if (this.isAtEnd()) break;

      const currentIndent = this.getIndentLevel();
      
      if (currentIndent < indentLevel) {
        break;
      }

      if (currentIndent > indentLevel) {
        break;
      }

      const stmt = this.parseStatement(indentLevel);
      if (stmt) {
        statements.push(stmt);
      }
    }

    return statements;
  }

  private parseStatement(indentLevel: number): StatementNode | null {
    if (this.check(TokenType.TREE_DOWN)) {
      this.advance();
      this.skipWhitespaceAndNewlines();
      const newIndentLevel = indentLevel + 1;
      return this.parseStatement(newIndentLevel);
    }

    if (this.isCommand(this.peek().type)) {
      return this.parseCommandStatement(indentLevel);
    }

    if (this.check(TokenType.SHELL_BRIDGE) || this.check(TokenType.SHELL_COMMENT) || this.check(TokenType.SHELL_DOUBLE_COMMENT)) {
      return this.parseShellStatement(indentLevel);
    }

    if (this.check(TokenType.PLX_EXT)) {
      this.advance();
      this.skipNewlines();
      return null;
    }

    if (this.check(TokenType.IDENTIFIER) || this.check(TokenType.STRING)) {
      this.advance();
      return null;
    }

    this.advance();
    return null;
  }

  private parseCommandStatement(indentLevel: number): StatementNode {
    const commandToken = this.advance();
    const command = commandToken.value;
    const parameters: ParameterNode[] = [];
    let shellBridge: string | undefined;

    while (!this.isAtEnd() && !this.check(TokenType.NEWLINE) && !this.check(TokenType.TREE_DOWN)) {
      if (this.check(TokenType.PIPE)) {
        this.advance();
        continue;
      }

      if (this.check(TokenType.SHELL_BRIDGE) || this.check(TokenType.SHELL_COMMENT) || this.check(TokenType.SHELL_DOUBLE_COMMENT)) {
        shellBridge = this.parseShellBridge();
        break;
      }

      const param = this.parseParameter();
      if (param) {
        parameters.push(param);
      }
    }

    this.skipNewlines();

    const children: StatementNode[] = [];
    if (this.check(TokenType.TREE_DOWN)) {
      this.advance();
      this.skipWhitespaceAndNewlines();
      const childStmt = this.parseStatement(indentLevel + 1);
      if (childStmt) {
        children.push(childStmt);
      }

      while (!this.isAtEnd()) {
        this.skipNewlines();
        if (!this.check(TokenType.TREE_DOWN)) break;
        
        this.advance();
        this.skipWhitespaceAndNewlines();
        const nextChild = this.parseStatement(indentLevel + 1);
        if (nextChild) {
          children.push(nextChild);
        }
      }
    }

    return createStatementNode(commandToken.position, command, parameters, children, shellBridge, indentLevel);
  }

  private parseShellStatement(indentLevel: number): StatementNode {
    const start = this.peek();
    this.advance();
    let shellCommand = '';

    while (!this.isAtEnd() && !this.check(TokenType.NEWLINE)) {
      shellCommand += this.advance().value + ' ';
    }

    this.skipNewlines();

    return createStatementNode(
      start.position,
      'shell~',
      [],
      [],
      shellCommand.trim(),
      indentLevel
    );
  }

  private parseParameter(): ParameterNode | null {
    const start = this.peek();

    if (this.check(TokenType.BRACKET_OPEN)) {
      return this.parseListParameter();
    }

    if (this.check(TokenType.AT)) {
      return this.parseReferenceParameter();
    }

    if (this.check(TokenType.IDENTIFIER)) {
      const id = this.advance();
      
      if (this.check(TokenType.COLON)) {
        this.advance();
        const value = this.parseParameterValue();
        return createParameterNode(start.position, value, id.value);
      }

      return createParameterNode(start.position, id.value);
    }

    if (this.check(TokenType.STRING)) {
      const str = this.advance();
      return createParameterNode(start.position, str.value);
    }

    if (this.check(TokenType.NUMBER)) {
      const num = this.advance();
      return createParameterNode(start.position, parseFloat(num.value));
    }

    if (this.isKeywordToken(this.peek().type)) {
      const keyword = this.advance();
      return createParameterNode(start.position, keyword.value);
    }

    return null;
  }

  private parseListParameter(): ParameterNode {
    const start = this.advance();
    const items: (string | number | ReferenceNode)[] = [];

    while (!this.isAtEnd() && !this.check(TokenType.BRACKET_CLOSE)) {
      if (this.check(TokenType.COMMA)) {
        this.advance();
        continue;
      }

      const value = this.parseParameterValue();
      if (typeof value === 'string' || typeof value === 'number') {
        items.push(value);
      } else if (typeof value === 'object' && 'path' in value) {
        items.push(value);
      }
    }

    if (this.check(TokenType.BRACKET_CLOSE)) {
      this.advance();
    }

    const list = createListNode(start.position, items);
    return createParameterNode(start.position, list);
  }

  private parseReferenceParameter(): ParameterNode {
    const start = this.advance();
    let path = '@';

    while (!this.isAtEnd() && !this.check(TokenType.NEWLINE) && !this.check(TokenType.PIPE) && !this.check(TokenType.BRACKET_CLOSE)) {
      if (this.check(TokenType.DOT) || this.check(TokenType.IDENTIFIER) || this.isKeywordToken(this.peek().type)) {
        path += this.advance().value;
      } else {
        break;
      }
    }

    const ref = createReferenceNode(start.position, path);
    return createParameterNode(start.position, ref);
  }

  private parseParameterValue(): string | number | ReferenceNode | ListNode {
    if (this.check(TokenType.BRACKET_OPEN)) {
      const param = this.parseListParameter();
      return param.value as ListNode;
    }

    if (this.check(TokenType.AT)) {
      const param = this.parseReferenceParameter();
      return param.value as ReferenceNode;
    }

    if (this.check(TokenType.STRING)) {
      return this.advance().value;
    }

    if (this.check(TokenType.NUMBER)) {
      return parseFloat(this.advance().value);
    }

    if (this.check(TokenType.IDENTIFIER) || this.isKeywordToken(this.peek().type)) {
      return this.advance().value;
    }

    return '';
  }

  private parseShellBridge(): string {
    let bridge = '';
    
    while (!this.isAtEnd() && !this.check(TokenType.NEWLINE)) {
      bridge += this.advance().value + ' ';
    }

    return bridge.trim();
  }

  private isCommand(type: TokenType): boolean {
    const commands = [
      TokenType.CALL, TokenType.CALL_BANG,
      TokenType.BUILD, TokenType.BUILD_BANG,
      TokenType.CHECK, TokenType.IMPORT, TokenType.IMPORT_BANG,
      TokenType.STORE, TokenType.STORE_CAP,
      TokenType.MANIFEST, TokenType.SHOW, TokenType.SHOW_CAP,
      TokenType.PANEL, TokenType.PANEL_BANG,
      TokenType.SIMCORE, TokenType.TAG, TokenType.SIGNATURE,
      TokenType.ASK, TokenType.ASK_BANG,
      TokenType.ACCESS, TokenType.ACCESS_BANG,
      TokenType.SNIFF, TokenType.SNIFF_LOWER, TokenType.SNIFF_BANG,
      TokenType.DETECT, TokenType.DETECT_BANG,
      TokenType.FETCH, TokenType.FETCH_LOWER,
      TokenType.START, TokenType.ARGU, TokenType.ARGUR,
      TokenType.PAIR, TokenType.DEVICE, TokenType.DEVICE_BANG,
      TokenType.NCOM, TokenType.NCOM_BANG,
      TokenType.CORE, TokenType.CORE_BANG,
      TokenType.UWB, TokenType.UWB_BANG,
      TokenType.SEND, TokenType.SEND_BANG,
      TokenType.GET, TokenType.GET_CAP,
      TokenType.SENSE, TokenType.FEED, TokenType.SOURCE,
      TokenType.CONTROLS, TokenType.PERMISSIONS, TokenType.LOG,
      TokenType.INJECT, TokenType.OVERRIDE, TokenType.PERSIST, TokenType.SCOPE,
      TokenType.FORCE, TokenType.SIM, TokenType.SPOOF,
      TokenType.PANELS, TokenType.GRID, TokenType.ROWS, TokenType.COLUMNS,
      TokenType.TOTAL, TokenType.RESIZE, TokenType.DRAG, TokenType.LOCK,
      TokenType.ID, TokenType.TEXT,
    ];
    return commands.includes(type);
  }

  private isKeywordToken(type: TokenType): boolean {
    return type !== TokenType.IDENTIFIER &&
           type !== TokenType.STRING &&
           type !== TokenType.NUMBER &&
           type !== TokenType.EOF &&
           type !== TokenType.NEWLINE &&
           type !== TokenType.UNKNOWN &&
           type !== TokenType.WHITESPACE &&
           type !== TokenType.PIPE &&
           type !== TokenType.TREE_DOWN &&
           type !== TokenType.BRACKET_OPEN &&
           type !== TokenType.BRACKET_CLOSE &&
           type !== TokenType.PAREN_OPEN &&
           type !== TokenType.PAREN_CLOSE &&
           type !== TokenType.BRACE_OPEN &&
           type !== TokenType.BRACE_CLOSE &&
           type !== TokenType.ANGLE_OPEN &&
           type !== TokenType.ANGLE_CLOSE &&
           type !== TokenType.COLON &&
           type !== TokenType.EQUALS &&
           type !== TokenType.DOT &&
           type !== TokenType.COMMA &&
           type !== TokenType.TILDE &&
           type !== TokenType.BANG &&
           type !== TokenType.DOLLAR &&
           type !== TokenType.AT &&
           type !== TokenType.SLASH;
  }

  private getIndentLevel(): number {
    let level = 0;
    let i = this.current;
    
    while (i > 0 && this.tokens[i - 1].type === TokenType.NEWLINE) {
      i--;
      break;
    }

    while (i < this.tokens.length && this.tokens[i].type === TokenType.TREE_DOWN) {
      level++;
      i++;
    }

    return level;
  }

  private skipNewlines(): void {
    while (this.check(TokenType.NEWLINE)) {
      this.advance();
    }
  }

  private skipWhitespaceAndNewlines(): void {
    while (this.check(TokenType.NEWLINE) || this.check(TokenType.WHITESPACE)) {
      this.advance();
    }
  }

  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  private peek(): Token {
    return this.tokens[this.current];
  }

  private previous(): Token {
    return this.tokens[this.current - 1];
  }

  private isAtEnd(): boolean {
    return this.current >= this.tokens.length || this.peek().type === TokenType.EOF;
  }
}

export function parse(tokens: Token[]): { ast: FileNode | null; errors: ParserError[] } {
  const parser = new Parser(tokens);
  return parser.parse();
}
