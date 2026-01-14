import { describe, it, expect, beforeEach } from '@jest/globals';
import { tokenize } from './lexer/tokenizer.js';
import { TokenType } from './lexer/token-types.js';
import { parse } from './parser/parser.js';
import { resolveIntent } from './resolver/resolver.js';
import { PackageManager, KNOWN_PACKAGES } from './resolver/package-manager.js';
import { parseAndResolve } from './index.js';

describe('Import Command', () => {
  describe('Tokenizer', () => {
    it('should tokenize import~ command', () => {
      const tokens = tokenize('import~ blender');
      expect(tokens[0].type).toBe(TokenType.IMPORT);
      expect(tokens[0].value).toBe('import~');
      expect(tokens[1].type).toBe(TokenType.IDENTIFIER);
      expect(tokens[1].value).toBe('blender');
    });

    it('should tokenize import~!! command', () => {
      const tokens = tokenize('import~!! photoshop');
      expect(tokens[0].type).toBe(TokenType.IMPORT_BANG);
      expect(tokens[0].value).toBe('import~!!');
    });
  });

  describe('Parser', () => {
    it('should parse import~ statement', () => {
      const code = 'import~ blender';
      const tokens = tokenize(code);
      const { ast, errors } = parse(tokens);
      
      expect(errors.length).toBe(0);
      expect(ast).not.toBeNull();
      expect(ast?.statements[0].command).toBe('import~');
      expect(ast?.statements[0].parameters.length).toBeGreaterThan(0);
    });

    it('should parse multiple import statements', () => {
      const code = `import~ blender
import~ photoshop
import~ vscode`;
      const tokens = tokenize(code);
      const { ast, errors } = parse(tokens);
      
      expect(errors.length).toBe(0);
      expect(ast?.statements.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Package Manager', () => {
    let packageManager: PackageManager;

    beforeEach(() => {
      packageManager = new PackageManager();
    });

    it('should check if package is available', () => {
      expect(packageManager.isPackageAvailable('blender')).toBe(true);
      expect(packageManager.isPackageAvailable('nonexistent')).toBe(false);
    });

    it('should check if package is installed', () => {
      expect(packageManager.isPackageInstalled('blender')).toBe(false);
      packageManager.markAsInstalled('blender');
      expect(packageManager.isPackageInstalled('blender')).toBe(true);
    });

    it('should get package info', () => {
      const pkg = packageManager.getPackageInfo('blender');
      expect(pkg).not.toBeNull();
      expect(pkg?.name).toBe('blender');
      expect(pkg?.source).toBe('blender.org/NCOM');
      expect(pkg?.type).toBe('k!t');
    });

    it('should return null for nonexistent package', () => {
      const pkg = packageManager.getPackageInfo('nonexistent');
      expect(pkg).toBeNull();
    });

    it('should generate install prompt for available package', () => {
      const prompt = packageManager.generateInstallPrompt('blender');
      expect(prompt).toContain('blender');
      expect(prompt).toContain('.k!t');
      expect(prompt).toContain('[ Y ] [ N ]');
    });

    it('should generate error message for unavailable package', () => {
      const prompt = packageManager.generateInstallPrompt('nonexistent');
      expect(prompt).toContain('doesn\'t exist');
    });

    it('should generate install output', () => {
      const output = packageManager.generateInstallOutput('blender', true);
      expect(output).toContain('|| Y');
      expect(output).toContain('Now installing');
      expect(output).toContain('blender.k!t');
      expect(output).toContain('blender.org/NCOM');
      expect(output).toContain('100%');
    });

    it('should show cancellation message when not confirmed', () => {
      const output = packageManager.generateInstallOutput('blender', false);
      expect(output).toContain('cancelled');
    });

    it('should list all packages', () => {
      const packages = packageManager.getAllPackages();
      expect(packages.length).toBeGreaterThan(0);
      expect(packages.some(p => p.name === 'blender')).toBe(true);
      expect(packages.some(p => p.name === 'photoshop')).toBe(true);
    });

    it('should add package to registry', () => {
      const newPkg = {
        name: 'testapp',
        version: '1.0.0',
        source: 'test.com/NCOM',
        type: 'k!t' as const,
        description: 'Test application'
      };
      
      packageManager.addPackageToRegistry(newPkg);
      expect(packageManager.isPackageAvailable('testapp')).toBe(true);
    });

    it('should handle async package check', async () => {
      const result = await packageManager.checkPackage('blender');
      expect(result.exists).toBe(true);
      expect(result.installed).toBe(false);
      expect(result.available).toBe(true);
      expect(result.package).not.toBeUndefined();
    });

    it('should handle async package installation', async () => {
      const progressSteps: string[] = [];
      
      const success = await packageManager.installPackage('blender', (progress) => {
        progressSteps.push(progress.status);
      });
      
      expect(success).toBe(true);
      expect(progressSteps).toContain('checking');
      expect(progressSteps).toContain('downloading');
      expect(progressSteps).toContain('installing');
      expect(progressSteps).toContain('complete');
      expect(packageManager.isPackageInstalled('blender')).toBe(true);
    });
  });

  describe('Intent Resolver', () => {
    it('should resolve import~ intent', () => {
      const intent = resolveIntent('import~', ['blender'], 'shell');
      expect(intent).not.toBeNull();
      expect(intent?.intent.name).toBe('package.import');
      expect(intent?.intent.category).toBe('PACKAGE');
    });

    it('should generate shell output for import', () => {
      const intent = resolveIntent('import~', ['blender'], 'shell');
      expect(intent?.output).toContain('blender');
      expect(intent?.output).toContain('|| !!');
    });

    it('should generate HTML output for import', () => {
      const intent = resolveIntent('import~', ['blender'], 'html');
      expect(intent?.output).toContain('import-prompt');
      expect(intent?.output).toContain('blender');
    });

    it('should generate NCOM output for import', () => {
      const intent = resolveIntent('import~', ['photoshop'], 'ncom');
      expect(intent?.output).toContain('NCOM_IMPORT');
      expect(intent?.output).toContain('photoshop');
    });
  });

  describe('Integration', () => {
    it('should parse and resolve import statement', () => {
      const code = 'import~ blender';
      const result = parseAndResolve(code, 'shell');
      
      expect(result.errors.length).toBe(0);
      expect(result.intents.length).toBeGreaterThan(0);
      expect(result.intents[0].intent.name).toBe('package.import');
    });

    it('should handle multiple imports', () => {
      const code = `import~ blender
import~ photoshop
import~ vscode`;
      const result = parseAndResolve(code, 'shell');
      
      expect(result.errors.length).toBe(0);
      expect(result.intents.length).toBeGreaterThanOrEqual(3);
      expect(result.intents.every(i => i.intent.name === 'package.import')).toBe(true);
    });

    it('should handle nonexistent package', () => {
      const code = 'import~ nonexistent_package';
      const result = parseAndResolve(code, 'shell');
      
      expect(result.errors.length).toBe(0);
      expect(result.intents.length).toBeGreaterThan(0);
      expect(result.intents[0].output).toContain('doesn\'t exist');
    });
  });

  describe('Known Packages', () => {
    it('should have blender in registry', () => {
      expect(KNOWN_PACKAGES['blender']).toBeDefined();
      expect(KNOWN_PACKAGES['blender'].name).toBe('blender');
    });

    it('should have photoshop in registry', () => {
      expect(KNOWN_PACKAGES['photoshop']).toBeDefined();
      expect(KNOWN_PACKAGES['photoshop'].name).toBe('photoshop');
    });

    it('should have vscode in registry', () => {
      expect(KNOWN_PACKAGES['vscode']).toBeDefined();
      expect(KNOWN_PACKAGES['vscode'].name).toBe('vscode');
    });

    it('should have chrome in registry', () => {
      expect(KNOWN_PACKAGES['chrome']).toBeDefined();
      expect(KNOWN_PACKAGES['chrome'].name).toBe('chrome');
    });

    it('should have unity in registry', () => {
      expect(KNOWN_PACKAGES['unity']).toBeDefined();
      expect(KNOWN_PACKAGES['unity'].name).toBe('unity');
    });

    it('should have unreal in registry', () => {
      expect(KNOWN_PACKAGES['unreal']).toBeDefined();
      expect(KNOWN_PACKAGES['unreal'].name).toBe('unreal');
    });
  });
});
