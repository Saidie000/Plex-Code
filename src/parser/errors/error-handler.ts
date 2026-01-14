import { Position } from '../lexer/token-types.js';

export class ParserError extends Error {
  constructor(
    message: string,
    public code: string,
    public position: Position,
    public suggestion?: string
  ) {
    super(message);
    this.name = 'ParserError';
  }
}

export function createParserError(
  message: string,
  code: string,
  position: Position,
  suggestion?: string
): ParserError {
  return new ParserError(message, code, position, suggestion);
}

export function createUnknownCommandError(command: string, position: Position): ParserError {
  const suggestions = [
    'call~', 'build~', 'check~', 'store~', 'show~',
    'Sniff~', 'detect~!!', 'Fetch~!!', 'ASK~!!', 'ACCESS~!!'
  ];
  
  const similar = findSimilarCommand(command, suggestions);
  const suggestion = similar ? `Did you mean '${similar}'?` : undefined;

  return createParserError(
    `Unknown command '${command}'`,
    'E001',
    position,
    suggestion
  );
}

export function createMissingParameterError(command: string, position: Position): ParserError {
  return createParserError(
    `Command '${command}' requires at least one parameter`,
    'E002',
    position,
    'Add parameters after the command'
  );
}

export function createInvalidSyntaxError(expected: string, found: string, position: Position): ParserError {
  return createParserError(
    `Expected '${expected}' but found '${found}'`,
    'E003',
    position
  );
}

export function createUnresolvedReferenceError(reference: string, position: Position): ParserError {
  return createParserError(
    `Reference '${reference}' does not exist`,
    'E004',
    position,
    'Check that the reference path is correct'
  );
}

function findSimilarCommand(input: string, commands: string[]): string | null {
  const inputLower = input.toLowerCase();
  let bestMatch: string | null = null;
  let bestScore = Infinity;

  for (const cmd of commands) {
    const score = levenshteinDistance(inputLower, cmd.toLowerCase());
    if (score < bestScore && score <= 3) {
      bestScore = score;
      bestMatch = cmd;
    }
  }

  return bestMatch;
}

function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}
