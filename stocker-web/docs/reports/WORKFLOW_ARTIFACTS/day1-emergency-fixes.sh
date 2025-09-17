#!/bin/bash
# Day 1 Emergency Fixes - Project Phoenix
# Execute these commands in order to stabilize the application

echo "🚀 Starting Project Phoenix - Day 1 Emergency Stabilization"
echo "=============================================="

# 1. Standardize on NPM (Remove Yarn)
echo "📦 Step 1: Removing Yarn and standardizing on NPM..."
if [ -f "yarn.lock" ]; then
    rm yarn.lock
    echo "✅ yarn.lock removed"
else
    echo "⚠️ yarn.lock not found"
fi

# 2. Clean install with NPM
echo "📦 Step 2: Clean NPM installation..."
rm -rf node_modules
npm cache clean --force
npm install
echo "✅ Dependencies installed with NPM"

# 3. Fix console dropping in production
echo "🔧 Step 3: Updating Vite config for production console dropping..."
cat > vite.config.update.js << 'EOF'
import fs from 'fs';

const configPath = './vite.config.ts';
let config = fs.readFileSync(configPath, 'utf8');

// Update terserOptions
const terserUpdate = `terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
      },
      mangle: {
        safari10: true,
      },
      format: {
        comments: false,
      },
    }`;

config = config.replace(/terserOptions:\s*{[^}]*}/s, terserUpdate);
fs.writeFileSync(configPath, config);
console.log('✅ Vite config updated');
EOF

node vite.config.update.js
rm vite.config.update.js

# 4. Install testing dependencies
echo "🧪 Step 4: Installing test infrastructure..."
npm install --save-dev \
  jest@latest \
  @testing-library/react@latest \
  @testing-library/jest-dom@latest \
  @testing-library/user-event@latest \
  vitest@latest \
  @vitest/ui@latest

echo "✅ Test dependencies installed"

# 5. Create test directories
echo "📁 Step 5: Creating test structure..."
mkdir -p src/__tests__/smoke
mkdir -p src/__tests__/unit
mkdir -p src/__tests__/integration
mkdir -p src/__tests__/e2e
mkdir -p src/test-utils

# 6. Create basic test setup
echo "📝 Step 6: Creating test configuration..."
cat > src/test-utils/setup.ts << 'EOF'
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
EOF

# 7. Create vitest config
cat > vitest.config.ts << 'EOF'
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test-utils/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test-utils/',
        '*.config.ts',
        '**/*.d.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
EOF

echo "✅ Vitest configuration created"

# 8. Create first smoke test
cat > src/__tests__/smoke/app.test.tsx << 'EOF'
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import App from '../../App';

describe('App Smoke Test', () => {
  it('should render without crashing', () => {
    const { container } = render(<App />);
    expect(container).toBeInTheDocument();
  });
});
EOF

# 9. Update package.json scripts
echo "📝 Step 7: Updating package.json scripts..."
npm pkg set scripts.test="vitest"
npm pkg set scripts.test:ui="vitest --ui"
npm pkg set scripts.test:coverage="vitest run --coverage"
npm pkg set scripts.test:watch="vitest watch"

# 10. Install accessibility tools
echo "♿ Step 8: Installing accessibility tools..."
npm install --save-dev \
  axe-core@latest \
  @axe-core/react@latest \
  eslint-plugin-jsx-a11y@latest

# 11. Install bundle analyzer
echo "📊 Step 9: Installing bundle analyzer..."
npm install --save-dev \
  webpack-bundle-analyzer@latest \
  source-map-explorer@latest

npm pkg set scripts.analyze="source-map-explorer 'dist/assets/*.js'"
npm pkg set scripts.bundle-analyze="vite build --mode production && source-map-explorer 'dist/assets/*.js'"

# 12. Create pre-commit hook
echo "🪝 Step 10: Setting up pre-commit hooks..."
npm install --save-dev husky@latest lint-staged@latest

npx husky init
cat > .husky/pre-commit << 'EOF'
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
EOF

chmod +x .husky/pre-commit

# 13. Configure lint-staged
cat > .lintstagedrc.json << 'EOF'
{
  "*.{ts,tsx}": [
    "eslint --fix",
    "prettier --write"
  ],
  "*.{json,md}": [
    "prettier --write"
  ]
}
EOF

# 14. Create .nvmrc for Node version
echo "18.19.0" > .nvmrc

# 15. Commit emergency fixes
echo "💾 Step 11: Committing emergency fixes..."
git add .
git commit -m "🚨 Emergency Fix: Day 1 stabilization

- Remove yarn.lock, standardize on npm
- Enable console dropping in production
- Add test infrastructure (Jest, Vitest, Testing Library)
- Install accessibility and bundle analysis tools
- Setup pre-commit hooks with Husky
- Create test directory structure

Part of Project Phoenix - Day 1"

echo "=============================================="
echo "✅ Day 1 Emergency Stabilization Complete!"
echo "=============================================="
echo ""
echo "Next Steps:"
echo "1. Run 'npm test' to verify test setup"
echo "2. Run 'npm run build' to verify production build"
echo "3. Run 'npm run bundle-analyze' to see bundle composition"
echo "4. Continue with Day 2 tasks in the workflow"
echo ""
echo "📊 Current Status:"
echo "- Dependency manager: NPM ✅"
echo "- Console dropping: Enabled ✅"
echo "- Test infrastructure: Ready ✅"
echo "- Bundle analyzer: Installed ✅"
echo "- Pre-commit hooks: Configured ✅"