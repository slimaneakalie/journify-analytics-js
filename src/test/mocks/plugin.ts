import { JPlugin } from "../../lib/transport/plugins/plugin";
import { Context } from "../../lib/transport/context";

export class JPluginMock implements JPlugin {
  private funcs: JPluginMockFuncs;
  public constructor(funcs: JPluginMockFuncs) {
    this.funcs = funcs;
  }

  public identify(ctx: Context): Promise<Context> | Context {
    return this.funcs?.identify(ctx);
  }

  public track(ctx: Context): Promise<Context> | Context {
    return this.funcs?.track(ctx);
  }

  public page(ctx: Context): Promise<Context> | Context {
    return this.funcs?.page(ctx);
  }

  public group(ctx: Context): Promise<Context> | Context {
    return this.funcs?.group(ctx);
  }
}

export interface JPluginMockFuncs {
  identify?: jest.Func;
  track?: jest.Func;
  page?: jest.Func;
  group?: jest.Func;
}
