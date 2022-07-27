import { Context, ContextFactory } from "../transport/context";
import { Emitter } from "../transport/emitter";
import { Traits } from "../domain/traits";
import { User, UserFactory } from "../domain/user";
import { EventFactory } from "../transport/eventFactory";
import { JournifyEvent } from "../transport/event";
import { EventQueue } from "../transport/queue";

const IDENTIFY_EVENT_NAME = "identify";

export interface AnalyticsDependencies {
  userFactory: UserFactory;
  eventFactory: EventFactory;
  contextFactory: ContextFactory;
  eventQueue: EventQueue;
}

export class Analytics extends Emitter {
  private readonly settings: AnalyticsSettings;
  private readonly user: User;
  private readonly eventFactory: EventFactory;
  private readonly contextFactory: ContextFactory;
  private readonly eventQueue: EventQueue;

  public constructor(settings: AnalyticsSettings, deps: AnalyticsDependencies) {
    super();
    this.settings = settings;
    this.user = deps.userFactory.getUserFromBrowser();
    this.eventFactory = deps.eventFactory;
    this.contextFactory = deps.contextFactory;
    this.eventQueue = deps.eventQueue;
  }

  public async identify(userId: string, traits?: Traits): Promise<Context> {
    this.user.identify(userId, traits);
    const event = this.eventFactory.newIdentifyEvent(this.user);
    const ctx = await this.dispatchEvent(event);
    const ctxEvent = ctx.getEvent();

    this.emit(IDENTIFY_EVENT_NAME, ctxEvent.userId, ctxEvent.traits);
    return ctx;
  }

  private async dispatchEvent(event: JournifyEvent): Promise<Context> {
    const eventCtx = this.contextFactory.newContext(event);
    const deliveredCtx: Context = await this.eventQueue.deliver(eventCtx);
    return deliveredCtx;
  }
}

export interface AnalyticsSettings {
  writeKey: string;
  apiHost?: string;
}
