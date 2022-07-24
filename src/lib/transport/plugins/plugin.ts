import { Context } from "../context";
import { JournifyioPlugin } from "./journifyio";

export interface JournifyPlugin {
  identify?: (ctx: Context) => Promise<Context> | Context;
}

export const JOURNIFY_PLUGINS: JournifyPlugin[] = [new JournifyioPlugin()];
