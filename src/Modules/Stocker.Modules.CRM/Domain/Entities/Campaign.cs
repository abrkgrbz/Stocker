using Stocker.SharedKernel.MultiTenancy;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Modules.CRM.Domain.Enums;

namespace Stocker.Modules.CRM.Domain.Entities;

public class Campaign : TenantAggregateRoot
{
    private readonly List<CampaignMember> _members = new();
    private readonly List<Lead> _generatedLeads = new();
    private readonly List<Opportunity> _generatedOpportunities = new();
    
    public string Name { get; private set; }
    public string? Description { get; private set; }
    public CampaignType Type { get; private set; }
    public CampaignStatus Status { get; private set; }
    public DateTime StartDate { get; private set; }
    public DateTime EndDate { get; private set; }
    public Money BudgetedCost { get; private set; }
    public Money ActualCost { get; private set; }
    public Money ExpectedRevenue { get; private set; }
    public Money ActualRevenue { get; private set; }
    public int ExpectedResponse { get; private set; }
    public int ActualResponse { get; private set; }
    public int NumberSent { get; private set; }
    public int NumberDelivered { get; private set; }
    public int NumberOpened { get; private set; }
    public int NumberClicked { get; private set; }
    public int NumberUnsubscribed { get; private set; }
    public int NumberBounced { get; private set; }
    public string? TargetAudience { get; private set; }
    public string? Objective { get; private set; }
    public Guid? ParentCampaignId { get; private set; }
    public int OwnerId { get; private set; }
    
    // Email Campaign specific
    public string? EmailSubject { get; private set; }
    public string? EmailBody { get; private set; }
    public int? EmailTemplateId { get; private set; }
    public string? EmailFromAddress { get; private set; }
    public string? EmailFromName { get; private set; }
    public string? EmailReplyTo { get; private set; }
    
    // Landing Page
    public string? LandingPageUrl { get; private set; }
    public string? UtmSource { get; private set; }
    public string? UtmMedium { get; private set; }
    public string? UtmCampaign { get; private set; }
    public string? UtmTerm { get; private set; }
    public string? UtmContent { get; private set; }
    
    public virtual Campaign? ParentCampaign { get; private set; }
    public virtual IReadOnlyCollection<Campaign> ChildCampaigns { get; private set; }
    public virtual IReadOnlyCollection<CampaignMember> Members => _members.AsReadOnly();
    public virtual IReadOnlyCollection<Lead> GeneratedLeads => _generatedLeads.AsReadOnly();
    public virtual IReadOnlyCollection<Opportunity> GeneratedOpportunities => _generatedOpportunities.AsReadOnly();
    
    protected Campaign() : base() { }
    
    public Campaign(
        Guid tenantId,
        string name,
        CampaignType type,
        DateTime startDate,
        DateTime endDate,
        Money budgetedCost,
        int ownerId) : base(Guid.NewGuid(), tenantId)
    {
        Name = name;
        Type = type;
        StartDate = startDate;
        EndDate = endDate;
        BudgetedCost = budgetedCost;
        OwnerId = ownerId;
        Status = CampaignStatus.Planned;
        ActualCost = Money.Create(0, budgetedCost.Currency);
        ExpectedRevenue = Money.Create(0, budgetedCost.Currency);
        ActualRevenue = Money.Create(0, budgetedCost.Currency);
        ExpectedResponse = 0;
        ActualResponse = 0;
        NumberSent = 0;
        NumberDelivered = 0;
        NumberOpened = 0;
        NumberClicked = 0;
        NumberUnsubscribed = 0;
        NumberBounced = 0;
        ChildCampaigns = new List<Campaign>();
    }
    
    public void UpdateDetails(string name, string? description, string? targetAudience, string? objective)
    {
        Name = name;
        Description = description;
        TargetAudience = targetAudience;
        Objective = objective;
    }
    
    public void UpdateDates(DateTime startDate, DateTime endDate)
    {
        if (endDate < startDate)
            throw new ArgumentException("End date cannot be before start date");
            
        StartDate = startDate;
        EndDate = endDate;
    }
    
    public void UpdateBudget(Money budgetedCost, Money expectedRevenue, int expectedResponse)
    {
        BudgetedCost = budgetedCost;
        ExpectedRevenue = expectedRevenue;
        ExpectedResponse = expectedResponse;
    }
    
