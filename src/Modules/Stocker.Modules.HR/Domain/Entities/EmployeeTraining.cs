using Stocker.SharedKernel.Common;

namespace Stocker.Modules.HR.Domain.Entities;

/// <summary>
/// Çalışan-Eğitim ilişki entity'si
/// </summary>
public class EmployeeTraining : BaseEntity
{
    public int EmployeeId { get; private set; }
    public int TrainingId { get; private set; }
    public DateTime EnrollmentDate { get; private set; }
    public EmployeeTrainingStatus Status { get; private set; }
    public DateTime? CompletedDate { get; private set; }
    public decimal? Score { get; private set; }
    public bool IsPassed { get; private set; }
    public string? CertificateNumber { get; private set; }
    public string? CertificateUrl { get; private set; }
    public DateTime? CertificateIssueDate { get; private set; }
    public DateTime? CertificateExpiryDate { get; private set; }
    public string? Feedback { get; private set; }
    public int? FeedbackRating { get; private set; }
    public string? Notes { get; private set; }
    public string? CancellationReason { get; private set; }

    // Navigation Properties
    public virtual Employee Employee { get; private set; } = null!;
    public virtual Training Training { get; private set; } = null!;

    protected EmployeeTraining() { }

    public EmployeeTraining(
        int employeeId,
        int trainingId)
    {
        EmployeeId = employeeId;
        TrainingId = trainingId;
        EnrollmentDate = DateTime.UtcNow;
        Status = EmployeeTrainingStatus.Enrolled;
    }

    public void Start()
    {
        if (Status != EmployeeTrainingStatus.Enrolled)
            throw new InvalidOperationException("Only enrolled participants can start training");

        Status = EmployeeTrainingStatus.InProgress;
    }

    public void Complete(decimal? score = null, bool isPassed = true)
    {
        if (Status != EmployeeTrainingStatus.InProgress && Status != EmployeeTrainingStatus.Enrolled)
            throw new InvalidOperationException("Training must be in progress to complete");

        CompletedDate = DateTime.UtcNow;
        Score = score;
        IsPassed = isPassed;
        Status = isPassed ? EmployeeTrainingStatus.Completed : EmployeeTrainingStatus.Failed;
    }

    public void Fail(decimal? score = null)
    {
        if (Status != EmployeeTrainingStatus.InProgress && Status != EmployeeTrainingStatus.Enrolled)
            throw new InvalidOperationException("Training must be in progress to fail");

        CompletedDate = DateTime.UtcNow;
        Score = score;
        IsPassed = false;
        Status = EmployeeTrainingStatus.Failed;
    }

    public void Cancel(string reason)
    {
        if (Status == EmployeeTrainingStatus.Completed)
            throw new InvalidOperationException("Completed trainings cannot be cancelled");

        Status = EmployeeTrainingStatus.Cancelled;
        CancellationReason = reason;
    }

    public void IssueCertificate(
        string certificateNumber,
        string? certificateUrl = null,
        DateTime? expiryDate = null)
    {
        if (Status != EmployeeTrainingStatus.Completed)
            throw new InvalidOperationException("Certificate can only be issued for completed trainings");

        CertificateNumber = certificateNumber;
        CertificateUrl = certificateUrl;
        CertificateIssueDate = DateTime.UtcNow;
        CertificateExpiryDate = expiryDate;
    }

    public void ProvideFeedback(string feedback, int? rating = null)
    {
        Feedback = feedback;
        if (rating.HasValue)
        {
            if (rating < 1 || rating > 5)
                throw new ArgumentException("Rating must be between 1 and 5");
            FeedbackRating = rating;
        }
    }

    public void SetNotes(string? notes)
    {
        Notes = notes;
    }

    public bool IsCertificateExpired()
    {
        return CertificateExpiryDate.HasValue && CertificateExpiryDate.Value < DateTime.UtcNow;
    }

    public bool IsCertificateExpiringSoon(int daysThreshold = 30)
    {
        if (!CertificateExpiryDate.HasValue) return false;
        var threshold = DateTime.UtcNow.AddDays(daysThreshold);
        return CertificateExpiryDate.Value <= threshold && CertificateExpiryDate.Value > DateTime.UtcNow;
    }
}

/// <summary>
/// Çalışan eğitim durumu
/// </summary>
public enum EmployeeTrainingStatus
{
    /// <summary>
    /// Kayıtlı
    /// </summary>
    Enrolled = 1,

    /// <summary>
    /// Devam ediyor
    /// </summary>
    InProgress = 2,

    /// <summary>
    /// Tamamlandı
    /// </summary>
    Completed = 3,

    /// <summary>
    /// Başarısız
    /// </summary>
    Failed = 4,

    /// <summary>
    /// İptal edildi
    /// </summary>
    Cancelled = 5
}
