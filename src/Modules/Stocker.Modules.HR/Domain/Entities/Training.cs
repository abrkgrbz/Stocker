using Stocker.SharedKernel.Common;
using Stocker.Modules.HR.Domain.Enums;

namespace Stocker.Modules.HR.Domain.Entities;

/// <summary>
/// Eğitim entity'si
/// </summary>
public class Training : BaseEntity
{
    public string Code { get; private set; }
    public string Title { get; private set; }
    public string? Description { get; private set; }
    public string? Provider { get; private set; }
    public string? Instructor { get; private set; }
    public string? Location { get; private set; }
    public bool IsOnline { get; private set; }
    public string? OnlineUrl { get; private set; }
    public DateTime StartDate { get; private set; }
    public DateTime EndDate { get; private set; }
    public int DurationHours { get; private set; }
    public int? MaxParticipants { get; private set; }
    public decimal? Cost { get; private set; }
    public string Currency { get; private set; }
    public bool IsMandatory { get; private set; }
    public bool HasCertification { get; private set; }
    public string? CertificationName { get; private set; }
    public int? CertificationValidityMonths { get; private set; }
    public TrainingStatus Status { get; private set; }
    public string? CancellationReason { get; private set; }
    public string? Notes { get; private set; }
    public bool IsActive { get; private set; }

    // Navigation Properties
    public virtual ICollection<EmployeeTraining> Participants { get; private set; }

    protected Training()
    {
        Code = string.Empty;
        Title = string.Empty;
        Currency = "TRY";
        Participants = new List<EmployeeTraining>();
    }

    public Training(
        string code,
        string title,
        DateTime startDate,
        DateTime endDate,
        int durationHours,
        string? description = null,
        string? provider = null,
        bool isMandatory = false)
    {
        Code = code;
        Title = title;
        StartDate = startDate;
        EndDate = endDate;
        DurationHours = durationHours;
        Description = description;
        Provider = provider;
        IsMandatory = isMandatory;
        Currency = "TRY";
        Status = TrainingStatus.Scheduled;
        IsActive = true;
        Participants = new List<EmployeeTraining>();
    }

    public void Update(
        string title,
        string? description,
        DateTime startDate,
        DateTime endDate,
        int durationHours,
        string? provider,
        string? instructor,
        string? location,
        int? maxParticipants)
    {
        Title = title;
        Description = description;
        StartDate = startDate;
        EndDate = endDate;
        DurationHours = durationHours;
        Provider = provider;
        Instructor = instructor;
        Location = location;
        MaxParticipants = maxParticipants;
    }

    public void SetOnlineDetails(bool isOnline, string? onlineUrl = null)
    {
        IsOnline = isOnline;
        OnlineUrl = onlineUrl;
        if (isOnline)
            Location = "Online";
    }

    public void SetCost(decimal? cost, string currency = "TRY")
    {
        Cost = cost;
        Currency = currency;
    }

    public void SetCertification(bool hasCertification, string? certificationName = null, int? validityMonths = null)
    {
        HasCertification = hasCertification;
        CertificationName = certificationName;
        CertificationValidityMonths = validityMonths;
    }

    public void SetMandatory(bool isMandatory)
    {
        IsMandatory = isMandatory;
    }

    public void Start()
    {
        if (Status != TrainingStatus.Scheduled)
            throw new InvalidOperationException("Only scheduled trainings can be started");

        Status = TrainingStatus.InProgress;
    }

    public void Complete()
    {
        if (Status != TrainingStatus.InProgress)
            throw new InvalidOperationException("Only in-progress trainings can be completed");

        Status = TrainingStatus.Completed;
    }

    public void Cancel(string reason)
    {
        if (Status == TrainingStatus.Completed)
            throw new InvalidOperationException("Completed trainings cannot be cancelled");

        Status = TrainingStatus.Cancelled;
        CancellationReason = reason;
    }

    public void Postpone(DateTime newStartDate, DateTime newEndDate)
    {
        if (Status == TrainingStatus.Completed || Status == TrainingStatus.Cancelled)
            throw new InvalidOperationException("Completed or cancelled trainings cannot be postponed");

        StartDate = newStartDate;
        EndDate = newEndDate;
        Status = TrainingStatus.Postponed;
    }

    public void Reschedule()
    {
        if (Status != TrainingStatus.Postponed && Status != TrainingStatus.Cancelled)
            throw new InvalidOperationException("Only postponed or cancelled trainings can be rescheduled");

        Status = TrainingStatus.Scheduled;
        CancellationReason = null;
    }

    public void SetNotes(string? notes)
    {
        Notes = notes;
    }

    public void Activate() => IsActive = true;

    public void Deactivate() => IsActive = false;

    public int GetCurrentParticipantCount() => Participants.Count(p => p.Status != EmployeeTrainingStatus.Cancelled);

    public bool HasAvailableSlots()
    {
        if (!MaxParticipants.HasValue) return true;
        return GetCurrentParticipantCount() < MaxParticipants.Value;
    }
}
