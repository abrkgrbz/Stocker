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

// Track fixes
let totalFixes = 0;
let filesFixed = 0;
const fixLog = [];

/**
 * Fix icon-only buttons by adding aria-label
 */
function fixIconButtons(content, filePath) {
  let fixed = false;
  let updatedContent = content;

  // Pattern 1: Button with only icon component inside
  const iconButtonPattern = /(<button[^>]*>)\s*(<[^>]+(Icon|icon)[^>]*\/?>)\s*(<\/button>)/g;
  updatedContent = updatedContent.replace(iconButtonPattern, (match, openTag, icon, closeTag) => {
    if (!openTag.includes('aria-label')) {
      // Try to extract icon name for aria-label
      const iconNameMatch = icon.match(/(name|type)={?["']([^"']+)["']}/);
      const iconComponentMatch = icon.match(/<(\w+Icon)/);
      
      let ariaLabel = 'button';
      if (iconNameMatch) {
        ariaLabel = iconNameMatch[2].replace(/-/g, ' ').toLowerCase();
      } else if (iconComponentMatch) {
        ariaLabel = iconComponentMatch[1]
          .replace(/Icon$/, '')
          .replace(/([A-Z])/g, ' $1')
          .trim()
          .toLowerCase();
      }
      
      fixed = true;
      totalFixes++;
      const newOpenTag = openTag.slice(0, -1) + ` aria-label="${ariaLabel}">`;
      
      fixLog.push({
        file: filePath,
        type: 'icon-button',
        original: match,
        fixed: newOpenTag + icon + closeTag
      });
      
      return newOpenTag + icon + closeTag;
    }
    return match;
  });

  // Pattern 2: Ant Design Button with icon prop
  const antButtonPattern = /(<Button[^>]*icon={[^}]+}[^>]*)(\/?>)/g;
  updatedContent = updatedContent.replace(antButtonPattern, (match, buttonTag, closing) => {
    if (!buttonTag.includes('aria-label') && !buttonTag.includes('children')) {
      // Extract icon name
      const iconMatch = buttonTag.match(/icon={<(\w+)/);
      let ariaLabel = 'button';
      
      if (iconMatch) {
        ariaLabel = iconMatch[1]
          .replace(/Icon$/, '')
          .replace(/([A-Z])/g, ' $1')
          .trim()
          .toLowerCase();
      }
      
      fixed = true;
      totalFixes++;
      
      fixLog.push({
        file: filePath,
        type: 'antd-icon-button',
        original: match,
        fixed: buttonTag + ` aria-label="${ariaLabel}"` + closing
      });
      
      return buttonTag + ` aria-label="${ariaLabel}"` + closing;
    }
    return match;
  });

  return { content: updatedContent, fixed };
}

/**
 * Fix inputs without labels by adding aria-label
 */
function fixInputsWithoutLabels(content, filePath) {
  let fixed = false;
  let updatedContent = content;

  // Pattern for input elements
  const inputPattern = /(<[Ii]nput[^>]*)(\/?>)/g;
  updatedContent = updatedContent.replace(inputPattern, (match, inputTag, closing) => {
    if (!inputTag.includes('aria-label') && 
        !inputTag.includes('aria-labelledby') && 
        !inputTag.includes('type="hidden"') &&
        !inputTag.includes('type={["\'`]hidden["\'`]}')) {
      
      // Try to extract placeholder or name for aria-label
      const placeholderMatch = inputTag.match(/placeholder={?["']([^"']+)["']}/);
      const nameMatch = inputTag.match(/name={?["']([^"']+)["']}/);
      const idMatch = inputTag.match(/id={?["']([^"']+)["']}/);
      
      let ariaLabel = 'input field';
      if (placeholderMatch) {
        ariaLabel = placeholderMatch[1];
      } else if (nameMatch) {
        ariaLabel = nameMatch[1].replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim().toLowerCase();
      } else if (idMatch) {
        ariaLabel = idMatch[1].replace(/([A-Z])/g, ' $1').replace(/[-_]/g, ' ').trim().toLowerCase();
      }
      
      fixed = true;
      totalFixes++;
      
      fixLog.push({
        file: filePath,
        type: 'input-label',
        original: match,
        fixed: inputTag + ` aria-label="${ariaLabel}"` + closing
      });
      
      return inputTag + ` aria-label="${ariaLabel}"` + closing;
    }
    return match;
  });

  // Pattern for Select elements
  const selectPattern = /(<[Ss]elect[^>]*)(>)/g;
  updatedContent = updatedContent.replace(selectPattern, (match, selectTag, closing) => {
    if (!selectTag.includes('aria-label') && !selectTag.includes('aria-labelledby')) {
      const placeholderMatch = selectTag.match(/placeholder={?["']([^"']+)["']}/);
      let ariaLabel = placeholderMatch ? placeholderMatch[1] : 'select field';
      
      fixed = true;
      totalFixes++;
      
      fixLog.push({
        file: filePath,
        type: 'select-label',
        original: match,
        fixed: selectTag + ` aria-label="${ariaLabel}"` + closing
      });
      
      return selectTag + ` aria-label="${ariaLabel}"` + closing;
    }
    return match;
  });

  return { content: updatedContent, fixed };
}

