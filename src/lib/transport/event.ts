import { Traits } from "../domain/traits";

export interface JournifyEvent {
  messageId?: string;
  type: "track" | "page" | "identify" | "group" | "screen";
  userId?: string;
  anonymousId?: string;
  traits?: Traits;
  timestamp?: Date | string;
}
