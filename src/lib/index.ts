import { Loader } from "./api/loader";
import { Analytics, AnalyticsSettings } from "./api/analytics";
import { Traits } from "./domain/traits";
import { Context } from "./transport/context";

const loader: Loader = new Loader();
let analytics: Analytics = null;

function load(settings: AnalyticsSettings) {
  analytics = loader.load(settings);
}

async function identify(userId: string, traits?: Traits): Promise<Context> {
  checkForLoad();
  return analytics.identify(userId, traits);
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
    console.log(
      "Analytics is not loaded, you should call the `load` function before attempting to call any other helper"
    );
  }
}

export { load, identify, track, page, group, AnalyticsSettings };
