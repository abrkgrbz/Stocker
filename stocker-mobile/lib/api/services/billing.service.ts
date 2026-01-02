import api from '@/lib/axios';
import type {
    SubscriptionInfo,
    SubscriptionResponse,
    Plan,
    PlansResponse,
    CheckoutRequest,
    CheckoutResponse,
    PortalUrlResponse,
    TrialInfo,
} from '../types/billing.types';

class BillingService {
    private readonly baseUrl = '/tenant/billing';

    /**
     * Get available subscription plans
     */
    async getPlans(): Promise<Plan[]> {
        const response = await api.get<PlansResponse>(`${this.baseUrl}/plans`);
        return response.data.plans || [];
    }

    /**
     * Get current subscription information
     */
    async getSubscription(): Promise<SubscriptionInfo | null> {
        try {
            const response = await api.get<SubscriptionResponse>(`${this.baseUrl}/subscription`);
            return response.data.subscription || null;
        } catch (error: any) {
            if (error.response?.status === 404) {
                return null;
            }
            throw error;
        }
    }

    /**
     * Create a checkout session for purchasing a subscription
     */
    async createCheckout(request: CheckoutRequest): Promise<CheckoutResponse> {
        const response = await api.post<CheckoutResponse>(`${this.baseUrl}/checkout`, request);
        return response.data;
    }

    /**
     * Cancel the current subscription
     */
    async cancelSubscription(): Promise<void> {
        await api.post(`${this.baseUrl}/subscription/cancel`);
    }

    /**
     * Pause the current subscription
     */
    async pauseSubscription(): Promise<void> {
        await api.post(`${this.baseUrl}/subscription/pause`);
    }

    /**
     * Resume a paused subscription
     */
    async resumeSubscription(): Promise<void> {
        await api.post(`${this.baseUrl}/subscription/resume`);
    }

    /**
     * Change subscription plan
     */
    async changePlan(newVariantId: string): Promise<void> {
        await api.post(`${this.baseUrl}/subscription/change-plan`, { newVariantId });
    }

    /**
     * Get customer portal URL for managing subscription
     */
    async getPortalUrl(): Promise<string | null> {
        try {
            const response = await api.get<PortalUrlResponse>(`${this.baseUrl}/portal`);
            return response.data.portalUrl || null;
        } catch (error: any) {
            if (error.response?.status === 404) {
                return null;
            }
            throw error;
        }
    }

    /**
     * Calculate trial information from subscription
     */
    getTrialInfo(subscription: SubscriptionInfo | null): TrialInfo {
        if (!subscription) {
            return {
                isInTrial: false,
                daysRemaining: 0,
            };
        }

        const isInTrial = subscription.status === 'trial' || !!subscription.trialEndsAt;

        if (!isInTrial || !subscription.trialEndsAt) {
            return {
                isInTrial: false,
                daysRemaining: 0,
            };
        }

        const trialEndDate = new Date(subscription.trialEndsAt);
        const now = new Date();
        const diffTime = trialEndDate.getTime() - now.getTime();
        const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

        return {
            isInTrial: true,
            daysRemaining,
            trialEndDate: subscription.trialEndsAt,
        };
    }

    /**
     * Get formatted status text in Turkish
     */
    getStatusText(status: string): string {
        const statusMap: Record<string, string> = {
            'trial': 'Deneme Süreci',
            'active': 'Aktif',
            'cancelled': 'İptal Edildi',
            'paused': 'Duraklatıldı',
            'past_due': 'Ödeme Gecikmiş',
            'unpaid': 'Ödenmemiş',
            'expired': 'Süresi Dolmuş',
        };
        return statusMap[status.toLowerCase()] || status;
    }

    /**
     * Get status color for UI
     */
    getStatusColor(status: string): { bg: string; text: string } {
        const colorMap: Record<string, { bg: string; text: string }> = {
            'trial': { bg: '#dbeafe', text: '#2563eb' },
            'active': { bg: '#d1fae5', text: '#059669' },
            'cancelled': { bg: '#fee2e2', text: '#dc2626' },
            'paused': { bg: '#fef3c7', text: '#d97706' },
            'past_due': { bg: '#fee2e2', text: '#dc2626' },
            'unpaid': { bg: '#fee2e2', text: '#dc2626' },
            'expired': { bg: '#f3f4f6', text: '#6b7280' },
        };
        return colorMap[status.toLowerCase()] || { bg: '#f3f4f6', text: '#6b7280' };
    }
}

export const billingService = new BillingService();
export default billingService;
