import { Context } from "./context";
import {
  ON_OPERATION_DELAY_FINISH,
  OperationsPriorityQueue,
} from "../lib/priorityQueue";
import { EmitterImpl } from "./emitter";
import { isOffline } from "./utils";
import { JPlugin } from "./plugins/plugin";

export interface EventQueue {
  deliver(ctx: Context): Promise<Context>;
}

export class EventQueueImpl extends EmitterImpl implements EventQueue {
  private pQueue: OperationsPriorityQueue<Context>;
  private readonly plugins: JPlugin[];
  private flushing = false;

  public constructor(
    plugins: JPlugin[],
    pQueue: OperationsPriorityQueue<Context>
  ) {
    super();
    this.plugins = plugins;
    this.pQueue = pQueue;
    this.pQueue.on(ON_OPERATION_DELAY_FINISH, async () => {
      await this.flush();
    });
  }

  public async deliver(ctx: Context): Promise<Context> {
    this.pQueue.push(ctx);

    const deliveredCtx = this.subscribeToDelivery(ctx);
    await this.flush();

    return deliveredCtx;
  }

  private async subscribeToDelivery(sentCtx: Context): Promise<Context> {
    const promiseExecutor = (resolve, reject) => {
      const onDeliver = (flushedCtx: Context, delivered: boolean): void => {
        if (!flushedCtx.isSame(sentCtx)) {
          return;
        }

        this.off(FLUSH_EVENT_NAME, onDeliver);

        if (delivered) {
          resolve(flushedCtx);
        } else {
          const failureReason = flushedCtx.getFailedDelivery()?.reason;
          reject(failureReason);
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
      this.flushing = false;
    } catch (err: any) {
      this.flushing = false;
      this.handleFlushError(ctxToDeliver, err);
    }
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
    plugin: JPlugin
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

const FLUSH_EVENT_NAME = "flush";
