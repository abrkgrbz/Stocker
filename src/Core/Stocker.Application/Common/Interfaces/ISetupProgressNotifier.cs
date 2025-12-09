namespace Stocker.Application.Common.Interfaces;

/// <summary>
/// Interface for sending real-time setup progress notifications
/// </summary>
public interface ISetupProgressNotifier
{
    /// <summary>
    /// Send a progress update to clients watching the tenant setup
    /// </summary>
    Task NotifyProgressAsync(SetupProgressUpdate progress, CancellationToken cancellationToken = default);

    /// <summary>
    /// Send a completion notification
    /// </summary>
    Task NotifyCompletedAsync(Guid tenantId, string message, CancellationToken cancellationToken = default);

    /// <summary>
    /// Send an error notification
    /// </summary>
    Task NotifyErrorAsync(Guid tenantId, string errorMessage, CancellationToken cancellationToken = default);
}

/// <summary>
/// Setup progress update message
/// </summary>
public class SetupProgressUpdate
{
    public Guid TenantId { get; set; }
    public SetupStepType Step { get; set; }
    public string StepName { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public int ProgressPercentage { get; set; }
    public bool IsCompleted { get; set; }
    public bool HasError { get; set; }
    public string? ErrorMessage { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public Dictionary<string, object>? Metadata { get; set; }

    public static SetupProgressUpdate Create(
        Guid tenantId,
        SetupStepType step,
        string message,
        int progressPercentage)
    {
        return new SetupProgressUpdate
        {
            TenantId = tenantId,
            Step = step,
            StepName = GetStepName(step),
            Message = message,
            ProgressPercentage = progressPercentage,
            IsCompleted = false,
            HasError = false,
            Timestamp = DateTime.UtcNow
        };
    }

    public static SetupProgressUpdate Completed(Guid tenantId, string message)
    {
        return new SetupProgressUpdate
        {
            TenantId = tenantId,
            Step = SetupStepType.Completed,
            StepName = GetStepName(SetupStepType.Completed),
            Message = message,
            ProgressPercentage = 100,
            IsCompleted = true,
            HasError = false,
            Timestamp = DateTime.UtcNow
        };
    }

    public static SetupProgressUpdate Error(Guid tenantId, string errorMessage)
    {
        return new SetupProgressUpdate
        {
            TenantId = tenantId,
            Step = SetupStepType.Failed,
            StepName = GetStepName(SetupStepType.Failed),
            Message = "Kurulum sırasında bir hata oluştu",
            ProgressPercentage = 0,
            IsCompleted = false,
            HasError = true,
            ErrorMessage = errorMessage,
            Timestamp = DateTime.UtcNow
        };
    }

    private static string GetStepName(SetupStepType step) => step switch
    {
        SetupStepType.Initializing => "Başlatılıyor",
        SetupStepType.CreatingDatabase => "Veritabanı Oluşturuluyor",
        SetupStepType.RunningMigrations => "Tablolar Oluşturuluyor",
        SetupStepType.SeedingData => "Temel Veriler Yükleniyor",
        SetupStepType.ConfiguringModules => "Modüller Yapılandırılıyor",
        SetupStepType.CreatingStorage => "Depolama Alanı Hazırlanıyor",
        SetupStepType.ActivatingTenant => "Hesap Aktifleştiriliyor",
        SetupStepType.Completed => "Tamamlandı",
        SetupStepType.Failed => "Hata",
        _ => "İşleniyor"
    };
}

/// <summary>
/// Setup step types
/// </summary>
public enum SetupStepType
{
    Initializing = 0,
    CreatingDatabase = 1,
    RunningMigrations = 2,
    SeedingData = 3,
    ConfiguringModules = 4,
    CreatingStorage = 5,
    ActivatingTenant = 6,
    Completed = 7,
    Failed = -1
}
