import { ProfileMode } from '../types/profile';

// Optional flag to disable tracking, e.g., based on environment or user opt-out
export const ENABLE_TRACKING = process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true' || true;

/**
 * Base utility to send events to an analytics provider (e.g., Mixpanel, PostHog, or custom backend).
 * This function should be non-blocking.
 * 
 * @param eventName The name of the event
 * @param properties Additional properties associated with the event
 */
const sendEvent = (eventName: string, properties?: Record<string, any>) => {
  if (!ENABLE_TRACKING) return;

  // Fire and forget, don't await this so it doesn't block UI execution
  setTimeout(() => {
    try {
      // TODO: Replace with actual analytics implementation (e.g., mixpanel.track, posthog.capture)
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Analytics] Tracked: ${eventName}`, properties || {});
      }
      
      // If pushing to a custom backend:
      // fetch('/api/analytics', { method: 'POST', body: JSON.stringify({ eventName, properties }) }).catch(e => {});
    } catch (error) {
      console.error('[Analytics] Failed to track event:', error);
    }
  }, 0);
};

// --- Profile Mode System Events ---

/**
 * Tracks when a user selects a specific profile mode.
 */
export const trackModeSelected = (mode: ProfileMode) => {
  sendEvent('Profile Mode Selected', {
    mode,
    timestamp: new Date().toISOString()
  });
};

/**
 * Tracks when a user selects a theme, including the context of their current mode.
 */
export const trackThemeSelected = (theme: string, mode: ProfileMode) => {
  sendEvent('Profile Theme Selected', {
    theme,
    mode,
    timestamp: new Date().toISOString()
  });
};

/**
 * Tracks when a user successfully publishes or saves their profile.
 */
export const trackProfilePublished = (mode: ProfileMode, theme: string) => {
  sendEvent('Profile Published', {
    mode,
    theme,
    timestamp: new Date().toISOString()
  });
};

/**
 * Tracks when a user switches their profile from one mode to another.
 * This helps understand migration patterns and if users switch back and forth.
 */
export const trackModeSwitched = (fromMode: ProfileMode, toMode: ProfileMode) => {
  sendEvent('Profile Mode Switched', {
    from_mode: fromMode,
    to_mode: toMode,
    timestamp: new Date().toISOString()
  });
};

/**
 * Tracks when a public profile is viewed. This might be fired on the public page.
 * Useful for aggregating data on which modes/themes are seen most often.
 */
export const trackProfileViewed = (mode: ProfileMode, theme: string) => {
  sendEvent('Profile Viewed', {
    displayed_mode: mode,
    displayed_theme: theme,
    timestamp: new Date().toISOString()
  });
};
