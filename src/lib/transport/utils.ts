import { Buffer } from "buffer";
import { LIB_VERSION } from "../generated/libVersion";

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

export function getLibVersion(): string {
  return LIB_VERSION;
}
