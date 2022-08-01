import { Buffer } from "buffer";

export function isOffline(): boolean {
  return !isOnline();
}

export function isOnline(): boolean {
  return navigator?.onLine || false;
}

export function encodeBase64(str: string): string {
  return Buffer.from(str).toString("base64");
}
