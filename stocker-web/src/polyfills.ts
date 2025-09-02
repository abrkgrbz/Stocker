// Polyfills for compatibility

// Ensure globalThis is available
if (typeof globalThis === 'undefined') {
  (window as any).globalThis = window;
}

// Ensure process.env is available for some libraries
if (typeof process === 'undefined') {
  (window as any).process = { env: {} };
}