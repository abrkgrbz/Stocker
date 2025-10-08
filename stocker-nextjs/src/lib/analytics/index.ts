/**
 * Analytics Utility
 * Lightweight event tracking for auth and user behavior
 * Supports multiple analytics providers (Google Analytics, Plausible, PostHog, etc.)
 */

export type AnalyticsProvider = 'gtag' | 'plausible' | 'posthog' | 'mixpanel' | 'console'

export interface AnalyticsEvent {
  name: string
  category?: string
  properties?: Record<string, any>
  timestamp?: number
}

export interface AuthEvent {
  event:
    | 'login_attempt'
    | 'login_success'
    | 'login_failure'
    | 'logout'
    | 'register_start'
    | 'register_complete'
    | 'register_abandon'
    | 'password_reset_request'
    | 'password_reset_complete'
    | 'email_verification_sent'
    | 'email_verification_complete'
    | '2fa_enable'
    | '2fa_disable'
    | '2fa_verify_success'
    | '2fa_verify_failure'
  metadata?: {
    tenantCode?: string
    step?: string | number
    errorType?: string
    duration?: number
    [key: string]: any
  }
}

class Analytics {
  private provider: AnalyticsProvider
  private enabled: boolean

  constructor(provider: AnalyticsProvider = 'console') {
    this.provider = provider
    this.enabled = typeof window !== 'undefined' && process.env.NODE_ENV === 'production'
  }

  /**
   * Track generic event
   */
  track(event: AnalyticsEvent): void {
    if (!this.enabled && this.provider !== 'console') return

    const eventData = {
      ...event,
      timestamp: event.timestamp || Date.now(),
    }

    switch (this.provider) {
      case 'gtag':
        this.trackGoogleAnalytics(eventData)
        break
      case 'plausible':
        this.trackPlausible(eventData)
        break
      case 'posthog':
        this.trackPostHog(eventData)
        break
      case 'mixpanel':
        this.trackMixpanel(eventData)
        break
      case 'console':
      default:
        this.trackConsole(eventData)
    }
  }

  /**
   * Track authentication event with structured metadata
   */
  trackAuth(authEvent: AuthEvent): void {
    this.track({
      name: authEvent.event,
      category: 'authentication',
      properties: {
        ...authEvent.metadata,
        // Never track PII (email, passwords, names)
        // Only track metadata and event types
      },
    })
  }

  /**
   * Track page view
   */
  trackPageView(path: string, title?: string): void {
    this.track({
      name: 'page_view',
      category: 'navigation',
      properties: { path, title },
    })
  }

  /**
   * Track form interaction
   */
  trackFormInteraction(formName: string, action: 'start' | 'submit' | 'abandon', step?: number): void {
    this.track({
      name: `form_${action}`,
      category: 'forms',
      properties: { formName, step },
    })
  }

  /**
   * Track performance metric
   */
  trackPerformance(metric: string, value: number, unit: string = 'ms'): void {
    this.track({
      name: 'performance_metric',
      category: 'performance',
      properties: { metric, value, unit },
    })
  }

  // Provider-specific implementations

  private trackGoogleAnalytics(event: AnalyticsEvent): void {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event.name, {
        event_category: event.category,
        ...event.properties,
      })
    }
  }

  private trackPlausible(event: AnalyticsEvent): void {
    if (typeof window !== 'undefined' && (window as any).plausible) {
      (window as any).plausible(event.name, {
        props: event.properties,
      })
    }
  }

  private trackPostHog(event: AnalyticsEvent): void {
    if (typeof window !== 'undefined' && (window as any).posthog) {
      (window as any).posthog.capture(event.name, event.properties)
    }
  }

  private trackMixpanel(event: AnalyticsEvent): void {
    if (typeof window !== 'undefined' && (window as any).mixpanel) {
      (window as any).mixpanel.track(event.name, event.properties)
    }
  }

  private trackConsole(event: AnalyticsEvent): void {
    console.log('[Analytics]', {
      event: event.name,
      category: event.category,
      ...event.properties,
      timestamp: new Date(event.timestamp!).toISOString(),
    })
  }
}

// Singleton instance
export const analytics = new Analytics(
  (process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER as AnalyticsProvider) || 'console'
)

// Convenience functions
export const trackAuth = (event: AuthEvent) => analytics.trackAuth(event)
export const trackPageView = (path: string, title?: string) => analytics.trackPageView(path, title)
export const trackFormInteraction = (formName: string, action: 'start' | 'submit' | 'abandon', step?: number) =>
  analytics.trackFormInteraction(formName, action, step)
export const trackPerformance = (metric: string, value: number, unit?: string) =>
  analytics.trackPerformance(metric, value, unit)
