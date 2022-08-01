import { EventFactory } from "../../lib/transport/eventFactory";
import { JournifyEvent } from "../../lib/domain/event";
import { User } from "../../lib/domain/user";

export class EventFactoryMock implements EventFactory {
  public funcs: EventFactoryFuncs;

  public constructor(funcs: EventFactoryFuncs) {
    this.funcs = funcs;
  }

  public newIdentifyEvent(user: User): JournifyEvent {
    return this.funcs?.newIdentifyEvent(user);
  }
}

export interface EventFactoryFuncs {
  newIdentifyEvent?: jest.Func;
}
