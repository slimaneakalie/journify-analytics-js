import { BrowserStore } from "./browserStore";
import { Cookies } from "./cookies";
import { MemoryStore } from "./memoryStore";
import { NullStore } from "./nullStore";

export interface Store {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T | null): T | null;
  remove(key: string): void;
}

export class StoresGroup implements Store {
  private localStore: Store;
  private cookiesStore: Store;
  private memoryStore: Store;

  public constructor(
    localStore: BrowserStore<Storage> | MemoryStore | NullStore,
    cookiesStore: Cookies | MemoryStore | NullStore,
    memoryStore: MemoryStore | NullStore
  ) {
    this.localStore = localStore;
    this.cookiesStore = cookiesStore;
    this.memoryStore = memoryStore;
  }

  public get<T>(key: string): T | null {
    return (
      this.localStore.get<T>(key) ??
      this.cookiesStore.get<T>(key) ??
      this.memoryStore.get<T>(key) ??
      null
    );
  }

  public set<T>(key: string, value: T): T | null {
    this.localStore.set(key, value);
    this.cookiesStore.set(key, value);
    this.memoryStore.set(key, value);

    return value;
  }

  public remove(key: string): void {
    this.localStore.remove(key);
    this.cookiesStore.remove(key);
    this.memoryStore.remove(key);
  }
}
