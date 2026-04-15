#!/usr/bin/env node

/**
 * CLI Entry Point for claude-codemap
 * Usage:
 *   claude-codemap                    # Interactive mode
 *   claude-codemap app,src,client     # Direct mode with multiple folders
 *   claude-codemap app                # Single folder
 */

import { CodemapCLI } from './codemap';

const projectRoot = process.cwd();
const folderArg = process.argv[2];

const cli = new CodemapCLI(projectRoot);

cli.run(folderArg).catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
