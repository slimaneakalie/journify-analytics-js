import { Loader } from "./api/loader";
import { Analytics, AnalyticsSettings } from "./api/analytics";

const loader: Loader = new Loader();
const load = (settings: AnalyticsSettings): Analytics => loader.load(settings);

export { AnalyticsSettings, load };
