using Stocker.Modules.Manufacturing.Domain.Entities;
using Stocker.Modules.Manufacturing.Domain.Enums;

namespace Stocker.Modules.Manufacturing.Domain.Repositories;

/// <summary>
/// Uygunsuzluk Raporu (NCR) repository arayüzü
/// </summary>
public interface INonConformanceReportRepository
{
    // Temel CRUD
    Task<NonConformanceReport?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<NonConformanceReport?> GetByIdWithDetailsAsync(int id, CancellationToken cancellationToken = default);
    Task<NonConformanceReport?> GetByNcrNumberAsync(string ncrNumber, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<NonConformanceReport>> GetAllAsync(CancellationToken cancellationToken = default);
    Task AddAsync(NonConformanceReport ncr, CancellationToken cancellationToken = default);
    void Update(NonConformanceReport ncr);
    void Delete(NonConformanceReport ncr);

    // Durum bazlı sorgular
    Task<IReadOnlyList<NonConformanceReport>> GetByStatusAsync(NcrStatus status, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<NonConformanceReport>> GetOpenNcrsAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<NonConformanceReport>> GetClosedNcrsAsync(DateTime? fromDate, DateTime? toDate, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<NonConformanceReport>> GetOverdueNcrsAsync(CancellationToken cancellationToken = default);

    // İlişkili kayıt bazlı sorgular
    Task<IReadOnlyList<NonConformanceReport>> GetByProductionOrderAsync(int productionOrderId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<NonConformanceReport>> GetByProductAsync(int productId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<NonConformanceReport>> GetByWorkCenterAsync(int workCenterId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<NonConformanceReport>> GetByQualityInspectionAsync(int qualityInspectionId, CancellationToken cancellationToken = default);

    // Kaynak bazlı sorgular
    Task<IReadOnlyList<NonConformanceReport>> GetBySourceAsync(NcrSource source, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<NonConformanceReport>> GetBySeverityAsync(NcrSeverity severity, CancellationToken cancellationToken = default);

    // Müşteri/Tedarikçi bazlı sorgular
    Task<IReadOnlyList<NonConformanceReport>> GetByCustomerAsync(int customerId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<NonConformanceReport>> GetBySupplierAsync(int supplierId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<NonConformanceReport>> GetPendingCustomerNotificationAsync(CancellationToken cancellationToken = default);

    // Tarih bazlı sorgular
    Task<IReadOnlyList<NonConformanceReport>> GetByDateRangeAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<NonConformanceReport>> GetByDetectionDateAsync(DateTime date, CancellationToken cancellationToken = default);

    // Lot/Seri bazlı sorgular
    Task<IReadOnlyList<NonConformanceReport>> GetByLotNumberAsync(string lotNumber, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<NonConformanceReport>> GetBySerialNumberAsync(string serialNumber, CancellationToken cancellationToken = default);

    // İstatistik sorguları
    Task<int> GetCountByStatusAsync(NcrStatus status, CancellationToken cancellationToken = default);
    Task<int> GetCountBySeverityAsync(NcrSeverity severity, DateTime? fromDate, DateTime? toDate, CancellationToken cancellationToken = default);
    Task<decimal> GetTotalCostAsync(DateTime? fromDate, DateTime? toDate, CancellationToken cancellationToken = default);
    Task<Dictionary<NcrSource, int>> GetCountBySourceAsync(DateTime? fromDate, DateTime? toDate, CancellationToken cancellationToken = default);
    Task<Dictionary<RootCauseCategory, int>> GetCountByRootCauseAsync(DateTime? fromDate, DateTime? toDate, CancellationToken cancellationToken = default);

    // Numara üretimi
    Task<string> GenerateNcrNumberAsync(CancellationToken cancellationToken = default);
}

/// <summary>
/// Düzeltici/Önleyici Faaliyet (CAPA) repository arayüzü
/// </summary>
public interface ICorrectivePreventiveActionRepository
{
    // Temel CRUD
    Task<CorrectivePreventiveAction?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<CorrectivePreventiveAction?> GetByIdWithDetailsAsync(int id, CancellationToken cancellationToken = default);
    Task<CorrectivePreventiveAction?> GetByCapaNumberAsync(string capaNumber, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<CorrectivePreventiveAction>> GetAllAsync(CancellationToken cancellationToken = default);
    Task AddAsync(CorrectivePreventiveAction capa, CancellationToken cancellationToken = default);
    void Update(CorrectivePreventiveAction capa);
    void Delete(CorrectivePreventiveAction capa);

    // Durum bazlı sorgular
    Task<IReadOnlyList<CorrectivePreventiveAction>> GetByStatusAsync(CapaStatus status, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<CorrectivePreventiveAction>> GetOpenCapasAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<CorrectivePreventiveAction>> GetClosedCapasAsync(DateTime? fromDate, DateTime? toDate, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<CorrectivePreventiveAction>> GetOverdueCapasAsync(CancellationToken cancellationToken = default);

    // Tip bazlı sorgular
    Task<IReadOnlyList<CorrectivePreventiveAction>> GetByTypeAsync(CapaType type, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<CorrectivePreventiveAction>> GetCorrectiveActionsAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<CorrectivePreventiveAction>> GetPreventiveActionsAsync(CancellationToken cancellationToken = default);

    // Öncelik bazlı sorgular
    Task<IReadOnlyList<CorrectivePreventiveAction>> GetByPriorityAsync(CapaPriority priority, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<CorrectivePreventiveAction>> GetHighPriorityCapasAsync(CancellationToken cancellationToken = default);

    // NCR bazlı sorgular
    Task<IReadOnlyList<CorrectivePreventiveAction>> GetByNcrIdAsync(int ncrId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<CorrectivePreventiveAction>> GetStandaloneCapasAsync(CancellationToken cancellationToken = default);

    // Sorumluluk bazlı sorgular
    Task<IReadOnlyList<CorrectivePreventiveAction>> GetByResponsibleUserAsync(int userId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<CorrectivePreventiveAction>> GetByDepartmentAsync(string department, CancellationToken cancellationToken = default);

    // Tarih bazlı sorgular
    Task<IReadOnlyList<CorrectivePreventiveAction>> GetByDueDateRangeAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<CorrectivePreventiveAction>> GetDueSoonAsync(int days, CancellationToken cancellationToken = default);

    // Etkinlik değerlendirmesi
    Task<IReadOnlyList<CorrectivePreventiveAction>> GetPendingEffectivenessReviewAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<CorrectivePreventiveAction>> GetIneffectiveCapasAsync(CancellationToken cancellationToken = default);

    // İstatistik sorguları
    Task<int> GetCountByStatusAsync(CapaStatus status, CancellationToken cancellationToken = default);
    Task<int> GetCountByTypeAsync(CapaType type, CancellationToken cancellationToken = default);
    Task<decimal> GetAverageCompletionDaysAsync(DateTime? fromDate, DateTime? toDate, CancellationToken cancellationToken = default);
    Task<decimal> GetOnTimeCompletionRateAsync(DateTime? fromDate, DateTime? toDate, CancellationToken cancellationToken = default);
    Task<Dictionary<RootCauseCategory, int>> GetCountByRootCauseAsync(DateTime? fromDate, DateTime? toDate, CancellationToken cancellationToken = default);

    // Numara üretimi
    Task<string> GenerateCapaNumberAsync(CancellationToken cancellationToken = default);
}
