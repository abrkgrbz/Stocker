using Stocker.Modules.Sales.Domain.ValueObjects;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Domain.Entities;

/// <summary>
/// Represents a sales opportunity in the pre-sales pipeline.
/// Tracks potential deals from initial contact to won/lost outcome.
/// An Opportunity may convert to a Quotation and eventually a SalesOrder.
/// </summary>
public class Opportunity : TenantAggregateRoot
{
    #region Properties

    /// <summary>
    /// CRM modülündeki karşılık gelen Opportunity'nin ID'si.
    /// CRM'den satışa dönüştürüldüğünde senkronize edilir.
    /// </summary>
    public Guid? CrmOpportunityId { get; private set; }

    public string OpportunityNumber { get; private set; } = string.Empty;
    public string Title { get; private set; } = string.Empty;
    public string? Description { get; private set; }

    // Customer Information
    public Guid? CustomerId { get; private set; }
    public string? CustomerName { get; private set; }
    public string? ContactName { get; private set; }
    public string? ContactEmail { get; private set; }
    public string? ContactPhone { get; private set; }

    // Pipeline Stage (Enum-based - legacy support)
    public OpportunityStage Stage { get; private set; }
    public OpportunitySource Source { get; private set; }
    public OpportunityPriority Priority { get; private set; }

    // Dynamic Pipeline Stage (Entity-based - Phase 2 feature)
    /// <summary>
    /// Reference to the dynamic sales pipeline this opportunity belongs to.
    /// If set, PipelineStageId should also be set.
    /// </summary>
    public Guid? PipelineId { get; private set; }

    /// <summary>
    /// Reference to the current stage within the dynamic pipeline.
    /// Used for custom pipeline flows beyond the default enum stages.
    /// </summary>
    public Guid? PipelineStageId { get; private set; }

    // Value & Probability
    public decimal EstimatedValue { get; private set; }
    public string Currency { get; private set; } = "TRY";
    public int Probability { get; private set; } // 0-100%
    public decimal WeightedValue => EstimatedValue * (Probability / 100m);

    // Timeline
    public DateTime CreatedDate { get; private set; }
    public DateTime? ExpectedCloseDate { get; private set; }
    public DateTime? ActualCloseDate { get; private set; }
    public DateTime? LastActivityDate { get; private set; }
    public DateTime? NextFollowUpDate { get; private set; }

    // Outcome
    public bool IsWon { get; private set; }
    public bool IsLost { get; private set; }
    public bool IsClosed => IsWon || IsLost;
    public string? ClosedReason { get; private set; }
    public string? LostToCompetitor { get; private set; }

    // Assignment
    public Guid? SalesPersonId { get; private set; }
    public string? SalesPersonName { get; private set; }
    public Guid? SalesTeamId { get; private set; }
    public Guid? TerritoryId { get; private set; }

    // Related Documents
    public Guid? QuotationId { get; private set; }
    public string? QuotationNumber { get; private set; }
    public Guid? SalesOrderId { get; private set; }
    public string? SalesOrderNumber { get; private set; }

