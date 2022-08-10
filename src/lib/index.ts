import { load } from "./api/loader";
import { AnalyticsSettings } from "./api/analytics";
import { LIB_VERSION } from "./generated/libVersion";

console.log("Hello from Journify version ", LIB_VERSION);

export { AnalyticsSettings, load };
