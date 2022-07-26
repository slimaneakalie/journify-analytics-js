import { JournifyPlugin } from "./plugin";
import { Context } from "../context";
import { AnalyticsSettings } from "../../api/analytics";
import { encodeBase64 } from "../utils";

export class JournifyioPlugin implements JournifyPlugin {
  private analyticsSettings: AnalyticsSettings;

  public constructor(analyticsSettings: AnalyticsSettings) {
    this.analyticsSettings = analyticsSettings;
  }

  public identify = this.post;

  private async post(ctx: Context): Promise<Context> {
    const apiHost = this.analyticsSettings.apiHost ?? "https://api.journify.io";
    const event = ctx.getEvent();
    const token = `Basic ${encodeBase64(this.analyticsSettings.writeKey)}`;

    const response = await fetch(`${apiHost}/v1/${event.type}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "analytics-node-next/latest",
        Authorization: token,
      },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      throw new Error("Message Rejected");
    }

    return ctx;
  }
}
