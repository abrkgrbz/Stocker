/**
 * Deep Linking Service for Stocker Mobile
 *
 * Handles URL scheme and universal links for deep navigation.
 * Supports stocker://, https://stocker.app, and https://app.stocker.com
 */

import { useEffect, useCallback, useState } from 'react';
import { Linking, Platform } from 'react-native';
import * as ExpoLinking from 'expo-linking';
import { router } from 'expo-router';
import { analytics, AnalyticsEvents } from '@/lib/analytics';

// ============================================
// Types
// ============================================

export interface DeepLinkRoute {
    /** Route path pattern (e.g., '/customers/:id') */
    pattern: string;
    /** Target screen path in expo-router */
    screen: string;
    /** Auth required to access this route */
    requiresAuth?: boolean;
    /** Parameter transformations */
    params?: Record<string, (value: string) => any>;
}

export interface ParsedDeepLink {
    /** Original URL */
    url: string;
    /** Matched route config */
    route: DeepLinkRoute | null;
    /** Extracted parameters */
    params: Record<string, any>;
    /** Query parameters */
    query: Record<string, string>;
    /** Whether the link is valid */
    isValid: boolean;
    /** Error message if invalid */
    error?: string;
}

export interface DeepLinkConfig {
    /** URL schemes (e.g., ['stocker', 'stockerapp']) */
    schemes: string[];
    /** Universal link domains */
    domains: string[];
    /** Route definitions */
    routes: DeepLinkRoute[];
    /** Default route if no match */
    defaultRoute?: string;
    /** Callback when link is handled */
    onLinkHandled?: (link: ParsedDeepLink) => void;
    /** Callback when link fails */
    onLinkError?: (error: Error, url: string) => void;
}

// ============================================
// Constants
// ============================================

const DEFAULT_CONFIG: DeepLinkConfig = {
    schemes: ['stocker', 'stockerapp'],
    domains: ['stocker.app', 'app.stocker.com'],
    routes: [],
    defaultRoute: '/(dashboard)',
};

// Standard routes for Stocker app
export const STOCKER_ROUTES: DeepLinkRoute[] = [
    // Dashboard
    {
        pattern: '/',
        screen: '/(dashboard)',
        requiresAuth: true,
    },
    {
        pattern: '/dashboard',
        screen: '/(dashboard)',
        requiresAuth: true,
    },

    // Customers
    {
        pattern: '/customers',
        screen: '/(dashboard)/crm/customers',
        requiresAuth: true,
    },
    {
        pattern: '/customers/:id',
        screen: '/(dashboard)/crm/customers/[id]',
        requiresAuth: true,
        params: {
            id: (value) => value,
        },
    },
    {
        pattern: '/customer/:id',
        screen: '/(dashboard)/crm/customers/[id]',
        requiresAuth: true,
        params: {
            id: (value) => value,
        },
    },

    // Products
    {
        pattern: '/products',
        screen: '/(dashboard)/inventory/products',
        requiresAuth: true,
    },
    {
        pattern: '/products/:id',
        screen: '/(dashboard)/inventory/products/[id]',
        requiresAuth: true,
        params: {
            id: (value) => value,
        },
    },
    {
        pattern: '/product/:id',
        screen: '/(dashboard)/inventory/products/[id]',
        requiresAuth: true,
        params: {
            id: (value) => value,
        },
    },

    // Orders
    {
        pattern: '/orders',
        screen: '/(dashboard)/orders',
        requiresAuth: true,
    },
    {
        pattern: '/orders/:id',
        screen: '/(dashboard)/orders/[id]',
        requiresAuth: true,
        params: {
            id: (value) => value,
        },
    },
    {
        pattern: '/order/:id',
        screen: '/(dashboard)/orders/[id]',
        requiresAuth: true,
        params: {
            id: (value) => value,
        },
    },

    // Settings
    {
        pattern: '/settings',
        screen: '/(dashboard)/settings',
        requiresAuth: true,
    },
    {
        pattern: '/settings/:section',
        screen: '/(dashboard)/settings',
        requiresAuth: true,
        params: {
            section: (value) => value,
        },
    },

    // Auth
    {
        pattern: '/login',
        screen: '/(auth)/login',
        requiresAuth: false,
    },
    {
        pattern: '/reset-password',
        screen: '/(auth)/reset-password',
        requiresAuth: false,
    },
    {
        pattern: '/reset-password/:token',
        screen: '/(auth)/reset-password',
        requiresAuth: false,
        params: {
            token: (value) => value,
        },
    },

    // Sharing/External
    {
        pattern: '/share/product/:id',
        screen: '/(dashboard)/inventory/products/[id]',
        requiresAuth: true,
        params: {
            id: (value) => value,
        },
    },
    {
        pattern: '/share/customer/:id',
        screen: '/(dashboard)/crm/customers/[id]',
        requiresAuth: true,
        params: {
            id: (value) => value,
        },
    },
];

// ============================================
// Deep Link Service Class
// ============================================

