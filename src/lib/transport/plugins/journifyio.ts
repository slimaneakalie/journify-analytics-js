import { JournifyPlugin } from "./plugin";
import { Context } from "../context";

export class JournifyioPlugin implements JournifyPlugin {
  identify(ctx: Context): Promise<Context> {
    return null;
  }
}
