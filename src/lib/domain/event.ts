import { Traits } from "./traits";

export interface JournifyEvent {
  messageId?: string;
  type: "track" | "page" | "identify" | "group" | "screen";
  userId?: string;
  anonymousId?: string;
  traits?: Traits;
  timestamp?: Date | string;
  context?: EventContext;
}

interface EventContext {
  userAgent?: string;
  library?: {
    name: string;
    version: string;
  };
  locale?: string;
  [key: string]: any;
}
