/**
 * Language-Specific Parsers
 * Extracts symbols, imports, exports from source code
 */

import { CodeSymbol } from './types';

export class LanguageParsers {
  static parseTypeScript(content: string): { symbols: CodeSymbol[]; imports: string[]; exports: string[] } {
    const symbols: CodeSymbol[] = [];
    const imports: string[] = [];
    const exports: string[] = [];

    const lines = content.split('\n');

    lines.forEach((line, index) => {
      // Extract imports
      const importMatch = line.match(/import\s+(?:.*?)\s+from\s+['"]([^'"]+)['"]/);
      if (importMatch) imports.push(importMatch[1]);

      // Extract exports
      const exportMatch = line.match(/export\s+(?:class|interface|type|function)\s+(\w+)/);
      if (exportMatch) exports.push(exportMatch[1]);

      // Extract class definitions
      const classMatch = line.match(/class\s+(\w+)/);
      if (classMatch) {
        symbols.push({
          name: classMatch[1],
          type: 'class',
          line: index + 1,
        });
      }

      // Extract interface definitions
      const interfaceMatch = line.match(/interface\s+(\w+)/);
      if (interfaceMatch) {
        symbols.push({
          name: interfaceMatch[1],
          type: 'interface',
          line: index + 1,
        });
      }

      // Extract function definitions
      const functionMatch = line.match(/(?:export\s+)?(?:async\s+)?function\s+(\w+)/);
      if (functionMatch) {
        symbols.push({
          name: functionMatch[1],
          type: 'function',
          line: index + 1,
        });
      }

      // Extract type definitions
      const typeMatch = line.match(/type\s+(\w+)/);
      if (typeMatch) {
        symbols.push({
          name: typeMatch[1],
          type: 'type',
          line: index + 1,
        });
      }
    });

    return { symbols, imports, exports };
  }

  static parseRuby(content: string): { symbols: CodeSymbol[]; imports: string[]; exports: string[] } {
    const symbols: CodeSymbol[] = [];
    const imports: string[] = [];
    const exports: string[] = [];

    const lines = content.split('\n');

    lines.forEach((line, index) => {
      // Extract requires
      const requireMatch = line.match(/require\s+['"]([^'"]+)['"]/);
      if (requireMatch) imports.push(requireMatch[1]);

      // Extract classes
      const classMatch = line.match(/class\s+(\w+)/);
      if (classMatch) {
        symbols.push({
          name: classMatch[1],
          type: 'class',
          line: index + 1,
        });
      }

      // Extract methods
      const methodMatch = line.match(/def\s+(\w+)/);
      if (methodMatch) {
        symbols.push({
          name: methodMatch[1],
          type: 'method',
          line: index + 1,
        });
      }

      // Extract modules
      const moduleMatch = line.match(/module\s+(\w+)/);
      if (moduleMatch) {
        symbols.push({
          name: moduleMatch[1],
          type: 'module',
          line: index + 1,
        });
      }
    });

    return { symbols, imports, exports };
  }

  static parseJSON(content: string): { symbols: CodeSymbol[]; imports: string[]; exports: string[] } {
    const symbols: CodeSymbol[] = [];
    const imports: string[] = [];
    const exports: string[] = [];

    try {
      const json = JSON.parse(content);
      Object.keys(json).slice(0, 20).forEach((key, index) => {
        symbols.push({
          name: key,
          type: 'constant',
          line: 1,
        });
      });
    } catch {
      // Invalid JSON
    }

    return { symbols, imports, exports };
  }

  static parseYAML(content: string): { symbols: CodeSymbol[]; imports: string[]; exports: string[] } {
    const symbols: CodeSymbol[] = [];
    const imports: string[] = [];
    const exports: string[] = [];

    const lines = content.split('\n');
    let lineNum = 0;

    lines.forEach((line, index) => {
      const keyMatch = line.match(/^(\w+):/);
      if (keyMatch && !line.startsWith(' ')) {
        symbols.push({
          name: keyMatch[1],
          type: 'constant',
          line: index + 1,
        });
      }
    });

    return { symbols, imports, exports };
  }

  static parse(
    content: string,
    language: string
  ): { symbols: CodeSymbol[]; imports: string[]; exports: string[] } {
    switch (language.toLowerCase()) {
      case 'typescript':
      case 'javascript':
      case 'ts':
      case 'tsx':
      case 'js':
      case 'jsx':
        return this.parseTypeScript(content);
      case 'ruby':
      case 'rb':
        return this.parseRuby(content);
      case 'json':
        return this.parseJSON(content);
      case 'yaml':
      case 'yml':
        return this.parseYAML(content);
      default:
        return { symbols: [], imports: [], exports: [] };
    }
  }

  static detectLanguage(filePath: string): string {
    const ext = filePath.split('.').pop()?.toLowerCase() || '';
    const languageMap: Record<string, string> = {
      ts: 'typescript',
      tsx: 'typescript',
      js: 'javascript',
      jsx: 'javascript',
      rb: 'ruby',
      erb: 'erb',
      json: 'json',
      yml: 'yaml',
      yaml: 'yaml',
      py: 'python',
      go: 'go',
      rs: 'rust',
      java: 'java',
      cs: 'csharp',
      cpp: 'cpp',
      c: 'c',
      h: 'c',
      php: 'php',
    };

    return languageMap[ext] || ext;
  }
}
