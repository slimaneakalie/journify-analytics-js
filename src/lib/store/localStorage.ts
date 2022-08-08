import { Store } from "./store";
import { MemoryStore } from "./memoryStore";

export class BrowserStore<S extends Storage> implements Store {
  private readonly browserStorage: S | null = null;
  private memoryStore: MemoryStore | null = null;

  public constructor(storage: S) {
    if (BrowserStore.isAvailable(storage)) {
      this.browserStorage = storage;
    } else {
      this.memoryStore = new MemoryStore();
    }
  }

  private static isAvailable(storage: Storage): boolean {
    const testKey = "journify.io-test-browser-storage-key";
    try {
      storage.setItem(testKey, "journify.io-test-browser-storage-value");
      storage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }

  public get<T>(key: string): T | null {
    const val: string = this.browserStorage
      ? this.browserStorage.getItem(key)
      : this.memoryStore.get(key);
    if (val) {
      try {
        return JSON.parse(val);
      } catch (e) {
        return JSON.parse(JSON.stringify(val));
      }
    }
    return null;
  }

  public set<T>(key: string, value: T): T | null {
    try {
      const stringValue = JSON.stringify(value);
      this.browserStorage
        ? this.browserStorage.setItem(key, stringValue)
        : this.memoryStore.set(key, stringValue);
    } catch (e) {
      console.warn(
        `Unable to set ${key} in browser storage, storage may be full.`
      );
      console.warn(e);
      return null;
    }

    return value;
  }

  public remove(key: string): void {
    try {
      this.browserStorage
        ? this.browserStorage.removeItem(key)
        : this.memoryStore.remove(key);
    } catch (e) {
      console.warn(`Unable to remove ${key} from browser storage.`);
      console.warn(e);
    }
  }
}
