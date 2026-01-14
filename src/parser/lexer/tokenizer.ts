import { TokenType, Token, Position, createToken } from './token-types.js';

export class Tokenizer {
  private source: string;
  private position: number;
  private line: number;
  private column: number;
  private tokens: Token[];

  constructor(source: string) {
    this.source = source;
    this.position = 0;
    this.line = 1;
    this.column = 1;
    this.tokens = [];
  }

  tokenize(): Token[] {
    while (!this.isAtEnd()) {
      this.scanToken();
    }

    this.tokens.push(this.makeToken(TokenType.EOF, ''));
    return this.tokens;
  }

  private scanToken(): void {
    const start = this.getCurrentPosition();
    const char = this.advance();

    switch (char) {
      case ' ':
      case '\t':
      case '\r':
        break;
      
      case '\n':
        this.addToken(TokenType.NEWLINE, char, start);
        this.line++;
        this.column = 1;
        break;

      case '|':
        if (this.match('|') && this.match('|')) {
          this.addToken(TokenType.TRIPLE_PIPE, '|||', start);
        } else if (this.peek() === '!' && this.peekNext() === '!' && this.peekAhead(2) === '|') {
          this.advance();
          this.advance();
          this.advance();
          this.addToken(TokenType.EXCLAIM_PIPE, '|!!|', start);
        } else {
          this.addToken(TokenType.PIPE, char, start);
        }
        break;

      case '[':
        this.addToken(TokenType.BRACKET_OPEN, char, start);
        break;

      case ']':
        this.addToken(TokenType.BRACKET_CLOSE, char, start);
        break;

      case '(':
        this.addToken(TokenType.PAREN_OPEN, char, start);
        break;

      case ')':
        this.addToken(TokenType.PAREN_CLOSE, char, start);
        break;

      case '{':
        this.addToken(TokenType.BRACE_OPEN, char, start);
        break;

      case '}':
        this.addToken(TokenType.BRACE_CLOSE, char, start);
        break;

      case '<':
        this.addToken(TokenType.ANGLE_OPEN, char, start);
        break;

      case '>':
        this.addToken(TokenType.ANGLE_CLOSE, char, start);
        break;

      case ':':
        this.addToken(TokenType.COLON, char, start);
        break;

      case '=':
        this.addToken(TokenType.EQUALS, char, start);
        break;

      case ',':
        this.addToken(TokenType.COMMA, char, start);
        break;

      case '$':
        this.addToken(TokenType.DOLLAR, char, start);
        break;

      case '@':
        this.addToken(TokenType.AT, char, start);
        break;

      case '.':
        if (this.match('p') && this.match('l') && this.match('x')) {
          this.addToken(TokenType.PLX_EXT, '.plx', start);
        } else if (this.match('m') && this.match('f')) {
          if (this.peek() === '~') {
            this.advance();
            this.addToken(TokenType.MANIFEST, '.mf~', start);
          } else {
            this.addToken(TokenType.DOT, '.', start);
            this.addToken(TokenType.IDENTIFIER, 'mf', this.getCurrentPosition());
          }
        } else {
          this.addToken(TokenType.DOT, char, start);
        }
        break;

      case '/':
        if (this.match('/')) {
          if (this.match('/')) {
            this.addToken(TokenType.SHELL_COMMENT, '///', start);
          } else {
            this.addToken(TokenType.SHELL_DOUBLE_COMMENT, '//', start);
          }
          while (this.peek() !== '\n' && !this.isAtEnd()) {
            this.advance();
          }
        } else {
          this.addToken(TokenType.SLASH, char, start);
        }
        break;

      case '~':
        if (this.match('!') && this.match('!')) {
          this.addToken(TokenType.SHELL_BRIDGE, '~!!', start);
        } else {
          this.addToken(TokenType.TILDE, char, start);
        }
        break;

      case '!':
        this.addToken(TokenType.BANG, char, start);
        break;

      case '╰':
        if (this.match('─') && this.match('─') && this.match('➤')) {
          this.addToken(TokenType.TREE_DOWN, '╰──➤', start);
        } else {
          this.addToken(TokenType.UNKNOWN, char, start);
        }
        break;

      case '"':
      case "'":
        this.scanString(char, start);
        break;

      default:
        if (this.isDigit(char)) {
          this.scanNumber(start);
        } else if (this.isAlpha(char)) {
          this.scanIdentifierOrKeyword(start);
        } else {
          this.addToken(TokenType.UNKNOWN, char, start);
        }
        break;
    }
  }