    public void RecordActualResults(Money actualCost, Money actualRevenue, int actualResponse)
    {
        ActualCost = actualCost;
        ActualRevenue = actualRevenue;
        ActualResponse = actualResponse;
    }
    
    public void Start()
    {
        if (Status != CampaignStatus.Planned)
            throw new InvalidOperationException("Only planned campaigns can be started");
            
        Status = CampaignStatus.InProgress;
    }
    
    public void Complete()
    {
        if (Status != CampaignStatus.InProgress)
            throw new InvalidOperationException("Only in-progress campaigns can be completed");
            
        Status = CampaignStatus.Completed;
    }
    
    public void Abort()
    {
        if (Status == CampaignStatus.Completed)
            throw new InvalidOperationException("Completed campaigns cannot be aborted");
            
        Status = CampaignStatus.Aborted;
    }
    
    public void SetEmailDetails(string subject, string body, string fromAddress, string fromName, string? replyTo = null)
    {
        EmailSubject = subject;
        EmailBody = body;
        EmailFromAddress = fromAddress;
        EmailFromName = fromName;
        EmailReplyTo = replyTo ?? fromAddress;
    }
    
    public void SetLandingPage(string url)
    {
        LandingPageUrl = url;
    }
    
    public void SetUtmParameters(string source, string medium, string campaign, string? term = null, string? content = null)
    {
        UtmSource = source;
        UtmMedium = medium;
        UtmCampaign = campaign;
        UtmTerm = term;
        UtmContent = content;
    }
    
    public void AddMember(CampaignMember member)
    {
        if (_members.Any(m => m.ContactId == member.ContactId || m.LeadId == member.LeadId))
            throw new InvalidOperationException("Contact or Lead is already a member of this campaign");
            
        _members.Add(member);
    }
    
    public void RemoveMember(CampaignMember member)
    {
        _members.Remove(member);
    }
    
    public void RecordEmailMetrics(int sent, int delivered, int opened, int clicked, int unsubscribed, int bounced)
    {
        NumberSent = sent;
        NumberDelivered = delivered;
        NumberOpened = opened;
        NumberClicked = clicked;
        NumberUnsubscribed = unsubscribed;
        NumberBounced = bounced;
    }
    
    public void AddGeneratedLead(Lead lead)
    {
        _generatedLeads.Add(lead);
    }
    
    public void AddGeneratedOpportunity(Opportunity opportunity)
    {
        _generatedOpportunities.Add(opportunity);
        
        // Update actual revenue if opportunity is won
        if (opportunity.Status == OpportunityStatus.Won)
        {
            ActualRevenue = Money.Create(
                ActualRevenue.Amount + opportunity.Amount.Amount,
                ActualRevenue.Currency);
        }
    }
    
    public decimal CalculateROI()
    {
        if (ActualCost.Amount == 0) return 0;
        return ((ActualRevenue.Amount - ActualCost.Amount) / ActualCost.Amount) * 100;
    }
    
    public decimal CalculateResponseRate()
    {
        if (NumberSent == 0) return 0;
        return (decimal)ActualResponse / NumberSent * 100;
    }
    
    public decimal CalculateOpenRate()
    {
        if (NumberDelivered == 0) return 0;
        return (decimal)NumberOpened / NumberDelivered * 100;
    }
    
    public decimal CalculateClickRate()
    {
        if (NumberOpened == 0) return 0;
        return (decimal)NumberClicked / NumberOpened * 100;
    }
    
    public decimal CalculateBounceRate()
    {
        if (NumberSent == 0) return 0;
        return (decimal)NumberBounced / NumberSent * 100;
    }
    
    public decimal CalculateUnsubscribeRate()
    {
        if (NumberDelivered == 0) return 0;
        return (decimal)NumberUnsubscribed / NumberDelivered * 100;
    }
    
    public decimal CalculateCostPerLead()
    {
        if (_generatedLeads.Count == 0) return 0;
        return ActualCost.Amount / _generatedLeads.Count;
    }
    
    public decimal CalculateCostPerOpportunity()
    {
        if (_generatedOpportunities.Count == 0) return 0;
        return ActualCost.Amount / _generatedOpportunities.Count;
    }
}