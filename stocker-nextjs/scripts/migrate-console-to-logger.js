#!/usr/bin/env node

/**
 * Migration script to replace console.* statements with logger calls
 * Usage: node scripts/migrate-console-to-logger.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Parse arguments
const dryRun = process.argv.includes('--dry-run');

// Patterns to replace
const replacements = [
  {
    pattern: /console\.log\((.*?)\);?$/gm,
    replacement: (match, args) => {
      // Check if it's a simple string or complex expression
      if (args.startsWith('"') || args.startsWith("'") || args.startsWith('`')) {
        return `logger.info(${args});`;
      } else if (args.includes('error') || args.includes('Error')) {
        return `logger.error('Error occurred', ${args});`;
      } else {
        return `logger.debug(${args});`;
      }
    },
    importNeeded: true
  },
  {
    pattern: /console\.error\((.*?)\);?$/gm,
    replacement: (match, args) => {
      // Check if there's an error object
      const argsArray = args.split(',').map(a => a.trim());
      if (argsArray.length > 1) {
        return `logger.error(${argsArray[0]}, ${argsArray.slice(1).join(', ')});`;
      } else {
        return `logger.error(${args});`;
      }
    },
    importNeeded: true
  },
  {
    pattern: /console\.warn\((.*?)\);?$/gm,
    replacement: (match, args) => `logger.warn(${args});`,
    importNeeded: true
  },
  {
    pattern: /console\.info\((.*?)\);?$/gm,
    replacement: (match, args) => `logger.info(${args});`,
    importNeeded: true
  },
  {
    pattern: /console\.debug\((.*?)\);?$/gm,
    replacement: (match, args) => `logger.debug(${args});`,
    importNeeded: true
  },
  {
    pattern: /console\.time\((.*?)\);?$/gm,
    replacement: (match, args) => `logger.time(${args});`,
    importNeeded: true
  },
  {
    pattern: /console\.timeEnd\((.*?)\);?$/gm,
    replacement: (match, args) => `logger.timeEnd(${args});`,
    importNeeded: true
  },
  {
    pattern: /console\.table\((.*?)\);?$/gm,
    replacement: (match, args) => `logger.table(${args});`,
    importNeeded: true
  },
  {
    pattern: /console\.group\((.*?)\);?$/gm,
    replacement: (match, args) => `logger.group(${args});`,
    importNeeded: true
  },
  {
    pattern: /console\.groupEnd\(\);?$/gm,
    replacement: () => `logger.groupEnd();`,
    importNeeded: true
  }
];

// Files to process
const patterns = [
  'src/**/*.ts',
  'src/**/*.tsx',
  'src/**/*.js',
  'src/**/*.jsx',
  '!src/lib/utils/logger.ts', // Exclude the logger file itself
  '!node_modules/**',
  '!.next/**',
  '!out/**',
  '!dist/**'
];

// Find all files matching the patterns
const files = glob.sync(patterns.join(',').split(',')[0], {
  ignore: patterns.filter(p => p.startsWith('!')).map(p => p.slice(1))
});

console.log(`Found ${files.length} files to process`);
if (dryRun) {
  console.log('Running in DRY RUN mode - no files will be modified');
}

let totalReplacements = 0;
const filesModified = [];

files.forEach(file => {
  const filePath = path.resolve(file);
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  let fileReplacements = 0;

  // Skip if file already imports logger
  const hasLoggerImport = content.includes("from '@/lib/utils/logger'") ||
                          content.includes('from "@/lib/utils/logger"') ||
                          content.includes("from '../lib/utils/logger'") ||
                          content.includes("from '../../lib/utils/logger'");

  // Apply replacements
  replacements.forEach(({ pattern, replacement }) => {
    const matches = content.match(pattern);
    if (matches) {
      content = content.replace(pattern, replacement);
      modified = true;
      fileReplacements += matches.length;
    }
  });

  // Add import if needed and file was modified
  if (modified && !hasLoggerImport) {
    // Determine the correct import path based on file location
    const fileDir = path.dirname(filePath);
    const relativeToSrc = path.relative(fileDir, path.join(process.cwd(), 'src/lib/utils/logger'));
    const importPath = relativeToSrc.startsWith('.') ?
      relativeToSrc.replace(/\\/g, '/').replace(/\.ts$/, '') :
      '@/lib/utils/logger';

    // Find the right place to add import
    const importRegex = /^import\s+.*?from\s+['"].*?['"];?\s*$/m;
    const lastImport = content.match(/^import\s+.*?from\s+['"].*?['"];?\s*$/gm);

    if (lastImport && lastImport.length > 0) {
      // Add after the last import
      const lastImportLine = lastImport[lastImport.length - 1];
      content = content.replace(
        lastImportLine,
        `${lastImportLine}\nimport logger from '${importPath}';`
      );
    } else {
      // Add at the beginning of the file
      const useClientRegex = /^['"]use client['"];?\s*$/m;
      if (useClientRegex.test(content)) {
        // If there's a "use client" directive, add after it
        content = content.replace(
          useClientRegex,
          `'use client';\n\nimport logger from '${importPath}';`
        );
      } else {
        // Add at the very beginning
        content = `import logger from '${importPath}';\n\n${content}`;
      }
    }
  }

  if (modified) {
    filesModified.push({ file, replacements: fileReplacements });
    totalReplacements += fileReplacements;

    if (!dryRun) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Modified ${file} (${fileReplacements} replacements)`);
    } else {
      console.log(`Would modify ${file} (${fileReplacements} replacements)`);
    }
  }
});

// Summary
console.log('\n=== Migration Summary ===');
console.log(`Total files processed: ${files.length}`);
console.log(`Files modified: ${filesModified.length}`);
console.log(`Total replacements: ${totalReplacements}`);

if (filesModified.length > 0) {
  console.log('\nModified files:');
  filesModified.forEach(({ file, replacements }) => {
    console.log(`  - ${file} (${replacements} replacements)`);
  });
}

if (dryRun) {
  console.log('\n⚠️  This was a dry run. To apply changes, run without --dry-run flag');
} else if (filesModified.length > 0) {
  console.log('\n✨ Migration completed successfully!');
  console.log('Next steps:');
  console.log('1. Review the changes in your code');
  console.log('2. Test the application to ensure everything works');
  console.log('3. Configure Sentry DSN in your .env file for production');
}