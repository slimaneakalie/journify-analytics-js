import { LocalStorage } from "./localStorage";
import { Cookies } from "./cookies";
import { MemoryStore } from "./memoryStore";
import { NullStore } from "./nullStore";

export interface Store {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T | null): T | null;
  remove(key: string): void;
}

export class StoresGroup implements Store {
  private localStorage: LocalStorage | NullStore;
  private cookiesStore: Cookies | NullStore;
  private memoryStore: MemoryStore;

  public constructor(
    localStorage: LocalStorage | NullStore,
    cookiesStore: Cookies | NullStore,
    memoryStore: MemoryStore
  ) {
    this.localStorage = localStorage;
    this.cookiesStore = cookiesStore;
    this.memoryStore = memoryStore;
  }

  public get<T>(key: string): T | null {
    return (
      this.localStorage.get(key) ??
      this.cookiesStore.get(key) ??
      this.memoryStore.get(key) ??
      null
    );
  }

  public set<T>(key: string, value: T): T | null {
    this.localStorage.set(key, value);
    this.cookiesStore.set(key, value);
    this.memoryStore.set(key, value);

    return value;
  }

  public remove(key: string): void {
    this.localStorage.remove(key);
    this.cookiesStore.remove(key);
    this.memoryStore.remove(key);
  }
}
