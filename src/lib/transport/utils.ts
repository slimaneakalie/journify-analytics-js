import { Buffer } from "buffer";
import { LIB_VERSION } from "../generated/libVersion";

export function isOffline(): boolean {
  return !isOnline();
}

export function isOnline(): boolean {
  return navigator.onLine;
}

export function encodeBase64(str: string): string {
  return Buffer.from(str).toString("base64");
}

export function getLibVersion(): string {
  return LIB_VERSION;
}
