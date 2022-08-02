import { v4 as uuid } from "@lukeed/uuid";
import md5 from "spark-md5";

import { User } from "../domain/user";
import { JournifyEvent } from "../domain/event";
import { LIB_VERSION } from "../generated/libVersion";
import { getCanonicalPath, getCanonicalUrl, getUtm } from "./utils";
import { Store } from "../store/store";

export interface EventFactory {
  setUser(user: User);
  newIdentifyEvent(): JournifyEvent;
  newTrackEvent(
    eventName: string,
    properties?: JournifyEvent["properties"]
  ): JournifyEvent;
}

export class EventFactoryImpl implements EventFactory {
  private user: User;
  private readonly cookiesStore: Store;

  public constructor(cookieStore: Store) {
    this.cookiesStore = cookieStore;
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

  private normalizeEvent(baseEvent: JournifyEvent): JournifyEvent {
    const ctx = baseEvent?.context || {};
    ctx.userAgent = navigator?.userAgent;
    ctx.page = {
      referrer: document.referrer,
      search: location.search,
      title: document.title,
      path: getCanonicalPath(),
      url: getCanonicalUrl(),
      utm: getUtm(location?.search, this.cookiesStore),
    };

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

    const body: JournifyEvent = {
      ...baseEvent,
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
