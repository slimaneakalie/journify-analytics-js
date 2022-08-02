import { EventFactory } from "../../lib/transport/eventFactory";
import { JournifyEvent } from "../../lib/domain/event";
import { User } from "../../lib/domain/user";

export class EventFactoryMock implements EventFactory {
  public funcs: EventFactoryFuncs;
  private user: User;

  public constructor(funcs: EventFactoryFuncs) {
    this.funcs = funcs;
  }

  public setUser(user: User) {
    this.user = user;
  }

  public newIdentifyEvent(): JournifyEvent {
    return this.funcs?.newIdentifyEvent(this.user);
  }

  public newTrackEvent(
    eventName: string,
    properties?: JournifyEvent["properties"]
  ): JournifyEvent {
    return this.funcs?.newTrackEvent(eventName, properties);
  }
}

export interface EventFactoryFuncs {
  newIdentifyEvent?: jest.Func;
  newTrackEvent?: jest.Func;
}
