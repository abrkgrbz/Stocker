using Stocker.Domain.Master.Enums;

namespace Stocker.Application.DTOs.Subscription;

public class SubscriptionDto
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid PackageId { get; set; }
    public string SubscriptionNumber { get; set; } = string.Empty;
    public string TenantName { get; set; } = string.Empty;
    public string PackageName { get; set; } = string.Empty;
    public SubscriptionStatus Status { get; set; }
    public BillingCycle BillingCycle { get; set; }
    public decimal Price { get; set; }
    public string Currency { get; set; } = "TRY";
    public DateTime StartDate { get; set; }
    public DateTime CurrentPeriodStart { get; set; }
    public DateTime CurrentPeriodEnd { get; set; }
    public DateTime? TrialEndDate { get; set; }
    public DateTime? CancelledAt { get; set; }
    public string? CancellationReason { get; set; }
    public bool AutoRenew { get; set; }
    public int UserCount { get; set; }
    public List<SubscriptionModuleDto> Modules { get; set; } = new();
    public List<SubscriptionUsageDto> Usages { get; set; } = new();
}

public class SubscriptionModuleDto
{
    public Guid Id { get; set; }
    public Guid SubscriptionId { get; set; }
    public string ModuleCode { get; set; } = string.Empty;
    public string ModuleName { get; set; } = string.Empty;
    public int? MaxEntities { get; set; }
    public bool IsActive { get; set; } = true;
}

public class SubscriptionUsageDto
{
    public Guid Id { get; set; }
    public Guid SubscriptionId { get; set; }
    public string MetricName { get; set; } = string.Empty;
    public int Value { get; set; }
    public DateTime RecordedAt { get; set; }
}