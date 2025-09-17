const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

// Accessibility issues tracker
const issues = {
  missingAria: [],
  missingAlt: [],
  emptyButtons: [],
  missingLabels: [],
  noKeyboardHandlers: [],
  colorContrastIssues: [],
  missingRoles: [],
  headingOrder: [],
  formIssues: [],
  focusIssues: []
};

// Patterns to check
const patterns = {
  // Images without alt
  imgWithoutAlt: /<img(?![^>]*\balt\s*=)[^>]*>/gi,
  
  // Buttons without text or aria-label
  emptyButton: /<button[^>]*>[\s]*<\/button>/gi,
  buttonWithOnlyIcon: /<button[^>]*>\s*<[^>]+Icon[^>]*\/>\s*<\/button>/gi,
  
  // Form inputs without labels
  inputWithoutLabel: /<input(?![^>]*\baria-label)[^>]*>/gi,
  
  // onClick without keyboard handler
  onClickOnly: /onClick\s*=\s*{[^}]*}(?!.*onKeyDown)/gi,
  
  // Divs with onClick (should be buttons)
  clickableDiv: /<div[^>]*onClick/gi,
  
  // Missing ARIA attributes
  modalWithoutRole: /<Modal(?![^>]*\brole\s*=)/gi,
  
  // Color only information
  colorOnly: /color:\s*['"]?(red|green|#[0-9a-f]{3,6}|rgb)['"]?(?!.*aria-label)/gi,
  
  // Missing semantic HTML
  divAsList: /<div[^>]*className\s*=\s*["'][^"']*list[^"']*["'][^>]*>/gi,
  
  // Focus management
  autoFocus: /autoFocus/gi,
  tabIndex: /tabIndex\s*=\s*["']?-1["']?/gi
};

function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const fileIssues = [];
  
  // Check for images without alt text
  const imgMatches = content.match(patterns.imgWithoutAlt);
  if (imgMatches) {
    imgMatches.forEach(match => {
      const lineNum = getLineNumber(content, match);
      fileIssues.push({
        type: 'missingAlt',
        line: lineNum,
        code: match.trim(),
        file: filePath,
        severity: 'error',
        message: 'Image missing alt attribute'
      });
    });
  }
  
  // Check for empty buttons
  const emptyButtonMatches = content.match(patterns.emptyButton);
  if (emptyButtonMatches) {
    emptyButtonMatches.forEach(match => {
      const lineNum = getLineNumber(content, match);
      fileIssues.push({
        type: 'emptyButtons',
        line: lineNum,
        code: match.trim(),
        file: filePath,
        severity: 'error',
        message: 'Button without accessible text'
      });
    });
  }
  
  // Check for icon-only buttons without aria-label
  const iconButtonMatches = content.match(patterns.buttonWithOnlyIcon);
  if (iconButtonMatches) {
    iconButtonMatches.forEach(match => {
      if (!match.includes('aria-label')) {
        const lineNum = getLineNumber(content, match);
        fileIssues.push({
          type: 'emptyButtons',
          line: lineNum,
          code: match.trim(),
          file: filePath,
          severity: 'error',
          message: 'Icon button missing aria-label'
        });
      }
    });
  }
  
  // Check for inputs without labels
  lines.forEach((line, index) => {
    if (line.includes('<input') || line.includes('<Input')) {
      if (!line.includes('aria-label') && 
          !line.includes('aria-labelledby') && 
          !line.includes('placeholder')) {
        const prevLines = lines.slice(Math.max(0, index - 3), index).join('\n');
        const nextLines = lines.slice(index + 1, Math.min(lines.length, index + 3)).join('\n');
        
        if (!prevLines.includes('<label') && !prevLines.includes('<Form.Item')) {
          fileIssues.push({
            type: 'missingLabels',
            line: index + 1,
            code: line.trim(),
            file: filePath,
            severity: 'error',
            message: 'Input without label or aria-label'
          });
        }
      }
    }
    
    // Check for onClick without keyboard handler
    if (line.includes('onClick') && !line.includes('button') && !line.includes('Button')) {
      const hasKeyHandler = line.includes('onKeyDown') || 
                           line.includes('onKeyPress') || 
                           line.includes('onKeyUp');
      
      if (!hasKeyHandler) {
        fileIssues.push({
          type: 'noKeyboardHandlers',
          line: index + 1,
          code: line.trim(),
          file: filePath,
          severity: 'warning',
          message: 'Interactive element missing keyboard handler'
        });
      }
    }
    
    // Check for non-semantic clickable divs
    if (line.includes('<div') && line.includes('onClick')) {
      fileIssues.push({
        type: 'missingRoles',
        line: index + 1,
        code: line.trim(),
        file: filePath,
        severity: 'warning',
        message: 'Clickable div should be a button or have role="button"'
      });
    }
    
    // Check for tabIndex="-1"
    if (line.includes('tabIndex={-1}') || line.includes('tabIndex="-1"')) {
      fileIssues.push({
        type: 'focusIssues',
        line: index + 1,
        code: line.trim(),
        file: filePath,
        severity: 'warning',
        message: 'Element removed from tab order - verify if intentional'
      });
    }
  });
  
  return fileIssues;
}

function getLineNumber(content, match) {
  const index = content.indexOf(match);
  if (index === -1) return 1;
  
  return content.substring(0, index).split('\n').length;
}

function runAudit() {
  console.log('\n' + colors.blue + '========================================');
  console.log('♿ Accessibility Audit Report');
  console.log('========================================' + colors.reset);
  
  const srcPath = path.join(__dirname, '..', 'src');
  const patterns = [
    path.join(srcPath, '**', '*.tsx'),
    path.join(srcPath, '**', '*.jsx')
  ];
  
  let totalFiles = 0;
  let filesWithIssues = 0;
  let totalIssues = 0;
  const allIssues = [];
  
  patterns.forEach(pattern => {
    const files = glob.sync(pattern);
    
    files.forEach(file => {
      // Skip test files
      if (file.includes('__tests__') || 
          file.includes('.test.') || 
          file.includes('.spec.')) {
        return;
      }
      
      totalFiles++;
      const fileIssues = analyzeFile(file);
      
      if (fileIssues.length > 0) {
        filesWithIssues++;
        totalIssues += fileIssues.length;
        allIssues.push(...fileIssues);
        
        // Group issues by type
        fileIssues.forEach(issue => {
          if (issues[issue.type]) {
            issues[issue.type].push(issue);
          }
        });
      }
    });
  });
  
  // Display summary
  console.log(`\nFiles scanned: ${totalFiles}`);
  console.log(`Files with issues: ${colors.yellow}${filesWithIssues}${colors.reset}`);
  console.log(`Total issues found: ${colors.red}${totalIssues}${colors.reset}\n`);
  
  // Display issues by type
  console.log(colors.cyan + 'Issues by Type:' + colors.reset);
  
  const issueTypes = [
    { key: 'missingAlt', label: '🖼️  Missing alt text', severity: 'error' },
    { key: 'emptyButtons', label: '🔘 Empty buttons', severity: 'error' },
    { key: 'missingLabels', label: '📝 Missing form labels', severity: 'error' },
    { key: 'noKeyboardHandlers', label: '⌨️  Missing keyboard support', severity: 'warning' },
    { key: 'missingRoles', label: '🏷️  Missing ARIA roles', severity: 'warning' },
    { key: 'focusIssues', label: '🎯 Focus management issues', severity: 'warning' }
  ];
  
  issueTypes.forEach(({ key, label, severity }) => {
    if (issues[key].length > 0) {
      const color = severity === 'error' ? colors.red : colors.yellow;
      console.log(`  ${label}: ${color}${issues[key].length}${colors.reset}`);
    }
  });
  
  // Show examples of critical issues
  if (totalIssues > 0) {
    console.log('\n' + colors.magenta + 'Critical Issues to Fix:' + colors.reset);
    
    const criticalIssues = allIssues
      .filter(issue => issue.severity === 'error')
      .slice(0, 10);
    
    criticalIssues.forEach(issue => {
      const relativePath = path.relative(process.cwd(), issue.file);
      console.log(`\n  ${colors.red}●${colors.reset} ${relativePath}:${issue.line}`);
      console.log(`    ${issue.message}`);
      console.log(`    ${colors.yellow}${issue.code.substring(0, 80)}...${colors.reset}`);
    });
  }
  
  // Generate detailed report
  const reportPath = path.join(__dirname, '..', 'accessibility-report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    summary: {
      filesScanned: totalFiles,
      filesWithIssues,
      totalIssues,
      timestamp: new Date().toISOString()
    },
    issues: allIssues,
    byType: issues
  }, null, 2));
  
  console.log(`\n${colors.green}✅ Detailed report saved to: accessibility-report.json${colors.reset}`);
  
  // Provide recommendations
  console.log('\n' + colors.blue + 'Recommendations:' + colors.reset);
  console.log('1. Add aria-label to all icon-only buttons');
  console.log('2. Ensure all form inputs have associated labels');
  console.log('3. Add keyboard handlers to all interactive elements');
  console.log('4. Use semantic HTML (button instead of clickable div)');
  console.log('5. Provide alt text for all informational images');
  console.log('6. Test with screen readers (NVDA, JAWS, VoiceOver)');
  
  return {
    totalFiles,
    filesWithIssues,
    totalIssues,
    issues: allIssues
  };
}

// Check if glob is installed
try {
  require.resolve('glob');
  runAudit();
} catch (error) {
  console.log('Installing glob package...');
  require('child_process').execSync('npm install glob', { stdio: 'inherit' });
  runAudit();
}