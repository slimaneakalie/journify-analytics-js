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

export function load(settings: AnalyticsSettings): Analytics {
  const localStore = new BrowserStore(localStorage);
  const cookiesStore = Cookies.isAvailable() ? new Cookies() : new NullStore();
  const memoryStore = new MemoryStore();
  const stores = new StoresGroup(localStore, cookiesStore, memoryStore);

  startSession(
    stores,
    settings.sessionDurationMin ?? DEFAULT_SESSION_DURATION_MIN
  );

  const plugins: JPlugin[] = [new JournifyioPlugin(settings)];
  const pQueue = new OperationsPriorityQueueImpl<Context>(
    DEFAULT_MAX_QUEUE_ATTEMPTS
  );
  const deps: AnalyticsDependencies = {
    userFactory: new UserFactoryImpl(stores),
    groupFactory: new GroupFactoryImpl(stores),
    eventFactory: new EventFactoryImpl(stores),
    contextFactory: new ContextFactoryImpl(),
    eventQueue: new EventQueueImpl(plugins, pQueue),
  };

  const analytics = new Analytics(settings, deps);
  return analytics;
}

export const SESSION_ID_PERSISTENCE_KEY = "journifyio_session_id";

function startSession(stores: StoresGroup, sessionDurationMin: number) {
  const currentEpoch = new Date().getTime();
  if (!stores.get(SESSION_ID_PERSISTENCE_KEY)) {
    stores.set(SESSION_ID_PERSISTENCE_KEY, currentEpoch);

    setInterval(() => {
      const newSessionId = new Date().getTime();
      stores.set(SESSION_ID_PERSISTENCE_KEY, newSessionId);

      resetUtmCampaign(stores);
    }, sessionDurationMin * 60 * 1000);
  }
}

function resetUtmCampaign(stores: StoresGroup) {
  UTM_KEYS.forEach((key) => stores.remove(key[0]));
}

const DEFAULT_MAX_QUEUE_ATTEMPTS = 5;
const DEFAULT_SESSION_DURATION_MIN = 30;
