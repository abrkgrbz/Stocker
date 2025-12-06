using Stocker.Modules.HR.Domain.Enums;
using Stocker.Modules.HR.Domain.Entities;

namespace Stocker.Modules.HR.Application.DTOs;

/// <summary>
/// Data transfer object for Training entity
/// </summary>
public class TrainingDto
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? TrainingType { get; set; }
    public string? Provider { get; set; }
    public string? Instructor { get; set; }
    public string? Location { get; set; }
    public bool IsOnline { get; set; }
    public string? OnlineUrl { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public int DurationHours { get; set; }
    public int? MaxParticipants { get; set; }
    public int CurrentParticipants { get; set; }
    public decimal? Cost { get; set; }
    public string? Currency { get; set; }
    public TrainingStatus Status { get; set; }
    public bool IsMandatory { get; set; }
    public bool HasCertification { get; set; }
    public int? CertificationValidityMonths { get; set; }
    public decimal? PassingScore { get; set; }
    public string? Prerequisites { get; set; }
    public string? Materials { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// DTO for creating a training
/// </summary>
public class CreateTrainingDto
{
    public string Code { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? TrainingType { get; set; }
    public string? Provider { get; set; }
    public string? Instructor { get; set; }
    public string? Location { get; set; }
    public bool IsOnline { get; set; }
    public string? OnlineUrl { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public int DurationHours { get; set; }
    public int? MaxParticipants { get; set; }
    public decimal? Cost { get; set; }
    public string? Currency { get; set; }
    public bool IsMandatory { get; set; }
    public bool HasCertification { get; set; }
    public int? CertificationValidityMonths { get; set; }
    public decimal? PassingScore { get; set; }
    public string? Prerequisites { get; set; }
    public string? Materials { get; set; }
}

/// <summary>
/// DTO for updating a training
/// </summary>
public class UpdateTrainingDto
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? TrainingType { get; set; }
    public string? Provider { get; set; }
    public string? Instructor { get; set; }
    public string? Location { get; set; }
    public bool IsOnline { get; set; }
    public string? OnlineUrl { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public int DurationHours { get; set; }
    public int? MaxParticipants { get; set; }
    public decimal? Cost { get; set; }
    public string? Currency { get; set; }
    public bool IsMandatory { get; set; }
    public bool HasCertification { get; set; }
    public int? CertificationValidityMonths { get; set; }
    public decimal? PassingScore { get; set; }
    public string? Prerequisites { get; set; }
    public string? Materials { get; set; }
}

/// <summary>
/// Data transfer object for EmployeeTraining entity
/// </summary>
public class EmployeeTrainingDto
{
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public string? EmployeeCode { get; set; }
    public int TrainingId { get; set; }
    public string TrainingTitle { get; set; } = string.Empty;
    public DateTime EnrollmentDate { get; set; }
    public EmployeeTrainingStatus Status { get; set; }
    public DateTime? CompletedDate { get; set; }
    public decimal? Score { get; set; }
    public bool IsPassed { get; set; }
    public string? CertificateNumber { get; set; }
    public string? CertificateUrl { get; set; }
    public DateTime? CertificateIssueDate { get; set; }
    public DateTime? CertificateExpiryDate { get; set; }
    public string? Feedback { get; set; }
    public int? FeedbackRating { get; set; }
    public string? Notes { get; set; }
    public string? CancellationReason { get; set; }
    public bool IsCertificateExpired => CertificateExpiryDate.HasValue && CertificateExpiryDate.Value < DateTime.UtcNow;
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// DTO for enrolling an employee in training
/// </summary>
public class EnrollEmployeeDto
{
    public int EmployeeId { get; set; }
    public string? Notes { get; set; }
}

/// <summary>
/// DTO for batch enrolling employees
/// </summary>
public class BatchEnrollEmployeesDto
{
    public int TrainingId { get; set; }
    public List<int> EmployeeIds { get; set; } = new();
}

/// <summary>
/// DTO for completing a training
/// </summary>
public class CompleteTrainingDto
{
    public decimal? Score { get; set; }
    public bool IsPassed { get; set; } = true;
    public string? CompletionNotes { get; set; }
}

/// <summary>
/// DTO for issuing a certificate
/// </summary>
public class IssueCertificateDto
{
    public string CertificateNumber { get; set; } = string.Empty;
    public string? CertificateUrl { get; set; }
    public DateTime? ExpiryDate { get; set; }
}

/// <summary>
/// DTO for providing training feedback
/// </summary>
public class TrainingFeedbackDto
{
    public string Feedback { get; set; } = string.Empty;
    public int? Rating { get; set; }
}

/// <summary>
/// DTO for training summary
/// </summary>
public class TrainingSummaryDto
{
    public int TotalTrainings { get; set; }
    public int ScheduledCount { get; set; }
    public int InProgressCount { get; set; }
    public int CompletedCount { get; set; }
    public int CancelledCount { get; set; }
    public int TotalEnrollments { get; set; }
    public int TotalCompletions { get; set; }
    public decimal CompletionRate { get; set; }
    public decimal AverageScore { get; set; }
    public decimal PassRate { get; set; }
}

/// <summary>
/// DTO for employee training summary
/// </summary>
public class EmployeeTrainingSummaryDto
{
    public int EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public int TotalEnrolled { get; set; }
    public int Completed { get; set; }
    public int InProgress { get; set; }
    public int Failed { get; set; }
    public int Cancelled { get; set; }
    public int CertificatesEarned { get; set; }
    public int ExpiringCertificates { get; set; }
    public decimal TotalTrainingHours { get; set; }
    public decimal AverageScore { get; set; }
}
