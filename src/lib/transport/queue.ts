import { Context } from "./context";
import {
  NEW_OPERATION_DELAY_TIMEOUT,
  OperationsPriorityQueue,
} from "../lib/priorityQueue";
import { Emitter } from "./emitter";
import { isOffline } from "./utils";
import { JournifyPlugin } from "./plugins/plugin";

const FLUSH_EVENT_NAME = "flush";
const MAX_ATTEMPTS_DEFAULT = 5;

export class EventQueue extends Emitter {
  private pQueue: OperationsPriorityQueue<Context>;
  private readonly plugins: JournifyPlugin[];
  private flushing = false;

  public constructor(plugins: JournifyPlugin[], options?: EventQueueOptions) {
    super();
    this.pQueue = new OperationsPriorityQueue<Context>(
      options?.maxAttempts ?? MAX_ATTEMPTS_DEFAULT
    );

    this.pQueue.on(NEW_OPERATION_DELAY_TIMEOUT, async () => {
      console.log("NEW_OPERATION_DELAY_TIMEOUT listener: flush start");
      await this.flush();
      console.log("NEW_OPERATION_DELAY_TIMEOUT listener: flush end");
    });

    this.plugins = plugins;

    this.pQueue.print();
  }

  public async deliver(ctx: Context): Promise<Context> {
    this.pQueue.print();
    const accepted = this.pQueue.push(ctx);
    console.log("Context was pushed");

    this.pQueue.print();

    if (!accepted[0]) {
      console.log("Context was not accepted");
      console.log(ctx);
    } else {
      console.log("Context was accepted");
      console.log(ctx);
    }

    const deliveredCtx = this.subscribeToDelivery(ctx);
    await this.flush();

    console.log("Flushing was done");
    this.pQueue.print();

    return deliveredCtx;
  }

  private async subscribeToDelivery(sentCtx: Context): Promise<Context> {
    const promiseExecutor = (resolve) => {
      const onDeliver = (flushedCtx: Context, delivered: boolean): void => {
        if (flushedCtx.isSame(sentCtx)) {
          this.off(FLUSH_EVENT_NAME, onDeliver);
          if (delivered) {
            console.log("context was delivered");
            resolve(flushedCtx);
          } else {
            console.log("context wasn't delivered");
            resolve(flushedCtx);
          }
        }
      };

      this.on(FLUSH_EVENT_NAME, onDeliver);
    };

    return new Promise(promiseExecutor);
  }

  private async flush(): Promise<void> {
    console.log("this.flushing: ", this.flushing);
    if (this.flushing) {
      return;
    }

    this.flushing = true;

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
      console.log("Flush error: ", err);
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
    console.log("hook: ", hook, ", event.type: ", event.type);
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

export interface EventQueueOptions {
  maxAttempts?: number;
}
