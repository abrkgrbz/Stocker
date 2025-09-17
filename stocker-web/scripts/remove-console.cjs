const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Counter for removed console statements
let removedCount = 0;
const filesModified = new Set();

// Function to remove console statements
function removeConsoleStatements(content, filePath) {
  let modified = false;
  let newContent = content;
  
  // Patterns to match console statements
  const patterns = [
    // Simple console statements
    /console\.(log|info|debug|warn|error)\([^)]*\);?/g,
    // Multi-line console statements
    /console\.(log|info|debug|warn|error)\([^)]*\n[^)]*\);?/gm,
    // Console statements with template literals
    /console\.(log|info|debug|warn|error)\(`[^`]*`\);?/g,
    // Console statements with multiple arguments
    /console\.(log|info|debug|warn|error)\([^)]*,\s*[^)]*\);?/g
  ];
  
  patterns.forEach(pattern => {
    const matches = newContent.match(pattern);
    if (matches) {
      matches.forEach(match => {
        // Skip if it's in a comment
        const lineStart = newContent.lastIndexOf('\n', newContent.indexOf(match));
        const lineEnd = newContent.indexOf('\n', newContent.indexOf(match));
        const line = newContent.substring(lineStart, lineEnd);
        
        if (!line.includes('//') || line.indexOf('//') > line.indexOf(match)) {
          newContent = newContent.replace(match, '');
          removedCount++;
          modified = true;
        }
      });
    }
  });
  
  // Clean up empty lines left behind
  newContent = newContent.replace(/^\s*\n/gm, '');
  newContent = newContent.replace(/\n\s*\n\s*\n/g, '\n\n');
  
  if (modified) {
    filesModified.add(filePath);
  }
  
  return newContent;
}

// Process files
function processFiles() {
  const srcPath = path.join(__dirname, '..', 'src');
  const patterns = [
    path.join(srcPath, '**', '*.ts'),
    path.join(srcPath, '**', '*.tsx')
  ];
  
  let totalFiles = 0;
  
  patterns.forEach(pattern => {
    const files = glob.sync(pattern);
    
    files.forEach(file => {
      // Skip test files and logger utilities
      if (file.includes('__tests__') || 
          file.includes('.test.') || 
          file.includes('.spec.') ||
          file.includes('/logger.ts') ||
          file.includes('/utils/logger.ts')) {
        return;
      }
      
      totalFiles++;
      
      try {
        const content = fs.readFileSync(file, 'utf8');
        const newContent = removeConsoleStatements(content, file);
        
        if (content !== newContent) {
          fs.writeFileSync(file, newContent, 'utf8');
          console.log(`✅ Processed: ${path.relative(process.cwd(), file)}`);
        }
      } catch (error) {
        console.error(`❌ Error processing ${file}:`, error.message);
      }
    });
  });
  
  console.log('\n========================================');
  console.log('📊 Console Statement Removal Summary');
  console.log('========================================');
  console.log(`Total files scanned: ${totalFiles}`);
  console.log(`Files modified: ${filesModified.size}`);
  console.log(`Console statements removed: ${removedCount}`);
  console.log('========================================\n');
  
  if (filesModified.size > 0) {
    console.log('Modified files:');
    filesModified.forEach(file => {
      console.log(`  - ${path.relative(process.cwd(), file)}`);
    });
  }
}

// Check if glob is installed
try {
  require.resolve('glob');
  processFiles();
} catch (error) {
  console.log('Installing glob package...');
  require('child_process').execSync('npm install glob', { stdio: 'inherit' });
  processFiles();
}