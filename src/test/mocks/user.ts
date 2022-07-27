import { User, UserFactory } from "../../lib/domain/user";
import { Traits } from "../../lib/domain/traits";

export class UserMock implements User {
  private readonly anonymousId: string;
  private readonly userId: string;
  private readonly traits: Traits;
  private callbacks: UserMockCallbacks;

  public constructor(
    userId: string,
    anonymousId: string,
    traits: Traits,
    callbacks: UserMockCallbacks
  ) {
    this.userId = userId;
    this.anonymousId = anonymousId;
    this.traits = traits;
    this.callbacks = callbacks;
  }

  public identify(userId?: string, traits: Traits = {}) {
    this.callbacks?.identify(userId, traits);
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
}

export interface UserMockCallbacks {
  identify?: (userId?: string, traits?: Traits) => void;
}

export class UserFactoryMock implements UserFactory {
  private mockedUser: User;
  public constructor(mockedUser: User) {
    this.mockedUser = mockedUser;
  }

  public setMockedUser(mockedUser: User) {
    this.mockedUser = mockedUser;
  }

  public getUserFromBrowser(): User {
    return this.mockedUser;
  }
}
