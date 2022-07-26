import {
  Analytics,
  AnalyticsDependencies,
  AnalyticsSettings,
} from "./analytics";
import { LocalStorage } from "../store/localStorage";
import { NullStore } from "../store/nullStore";
import { Cookies } from "../store/cookies";
import { MemoryStore } from "../store/memoryStore";
import { JournifyPlugin } from "../transport/plugins/plugin";
import { JournifyioPlugin } from "../transport/plugins/journifyio";
import { EventQueueImpl } from "../transport/queue";
import { UserFactoryImpl } from "../domain/user";
import { EventFactoryImpl } from "../transport/eventFactory";
import { ContextFactoryImpl } from "../transport/context";

export class AnalyticsBrowser {
  public static load(settings: AnalyticsSettings): Analytics {
    const localStorage = LocalStorage.isAvailable()
      ? new LocalStorage()
      : new NullStore();

    const cookiesStore = Cookies.isAvailable()
      ? new Cookies()
      : new NullStore();

    const memoryStore = new MemoryStore();

    const plugins: JournifyPlugin[] = [new JournifyioPlugin(settings)];

    const deps: AnalyticsDependencies = {
      userFactory: new UserFactoryImpl(localStorage, cookiesStore, memoryStore),
      eventFactory: new EventFactoryImpl(),
      contextFactory: new ContextFactoryImpl(),
      eventQueue: new EventQueueImpl(plugins),
    };

    const analytics = new Analytics(settings, deps);
    return analytics;
  }
}
