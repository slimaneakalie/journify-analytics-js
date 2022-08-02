import { JSONValue, Traits } from "./traits";

export interface JournifyEvent {
  messageId?: string;
  type: "track" | "page" | "identify" | "group" | "screen";
  userId?: string;
  anonymousId?: string;
  event?: string;
  traits?: Traits;
  timestamp?: Date | string;
  context?: EventContext;
  properties?: object & {
    [k: string]: JSONValue;
  };
}

export interface Utm {
  id?: string;
  source?: string;
  medium?: string;
  campaign?: string;
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
  utm?: Utm;
  [key: string]: any;
}

interface EventContextPage {
  path?: string;
  referrer?: string;
  search?: string;
  title?: string;
  url?: string;
}
