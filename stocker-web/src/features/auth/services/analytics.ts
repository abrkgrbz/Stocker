// Analytics Service for Registration & Auth

// Define proper types for analytics libraries
interface MixpanelLib {
  init: (token: string, config?: object) => void;
  track: (event: string, properties?: object) => void;
  identify: (userId: string) => void;
  people: {
    set: (properties: object) => void;
    set_once: (properties: object) => void;
  };
  reset: () => void;
  _i?: unknown[];
}

interface AmplitudeLib {
  init: (apiKey: string, userId?: string) => void;
  track: (event: string, properties?: object) => void;
  setUserId: (userId: string) => void;
  setUserProperties: (properties: object) => void;
}

interface HeapLib {
  identify: (userId: string) => void;
  addUserProperties: (properties: object) => void;
  track: (event: string, properties?: object) => void;
  load?: (id: string) => void;
  appid?: string;
  config?: object;
  push?: (args: unknown[]) => void;
}

interface SegmentAnalytics {
  identify: (userId: string, traits?: object) => void;
  track: (event: string, properties?: object) => void;
  page: (category?: string, name?: string, properties?: object) => void;
  group: (groupId: string, traits?: object) => void;
  reset: () => void;
  load?: (key: string) => void;
  initialized?: boolean;
  invoked?: boolean;
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
    mixpanel?: MixpanelLib;
    amplitude?: AmplitudeLib;
    heap?: HeapLib | unknown[];
    _paq?: unknown[]; // Matomo
    analytics?: SegmentAnalytics; // Segment
  }
}

// User properties interface
interface UserProperties {
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  createdAt?: string;
  lastLogin?: string;
  subscription?: string;
  plan?: string;
  tenant?: string;
  roles?: string;
  company?: string;
  referralSource?: string;
  [key: string]: string | number | boolean | undefined;
}

// Base event properties
interface BaseEventProperties {
  timestamp?: number;
  session_id?: string;
  user_id?: string;
  [key: string]: string | number | boolean | object | undefined;
}

// Form data type for registration
interface RegistrationFormData {
  companyName?: string;
  employeeCount?: string;
  sector?: string;
  [key: string]: string | undefined;
}

class AnalyticsService {
  private initialized = false;
  private userId: string | null = null;

  // Initialize all analytics platforms
  public init() {
    if (this.initialized) return;

    this.initGoogleAnalytics();
    this.initMixpanel();
    this.initAmplitude();
    this.initHeap();
    this.initSegment();
    
    this.initialized = true;
  }

