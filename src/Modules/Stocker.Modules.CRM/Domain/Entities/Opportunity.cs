using Stocker.SharedKernel.MultiTenancy;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Modules.CRM.Domain.Enums;

namespace Stocker.Modules.CRM.Domain.Entities;

public class Opportunity : TenantAggregateRoot
{
    private readonly List<Activity> _activities = new();
    private readonly List<Note> _notes = new();
    private readonly List<OpportunityProduct> _products = new();
    
    public string Name { get; private set; }
    public string? Description { get; private set; }
    public Guid? CustomerId { get; private set; }
    public Guid? ContactId { get; private set; }
    public Guid? LeadId { get; private set; }
    public Guid PipelineId { get; private set; }
    public Guid StageId { get; private set; }
    public Money Amount { get; private set; }
    public decimal Probability { get; private set; }
    public DateTime ExpectedCloseDate { get; private set; }
    public DateTime? ActualCloseDate { get; private set; }
    public OpportunityStatus Status { get; private set; }
    public string? LostReason { get; private set; }
    public string? CompetitorName { get; private set; }
    public Guid? CampaignId { get; private set; }
    public int OwnerId { get; private set; }
    public OpportunitySource Source { get; private set; }
    public OpportunityType Type { get; private set; }
    public Guid? ParentOpportunityId { get; private set; }
    public string? NextStep { get; private set; }
    public OpportunityPriority Priority { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }
    
    public virtual Customer? Customer { get; private set; }
    public virtual Contact? Contact { get; private set; }
    public virtual Lead? Lead { get; private set; }
    public virtual Pipeline Pipeline { get; private set; }
    public virtual PipelineStage Stage { get; private set; }
    public virtual Campaign? Campaign { get; private set; }
    public virtual Opportunity? ParentOpportunity { get; private set; }
    public virtual IReadOnlyCollection<Activity> Activities => _activities.AsReadOnly();
    public virtual IReadOnlyCollection<Note> Notes => _notes.AsReadOnly();
    public virtual IReadOnlyCollection<OpportunityProduct> Products => _products.AsReadOnly();
    
    protected Opportunity() : base() { }
    
    public Opportunity(
        Guid tenantId,
        string name,
        Guid pipelineId,
        Guid stageId,
        Money amount,
        DateTime expectedCloseDate,
        int ownerId) : base(Guid.NewGuid(), tenantId)
    {
        Name = name;
        PipelineId = pipelineId;
        StageId = stageId;
        Amount = amount;
        ExpectedCloseDate = expectedCloseDate;
        OwnerId = ownerId;
        Status = OpportunityStatus.Open;
        Probability = 10;
        Priority = OpportunityPriority.Medium;
        Type = OpportunityType.NewBusiness;
        Source = OpportunitySource.Direct;
        CreatedAt = DateTime.UtcNow;
    }
    
    public void UpdateDetails(string name, string? description, Money amount, DateTime expectedCloseDate)
    {
        Name = name;
        Description = description;
        Amount = amount;
        ExpectedCloseDate = expectedCloseDate;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void AssignToCustomer(Guid customerId, Guid? contactId = null)
    {
        CustomerId = customerId;
        ContactId = contactId;
        LeadId = null;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void AssignToLead(Guid leadId)
    {
        LeadId = leadId;
        CustomerId = null;
        ContactId = null;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void MoveToStage(Guid stageId, decimal probability)
    {
        StageId = stageId;
        Probability = probability;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void MarkAsWon(DateTime closedDate)
    {
        Status = OpportunityStatus.Won;
        ActualCloseDate = closedDate;
        Probability = 100;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void MarkAsLost(DateTime closedDate, string lostReason, string? competitorName = null)
    {
        Status = OpportunityStatus.Lost;
        ActualCloseDate = closedDate;
        LostReason = lostReason;
        CompetitorName = competitorName;
        Probability = 0;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void Reopen()
    {
        Status = OpportunityStatus.Open;
        ActualCloseDate = null;
        LostReason = null;
        CompetitorName = null;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void SetPriority(OpportunityPriority priority)
    {
        Priority = priority;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void SetSource(OpportunitySource source)
    {
        Source = source;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void SetType(OpportunityType type)
    {
        Type = type;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void SetNextStep(string? nextStep)
    {
        NextStep = nextStep;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void LinkToCampaign(Guid campaignId)
    {
        CampaignId = campaignId;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void AddActivity(Activity activity)
    {
        _activities.Add(activity);
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void AddNote(Note note)
    {
        _notes.Add(note);
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void AddProduct(OpportunityProduct product)
    {
        _products.Add(product);
        RecalculateAmount();
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void RemoveProduct(OpportunityProduct product)
    {
        _products.Remove(product);
        RecalculateAmount();
        UpdatedAt = DateTime.UtcNow;
    }
    
    private void RecalculateAmount()
    {
        var total = _products.Sum(p => p.TotalPrice.Amount);
        Amount = Money.Create(total, Amount.Currency);
    }
    
    public decimal CalculateWeightedValue()
    {
        return Amount.Amount * (Probability / 100);
    }
    
    public int GetDaysInCurrentStage()
    {
        // Would need to track stage history for accurate calculation
        return (int)(DateTime.UtcNow - (UpdatedAt ?? CreatedAt)).TotalDays;
    }
    
    public int GetDaysUntilExpectedClose()
    {
        return (int)(ExpectedCloseDate - DateTime.UtcNow).TotalDays;
    }
}