import { Buffer } from "buffer";
const packageJson = require("../../../package.json");

export function isOffline(): boolean {
  return !isOnline();
}

export function isOnline(): boolean {
  if (isBrowser()) {
    return window.navigator.onLine;
  }

  return true;
}

export function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function encodeBase64(str: string): string {
  return Buffer.from(str).toString("base64");
}

export function getLibraryVersion(): string {
  return packageJson.version;
}