  // Initialize Google Analytics
  private initGoogleAnalytics() {
    const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;
    if (!GA_MEASUREMENT_ID) return;

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function() {
      window.dataLayer?.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', GA_MEASUREMENT_ID);
  }

  // Initialize Mixpanel with proper typing - minified script
  private initMixpanel() {
    const MIXPANEL_TOKEN = import.meta.env.VITE_MIXPANEL_TOKEN;
    if (!MIXPANEL_TOKEN) return;

    const script = document.createElement('script');
    script.innerHTML = `
      (function(f,b){if(!b.__SV){var e,o,i,g;window.mixpanel=b;b._i=[];b.init=function(e,f,c){function o(b,h){var a=h.split(".");2==a.length&&(b=b[a[0]],h=a[1]);b[h]=function(){b.push([h].concat(Array.prototype.slice.call(arguments,0)))}}var d=b;"undefined"!==typeof c?d=b[c]=[]:c="mixpanel";d.people=d.people||[];d.toString=function(b){var a="mixpanel";"mixpanel"!==c&&(a+="."+c);b||(a+=" (stub)");return a};d.people.toString=function(){return d.toString(1)+".people (stub)"};i="disable time_event track track_pageview track_links track_forms track_with_groups add_group set_group remove_group get_group track_with_tag register register_once alias unregister identify name_tag set_config reset opt_in_tracking opt_out_tracking has_opted_in_tracking has_opted_out_tracking clear_opt_in_out_tracking start_batch_senders people.set people.set_once people.unset people.increment people.append people.union people.track_charge people.clear_charges people.delete_user people.remove".split(" ");
      for(g=0;g<i.length;g++)o(d,i[g]);var h="set set_once union unset remove delete".split(" ");d.get_group=function(){function a(c){b[c]=function(){call2_args=arguments;call2=[c].concat(Array.prototype.slice.call(call2_args,0));d.push([e,call2])}}for(var b={},e=["get_group"].concat(Array.prototype.slice.call(arguments,0)),c=0;c<h.length;c++)a(h[c]);return b};b._i.push([e,f,c])};b.__SV=1.3;e=f.createElement("script");e.type="text/javascript";e.async=!0;e.src="undefined"!==typeof MIXPANEL_CUSTOM_LIB_URL?MIXPANEL_CUSTOM_LIB_URL:"file:"===f.location.protocol&&"//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js".match(/^\\/\\//)?"https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js":"//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js";o=f.getElementsByTagName("script")[0];o.parentNode.insertBefore(e,o)}})(document,window.mixpanel||[]);
    `;
    document.head.appendChild(script);

    window.mixpanel?.init(MIXPANEL_TOKEN, {
      debug: import.meta.env.DEV,
      track_pageview: true,
      persistence: 'localStorage'
    });
  }

  // Initialize Amplitude
  private initAmplitude() {
    const AMPLITUDE_API_KEY = import.meta.env.VITE_AMPLITUDE_API_KEY;
    if (!AMPLITUDE_API_KEY) return;

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://cdn.amplitude.com/libs/amplitude-js-8.21.4-min.gz.js';
    script.onload = () => {
      if (window.amplitude) {
        window.amplitude.init(AMPLITUDE_API_KEY);
      }
    };
    document.head.appendChild(script);
  }

  // Initialize Heap - minified script
  private initHeap() {
    const HEAP_ID = import.meta.env.VITE_HEAP_ID;
    if (!HEAP_ID) return;

    const script = document.createElement('script');
    script.innerHTML = `
      window.heap=window.heap||[],heap.load=function(e,t){window.heap.appid=e,window.heap.config=t=t||{};var r=document.createElement("script");r.type="text/javascript",r.async=!0,r.src="https://cdn.heapanalytics.com/js/heap-"+e+".js";var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(r,a);for(var n=function(e){return function(){heap.push([e].concat(Array.prototype.slice.call(arguments,0)))}},p=["addEventProperties","addUserProperties","clearEventProperties","identify","resetIdentity","removeEventProperty","setEventProperties","track","unsetEventProperty"],o=0;o<p.length;o++)heap[p[o]]=n(p[o])};
      heap.load("${HEAP_ID}");
    `;
    document.head.appendChild(script);
  }

  // Initialize Segment - minified script
  private initSegment() {
    const SEGMENT_WRITE_KEY = import.meta.env.VITE_SEGMENT_WRITE_KEY;
    if (!SEGMENT_WRITE_KEY) return;

    const script = document.createElement('script');
    script.innerHTML = `
      !function(){var i="analytics",analytics=window[i]=window[i]||[];if(!analytics.initialize)if(analytics.invoked)window.console&&console.error&&console.error("Segment snippet included twice.");else{analytics.invoked=!0;analytics.methods=["trackSubmit","trackClick","trackLink","trackForm","pageview","identify","reset","group","track","ready","alias","debug","page","screen","once","off","on","addSourceMiddleware","addIntegrationMiddleware","setAnonymousId","addDestinationMiddleware","register"];analytics.factory=function(e){return function(){if(window[i].initialized)return window[i][e].apply(window[i],arguments);var n=Array.prototype.slice.call(arguments);if(["track","screen","alias","group","page","identify"].indexOf(e)>-1){var c=document.querySelector("link[rel='canonical']");n.push({__t:"bpc",c:c&&c.getAttribute("href")||void 0,p:location.pathname,u:location.href,s:location.search,t:document.title,r:document.referrer})}n.unshift(e);analytics.push(n);return analytics}};for(var n=0;n<analytics.methods.length;n++){var key=analytics.methods[n];analytics[key]=analytics.factory(key)}analytics.load=function(key,n){var t=document.createElement("script");t.type="text/javascript";t.async=!0;t.src="https://cdn.segment.com/analytics.js/v1/"+key+"/analytics.min.js";var r=document.getElementsByTagName("script")[0];r.parentNode.insertBefore(t,r);analytics._writeKey=key;analytics._loadOptions=n};analytics.SNIPPET_VERSION="5.2.0";
      analytics.load("${SEGMENT_WRITE_KEY}");
      analytics.page();
      }}();
    `;
    document.head.appendChild(script);
  }

  // Track custom event
  public track(event: string, properties: BaseEventProperties = {}) {
    // Add timestamp if not present
    if (!properties.timestamp) {
      properties.timestamp = Date.now();
    }

    // Add user ID if available
    if (this.userId && !properties.user_id) {
      properties.user_id = this.userId;
    }

    // Google Analytics
    if (window.gtag) {
      window.gtag('event', event, properties);
    }

    // Mixpanel
    if (window.mixpanel && 'track' in window.mixpanel) {
      window.mixpanel.track(event, properties);
    }

    // Amplitude
    if (window.amplitude && 'track' in window.amplitude) {
      window.amplitude.track(event, properties);
    }

    // Heap
    if (window.heap && typeof window.heap === 'object' && 'track' in window.heap) {
      window.heap.track(event, properties);
    }

    // Segment
    if (window.analytics && 'track' in window.analytics) {
      window.analytics.track(event, properties);
    }
  }

  // Identify user
  public identify(userId: string, traits: UserProperties = {}) {
    this.userId = userId;

    // Mixpanel
    if (window.mixpanel && 'identify' in window.mixpanel) {
      window.mixpanel.identify(userId);
      if (Object.keys(traits).length > 0 && window.mixpanel.people) {
        window.mixpanel.people.set(traits);
      }
    }

    // Amplitude
    if (window.amplitude && 'setUserId' in window.amplitude) {
      window.amplitude.setUserId(userId);
      if (Object.keys(traits).length > 0 && 'setUserProperties' in window.amplitude) {
        window.amplitude.setUserProperties(traits);
      }
    }

    // Heap
    if (window.heap && typeof window.heap === 'object' && 'identify' in window.heap) {
      window.heap.identify(userId);
      if (Object.keys(traits).length > 0 && 'addUserProperties' in window.heap) {
        window.heap.addUserProperties(traits);
      }
    }

    // Segment
    if (window.analytics && 'identify' in window.analytics) {
      window.analytics.identify(userId, traits);
    }

    // Google Analytics
    if (window.gtag) {
      window.gtag('config', import.meta.env.VITE_GA_MEASUREMENT_ID, {
        user_id: userId
      });
    }
  }

  // Track page view
  public trackPageView(pageName?: string, properties: BaseEventProperties = {}) {
    const pageProps = {
      ...properties,
      page_name: pageName || document.title,
      page_path: window.location.pathname,
      page_url: window.location.href
    };

    this.track('page_view', pageProps);
    
    // Segment specific page tracking
    if (window.analytics && 'page' in window.analytics) {
      window.analytics.page(pageName, pageProps);
    }
  }

  // Track registration step
  public trackRegistrationStep(step: number, stepName: string, formData?: RegistrationFormData) {
    this.track('registration_step_completed', {
      step_number: step,
      step_name: stepName,
      ...formData
    });
  }

  // Track login attempt
  public trackLoginAttempt(success: boolean, method: string) {
    this.track(success ? 'login_success' : 'login_failed', {
      method,
      timestamp: Date.now()
    });
  }

  // Track conversion
  public trackConversion(type: string, value?: number, currency?: string) {
    this.track('conversion', {
      conversion_type: type,
      value,
      currency: currency || 'TRY'
    });
  }

  // Track error
  public trackError(error: Error, context?: object) {
    this.track('error_occurred', {
      error_message: error.message,
      error_stack: error.stack,
      ...context
    });
  }

  // Reset user session
  public reset() {
    this.userId = null;

    if (window.mixpanel && 'reset' in window.mixpanel) {
      window.mixpanel.reset();
    }

    if (window.analytics && 'reset' in window.analytics) {
      window.analytics.reset();
    }
  }
}

export const analytics = new AnalyticsService();