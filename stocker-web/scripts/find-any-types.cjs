const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

// Counter for any types
const anyUsage = {
  explicit: [], // : any
  implicitFunction: [], // (param) without type
  implicitVariable: [], // let/const without type  
  functionReturn: [], // functions without return type
  asAny: [], // as any
  anyArray: [], // any[]
  genericAny: [], // <any>
  anyInProps: [], // props: any
};

// Pattern to find various 'any' usages
const patterns = {
  explicit: /:\s*any(?:\s|;|,|\)|\]|>|$)/g,
  asAny: /as\s+any/g,
  anyArray: /any\[\]/g,
  genericAny: /<any>/g,
  functionParam: /\(([^:)]+)\)\s*=>/g, // arrow functions without types
  functionDecl: /function\s+\w+\([^)]*\)\s*{/g, // function declarations without return type
  propAny: /\w+:\s*any/g,
};

function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const issues = [];
  
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    
    // Skip comments and imports
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('//') || 
        trimmedLine.startsWith('*') || 
        trimmedLine.startsWith('import ') ||
        trimmedLine.includes('// @ts-ignore') ||
        trimmedLine.includes('// @ts-nocheck')) {
      return;
    }
    
    // Check for explicit 'any'
    if (patterns.explicit.test(line)) {
      issues.push({
        type: 'explicit',
        line: lineNum,
        code: line.trim(),
        file: filePath
      });
    }
    
    // Check for 'as any'
    if (patterns.asAny.test(line)) {
      issues.push({
        type: 'asAny',
        line: lineNum,
        code: line.trim(),
        file: filePath
      });
    }
    
    // Check for 'any[]'
    if (patterns.anyArray.test(line)) {
      issues.push({
        type: 'anyArray',
        line: lineNum,
        code: line.trim(),
        file: filePath
      });
    }
    
    // Check for '<any>'
    if (patterns.genericAny.test(line)) {
      issues.push({
        type: 'genericAny',
        line: lineNum,
        code: line.trim(),
        file: filePath
      });
    }
  });
  
  return issues;
}

function findAnyTypes() {
  const srcPath = path.join(__dirname, '..', 'src');
  const patterns = [
    path.join(srcPath, '**', '*.ts'),
    path.join(srcPath, '**', '*.tsx')
  ];
  
  let totalFiles = 0;
  let filesWithAny = 0;
  let totalAnyUsages = 0;
  const fileIssues = {};
  
  patterns.forEach(pattern => {
    const files = glob.sync(pattern);
    
    files.forEach(file => {
      // Skip test files and type definition files
      if (file.includes('__tests__') || 
          file.includes('.test.') || 
          file.includes('.spec.') ||
          file.includes('.d.ts')) {
        return;
      }
      
      totalFiles++;
      const issues = analyzeFile(file);
      
      if (issues.length > 0) {
        filesWithAny++;
        totalAnyUsages += issues.length;
        fileIssues[file] = issues;
      }
    });
  });
  
  // Generate report
  console.log('\n' + colors.blue + '========================================');
  console.log('📊 TypeScript "any" Usage Report');
  console.log('========================================' + colors.reset);
  console.log(`Total files scanned: ${totalFiles}`);
  console.log(`Files with 'any': ${colors.yellow}${filesWithAny}${colors.reset}`);
  console.log(`Total 'any' usages: ${colors.red}${totalAnyUsages}${colors.reset}`);
  console.log('');
  
  // Group by type
  const byType = {
    explicit: [],
    asAny: [],
    anyArray: [],
    genericAny: []
  };
  
  Object.entries(fileIssues).forEach(([file, issues]) => {
    issues.forEach(issue => {
      byType[issue.type].push(issue);
    });
  });
  
  // Show summary by type
  console.log(colors.blue + 'Summary by Type:' + colors.reset);
  console.log(`  Explicit 'any' (: any): ${colors.yellow}${byType.explicit.length}${colors.reset}`);
  console.log(`  Type assertions (as any): ${colors.yellow}${byType.asAny.length}${colors.reset}`);
  console.log(`  Array types (any[]): ${colors.yellow}${byType.anyArray.length}${colors.reset}`);
  console.log(`  Generic any (<any>): ${colors.yellow}${byType.genericAny.length}${colors.reset}`);
  console.log('');
  
  // Show top 10 files with most issues
  const sortedFiles = Object.entries(fileIssues)
    .sort(([, a], [, b]) => b.length - a.length)
    .slice(0, 10);
  
  if (sortedFiles.length > 0) {
    console.log(colors.blue + 'Top 10 Files with Most "any" Usage:' + colors.reset);
    sortedFiles.forEach(([file, issues]) => {
      const relativePath = path.relative(process.cwd(), file);
      console.log(`  ${colors.yellow}${issues.length}${colors.reset} - ${relativePath}`);
    });
    console.log('');
  }
  
  // Show some examples
  if (totalAnyUsages > 0) {
    console.log(colors.blue + 'Examples of "any" Usage:' + colors.reset);
    const examples = [];
    Object.entries(fileIssues).forEach(([file, issues]) => {
      issues.slice(0, 2).forEach(issue => {
        examples.push(issue);
      });
    });
    
    examples.slice(0, 5).forEach(issue => {
      const relativePath = path.relative(process.cwd(), issue.file);
      console.log(`  ${relativePath}:${issue.line}`);
      console.log(`    ${colors.red}${issue.code}${colors.reset}`);
    });
  }
  
  // Write detailed report to file
  const reportPath = path.join(__dirname, '..', 'any-types-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(fileIssues, null, 2));
  console.log(`\n${colors.green}✅ Detailed report saved to: any-types-report.json${colors.reset}`);
  
  return {
    totalFiles,
    filesWithAny,
    totalAnyUsages,
    fileIssues
  };
}

// Check if glob is installed
try {
  require.resolve('glob');
  findAnyTypes();
} catch (error) {
  console.log('Installing glob package...');
  require('child_process').execSync('npm install glob', { stdio: 'inherit' });
  findAnyTypes();
}