import { Context } from "../context";

export interface JournifyPlugin {
  identify?: (ctx: Context) => Promise<Context> | Context;
}
