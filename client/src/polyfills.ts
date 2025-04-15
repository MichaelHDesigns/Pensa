// Required type definitions for global Buffer
declare global {
  interface Window {
    Buffer: typeof Buffer;
    process: any;
  }
}

export {};