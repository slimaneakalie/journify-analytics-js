import { Analytics, AnalyticsSettings } from "./analytics";

export class AnalyticsBrowser {
  public load(settings: AnalyticsSettings): Analytics {
    const analytics = new Analytics(settings);
    return analytics;
  }
}
