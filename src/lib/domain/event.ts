import { JSONValue, Traits } from "./traits";

export interface JournifyEvent {
  messageId?: string;
  type: "track" | "page" | "identify" | "group" | "screen";
  userId?: string;
  anonymousId?: string;
  event?: string;
  name?: string;
  traits?: Traits;
  timestamp?: Date | string;
  context?: EventContext;
  properties?: object & {
    [k: string]: JSONValue;
  };
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
  page?: EventContextPage;
  campaign?: UtmCampaign;
  [key: string]: any;
}

interface EventContextPage {
  path?: string;
  referrer?: string;
  search?: string;
  title?: string;
  url?: string;
}
