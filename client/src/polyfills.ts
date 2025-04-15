
import { Buffer } from 'buffer';

// Make Buffer available globally
window.Buffer = Buffer;
globalThis.Buffer = Buffer;

// Add process polyfill for libraries that expect Node.js environment
if (typeof window !== 'undefined') {
  (window as any).global = window;
  (window as any).process = {
    env: { NODE_DEBUG: undefined },
    browser: true,
    version: '',
    versions: {},
    nextTick: (cb: Function, ...args: any[]) => setTimeout(() => cb(...args), 0),
  };
}

// Add type definitions
declare global {
  interface Window {
    Buffer: typeof Buffer;
    process: any;
    global: Window;
  }
}
