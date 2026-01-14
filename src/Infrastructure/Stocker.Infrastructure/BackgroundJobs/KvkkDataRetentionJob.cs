using Hangfire;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.Modules.HR.Domain.Enums;

namespace Stocker.Infrastructure.BackgroundJobs;

/// <summary>
/// KVKK (Kişisel Verilerin Korunması Kanunu) uyumlu veri saklama süresi yönetimi.
/// İşten ayrılan çalışanların kişisel verilerini yasal saklama süresi dolduğunda anonimleştirir.
///
/// Yasal dayanak:
/// - KVKK Madde 7: Kişisel verilerin silinmesi, yok edilmesi veya anonim hale getirilmesi
/// - İş Kanunu: 10 yıl saklama süresi (bordro, özlük dosyası)
/// - SGK Mevzuatı: 10 yıl saklama süresi
/// </summary>
public class KvkkDataRetentionJob
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<KvkkDataRetentionJob> _logger;

    /// <summary>
    /// Varsayılan saklama süresi (yıl)
    /// İş Kanunu ve SGK mevzuatına göre 10 yıl
    /// </summary>
    private const int DefaultRetentionYears = 10;

    public KvkkDataRetentionJob(
        IServiceProvider serviceProvider,
        ILogger<KvkkDataRetentionJob> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    /// <summary>
    /// Saklama süresi dolan çalışan verilerini anonimleştirir.
    /// Her ayın 1'inde gece 03:00'te çalışır.
    /// </summary>
    [AutomaticRetry(Attempts = 3, DelaysInSeconds = new[] { 60, 300, 900 })]
    [Queue("maintenance")]
    public async Task ExecuteAsync()
    {
        using var scope = _serviceProvider.CreateScope();
        var masterContext = scope.ServiceProvider.GetRequiredService<IMasterDbContext>();

        _logger.LogInformation("KVKK veri saklama süresi kontrolü başlatılıyor");

        try
        {
            var cutoffDate = DateTime.UtcNow.AddYears(-DefaultRetentionYears);
            var totalAnonymized = 0;
            var tenantsProcessed = 0;

            // Tüm aktif tenant'ları al
            var tenants = await masterContext.Tenants
                .Where(t => t.IsActive)
                .Select(t => new { t.Id, t.Name })
                .ToListAsync();

            _logger.LogInformation("KVKK kontrolü için {TenantCount} tenant bulundu", tenants.Count);

            foreach (var tenant in tenants)
            {
                try
                {
                    var anonymizedCount = await ProcessTenantEmployeesAsync(tenant.Id, tenant.Name, cutoffDate);
                    totalAnonymized += anonymizedCount;
                    tenantsProcessed++;
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex,
                        "Tenant {TenantId} için KVKK işlemi sırasında hata oluştu",
                        tenant.Id);
                    // Diğer tenant'larla devam et
                }
            }

            _logger.LogInformation(
                "KVKK veri saklama kontrolü tamamlandı. {Tenants} tenant işlendi, {Total} çalışan verisi anonimleştirildi",
                tenantsProcessed, totalAnonymized);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "KVKK veri saklama işinde beklenmeyen hata");
            throw; // Hangfire retry için tekrar fırlat
        }
    }

    private async Task<int> ProcessTenantEmployeesAsync(Guid tenantId, string tenantName, DateTime cutoffDate)
    {
        using var scope = _serviceProvider.CreateScope();

        // HR modül context'ini al
        var hrDbContextFactory = scope.ServiceProvider.GetService<IHRDbContextFactory>();
        if (hrDbContextFactory == null)
        {
            _logger.LogDebug("HR modülü tenant {TenantId} için aktif değil", tenantId);
            return 0;
        }

        var hrContext = await hrDbContextFactory.CreateDbContextAsync(tenantId);
        if (hrContext == null)
        {
            _logger.LogWarning("Tenant {TenantId} için HR context oluşturulamadı", tenantId);
            return 0;
        }

        // Saklama süresi dolmuş, işten ayrılmış çalışanları bul
        var expiredEmployees = await hrContext.Employees
            .Where(e => e.Status == EmployeeStatus.Terminated ||
                       e.Status == EmployeeStatus.Resigned ||
                       e.Status == EmployeeStatus.Retired)
            .Where(e => e.TerminationDate.HasValue && e.TerminationDate.Value < cutoffDate)
            .Where(e => e.FirstName != "Anonim") // Zaten anonimleştirilmemişleri al
            .ToListAsync();

        if (!expiredEmployees.Any())
        {
            return 0;
        }

        _logger.LogInformation(
            "Tenant {TenantName} ({TenantId}) için {Count} çalışan verisi anonimleştirilecek",
            tenantName, tenantId, expiredEmployees.Count);

        foreach (var employee in expiredEmployees)
        {
            // Anonimleştirme öncesi audit log oluştur
            _logger.LogInformation(
                "KVKK: Çalışan {EmployeeCode} verisi anonimleştiriliyor. İşten ayrılma: {TerminationDate}, Saklama süresi: {RetentionYears} yıl",
                employee.EmployeeCode,
                employee.TerminationDate?.ToString("yyyy-MM-dd"),
                DefaultRetentionYears);

            employee.AnonymizePersonalData();
        }

        await hrContext.SaveChangesAsync();

        _logger.LogInformation(
            "Tenant {TenantName} için {Count} çalışan verisi başarıyla anonimleştirildi",
            tenantName, expiredEmployees.Count);

        return expiredEmployees.Count;
    }

    /// <summary>
    /// Belirli bir çalışanın verilerini manuel olarak anonimleştirir.
    /// KVKK Madde 11 - İlgili kişinin talebi üzerine
    /// </summary>
    /// <param name="tenantId">Tenant ID</param>
    /// <param name="employeeId">Çalışan ID</param>
    /// <param name="requestedBy">Talebi yapan kullanıcı</param>
    [Queue("default")]
    public async Task AnonymizeEmployeeOnRequestAsync(Guid tenantId, int employeeId, string requestedBy)
    {
        using var scope = _serviceProvider.CreateScope();

        _logger.LogInformation(
            "KVKK veri silme talebi alındı. Tenant: {TenantId}, Çalışan: {EmployeeId}, Talep eden: {RequestedBy}",
            tenantId, employeeId, requestedBy);

        var hrDbContextFactory = scope.ServiceProvider.GetService<IHRDbContextFactory>();
        if (hrDbContextFactory == null)
        {
            throw new InvalidOperationException("HR modülü aktif değil");
        }

        var hrContext = await hrDbContextFactory.CreateDbContextAsync(tenantId);
        if (hrContext == null)
        {
            throw new InvalidOperationException($"Tenant {tenantId} için HR context oluşturulamadı");
        }

        var employee = await hrContext.Employees
            .FirstOrDefaultAsync(e => e.Id == employeeId);

        if (employee == null)
        {
            throw new InvalidOperationException($"Çalışan bulunamadı: {employeeId}");
        }

        // Yasal saklama süresi kontrolü
        if (!employee.IsDataRetentionExpired())
        {
            _logger.LogWarning(
                "KVKK: Çalışan {EmployeeId} için yasal saklama süresi henüz dolmadı. Talep reddedildi.",
                employeeId);
            throw new InvalidOperationException(
                "Yasal saklama süresi henüz dolmadı. İş Kanunu'na göre 10 yıl saklama zorunluluğu bulunmaktadır.");
        }

        employee.AnonymizePersonalData();
        await hrContext.SaveChangesAsync();

        _logger.LogInformation(
            "KVKK: Çalışan {EmployeeId} verisi başarıyla anonimleştirildi. Talep eden: {RequestedBy}",
            employeeId, requestedBy);
    }

    /// <summary>
    /// Belirli bir çalışanın kişisel verilerini dışa aktarır.
    /// KVKK Madde 11 - Veri taşınabilirliği hakkı
    /// </summary>
    /// <param name="tenantId">Tenant ID</param>
    /// <param name="employeeId">Çalışan ID</param>
    /// <returns>JSON formatında kişisel veriler</returns>
    public async Task<Dictionary<string, object?>> ExportEmployeeDataAsync(Guid tenantId, int employeeId)
    {
        using var scope = _serviceProvider.CreateScope();

        _logger.LogInformation(
            "KVKK veri taşınabilirliği talebi. Tenant: {TenantId}, Çalışan: {EmployeeId}",
            tenantId, employeeId);

        var hrDbContextFactory = scope.ServiceProvider.GetService<IHRDbContextFactory>();
        if (hrDbContextFactory == null)
        {
            throw new InvalidOperationException("HR modülü aktif değil");
        }

        var hrContext = await hrDbContextFactory.CreateDbContextAsync(tenantId);
        if (hrContext == null)
        {
            throw new InvalidOperationException($"Tenant {tenantId} için HR context oluşturulamadı");
        }

        var employee = await hrContext.Employees
            .FirstOrDefaultAsync(e => e.Id == employeeId);

        if (employee == null)
        {
            throw new InvalidOperationException($"Çalışan bulunamadı: {employeeId}");
        }

        return employee.ExportPersonalData();
    }

    /// <summary>
    /// KVKK veri saklama job'ını zamanlar.
    /// Uygulama başlangıcında çağrılmalıdır.
    /// </summary>
    public static void Schedule()
    {
        // Her ayın 1'inde gece 03:00'te çalış (bakım penceresi)
        RecurringJob.AddOrUpdate<KvkkDataRetentionJob>(
            "kvkk-data-retention",
            job => job.ExecuteAsync(),
            "0 3 1 * *", // Her ayın 1'i, saat 03:00 UTC
            new RecurringJobOptions
            {
                TimeZone = TimeZoneInfo.Utc
            });
    }
}

/// <summary>
/// HR modülü DbContext factory interface'i
/// </summary>
public interface IHRDbContextFactory
{
    Task<IHRDbContext?> CreateDbContextAsync(Guid tenantId);
}

/// <summary>
/// HR modülü DbContext interface'i
/// </summary>
public interface IHRDbContext
{
    DbSet<Stocker.Modules.HR.Domain.Entities.Employee> Employees { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
