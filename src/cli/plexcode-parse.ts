#!/usr/bin/env node

import * as fs from 'fs';
import { parseAndResolve, parseSource } from '../parser/index.js';
import { formatDiagnostics, createDiagnostic } from '../parser/errors/diagnostics.js';

const args = process.argv.slice(2);

function printHelp() {
  console.log(`
PlexCode Parser CLI

Usage:
  plexcode-parse <file.plx>                  Parse and validate file
  plexcode-parse --ast <file.plx>           Show AST
  plexcode-parse --tokens <file.plx>        Show tokens
  plexcode-parse --intents <file.plx>       Show resolved intents
  plexcode-parse --backend <type> <file.plx> Resolve with specific backend (shell, html, ncom, python)
  plexcode-parse --help                     Show this help

Examples:
  plexcode-parse examples/sensor-access.plx
  plexcode-parse --ast examples/hello.plx
  plexcode-parse --intents --backend html examples/build-ui.plx
`);
}

function main() {
  if (args.length === 0 || args.includes('--help')) {
    printHelp();
    process.exit(0);
  }

  let showTokens = false;
  let showAST = false;
  let showIntents = false;
  let backend: 'shell' | 'html' | 'ncom' | 'python' = 'shell';
  let filePath = '';

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--tokens') {
      showTokens = true;
    } else if (arg === '--ast') {
      showAST = true;
    } else if (arg === '--intents') {
      showIntents = true;
    } else if (arg === '--backend') {
      const backendArg = args[++i];
      if (!backendArg || !['shell', 'html', 'ncom', 'python'].includes(backendArg)) {
        console.error('Error: Invalid backend. Must be one of: shell, html, ncom, python');
        process.exit(1);
      }
      backend = backendArg as any;
    } else if (!arg.startsWith('--')) {
      filePath = arg;
    }
  }

  if (!filePath) {
    console.error('Error: No file specified');
    printHelp();
    process.exit(1);
  }

  if (!fs.existsSync(filePath)) {
    console.error(`Error: File not found: ${filePath}`);
    process.exit(1);
  }

  const source = fs.readFileSync(filePath, 'utf-8');
  
  if (showTokens) {
    const { tokens } = parseSource(source);
    console.log('\n=== TOKENS ===\n');
    tokens.forEach((token, i) => {
      console.log(`${i}: ${token.type} = "${token.value}" (line ${token.position.line}, col ${token.position.column})`);
    });
    process.exit(0);
  }

  if (showAST) {
    const { ast, errors } = parseSource(source);
    
    if (errors.length > 0) {
      console.error('\n=== ERRORS ===\n');
      const diagnostics = errors.map((e: any) => 
        createDiagnostic('error', e.message, e.code, e.position, undefined, e.suggestion)
      );
      console.error(formatDiagnostics(diagnostics));
      process.exit(1);
    }

    console.log('\n=== AST ===\n');
    console.log(JSON.stringify(ast, null, 2));
    process.exit(0);
  }

  const result = parseAndResolve(source, backend);

  if (result.errors.length > 0) {
    console.error('\n=== ERRORS ===\n');
    const diagnostics = result.errors.map((e: any) => 
      createDiagnostic('error', e.message, e.code, e.position, undefined, e.suggestion)
    );
    console.error(formatDiagnostics(diagnostics));
    process.exit(1);
  }

  const statementCount = result.ast?.statements.length || 0;
  const intentCount = result.intents.length;

  console.log(`\n✓ Parsed ${statementCount} statements`);
  console.log(`✓ Resolved ${intentCount} intents`);
  console.log(`✓ 0 errors, 0 warnings\n`);

  if (showIntents || result.intents.length > 0) {
    console.log('=== RESOLVED INTENTS ===\n');
    
    const intentsByName = new Map<string, number>();
    result.intents.forEach((resolved: any) => {
      const count = intentsByName.get(resolved.intent.command) || 0;
      intentsByName.set(resolved.intent.command, count + 1);
    });

    console.log('Commands:');
    intentsByName.forEach((count, command) => {
      const intent = result.intents.find((r: any) => r.intent.command === command);
      console.log(`  ${command} → ${intent?.intent.name} (${count}x)`);
    });

    if (showIntents) {
      console.log('\n=== DETAILED INTENTS ===\n');
      result.intents.forEach((resolved: any, i: number) => {
        console.log(`\n[${i + 1}] ${resolved.intent.name}`);
        console.log(`    Command: ${resolved.intent.command}`);
        console.log(`    Category: ${resolved.intent.category}`);
        console.log(`    Backend: ${resolved.backend}`);
        console.log(`    Parameters:`, resolved.params);
        if (resolved.output) {
          console.log(`    Output: ${resolved.output.substring(0, 100)}${resolved.output.length > 100 ? '...' : ''}`);
        }
      });
    }
  }

  process.exit(0);
}

main();
