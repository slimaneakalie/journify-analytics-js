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

export function getCanonicalPath(): string {
  const canon = canonical();
  if (!canon) {
    return window?.location.pathname || location.pathname;
  }

  const a = document.createElement("a");
  a.href = canon;

  return !a.pathname.startsWith("/") ? "/" + a.pathname : a.pathname;
}

export function getCanonicalUrl(): string {
  const canon = canonical();
  if (canon) {
    return canon.includes("?") ? canon : `${canon}${location?.search}`;
  }

  const url = window?.location.href;
  const i = url.indexOf("#");
  return i === -1 ? url : url.slice(0, i);
}

function canonical(): string | null {
  const tag = document.querySelector("link[rel='canonical']");
  if (!tag) {
    return null;
  }

  return tag.getAttribute("href");
}
