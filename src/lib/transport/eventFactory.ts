import { v4 as uuid } from "@lukeed/uuid";
import md5 from "spark-md5";

import { User } from "../domain/user";
import { JournifyEvent } from "../domain/event";
import { LIB_VERSION } from "../generated/libVersion";
import { getCanonicalPath, getCanonicalUrl, getUtmCampaign } from "./utils";
import { Store } from "../store/store";
import { Group } from "../domain/group";
import { SESSION_ID_PERSISTENCE_KEY } from "../api/loader";

export interface EventFactory {
  setUser(user: User);
  setGroup(group: Group);

  newIdentifyEvent(): JournifyEvent;
  newTrackEvent(
    eventName: string,
    properties?: JournifyEvent["properties"]
  ): JournifyEvent;
  newPageEvent(
    pageName: string,
    properties?: JournifyEvent["properties"]
  ): JournifyEvent;
  newGroupEvent(): JournifyEvent;
}

export class EventFactoryImpl implements EventFactory {
  private user: User;
  private group: Group;
  private readonly cookiesStore: Store;
  private readonly sessionStore: Store;

  public constructor(cookieStore: Store, sessionStore: Store) {
    this.cookiesStore = cookieStore;
    this.sessionStore = sessionStore;
  }

  public setGroup(group: Group) {
    this.group = group;
  }

  public setUser(user: User) {
    this.user = user;
  }

  public newIdentifyEvent(): JournifyEvent {
    const baseEvent: JournifyEvent = {
      type: "identify" as const,
      userId: this.user.getUserId(),
      anonymousId: this.user.getAnonymousId(),
      traits: this.user.getTraits(),
    };

    return this.normalizeEvent(baseEvent);
  }

  public newTrackEvent(
    eventName: string,
    properties?: JournifyEvent["properties"]
  ): JournifyEvent {
    const baseEvent: JournifyEvent = {
      type: "track" as const,
      event: eventName,
      userId: this.user.getUserId(),
      anonymousId: this.user.getAnonymousId(),
      properties,
    };

    return this.normalizeEvent(baseEvent);
  }

  public newPageEvent(
    pageName: string,
    properties?: JournifyEvent["properties"]
  ): JournifyEvent {
    const baseEvent: JournifyEvent = {
      type: "page" as const,
      name: pageName,
      userId: this.user.getUserId(),
      anonymousId: this.user.getAnonymousId(),
      properties,
    };

    return this.normalizeEvent(baseEvent);
  }

  public newGroupEvent(): JournifyEvent {
    const baseEvent: JournifyEvent = {
      type: "group" as const,
      groupId: this.group.getGroupId(),
      traits: this.group.getTraits(),
    };

    return this.normalizeEvent(baseEvent);
  }

  private normalizeEvent(baseEvent: JournifyEvent): JournifyEvent {
    const ctx = baseEvent?.context || {};
    ctx.userAgent = navigator?.userAgent;

    ctx.page = {
      referrer: document.referrer,
      search: location.search,
      title: document.title,
      path: getCanonicalPath(),
      url: getCanonicalUrl(),
    };

    const campaign = getUtmCampaign(location?.search, this.cookiesStore);
    if (campaign) {
      ctx.campaign = campaign;
    }

    if (!ctx.locale) {
      ctx.locale = navigator
        ? navigator.language || navigator["userLanguage"]
        : undefined;
    }

    if (!ctx.library) {
      ctx.library = {
        name: "@journifyio/analytics.js",
        version: LIB_VERSION,
      };
    }

    const session = {
      id: this.sessionStore.get<string>(SESSION_ID_PERSISTENCE_KEY),
    };

    const body: JournifyEvent = {
      ...baseEvent,
      session,
      context: ctx,
      timestamp: new Date(),
    };

    const normalizedEvent: JournifyEvent = {
      ...body,
      messageId: "journify-ajs-" + md5.hash(JSON.stringify(body) + uuid()),
    };

    return normalizedEvent;
  }
}
