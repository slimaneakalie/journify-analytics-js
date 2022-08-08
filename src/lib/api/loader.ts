import {
  Analytics,
  AnalyticsDependencies,
  AnalyticsSettings,
} from "./analytics";
import { BrowserStore } from "../store/browserStore";
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

export function load(settings: AnalyticsSettings): Analytics {
  const sessionStore = new BrowserStore(sessionStorage);
  startSession(sessionStore);

  const localStore = new BrowserStore(localStorage);
  const cookiesStore = Cookies.isAvailable() ? new Cookies() : new NullStore();
  const memoryStore = new MemoryStore();

  const stores = new StoresGroup(localStore, cookiesStore, memoryStore);

  const plugins: JPlugin[] = [new JournifyioPlugin(settings)];
  const pQueue = new OperationsPriorityQueueImpl<Context>(
    DEFAULT_MAX_QUEUE_ATTEMPTS
  );
  const deps: AnalyticsDependencies = {
    userFactory: new UserFactoryImpl(stores),
    groupFactory: new GroupFactoryImpl(stores),
    eventFactory: new EventFactoryImpl(cookiesStore, sessionStore),
    contextFactory: new ContextFactoryImpl(),
    eventQueue: new EventQueueImpl(plugins, pQueue),
  };

  const analytics = new Analytics(settings, deps);
  return analytics;
}

export const SESSION_ID_PERSISTENCE_KEY = "journifyio_session_id";

function startSession(sessionStore: BrowserStore<Storage>) {
  const currentEpoch = new Date().getTime();
  if (!sessionStore.get(SESSION_ID_PERSISTENCE_KEY)) {
    sessionStore.set(SESSION_ID_PERSISTENCE_KEY, currentEpoch);
  }
}

const DEFAULT_MAX_QUEUE_ATTEMPTS = 5;
