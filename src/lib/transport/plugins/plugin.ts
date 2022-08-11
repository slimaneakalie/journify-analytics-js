import { Context } from "../context";
import { AnalyticsSettings } from "../../api/analytics";

export interface JPlugin {
  identify: (ctx: Context) => Promise<Context> | Context;
  track: (ctx: Context) => Promise<Context> | Context;
  page: (ctx: Context) => Promise<Context> | Context;
  group: (ctx: Context) => Promise<Context> | Context;
  updateSettings(settings: AnalyticsSettings): void;
}
