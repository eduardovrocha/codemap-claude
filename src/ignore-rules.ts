/**
 * File Ignore Rules
 * Filters out directories and files that shouldn't be scanned
 */

export class IgnoreRules {
  private patterns: string[];
  private regexPatterns: RegExp[] = [];

  constructor(customPatterns?: string[]) {
    // Default ignore patterns
    this.patterns = [
      'node_modules',
      '.git',
      '.claude',
      'dist',
      'build',
      'coverage',
      '.next',
      'tmp',
      '.cache',
      '.nuxt',
      'out',
      '.DS_Store',
      'Thumbs.db',
      '.env',
      '.env.local',
      '.idea',
      '.vscode',
    ];

    // Add custom patterns
    if (customPatterns) {
      this.patterns = [...this.patterns, ...customPatterns];
    }

    this.compilePatterns();
  }

  private compilePatterns(): void {
    this.regexPatterns = this.patterns.map(pattern => {
      let regexStr = pattern
        .replace(/\./g, '\\.')
        .replace(/\*/g, '[^/]*')
        .replace(/\*\*/g, '.*')
        .replace(/\?/g, '.');

      regexStr = regexStr.replace(/\[\^\/\]\*\.\*/g, '.*');
      return new RegExp(`(^|/|\\\\)${regexStr}(/|\\\\|$)`);
    });
  }

  shouldIgnore(filePath: string): boolean {
    const normalizedPath = filePath.replace(/\\/g, '/');
    return this.regexPatterns.some(regex => regex.test(normalizedPath));
  }

  addPattern(pattern: string): void {
    if (!this.patterns.includes(pattern)) {
      this.patterns.push(pattern);
      this.compilePatterns();
    }
  }
}
