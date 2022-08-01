import {
  Analytics,
  AnalyticsDependencies,
  AnalyticsSettings,
} from "./analytics";
import { LocalStorage } from "../store/localStorage";
import { NullStore } from "../store/nullStore";
import { Cookies } from "../store/cookies";
import { MemoryStore } from "../store/memoryStore";
import { JPlugin } from "../transport/plugins/plugin";
import { JournifyioPlugin } from "../transport/plugins/journifyio";
import { EventQueueImpl } from "../transport/queue";
import { UserFactoryImpl } from "../domain/user";
import { EventFactoryImpl } from "../transport/eventFactory";
import { Context, ContextFactoryImpl } from "../transport/context";
import { OperationsPriorityQueueImpl } from "../lib/priorityQueue";

export class Journify {
  public static load(settings: AnalyticsSettings): Analytics {
    const localStorage = LocalStorage.isAvailable()
      ? new LocalStorage()
      : new NullStore();

    const cookiesStore = Cookies.isAvailable()
      ? new Cookies()
      : new NullStore();

    const memoryStore = new MemoryStore();

    const plugins: JPlugin[] = [new JournifyioPlugin(settings)];
    const pQueue = new OperationsPriorityQueueImpl<Context>(
      DEFAULT_MAX_QUEUE_ATTEMPTS
    );
    const deps: AnalyticsDependencies = {
      userFactory: new UserFactoryImpl(localStorage, cookiesStore, memoryStore),
      eventFactory: new EventFactoryImpl(),
      contextFactory: new ContextFactoryImpl(),
      eventQueue: new EventQueueImpl(plugins, pQueue),
    };

    const analytics = new Analytics(settings, deps);
    return analytics;
  }
}

const DEFAULT_MAX_QUEUE_ATTEMPTS = 5;
