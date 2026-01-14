import { describe, it, expect } from '@jest/globals';
import { tokenize } from './lexer/tokenizer.js';
import { TokenType } from './lexer/token-types.js';

describe('PlexCode Tokenizer', () => {
  it('should tokenize simple command', () => {
    const tokens = tokenize('call~ test');
    expect(tokens[0].type).toBe(TokenType.CALL);
    expect(tokens[1].type).toBe(TokenType.IDENTIFIER);
    expect(tokens[1].value).toBe('test');
  });

  it('should tokenize tree marker', () => {
    const tokens = tokenize('╰──➤');
    expect(tokens[0].type).toBe(TokenType.TREE_DOWN);
    expect(tokens[0].value).toBe('╰──➤');
  });

  it('should tokenize pipes', () => {
    const tokens = tokenize('| command');
    expect(tokens[0].type).toBe(TokenType.PIPE);
  });

  it('should tokenize triple pipes', () => {
    const tokens = tokenize('|||');
    expect(tokens[0].type).toBe(TokenType.TRIPLE_PIPE);
  });

  it('should tokenize shell bridge', () => {
    const tokens = tokenize('~!!');
    expect(tokens[0].type).toBe(TokenType.SHELL_BRIDGE);
  });

  it('should tokenize shell comments', () => {
    const tokens = tokenize('/// comment');
    expect(tokens[0].type).toBe(TokenType.SHELL_COMMENT);
  });

  it('should tokenize brackets', () => {
    const tokens = tokenize('[ALL]');
    expect(tokens[0].type).toBe(TokenType.BRACKET_OPEN);
    expect(tokens[1].type).toBe(TokenType.ALL);
    expect(tokens[2].type).toBe(TokenType.BRACKET_CLOSE);
  });

  it('should tokenize Sniff command', () => {
    const tokens = tokenize('Sniff~ [ALL] | SENSORS');
    expect(tokens[0].type).toBe(TokenType.SNIFF);
    expect(tokens[1].type).toBe(TokenType.BRACKET_OPEN);
    expect(tokens[2].type).toBe(TokenType.ALL);
    expect(tokens[3].type).toBe(TokenType.BRACKET_CLOSE);
    expect(tokens[4].type).toBe(TokenType.PIPE);
    expect([TokenType.SENSORS, TokenType.IDENTIFIER]).toContain(tokens[5].type);
  });

  it('should tokenize detect~!! command', () => {
    const tokens = tokenize('detect~!! | sensors');
    expect(tokens[0].type).toBe(TokenType.DETECT_BANG);
  });

  it('should tokenize strings', () => {
    const tokens = tokenize('"hello world"');
    expect(tokens[0].type).toBe(TokenType.STRING);
    expect(tokens[0].value).toBe('hello world');
  });

  it('should tokenize numbers', () => {
    const tokens = tokenize('123.45');
    expect(tokens[0].type).toBe(TokenType.NUMBER);
    expect(tokens[0].value).toBe('123.45');
  });

  it('should tokenize @ references', () => {
    const tokens = tokenize('@.attributes');
    expect(tokens[0].type).toBe(TokenType.AT);
    expect(tokens[1].type).toBe(TokenType.DOT);
    expect(tokens[2].type).toBe(TokenType.IDENTIFIER);
  });

  it('should tokenize Panel~!! command', () => {
    const tokens = tokenize('Panel~!!');
    expect(tokens[0].type).toBe(TokenType.PANEL_BANG);
  });

  it('should tokenize SimCore~!! command', () => {
    const tokens = tokenize('SimCore~!!');
    expect(tokens[0].type).toBe(TokenType.SIMCORE);
  });

  it('should tokenize ASK~!! command', () => {
    const tokens = tokenize('ASK~!!');
    expect(tokens[0].type).toBe(TokenType.ASK_BANG);
  });

  it('should tokenize ACCESS~!! command', () => {
    const tokens = tokenize('ACCESS~!!');
    expect(tokens[0].type).toBe(TokenType.ACCESS_BANG);
  });

  it('should tokenize Fetch~!! command', () => {
    const tokens = tokenize('Fetch~!!');
    expect(tokens[0].type).toBe(TokenType.FETCH);
  });

  it('should tokenize Store~ command', () => {
    const tokens = tokenize('Store~');
    expect(tokens[0].type).toBe(TokenType.STORE_CAP);
  });

  it('should tokenize Build~!! command', () => {
    const tokens = tokenize('Build~!!');
    expect(tokens[0].type).toBe(TokenType.BUILD_BANG);
  });

  it('should tokenize UI keywords', () => {
    const tokens = tokenize('Panels~ Grid~ Rows~ Columns~');
    expect(tokens[0].type).toBe(TokenType.PANELS);
    expect(tokens[1].type).toBe(TokenType.GRID);
    expect(tokens[2].type).toBe(TokenType.ROWS);
    expect(tokens[3].type).toBe(TokenType.COLUMNS);
  });

  it('should tokenize .plx extension', () => {
    const tokens = tokenize('.plx');
    expect(tokens[0].type).toBe(TokenType.PLX_EXT);
  });

  it('should handle newlines and track line numbers', () => {
    const tokens = tokenize('call~\nshow~');
    expect(tokens[0].type).toBe(TokenType.CALL);
    expect(tokens[1].type).toBe(TokenType.NEWLINE);
    expect(tokens[2].type).toBe(TokenType.SHOW);
    expect(tokens[2].position.line).toBe(2);
  });

  it('should tokenize complex nested structure', () => {
    const code = `Sniff~ [ALL]
╰──➤ detect~!! | sensors`;
    const tokens = tokenize(code);
    
    expect(tokens[0].type).toBe(TokenType.SNIFF);
    expect(tokens[1].type).toBe(TokenType.BRACKET_OPEN);
    expect(tokens[2].type).toBe(TokenType.ALL);
    expect(tokens[3].type).toBe(TokenType.BRACKET_CLOSE);
    expect(tokens[4].type).toBe(TokenType.NEWLINE);
    expect(tokens[5].type).toBe(TokenType.TREE_DOWN);
    expect(tokens[6].type).toBe(TokenType.DETECT_BANG);
    expect(tokens[7].type).toBe(TokenType.PIPE);
    expect(tokens[8].type).toBe(TokenType.SENSORS);
  });

  it('should end with EOF token', () => {
    const tokens = tokenize('call~');
    expect(tokens[tokens.length - 1].type).toBe(TokenType.EOF);
  });
});
