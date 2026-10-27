/**
 * Centralized Animation Configuration for AgriVision Dashboards
 * 
 * Set DASHBOARD_ANIMATIONS_ENABLED to false to instantly disable all dashboard
 * entrance, count-up, and transition animations across Farmer, Buyer, Dealer,
 * and Admin portals without breaking any application features or UI layout.
 */

export const DASHBOARD_ANIMATIONS_ENABLED = true;

/**
 * Check if the client browser or OS has requested reduced motion.
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Helper to determine if dashboard animations should actively run.
 */
export const shouldAnimate = (): boolean => {
  if (!DASHBOARD_ANIMATIONS_ENABLED) return false;
  return !prefersReducedMotion();
};
