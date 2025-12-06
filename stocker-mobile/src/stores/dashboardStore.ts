import { create } from 'zustand';
import { apiService } from '../services/api';

interface DashboardStats {
    salesStats: {
        dailyTotal: number;
        dailyTrend: number;
        weeklyTotal: number;
        weeklyTrend: number;
    } | null;
    crmStats: {
        newCustomers: number;
        customerTrend: number;
        activeDeals: number;
    } | null;
    isLoading: boolean;
    error: string | null;
    lastUpdated: number | null;

    fetchDashboardData: () => Promise<void>;
}

export const useDashboardStore = create<DashboardStats>((set) => ({
    salesStats: null,
    crmStats: null,
    isLoading: false,
    error: null,
    lastUpdated: null,

    fetchDashboardData: async () => {
        set({ isLoading: true, error: null });
        try {
            // Fetch data in parallel
            const [salesResponse, crmResponse] = await Promise.all([
                apiService.sales.getDashboardStats(),
                apiService.crm.getStats()
            ]);

            let salesStats = null;
            let crmStats = null;

            if (salesResponse.data?.success) {
                salesStats = salesResponse.data.data;
            }

            if (crmResponse.data?.success) {
                crmStats = crmResponse.data.data;
            }

            set({
                salesStats,
                crmStats,
                isLoading: false,
                lastUpdated: Date.now()
            });
        } catch (error: any) {
            console.error('Dashboard fetch error:', error);
            set({
                isLoading: false,
                error: error.message || 'Veriler yüklenirken bir hata oluştu'
            });
        }
    }
}));