  private scanString(quote: string, start: Position): void {
    let value = '';
    
    while (this.peek() !== quote && !this.isAtEnd()) {
      if (this.peek() === '\n') {
        this.line++;
        this.column = 0;
      }
      value += this.advance();
    }

    if (this.isAtEnd()) {
      this.addToken(TokenType.UNKNOWN, value, start);
      return;
    }

    this.advance();
    this.addToken(TokenType.STRING, value, start);
  }

  private scanNumber(start: Position): void {
    this.position--;
    this.column--;
    
    let value = '';
    while (this.isDigit(this.peek()) || this.peek() === '.') {
      value += this.advance();
    }

    this.addToken(TokenType.NUMBER, value, start);
  }

  private scanIdentifierOrKeyword(start: Position): void {
    this.position--;
    this.column--;
    
    let value = '';
    while (this.isAlphaNumeric(this.peek()) || this.peek() === '_' || this.peek() === '-' || this.peek() === '~' || this.peek() === '!' || this.peek() === '$') {
      value += this.advance();
    }

    const tokenType = this.getKeywordType(value);
    this.addToken(tokenType, value, start);
  }

  private getKeywordType(value: string): TokenType {
    const keywordMap: Record<string, TokenType> = {
      'call~': TokenType.CALL,
      'call~!!': TokenType.CALL_BANG,
      'build~': TokenType.BUILD,
      'Build~!!': TokenType.BUILD_BANG,
      'check~': TokenType.CHECK,
      'import~': TokenType.IMPORT,
      'import~!!': TokenType.IMPORT_BANG,
      'store~': TokenType.STORE,
      'Store~': TokenType.STORE_CAP,
      '.mf~': TokenType.MANIFEST,
      'show~': TokenType.SHOW,
      'Show~': TokenType.SHOW_CAP,
      'Panel~': TokenType.PANEL,
      'Panel~!!': TokenType.PANEL_BANG,
      'SimCore~!!': TokenType.SIMCORE,
      'TAG~': TokenType.TAG,
      'Signiture~!!': TokenType.SIGNATURE,
      'ASK~': TokenType.ASK,
      'ASK~!!': TokenType.ASK_BANG,
      'ACCESS~': TokenType.ACCESS,
      'ACCESS~!!': TokenType.ACCESS_BANG,
      'Sniff~': TokenType.SNIFF,
      'sniff~': TokenType.SNIFF_LOWER,
      'sniff!~!!': TokenType.SNIFF_BANG,
      'detect~': TokenType.DETECT,
      'detect~!!': TokenType.DETECT_BANG,
      'Fetch~!!': TokenType.FETCH,
      'Fetch~': TokenType.FETCH_LOWER,
      'Start~': TokenType.START,
      'Argu~!!': TokenType.ARGU,
      'Argur~!!': TokenType.ARGUR,
      'Pair~': TokenType.PAIR,
      'Device~': TokenType.DEVICE,
      'Device~!!': TokenType.DEVICE_BANG,
      'NCOM~': TokenType.NCOM,
      'NCOM~!!': TokenType.NCOM_BANG,
      'core~': TokenType.CORE,
      'CORE~!!': TokenType.CORE_BANG,
      'UWB~': TokenType.UWB,
      'UWB~!!': TokenType.UWB_BANG,
      'SEND~': TokenType.SEND,
      'SEND~!!': TokenType.SEND_BANG,
      'get~': TokenType.GET,
      'Get~': TokenType.GET_CAP,
      'Sense~!!': TokenType.SENSE,
      'Feed~': TokenType.FEED,
      'Source~': TokenType.SOURCE,
      'Controls~': TokenType.CONTROLS,
      'Permissions~': TokenType.PERMISSIONS,
      'Log~': TokenType.LOG,
      'Inject~': TokenType.INJECT,
      'Override~': TokenType.OVERRIDE,
      'Persist~': TokenType.PERSIST,
      'Scope~': TokenType.SCOPE,
      'Force~': TokenType.FORCE,
      'FORCED!!': TokenType.FORCED,
      'Sim~': TokenType.SIM,
      'Spoof~': TokenType.SPOOF,
      'Panels~': TokenType.PANELS,
      'Grid~': TokenType.GRID,
      'Rows~': TokenType.ROWS,
      'Columns~': TokenType.COLUMNS,
      'Total~': TokenType.TOTAL,
      'Resize~': TokenType.RESIZE,
      'Drag~': TokenType.DRAG,
      'Lock~': TokenType.LOCK,
      'ID~': TokenType.ID,
      'text~': TokenType.TEXT,
      'text': TokenType.TEXT_LOWER,
      'Color': TokenType.COLOR,
      'Scan': TokenType.SCAN,
      'USER': TokenType.USER,
      'user': TokenType.USER_LOWER,
      'account~': TokenType.ACCOUNT,
      'account~!!': TokenType.ACCOUNT_BANG,
      'Auth~': TokenType.AUTH,
      'Auth~!!': TokenType.AUTH_BANG,
      'Link_$': TokenType.LINK,
      'APP': TokenType.APP,
      'OS': TokenType.OS,
      'DEV': TokenType.DEV,
      'DEV_ONLY~!!': TokenType.DEV_ONLY,
      'DEV~!!': TokenType.DEV_BANG,
      'sensor': TokenType.SENSOR,
      'sensors': TokenType.SENSORS,
      'sensors~!!': TokenType.SENSORS_BANG,
      'channels~': TokenType.CHANNELS,
      'targets': TokenType.TARGETS,
      'LIVE': TokenType.LIVE,
      'ALWAYS': TokenType.ALWAYS,
      'Dynamic': TokenType.DYNAMIC,
      'ALL': TokenType.ALL,
      'data': TokenType.DATA,
      'value': TokenType.VALUE,
      'stream': TokenType.STREAM,
      'target': TokenType.TARGET,
      'session': TokenType.SESSION,
      'firmware': TokenType.FIRMWARE,
    };

    return keywordMap[value] || TokenType.IDENTIFIER;
  }

