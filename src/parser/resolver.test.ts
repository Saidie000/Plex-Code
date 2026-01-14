import { describe, it, expect } from '@jest/globals';
import { resolveIntent, createResolver } from './resolver/resolver.js';
import { BUILTIN_INTENTS } from './resolver/builtins.js';
import { tokenize } from './lexer/tokenizer.js';
import { parse } from './parser/parser.js';

describe('Intent Resolver', () => {
  it('should resolve Sniff~ intent to device.sniff', () => {
    const intent = resolveIntent('Sniff~', ['ALL'], 'shell');
    expect(intent).not.toBeNull();
    expect(intent?.intent.name).toBe('device.sniff');
    expect(intent?.output).toContain('sniff');
  });

  it('should resolve detect~!! intent', () => {
    const intent = resolveIntent('detect~!!', ['sensors'], 'shell');
    expect(intent).not.toBeNull();
    expect(intent?.intent.name).toBe('device.detect');
  });

  it('should resolve Fetch~!! intent', () => {
    const intent = resolveIntent('Fetch~!!', ['firmware'], 'shell');
    expect(intent).not.toBeNull();
    expect(intent?.intent.name).toBe('device.fetch');
  });

  it('should resolve Store~ intent', () => {
    const intent = resolveIntent('Store~', ['@.attributes'], 'shell');
    expect(intent).not.toBeNull();
    expect(intent?.intent.name).toBe('state.store');
  });

  it('should resolve Build~!! intent', () => {
    const intent = resolveIntent('Build~!!', ['UI'], 'html');
    expect(intent).not.toBeNull();
    expect(intent?.intent.name).toBe('ui.build');
    expect(intent?.output).toContain('plexcode-builder');
  });

  it('should resolve Panel~!! intent with HTML backend', () => {
    const intent = resolveIntent('Panel~!!', ['MyPanel'], 'html');
    expect(intent).not.toBeNull();
    expect(intent?.intent.name).toBe('ui.panel');
    expect(intent?.output).toContain('plexcode-panel');
  });

  it('should resolve ASK~!! intent', () => {
    const intent = resolveIntent('ASK~!!', ['SENSOR_ACCESS'], 'html');
    expect(intent).not.toBeNull();
    expect(intent?.intent.name).toBe('auth.ask');
    expect(intent?.output).toContain('permission-prompt');
  });

  it('should resolve ACCESS~!! intent', () => {
    const intent = resolveIntent('ACCESS~!!', ['DEVICE'], 'shell');
    expect(intent).not.toBeNull();
    expect(intent?.intent.name).toBe('auth.access');
  });

  it('should resolve call~ intent', () => {
    const intent = resolveIntent('call~', ['token'], 'shell');
    expect(intent).not.toBeNull();
    expect(intent?.intent.name).toBe('exec.call');
  });

  it('should resolve Show~ intent', () => {
    const intent = resolveIntent('Show~', ['data'], 'html');
    expect(intent).not.toBeNull();
    expect(intent?.intent.name).toBe('ui.show');
  });

  it('should resolve SimCore~!! intent', () => {
    const intent = resolveIntent('SimCore~!!', [], 'shell');
    expect(intent).not.toBeNull();
    expect(intent?.intent.name).toBe('core.simcore');
  });

  it('should resolve Pair~ intent', () => {
    const intent = resolveIntent('Pair~', [], 'shell');
    expect(intent).not.toBeNull();
    expect(intent?.intent.name).toBe('device.pair');
  });

  it('should resolve Sense~!! intent', () => {
    const intent = resolveIntent('Sense~!!', ['device'], 'shell');
    expect(intent).not.toBeNull();
    expect(intent?.intent.name).toBe('device.sense');
  });

  it('should resolve SEND~!! intent', () => {
    const intent = resolveIntent('SEND~!!', ['device', 'data'], 'shell');
    expect(intent).not.toBeNull();
    expect(intent?.intent.name).toBe('exec.send');
  });

  it('should resolve get~ intent', () => {
    const intent = resolveIntent('get~', ['data'], 'shell');
    expect(intent).not.toBeNull();
    expect(intent?.intent.name).toBe('exec.get');
  });

  it('should resolve NCOM~!! intent', () => {
    const intent = resolveIntent('NCOM~!!', ['DEV'], 'ncom');
    expect(intent).not.toBeNull();
    expect(intent?.intent.name).toBe('core.ncom');
  });

  it('should resolve Feed~ intent', () => {
    const intent = resolveIntent('Feed~', ['LIVE'], 'shell');
    expect(intent).not.toBeNull();
    expect(intent?.intent.name).toBe('config.feed');
  });

  it('should resolve Source~ intent', () => {
    const intent = resolveIntent('Source~', ['sensor.eye'], 'shell');
    expect(intent).not.toBeNull();
    expect(intent?.intent.name).toBe('config.source');
  });

  it('should resolve Permissions~ intent', () => {
    const intent = resolveIntent('Permissions~', ['DEV~!!'], 'shell');
    expect(intent).not.toBeNull();
    expect(intent?.intent.name).toBe('config.permissions');
  });

  it('should resolve Log~ intent', () => {
    const intent = resolveIntent('Log~', ['ALWAYS'], 'shell');
    expect(intent).not.toBeNull();
    expect(intent?.intent.name).toBe('config.log');
  });

  it('should return null for unknown command', () => {
    const intent = resolveIntent('UnknownCommand~', [], 'shell');
    expect(intent).toBeNull();
  });

  it('should resolve all intents in a parsed file', () => {
    const code = `Sniff~ [ALL]
╰──➤ detect~!! | sensors
Store~ @result`;
    
    const tokens = tokenize(code);
    const { ast } = parse(tokens);
    
    expect(ast).not.toBeNull();
    
    const resolver = createResolver({ backend: 'shell' });
    const intents = resolver.resolveAll(ast!.statements);
    
    expect(intents.length).toBeGreaterThanOrEqual(2);
  });

  it('should have at least 15 built-in intents', () => {
    const intentCount = Object.keys(BUILTIN_INTENTS).length;
    expect(intentCount).toBeGreaterThanOrEqual(15);
  });

  it('should generate different output for different backends', () => {
    const shellIntent = resolveIntent('Panel~!!', ['MyPanel'], 'shell');
    const htmlIntent = resolveIntent('Panel~!!', ['MyPanel'], 'html');
    
    expect(shellIntent?.output).not.toBe(htmlIntent?.output);
    expect(htmlIntent?.output).toContain('plexcode-panel');
  });
});
