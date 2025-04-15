
import { Buffer as BufferPolyfill } from 'buffer';

// Make Buffer available globally
globalThis.Buffer = BufferPolyfill;

// Add process polyfill for libraries that expect Node.js environment
if (typeof window !== 'undefined') {
  (window as any).global = window;
  (window as any).process = {
    env: {},
    browser: true,
    version: '',
    versions: {},
    nextTick: (cb: Function, ...args: any[]) => setTimeout(() => cb(...args), 0),
  };
}
