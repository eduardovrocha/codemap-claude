/**
 * Interactive Folder Selector
 * Displays all project folders and allows user to select multiple ones
 */

import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

export interface ProjectFolder {
  name: string;
  path: string;
  fileCount?: number;
  isSelected: boolean;
}

export class FolderSelector {
  private projectRoot: string;
  private ignorePatterns: Set<string>;
  private folders: ProjectFolder[] = [];

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
    this.ignorePatterns = new Set([
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
      '.env',
      '.env.local',
      '.env.*.local',
      '.idea',
      '.vscode',
      '.DS_Store',
      'Thumbs.db',
    ]);
  }

  async discoverFolders(): Promise<ProjectFolder[]> {
    const entries = fs.readdirSync(this.projectRoot, { withFileTypes: true });

    this.folders = entries
      .filter(entry => {
        if (!entry.isDirectory()) return false;
        if (this.ignorePatterns.has(entry.name)) return false;
        if (entry.name.startsWith('.') && entry.name !== '.claude') return false;
        return true;
      })
      .map(entry => {
        const folderPath = path.join(this.projectRoot, entry.name);
        const fileCount = this.countFiles(folderPath);

        return {
          name: entry.name,
          path: entry.name,
          fileCount,
          isSelected: false,
        };
      })
      .sort((a, b) => {
        const order = ['app', 'src', 'client', 'server', 'lib', 'components'];
        const aIndex = order.indexOf(a.name);
        const bIndex = order.indexOf(b.name);

        if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;
        return a.name.localeCompare(b.name);
      });

    return this.folders;
  }

  async selectFolders(): Promise<ProjectFolder[]> {
    if (this.folders.length === 0) {
      await this.discoverFolders();
    }

    if (this.folders.length === 0) {
      console.log('❌ No folders found to scan');
      return [];
    }

    console.log('\n📂 Available Folders:\n');
    this.folders.forEach((folder, index) => {
      const fileCountStr = folder.fileCount ? ` (${folder.fileCount} files)` : '';
      console.log(`  ${index + 1}. ${folder.name.padEnd(20)} ${fileCountStr}`);
    });

    console.log('\n💡 Enter folder numbers to select (e.g., "1,2,4" or "all" or "1-3"):');

    const selection = await this.promptSelection();
    return this.parseSelection(selection);
  }

  private async promptSelection(): Promise<string> {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise(resolve => {
      rl.question('▶ Select folders: ', answer => {
        rl.close();
        resolve(answer.trim());
      });
    });
  }

  private parseSelection(input: string): ProjectFolder[] {
    if (!input) {
      console.log('❌ No selection made');
      return [];
    }

    if (input.toLowerCase() === 'all') {
      this.folders.forEach(f => (f.isSelected = true));
      return this.folders;
    }

    const selected: ProjectFolder[] = [];
    const parts = input.split(',').map(p => p.trim());

    for (const part of parts) {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(p => parseInt(p.trim(), 10));
        for (let i = start; i <= end; i++) {
          if (i > 0 && i <= this.folders.length) {
            const folder = this.folders[i - 1];
            folder.isSelected = true;
            if (!selected.includes(folder)) {
              selected.push(folder);
            }
          }
        }
      } else {
        const idx = parseInt(part, 10);
        if (idx > 0 && idx <= this.folders.length) {
          const folder = this.folders[idx - 1];
          folder.isSelected = true;
          if (!selected.includes(folder)) {
            selected.push(folder);
          }
        }
      }
    }

    return selected;
  }

  private countFiles(folderPath: string, maxCount = 1000): number {
    let count = 0;

    const traverse = (dir: string) => {
      if (count >= maxCount) return;

      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
          if (count >= maxCount) break;

          if (entry.isDirectory()) {
            if (!this.ignorePatterns.has(entry.name) && !entry.name.startsWith('.')) {
              traverse(path.join(dir, entry.name));
            }
          } else {
            count++;
          }
        }
      } catch {
        // Ignore errors
      }
    };

    traverse(folderPath);
    return Math.min(count, maxCount);
  }

  displaySelection(selected: ProjectFolder[]): void {
    if (selected.length === 0) {
      console.log('❌ No folders selected');
      return;
    }

    console.log(`\n✅ Selected ${selected.length} folder(s):\n`);
    selected.forEach(folder => {
      const fileCountStr = folder.fileCount ? ` • ${folder.fileCount} files` : '';
      console.log(`  • ${folder.name}${fileCountStr}`);
    });
  }
}
