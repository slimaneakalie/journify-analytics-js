import { Context } from "../transport/context";
import { Emitter } from "../transport/emitter";
import { Traits } from "../domain/traits";
import { User } from "../domain/user";
import { LocalStorage } from "../store/localStorage";
import { NullStore } from "../store/nullStore";
import { Cookies } from "../store/cookies";
import { MemoryStore } from "../store/memoryStore";
import { EventFactory } from "../transport/eventFactory";
import { JournifyEvent } from "../transport/event";
import { EventQueue } from "../transport/queue";
import { JOURNIFY_PLUGINS } from "../transport/plugins/plugin";

const IDENTIFY_EVENT_NAME = "identify";

export class Analytics extends Emitter {
  private readonly user: User;
  private eventFactory: EventFactory;
  private eventQueue: EventQueue;

  public constructor(settings: AnalyticsSettings) {
    super();
    const localStorage = LocalStorage.isAvailable()
      ? new LocalStorage()
      : new NullStore();

    const cookiesStore = Cookies.isAvailable()
      ? new Cookies()
      : new NullStore();

    const memoryStore = new MemoryStore();
    this.user = new User(localStorage, cookiesStore, memoryStore);
    this.eventFactory = new EventFactory(this.user);
    this.eventQueue = new EventQueue(JOURNIFY_PLUGINS);
  }

  public async identify(userId: string, traits?: Traits): Promise<Context> {
    this.user.identify(userId, traits);
    const event = this.eventFactory.newIdentifyEvent();
    const ctx = await this.dispatchEvent(event);
    const ctxEvent = ctx.getEvent();

    this.emit(IDENTIFY_EVENT_NAME, ctxEvent.userId, ctxEvent.traits);
    return ctx;
  }

  private async dispatchEvent(event: JournifyEvent): Promise<Context> {
    const eventCtx = new Context(event);
    const deliveredCtx: Context = await this.eventQueue.deliver(eventCtx);
    return deliveredCtx;
  }
}

export interface AnalyticsSettings {
  writeKey: string;
}
