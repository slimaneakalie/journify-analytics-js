import { Context, ContextFactory } from "../transport/context";
import { EmitterImpl } from "../transport/emitter";
import { Traits } from "../domain/traits";
import { User, UserFactory } from "../domain/user";
import { EventFactory } from "../transport/eventFactory";
import { JournifyEvent } from "../domain/event";
import { EventQueue } from "../transport/queue";
import { Group, GroupFactory } from "../domain/group";

const IDENTIFY_EVENT_NAME = "identify";
const TRACK_EVENT_NAME = "track";
const PAGE_EVENT_NAME = "page";
const GROUP_EVENT_NAME = "group";

export interface AnalyticsDependencies {
  userFactory: UserFactory;
  groupFactory: GroupFactory;
  eventFactory: EventFactory;
  contextFactory: ContextFactory;
  eventQueue: EventQueue;
}

export class Analytics extends EmitterImpl {
  private readonly settings: AnalyticsSettings;
  private readonly _group: Group;
  private readonly user: User;
  private readonly eventFactory: EventFactory;
  private readonly contextFactory: ContextFactory;
  private readonly eventQueue: EventQueue;

  public constructor(settings: AnalyticsSettings, deps: AnalyticsDependencies) {
    super();

    this.settings = settings;
    this.contextFactory = deps.contextFactory;
    this.eventQueue = deps.eventQueue;
    this.eventFactory = deps.eventFactory;

    this.user = deps.userFactory.loadUser();
    this.eventFactory.setUser(this.user);

    this._group = deps.groupFactory.loadGroup();
    this.eventFactory.setGroup(this._group);
  }

  public async identify(userId: string, traits?: Traits): Promise<Context> {
    this.user.identify(userId, traits);
    const event = this.eventFactory.newIdentifyEvent();
    const ctx = await this.dispatchEvent(event);
    const ctxEvent = ctx.getEvent();

    this.emit(IDENTIFY_EVENT_NAME, ctxEvent.userId, ctxEvent.traits);
    return ctx;
  }

  public async track(eventName: string, properties?: object): Promise<Context> {
    if (isNonValidString(eventName)) {
      throw new Error("Event name is missing");
    }

    const event = this.eventFactory.newTrackEvent(
      eventName,
      properties as JournifyEvent["properties"]
    );

    const ctx = await this.dispatchEvent(event);
    const ctxEvent = ctx.getEvent();
    this.emit(TRACK_EVENT_NAME, ctxEvent.event, ctxEvent.properties);

    return ctx;
  }

  public async page(pageName: string, properties?: object): Promise<Context> {
    if (isNonValidString(pageName)) {
      throw new Error("Page name is missing");
    }

    const event = this.eventFactory.newPageEvent(
      pageName,
      properties as JournifyEvent["properties"]
    );

    const ctx = await this.dispatchEvent(event);
    const ctxEvent = ctx.getEvent();
    this.emit(PAGE_EVENT_NAME, ctxEvent.event, ctxEvent.properties);

    return ctx;
  }

  public async group(groupId: string, traits?: Traits) {
    console.log("group invoked");
    this._group.identify(groupId, traits);
    console.log("group identify finish");
    const event = this.eventFactory.newGroupEvent();
    console.log("group newGroupEvent finish - event: ", event);
    const ctx = await this.dispatchEvent(event);
    console.log("group dispatchEvent finish - ctx: ", ctx);
    const ctxEvent = ctx.getEvent();
    console.log("group getEvent finish - ctxEvent: ", ctxEvent);
    this.emit(GROUP_EVENT_NAME, ctxEvent.groupId, ctxEvent.traits);
    console.log(
      "group emit finish - ctxEvent.groupId: ",
      ctxEvent.groupId,
      ", ctxEvent.traits: ",
      ctxEvent.traits
    );
    return ctx;
  }

  private async dispatchEvent(event: JournifyEvent): Promise<Context> {
    const eventCtx = this.contextFactory.newContext(event);
    const deliveredCtx: Context = await this.eventQueue.deliver(eventCtx);
    return deliveredCtx;
  }
}

function isNonValidString(str: string): boolean {
  return !str || typeof str !== "string" || str.trim().length === 0;
}

export interface AnalyticsSettings {
  writeKey: string;
  apiHost?: string;
}
