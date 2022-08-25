import { Loader } from "./api/loader";
import { Analytics, AnalyticsSettings } from "./api/analytics";
import { Traits } from "./domain/traits";
import { Context } from "./transport/context";
import { ExternalId } from "./domain/event";

const loader: Loader = new Loader();
let analytics: Analytics = null;

function load(settings: AnalyticsSettings) {
  analytics = loader.load(settings);
}

async function identify(userId: string, traits?: Traits, externalId?: ExternalId): Promise<Context> {
  checkForLoad();
  loader.startNewSession();
  return analytics.identify(userId, traits, externalId);
}

async function track(eventName: string, properties?: object): Promise<Context> {
  checkForLoad();
  return analytics.track(eventName, properties);
}

async function page(pageName?: string, properties?: object): Promise<Context> {
  checkForLoad();
  return analytics.page(pageName, properties);
}

async function group(groupId: string, traits?: Traits): Promise<Context> {
  checkForLoad();
  return analytics.group(groupId, traits);
}

function checkForLoad() {
  if (!analytics) {
    throw new Error( "Analytics is not loaded, you should call the `load` function before attempting to call any other helper")
  }
}

export { load, identify, track, page, group, AnalyticsSettings };
