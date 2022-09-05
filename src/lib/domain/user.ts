import { v4 as uuid } from "@lukeed/uuid";
import { Traits, USER_TRAITS_PERSISTENCE_KEY } from "./traits";
import { StoresGroup } from "../store/store";
import { ExternalId } from "./event";

const ANONYMOUS_ID_PERSISTENCE_KEY = "journifyio_anonymous_id";
const USER_ID_PERSISTENCE_KEY = "journifyio_user_id";
const EXTERNAL_ID_PERSISTENCE_KEY = "journifyio_external_id";

export interface User {
  identify(userId?: string, traits?: Traits, externalId?: ExternalId);
  getUserId(): string | null;
  getAnonymousId(): string | null;
  getTraits(): Traits | null;
  getExternalId(): ExternalId | null;
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
  private externalId: ExternalId;
  private traits: Traits;

  public constructor(stores: StoresGroup) {
    this.stores = stores;
    this.initAnonymousId();
    this.initUserId();
    this.initTraits();
    this.initExternalId();
  }

  public identify(
    userId?: string,
    traits: Traits = {},
    externalId?: ExternalId
  ) {
    if (userId && userId != this.userId) {
      this.clearUserData();
      this.setUserId(userId);
    } else {
      this.initAnonymousId();
    }

    if (externalId) {
      this.setExternalId(externalId);
    }

    this.setTraits(traits);
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

  public getExternalId(): ExternalId | null {
    return this.externalId;
  }

  private clearUserData() {
    this.anonymousId = null;
    this.userId = null;
    this.externalId = null;
    this.traits = null;
    this.stores.remove(ANONYMOUS_ID_PERSISTENCE_KEY);
    this.stores.remove(USER_ID_PERSISTENCE_KEY);
    this.stores.remove(EXTERNAL_ID_PERSISTENCE_KEY);
    this.stores.remove(USER_TRAITS_PERSISTENCE_KEY);
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

  private initExternalId() {
    this.externalId = this.stores.get(EXTERNAL_ID_PERSISTENCE_KEY);
    if (this.externalId) {
      this.stores.set(EXTERNAL_ID_PERSISTENCE_KEY, this.externalId);
    }
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
    this.traits = {
      ...this.traits,
      ...newTraits,
    };

    this.stores.set(USER_TRAITS_PERSISTENCE_KEY, newTraits);
  }

  private setUserId(userId: string) {
    this.userId = userId;
    this.stores.set(USER_ID_PERSISTENCE_KEY, userId);
  }

  private setExternalId(externalId: ExternalId) {
    this.externalId = externalId;
    this.stores.set(EXTERNAL_ID_PERSISTENCE_KEY, externalId);
  }
}
