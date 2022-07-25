import { Analytics, AnalyticsSettings } from "./analytics";

export class AnalyticsBrowser {
  public static load(settings: AnalyticsSettings): Analytics {
    const analytics = new Analytics(settings);
    return analytics;
  }
}
