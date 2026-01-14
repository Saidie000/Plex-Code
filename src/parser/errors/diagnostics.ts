import { Position } from '../lexer/token-types.js';

export type DiagnosticSeverity = 'error' | 'warning' | 'info';

export interface Diagnostic {
  severity: DiagnosticSeverity;
  message: string;
  code: string;
  range: {
    start: Position;
    end: Position;
  };
  suggestion?: string;
}

export function createDiagnostic(
  severity: DiagnosticSeverity,
  message: string,
  code: string,
  start: Position,
  end?: Position,
  suggestion?: string
): Diagnostic {
  return {
    severity,
    message,
    code,
    range: {
      start,
      end: end || start
    },
    suggestion
  };
}

export function formatDiagnostic(diagnostic: Diagnostic): string {
  const { severity, message, code, range, suggestion } = diagnostic;
  const { start } = range;
  
  let output = `[${severity.toUpperCase()}] ${message} (${code})\n`;
  output += `  at line ${start.line}, column ${start.column}\n`;
  
  if (suggestion) {
    output += `  Suggestion: ${suggestion}\n`;
  }
  
  return output;
}

export function formatDiagnostics(diagnostics: Diagnostic[]): string {
  return diagnostics.map(formatDiagnostic).join('\n');
}
