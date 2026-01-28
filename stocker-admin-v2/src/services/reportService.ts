import { auditLogService } from './auditLogService';

export interface ReportTypeDto {
    id: string;
    name: string;
    description: string;
    category: string;
    supportedFormats: ('csv' | 'excel' | 'pdf')[];
}

class ReportService {

    getAvailableReports(): ReportTypeDto[] {
        return [
            {
                id: 'audit_logs',
                name: 'Denetim Kayıtları',
                description: 'Sistem genelindeki tüm işlem kayıtları, güvenlik olayları ve erişim logları.',
                category: 'Security',
                supportedFormats: ['csv', 'excel']
            },
            {
                id: 'billing_summary',
                name: 'Faturalama Özeti',
                description: 'Dönemsel gelir gider raporları ve fatura dökümleri.',
                category: 'Finance',
                supportedFormats: ['csv'] // Assuming CSV export for invoices might be added later or we simulate it
            },
            {
                id: 'tenant_usage',
                name: 'Tenant Kullanım',
                description: 'Müşteri bazlı kaynak kullanım istatistikleri.',
                category: 'Usage',
                supportedFormats: ['excel']
            }
        ];
    }

    async exportReport(typeId: string, format: 'csv' | 'excel' | 'pdf', params?: any): Promise<Blob | null> {
        console.log(`Exporting report: ${typeId} in ${format}`, params);

        if (typeId === 'audit_logs') {
            if (format === 'excel') return await auditLogService.exportExcel(params);
            return await auditLogService.exportCsv(params);
        }

        // Placeholder for other reports until API endpoints are confirmed
        // if (typeId === 'billing_summary') return await billingService.export(params);

        throw new Error(`Report type ${typeId} or format ${format} not supported yet.`);
    }
}

export const reportService = new ReportService();
