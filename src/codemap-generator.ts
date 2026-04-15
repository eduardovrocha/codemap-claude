/**
 * Codemap Generator
 * Core engine for scanning directories and extracting code metadata
 */

import * as fs from 'fs';
import * as path from 'path';
import { IgnoreRules } from './ignore-rules';
import { LanguageParsers } from './language-parsers';
import { FileMetadata, DirectoryNode, FolderCodemap, FolderStatistics } from './types';

export class CodemapGenerator {
  private projectRoot: string;
  private ignoreRules: IgnoreRules;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
    this.ignoreRules = new IgnoreRules();
  }

  async generate(folderPath: string): Promise<FolderCodemap> {
    const absolutePath = path.resolve(this.projectRoot, folderPath);

    if (!fs.existsSync(absolutePath)) {
      throw new Error(`Folder not found: ${folderPath}`);
    }

    const startTime = Date.now();
    const files = this.scanDirectory(absolutePath);
    const statistics = this.aggregateStatistics(files);
    const structure = this.buildDirectoryTree(absolutePath, folderPath);

    const codemap: FolderCodemap = {
      timestamp: new Date().toISOString(),
      folderPath: absolutePath,
      projectRoot: this.projectRoot,
      relativePath: folderPath,
      statistics,
      files,
      structure,
      metadata: {
        generatedBy: 'codemap-generator',
        version: '1.0.0',
      },
    };

    const elapsed = Date.now() - startTime;
    console.log(`   ✅ Codemap generated in ${elapsed}ms`);

    return codemap;
  }

  private scanDirectory(dirPath: string): FileMetadata[] {
    const files: FileMetadata[] = [];

    const traverse = (dir: string) => {
      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);

          if (this.ignoreRules.shouldIgnore(fullPath)) {
            continue;
          }

          if (entry.isDirectory()) {
            traverse(fullPath);
          } else if (entry.isFile()) {
            const metadata = this.extractFileMetadata(fullPath);
            if (metadata) {
              files.push(metadata);
            }
          }
        }
      } catch {
        // Ignore permission errors
      }
    };

    traverse(dirPath);
    return files;
  }

  private extractFileMetadata(filePath: string): FileMetadata | null {
    try {
      const stats = fs.statSync(filePath);
      const content = fs.readFileSync(filePath, 'utf-8').toString();
      const lines = content.split('\n').length;
      const ext = path.extname(filePath).slice(1).toLowerCase();
      const language = LanguageParsers.detectLanguage(filePath);

      const { symbols, imports, exports } = LanguageParsers.parse(content, language);

      return {
        path: filePath,
        extension: ext,
        language,
        size: stats.size,
        lines,
        imports,
        exports,
        symbols,
        testFile: this.isTestFile(filePath),
      };
    } catch {
      return null;
    }
  }

  private isTestFile(filePath: string): boolean {
    const testPatterns = ['.test.', '.spec.', '__tests__', 'test/', 'tests/'];
    return testPatterns.some(pattern => filePath.includes(pattern));
  }

  private aggregateStatistics(files: FileMetadata[]): FolderStatistics {
    const languages: Record<string, number> = {};
    let totalLines = 0;
    let totalSymbols = 0;
    let testFiles = 0;

    files.forEach(file => {
      totalLines += file.lines;
      totalSymbols += file.symbols.length;
      if (file.testFile) testFiles++;

      if (!languages[file.language]) {
        languages[file.language] = 0;
      }
      languages[file.language]++;
    });

    return {
      totalFiles: files.length,
      totalLines,
      totalSymbols,
      testFiles,
      languages,
    };
  }

  private buildDirectoryTree(dirPath: string, relativePath: string): DirectoryNode {
    const node: DirectoryNode = {
      name: path.basename(dirPath),
      type: 'directory',
      path: relativePath,
      children: [],
    };

    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });

      entries.forEach(entry => {
        if (this.ignoreRules.shouldIgnore(path.join(dirPath, entry.name))) {
          return;
        }

        const childPath = path.join(dirPath, entry.name);
        const childRelativePath = path.join(relativePath, entry.name);

        if (entry.isDirectory()) {
          node.children!.push(this.buildDirectoryTree(childPath, childRelativePath));
        } else {
          node.children!.push({
            name: entry.name,
            type: 'file',
            path: childRelativePath,
          });
        }
      });
    } catch {
      // Ignore errors
    }

    return node;
  }
}
