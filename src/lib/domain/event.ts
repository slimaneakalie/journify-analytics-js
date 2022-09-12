import { JSONValue, Traits } from "./traits";

export interface JournifyEvent {
  messageId?: string;
  type: "track" | "page" | "identify" | "group" | "screen";
  externalId?: ExternalId;
  userId?: string;
  anonymousId?: string;
  event?: string;
  name?: string;
  traits?: Traits;
  timestamp?: Date | string;
  context?: EventContext;
  session?: Session;
  properties?: object & {
    [k: string]: JSONValue;
  };
}

export interface ExternalId {
  id: string;
  type: string;
  collection: string;
}

export interface UtmCampaign {
  id?: string;
  name?: string;
  source?: string;
  medium?: string;
  term?: string;
  content?: string;
}

interface EventContext {
  userAgent?: string;
  library?: {
    name: string;
    version: string;
  };
  locale?: string;
  page?: Page;
  campaign?: UtmCampaign;
  groupId?: string;
  [key: string]: unknown;
}

interface Page {
  path?: string;
  referrer?: string;
  search?: string;
  title?: string;
  url?: string;
}

interface Session {
  id?: string;
}
