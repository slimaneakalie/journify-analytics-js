import { EventFactory } from "../../lib/transport/eventFactory";
import { JournifyEvent } from "../../lib/transport/event";
import { User } from "../../lib/domain/user";

export class EventFactoryMock implements EventFactory {
  private callbacks: EventFactoryCallbacks;

  public constructor(callbacks: EventFactoryCallbacks) {
    this.callbacks = callbacks;
  }

  public newIdentifyEvent(user: User): JournifyEvent {
    return this.callbacks?.newIdentifyEvent(user);
  }

  public setCallbacks(callbacks: EventFactoryCallbacks) {
    this.callbacks = callbacks;
  }
}

export interface EventFactoryCallbacks {
  newIdentifyEvent?: (user: User) => JournifyEvent;
}
