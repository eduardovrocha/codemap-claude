/**
 * CLI Interface for Codemap Generation
 * Provides: claude-codemap [folder1,folder2,...]
 */

import * as fs from 'fs';
import * as path from 'path';
import { CodemapGenerator } from './codemap-generator';
import { FolderSelector, type ProjectFolder } from './folder-selector';
import { FolderCodemap } from './types';

export class CodemapCLI {
  private projectRoot: string;
  private codemapsDir: string;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
    this.codemapsDir = path.join(projectRoot, '.claude', 'codemaps');
    this.ensureCodemapsDir();
  }

  private ensureCodemapsDir(): void {
    if (!fs.existsSync(this.codemapsDir)) {
      fs.mkdirSync(this.codemapsDir, { recursive: true });
      console.log(`📁 Created: .claude/codemaps/`);
    }
  }

  async run(foldersArg?: string): Promise<void> {
    try {
      console.log('🔍 Codemap Generation Tool\n');

      let foldersToScan: ProjectFolder[];

      if (foldersArg) {
        foldersToScan = this.parseFolderArguments(foldersArg);
      } else {
        const selector = new FolderSelector(this.projectRoot);
        await selector.discoverFolders();
        foldersToScan = await selector.selectFolders();
      }

      if (foldersToScan.length === 0) {
        console.log('❌ No folders to scan');
        return;
      }

      const selector = new FolderSelector(this.projectRoot);
      selector.displaySelection(foldersToScan);

      console.log('\n⏳ Generating codemaps...\n');
      const generator = new CodemapGenerator(this.projectRoot);
      const results: Array<{ folder: string; success: boolean; message: string }> = [];

      for (const folder of foldersToScan) {
        try {
          console.log(`📍 Scanning: ${folder.name}`);
          const codemap = await generator.generate(folder.path);
          const fileName = this.sanitizeFolderName(folder.path);
          const outputPath = path.join(this.codemapsDir, `${fileName}.codemap.json`);

          fs.writeFileSync(outputPath, JSON.stringify(codemap, null, 2));

          console.log(`✅ ${folder.name.padEnd(20)} → .claude/codemaps/${fileName}.codemap.json`);
          this.printSummary(codemap);
          this.printFrameworkDetection(codemap);

          results.push({
            folder: folder.name,
            success: true,
            message: `Generated for ${folder.path}`,
          });
        } catch (error) {
          console.error(`❌ ${folder.name.padEnd(20)} → Error: ${error instanceof Error ? error.message : error}`);
          results.push({
            folder: folder.name,
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      this.printGenerationSummary(results);
    } catch (error) {
      console.error(`❌ Error: ${error instanceof Error ? error.message : error}`);
      process.exit(1);
    }
  }

  private parseFolderArguments(foldersArg: string): ProjectFolder[] {
    const folders = foldersArg.split(',').map(f => f.trim());
    const result: ProjectFolder[] = [];

    for (const folder of folders) {
      const absolutePath = path.resolve(this.projectRoot, folder);
      if (fs.existsSync(absolutePath) && fs.statSync(absolutePath).isDirectory()) {
        result.push({
          name: path.basename(folder),
          path: folder,
          isSelected: true,
        });
      } else {
        console.warn(`⚠️  Folder not found: ${folder}`);
      }
    }

    return result;
  }

  private sanitizeFolderName(folderPath: string): string {
    return folderPath
      .split(path.sep)
      .join('-')
      .replace(/\./g, '')
      .replace(/^-|-$/g, '')
      .toLowerCase();
  }

  private printSummary(codemap: FolderCodemap): void {
    console.log('\n📊 Codemap Summary:');
    console.log(`   Files scanned: ${codemap.statistics.totalFiles}`);
    console.log(`   Lines of code: ${codemap.statistics.totalLines.toLocaleString()}`);
    console.log(`   Symbols found: ${codemap.statistics.totalSymbols}`);
    console.log(`   Test files: ${codemap.statistics.testFiles}`);

    console.log('\n🗣️  Languages:');
    Object.entries(codemap.statistics.languages).forEach(([lang, count]) => {
      console.log(`   ${lang.padEnd(15)} ${count}`);
    });
  }

  private printFrameworkDetection(codemap: FolderCodemap): void {
    const frameworks = this.detectFrameworks(codemap);
    if (frameworks.length > 0) {
      console.log('\n🔧 Detected frameworks:');
      frameworks.forEach(fw => console.log(`   • ${fw}`));
    }
  }

  private detectFrameworks(codemap: FolderCodemap): string[] {
    const frameworks: Set<string> = new Set();

    codemap.files.forEach(file => {
      file.imports.forEach(imp => {
        const lowerImp = imp.toLowerCase();
        if (lowerImp.includes('rails') || lowerImp.includes('active')) frameworks.add('Rails');
        if (lowerImp.includes('react')) frameworks.add('React');
        if (lowerImp.includes('vue')) frameworks.add('Vue');
        if (lowerImp.includes('angular')) frameworks.add('Angular');
        if (lowerImp.includes('express')) frameworks.add('Express');
        if (lowerImp.includes('fastify')) frameworks.add('Fastify');
        if (lowerImp.includes('nest') || lowerImp.includes('nestjs')) frameworks.add('NestJS');
        if (lowerImp.includes('django')) frameworks.add('Django');
        if (lowerImp.includes('flask')) frameworks.add('Flask');
        if (lowerImp.includes('sinatra')) frameworks.add('Sinatra');
      });

      file.exports.forEach(exp => {
        if (exp.includes('Controller') || exp.includes('Service')) frameworks.add('Rails');
        if (exp.includes('Component')) frameworks.add('React');
      });
    });

    return Array.from(frameworks).sort();
  }

  private printGenerationSummary(
    results: Array<{ folder: string; success: boolean; message: string }>
  ): void {
    console.log('\n' + '='.repeat(70));
    console.log('📋 Generation Summary');
    console.log('='.repeat(70));

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`\n✅ Successful: ${successful}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📊 Total: ${results.length}`);

    if (failed > 0) {
      console.log('\n⚠️  Failed folders:');
      results
        .filter(r => !r.success)
        .forEach(r => {
          console.log(`   • ${r.folder}: ${r.message}`);
        });
    }

    console.log('\n' + '='.repeat(70));
    console.log('✨ Codemaps ready in: .claude/codemaps/\n');
  }
}

if (require.main === module) {
  const projectRoot = process.cwd();
  const folderArg = process.argv[2];
  const cli = new CodemapCLI(projectRoot);
  cli.run(folderArg);
}
