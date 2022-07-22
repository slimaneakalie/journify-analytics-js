import { v4 as uuid } from "@lukeed/uuid";

import { LocalStorage } from "./localStorage";
import { NullStorage } from "./nullStorage";
import { Store } from "../storage/store";
import { Traits, USER_TRAITS_PERSISTENCE_KEY } from "./traits";
import { CookieStorage } from "../storage/cookieStorage";

const ANONYMOUS_ID_PERSISTENCE_KEY = "journifyio_annonymous_id";

export class User {
  private traits: Traits;
  private localStorage: Store;
  private cookiesStorage: Store;
  private memoryStorage: Store;
  private anonymousId: string;

  constructor() {
    this.localStorage = LocalStorage.isAvailable()
      ? new LocalStorage()
      : new NullStorage();

    this.cookiesStorage = CookieStorage.isAvailable()
      ? new CookieStorage()
      : new NullStorage();

    this.memoryStorage = new Store();

    this.traits = this.getFromStores(USER_TRAITS_PERSISTENCE_KEY) ?? {};
    this.anonymousId =
      this.getFromStores(ANONYMOUS_ID_PERSISTENCE_KEY) ?? uuid();
  }

  identify(id?: string, traits: Traits = {}) {
    const newTraits = {
      ...this.getTraits(),
      ...traits,
    };

    this.setTraits(newTraits);
  }

  private getFromStores<T>(key: string): T | null {
    return (
      this.localStorage.get(key) ??
      this.cookiesStorage.get(key) ??
      this.memoryStorage.get(key) ??
      null
    );
  }

  private setOnStores<T>(key: string, value: T) {
    this.localStorage.set(key, value);
    this.cookiesStorage.set(key, value);
    this.memoryStorage.set(key, value);
  }

  private getTraits(): Traits {
    return this.traits;
  }

  private setTraits(newTraits: Traits) {
    this.setOnStores(USER_TRAITS_PERSISTENCE_KEY, newTraits);
  }
}
