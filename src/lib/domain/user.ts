import { v4 as uuid } from "@lukeed/uuid";
import { Traits, USER_TRAITS_PERSISTENCE_KEY } from "./traits";
import { StoresGroup } from "../store/store";

const ANONYMOUS_ID_PERSISTENCE_KEY = "journifyio_anonymous_id";
const USER_ID_PERSISTENCE_KEY = "journifyio_user_id";

export interface User {
  identify(userId?: string, traits?: Traits);
  getUserId(): string | null;
  getAnonymousId(): string | null;
  getTraits(): Traits | null;
}

export interface UserFactory {
  loadUser(): User;
}

export class UserFactoryImpl implements UserFactory {
  private readonly stores: StoresGroup;

  public constructor(stores: StoresGroup) {
    this.stores = stores;
  }

  public loadUser(): User {
    return new UserImpl(this.stores);
  }
}

class UserImpl implements User {
  private stores: StoresGroup;
  private anonymousId: string;
  private userId: string;
  private traits: Traits;

  public constructor(stores: StoresGroup) {
    this.stores = stores;
    this.initUserId();
    this.initAnonymousId();
    this.initTraits();
  }

  public identify(userId?: string, traits: Traits = {}) {
    if (userId) {
      this.setUserId(userId);
    }

    const newTraits = {
      ...this.getTraits(),
      ...traits,
    };

    this.setTraits(newTraits);
  }

  public getUserId(): string | null {
    return this.userId;
  }

  public getAnonymousId(): string | null {
    return this.anonymousId;
  }

  public getTraits(): Traits | null {
    return this.traits;
  }

  private initUserId() {
    this.userId = this.stores.get(USER_ID_PERSISTENCE_KEY);
    if (this.userId) {
      this.stores.set(USER_ID_PERSISTENCE_KEY, this.userId);
    }
  }

  private initAnonymousId() {
    this.anonymousId = this.stores.get(ANONYMOUS_ID_PERSISTENCE_KEY);
    if (!this.anonymousId) {
      this.anonymousId = uuid();
    }

    this.stores.set(ANONYMOUS_ID_PERSISTENCE_KEY, this.anonymousId);
  }

  private initTraits() {
    const traits = this.stores.get(USER_TRAITS_PERSISTENCE_KEY);
    if (traits) {
      this.setTraits(traits as Traits);
    } else {
      this.setTraits({});
    }
  }

  private setTraits(newTraits: Traits) {
    this.traits = newTraits;
    this.stores.set(USER_TRAITS_PERSISTENCE_KEY, newTraits);
  }

  private setUserId(userId: string) {
    this.userId = userId;
    this.stores.set(USER_ID_PERSISTENCE_KEY, userId);
  }
}
