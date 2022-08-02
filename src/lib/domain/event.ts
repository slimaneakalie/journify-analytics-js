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

interface EventContext {
  userAgent?: string;
  library?: {
    name: string;
    version: string;
  };
  locale?: string;
  page?: {
    path: string;
    referrer: string;
    search: string;
    title: string;
    url: string;
  };
  [key: string]: any;
}
