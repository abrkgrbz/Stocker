using Stocker.Modules.HR.Domain.Enums;

namespace Stocker.Modules.HR.Application.DTOs;

/// <summary>
/// Data transfer object for PerformanceReview entity
/// </summary>
public class PerformanceReviewDto
{
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public string? EmployeeCode { get; set; }
    public string? DepartmentName { get; set; }
    public string? PositionTitle { get; set; }
    public int ReviewerId { get; set; }
    public string ReviewerName { get; set; } = string.Empty;
    public string ReviewPeriod { get; set; } = string.Empty;
    public DateTime ReviewDate { get; set; }
    public DateTime? DueDate { get; set; }
    public string ReviewType { get; set; } = string.Empty;
    public PerformanceRating? OverallRating { get; set; }
    public decimal? OverallScore { get; set; }
    public string? Strengths { get; set; }
    public string? AreasForImprovement { get; set; }
    public string? ManagerComments { get; set; }
    public string? EmployeeComments { get; set; }
    public string? DevelopmentPlan { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime? SubmittedDate { get; set; }
    public int? ApprovedById { get; set; }
    public string? ApprovedByName { get; set; }
    public DateTime? ApprovedDate { get; set; }
    public bool IsEmployeeAcknowledged { get; set; }
    public DateTime? EmployeeAcknowledgedDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<PerformanceReviewCriteriaDto> Criteria { get; set; } = new();
}

/// <summary>
/// Data transfer object for PerformanceReviewCriteria entity
/// </summary>
public class PerformanceReviewCriteriaDto
{
    public int Id { get; set; }
    public int PerformanceReviewId { get; set; }
    public string CriteriaName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Weight { get; set; }
    public PerformanceRating? Rating { get; set; }
    public decimal? Score { get; set; }
    public string? Comments { get; set; }
}

/// <summary>
/// DTO for creating a performance review
/// </summary>
public class CreatePerformanceReviewDto
{
    public int EmployeeId { get; set; }
    public int ReviewerId { get; set; }
    public string ReviewPeriod { get; set; } = string.Empty;
    public DateTime ReviewDate { get; set; }
    public DateTime? DueDate { get; set; }
    public string ReviewType { get; set; } = "Annual";
    public List<CreateReviewCriteriaDto>? Criteria { get; set; }
}

/// <summary>
/// DTO for creating review criteria
/// </summary>
public class CreateReviewCriteriaDto
{
    public string CriteriaName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Weight { get; set; } = 1;
}

/// <summary>
/// DTO for updating a performance review
/// </summary>
public class UpdatePerformanceReviewDto
{
    public string? Strengths { get; set; }
    public string? AreasForImprovement { get; set; }
    public string? ManagerComments { get; set; }
    public string? DevelopmentPlan { get; set; }
}

/// <summary>
/// DTO for rating a criteria
/// </summary>
public class RateCriteriaDto
{
    public int CriteriaId { get; set; }
    public PerformanceRating Rating { get; set; }
    public decimal? Score { get; set; }
    public string? Comments { get; set; }
}

/// <summary>
/// DTO for submitting a review
/// </summary>
public class SubmitReviewDto
{
    public PerformanceRating OverallRating { get; set; }
    public string? FinalComments { get; set; }
}

/// <summary>
/// DTO for employee acknowledgment
/// </summary>
public class AcknowledgeReviewDto
{
    public string? EmployeeComments { get; set; }
}

/// <summary>
/// Data transfer object for PerformanceGoal entity
/// </summary>
public class PerformanceGoalDto
{
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Category { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime TargetDate { get; set; }
    public DateTime? CompletedDate { get; set; }
    public decimal Weight { get; set; }
    public decimal ProgressPercentage { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Metrics { get; set; }
    public string? TargetValue { get; set; }
    public string? CurrentValue { get; set; }
    public int? PerformanceReviewId { get; set; }
    public int? AssignedById { get; set; }
    public string? AssignedByName { get; set; }
    public string? Notes { get; set; }
    public bool IsOverdue => Status != "Completed" && Status != "Cancelled" && TargetDate < DateTime.UtcNow;
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// DTO for creating a performance goal
/// </summary>
public class CreatePerformanceGoalDto
{
    public int EmployeeId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Category { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime TargetDate { get; set; }
    public decimal Weight { get; set; } = 1;
    public string? Metrics { get; set; }
    public string? TargetValue { get; set; }
    public int? PerformanceReviewId { get; set; }
}

/// <summary>
/// DTO for updating a performance goal
/// </summary>
public class UpdatePerformanceGoalDto
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Category { get; set; }
    public DateTime TargetDate { get; set; }
    public decimal Weight { get; set; }
    public string? Metrics { get; set; }
    public string? TargetValue { get; set; }
}

/// <summary>
/// DTO for updating goal progress
/// </summary>
public class UpdateGoalProgressDto
{
    public decimal Progress { get; set; }
    public string? Notes { get; set; }
}

/// <summary>
/// DTO for completing/submitting a performance review
/// </summary>
public class CompleteReviewDto
{
    public PerformanceRating OverallRating { get; set; }
    public string? FinalComments { get; set; }
}

/// <summary>
/// DTO for performance summary
/// </summary>
public class PerformanceSummaryDto
{
    public int EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public int TotalReviews { get; set; }
    public int TotalGoals { get; set; }
    public int CompletedGoals { get; set; }
    public int InProgressGoals { get; set; }
    public int OverdueGoals { get; set; }
    public decimal AverageRating { get; set; }
    public PerformanceRating? LatestRating { get; set; }
    public decimal GoalCompletionRate { get; set; }
}

/// <summary>
/// DTO for department performance summary
/// </summary>
public class DepartmentPerformanceSummaryDto
{
    public int DepartmentId { get; set; }
    public string DepartmentName { get; set; } = string.Empty;
    public int EmployeeCount { get; set; }
    public int ReviewsCompleted { get; set; }
    public int ReviewsPending { get; set; }
    public decimal AverageRating { get; set; }
    public int TotalGoals { get; set; }
    public int GoalsCompleted { get; set; }
    public decimal GoalCompletionRate { get; set; }
    public Dictionary<PerformanceRating, int> RatingDistribution { get; set; } = new();
}
