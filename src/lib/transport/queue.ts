import { Context } from "./context";
import { OperationsPriorityQueue } from "../lib/priorityQueue";
import { Emitter } from "./emitter";
import { isOffline } from "./utils";
import { JournifyPlugin } from "./plugins/plugin";

const FLUSH_EVENT_NAME = "flush";

export class EventQueue extends Emitter {
  private pQueue: OperationsPriorityQueue<Context>;
  private flushing = false;
  private readonly plugins: JournifyPlugin[];

  public constructor(plugins: JournifyPlugin[]) {
    super();
    this.plugins = plugins;
  }

  public async deliver(ctx: Context): Promise<Context> {
    this.pQueue.push(ctx);
    const deliveredCtx = this.subscribeToDelivery(ctx);
    this.flush();
    return deliveredCtx;
  }

  private async subscribeToDelivery(sentCtx: Context): Promise<Context> {
    const promiseExecutor = (resolve) => {
      const onDeliver = (flushedCtx: Context, delivered: boolean): void => {
        if (flushedCtx.isSame(sentCtx)) {
          this.off(FLUSH_EVENT_NAME, onDeliver);
          if (delivered) {
            resolve(flushedCtx);
          } else {
            resolve(flushedCtx);
          }
        }
      };

      this.on(FLUSH_EVENT_NAME, onDeliver);
    };

    return new Promise(promiseExecutor);
  }

  private async flush(): Promise<void> {
    if (this.flushing) {
      return;
    }

    if (this.pQueue.isEmpty() || isOffline()) {
      this.flushing = false;
      return;
    }

    const ctxToDeliver: Context = this.pQueue.pop();
    if (!ctxToDeliver) {
      this.flushing = false;
      return;
    }

    try {
      const deliveredCtx = await this.runPlugins(ctxToDeliver);
      this.emit(FLUSH_EVENT_NAME, deliveredCtx, true);
    } catch (err: any) {
      this.handleFlushError(ctxToDeliver, err);
    }

    this.flushing = false;
  }

  private async runPlugins(ctxToDeliver: Context): Promise<Context> {
    let ctx: Context = ctxToDeliver;
    for (const plugin of this.plugins) {
      const deliveredCtx = await this.runPlugin(ctx, plugin);
      ctx = deliveredCtx;
    }

    return ctx;
  }

  private async runPlugin(
    ctxToDeliver: Context,
    plugin: JournifyPlugin
  ): Promise<Context> {
    const event = ctxToDeliver.getEvent();
    if (!plugin || !plugin[event.type]) {
      return ctxToDeliver;
    }

    const hook = plugin[event.type];
    return hook.apply(plugin, [ctxToDeliver]);
  }

  private handleFlushError(ctxToDeliver: Context, err: any) {
    const retryAccepted = this.pQueue.pushWithBackoff(ctxToDeliver);
    if (!retryAccepted) {
      ctxToDeliver.setFailedDelivery({ reason: err });
      this.emit(FLUSH_EVENT_NAME, ctxToDeliver, false);
    }
  }
}
