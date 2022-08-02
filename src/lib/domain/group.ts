import { Traits, GROUP_TRAITS_PERSISTENCE_KEY } from "./traits";
import { Store } from "../store/store";

const GROUP_ID_PERSISTENCE_KEY = "journifyio_group_id";

export interface Group {
  identify(groupId?: string, traits?: Traits);
  getGroupId(): string | null;
  getTraits(): Traits | null;
}

export interface GroupFactory {
  loadGroup(): Group;
}

export class GroupFactoryImpl implements GroupFactory {
  private readonly localStorage: Store;
  private readonly cookiesStore: Store;
  private readonly memoryStore: Store;

  public constructor(
    localStorage: Store,
    cookiesStore: Store,
    memoryStore: Store
  ) {
    this.localStorage = localStorage;
    this.cookiesStore = cookiesStore;
    this.memoryStore = memoryStore;
  }

  public loadGroup(): Group {
    return new GroupImpl(
      this.localStorage,
      this.cookiesStore,
      this.memoryStore
    );
  }
}

class GroupImpl implements Group {
  private localStorage: Store;
  private cookiesStore: Store;
  private memoryStore: Store;
  private groupId: string;
  private traits: Traits;

  public constructor(
    localStorage: Store,
    cookiesStore: Store,
    memoryStore: Store
  ) {
    this.localStorage = localStorage;
    this.cookiesStore = cookiesStore;
    this.memoryStore = memoryStore;
    this.initGroupId();
    this.initTraits();
  }

  public identify(groupId?: string, traits: Traits = {}) {
    if (groupId) {
      this.setGroupId(groupId);
    }

    const newTraits = {
      ...this.getTraits(),
      ...traits,
    };

    this.setTraits(newTraits);
  }

  public getGroupId(): string | null {
    return this.groupId;
  }

  public getTraits(): Traits | null {
    return this.traits;
  }

  private initGroupId() {
    this.groupId = this.getFromStores(GROUP_ID_PERSISTENCE_KEY);
    if (this.groupId) {
      this.setOnStores(GROUP_ID_PERSISTENCE_KEY, this.groupId);
    }
  }

  private getFromStores<T>(key: string): T | null {
    return (
      this.localStorage.get(key) ??
      this.cookiesStore.get(key) ??
      this.memoryStore.get(key) ??
      null
    );
  }

  private setOnStores<T>(key: string, value: T) {
    this.localStorage.set(key, value);
    this.cookiesStore.set(key, value);
    this.memoryStore.set(key, value);
  }

  private initTraits() {
    const traits = this.getFromStores(GROUP_TRAITS_PERSISTENCE_KEY);
    if (traits) {
      this.setTraits(traits as Traits);
    } else {
      this.setTraits({});
    }
  }

  private setTraits(newTraits: Traits) {
    this.traits = newTraits;
    this.setOnStores(GROUP_TRAITS_PERSISTENCE_KEY, newTraits);
  }

  private setGroupId(groupId: string) {
    this.groupId = groupId;
    this.setOnStores(GROUP_ID_PERSISTENCE_KEY, groupId);
  }
}
