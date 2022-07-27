import { EventQueue } from "../../lib/transport/queue";
import { Context } from "../../lib/transport/context";
import { Traits } from "../../lib/domain/traits";

export class EventQueueMock implements EventQueue {
  private callbacks: EventQueueMockCallbacks;
  public constructor(callbacks: EventQueueMockCallbacks) {
    this.callbacks = callbacks;
  }

  deliver(ctx: Context): Promise<Context> {
    if (this.callbacks.deliver) {
      return this.callbacks.deliver(ctx);
    }

    return Promise.resolve(undefined);
  }
}

export interface EventQueueMockCallbacks {
  deliver?: (ctx: Context) => Promise<Context>;
}
