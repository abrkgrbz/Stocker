using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Domain.Entities;

/// <summary>
/// Represents a customizable sales pipeline for tracking opportunities.
/// Each tenant can define multiple pipelines for different sales processes
/// (e.g., "B2B Standard Flow", "Fast Track", "Enterprise Sales").
/// The Pipeline is an Aggregate Root that manages its PipelineStages.
/// </summary>
public class SalesPipeline : TenantAggregateRoot
{
    private readonly List<PipelineStage> _stages = new();

    #region Properties

    public string Code { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }

    // Configuration
    public bool IsDefault { get; private set; }
    public bool IsActive { get; private set; } = true;
    public PipelineType Type { get; private set; }

    // Metrics
    public int TotalOpportunities { get; private set; }
    public decimal TotalPipelineValue { get; private set; }
    public decimal AverageConversionRate { get; private set; }
    public int AverageDaysToClose { get; private set; }

    // Audit
    public Guid? CreatedBy { get; private set; }
    public string? CreatedByName { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    public IReadOnlyCollection<PipelineStage> Stages => _stages.AsReadOnly();

    #endregion

    #region Constructors

    private SalesPipeline() { }

    private SalesPipeline(
        Guid tenantId,
        string code,
        string name,
        PipelineType type) : base(Guid.NewGuid(), tenantId)
    {
        Code = code;
        Name = name;
        Type = type;
        IsActive = true;
        CreatedAt = DateTime.UtcNow;
    }

    #endregion

    #region Factory Methods

    public static Result<SalesPipeline> Create(
        Guid tenantId,
        string code,
        string name,
        PipelineType type = PipelineType.Standard)
    {
        if (string.IsNullOrWhiteSpace(code))
            return Result<SalesPipeline>.Failure(Error.Validation("Pipeline.CodeRequired", "Pipeline code is required"));

        if (string.IsNullOrWhiteSpace(name))
            return Result<SalesPipeline>.Failure(Error.Validation("Pipeline.NameRequired", "Pipeline name is required"));

        return Result<SalesPipeline>.Success(new SalesPipeline(tenantId, code, name, type));
    }

    /// <summary>
    /// Creates a standard sales pipeline with default stages
    /// </summary>
    public static Result<SalesPipeline> CreateWithDefaultStages(
        Guid tenantId,
        string code,
        string name)
    {
        var pipelineResult = Create(tenantId, code, name, PipelineType.Standard);
        if (!pipelineResult.IsSuccess)
            return pipelineResult;

        var pipeline = pipelineResult.Value;

        // Add default stages
        var defaultStages = new[]
        {
            ("new", "New Lead", 10, StageCategory.Open),
            ("qualified", "Qualified", 25, StageCategory.Open),
            ("meeting", "Meeting Scheduled", 40, StageCategory.InProgress),
            ("proposal", "Proposal Sent", 60, StageCategory.InProgress),
            ("negotiation", "Negotiation", 75, StageCategory.InProgress),
            ("won", "Closed Won", 100, StageCategory.ClosedWon),
            ("lost", "Closed Lost", 0, StageCategory.ClosedLost)
        };

        var orderIndex = 1;
        foreach (var (stageCode, stageName, probability, category) in defaultStages)
        {
            var stageResult = PipelineStage.Create(
                tenantId, pipeline.Id, stageCode, stageName, orderIndex++, probability, category);
            if (stageResult.IsSuccess)
                pipeline._stages.Add(stageResult.Value);
        }

        return Result<SalesPipeline>.Success(pipeline);
    }

    #endregion

    #region Stage Management

    public Result<PipelineStage> AddStage(
        string code,
        string name,
        int orderIndex,
        int successProbability,
        StageCategory category)
    {
        if (_stages.Any(s => s.Code.Equals(code, StringComparison.OrdinalIgnoreCase)))
            return Result<PipelineStage>.Failure(Error.Conflict("Pipeline.StageExists", $"Stage with code '{code}' already exists"));

        if (_stages.Any(s => s.OrderIndex == orderIndex))
        {
            // Shift existing stages
            foreach (var existingStage in _stages.Where(s => s.OrderIndex >= orderIndex))
            {
                existingStage.UpdateOrderIndex(existingStage.OrderIndex + 1);
            }
        }

        var stageResult = PipelineStage.Create(TenantId, Id, code, name, orderIndex, successProbability, category);
        if (!stageResult.IsSuccess)
            return stageResult;

        _stages.Add(stageResult.Value);
        UpdatedAt = DateTime.UtcNow;

        return stageResult;
    }

    public Result RemoveStage(Guid stageId)
    {
        var stage = _stages.FirstOrDefault(s => s.Id == stageId);
        if (stage == null)
            return Result.Failure(Error.NotFound("Pipeline.StageNotFound", "Stage not found"));

        if (stage.OpportunityCount > 0)
            return Result.Failure(Error.Validation("Pipeline.StageHasOpportunities",
                $"Cannot remove stage with {stage.OpportunityCount} opportunities. Move them first."));

        _stages.Remove(stage);

        // Reorder remaining stages
        var orderedStages = _stages.OrderBy(s => s.OrderIndex).ToList();
        for (int i = 0; i < orderedStages.Count; i++)
        {
            orderedStages[i].UpdateOrderIndex(i + 1);
        }

        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result ReorderStage(Guid stageId, int newOrderIndex)
    {
        var stage = _stages.FirstOrDefault(s => s.Id == stageId);
        if (stage == null)
            return Result.Failure(Error.NotFound("Pipeline.StageNotFound", "Stage not found"));

        if (newOrderIndex < 1 || newOrderIndex > _stages.Count)
            return Result.Failure(Error.Validation("Pipeline.InvalidOrder", "Invalid order index"));

        var oldIndex = stage.OrderIndex;
        if (oldIndex == newOrderIndex)
            return Result.Success();

        // Shift other stages
        if (newOrderIndex > oldIndex)
        {
            foreach (var s in _stages.Where(s => s.OrderIndex > oldIndex && s.OrderIndex <= newOrderIndex))
            {
                s.UpdateOrderIndex(s.OrderIndex - 1);
            }
        }
        else
        {
            foreach (var s in _stages.Where(s => s.OrderIndex >= newOrderIndex && s.OrderIndex < oldIndex))
            {
                s.UpdateOrderIndex(s.OrderIndex + 1);
            }
        }

        stage.UpdateOrderIndex(newOrderIndex);
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public PipelineStage? GetStageByCode(string code)
    {
        return _stages.FirstOrDefault(s => s.Code.Equals(code, StringComparison.OrdinalIgnoreCase));
    }

    public PipelineStage? GetNextStage(Guid currentStageId)
    {
        var currentStage = _stages.FirstOrDefault(s => s.Id == currentStageId);
        if (currentStage == null) return null;

        return _stages
            .Where(s => s.OrderIndex > currentStage.OrderIndex && s.Category != StageCategory.ClosedLost)
            .OrderBy(s => s.OrderIndex)
            .FirstOrDefault();
    }

    public PipelineStage? GetPreviousStage(Guid currentStageId)
    {
        var currentStage = _stages.FirstOrDefault(s => s.Id == currentStageId);
        if (currentStage == null) return null;

        return _stages
            .Where(s => s.OrderIndex < currentStage.OrderIndex)
            .OrderByDescending(s => s.OrderIndex)
            .FirstOrDefault();
    }

    public IEnumerable<PipelineStage> GetOpenStages()
    {
        return _stages.Where(s => s.Category == StageCategory.Open || s.Category == StageCategory.InProgress)
                      .OrderBy(s => s.OrderIndex);
    }

    #endregion

    #region Opportunity Movement

    /// <summary>
    /// Validates if an opportunity can move to the target stage
    /// </summary>
    public Result ValidateStageTransition(Guid fromStageId, Guid toStageId)
    {
        var fromStage = _stages.FirstOrDefault(s => s.Id == fromStageId);
        var toStage = _stages.FirstOrDefault(s => s.Id == toStageId);

        if (fromStage == null)
            return Result.Failure(Error.NotFound("Pipeline.FromStageNotFound", "Source stage not found"));

        if (toStage == null)
            return Result.Failure(Error.NotFound("Pipeline.ToStageNotFound", "Target stage not found"));

        // Check if closed stage is trying to move (unless reopening)
        if (fromStage.Category == StageCategory.ClosedWon || fromStage.Category == StageCategory.ClosedLost)
        {
            if (toStage.Category != StageCategory.Open && toStage.Category != StageCategory.InProgress)
                return Result.Failure(Error.Validation("Pipeline.CannotMoveFromClosed", "Cannot move from closed stage to another closed stage"));
        }

        return Result.Success();
    }

    /// <summary>
    /// Records an opportunity movement between stages
    /// </summary>
    public Result RecordOpportunityMovement(Guid fromStageId, Guid toStageId)
    {
        var fromStage = _stages.FirstOrDefault(s => s.Id == fromStageId);
        var toStage = _stages.FirstOrDefault(s => s.Id == toStageId);

        if (fromStage != null)
            fromStage.DecrementOpportunityCount();

        if (toStage != null)
            toStage.IncrementOpportunityCount();

        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    #endregion

    #region Pipeline Configuration

    public Result SetAsDefault()
    {
        IsDefault = true;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result ClearDefault()
    {
        IsDefault = false;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result Activate()
    {
        IsActive = true;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result Deactivate()
    {
        if (IsDefault)
            return Result.Failure(Error.Validation("Pipeline.CannotDeactivateDefault", "Cannot deactivate the default pipeline"));

        if (TotalOpportunities > 0)
            return Result.Failure(Error.Validation("Pipeline.HasOpportunities", "Cannot deactivate pipeline with active opportunities"));

        IsActive = false;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result UpdateDetails(string? name, string? description, PipelineType? type)
    {
        if (!string.IsNullOrWhiteSpace(name))
            Name = name;
        if (description != null)
            Description = description;
        if (type.HasValue)
            Type = type.Value;

        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    #endregion

    #region Metrics

    public Result UpdateMetrics(int totalOpportunities, decimal totalValue, decimal avgConversionRate, int avgDaysToClose)
    {
        TotalOpportunities = totalOpportunities;
        TotalPipelineValue = totalValue;
        AverageConversionRate = avgConversionRate;
        AverageDaysToClose = avgDaysToClose;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result SetCreator(Guid userId, string? userName)
    {
        CreatedBy = userId;
        CreatedByName = userName;
        return Result.Success();
    }

    #endregion
}

/// <summary>
/// Represents a stage within a sales pipeline.
/// Each stage has a probability and may have required documents/actions.
/// </summary>
public class PipelineStage : TenantEntity
{
    private readonly List<string> _requiredDocuments = new();
    private readonly List<string> _requiredActions = new();

    #region Properties

    public Guid PipelineId { get; private set; }
    public string Code { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }

    // Ordering & Category
    public int OrderIndex { get; private set; }
    public StageCategory Category { get; private set; }

    // Probability & Metrics
    public int SuccessProbability { get; private set; } // 0-100%
    public int OpportunityCount { get; private set; }
    public decimal StageValue { get; private set; }

    // Requirements
    public IReadOnlyList<string> RequiredDocuments => _requiredDocuments.AsReadOnly();
    public IReadOnlyList<string> RequiredActions => _requiredActions.AsReadOnly();
    public bool RequiresApproval { get; private set; }
    public int? MaxDaysInStage { get; private set; }

    // Visual
    public string? Color { get; private set; }
    public string? Icon { get; private set; }

    // Audit
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    #endregion

    #region Constructors

    private PipelineStage() { }

    private PipelineStage(
        Guid tenantId,
        Guid pipelineId,
        string code,
        string name,
        int orderIndex,
        int successProbability,
        StageCategory category) : base(Guid.NewGuid(), tenantId)
    {
        PipelineId = pipelineId;
        Code = code;
        Name = name;
        OrderIndex = orderIndex;
        SuccessProbability = Math.Clamp(successProbability, 0, 100);
        Category = category;
        CreatedAt = DateTime.UtcNow;
    }

    #endregion

    #region Factory Methods

    public static Result<PipelineStage> Create(
        Guid tenantId,
        Guid pipelineId,
        string code,
        string name,
        int orderIndex,
        int successProbability,
        StageCategory category)
    {
        if (string.IsNullOrWhiteSpace(code))
            return Result<PipelineStage>.Failure(Error.Validation("Stage.CodeRequired", "Stage code is required"));

        if (string.IsNullOrWhiteSpace(name))
            return Result<PipelineStage>.Failure(Error.Validation("Stage.NameRequired", "Stage name is required"));

        if (orderIndex < 1)
            return Result<PipelineStage>.Failure(Error.Validation("Stage.InvalidOrder", "Order index must be at least 1"));

        return Result<PipelineStage>.Success(
            new PipelineStage(tenantId, pipelineId, code, name, orderIndex, successProbability, category));
    }

    #endregion

    #region Update Methods

    public Result UpdateDetails(string? name, string? description, int? probability)
    {
        if (!string.IsNullOrWhiteSpace(name))
            Name = name;
        if (description != null)
            Description = description;
        if (probability.HasValue)
            SuccessProbability = Math.Clamp(probability.Value, 0, 100);

        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public void UpdateOrderIndex(int newIndex)
    {
        OrderIndex = newIndex;
        UpdatedAt = DateTime.UtcNow;
    }

    public Result SetVisual(string? color, string? icon)
    {
        Color = color;
        Icon = icon;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result SetRequirements(bool requiresApproval, int? maxDays)
    {
        RequiresApproval = requiresApproval;
        MaxDaysInStage = maxDays;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    #endregion

    #region Required Documents & Actions

    public Result AddRequiredDocument(string document)
    {
        if (string.IsNullOrWhiteSpace(document))
            return Result.Failure(Error.Validation("Stage.DocumentRequired", "Document name is required"));

        if (!_requiredDocuments.Contains(document, StringComparer.OrdinalIgnoreCase))
        {
            _requiredDocuments.Add(document);
            UpdatedAt = DateTime.UtcNow;
        }

        return Result.Success();
    }

    public Result RemoveRequiredDocument(string document)
    {
        _requiredDocuments.RemoveAll(d => d.Equals(document, StringComparison.OrdinalIgnoreCase));
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result AddRequiredAction(string action)
    {
        if (string.IsNullOrWhiteSpace(action))
            return Result.Failure(Error.Validation("Stage.ActionRequired", "Action name is required"));

        if (!_requiredActions.Contains(action, StringComparer.OrdinalIgnoreCase))
        {
            _requiredActions.Add(action);
            UpdatedAt = DateTime.UtcNow;
        }

        return Result.Success();
    }

    public Result RemoveRequiredAction(string action)
    {
        _requiredActions.RemoveAll(a => a.Equals(action, StringComparison.OrdinalIgnoreCase));
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    /// <summary>
    /// Validates if requirements are met for moving to this stage
    /// </summary>
    public Result ValidateRequirements(IEnumerable<string> providedDocuments, IEnumerable<string> completedActions)
    {
        var missingDocs = _requiredDocuments
            .Where(d => !providedDocuments.Contains(d, StringComparer.OrdinalIgnoreCase))
            .ToList();

        if (missingDocs.Any())
            return Result.Failure(Error.Validation("Stage.MissingDocuments",
                $"Missing required documents: {string.Join(", ", missingDocs)}"));

        var missingActions = _requiredActions
            .Where(a => !completedActions.Contains(a, StringComparer.OrdinalIgnoreCase))
            .ToList();

        if (missingActions.Any())
            return Result.Failure(Error.Validation("Stage.MissingActions",
                $"Missing required actions: {string.Join(", ", missingActions)}"));

        return Result.Success();
    }

    #endregion

    #region Metrics

    public void IncrementOpportunityCount()
    {
        OpportunityCount++;
        UpdatedAt = DateTime.UtcNow;
    }

    public void DecrementOpportunityCount()
    {
        if (OpportunityCount > 0)
            OpportunityCount--;
        UpdatedAt = DateTime.UtcNow;
    }

    public Result UpdateStageValue(decimal value)
    {
        StageValue = value;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    #endregion
}

#region Enums

public enum PipelineType
{
    Standard = 0,
    FastTrack = 1,
    Enterprise = 2,
    Partner = 3,
    Renewal = 4,
    Upsell = 5,
    Custom = 99
}

public enum StageCategory
{
    Open = 0,           // Initial stages (New, Qualified)
    InProgress = 1,     // Active stages (Meeting, Proposal, Negotiation)
    ClosedWon = 2,      // Successfully closed
    ClosedLost = 3      // Lost/Cancelled
}

#endregion