/**
 * Fix clickable divs by adding role="button" and keyboard handler
 */
function fixClickableDivs(content, filePath) {
  let fixed = false;
  let updatedContent = content;

  // Pattern for divs with onClick
  const clickableDivPattern = /(<div[^>]*onClick={[^}]+}[^>]*)(>)/g;
  updatedContent = updatedContent.replace(clickableDivPattern, (match, divTag, closing) => {
    let needsFix = false;
    let additions = '';
    
    if (!divTag.includes('role=')) {
      additions += ' role="button"';
      needsFix = true;
    }
    
    if (!divTag.includes('tabIndex')) {
      additions += ' tabIndex={0}';
      needsFix = true;
    }
    
    if (!divTag.includes('onKeyDown') && !divTag.includes('onKeyPress')) {
      // Extract onClick handler name
      const onClickMatch = divTag.match(/onClick={([^}]+)}/);
      if (onClickMatch) {
        const handler = onClickMatch[1];
        additions += ` onKeyDown={(e) => e.key === 'Enter' && ${handler}(e)}`;
        needsFix = true;
      }
    }
    
    if (needsFix) {
      fixed = true;
      totalFixes++;
      
      fixLog.push({
        file: filePath,
        type: 'clickable-div',
        original: match,
        fixed: divTag + additions + closing
      });
      
      return divTag + additions + closing;
    }
    return match;
  });

  return { content: updatedContent, fixed };
}

/**
 * Fix images without alt text
 */
function fixImagesWithoutAlt(content, filePath) {
  let fixed = false;
  let updatedContent = content;

  const imgPattern = /(<img[^>]*)(\/?>)/g;
  updatedContent = updatedContent.replace(imgPattern, (match, imgTag, closing) => {
    if (!imgTag.includes('alt=')) {
      // Try to extract src filename for alt text
      const srcMatch = imgTag.match(/src={?["']([^"']+)["']}/);
      let altText = 'image';
      
      if (srcMatch) {
        const filename = path.basename(srcMatch[1], path.extname(srcMatch[1]));
        altText = filename.replace(/[-_]/g, ' ').toLowerCase();
      }
      
      // Check if it's a decorative image (icon, logo, etc.)
      if (imgTag.includes('icon') || imgTag.includes('logo') || imgTag.includes('decoration')) {
        altText = ''; // Empty alt for decorative images
      }
      
      fixed = true;
      totalFixes++;
      
      fixLog.push({
        file: filePath,
        type: 'img-alt',
        original: match,
        fixed: imgTag + ` alt="${altText}"` + closing
      });
      
      return imgTag + ` alt="${altText}"` + closing;
    }
    return match;
  });

  return { content: updatedContent, fixed };
}

/**
 * Add skip navigation link
 */
function addSkipNavigation(content, filePath) {
  // Only add to App.tsx or main layout file
  if (!filePath.includes('App.tsx') && !filePath.includes('Layout.tsx')) {
    return { content, fixed: false };
  }

  if (content.includes('skip-navigation')) {
    return { content, fixed: false };
  }

  // Find the first return statement with JSX
  const returnMatch = content.match(/return\s*\(\s*(<)/);
  if (returnMatch) {
    const insertIndex = content.indexOf(returnMatch[1], returnMatch.index);
    const skipNav = `
      <>
        <a 
          href="#main-content" 
          className="skip-navigation"
          style={{
            position: 'absolute',
            left: '-9999px',
            top: '20px',
            zIndex: 999,
            padding: '8px',
            backgroundColor: '#000',
            color: '#fff',
            textDecoration: 'none'
          }}
          onFocus={(e) => {
            e.currentTarget.style.left = '20px';
          }}
          onBlur={(e) => {
            e.currentTarget.style.left = '-9999px';
          }}
        >
          Skip to main content
        </a>`;
    
    const updatedContent = content.slice(0, insertIndex) + skipNav + '\n        ' + content.slice(insertIndex);
    
    // Also need to close the fragment
    const lastReturnClose = updatedContent.lastIndexOf(')');
    const finalContent = updatedContent.slice(0, lastReturnClose) + '\n      </>' + updatedContent.slice(lastReturnClose);
    
    totalFixes++;
    filesFixed++;
    
    fixLog.push({
      file: filePath,
      type: 'skip-navigation',
      original: 'No skip navigation',
      fixed: 'Added skip navigation link'
    });
    
    return { content: finalContent, fixed: true };
  }

  return { content, fixed: false };
}

/**
 * Process a single file
 */
function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let updatedContent = content;
  let fileWasFixed = false;

  // Apply fixes
  const iconButtonFix = fixIconButtons(updatedContent, filePath);
  if (iconButtonFix.fixed) {
    updatedContent = iconButtonFix.content;
    fileWasFixed = true;
  }

  const inputLabelFix = fixInputsWithoutLabels(updatedContent, filePath);
  if (inputLabelFix.fixed) {
    updatedContent = inputLabelFix.content;
    fileWasFixed = true;
  }

  const clickableDivFix = fixClickableDivs(updatedContent, filePath);
  if (clickableDivFix.fixed) {
    updatedContent = clickableDivFix.content;
    fileWasFixed = true;
  }

  const imgAltFix = fixImagesWithoutAlt(updatedContent, filePath);
  if (imgAltFix.fixed) {
    updatedContent = imgAltFix.content;
    fileWasFixed = true;
  }

  const skipNavFix = addSkipNavigation(updatedContent, filePath);
  if (skipNavFix.fixed) {
    updatedContent = skipNavFix.content;
    fileWasFixed = true;
  }

  // Write updated content if changes were made
  if (fileWasFixed) {
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    filesFixed++;
    return true;
  }

  return false;
}

