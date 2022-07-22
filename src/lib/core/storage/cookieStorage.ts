import Cookie from "js-cookie";

import { Store } from "./store";
import { getUrlLevels, parseUrl } from "./utils";

const ONE_YEAR = 365;

export class CookieStorage extends Store {
  private attributes: Cookie.CookieAttributes;

  static isAvailable(): boolean {
    let cookieEnabled = window.navigator.cookieEnabled;

    if (!cookieEnabled) {
      const testKey = "journify.io-test-cookie-key";
      Cookie.set(testKey, "journify.io-test-cookie-value");
      cookieEnabled = document.cookie.includes(testKey);
      Cookie.remove(testKey);
    }

    return cookieEnabled;
  }

  get<T>(key: string): T | null {
    try {
      const value = Cookie.get(key);

      if (!value) {
        return null;
      }

      try {
        return JSON.parse(value);
      } catch (e) {
        return value as unknown as T;
      }
    } catch (e) {
      return null;
    }
  }

  set<T>(key: string, value: T): T | null {
    if (typeof value === "string") {
      Cookie.set(key, value, this.getAttributes());
    } else if (value === null) {
      Cookie.remove(key, this.getAttributes());
    } else {
      Cookie.set(key, JSON.stringify(value), this.getAttributes());
    }
    return value;
  }

  remove(key: string): void {
    return Cookie.remove(key, this.getAttributes());
  }

  private getAttributes(): Cookie.CookieAttributes{
    if (!this.attributes) {
      this.setAttributes()
    }

    return this.attributes
  }

  private setAttributes() {
    this.attributes = {
      expires: ONE_YEAR,
      path: "/",
      domain: this.getDomainAttribute(),
      sameSite: "Lax",
    };
  }

  private getDomainAttribute(): string | undefined {
    const parsedUrl = parseUrl(window.location.href);
    if (!parsedUrl) return;
    const levels = getUrlLevels(parsedUrl);

    // Lookup the real top level one.
    for (let i = 0; i < levels.length; ++i) {
      const cname = "__tld__";
      const domain = levels[i];
      const opts = { domain: "." + domain };

      try {
        // cookie access throw an error if the library is ran inside a sandboxed environment (e.g. sandboxed iframe)
        Cookie.set(cname, "1", opts);
        if (Cookie.get(cname)) {
          Cookie.remove(cname, opts);
          return domain;
        }
      } catch (_) {
        return;
      }
    }
  }
}
