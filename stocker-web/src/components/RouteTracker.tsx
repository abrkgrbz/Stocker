import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView, addBreadcrumb } from '@/services/monitoring';
import { analytics } from '@/services/analytics';
import { markEnd } from '@/services/web-vitals';

export function RouteTracker() {
  const location = useLocation();

  useEffect(() => {
    // Track page view
    trackPageView(location.pathname, document.title);
    analytics.pageView(location.pathname, document.title);
    
    // Add breadcrumb for navigation
    addBreadcrumb(`Navigate to ${location.pathname}`, 'navigation');
    
    // Mark navigation end for performance tracking
    markEnd('route-change');
    
    // Start tracking for next navigation
    performance.mark('route-change-start');
  }, [location]);

  return null;
}