/**
 * Main execution
 */
function fixAccessibilityIssues() {
  console.log('\n' + colors.blue + '========================================');
  console.log('♿ Accessibility Auto-Fix Tool');
  console.log('========================================' + colors.reset);

  const srcPath = path.join(__dirname, '..', 'src');
  const patterns = [
    path.join(srcPath, '**', '*.tsx'),
    path.join(srcPath, '**', '*.jsx')
  ];

  let processedFiles = 0;
  const fixedFiles = [];

  patterns.forEach(pattern => {
    const files = glob.sync(pattern);
    
    files.forEach(file => {
      // Skip test files
      if (file.includes('__tests__') || 
          file.includes('.test.') || 
          file.includes('.spec.')) {
        return;
      }
      
      processedFiles++;
      if (processFile(file)) {
        fixedFiles.push(file);
      }
    });
  });

  // Display summary
  console.log(`\n${colors.cyan}📊 Summary:${colors.reset}`);
  console.log(`Files processed: ${processedFiles}`);
  console.log(`Files fixed: ${colors.green}${filesFixed}${colors.reset}`);
  console.log(`Total fixes applied: ${colors.green}${totalFixes}${colors.reset}\n`);

  // Display fix breakdown
  const fixTypes = {};
  fixLog.forEach(fix => {
    fixTypes[fix.type] = (fixTypes[fix.type] || 0) + 1;
  });

  console.log(`${colors.cyan}🔧 Fixes by Type:${colors.reset}`);
  Object.entries(fixTypes).forEach(([type, count]) => {
    const labels = {
      'icon-button': '🔘 Icon buttons fixed',
      'antd-icon-button': '🎨 Ant Design icon buttons fixed',
      'input-label': '📝 Input labels added',
      'select-label': '📋 Select labels added',
      'clickable-div': '🖱️ Clickable divs fixed',
      'img-alt': '🖼️ Image alt text added',
      'skip-navigation': '⏭️ Skip navigation added'
    };
    console.log(`  ${labels[type] || type}: ${colors.green}${count}${colors.reset}`);
  });

  // Show first 5 examples
  if (fixLog.length > 0) {
    console.log(`\n${colors.cyan}📝 Example Fixes:${colors.reset}`);
    fixLog.slice(0, 5).forEach(fix => {
      const relativePath = path.relative(process.cwd(), fix.file);
      console.log(`\n  ${colors.yellow}${relativePath}${colors.reset}`);
      console.log(`  Type: ${fix.type}`);
      if (fix.original.length < 100) {
        console.log(`  Before: ${colors.red}${fix.original}${colors.reset}`);
        console.log(`  After:  ${colors.green}${fix.fixed}${colors.reset}`);
      }
    });
  }

  // Save detailed log
  const reportPath = path.join(__dirname, '..', 'accessibility-fixes.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    summary: {
      filesProcessed: processedFiles,
      filesFixed,
      totalFixes,
      timestamp: new Date().toISOString()
    },
    fixTypes,
    fixes: fixLog.slice(0, 100) // Save first 100 fixes for review
  }, null, 2));

  console.log(`\n${colors.green}✅ Detailed fix report saved to: accessibility-fixes.json${colors.reset}`);

  console.log(`\n${colors.blue}📋 Next Steps:${colors.reset}`);
  console.log('1. Review the changes made by this script');
  console.log('2. Run the accessibility audit again to see remaining issues');
  console.log('3. Manually fix complex accessibility issues');
  console.log('4. Test with screen readers (NVDA, JAWS, VoiceOver)');
  console.log('5. Validate keyboard navigation flows');
  
  return {
    filesProcessed: processedFiles,
    filesFixed,
    totalFixes,
    fixTypes
  };
}

// Run the fixes
fixAccessibilityIssues();