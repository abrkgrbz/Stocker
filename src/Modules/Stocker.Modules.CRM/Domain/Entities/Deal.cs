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
    public int? CustomerId { get; private set; }
    public int? ContactId { get; private set; }
    public int PipelineId { get; private set; }
    public int StageId { get; private set; }
    public Money Value { get; private set; }
    public Money? RecurringValue { get; private set; }
    public RecurringPeriod? RecurringPeriod { get; private set; }
    public int? RecurringCycles { get; private set; }
    public decimal Probability { get; private set; }
    public DateTime? ExpectedCloseDate { get; private set; }
    public DateTime? ActualCloseDate { get; private set; }
    public DealStatus Status { get; private set; }
    public string? LostReason { get; private set; }
    public int OwnerId { get; private set; }
    public DealPriority Priority { get; private set; }
    public string? Currency { get; private set; }
    public int? RottenDays { get; private set; }
    public DateTime? LastActivityDate { get; private set; }
    public DateTime? NextActivityDate { get; private set; }
    public int ActivitiesCount { get; private set; }
    public int EmailsCount { get; private set; }
    public string? Labels { get; private set; }
    
    public virtual Customer? Customer { get; private set; }
    public virtual Contact? Contact { get; private set; }
    public virtual Pipeline Pipeline { get; private set; }
    public virtual PipelineStage Stage { get; private set; }
    public virtual IReadOnlyCollection<Activity> Activities => _activities.AsReadOnly();
    public virtual IReadOnlyCollection<Note> Notes => _notes.AsReadOnly();
    public virtual IReadOnlyCollection<DealProduct> Products => _products.AsReadOnly();
    
    protected Deal() { }
    
    public Deal(
        Guid tenantId,
        string name,
        int pipelineId,
        int stageId,
        Money value,
        int ownerId) : base(tenantId)
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
    }
    
    public void UpdateDetails(string name, string? description, Money value)
    {
        Name = name;
        Description = description;
        Value = value;
    }
    
    public void SetRecurringValue(Money recurringValue, RecurringPeriod period, int? cycles = null)
    {
        RecurringValue = recurringValue;
        RecurringPeriod = period;
        RecurringCycles = cycles;
    }
    
    public void AssignToCustomer(int customerId, int? contactId = null)
    {
        CustomerId = customerId;
        ContactId = contactId;
    }
    
    public void MoveToStage(int stageId, decimal probability)
    {
        StageId = stageId;
        Probability = probability;
        UpdateRottenStatus();
    }
    
    public void SetExpectedCloseDate(DateTime? date)
    {
        ExpectedCloseDate = date;
    }
    
    public void MarkAsWon(DateTime closedDate)
    {
        Status = DealStatus.Won;
        ActualCloseDate = closedDate;
        Probability = 100;
    }
    
    public void MarkAsLost(DateTime closedDate, string lostReason)
    {
        Status = DealStatus.Lost;
        ActualCloseDate = closedDate;
        LostReason = lostReason;
        Probability = 0;
    }
    
    public void Reopen()
    {
        Status = DealStatus.Open;
        ActualCloseDate = null;
        LostReason = null;
        UpdateRottenStatus();
    }
    
    public void Delete()
    {
        Status = DealStatus.Deleted;
    }
    
    public void SetPriority(DealPriority priority)
    {
        Priority = priority;
    }
    
    public void SetLabels(string labels)
    {
        Labels = labels;
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
    }
    
    public void AddNote(Note note)
    {
        _notes.Add(note);
    }
    
    public void AddProduct(DealProduct product)
    {
        _products.Add(product);
        RecalculateValue();
    }
    
    public void RemoveProduct(DealProduct product)
    {
        _products.Remove(product);
        RecalculateValue();
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
            : (int)(DateTime.UtcNow - CreatedDate).TotalDays;
            
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
        return (int)(DateTime.UtcNow - UpdatedDate).TotalDays;
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