import { tenantService } from './tenantService';
import { invoiceService } from './invoiceService';
// import { monitoringService } from './monitoringService'; // Planned for next phase, but we can structure it now

export interface DashboardStatsDto {
    totalRevenue: number;
    activeUsers: number;
    growthRate: number;
    systemHealth: string;
    monthlyRevenue: number[]; // Trend
    packageDistribution: { label: string; value: number; color: string }[];
}

class AnalyticsService {

    async getDashboardStats(): Promise<DashboardStatsDto> {
        // Aggregate data from valid endpoints
        try {
            const [tenantStats, invoices] = await Promise.all([
                tenantService.getStatistics(),
                invoiceService.getAll()
            ]);

            const estimatedTotalActiveUsers = Math.round((tenantStats.activeTenants || 0) * (tenantStats.averageUsersPerTenant || 0));

            // Calculate Revenue Trend (Mocking trend for now as InvoiceDto specific logic is complex without backend aggregation)
            const revenue = invoices.invoices.reduce((acc, inv) => acc + inv.totalAmount, 0);

            return {
                totalRevenue: revenue,
                activeUsers: estimatedTotalActiveUsers,
                growthRate: tenantStats.churnRate ? -tenantStats.churnRate : 0, // Simplified
                systemHealth: "Healthy", // Placeholder until Monitoring Phase
                monthlyRevenue: [45, 60, 75, 80, 55, 90, revenue / 1000], // Mock trend + current
                packageDistribution: Object.entries(tenantStats.tenantsByPackage || {}).map(([key, value], index) => ({
                    label: key,
                    value: value,
                    color: index === 0 ? 'bg-indigo-500' : index === 1 ? 'bg-emerald-500' : 'bg-amber-500'
                }))
            };
        } catch (error) {
            console.error("Analytics aggregation failed", error);
            // Return empty safe data
            return {
                totalRevenue: 0,
                activeUsers: 0,
                growthRate: 0,
                systemHealth: "Unknown",
                monthlyRevenue: [],
                packageDistribution: []
            };
        }
    }
}

export const analyticsService = new AnalyticsService();
