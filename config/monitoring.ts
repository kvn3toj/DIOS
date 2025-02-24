import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';
import newrelic from 'newrelic';
import { datadogLogs } from '@datadog/browser-logs';
import config from './index';

export const initializeMonitoring = () => {
  // Initialize Sentry
  if (config.monitoring.sentryDsn) {
    Sentry.init({
      dsn: config.monitoring.sentryDsn,
      environment: config.app.env,
      integrations: [
        new ProfilingIntegration(),
      ],
      tracesSampleRate: config.app.env === 'production' ? 0.1 : 1.0,
      profilesSampleRate: 1.0,
    });
  }

  // Initialize Datadog
  if (config.monitoring.datadogApiKey) {
    datadogLogs.init({
      clientToken: config.monitoring.datadogApiKey,
      site: 'datadoghq.com',
      forwardErrorsToLogs: true,
      sampleRate: 100,
    });
  }

  // Initialize custom metrics
  initializeMetrics();
};

// Custom metrics for monitoring
const metrics = {
  requestCount: 0,
  errorCount: 0,
  responseTime: [] as number[],
};

export const initializeMetrics = () => {
  // Reset metrics every minute
  setInterval(() => {
    const avgResponseTime = metrics.responseTime.length > 0
      ? metrics.responseTime.reduce((a, b) => a + b) / metrics.responseTime.length
      : 0;

    // Send metrics to monitoring services
    if (config.monitoring.newRelicKey) {
      newrelic.recordMetric('Custom/requestCount', metrics.requestCount);
      newrelic.recordMetric('Custom/errorCount', metrics.errorCount);
      newrelic.recordMetric('Custom/avgResponseTime', avgResponseTime);
    }

    // Reset metrics
    metrics.requestCount = 0;
    metrics.errorCount = 0;
    metrics.responseTime = [];
  }, 60000);
};

export const trackRequest = () => {
  metrics.requestCount++;
};

export const trackError = (error: Error) => {
  metrics.errorCount++;
  
  if (config.monitoring.sentryDsn) {
    Sentry.captureException(error);
  }
};

export const trackResponseTime = (duration: number) => {
  metrics.responseTime.push(duration);
  
  if (config.monitoring.newRelicKey) {
    newrelic.recordMetric('Custom/responseTime', duration);
  }
};

export const createCustomMetric = (name: string, value: number, tags: Record<string, string> = {}) => {
  if (config.monitoring.newRelicKey) {
    newrelic.recordMetric(`Custom/${name}`, value);
  }
  
  if (config.monitoring.datadogApiKey) {
    // Send metric to Datadog
    datadogLogs.logger.info('Custom metric', {
      metric_name: name,
      metric_value: value,
      ...tags
    });
  }
};

// Alert thresholds
export const alertThresholds = {
  errorRate: 0.05, // 5% error rate
  responseTime: 1000, // 1 second
  cpuUsage: 80, // 80% CPU usage
  memoryUsage: 80, // 80% memory usage
  diskUsage: 80, // 80% disk usage
};

// Alert checks
export const checkAlertThresholds = () => {
  const errorRate = metrics.errorCount / metrics.requestCount;
  const avgResponseTime = metrics.responseTime.reduce((a, b) => a + b, 0) / metrics.responseTime.length;

  if (errorRate > alertThresholds.errorRate) {
    triggerAlert('High Error Rate', `Error rate of ${errorRate * 100}% exceeds threshold of ${alertThresholds.errorRate * 100}%`);
  }

  if (avgResponseTime > alertThresholds.responseTime) {
    triggerAlert('High Response Time', `Average response time of ${avgResponseTime}ms exceeds threshold of ${alertThresholds.responseTime}ms`);
  }
};

// Alert triggers
export const triggerAlert = (title: string, message: string, severity: 'info' | 'warning' | 'error' = 'error') => {
  // Log alert
  console.error(`ALERT - ${title}: ${message}`);

  // Send to monitoring services
  if (config.monitoring.sentryDsn) {
    Sentry.captureMessage(`${title}: ${message}`, severity === 'error' ? Sentry.Severity.Error : Sentry.Severity.Warning);
  }

  if (config.monitoring.newRelicKey) {
    newrelic.noticeError(new Error(`${title}: ${message}`));
  }

  if (config.monitoring.datadogApiKey) {
    datadogLogs.logger.error(`${title}: ${message}`);
  }
}; 