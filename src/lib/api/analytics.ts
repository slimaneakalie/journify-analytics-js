import { Context } from "../core/context";
import { Emitter } from "../core/emitter";
import { Traits } from "../core/traits";
import { User } from "../core/user";

export class Analytics extends Emitter {
  private user: User;

  constructor(settings: AnalyticsSettings) {
    super();
    this.user = new User();
  }

  async identify(
    userId: string,
    traits?: Traits
  ): Promise<Context> {
    this.user.identify(userId, traits);
    const segmentEvent = this.eventFactory.identify(
      this._user.id(),
      this._user.traits(),
      options,
      this.integrations
    );

    return this.dispatch(segmentEvent, callback).then((ctx) => {
      this.emit(
        "identify",
        ctx.event.userId,
        ctx.event.traits,
        ctx.event.options
      );
      return ctx;
    });
  }
}

export interface AnalyticsSettings {
  writeKey: string;
}