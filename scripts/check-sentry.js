#!/usr/bin/env node

/**
 * Sentry Configuration Checker
 * Verifies Sentry setup and provides troubleshooting steps
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Sentry Configuration Checker\n');

// Colors for terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkEnvFile(projectPath, projectName) {
  log(`\n📦 Checking ${projectName}...`, 'cyan');

  const envFiles = ['.env.local', '.env'];
  let foundDSN = false;
  let sentryEnabled = false;

  for (const envFile of envFiles) {
    const envPath = path.join(projectPath, envFile);

    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const lines = content.split('\n');

      log(`  ✓ Found ${envFile}`, 'green');

      // Check for DSN
      const dsnLine = lines.find(line => line.includes('SENTRY_DSN'));
      if (dsnLine) {
        const dsnValue = dsnLine.split('=')[1]?.trim();
        if (dsnValue && dsnValue.length > 10) {
          log(`  ✓ Sentry DSN configured`, 'green');
          log(`    ${dsnValue.substring(0, 30)}...`, 'blue');
          foundDSN = true;
        } else {
          log(`  ✗ Sentry DSN is empty!`, 'red');
          log(`    Line: ${dsnLine}`, 'yellow');
        }
      }

      // Check if Sentry is enabled
      const enabledLine = lines.find(line => line.includes('ENABLE_SENTRY'));
      if (enabledLine) {
        const enabledValue = enabledLine.split('=')[1]?.trim();
        sentryEnabled = enabledValue === 'true';

        if (sentryEnabled) {
          log(`  ✓ Sentry is enabled`, 'green');
        } else {
          log(`  ✗ Sentry is disabled (VITE_ENABLE_SENTRY=false)`, 'red');
        }
      }
    }
  }

  return { foundDSN, sentryEnabled };
}

// Check stocker-admin
const adminPath = path.join(__dirname, '..', 'stocker-admin');
const adminResult = checkEnvFile(adminPath, 'stocker-admin');

// Check stocker-nextjs
const nextjsPath = path.join(__dirname, '..', 'stocker-nextjs');
const nextjsResult = checkEnvFile(nextjsPath, 'stocker-nextjs');

// Check NextJS configuration
log('\n🔧 Checking NextJS Sentry Integration...', 'cyan');
const nextConfigPath = path.join(nextjsPath, 'next.config.mjs');
if (fs.existsSync(nextConfigPath)) {
  const configContent = fs.readFileSync(nextConfigPath, 'utf8');

  if (configContent.includes('withSentryConfig')) {
    log('  ✓ Sentry webpack plugin configured', 'green');
  } else {
    log('  ✗ Sentry webpack plugin NOT configured', 'red');
  }

  if (configContent.includes('tunnelRoute')) {
    log('  ✓ Tunnel route configured (/monitoring)', 'green');

    // Check if tunnel route exists
    const tunnelPath = path.join(nextjsPath, 'src', 'app', 'api', 'monitoring', 'route.ts');
    if (fs.existsSync(tunnelPath)) {
      log('  ✓ Tunnel route handler exists', 'green');
    } else {
      log('  ✗ Tunnel route handler missing!', 'red');
    }
  } else {
    log('  ✗ Tunnel route NOT configured', 'yellow');
  }

  // Check for sentry config files
  const sentryConfigs = ['sentry.client.config.ts', 'sentry.server.config.ts', 'sentry.edge.config.ts'];
  let allConfigsExist = true;

  log('\n  📄 Sentry Config Files:', 'cyan');
  sentryConfigs.forEach(config => {
    const configPath = path.join(nextjsPath, config);
    if (fs.existsSync(configPath)) {
      log(`    ✓ ${config}`, 'green');
    } else {
      log(`    ✗ ${config} missing`, 'red');
      allConfigsExist = false;
    }
  });
} else {
  log('  ✗ next.config.mjs not found', 'red');
}

// Check for duplicate config files
const duplicateConfig = path.join(nextjsPath, 'next.config.ts');
if (fs.existsSync(duplicateConfig)) {
  log('\n  ⚠️  Duplicate config file found: next.config.ts', 'yellow');
  log('  This may cause configuration conflicts!', 'yellow');
  log('  Recommendation: Delete next.config.ts, keep next.config.mjs', 'yellow');
} else {
  log('\n  ✓ No duplicate config files', 'green');
}

// Summary
log('\n📊 Summary:', 'cyan');
log('─'.repeat(50), 'cyan');

if (!nextjsResult.foundDSN) {
  log('\n❌ Missing Sentry DSN Configuration in stocker-nextjs', 'red');
  log('\nTo fix this:', 'yellow');
  log('1. Go to Sentry Dashboard: https://sentry.io/', 'yellow');
  log('2. Navigate to your project settings', 'yellow');
  log('3. Copy the DSN (Client Keys section)', 'yellow');
  log('4. Add to stocker-nextjs/.env.local:', 'yellow');
  log('   NEXT_PUBLIC_SENTRY_DSN=https://your-key@sentry.io/project-id', 'blue');
  log('   SENTRY_DSN=https://your-key@sentry.io/project-id', 'blue');
} else {
  log('\n✅ Sentry DSN configured for stocker-nextjs', 'green');
}

// Test instructions
log('\n🧪 Testing Sentry:', 'cyan');
log('─'.repeat(50), 'cyan');
log('1. Start the NextJS app:', 'yellow');
log('   cd stocker-nextjs && npm run dev', 'blue');
log('', 'reset');
log('2. Test via API endpoint:', 'yellow');
log('   curl http://localhost:3000/api/test-sentry-error', 'blue');
log('', 'reset');
log('3. Test in browser console:', 'yellow');
log('   throw new Error("Test Sentry Error");', 'blue');
log('', 'reset');
log('4. Check Sentry dashboard:', 'yellow');
log('   https://stocker-0p.sentry.io/issues/', 'blue');
log('', 'reset');
log('5. Verify tunnel is working (bypasses ad blockers):', 'yellow');
log('   Check Network tab for POST to /monitoring', 'blue');

log('\n✅ Configuration check complete!\n', 'green');
