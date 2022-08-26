import {
  Analytics,
  AnalyticsDependencies,
  AnalyticsSettings,
} from "./analytics";

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
import { GroupFactoryImpl } from "../domain/group";
import { StoresGroup } from "../store/store";
import { BrowserStore } from "../store/browserStore";
import { UTM_KEYS } from "../transport/utils";

export class Loader {
  private analytics: Analytics = null;
  private plugins: JPlugin[];
  private sessionIntervalId: NodeJS.Timer = null;
  private stores: StoresGroup = null;
  private settings: AnalyticsSettings;

  public load(settings: AnalyticsSettings): Analytics {
    this.settings = settings;
    this.startNewSession();

    if (!this.analytics) {
      this.initAnalytics();
    } else {
      this.plugins?.forEach((plugin) => plugin.updateSettings(settings));
    }

    return this.analytics;
  }

  private initAnalytics() {
    this.plugins = [new JournifyioPlugin(this.settings)];
    const pQueue = new OperationsPriorityQueueImpl<Context>(
      DEFAULT_MAX_QUEUE_ATTEMPTS
    );
    const deps: AnalyticsDependencies = {
      userFactory: new UserFactoryImpl(this.stores),
      groupFactory: new GroupFactoryImpl(this.stores),
      eventFactory: new EventFactoryImpl(this.stores),
      contextFactory: new ContextFactoryImpl(),
      eventQueue: new EventQueueImpl(this.plugins, pQueue),
    };

    this.analytics = new Analytics(this.settings, deps);
  }

  private initStores() {
    if (this.stores) {
      return;
    }

    const localStore = new BrowserStore(localStorage);
    const cookiesStore = Cookies.isAvailable()
      ? new Cookies()
      : new NullStore();
    const memoryStore = new MemoryStore();
    this.stores = new StoresGroup(localStore, cookiesStore, memoryStore);
  }

  public startNewSession() {
    this.initStores();

    if (this.sessionIntervalId) {
      clearInterval(this.sessionIntervalId);
    }

    const currentEpoch = new Date().getTime();
    if (!this.stores.get(SESSION_ID_PERSISTENCE_KEY)) {
      this.stores.set(SESSION_ID_PERSISTENCE_KEY, currentEpoch);

      const sessionDurationMin =
        this.settings.sessionDurationMin || DEFAULT_SESSION_DURATION_MIN;
      this.sessionIntervalId = setInterval(() => {
        const newSessionId = new Date().getTime();
        this.stores.set(SESSION_ID_PERSISTENCE_KEY, newSessionId);

        this.resetUtmCampaign();
      }, sessionDurationMin * 60 * 1000);
    }
  }

  private resetUtmCampaign() {
    UTM_KEYS.forEach((key) => this.stores.remove(key[0]));
  }
}

export const SESSION_ID_PERSISTENCE_KEY = "journifyio_session_id";

const DEFAULT_MAX_QUEUE_ATTEMPTS = 5;
const DEFAULT_SESSION_DURATION_MIN = 30;
