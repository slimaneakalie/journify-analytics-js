import { User, UserFactory } from "../../lib/domain/user";
import { Traits } from "../../lib/domain/traits";

export class UserMock implements User {
  private readonly anonymousId: string;
  private readonly userId: string;
  private readonly traits: Traits;
  public funcs: UserMockFuncs;

  public constructor(
    userId: string,
    anonymousId: string,
    traits: Traits,
    funcs: UserMockFuncs
  ) {
    this.userId = userId;
    this.anonymousId = anonymousId;
    this.traits = traits;
    this.funcs = funcs;
  }

  public identify(userId?: string, traits: Traits = {}) {
    this.funcs?.identify(userId, traits);
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
