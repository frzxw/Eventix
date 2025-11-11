import appInsights from "applicationinsights";
import { config } from "../config/environment";

let isConfigured = false;

export function setupApplicationInsights() {
  if (isConfigured || !config.applicationInsightsConnectionString) {
    return;
  }

  try {
    appInsights.setup(config.applicationInsightsConnectionString)
      .setAutoCollectConsole(true, true)
      .setAutoCollectExceptions(true)
      .setAutoCollectDependencies(true)
      .setAutoDependencyCorrelation(true)
      .setDistributedTracingMode(appInsights.DistributedTracingModes.AI)
      .setUseDiskRetryCaching(true)
      .setSendLiveMetrics(false)
      .start();

    isConfigured = true;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to initialize Application Insights", error);
  }
}
