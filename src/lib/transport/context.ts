import { v4 as uuid } from "@lukeed/uuid";
import { JournifyEvent } from "./event";
import { WithId } from "../lib/priorityQueue";

export class Context implements WithId {
  private readonly event: JournifyEvent;
  private readonly id: string;
  private failedDelivery?: ContextFailedDelivery;

  public constructor(event: JournifyEvent, id?: string) {
    this.event = event;
    this.id = id ?? uuid();
  }

  public getEvent(): JournifyEvent {
    return this.event;
  }

  public getId(): string {
    return this.id;
  }

  public isSame(other: Context): boolean {
    return other.id === this.id;
  }

  public setFailedDelivery(options: ContextFailedDelivery) {
    this.failedDelivery = options;
  }
}

export interface ContextFailedDelivery {
  reason: unknown;
}
