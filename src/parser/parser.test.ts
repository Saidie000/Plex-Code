import { describe, it, expect } from '@jest/globals';
import { tokenize } from './lexer/tokenizer.js';
import { parse } from './parser/parser.js';

describe('PlexCode Parser', () => {
  it('should parse simple command', () => {
    const code = 'call~ test';
    const tokens = tokenize(code);
    const { ast, errors } = parse(tokens);
    
    expect(errors.length).toBe(0);
    expect(ast).not.toBeNull();
    expect(ast?.statements.length).toBeGreaterThan(0);
  });

  it('should parse command with parameters', () => {
    const code = 'Sniff~ [ALL]';
    const tokens = tokenize(code);
    const { ast, errors } = parse(tokens);
    
    expect(errors.length).toBe(0);
    expect(ast).not.toBeNull();
    expect(ast?.statements[0].command).toBe('Sniff~');
    expect(ast?.statements[0].parameters.length).toBeGreaterThan(0);
  });

  it('should parse nested statements with tree markers', () => {
    const code = `Sniff~ ALL
╰──➤ detect~!! | sensors`;
    const tokens = tokenize(code);
    const { ast, errors } = parse(tokens);
    
    expect(errors.length).toBe(0);
    expect(ast).not.toBeNull();
    expect(ast?.statements.length).toBeGreaterThan(0);
  });

  it('should parse Panel~!! with nested configuration', () => {
    const code = `Panel~!!
╰──➤ ID~ "TestPanel"
╰──➤ Feed~ LIVE`;
    const tokens = tokenize(code);
    const { ast, errors } = parse(tokens);
    
    expect(errors.length).toBe(0);
    expect(ast).not.toBeNull();
    expect(ast?.statements[0].command).toBe('Panel~!!');
  });

  it('should parse Build~!! UI with grid', () => {
    const code = `Build~!! UI
╰──➤ Panels~
    ╰──➤ Grid~
        ╰──➤ Rows~ 3`;
    const tokens = tokenize(code);
    const { ast, errors } = parse(tokens);
    
    expect(errors.length).toBe(0);
    expect(ast).not.toBeNull();
  });

  it('should parse references', () => {
    const code = 'Store~ @.attributes';
    const tokens = tokenize(code);
    const { ast, errors } = parse(tokens);
    
    expect(errors.length).toBe(0);
    expect(ast).not.toBeNull();
    expect(ast?.statements[0].parameters.length).toBeGreaterThan(0);
  });

  it('should parse list parameters', () => {
    const code = 'Fetch~!! needed firmware [sensors]';
    const tokens = tokenize(code);
    const { ast, errors } = parse(tokens);
    
    expect(errors.length).toBe(0);
    expect(ast).not.toBeNull();
  });

  it('should parse shell bridge commands', () => {
    const code = '~!! send [call~ | UWB]';
    const tokens = tokenize(code);
    const { ast, errors } = parse(tokens);
    
    expect(errors.length).toBe(0);
    expect(ast).not.toBeNull();
  });

  it('should parse SimCore~!! with nested actions', () => {
    const code = `SimCore~!!
╰──➤ Inject~ sensor
╰──➤ Override~ firmware`;
    const tokens = tokenize(code);
    const { ast, errors } = parse(tokens);
    
    expect(errors.length).toBe(0);
    expect(ast).not.toBeNull();
    expect(ast?.statements[0].command).toBe('SimCore~!!');
  });

  it('should parse ASK~!! permission request', () => {
    const code = 'ASK~!! | SENSOR_ACCESS';
    const tokens = tokenize(code);
    const { ast, errors } = parse(tokens);
    
    expect(errors.length).toBe(0);
    expect(ast).not.toBeNull();
    expect(ast?.statements[0].command).toBe('ASK~!!');
  });

  it('should parse ACCESS~!! command', () => {
    const code = 'ACCESS~!! | DEVICE';
    const tokens = tokenize(code);
    const { ast, errors } = parse(tokens);
    
    expect(errors.length).toBe(0);
    expect(ast).not.toBeNull();
  });

  it('should parse multiple top-level statements', () => {
    const code = `call~ test
show~ data
Store~ @result`;
    const tokens = tokenize(code);
    const { ast, errors } = parse(tokens);
    
    expect(errors.length).toBe(0);
    expect(ast).not.toBeNull();
    expect(ast?.statements.length).toBeGreaterThanOrEqual(2);
  });

  it('should parse .plx header', () => {
    const code = `.plx

show~ hello`;
    const tokens = tokenize(code);
    const { ast, errors } = parse(tokens);
    
    expect(errors.length).toBe(0);
    expect(ast).not.toBeNull();
  });

  it('should parse Pair~ and Device~!!', () => {
    const code = 'Pair~ | Device~!!';
    const tokens = tokenize(code);
    const { ast, errors } = parse(tokens);
    
    expect(errors.length).toBe(0);
    expect(ast).not.toBeNull();
  });

  it('should parse SEND~!! command', () => {
    const code = 'SEND~!! | device | data';
    const tokens = tokenize(code);
    const { ast, errors } = parse(tokens);
    
    expect(errors.length).toBe(0);
    expect(ast).not.toBeNull();
  });

  it('should parse empty file', () => {
    const code = '';
    const tokens = tokenize(code);
    const { ast, errors } = parse(tokens);
    
    expect(errors.length).toBe(0);
    expect(ast).not.toBeNull();
    expect(ast?.statements.length).toBe(0);
  });

  it('should parse file with only comments', () => {
    const code = `/// This is a comment
// Another comment`;
    const tokens = tokenize(code);
    const { ast, errors } = parse(tokens);
    
    expect(errors.length).toBe(0);
    expect(ast).not.toBeNull();
  });
});
