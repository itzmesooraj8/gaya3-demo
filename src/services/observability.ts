
/**
 * THE FORTRESS: OBSERVABILITY LAYER
 * Abstracts external vendors (Sentry, PostHog) so we can switch them out if needed.
 */

type LogLevel = 'info' | 'warn' | 'error' | 'fatal';

interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
}

class ObservabilityService {
  // Use type assertion to bypass missing type definition for vite/client
  private isDev = (import.meta as any).env.DEV;

  init() {
    if (this.isDev) {
      console.log('🛡️ [FORTRESS] Observability initialized in DEV mode');
    } else {
      // Initialize Sentry and PostHog here
      // Sentry.init({...})
      // PostHog.init({...})
    }
  }

  log(level: LogLevel, message: string, context?: any) {
    if (this.isDev) {
      const icon = level === 'error' || level === 'fatal' ? '🚨' : '📝';
      console.log(`${icon} [${level.toUpperCase()}] ${message}`, context || '');
    } else {
      if (level === 'error' || level === 'fatal') {
        // Sentry.captureException(new Error(message), { extra: context });
      }
    }
  }

  track(event: AnalyticsEvent) {
    if (this.isDev) {
      console.log(`👁️ [ANALYTICS] ${event.name}`, event.properties);
    } else {
      // PostHog.capture(event.name, event.properties);
    }
  }

  identifyUser(userId: string, traits?: any) {
    if (this.isDev) {
      console.log(`👤 [IDENTITY] User: ${userId}`, traits);
    } else {
      // PostHog.identify(userId, traits);
      // Sentry.setUser({ id: userId });
    }
  }
}

export const fortress = new ObservabilityService();
