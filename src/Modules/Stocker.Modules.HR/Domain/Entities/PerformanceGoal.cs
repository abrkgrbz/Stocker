using Stocker.SharedKernel.Common;
using Stocker.Modules.HR.Domain.Enums;

namespace Stocker.Modules.HR.Domain.Entities;

/// <summary>
/// Performans hedefi entity'si
/// </summary>
public class PerformanceGoal : BaseEntity
{
    public int EmployeeId { get; private set; }
    public int? PerformanceReviewId { get; private set; }
    public string Title { get; private set; }
    public string? Description { get; private set; }
    public string? Category { get; private set; }
    public DateTime StartDate { get; private set; }
    public DateTime DueDate { get; private set; }
    public DateTime? CompletedDate { get; private set; }
    public decimal Weight { get; private set; }
    public decimal? Progress { get; private set; }
    public GoalStatus Status { get; private set; }
    public PerformanceRating? Achievement { get; private set; }
    public string? Metrics { get; private set; }
    public string? Notes { get; private set; }
    public int? AssignedById { get; private set; }

    // Navigation Properties
    public virtual Employee Employee { get; private set; } = null!;
    public virtual PerformanceReview? PerformanceReview { get; private set; }
    public virtual Employee? AssignedBy { get; private set; }

    protected PerformanceGoal()
    {
        Title = string.Empty;
    }

    public PerformanceGoal(
        int employeeId,
        string title,
        DateTime startDate,
        DateTime dueDate,
        decimal weight = 1,
        string? description = null,
        string? category = null,
        int? performanceReviewId = null)
    {
        EmployeeId = employeeId;
        Title = title;
        StartDate = startDate;
        DueDate = dueDate;
        Weight = weight;
        Description = description;
        Category = category;
        PerformanceReviewId = performanceReviewId;
        Status = GoalStatus.NotStarted;
        Progress = 0;
    }

    public void Update(
        string title,
        string? description,
        DateTime dueDate,
        decimal weight,
        string? category,
        string? metrics)
    {
        Title = title;
        Description = description;
        DueDate = dueDate;
        Weight = weight;
        Category = category;
        Metrics = metrics;
    }

    public void UpdateProgress(decimal progress)
    {
        if (progress < 0 || progress > 100)
            throw new ArgumentException("Progress must be between 0 and 100");

        Progress = progress;

        if (progress == 0)
            Status = GoalStatus.NotStarted;
        else if (progress < 100)
            Status = GoalStatus.InProgress;
        else
            Status = GoalStatus.Completed;
    }

    public void Start()
    {
        if (Status != GoalStatus.NotStarted)
            throw new InvalidOperationException("Goal has already been started");

        Status = GoalStatus.InProgress;
    }

    public void Complete(PerformanceRating? achievement = null)
    {
        CompletedDate = DateTime.UtcNow;
        Progress = 100;
        Status = GoalStatus.Completed;
        Achievement = achievement;
    }

    public void Cancel(string reason)
    {
        Status = GoalStatus.Cancelled;
        Notes = string.IsNullOrEmpty(Notes) ? $"Cancelled: {reason}" : $"{Notes}; Cancelled: {reason}";
    }

    public void Defer(DateTime newDueDate, string? reason = null)
    {
        DueDate = newDueDate;
        Status = GoalStatus.Deferred;
        if (!string.IsNullOrEmpty(reason))
            Notes = string.IsNullOrEmpty(Notes) ? $"Deferred: {reason}" : $"{Notes}; Deferred: {reason}";
    }

    public void SetAchievement(PerformanceRating achievement)
    {
        Achievement = achievement;
    }

    public void SetAssignedBy(int assignedById)
    {
        AssignedById = assignedById;
    }

    public void SetNotes(string? notes)
    {
        Notes = notes;
    }

    public void LinkToReview(int performanceReviewId)
    {
        PerformanceReviewId = performanceReviewId;
    }

    public bool IsOverdue()
    {
        return Status != GoalStatus.Completed &&
               Status != GoalStatus.Cancelled &&
               DueDate < DateTime.UtcNow;
    }
}

/// <summary>
/// Hedef durumu
/// </summary>
public enum GoalStatus
{
    /// <summary>
    /// Başlanmadı
    /// </summary>
    NotStarted = 1,

    /// <summary>
    /// Devam ediyor
    /// </summary>
    InProgress = 2,

    /// <summary>
    /// Tamamlandı
    /// </summary>
    Completed = 3,

    /// <summary>
    /// İptal edildi
    /// </summary>
    Cancelled = 4,

    /// <summary>
    /// Ertelendi
    /// </summary>
    Deferred = 5
}
