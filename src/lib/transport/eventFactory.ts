import { v4 as uuid } from "@lukeed/uuid";
import md5 from "spark-md5";

import { User } from "../domain/user";
import { JournifyEvent } from "./event";
import { getLibraryVersion } from "./utils";

export interface EventFactory {
  newIdentifyEvent(user: User): JournifyEvent;
}

export class EventFactoryImpl implements EventFactory {
  public newIdentifyEvent(user: User): JournifyEvent {
    const baseEvent: JournifyEvent = {
      type: "identify" as const,
      userId: user.getUserId(),
      anonymousId: user.getAnonymousId(),
      traits: user.getTraits(),
    };

    return this.normalizeEvent(baseEvent);
  }

  private normalizeEvent(baseEvent: JournifyEvent): JournifyEvent {
    const ctx = baseEvent?.context || {};
    ctx.userAgent = navigator.userAgent;
    if (!ctx.locale) {
      ctx.locale = navigator.language || navigator["userLanguage"];
    }

    if (!ctx.library) {
      ctx.library = {
        name: "@journifyio/analytics.js",
        version: getLibraryVersion(),
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
