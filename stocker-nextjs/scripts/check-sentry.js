#!/usr/bin/env node

/**
 * Sentry Configuration Diagnostic Script
 * Run this to check if Sentry is properly configured
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking Sentry Configuration...\n');

// Check environment variables
const envPath = path.join(__dirname, '..', '.env.local');
const envExamplePath = path.join(__dirname, '..', '.env.example');

function checkEnvFile(filePath, fileName) {
  console.log(`📁 Checking ${fileName}:`);

  if (!fs.existsSync(filePath)) {
    console.log(`  ❌ File not found: ${filePath}`);
    return;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  const sentryVars = [
    'NEXT_PUBLIC_SENTRY_DSN',
    'SENTRY_ORG',
    'SENTRY_PROJECT',
    'SENTRY_AUTH_TOKEN'
  ];

  sentryVars.forEach(varName => {
    const line = lines.find(l => l.startsWith(`${varName}=`));
    if (line) {
      const value = line.split('=')[1];
      if (value && value.trim()) {
        console.log(`  ✅ ${varName}: Configured`);
      } else {
        console.log(`  ⚠️  ${varName}: Empty value`);
      }
    } else {
      console.log(`  ❌ ${varName}: Not found`);
    }
  });

  console.log('');
}

// Check .env.local
checkEnvFile(envPath, '.env.local');

// Check Sentry config files
const configFiles = [
  'sentry.client.config.ts',
  'sentry.server.config.ts',
  'sentry.edge.config.ts'
];

console.log('📁 Checking Sentry Config Files:');
configFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf-8');

    // Check if DSN is configured
    if (content.includes('dsn:')) {
      console.log(`  ✅ ${file}: Found (DSN configured)`);
    } else {
      console.log(`  ⚠️  ${file}: Found (No DSN configuration)`);
    }

    // Check debug mode
    if (content.includes('debug: true')) {
      console.log(`     📝 Debug mode is ON in ${file}`);
    }
  } else {
    console.log(`  ❌ ${file}: Not found`);
  }
});

console.log('\n📁 Checking Next.js Config:');
const nextConfigPath = path.join(__dirname, '..', 'next.config.mjs');
if (fs.existsSync(nextConfigPath)) {
  const content = fs.readFileSync(nextConfigPath, 'utf-8');

  if (content.includes('withSentryConfig')) {
    console.log('  ✅ next.config.mjs: Sentry wrapper configured');

    if (content.includes('tunnelRoute')) {
      console.log('  ✅ Tunnel route configured (helps with ad blockers)');
    }

    if (content.includes('hideSourceMaps: true')) {
      console.log('  ✅ Source maps hidden in production');
    }
  } else {
    console.log('  ❌ next.config.mjs: Sentry wrapper not found');
  }
} else {
  console.log('  ❌ next.config.mjs: File not found');
}

console.log('\n📁 Checking Package Dependencies:');
const packageJsonPath = path.join(__dirname, '..', 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  const sentryPackages = [
    '@sentry/nextjs',
    '@sentry/react',
    '@sentry/node'
  ];

  sentryPackages.forEach(pkg => {
    const version = packageJson.dependencies?.[pkg] || packageJson.devDependencies?.[pkg];
    if (version) {
      console.log(`  ✅ ${pkg}: ${version}`);
    } else {
      console.log(`  ❌ ${pkg}: Not installed`);
    }
  });
}

console.log('\n🔍 Common Issues to Check:');
console.log('  1. Ad blockers can block Sentry requests');
console.log('  2. Browser extensions may interfere');
console.log('  3. CORS issues if DSN domain is different');
console.log('  4. Network connectivity to ingest.de.sentry.io');
console.log('  5. Verify the DSN is correct and project exists in Sentry dashboard');

console.log('\n📝 Recommendations:');
console.log('  1. Try testing in an incognito/private window');
console.log('  2. Check browser console for blocked requests');
console.log('  3. Enable debug: true in sentry configs temporarily');
console.log('  4. Check Sentry project settings for allowed domains');
console.log('  5. Test with a simple throw new Error() in production');

console.log('\n✅ Diagnostic complete!');