  private advance(): string {
    const char = this.source[this.position];
    this.position++;
    this.column++;
    return char;
  }

  private match(expected: string): boolean {
    if (this.isAtEnd()) return false;
    if (this.source[this.position] !== expected) return false;
    this.position++;
    this.column++;
    return true;
  }

  private peek(): string {
    if (this.isAtEnd()) return '\0';
    return this.source[this.position];
  }

  private peekNext(): string {
    if (this.position + 1 >= this.source.length) return '\0';
    return this.source[this.position + 1];
  }

  private peekAhead(offset: number): string {
    if (this.position + offset >= this.source.length) return '\0';
    return this.source[this.position + offset];
  }

  private isAtEnd(): boolean {
    return this.position >= this.source.length;
  }

  private isDigit(char: string): boolean {
    return char >= '0' && char <= '9';
  }

  private isAlpha(char: string): boolean {
    return (char >= 'a' && char <= 'z') ||
           (char >= 'A' && char <= 'Z') ||
           char === '_';
  }

  private isAlphaNumeric(char: string): boolean {
    return this.isAlpha(char) || this.isDigit(char);
  }

  private getCurrentPosition(): Position {
    return {
      line: this.line,
      column: this.column,
      index: this.position
    };
  }

  private makeToken(type: TokenType, value: string): Token {
    return createToken(type, value, this.getCurrentPosition());
  }

  private addToken(type: TokenType, value: string, position: Position): void {
    this.tokens.push(createToken(type, value, position));
  }
}

export function tokenize(source: string): Token[] {
  const tokenizer = new Tokenizer(source);
  return tokenizer.tokenize();
}
