import { Emitter } from "../core/emitter";

export class Analytics extends Emitter {
  constructor(settings: AnalyticsSettings) {
    super();
  }
}

export interface AnalyticsSettings {
  writeKey: string;
}