    // Metadata
    public string? Notes { get; private set; }
    public string? Tags { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    #endregion

    #region Constructors

    private Opportunity() { }

    private Opportunity(
        Guid tenantId,
        string opportunityNumber,
        string title,
        decimal estimatedValue,
        string currency) : base(Guid.NewGuid(), tenantId)
    {
        OpportunityNumber = opportunityNumber;
        Title = title;
        EstimatedValue = estimatedValue;
        Currency = currency;
        Stage = OpportunityStage.New;
        Source = OpportunitySource.Direct;
        Priority = OpportunityPriority.Medium;
        Probability = 10; // Default 10% for new opportunities
        CreatedDate = DateTime.UtcNow;
        CreatedAt = DateTime.UtcNow;
    }

    #endregion

    #region Factory Methods

    public static Result<Opportunity> Create(
        Guid tenantId,
        string opportunityNumber,
        string title,
        decimal estimatedValue,
        string currency = "TRY")
    {
        if (string.IsNullOrWhiteSpace(opportunityNumber))
            return Result<Opportunity>.Failure(Error.Validation("Opportunity.NumberRequired", "Opportunity number is required"));

        if (string.IsNullOrWhiteSpace(title))
            return Result<Opportunity>.Failure(Error.Validation("Opportunity.TitleRequired", "Title is required"));

        if (estimatedValue < 0)
            return Result<Opportunity>.Failure(Error.Validation("Opportunity.InvalidValue", "Estimated value cannot be negative"));

        return Result<Opportunity>.Success(new Opportunity(tenantId, opportunityNumber, title, estimatedValue, currency));
    }

    #endregion

    #region Stage Management

    public Result UpdateStage(OpportunityStage newStage)
    {
        if (IsClosed)
            return Result.Failure(Error.Validation("Opportunity.AlreadyClosed", "Cannot update stage of a closed opportunity"));

        var oldStage = Stage;
        Stage = newStage;

        // Auto-update probability based on stage
        Probability = newStage switch
        {
            OpportunityStage.New => 10,
            OpportunityStage.Qualified => 25,
            OpportunityStage.Meeting => 40,
            OpportunityStage.Proposal => 60,
            OpportunityStage.Negotiation => 75,
            OpportunityStage.ClosedWon => 100,
            OpportunityStage.ClosedLost => 0,
            _ => Probability
        };

        LastActivityDate = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result Qualify()
    {
        if (Stage != OpportunityStage.New)
            return Result.Failure(Error.Validation("Opportunity.InvalidStage", "Can only qualify from New stage"));

        return UpdateStage(OpportunityStage.Qualified);
    }

    public Result ScheduleMeeting(DateTime? nextFollowUp = null)
    {
        var result = UpdateStage(OpportunityStage.Meeting);
        if (result.IsSuccess && nextFollowUp.HasValue)
            NextFollowUpDate = nextFollowUp;
        return result;
    }

    public Result SendProposal(Guid quotationId, string quotationNumber)
    {
        var result = UpdateStage(OpportunityStage.Proposal);
        if (result.IsSuccess)
        {
            QuotationId = quotationId;
            QuotationNumber = quotationNumber;
        }
        return result;
    }

    public Result EnterNegotiation()
    {
        return UpdateStage(OpportunityStage.Negotiation);
    }

    public Result MarkAsWon(Guid? salesOrderId = null, string? salesOrderNumber = null)
    {
        if (IsClosed)
            return Result.Failure(Error.Validation("Opportunity.AlreadyClosed", "Opportunity is already closed"));

        Stage = OpportunityStage.ClosedWon;
        IsWon = true;
        Probability = 100;
        ActualCloseDate = DateTime.UtcNow;
        ClosedReason = "Won";

        if (salesOrderId.HasValue)
        {
            SalesOrderId = salesOrderId;
            SalesOrderNumber = salesOrderNumber;
        }

        LastActivityDate = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result MarkAsLost(string reason, string? lostToCompetitor = null)
    {
        if (IsClosed)
            return Result.Failure(Error.Validation("Opportunity.AlreadyClosed", "Opportunity is already closed"));

        if (string.IsNullOrWhiteSpace(reason))
            return Result.Failure(Error.Validation("Opportunity.ReasonRequired", "Lost reason is required"));

        Stage = OpportunityStage.ClosedLost;
        IsLost = true;
        Probability = 0;
        ActualCloseDate = DateTime.UtcNow;
        ClosedReason = reason;
        LostToCompetitor = lostToCompetitor;

        LastActivityDate = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result Reopen()
    {
        if (!IsClosed)
            return Result.Failure(Error.Validation("Opportunity.NotClosed", "Opportunity is not closed"));

        IsWon = false;
        IsLost = false;
        ActualCloseDate = null;
        ClosedReason = null;
        LostToCompetitor = null;
        Stage = OpportunityStage.Qualified;
        Probability = 25;

        LastActivityDate = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    #endregion

    #region Value & Probability

    public Result UpdateEstimatedValue(decimal value, string? currency = null)
    {
        if (value < 0)
            return Result.Failure(Error.Validation("Opportunity.InvalidValue", "Estimated value cannot be negative"));

        EstimatedValue = value;
        if (!string.IsNullOrWhiteSpace(currency))
            Currency = currency;

        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result UpdateProbability(int probability)
    {
        if (probability < 0 || probability > 100)
            return Result.Failure(Error.Validation("Opportunity.InvalidProbability", "Probability must be between 0 and 100"));

        Probability = probability;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    #endregion

    #region Customer & Contact

    public Result SetCustomer(Guid? customerId, string? customerName)
    {
        CustomerId = customerId;
        CustomerName = customerName;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result SetContact(string? contactName, string? email, string? phone)
    {
        ContactName = contactName;
        ContactEmail = email;
        ContactPhone = phone;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    #endregion

    #region Assignment

    public Result AssignTo(Guid salesPersonId, string? salesPersonName)
    {
        SalesPersonId = salesPersonId;
        SalesPersonName = salesPersonName;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result SetTerritory(Guid? territoryId, Guid? salesTeamId = null)
    {
        TerritoryId = territoryId;
        if (salesTeamId.HasValue)
            SalesTeamId = salesTeamId;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    #endregion

    #region Timeline

    public Result SetExpectedCloseDate(DateTime? expectedCloseDate)
    {
        ExpectedCloseDate = expectedCloseDate;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result ScheduleFollowUp(DateTime followUpDate)
    {
        NextFollowUpDate = followUpDate;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result RecordActivity()
    {
        LastActivityDate = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    #endregion

    #region Metadata

    public Result SetDetails(string? description, OpportunitySource? source, OpportunityPriority? priority)
    {
        if (description != null)
            Description = description;
        if (source.HasValue)
            Source = source.Value;
        if (priority.HasValue)
            Priority = priority.Value;

        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result SetNotes(string? notes)
    {
        Notes = notes;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result SetTags(string? tags)
    {
        Tags = tags;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    #endregion

    #region Dynamic Pipeline Management

    /// <summary>
    /// Assigns this opportunity to a dynamic pipeline
    /// </summary>
    public Result AssignToPipeline(Guid pipelineId, Guid initialStageId, int stageProbability)
    {
        if (IsClosed)
            return Result.Failure(Error.Validation("Opportunity.AlreadyClosed", "Cannot assign closed opportunity to pipeline"));

        PipelineId = pipelineId;
        PipelineStageId = initialStageId;
        Probability = stageProbability;
        LastActivityDate = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    /// <summary>
    /// Moves the opportunity to a different stage within the same pipeline
    /// </summary>
    public Result MoveToPipelineStage(Guid newStageId, int stageProbability)
    {
        if (IsClosed)
            return Result.Failure(Error.Validation("Opportunity.AlreadyClosed", "Cannot move closed opportunity"));

        if (!PipelineId.HasValue)
            return Result.Failure(Error.Validation("Opportunity.NoPipeline", "Opportunity is not assigned to a pipeline"));

        PipelineStageId = newStageId;
        Probability = stageProbability;
        LastActivityDate = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    /// <summary>
    /// Removes the opportunity from dynamic pipeline, reverting to enum-based stages
    /// </summary>
    public Result RemoveFromPipeline()
    {
        PipelineId = null;
        PipelineStageId = null;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    /// <summary>
    /// Checks if opportunity is using dynamic pipeline
    /// </summary>
    public bool UsesDynamicPipeline => PipelineId.HasValue && PipelineStageId.HasValue;

    #endregion

    #region CRM Integration

    /// <summary>
    /// Sales Opportunity'yi CRM Opportunity ile ilişkilendirir.
    /// CRM'den dönüştürüldüğünde kullanılır.
    /// </summary>
    public void LinkToCrmOpportunity(Guid crmOpportunityId)
    {
        CrmOpportunityId = crmOpportunityId;
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// CRM Opportunity ilişkisini kaldırır.
    /// </summary>
    public void UnlinkFromCrmOpportunity()
    {
        CrmOpportunityId = null;
        UpdatedAt = DateTime.UtcNow;
    }

    #endregion
}

#region Enums

public enum OpportunityStage
{
    New = 0,
    Qualified = 1,
    Meeting = 2,
    Proposal = 3,
    Negotiation = 4,
    ClosedWon = 5,
    ClosedLost = 6
}

public enum OpportunitySource
{
    Direct = 0,
    Referral = 1,
    Website = 2,
    Campaign = 3,
    TradeShow = 4,
    Partner = 5,
    ColdCall = 6,
    SocialMedia = 7,
    Advertisement = 8,
    ExistingCustomer = 9,
    Other = 99
}

public enum OpportunityPriority
{
    Low = 0,
    Medium = 1,
    High = 2,
    Critical = 3
}

#endregion
