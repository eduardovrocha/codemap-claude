/**
 * Type Definitions for Codemap System
 * Defines structures for codemaps, metadata, and context
 */

export interface CodeSymbol {
  name: string;
  type: 'class' | 'function' | 'interface' | 'type' | 'method' | 'constant' | 'module';
  line: number;
  description?: string;
}

export interface FileMetadata {
  path: string;
  extension: string;
  language: string;
  size: number;
  lines: number;
  imports: string[];
  exports: string[];
  symbols: CodeSymbol[];
  testFile: boolean;
}

export interface DirectoryNode {
  name: string;
  type: 'directory' | 'file';
  path: string;
  children?: DirectoryNode[];
}

export interface FolderStatistics {
  totalFiles: number;
  totalLines: number;
  totalSymbols: number;
  testFiles: number;
  languages: Record<string, number>;
}

export interface FolderCodemap {
  timestamp: string;
  folderPath: string;
  projectRoot: string;
  relativePath: string;
  statistics: FolderStatistics;
  files: FileMetadata[];
  structure: DirectoryNode;
  metadata: {
    generatedBy: string;
    version: string;
  };
}

export interface RouterContext {
  codemap?: FolderCodemap;
  relevantFiles?: FileMetadata[];
  detectedFrameworks?: string[];
  moduleDensity?: number;
}

export interface SkillContext {
  codemap?: FolderCodemap;
  folderPath: string;
  frameworks: string[];
  language: string;
}

export interface RoutingDecision {
  model: 'haiku' | 'sonnet' | 'opus';
  confidence: number;
  reasoning: string;
  context?: RouterContext;
}
