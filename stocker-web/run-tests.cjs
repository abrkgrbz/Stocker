const { spawn } = require('child_process');

const vitest = spawn('npx', ['vitest', 'run'], {
  stdio: 'inherit',
  cwd: __dirname,
  shell: true
});

vitest.on('close', (code) => {
  process.exit(code);
});