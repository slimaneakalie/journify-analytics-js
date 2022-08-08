import { Buffer } from "buffer";
import { UtmCampaign } from "../domain/event";
import { StoresGroup } from "../store/store";

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
    return location?.pathname;
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

  const url = location?.href;
  const i = url.indexOf("#");
  return i === -1 ? url : url.slice(0, i);
}

export function getUtmCampaign(
  queryString: string,
  stores: StoresGroup
): UtmCampaign | undefined {
  const utm: UtmCampaign = {};
  const sParams = new URLSearchParams(queryString);
  let campaignFound = false;

  UTM_KEYS.forEach((k) => {
    const paramName = k[0];
    const param = getUtmParam(paramName, sParams, stores);
    if (param) {
      const fieldName = k[1];
      campaignFound = true;
      utm[fieldName] = param;
    }
  });

  return campaignFound ? utm : undefined;
}

export const UTM_KEYS: [string, keyof UtmCampaign][] = [
  ["utm_id", "id"],
  ["utm_campaign", "name"],
  ["utm_source", "source"],
  ["utm_medium", "medium"],
  ["utm_term", "term"],
  ["utm_content", "content"],
];

function getUtmParam(
  paramName: string,
  sParams: URLSearchParams,
  stores: StoresGroup
): string | null {
  let value: string = stores.get(paramName);
  if (value) {
    return value;
  }

  value = sParams.get(paramName);
  if (value) {
    stores.set(paramName, value);
  }

  return value;
}

function canonical(): string | null {
  const tag = document.querySelector("link[rel='canonical']");
  if (!tag) {
    return null;
  }

  return tag.getAttribute("href");
}
