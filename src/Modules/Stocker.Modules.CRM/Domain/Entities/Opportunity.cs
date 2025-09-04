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
    public int? CustomerId { get; private set; }
    public int? ContactId { get; private set; }
    public int? LeadId { get; private set; }
    public int PipelineId { get; private set; }
    public int StageId { get; private set; }
    public Money Amount { get; private set; }
    public decimal Probability { get; private set; }
    public DateTime ExpectedCloseDate { get; private set; }
    public DateTime? ActualCloseDate { get; private set; }
    public OpportunityStatus Status { get; private set; }
    public string? LostReason { get; private set; }
    public string? CompetitorName { get; private set; }
    public int? CampaignId { get; private set; }
    public int OwnerId { get; private set; }
    public OpportunitySource Source { get; private set; }
    public OpportunityType Type { get; private set; }
    public int? ParentOpportunityId { get; private set; }
    public string? NextStep { get; private set; }
    public OpportunityPriority Priority { get; private set; }
    
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
    
    protected Opportunity() { }
    
    public Opportunity(
        Guid tenantId,
        string name,
        int pipelineId,
        int stageId,
        Money amount,
        DateTime expectedCloseDate,
        int ownerId) : base(tenantId)
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
    }
    
    public void UpdateDetails(string name, string? description, Money amount, DateTime expectedCloseDate)
    {
        Name = name;
        Description = description;
        Amount = amount;
        ExpectedCloseDate = expectedCloseDate;
    }
    
    public void AssignToCustomer(int customerId, int? contactId = null)
    {
        CustomerId = customerId;
        ContactId = contactId;
        LeadId = null;
    }
    
    public void AssignToLead(int leadId)
    {
        LeadId = leadId;
        CustomerId = null;
        ContactId = null;
    }
    
    public void MoveToStage(int stageId, decimal probability)
    {
        StageId = stageId;
        Probability = probability;
    }
    
    public void MarkAsWon(DateTime closedDate)
    {
        Status = OpportunityStatus.Won;
        ActualCloseDate = closedDate;
        Probability = 100;
    }
    
    public void MarkAsLost(DateTime closedDate, string lostReason, string? competitorName = null)
    {
        Status = OpportunityStatus.Lost;
        ActualCloseDate = closedDate;
        LostReason = lostReason;
        CompetitorName = competitorName;
        Probability = 0;
    }
    
    public void Reopen()
    {
        Status = OpportunityStatus.Open;
        ActualCloseDate = null;
        LostReason = null;
        CompetitorName = null;
    }
    
    public void SetPriority(OpportunityPriority priority)
    {
        Priority = priority;
    }
    
    public void SetSource(OpportunitySource source)
    {
        Source = source;
    }
    
    public void SetType(OpportunityType type)
    {
        Type = type;
    }
    
    public void SetNextStep(string? nextStep)
    {
        NextStep = nextStep;
    }
    
    public void LinkToCampaign(int campaignId)
    {
        CampaignId = campaignId;
    }
    
    public void AddActivity(Activity activity)
    {
        _activities.Add(activity);
    }
    
    public void AddNote(Note note)
    {
        _notes.Add(note);
    }
    
    public void AddProduct(OpportunityProduct product)
    {
        _products.Add(product);
        RecalculateAmount();
    }
    
    public void RemoveProduct(OpportunityProduct product)
    {
        _products.Remove(product);
        RecalculateAmount();
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
        return (int)(DateTime.UtcNow - UpdatedDate).TotalDays;
    }
    
    public int GetDaysUntilExpectedClose()
    {
        return (int)(ExpectedCloseDate - DateTime.UtcNow).TotalDays;
    }
}