class DeepLinkService {
    private config: DeepLinkConfig;
    private isInitialized: boolean = false;
    private pendingLink: string | null = null;
    private isAuthenticated: boolean = false;

    constructor(config: Partial<DeepLinkConfig> = {}) {
        this.config = {
            ...DEFAULT_CONFIG,
            ...config,
            routes: [...STOCKER_ROUTES, ...(config.routes || [])],
        };
    }

    /**
     * Initialize the deep link service
     */
    async initialize(): Promise<void> {
        if (this.isInitialized) return;

        // Check for initial URL (app opened via deep link)
        const initialUrl = await ExpoLinking.getInitialURL();
        if (initialUrl) {
            this.pendingLink = initialUrl;
        }

        this.isInitialized = true;
        console.log('[DeepLink] Service initialized');
    }

    /**
     * Set authentication status
     */
    setAuthenticated(authenticated: boolean): void {
        this.isAuthenticated = authenticated;

        // Process pending link if authenticated
        if (authenticated && this.pendingLink) {
            this.handleUrl(this.pendingLink);
            this.pendingLink = null;
        }
    }

    /**
     * Parse a deep link URL
     */
    parseUrl(url: string): ParsedDeepLink {
        try {
            const parsed = ExpoLinking.parse(url);
            const path = parsed.path || '/';
            const query = (parsed.queryParams || {}) as Record<string, string>;

            // Find matching route
            const matchedRoute = this.findMatchingRoute(path);

            if (!matchedRoute) {
                return {
                    url,
                    route: null,
                    params: {},
                    query,
                    isValid: false,
                    error: `No matching route for path: ${path}`,
                };
            }

            // Extract parameters from path
            const params = this.extractParams(path, matchedRoute);

            return {
                url,
                route: matchedRoute,
                params,
                query,
                isValid: true,
            };
        } catch (error) {
            return {
                url,
                route: null,
                params: {},
                query: {},
                isValid: false,
                error: error instanceof Error ? error.message : 'Failed to parse URL',
            };
        }
    }

    /**
     * Handle a deep link URL
     */
    async handleUrl(url: string): Promise<boolean> {
        const parsed = this.parseUrl(url);

        // Track deep link event
        analytics.track(AnalyticsEvents.FEATURE_USE, {
            feature: 'deep_link',
            url: url,
            path: parsed.route?.pattern || 'unknown',
            is_valid: parsed.isValid,
        });

        if (!parsed.isValid) {
            console.warn('[DeepLink] Invalid URL:', parsed.error);
            this.config.onLinkError?.(new Error(parsed.error || 'Invalid URL'), url);
            return false;
        }

        const route = parsed.route!;

        // Check authentication requirement
        if (route.requiresAuth && !this.isAuthenticated) {
            console.log('[DeepLink] Auth required, saving for later:', url);
            this.pendingLink = url;
            // Navigate to login
            router.replace('/(auth)/login');
            return false;
        }

        try {
            // Build target path with params
            let targetPath = route.screen;
            for (const [key, value] of Object.entries(parsed.params)) {
                targetPath = targetPath.replace(`[${key}]`, String(value));
            }

            // Add query params
            const queryString = new URLSearchParams(parsed.query).toString();
            if (queryString) {
                targetPath += `?${queryString}`;
            }

            console.log('[DeepLink] Navigating to:', targetPath);
            router.push(targetPath as any);

            this.config.onLinkHandled?.(parsed);
            return true;
        } catch (error) {
            console.error('[DeepLink] Navigation error:', error);
            this.config.onLinkError?.(error as Error, url);
            return false;
        }
    }

    /**
     * Create a deep link URL
     */
    createUrl(route: string, params?: Record<string, any>, query?: Record<string, string>): string {
        let path = route;

        // Replace params in path
        if (params) {
            for (const [key, value] of Object.entries(params)) {
                path = path.replace(`:${key}`, String(value));
            }
        }

        // Create URL with scheme
        const scheme = this.config.schemes[0];
        let url = `${scheme}://${path}`;

        // Add query params
        if (query && Object.keys(query).length > 0) {
            const queryString = new URLSearchParams(query).toString();
            url += `?${queryString}`;
        }

        return url;
    }

    /**
     * Create a universal link URL
     */
    createUniversalUrl(route: string, params?: Record<string, any>, query?: Record<string, string>): string {
        let path = route;

        // Replace params in path
        if (params) {
            for (const [key, value] of Object.entries(params)) {
                path = path.replace(`:${key}`, String(value));
            }
        }

        // Create URL with domain
        const domain = this.config.domains[0];
        let url = `https://${domain}${path}`;

        // Add query params
        if (query && Object.keys(query).length > 0) {
            const queryString = new URLSearchParams(query).toString();
            url += `?${queryString}`;
        }

        return url;
    }

    /**
     * Get pending link (for post-auth handling)
     */
    getPendingLink(): string | null {
        return this.pendingLink;
    }

    /**
     * Clear pending link
     */
    clearPendingLink(): void {
        this.pendingLink = null;
    }

