import { Store } from "./store";

export class LocalStorage extends Store {
  static isAvailable(): boolean {
    const testKey = "journify.io-test-localstorage-key";
    try {
      localStorage.setItem(testKey, "journify.io-test-localstorage-value");
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }

  get<T>(key: string): T | null {
    const val = localStorage.getItem(key);
    if (val) {
      try {
        return JSON.parse(val);
      } catch (e) {
        return JSON.parse(JSON.stringify(val));
      }
    }
    return null;
  }

  set<T>(key: string, value: T): T | null {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn(
        `Unable to set ${key} in localStorage, storage may be full.`
      );
      console.warn(e);
      return null;
    }

    return value;
  }

  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn(`Unable to remove ${key} from localStorage.`);
      console.warn(e);
    }
  }
}
