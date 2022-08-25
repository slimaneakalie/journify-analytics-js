import { User, UserFactory } from "../../lib/domain/user";
import { Traits } from "../../lib/domain/traits";
import { ExternalId } from "../../lib/domain/event";

export class UserMock implements User {
  private readonly anonymousId: string;
  private readonly userId: string;
  private readonly traits: Traits;
  private readonly externalId: ExternalId;
  public funcs: UserMockFuncs;

  public constructor(
    userId: string,
    anonymousId: string,
    traits: Traits,
    externalId: ExternalId,
    funcs: UserMockFuncs
  ) {
    this.userId = userId;
    this.anonymousId = anonymousId;
    this.traits = traits;
    this.externalId = externalId;
    this.funcs = funcs;
  }

  public identify(
    userId?: string,
    traits: Traits = {},
    externalId: ExternalId = null
  ) {
    this.funcs?.identify(userId, traits, externalId);
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
}

export interface UserMockFuncs {
  identify?: jest.Func;
}

export class UserFactoryMock implements UserFactory {
  public mockedUser: User;
  public constructor(mockedUser: User) {
    this.mockedUser = mockedUser;
  }

  public loadUser(): User {
    return this.mockedUser;
  }
}
