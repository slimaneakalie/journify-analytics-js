import { JPlugin } from "./plugin";
import { Context } from "../context";
import { AnalyticsSettings } from "../../api/analytics";

const DEFAULT_API_HOST = "https://api.journify.io";

export class JournifyioPlugin implements JPlugin {
  private analyticsSettings: AnalyticsSettings;

  public constructor(analyticsSettings: AnalyticsSettings) {
    this.analyticsSettings = analyticsSettings;
  }

  public updateSettings(settings: AnalyticsSettings) {
    this.analyticsSettings = settings;
  }

  public identify = this.post;
  public track = this.post;
  public page = this.post;
  public group = this.post;

  private async post(ctx: Context): Promise<Context> {
    const apiHost = this.analyticsSettings.apiHost ?? DEFAULT_API_HOST;
    const event = ctx.getEvent();
    const eventUrl = `${apiHost}/v1/sdks/${event.type?.charAt(0)}`;
    const response = await fetch(eventUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: this.analyticsSettings.writeKey,
      },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      throw new Error(
        `POST request to ${eventUrl} returned ${response.status} HTTP status`
      );
    }

    return ctx;
  }
}
