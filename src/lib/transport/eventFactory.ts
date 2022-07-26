import { v4 as uuid } from "@lukeed/uuid";
import * as md5 from "spark-md5";

import { User } from "../domain/user";
import { JournifyEvent } from "./event";

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
    const body: JournifyEvent = {
      ...baseEvent,
      timestamp: new Date(),
    };

    const normalizedEvent: JournifyEvent = {
      ...body,
      messageId: "journify-ajs-" + md5.hash(JSON.stringify(body) + uuid()),
    };

    return normalizedEvent;
  }
}
