declare module 'bs58' {
  export function encode(source: Uint8Array | Buffer): string;
  export function decode(str: string): Uint8Array;
}