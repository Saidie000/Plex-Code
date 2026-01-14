import { StatementNode, ParameterNode, ReferenceNode, ListNode } from '../parser/ast-nodes.js';
import { BUILTIN_INTENTS, Intent, Backend } from './builtins.js';

export interface ResolvedIntent {
  intent: Intent;
  params: Record<string, any>;
  backend: Backend;
  output?: string;
}

export interface ResolutionContext {
  fileType?: 'plx' | 'mf' | 'TAG' | 'k!t';
  backend: Backend;
  state?: Record<string, any>;
  permissions?: string[];
}

export class Resolver {
  private context: ResolutionContext;

  constructor(context: ResolutionContext) {
    this.context = context;
  }

  resolve(statement: StatementNode): ResolvedIntent | null {
    const intent = this.findIntent(statement.command);
    
    if (!intent) {
      return null;
    }

    const params = this.extractParameters(statement.parameters);
    
    const backendFn = intent.backends[this.context.backend];
    const output = backendFn ? backendFn(params) : undefined;

    return {
      intent,
      params,
      backend: this.context.backend,
      output
    };
  }

  resolveAll(statements: StatementNode[]): ResolvedIntent[] {
    const resolved: ResolvedIntent[] = [];

    for (const stmt of statements) {
      const intent = this.resolve(stmt);
      if (intent) {
        resolved.push(intent);
      }

      if (stmt.children && stmt.children.length > 0) {
        resolved.push(...this.resolveAll(stmt.children));
      }
    }

    return resolved;
  }

  private findIntent(command: string): Intent | null {
    for (const intent of Object.values(BUILTIN_INTENTS)) {
      if (intent.command === command || this.commandMatches(command, intent.command)) {
        return intent;
      }
    }
    return null;
  }

  private commandMatches(input: string, pattern: string): boolean {
    const inputNorm = input.toLowerCase().replace(/[~!]/g, '');
    const patternNorm = pattern.toLowerCase().replace(/[~!]/g, '');
    return inputNorm === patternNorm;
  }

  private extractParameters(parameters: ParameterNode[]): Record<string, any> {
    const params: Record<string, any> = {};
    let positionalIndex = 0;

    for (const param of parameters) {
      if (param.key) {
        params[param.key] = this.extractValue(param.value);
      } else {
        const value = this.extractValue(param.value);
        
        if (positionalIndex === 0) {
          params.target = value;
        } else if (positionalIndex === 1) {
          params.scope = value;
        } else {
          params[`arg${positionalIndex}`] = value;
        }
        
        positionalIndex++;
      }
    }

    return params;
  }

  private extractValue(value: any): any {
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return value;
    }

    if (this.isReference(value)) {
      return value.path;
    }

    if (this.isList(value)) {
      return value.items.map((item: any) => this.extractValue(item));
    }

    return value;
  }

  private isReference(value: any): value is ReferenceNode {
    return typeof value === 'object' && value !== null && 'path' in value;
  }

  private isList(value: any): value is ListNode {
    return typeof value === 'object' && value !== null && 'items' in value;
  }
}

export function createResolver(context: ResolutionContext): Resolver {
  return new Resolver(context);
}

export function resolveIntent(
  command: string,
  params: string[],
  backend: Backend
): ResolvedIntent | null {
  const resolver = new Resolver({ backend });
  
  const statement: StatementNode = {
    type: 'STATEMENT' as any,
    command,
    parameters: params.map((p) => ({
      type: 'PARAMETER' as any,
      position: { line: 1, column: 1, index: 0 },
      value: p
    })),
    children: [],
    position: { line: 1, column: 1, index: 0 }
  };

  return resolver.resolve(statement);
}
