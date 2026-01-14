import { describe, it, expect } from '@jest/globals';
import { parseAndResolve, parseSource } from './index.js';
import * as fs from 'fs';
import * as path from 'path';

describe('Integration Tests', () => {
  it('should parse and resolve complete PlexCode file', () => {
    const code = `
.plx

Sniff~ [ALL] | SENSORS
╰──➤ detect~!! | sensors
    ╰──➤ Fetch~!! needed firmware [sensors]
    ╰──➤ Store~ @.attributes

Panel~!!
╰──➤ ID~ "TestPanel"
╰──➤ Feed~ LIVE
`;

    const result = parseAndResolve(code, 'shell');
    
    expect(result.errors.length).toBe(0);
    expect(result.ast).not.toBeNull();
    expect(result.intents.length).toBeGreaterThan(0);
  });

  it('should handle sensor access example', () => {
    const code = `ASK~!! | SENSOR_ACCESS
╰──➤ ACCESS~!! | DEVICE

Sniff~ [ALL] | SENSORS
╰──➤ detect~!! | sensors`;

    const result = parseAndResolve(code, 'shell');
    
    expect(result.errors.length).toBe(0);
    expect(result.intents.length).toBeGreaterThanOrEqual(3);
    
    const intentNames = result.intents.map(i => i.intent.name);
    expect(intentNames).toContain('auth.ask');
    expect(intentNames).toContain('device.sniff');
  });

  it('should handle UI building example', () => {
    const code = `Build~!! UI
╰──➤ Panels~
    ╰──➤ Grid~
        ╰──➤ Rows~ 3
        ╰──➤ Columns~ 8`;

    const result = parseAndResolve(code, 'html');
    
    expect(result.errors.length).toBe(0);
    expect(result.ast).not.toBeNull();
  });

  it('should handle SimCore~!! example', () => {
    const code = `SimCore~!!
╰──➤ Inject~ sensor
╰──➤ Override~ firmware
╰──➤ Persist~ session`;

    const result = parseAndResolve(code, 'shell');
    
    expect(result.errors.length).toBe(0);
    expect(result.intents.length).toBeGreaterThan(0);
  });

  it('should parse tokens, AST, and resolve intents', () => {
    const code = 'call~ test';
    const result = parseAndResolve(code, 'shell');
    
    expect(result.tokens.length).toBeGreaterThan(0);
    expect(result.ast).not.toBeNull();
    expect(result.errors.length).toBe(0);
  });

  it('should handle empty file gracefully', () => {
    const result = parseAndResolve('', 'shell');
    
    expect(result.errors.length).toBe(0);
    expect(result.ast).not.toBeNull();
    expect(result.intents.length).toBe(0);
  });

  it('should parse example files if they exist', () => {
    const examplesDir = path.join(process.cwd(), 'src', 'parser', 'examples');
    
    if (fs.existsSync(examplesDir)) {
      const files = fs.readdirSync(examplesDir).filter((f: string) => f.endsWith('.plx'));
      
      for (const file of files) {
        const filePath = path.join(examplesDir, file);
        const code = fs.readFileSync(filePath, 'utf-8');
        
        const result = parseAndResolve(code, 'shell');
        expect(result.ast).not.toBeNull();
      }
    }
  });

  it('should handle complex nested structure', () => {
    const code = `Pair~ | Device~!!
╰──➤ Sniff~ device | ID~!!
    ╰──➤ sniff~
        ╰──➤ sensors~!! | UWB`;

    const result = parseAndResolve(code, 'shell');
    
    expect(result.errors.length).toBe(0);
    expect(result.ast).not.toBeNull();
  });

  it('should generate HTML output for UI commands', () => {
    const code = 'Panel~!! | ID~ "MyPanel"';
    const result = parseAndResolve(code, 'html');
    
    expect(result.intents.length).toBeGreaterThan(0);
    expect(result.intents[0].output).toContain('plexcode-panel');
  });

  it('should generate shell output for device commands', () => {
    const code = 'Sniff~ [ALL]';
    const result = parseAndResolve(code, 'shell');
    
    expect(result.intents.length).toBeGreaterThan(0);
    expect(result.intents[0].output).toContain('sniff');
  });

  it('should handle references in parameters', () => {
    const code = 'Store~ @.attributes';
    const result = parseAndResolve(code, 'shell');
    
    expect(result.errors.length).toBe(0);
    expect(result.intents.length).toBeGreaterThan(0);
  });

  it('should handle list parameters', () => {
    const code = 'Sniff~ [ALL]';
    const result = parseAndResolve(code, 'shell');
    
    expect(result.errors.length).toBe(0);
    expect(result.ast).not.toBeNull();
  });

  it('should provide tokens for syntax highlighting', () => {
    const code = 'call~ test | param';
    const { tokens } = parseSource(code);
    
    expect(tokens.length).toBeGreaterThan(0);
    expect(tokens.every(t => t.position)).toBe(true);
  });

  it('should parse permission flow', () => {
    const code = `ASK~!! | SENSOR_ACCESS
╰──➤ ACCESS~!! | DEVICE
    ╰──➤ Sniff~ [ALL]`;

    const result = parseAndResolve(code, 'shell');
    
    expect(result.errors.length).toBe(0);
    expect(result.intents.length).toBeGreaterThanOrEqual(2);
  });
});
