import appInsights from "applicationinsights";
import { config } from "../config/environment";

let configured = false;

export function setupApplicationInsights() {
  if (configured || !config.applicationInsightsConnectionString) {
    return;
  }

  appInsights
    .setup(config.applicationInsightsConnectionString)
    .setAutoCollectConsole(true, true)
    .setAutoCollectExceptions(true)
    .setAutoCollectDependencies(true)
    .setUseDiskRetryCaching(true)
    .setSendLiveMetrics(false)
    .start();

  configured = true;
}
