using Stocker.SharedKernel.Common;
using Stocker.Modules.HR.Domain.Enums;

namespace Stocker.Modules.HR.Domain.Entities;

/// <summary>
/// Performans değerlendirmesi entity'si
/// </summary>
public class PerformanceReview : BaseEntity
{
    public int EmployeeId { get; private set; }
    public int ReviewerId { get; private set; }
    public string Title { get; private set; }
    public int Year { get; private set; }
    public int? Quarter { get; private set; }
    public DateTime ReviewPeriodStart { get; private set; }
    public DateTime ReviewPeriodEnd { get; private set; }
    public DateTime? ReviewDate { get; private set; }
    public PerformanceRating? OverallRating { get; private set; }
    public string? Strengths { get; private set; }
    public string? AreasForImprovement { get; private set; }
    public string? Goals { get; private set; }
    public string? Achievements { get; private set; }
    public string? ReviewerComments { get; private set; }
    public string? EmployeeComments { get; private set; }
    public PerformanceReviewStatus Status { get; private set; }
    public DateTime? EmployeeAcknowledgedDate { get; private set; }
    public DateTime? ApprovedDate { get; private set; }
    public int? ApprovedById { get; private set; }
    public bool IsRecommendedForPromotion { get; private set; }
    public bool IsRecommendedForRaise { get; private set; }
    public decimal? RecommendedRaisePercent { get; private set; }
    public string? Notes { get; private set; }

    // Navigation Properties
    public virtual Employee Employee { get; private set; } = null!;
    public virtual Employee Reviewer { get; private set; } = null!;
    public virtual Employee? ApprovedBy { get; private set; }
    public virtual ICollection<PerformanceGoal> PerformanceGoals { get; private set; }
    public virtual ICollection<PerformanceReviewCriteria> Criteria { get; private set; }

    protected PerformanceReview()
    {
        Title = string.Empty;
        PerformanceGoals = new List<PerformanceGoal>();
        Criteria = new List<PerformanceReviewCriteria>();
    }

    public PerformanceReview(
        int employeeId,
        int reviewerId,
        string title,
        int year,
        DateTime reviewPeriodStart,
        DateTime reviewPeriodEnd,
        int? quarter = null)
    {
        EmployeeId = employeeId;
        ReviewerId = reviewerId;
        Title = title;
        Year = year;
        Quarter = quarter;
        ReviewPeriodStart = reviewPeriodStart;
        ReviewPeriodEnd = reviewPeriodEnd;
        Status = PerformanceReviewStatus.Draft;
        PerformanceGoals = new List<PerformanceGoal>();
        Criteria = new List<PerformanceReviewCriteria>();
    }

    public void SetRating(PerformanceRating rating)
    {
        OverallRating = rating;
    }

    public void SetFeedback(
        string? strengths,
        string? areasForImprovement,
        string? goals,
        string? achievements)
    {
        Strengths = strengths;
        AreasForImprovement = areasForImprovement;
        Goals = goals;
        Achievements = achievements;
    }

    public void AddReviewerComments(string comments)
    {
        ReviewerComments = comments;
    }

    public void AddEmployeeComments(string comments)
    {
        EmployeeComments = comments;
    }

    public void Submit()
    {
        if (Status != PerformanceReviewStatus.Draft)
            throw new InvalidOperationException("Only draft reviews can be submitted");

        if (!OverallRating.HasValue)
            throw new InvalidOperationException("Overall rating must be set before submitting");

        ReviewDate = DateTime.UtcNow;
        Status = PerformanceReviewStatus.Submitted;
    }

    public void RequestEmployeeAcknowledgment()
    {
        if (Status != PerformanceReviewStatus.Submitted)
            throw new InvalidOperationException("Review must be submitted before requesting acknowledgment");

        Status = PerformanceReviewStatus.PendingAcknowledgment;
    }

    public void EmployeeAcknowledge()
    {
        if (Status != PerformanceReviewStatus.PendingAcknowledgment)
            throw new InvalidOperationException("Review must be pending acknowledgment");

        EmployeeAcknowledgedDate = DateTime.UtcNow;
        Status = PerformanceReviewStatus.Acknowledged;
    }

    public void Approve(int approvedById)
    {
        if (Status != PerformanceReviewStatus.Acknowledged && Status != PerformanceReviewStatus.Submitted)
            throw new InvalidOperationException("Review must be acknowledged or submitted to approve");

        ApprovedById = approvedById;
        ApprovedDate = DateTime.UtcNow;
        Status = PerformanceReviewStatus.Approved;
    }

    public void Reject(string reason)
    {
        if (Status == PerformanceReviewStatus.Approved || Status == PerformanceReviewStatus.Draft)
            throw new InvalidOperationException("Cannot reject approved or draft reviews");

        Status = PerformanceReviewStatus.Draft;
        Notes = string.IsNullOrEmpty(Notes) ? $"Rejected: {reason}" : $"{Notes}; Rejected: {reason}";
    }

    public void SetPromotionRecommendation(bool isRecommended)
    {
        IsRecommendedForPromotion = isRecommended;
    }

    public void SetRaiseRecommendation(bool isRecommended, decimal? raisePercent = null)
    {
        IsRecommendedForRaise = isRecommended;
        RecommendedRaisePercent = raisePercent;
    }

    public void SetNotes(string? notes)
    {
        Notes = notes;
    }

    public void AddGoal(PerformanceGoal goal)
    {
        PerformanceGoals.Add(goal);
    }

    public void AddCriteria(PerformanceReviewCriteria criteria)
    {
        Criteria.Add(criteria);
    }
}

/// <summary>
/// Performans değerlendirme durumu
/// </summary>
public enum PerformanceReviewStatus
{
    /// <summary>
    /// Taslak
    /// </summary>
    Draft = 1,

    /// <summary>
    /// Gönderildi
    /// </summary>
    Submitted = 2,

    /// <summary>
    /// Çalışan onayı bekleniyor
    /// </summary>
    PendingAcknowledgment = 3,

    /// <summary>
    /// Çalışan tarafından onaylandı
    /// </summary>
    Acknowledged = 4,

    /// <summary>
    /// Onaylandı
    /// </summary>
    Approved = 5
}
