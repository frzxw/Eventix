/**
 * Azure Application Insights Integration
 * Handles telemetry, monitoring, and analytics
 */

import { AZURE_APPINSIGHTS, ENVIRONMENT } from '../constants';
import { logger } from './logger';

declare global {
  interface Window {
    appInsights?: any;
  }
}

class AzureMonitoring {
  private appInsights: any = null;
  private isInitialized = false;

  /**
   * Initialize Application Insights
   * Should be called early in app startup
   */
  async initialize() {
    if (this.isInitialized) {
      logger.warn('Application Insights already initialized');
      return;
    }

    if (!AZURE_APPINSIGHTS.ENABLED) {
      logger.info('Application Insights disabled');
      return;
    }

    try {
      // Dynamic import to avoid bundling issues
      const { ApplicationInsights } = await import(
        '@microsoft/applicationinsights-web'
      );

      const appInsights = new ApplicationInsights({
        config: {
          instrumentationKey: AZURE_APPINSIGHTS.INSTRUMENTATION_KEY,
          connectionString: AZURE_APPINSIGHTS.CONNECTION_STRING,
          // Config options
          disableAjaxTracking: !AZURE_APPINSIGHTS.ENABLE_AJAX_TRACKING,
          disableFetchTracking: !AZURE_APPINSIGHTS.ENABLE_AJAX_TRACKING,
          enableRequestHeaderTracking: true,
          enableResponseHeaderTracking: true,
          enableCorsCorrelation: true,
          correlationHeaderExcludedDomains: [],
          autoTrackPageVisitTime: true,
          enableAutoRouteTracking: true,
          distributedTracingMode: 1, // DistributedTracingModes.AI_AND_W3C
          samplingPercentage: ENVIRONMENT.IS_PRODUCTION ? 50 : 100, // 50% sampling in production
          maxAjaxCallsPerView: 500,
          maxBatchInterval: 15000,
          // Endpoint configuration
          endpointUrl: this.getEndpointUrl(),
        },
      });

      // Load the SDK
      appInsights.loadAppInsights();

      // Track page views
      appInsights.trackPageView();

      // Set authenticated user context (if available)
      this.setUserContext();

      // Set custom properties
      appInsights.addTelemetryInitializer((envelope: any) => {
        envelope.tags['ai.cloud.roleInstance'] = this.getInstanceName();
        envelope.data.baseData.properties = envelope.data.baseData.properties || {};
        envelope.data.baseData.properties['environment'] = ENVIRONMENT.VITE_ENVIRONMENT;
        envelope.data.baseData.properties['version'] = '1.0.0';
        return true;
      });

      // Set global exception handler
      appInsights.addTelemetryInitializer((envelope: any) => {
        if (envelope.baseType === 'ExceptionData') {
          envelope.baseData.exceptions = envelope.baseData.exceptions || [];
          envelope.baseData.properties = envelope.baseData.properties || {};
          envelope.baseData.properties['isCritical'] = true;
        }
        return true;
      });

      // Store reference globally
      (window as any).appInsights = appInsights;
      this.appInsights = appInsights;
      this.isInitialized = true;

      logger.info('Application Insights initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Application Insights', { error });
    }
  }

  /**
   * Track custom events
   */
  trackEvent(
    name: string,
    properties?: { [key: string]: string },
    measurements?: { [key: string]: number }
  ) {
    if (!this.appInsights) return;

    try {
      this.appInsights.trackEvent(
        { name },
        {
          ...properties,
          environment: ENVIRONMENT.VITE_ENVIRONMENT,
        },
        measurements
      );
    } catch (error) {
      logger.error('Failed to track event', { name, error });
    }
  }

  /**
   * Track page views
   */
  trackPageView(name?: string, url?: string, refUri?: string, pageType?: string, isLoggedIn?: boolean) {
    if (!this.appInsights) return;

    try {
      this.appInsights.trackPageView({
        name,
        uri: url || window.location.href,
        refUri,
        pageType,
        isLoggedIn,
        properties: {
          environment: ENVIRONMENT.VITE_ENVIRONMENT,
        },
      });
    } catch (error) {
      logger.error('Failed to track page view', { name, error });
    }
  }

  /**
   * Track exceptions/errors
   */
  trackException(error: Error, properties?: { [key: string]: string }, severity?: number) {
    if (!this.appInsights) return;

    try {
      this.appInsights.trackException(
        { exception: error },
        {
          ...properties,
          environment: ENVIRONMENT.VITE_ENVIRONMENT,
        },
        { severity: severity || 2 }
      );
    } catch (err) {
      logger.error('Failed to track exception', { error: err });
    }
  }

  /**
   * Track traces/logs
   */
  trackTrace(message: string, properties?: { [key: string]: string }, severityLevel?: number) {
    if (!this.appInsights) return;

    try {
      this.appInsights.trackTrace(
        { message },
        {
          ...properties,
          environment: ENVIRONMENT.VITE_ENVIRONMENT,
        },
        severityLevel
      );
    } catch (error) {
      logger.error('Failed to track trace', { message, error });
    }
  }

  /**
   * Track performance/metrics
   */
  trackMetric(name: string, value: number, properties?: { [key: string]: string }) {
    if (!this.appInsights) return;

    try {
      this.appInsights.trackEvent(
        { name: `Metric_${name}` },
        {
          ...properties,
          environment: ENVIRONMENT.VITE_ENVIRONMENT,
        },
        { [name]: value }
      );
    } catch (error) {
      logger.error('Failed to track metric', { name, error });
    }
  }

  /**
   * Track request/response times
   */
  trackRequest(
    name: string,
    url: string,
    duration: number,
    resultCode: string,
    success: boolean,
    properties?: { [key: string]: string }
  ) {
    if (!this.appInsights) return;

    try {
      this.appInsights.trackRequest(
        { name, url, duration, resultCode, success },
        {
          ...properties,
          environment: ENVIRONMENT.VITE_ENVIRONMENT,
        }
      );
    } catch (error) {
      logger.error('Failed to track request', { name, error });
    }
  }

  /**
   * Set user context for authenticated user
   */
  setUserContext(userId?: string, accountId?: string) {
    if (!this.appInsights) return;

    try {
      if (userId || accountId) {
        this.appInsights.setAuthenticatedUserContext(userId || '', accountId || '');
      } else {
        this.appInsights.clearAuthenticatedUserContext();
      }
    } catch (error) {
      logger.error('Failed to set user context', { error });
    }
  }

  /**
   * Flush pending telemetry
   */
  flush() {
    if (!this.appInsights) return;

    try {
      this.appInsights.flush();
    } catch (error) {
      logger.error('Failed to flush telemetry', { error });
    }
  }

  /**
   * Get Application Insights instance
   */
  getInstance() {
    return this.appInsights;
  }

  // ==================== Private Helpers ====================

  private getEndpointUrl(): string {
    const region = (import.meta as any).env?.VITE_AZURE_REGION || 'eastus';
    return `https://${region}.in.applicationinsights.azure.com/`;
  }

  private getInstanceName(): string {
    // In Azure, this would be the container name or instance ID
    // For now, use environment-based naming
    return `eventix-${ENVIRONMENT.VITE_ENVIRONMENT}`;
  }
}

export const azureMonitoring = new AzureMonitoring();
