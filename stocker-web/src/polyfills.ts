// Polyfills for compatibility

// Ensure globalThis is available
if (typeof globalThis === 'undefined') {
  (window as any).globalThis = window;
}

// Ensure process.env is available for some libraries
if (typeof process === 'undefined') {
  (window as any).process = { env: {} };
}

// Fix for Ant Design version property
if (typeof window !== 'undefined') {
  // Ensure antd version is available
  (window as any).antd = (window as any).antd || { version: '5.27.2' };
}