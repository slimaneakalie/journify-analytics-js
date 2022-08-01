import { Context } from "../context";

export interface JPlugin {
  identify: (ctx: Context) => Promise<Context> | Context;
  track: (ctx: Context) => Promise<Context> | Context;
}
