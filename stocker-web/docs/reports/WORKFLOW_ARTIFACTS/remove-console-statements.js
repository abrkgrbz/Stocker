#!/usr/bin/env node
/**
 * Project Phoenix - Console Statement Removal Tool
 * Removes all console.* statements from TypeScript/JavaScript files
 * Usage: node remove-console-statements.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Parse arguments
const isDryRun = process.argv.includes('--dry-run');
const verbose = process.argv.includes('--verbose');

// Console statement patterns to remove
const consolePatterns = [
  /console\.(log|info|debug|warn|error|trace|group|groupEnd|time|timeEnd|assert|clear|count|dir|dirxml|profile|profileEnd|table)\([^)]*\);?\n?/g,
  /console\.\w+\([^)]*\)[,;]?\s*\/\/.*$/gm, // Console with inline comments
  /console\.\w+\(`[^`]*`\);?\n?/g, // Template literals
  /console\.\w+\([^;]+\);?\n?/g, // Multi-line console statements
];

// Files to process
const filePatterns = [
  'src/**/*.ts',
  'src/**/*.tsx',
  'src/**/*.js',
  'src/**/*.jsx',
];

// Files to exclude
const excludePatterns = [
  '**/node_modules/**',
  '**/dist/**',
  '**/build/**',
  '**/*.test.*',
  '**/*.spec.*',
  '**/test-utils/**',
  '**/setupTests.*',
];

class ConsoleRemover {
  constructor() {
    this.filesProcessed = 0;
    this.filesModified = 0;
    this.statementsRemoved = 0;
    this.errors = [];
  }

  /**
   * Get all files matching patterns
   */
  getFiles() {
    const files = new Set();
    
    filePatterns.forEach(pattern => {
      glob.sync(pattern, { 
        ignore: excludePatterns,
        nodir: true 
      }).forEach(file => files.add(file));
    });
    
    return Array.from(files);
  }

  /**
   * Remove console statements from content
   */
  removeConsoleStatements(content, filePath) {
    let modified = content;
    let count = 0;
    
    consolePatterns.forEach(pattern => {
      const matches = modified.match(pattern);
      if (matches) {
        count += matches.length;
        modified = modified.replace(pattern, '');
      }
    });

    // Clean up multiple empty lines
    modified = modified.replace(/\n\n\n+/g, '\n\n');
    
    // Clean up trailing whitespace
    modified = modified.replace(/[ \t]+$/gm, '');
    
    if (verbose && count > 0) {
      console.log(`  📝 ${filePath}: Removed ${count} console statement(s)`);
    }
    
    return { modified, count };
  }

  /**
   * Process a single file
   */
  processFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const { modified, count } = this.removeConsoleStatements(content, filePath);
      
      if (count > 0) {
        if (!isDryRun) {
          // Create backup
          const backupPath = `${filePath}.backup`;
          fs.writeFileSync(backupPath, content);
          
          // Write modified content
          fs.writeFileSync(filePath, modified);
          
          // Remove backup after successful write
          fs.unlinkSync(backupPath);
        }
        
        this.filesModified++;
        this.statementsRemoved += count;
      }
      
      this.filesProcessed++;
      
    } catch (error) {
      this.errors.push({ file: filePath, error: error.message });
    }
  }

  /**
   * Run the console removal process
   */
  run() {
    console.log('🧹 Console Statement Removal Tool');
    console.log('==================================');
    
    if (isDryRun) {
      console.log('🔍 Running in DRY RUN mode (no files will be modified)');
    }
    
    const files = this.getFiles();
    console.log(`📁 Found ${files.length} files to process\n`);
    
    // Process each file
    files.forEach(file => this.processFile(file));
    
    // Print summary
    this.printSummary();
  }

  /**
   * Print execution summary
   */
  printSummary() {
    console.log('\n==================================');
    console.log('📊 Summary');
    console.log('==================================');
    console.log(`✅ Files processed: ${this.filesProcessed}`);
    console.log(`📝 Files modified: ${this.filesModified}`);
    console.log(`🗑️  Console statements removed: ${this.statementsRemoved}`);
    
    if (this.errors.length > 0) {
      console.log(`\n❌ Errors (${this.errors.length}):`);
      this.errors.forEach(({ file, error }) => {
        console.log(`  - ${file}: ${error}`);
      });
    }
    
    if (isDryRun) {
      console.log('\n⚠️  DRY RUN: No files were actually modified');
      console.log('Run without --dry-run to apply changes');
    }
  }

  /**
   * Generate detailed report
   */
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      mode: isDryRun ? 'dry-run' : 'production',
      statistics: {
        filesProcessed: this.filesProcessed,
        filesModified: this.filesModified,
        statementsRemoved: this.statementsRemoved,
      },
      errors: this.errors,
    };
    
    fs.writeFileSync(
      'console-removal-report.json',
      JSON.stringify(report, null, 2)
    );
    
    console.log('\n📄 Detailed report saved to console-removal-report.json');
  }
}

// Additional utility to check for remaining console statements
function auditRemainingConsoles() {
  console.log('\n🔍 Auditing for remaining console statements...');
  
  const files = glob.sync('src/**/*.{ts,tsx,js,jsx}', {
    ignore: excludePatterns,
  });
  
  let remaining = 0;
  const filesWithConsole = [];
  
  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const matches = content.match(/console\.\w+\(/g);
    
    if (matches && matches.length > 0) {
      remaining += matches.length;
      filesWithConsole.push({
        file,
        count: matches.length,
      });
    }
  });
  
  if (remaining > 0) {
    console.log(`⚠️  Found ${remaining} remaining console statements in ${filesWithConsole.length} files:`);
    filesWithConsole.forEach(({ file, count }) => {
      console.log(`  - ${file}: ${count} statement(s)`);
    });
  } else {
    console.log('✅ No console statements found!');
  }
}

// Check if glob is installed
try {
  require.resolve('glob');
} catch (e) {
  console.error('❌ Error: glob package is required');
  console.log('Please run: npm install -g glob');
  process.exit(1);
}

// Main execution
if (require.main === module) {
  const remover = new ConsoleRemover();
  remover.run();
  remover.generateReport();
  
  if (!isDryRun) {
    // Run audit after removal
    auditRemainingConsoles();
  }
}

module.exports = ConsoleRemover;