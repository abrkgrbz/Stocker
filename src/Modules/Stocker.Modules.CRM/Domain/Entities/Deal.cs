using Stocker.SharedKernel.MultiTenancy;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Modules.CRM.Domain.Enums;

namespace Stocker.Modules.CRM.Domain.Entities;

public class Deal : TenantAggregateRoot
{
    private readonly List<Activity> _activities = new();
    private readonly List<Note> _notes = new();
    private readonly List<DealProduct> _products = new();
    
    public string Name { get; private set; }
    public string? Description { get; private set; }
    public Guid? CustomerId { get; private set; }
    public Guid? ContactId { get; private set; }
    public Guid PipelineId { get; private set; }
    public Guid StageId { get; private set; }
    public Money Value { get; private set; }
    public Money? RecurringValue { get; private set; }
    public RecurringPeriod? RecurringPeriod { get; private set; }
    public int? RecurringCycles { get; private set; }
    public decimal Probability { get; private set; }
    public DateTime? ExpectedCloseDate { get; private set; }
    public DateTime? ActualCloseDate { get; private set; }
    public DealStatus Status { get; private set; }
    public string? LostReason { get; private set; }
    public string? CompetitorName { get; private set; }
    public int OwnerId { get; private set; }
    public DealPriority Priority { get; private set; }
    public string? Currency { get; private set; }
    public int? RottenDays { get; private set; }
    public DateTime? LastActivityDate { get; private set; }
    public DateTime? NextActivityDate { get; private set; }
    public int ActivitiesCount { get; private set; }
    public int EmailsCount { get; private set; }
    public string? Labels { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }
    
    public Customer? Customer { get; private set; }
    public Contact? Contact { get; private set; }
    public Pipeline Pipeline { get; private set; }
    public PipelineStage Stage { get; private set; }
    public virtual IReadOnlyCollection<Activity> Activities => _activities.AsReadOnly();
    public virtual IReadOnlyCollection<Note> Notes => _notes.AsReadOnly();
    public virtual IReadOnlyCollection<DealProduct> Products => _products.AsReadOnly();
    
    protected Deal() : base() { }
    
    public Deal(
        Guid tenantId,
        string name,
        Guid pipelineId,
        Guid stageId,
        Money value,
        int ownerId) : base(Guid.NewGuid(), tenantId)
    {
        Name = name;
        PipelineId = pipelineId;
        StageId = stageId;
        Value = value;
        OwnerId = ownerId;
        Status = DealStatus.Open;
        Probability = 10;
        Priority = DealPriority.Medium;
        Currency = value.Currency;
        ActivitiesCount = 0;
        EmailsCount = 0;
        CreatedAt = DateTime.UtcNow;
    }
    
    public void UpdateDetails(string name, string? description, Money value)
    {
        Name = name;
        Description = description;
        Value = value;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void SetRecurringValue(Money recurringValue, RecurringPeriod period, int? cycles = null)
    {
        RecurringValue = recurringValue;
        RecurringPeriod = period;
        RecurringCycles = cycles;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void AssignToCustomer(Guid customerId, Guid? contactId = null)
    {
        CustomerId = customerId;
        ContactId = contactId;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void MoveToStage(Guid stageId, decimal probability)
    {
        StageId = stageId;
        Probability = probability;
        UpdateRottenStatus();
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void SetExpectedCloseDate(DateTime? date)
    {
        ExpectedCloseDate = date;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void MarkAsWon(DateTime closedDate)
    {
        Status = DealStatus.Won;
        ActualCloseDate = closedDate;
        Probability = 100;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void MarkAsLost(DateTime closedDate, string lostReason, string? competitorName = null)
    {
        Status = DealStatus.Lost;
        ActualCloseDate = closedDate;
        LostReason = lostReason;
        CompetitorName = competitorName;
        Probability = 0;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void Reopen()
    {
        Status = DealStatus.Open;
        ActualCloseDate = null;
        LostReason = null;
        UpdateRottenStatus();
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void Delete()
    {
        Status = DealStatus.Deleted;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void SetPriority(DealPriority priority)
    {
        Priority = priority;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void SetLabels(string labels)
    {
        Labels = labels;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void AddActivity(Activity activity)
    {
        _activities.Add(activity);
        ActivitiesCount++;
        LastActivityDate = DateTime.UtcNow;
        
        if (activity.Type == ActivityType.Email)
        {
            EmailsCount++;
        }
        
        if (activity.DueDate.HasValue && activity.Status != ActivityStatus.Completed)
        {
            if (!NextActivityDate.HasValue || activity.DueDate < NextActivityDate)
            {
                NextActivityDate = activity.DueDate;
            }
        }
        
        UpdateRottenStatus();
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void AddNote(Note note)
    {
        _notes.Add(note);
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void AddProduct(DealProduct product)
    {
        _products.Add(product);
        RecalculateValue();
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void RemoveProduct(DealProduct product)
    {
        _products.Remove(product);
        RecalculateValue();
        UpdatedAt = DateTime.UtcNow;
    }
    
    private void RecalculateValue()
    {
        var total = _products.Sum(p => p.TotalPrice.Amount);
        Value = Money.Create(total, Value.Currency);
    }
    
    public void UpdateRottenStatus()
    {
        if (Status != DealStatus.Open)
        {
            RottenDays = null;
            return;
        }
        
        var daysSinceLastActivity = LastActivityDate.HasValue
            ? (int)(DateTime.UtcNow - LastActivityDate.Value).TotalDays
            : (int)(DateTime.UtcNow - CreatedAt).TotalDays;
            
        // Deal is considered "rotten" if no activity for more than 30 days
        RottenDays = daysSinceLastActivity > 30 ? daysSinceLastActivity : null;
    }
    
    public decimal CalculateWeightedValue()
    {
        return Value.Amount * (Probability / 100);
    }
    
    public Money CalculateTotalValue()
    {
        if (RecurringValue == null || RecurringPeriod == null)
            return Value;
            
        var multiplier = RecurringCycles ?? 12; // Default to 12 cycles if not specified
        var recurringTotal = RecurringValue.Amount * multiplier;
        
        return Money.Create(Value.Amount + recurringTotal, Value.Currency);
    }
    
    public int GetDaysInCurrentStage()
    {
        return (int)(DateTime.UtcNow - (UpdatedAt ?? CreatedAt)).TotalDays;
    }
    
    public int? GetDaysUntilExpectedClose()
    {
        if (!ExpectedCloseDate.HasValue)
            return null;
            
        return (int)(ExpectedCloseDate.Value - DateTime.UtcNow).TotalDays;
    }
    
    public bool IsRotten()
    {
        return RottenDays.HasValue && RottenDays.Value > 0;
    }
    
    public bool HasUpcomingActivity()
    {
        return NextActivityDate.HasValue && NextActivityDate.Value > DateTime.UtcNow;
    }
}