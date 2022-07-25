import { Context } from "./context";

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
