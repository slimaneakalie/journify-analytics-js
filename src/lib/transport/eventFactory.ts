import { v4 as uuid } from "@lukeed/uuid";
import md5 from "spark-md5";

import { User } from "../domain/user";
import { JournifyEvent } from "../domain/event";
import { LIB_VERSION } from "../generated/libVersion";
import { getCanonicalPath, getCanonicalUrl, getUtmCampaign } from "./utils";
import { StoresGroup } from "../store/store";
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
  private readonly stores: StoresGroup;

  public constructor(stores: StoresGroup) {
    this.stores = stores;
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
      userId: this.user?.getUserId() || null,
      anonymousId: this.user?.getAnonymousId(),
      traits: this.user?.getTraits(),
      externalId: this.user?.getExternalId(),
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
      properties,
      userId: this.user?.getUserId() || null,
      anonymousId: this.user?.getAnonymousId(),
      traits: this.user?.getTraits() || this.group?.getTraits(),
      externalId: this.user?.getExternalId(),
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
      properties,
      userId: this.user?.getUserId() || null,
      anonymousId: this.user?.getAnonymousId(),
      traits: this.user?.getTraits() || this.group?.getTraits(),
      externalId: this.user?.getExternalId(),
    };

    return this.normalizeEvent(baseEvent);
  }

  public newGroupEvent(): JournifyEvent {
    const baseEvent: JournifyEvent = {
      type: "group" as const,
      userId: this.user?.getUserId() || null,
      anonymousId: this.user?.getAnonymousId(),
      traits: this.group?.getTraits(),
      externalId: this.user?.getExternalId(),
    };

    return this.normalizeEvent(baseEvent);
  }

  private normalizeEvent(baseEvent: JournifyEvent): JournifyEvent {
    const ctx = baseEvent?.context || {};
    ctx.userAgent = navigator?.userAgent;
    ctx.groupId = this.group?.getGroupId() || null;

    ctx.page = {
      referrer: document.referrer,
      search: location.search,
      title: document.title,
      path: getCanonicalPath(),
      url: getCanonicalUrl(),
    };

    const campaign = getUtmCampaign(location?.search, this.stores);
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

    const body: JournifyEvent = {
      ...baseEvent,
      context: ctx,
      timestamp: new Date(),
    };

    const sessionId = this.stores.get<string>(SESSION_ID_PERSISTENCE_KEY);
    if (sessionId) {
      body.session = {
        id: sessionId,
      };
    }

    const normalizedEvent: JournifyEvent = {
      ...body,
      messageId: "journify-ajs-" + md5.hash(JSON.stringify(body) + uuid()),
    };

    return normalizedEvent;
  }
}
