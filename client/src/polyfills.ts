// This file contains polyfills needed for browser compatibility

import { Buffer as BufferPolyfill } from 'buffer';

// Make Buffer available globally
window.Buffer = window.Buffer || BufferPolyfill;

// Add process polyfill for Jupiter and other libraries that expect Node.js environment
if (typeof window !== 'undefined' && !window.process) {
  window.process = {
    env: {},
    browser: true,
    version: '',
    versions: {},
    nextTick: (cb: Function, ...args: any[]) => setTimeout(() => cb(...args), 0),
    // Add any other process properties needed by the libraries
  } as any;
}

// Declare the Buffer and process on the global Window interface
declare global {
  interface Window {
    Buffer: typeof BufferPolyfill;
    process: any;
  }
}