    // Private methods

    private findMatchingRoute(path: string): DeepLinkRoute | null {
        for (const route of this.config.routes) {
            if (this.matchesPattern(path, route.pattern)) {
                return route;
            }
        }
        return null;
    }

    private matchesPattern(path: string, pattern: string): boolean {
        const pathParts = path.split('/').filter(Boolean);
        const patternParts = pattern.split('/').filter(Boolean);

        if (pathParts.length !== patternParts.length) {
            return false;
        }

        return patternParts.every((part, index) => {
            if (part.startsWith(':')) {
                return true; // Parameter placeholder matches anything
            }
            return part === pathParts[index];
        });
    }

    private extractParams(path: string, route: DeepLinkRoute): Record<string, any> {
        const params: Record<string, any> = {};
        const pathParts = path.split('/').filter(Boolean);
        const patternParts = route.pattern.split('/').filter(Boolean);

        patternParts.forEach((part, index) => {
            if (part.startsWith(':')) {
                const paramName = part.slice(1);
                let value: any = pathParts[index];

                // Apply transformation if defined
                if (route.params?.[paramName]) {
                    value = route.params[paramName](value);
                }

                params[paramName] = value;
            }
        });

        return params;
    }
}

// ============================================
// Singleton Instance
// ============================================

export const deepLinkService = new DeepLinkService();

// ============================================
// React Hooks
// ============================================

/**
 * Hook for handling deep links
 */
export function useDeepLinking(onLink?: (parsed: ParsedDeepLink) => void) {
    const [lastLink, setLastLink] = useState<ParsedDeepLink | null>(null);

    useEffect(() => {
        // Initialize service
        deepLinkService.initialize();

        // Handle URL events
        const handleUrl = (event: { url: string }) => {
            const parsed = deepLinkService.parseUrl(event.url);
            setLastLink(parsed);
            onLink?.(parsed);
            deepLinkService.handleUrl(event.url);
        };

        // Listen for incoming links
        const subscription = Linking.addEventListener('url', handleUrl);

        // Check initial URL
        ExpoLinking.getInitialURL().then((url) => {
            if (url) {
                handleUrl({ url });
            }
        });

        return () => {
            subscription.remove();
        };
    }, [onLink]);

    return {
        lastLink,
        parseUrl: (url: string) => deepLinkService.parseUrl(url),
        handleUrl: (url: string) => deepLinkService.handleUrl(url),
        createUrl: (route: string, params?: Record<string, any>, query?: Record<string, string>) =>
            deepLinkService.createUrl(route, params, query),
        createUniversalUrl: (route: string, params?: Record<string, any>, query?: Record<string, string>) =>
            deepLinkService.createUniversalUrl(route, params, query),
    };
}

/**
 * Hook for creating shareable links
 */
export function useShareableLink() {
    const createCustomerLink = useCallback((customerId: string, universal = true) => {
        if (universal) {
            return deepLinkService.createUniversalUrl('/customers/:id', { id: customerId });
        }
        return deepLinkService.createUrl('/customers/:id', { id: customerId });
    }, []);

    const createProductLink = useCallback((productId: string, universal = true) => {
        if (universal) {
            return deepLinkService.createUniversalUrl('/products/:id', { id: productId });
        }
        return deepLinkService.createUrl('/products/:id', { id: productId });
    }, []);

    const createOrderLink = useCallback((orderId: string, universal = true) => {
        if (universal) {
            return deepLinkService.createUniversalUrl('/orders/:id', { id: orderId });
        }
        return deepLinkService.createUrl('/orders/:id', { id: orderId });
    }, []);

    return {
        createCustomerLink,
        createProductLink,
        createOrderLink,
    };
}

/**
 * Hook for authentication-aware deep linking
 */
export function useAuthenticatedDeepLinking(isAuthenticated: boolean) {
    useEffect(() => {
        deepLinkService.setAuthenticated(isAuthenticated);
    }, [isAuthenticated]);

    const processPendingLink = useCallback(async () => {
        const pending = deepLinkService.getPendingLink();
        if (pending && isAuthenticated) {
            await deepLinkService.handleUrl(pending);
            deepLinkService.clearPendingLink();
            return true;
        }
        return false;
    }, [isAuthenticated]);

    return {
        processPendingLink,
        hasPendingLink: !!deepLinkService.getPendingLink(),
    };
}

// ============================================
// Utility Functions
// ============================================

/**
 * Check if a URL is a valid deep link for this app
 */
export function isValidDeepLink(url: string): boolean {
    const parsed = deepLinkService.parseUrl(url);
    return parsed.isValid;
}

/**
 * Get the Expo Linking URL for the app
 */
export function getAppUrl(): string {
    return ExpoLinking.createURL('/');
}

/**
 * Open a URL in the default browser
 */
export async function openExternalUrl(url: string): Promise<boolean> {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
        await Linking.openURL(url);
        return true;
    }
    return false;
}

export default deepLinkService;
