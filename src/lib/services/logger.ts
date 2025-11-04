/**
 * Logging Service
 * Handles application logging with Azure Application Insights integration
 */

import { AZURE_APPINSIGHTS, ENVIRONMENT } from '../constants';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: any;
}

class Logger {
  private enableConsole = ENVIRONMENT.IS_DEVELOPMENT;
  private appInsights: any = null;

  constructor() {
    this.initializeAppInsights();
  }

  private initializeAppInsights() {
    if (!AZURE_APPINSIGHTS.ENABLED) {
      console.info('Application Insights disabled - check environment variables');
      return;
    }

    try {
      // Application Insights will be initialized separately in App.tsx
      // This is just a placeholder for now
      this.appInsights = (window as any).appInsights;
    } catch (error) {
      console.error('Failed to initialize Application Insights:', error);
    }
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` | ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  private logToConsole(level: LogLevel, message: string, context?: LogContext) {
    if (!this.enableConsole) return;

    const formatted = this.formatMessage(level, message, context);
    
    if (level === 'debug') {
      console.debug(formatted);
    } else if (level === 'info') {
      console.info(formatted);
    } else if (level === 'warn') {
      console.warn(formatted);
    } else if (level === 'error') {
      console.error(formatted);
    }
  }

  private logToAppInsights(level: LogLevel, message: string, context?: LogContext) {
    if (!this.appInsights) return;

    try {
      const properties: LogContext = {
        level,
        environment: ENVIRONMENT.VITE_ENVIRONMENT,
        ...context,
      };

      switch (level) {
        case 'debug':
          if (ENVIRONMENT.IS_DEVELOPMENT) {
            this.appInsights.trackTrace(message, this.appInsights.SeverityLevel.Information, properties);
          }
          break;
        case 'info':
          this.appInsights.trackTrace(message, this.appInsights.SeverityLevel.Information, properties);
          break;
        case 'warn':
          this.appInsights.trackTrace(message, this.appInsights.SeverityLevel.Warning, properties);
          break;
        case 'error':
          this.appInsights.trackTrace(message, this.appInsights.SeverityLevel.Error, properties);
          break;
      }
    } catch (error) {
      console.error('Failed to log to Application Insights:', error);
    }
  }

  debug(message: string, context?: LogContext) {
    this.logToConsole('debug', message, context);
    this.logToAppInsights('debug', message, context);
  }

  info(message: string, context?: LogContext) {
    this.logToConsole('info', message, context);
    this.logToAppInsights('info', message, context);
  }

  warn(message: string, context?: LogContext) {
    this.logToConsole('warn', message, context);
    this.logToAppInsights('warn', message, context);
  }

  error(message: string, context?: LogContext) {
    this.logToConsole('error', message, context);
    this.logToAppInsights('error', message, context);
  }

  // Log API errors with request/response details
  logApiError(error: any, endpoint?: string, method?: string) {
    this.error('API Error', {
      endpoint,
      method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.message,
      data: error.response?.data,
    });
  }

  // Log performance metrics
  logPerformance(operation: string, duration: number) {
    if (!AZURE_APPINSIGHTS.ENABLE_PERFORMANCE_MONITORING) return;

    if (this.appInsights) {
      try {
        this.appInsights.trackEvent('PerformanceMetric', {}, { 'duration_ms': duration });
      } catch (error) {
        console.error('Failed to log performance metric:', error);
      }
    }

    this.debug(`Performance - ${operation}: ${duration}ms`);
  }
}

export const logger = new Logger();
