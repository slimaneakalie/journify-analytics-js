import { LocalStorage } from "./localStorage";
import { NullStorage } from "./nullStorage";
import { Store } from "./store";
import { Traits, USER_TRAITS_PERSISTENCE_KEY } from "./traits";

export class User {
  private traits: Traits;
  private localStorage: Store;
  private memoryStorage: Store;

  constructor() {
    this.localStorage = LocalStorage.isAvailable()
      ? new LocalStorage()
      : new NullStorage();
    this.memoryStorage = new Store();
    this.traits = this.getFromStores(USER_TRAITS_PERSISTENCE_KEY) ?? {};
  }

  identify(id?: string, traits: Traits = {}) {
    const newTraits = {
      ...this.getTraits(),
      ...traits,
    };

    this.setTraits(newTraits);
  }

  private getFromStores<T>(key: string): T | null {
    return this.localStorage.get(key) ?? this.memoryStorage.get(key) ?? null;
  }

  private setOnStores<T>(key: string, value: T) {
    this.localStorage.set(key, value);
    this.memoryStorage.set(key, value);
  }

  private getTraits(): Traits {
    return this.traits;
  }

  private setTraits(newTraits: Traits) {
    this.setOnStores(USER_TRAITS_PERSISTENCE_KEY, newTraits);
  }
}
