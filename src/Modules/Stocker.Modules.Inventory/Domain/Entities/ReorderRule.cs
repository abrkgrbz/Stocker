using Stocker.SharedKernel.Common;
using Stocker.Modules.Inventory.Domain.Enums;

namespace Stocker.Modules.Inventory.Domain.Entities;

/// <summary>
/// Auto-reorder rule configuration for automatic purchase order generation
/// </summary>
public class ReorderRule : BaseEntity
{
    public string Name { get; private set; } = default!;
    public string? Description { get; private set; }

    // Scope - What this rule applies to
    public int? ProductId { get; private set; }
    public int? CategoryId { get; private set; }
    public int? WarehouseId { get; private set; }
    public int? SupplierId { get; private set; }

    // Trigger Conditions
    public decimal? TriggerBelowQuantity { get; private set; }
    public int? TriggerBelowDaysOfStock { get; private set; }
    public bool TriggerOnForecast { get; private set; }
    public int? ForecastLeadTimeDays { get; private set; }

    // Reorder Settings
    public decimal? FixedReorderQuantity { get; private set; }
    public decimal? ReorderUpToQuantity { get; private set; }
    public bool UseEconomicOrderQuantity { get; private set; }
    public decimal? MinimumOrderQuantity { get; private set; }
    public decimal? MaximumOrderQuantity { get; private set; }
    public bool RoundToPackSize { get; private set; }
    public decimal? PackSize { get; private set; }

    // Schedule
    public bool IsScheduled { get; private set; }
    public string? CronExpression { get; private set; }
    public DateTime? NextScheduledRun { get; private set; }

    // Status
    public ReorderRuleStatus Status { get; private set; }
    public bool RequiresApproval { get; private set; }
    public int? ApproverUserId { get; private set; }

    // Execution History
    public DateTime? LastExecutedAt { get; private set; }
    public int ExecutionCount { get; private set; }

    // Priority (lower = higher priority)
    public int Priority { get; private set; } = 100;

    // Navigation Properties
    public virtual Product? Product { get; private set; }
    public virtual Category? Category { get; private set; }
    public virtual Warehouse? Warehouse { get; private set; }
    public virtual Supplier? Supplier { get; private set; }
    public virtual ICollection<ReorderSuggestion> Suggestions { get; private set; } = new List<ReorderSuggestion>();

    protected ReorderRule() { }

    public ReorderRule(
        string name,
        string? description = null,
        int? productId = null,
        int? categoryId = null,
        int? warehouseId = null,
        int? supplierId = null)
    {
        Name = name;
        Description = description;
        ProductId = productId;
        CategoryId = categoryId;
        WarehouseId = warehouseId;
        SupplierId = supplierId;
        Status = ReorderRuleStatus.Active;
    }

    public void SetTriggerConditions(
        decimal? belowQuantity = null,
        int? belowDaysOfStock = null,
        bool onForecast = false,
        int? forecastLeadTimeDays = null)
    {
        TriggerBelowQuantity = belowQuantity;
        TriggerBelowDaysOfStock = belowDaysOfStock;
        TriggerOnForecast = onForecast;
        ForecastLeadTimeDays = forecastLeadTimeDays;
    }

    public void SetReorderSettings(
        decimal? fixedQuantity = null,
        decimal? upToQuantity = null,
        bool useEoq = false,
        decimal? minQty = null,
        decimal? maxQty = null,
        bool roundToPack = false,
        decimal? packSize = null)
    {
        FixedReorderQuantity = fixedQuantity;
        ReorderUpToQuantity = upToQuantity;
        UseEconomicOrderQuantity = useEoq;
        MinimumOrderQuantity = minQty;
        MaximumOrderQuantity = maxQty;
        RoundToPackSize = roundToPack;
        PackSize = packSize;
    }

    public void SetSchedule(bool isScheduled, string? cronExpression = null)
    {
        IsScheduled = isScheduled;
        CronExpression = cronExpression;
        if (isScheduled && !string.IsNullOrEmpty(cronExpression))
        {
            // TODO: Calculate next run from cron expression
            NextScheduledRun = DateTime.UtcNow.AddDays(1);
        }
    }

    public void SetApprovalSettings(bool requiresApproval, int? approverUserId = null)
    {
        RequiresApproval = requiresApproval;
        ApproverUserId = approverUserId;
    }

    public void Activate()
    {
        Status = ReorderRuleStatus.Active;
    }

    public void Pause()
    {
        Status = ReorderRuleStatus.Paused;
    }

    public void Disable()
    {
        Status = ReorderRuleStatus.Disabled;
    }

    public void RecordExecution()
    {
        LastExecutedAt = DateTime.UtcNow;
        ExecutionCount++;
    }

    public void Update(
        string name,
        string? description,
        int? productId,
        int? categoryId,
        int? warehouseId,
        int? supplierId)
    {
        Name = name;
        Description = description;
        ProductId = productId;
        CategoryId = categoryId;
        WarehouseId = warehouseId;
        SupplierId = supplierId;
    }

    public void SetPriority(int priority)
    {
        Priority = priority;
    }
}
