import { JournifyEvent } from "../../lib/domain/event";
import {
  Context,
  ContextFactory,
  ContextFailedDelivery,
} from "../../lib/transport/context";

export class ContextMock implements Context {
  private readonly id: string;
  private readonly event: JournifyEvent;
  private failedDelivery: ContextFailedDelivery;

  constructor(
    id: string,
    event: JournifyEvent,
    failedDelivery?: ContextFailedDelivery
  ) {
    this.id = id;
    this.event = event;
    this.failedDelivery = failedDelivery;
  }

  getEvent(): JournifyEvent {
    return this.event;
  }

  getFailedDelivery(): ContextFailedDelivery {
    return this.failedDelivery;
  }

  getId(): string {
    return this.id;
  }

  isSame(other: Context): boolean {
    return this.getId() == other.getId();
  }

  setFailedDelivery(failedDelivery: ContextFailedDelivery) {
    this.failedDelivery = failedDelivery;
  }
}

export class ContextFactoryMock implements ContextFactory {
  private callbacks: ContextFactoryCallbacks;

  public constructor(callbacks: ContextFactoryCallbacks) {
    this.callbacks = callbacks;
  }

  public newContext(event: JournifyEvent, id?: string): Context {
    return this.callbacks?.newContext(event, id);
  }

  public setCallbacks(callbacks: ContextFactoryCallbacks) {
    this.callbacks = callbacks;
  }
}

export interface ContextFactoryCallbacks {
  newContext?: (event: JournifyEvent, id?: string) => Context;
}
