using System;
using System.Collections.Generic;
using System.Linq;
using Stocker.Domain.Constants;
using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Tenant.Entities;

public class TenantOnboarding : AggregateRoot<Guid>
{
    private readonly List<OnboardingStep> _steps = new();
    private readonly List<OnboardingTask> _tasks = new();
    
    private TenantOnboarding() { }
    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public OnboardingType Type { get; private set; }
    public OnboardingStatus Status { get; private set; }
    
    // Target Information
    public string? TargetUserId { get; private set; }
    public string? TargetUserEmail { get; private set; }
    public string? TargetUserName { get; private set; }
    public string? TargetRole { get; private set; }
    public string? TargetDepartment { get; private set; }
    
    // Progress Tracking
    public int TotalSteps { get; private set; }
    public int CompletedSteps { get; private set; }
    public int SkippedSteps { get; private set; }
    public decimal ProgressPercentage { get; private set; }
    public TimeSpan EstimatedDuration { get; private set; }
    public TimeSpan ActualDuration { get; private set; }
    
    // Timeline
    public DateTime? StartedAt { get; private set; }
    public DateTime? CompletedAt { get; private set; }
    public DateTime? DueDate { get; private set; }
    public DateTime? LastActivityAt { get; private set; }
    public DateTime? PausedAt { get; private set; }
    public DateTime? ResumedAt { get; private set; }
    
    // Configuration
    public bool IsRequired { get; private set; }
    public bool AllowSkip { get; private set; }
    public bool SendReminders { get; private set; }
    public int ReminderFrequencyDays { get; private set; } = 3;
    public bool RequireManagerApproval { get; private set; }
    public string? ManagerId { get; private set; }
    public string? ManagerEmail { get; private set; }
    
    // Completion Details
    public string? CompletionCertificateUrl { get; private set; }
    public decimal? CompletionScore { get; private set; }
    public string? CompletionFeedback { get; private set; }
    public int? SatisfactionRating { get; private set; } // 1-5
    
    // Analytics
    public int LoginCount { get; private set; }
    public DateTime? FirstLoginAt { get; private set; }
    public DateTime? LastLoginAt { get; private set; }
    public int HelpRequestCount { get; private set; }
    public string? MostVisitedSection { get; private set; }
    public string? DeviceInfo { get; private set; }
    
    // Audit
    public DateTime CreatedAt { get; private set; }
    public string CreatedBy { get; private set; } = string.Empty;
    public DateTime? ModifiedAt { get; private set; }
    public string? ModifiedBy { get; private set; }
    
    // Navigation Properties
    public IReadOnlyCollection<OnboardingStep> Steps => _steps.AsReadOnly();
    public IReadOnlyCollection<OnboardingTask> Tasks => _tasks.AsReadOnly();
    
    public static TenantOnboarding Create(
        string name,
        OnboardingType type,
        string targetUserId,
        string targetUserEmail,
        string targetUserName,
        string createdBy,
        string? description = null,
        bool isRequired = true)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Onboarding name is required", nameof(name));
        if (string.IsNullOrWhiteSpace(targetUserId))
            throw new ArgumentException("Target user ID is required", nameof(targetUserId));
        if (string.IsNullOrWhiteSpace(targetUserEmail))
            throw new ArgumentException("Target user email is required", nameof(targetUserEmail));
        if (string.IsNullOrWhiteSpace(createdBy))
            throw new ArgumentException("Creator is required", nameof(createdBy));
            
        var onboarding = new TenantOnboarding
        {
            Id = Guid.NewGuid(),
            Name = name,
            Description = description,
            Type = type,
            Status = OnboardingStatus.NotStarted,
            TargetUserId = targetUserId,
            TargetUserEmail = targetUserEmail,
            TargetUserName = targetUserName,
            IsRequired = isRequired,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = createdBy
        };
        
        // Initialize default steps based on type
        onboarding.InitializeDefaultSteps(type);
        
        return onboarding;
    }
    
    private void InitializeDefaultSteps(OnboardingType type)
    {
        var steps = GetDefaultStepsForType(type);
        foreach (var step in steps)
        {
            AddStep(step);
        }
    }
    
    private List<OnboardingStep> GetDefaultStepsForType(OnboardingType type)
    {
        var steps = new List<OnboardingStep>();
        
        switch (type)
        {
            case OnboardingType.NewEmployee:
                steps.Add(OnboardingStep.Create(1, "Welcome", "Introduction to the company", StepType.Information, true));
                steps.Add(OnboardingStep.Create(2, "Profile Setup", "Complete your profile information", StepType.Form, true));
                steps.Add(OnboardingStep.Create(3, "Company Policies", "Review company policies", StepType.Document, true));
                steps.Add(OnboardingStep.Create(4, "Training Videos", "Watch training materials", StepType.Video, false));
                steps.Add(OnboardingStep.Create(5, "System Tour", "Guided tour of the system", StepType.Interactive, false));
                break;
                
            case OnboardingType.NewCustomer:
                steps.Add(OnboardingStep.Create(1, "Account Setup", "Set up your account", StepType.Form, true));
                steps.Add(OnboardingStep.Create(2, "Product Tour", "Learn about our products", StepType.Interactive, false));
                steps.Add(OnboardingStep.Create(3, "First Order", "Place your first order", StepType.Action, false));
                break;
                
            case OnboardingType.NewAdmin:
                steps.Add(OnboardingStep.Create(1, "Admin Training", "Admin system training", StepType.Video, true));
                steps.Add(OnboardingStep.Create(2, "Security Setup", "Configure security settings", StepType.Form, true));
                steps.Add(OnboardingStep.Create(3, "Team Setup", "Set up your team", StepType.Action, false));
                break;
                
            case OnboardingType.SystemMigration:
                steps.Add(OnboardingStep.Create(1, "Data Review", "Review migrated data", StepType.Review, true));
                steps.Add(OnboardingStep.Create(2, "Settings Configuration", "Configure system settings", StepType.Form, true));
                steps.Add(OnboardingStep.Create(3, "Test Transactions", "Perform test transactions", StepType.Action, false));
                break;
        }
        
        return steps;
    }
    
    public void AddStep(OnboardingStep step)
    {
        _steps.Add(step);
        TotalSteps = _steps.Count;
        CalculateEstimatedDuration();
    }
    
    public void AddTask(OnboardingTask task)
    {
        _tasks.Add(task);
    }
    
    public void Start(string? startedBy = null)
    {
        if (Status != OnboardingStatus.NotStarted && Status != OnboardingStatus.Paused)
            throw new InvalidOperationException("Onboarding can only be started from NotStarted or Paused status");
        
        // Check if resuming from paused state
        var wasPaused = Status == OnboardingStatus.Paused;
            
        Status = OnboardingStatus.InProgress;
        StartedAt = DateTime.UtcNow;
        LastActivityAt = DateTime.UtcNow;
        
        if (wasPaused)
        {
            ResumedAt = DateTime.UtcNow;
            PausedAt = null;
        }
        
        ModifiedAt = DateTime.UtcNow;
        ModifiedBy = startedBy ?? DomainConstants.SystemUser;
    }
    
    public void CompleteStep(Guid stepId, string? completedBy = null)
    {
        var step = _steps.FirstOrDefault(s => s.Id == stepId);
        if (step == null)
            throw new ArgumentException("Step not found", nameof(stepId));
            
        step.Complete(completedBy);
        CompletedSteps++;
        UpdateProgress();
        
        LastActivityAt = DateTime.UtcNow;
        ModifiedAt = DateTime.UtcNow;
        ModifiedBy = completedBy ?? DomainConstants.SystemUser;
        
        // Check if all required steps are completed
        if (AreAllRequiredStepsCompleted())
        {
            Complete(completedBy);
        }
    }
    
    public void SkipStep(Guid stepId, string reason, string? skippedBy = null)
    {
        var step = _steps.FirstOrDefault(s => s.Id == stepId);
        if (step == null)
            throw new ArgumentException("Step not found", nameof(stepId));
            
        if (step.IsRequired && !AllowSkip)
            throw new InvalidOperationException("Cannot skip required step");
            
        step.Skip(reason, skippedBy);
        SkippedSteps++;
        UpdateProgress();
        
        LastActivityAt = DateTime.UtcNow;
        ModifiedAt = DateTime.UtcNow;
        ModifiedBy = skippedBy ?? DomainConstants.SystemUser;
    }
    
    public void Pause(string? pausedBy = null)
    {
        if (Status != OnboardingStatus.InProgress)
            throw new InvalidOperationException("Can only pause in-progress onboarding");
            
        Status = OnboardingStatus.Paused;
        PausedAt = DateTime.UtcNow;
        
        ModifiedAt = DateTime.UtcNow;
        ModifiedBy = pausedBy ?? DomainConstants.SystemUser;
    }
    
    public void Resume(string? resumedBy = null)
    {
        if (Status != OnboardingStatus.Paused)
            throw new InvalidOperationException("Can only resume paused onboarding");
            
        Status = OnboardingStatus.InProgress;
        ResumedAt = DateTime.UtcNow;
        PausedAt = null;
        LastActivityAt = DateTime.UtcNow;
        
        ModifiedAt = DateTime.UtcNow;
        ModifiedBy = resumedBy ?? DomainConstants.SystemUser;
    }
    
    public void Cancel(string reason, string? cancelledBy = null)
    {
        if (Status == OnboardingStatus.Completed || Status == OnboardingStatus.Cancelled)
            throw new InvalidOperationException("Cannot cancel completed or already cancelled onboarding");
            
        Status = OnboardingStatus.Cancelled;
        CompletionFeedback = $"Cancelled: {reason}";
        
        ModifiedAt = DateTime.UtcNow;
        ModifiedBy = cancelledBy ?? DomainConstants.SystemUser;
    }
    
    public void Complete(string? completedBy = null)
    {
        if (!AreAllRequiredStepsCompleted())
            throw new InvalidOperationException("Cannot complete onboarding with pending required steps");
            
        Status = OnboardingStatus.Completed;
        CompletedAt = DateTime.UtcNow;
        
        if (StartedAt.HasValue)
        {
            ActualDuration = CompletedAt.Value - StartedAt.Value;
        }
        
        ProgressPercentage = 100;
        
        ModifiedAt = DateTime.UtcNow;
        ModifiedBy = completedBy ?? DomainConstants.SystemUser;
    }
    
    public void SetTargetDetails(
        string? targetRole,
        string? targetDepartment,
        string? managerId,
        string? managerEmail,
        string modifiedBy)
    {
        TargetRole = targetRole;
        TargetDepartment = targetDepartment;
        ManagerId = managerId;
        ManagerEmail = managerEmail;
        
        ModifiedAt = DateTime.UtcNow;
        ModifiedBy = modifiedBy;
    }
    
    public void SetConfiguration(
        bool allowSkip,
        bool sendReminders,
        int reminderFrequencyDays,
        bool requireManagerApproval,
        DateTime? dueDate,
        string modifiedBy)
    {
        AllowSkip = allowSkip;
        SendReminders = sendReminders;
        ReminderFrequencyDays = reminderFrequencyDays;
        RequireManagerApproval = requireManagerApproval;
        DueDate = dueDate;

        // Update AllowSkip for all steps when configuration changes
        foreach (var step in _steps)
        {
            step.AllowSkip = allowSkip;
        }

        ModifiedAt = DateTime.UtcNow;
        ModifiedBy = modifiedBy;
    }
    
    public void RecordLogin()
    {
        LoginCount++;
        LastLoginAt = DateTime.UtcNow;
        
        if (!FirstLoginAt.HasValue)
        {
            FirstLoginAt = DateTime.UtcNow;
            
            // Auto-start onboarding on first login if not started
            if (Status == OnboardingStatus.NotStarted)
            {
                Start(DomainConstants.SystemUser);
            }
        }
    }
    
    public void RecordHelpRequest()
    {
        HelpRequestCount++;
        LastActivityAt = DateTime.UtcNow;
    }
    
    public void SetCompletionDetails(
        string? certificateUrl,
        decimal? score,
        string? feedback,
        int? satisfactionRating,
        string modifiedBy)
    {
        CompletionCertificateUrl = certificateUrl;
        CompletionScore = score;
        CompletionFeedback = feedback;
        
        if (satisfactionRating.HasValue && (satisfactionRating < 1 || satisfactionRating > 5))
            throw new ArgumentException("Satisfaction rating must be between 1 and 5", nameof(satisfactionRating));
            
        SatisfactionRating = satisfactionRating;
        
        ModifiedAt = DateTime.UtcNow;
        ModifiedBy = modifiedBy;
    }
    
    private void UpdateProgress()
    {
        if (TotalSteps == 0)
        {
            ProgressPercentage = 0;
            return;
        }
        
        // If completed, progress is 100%
        if (Status == OnboardingStatus.Completed)
        {
            ProgressPercentage = 100;
            return;
        }
        
        var progress = (CompletedSteps + (SkippedSteps * 0.5m)) / TotalSteps * 100;
        ProgressPercentage = Math.Round(progress, 2);
    }
    
    private bool AreAllRequiredStepsCompleted()
    {
        return _steps.Where(s => s.IsRequired).All(s => s.Status == StepStatus.Completed || s.Status == StepStatus.Skipped);
    }
    
    private void CalculateEstimatedDuration()
    {
        var totalMinutes = _steps.Sum(s => s.EstimatedDurationMinutes);
        EstimatedDuration = TimeSpan.FromMinutes(totalMinutes);
    }
    
    public bool IsOverdue()
    {
        return DueDate.HasValue && DateTime.UtcNow > DueDate.Value && Status != OnboardingStatus.Completed;
    }
    
    public bool NeedsReminder()
    {
        if (!SendReminders || Status != OnboardingStatus.InProgress)
            return false;
            
        if (!LastActivityAt.HasValue)
            return true;
            
        var daysSinceActivity = (DateTime.UtcNow - LastActivityAt.Value).TotalDays;
        return daysSinceActivity >= ReminderFrequencyDays;
    }
}

public class OnboardingStep : Entity<Guid>
{
    private OnboardingStep() { }
    public Guid OnboardingId { get; private set; }
    public int Order { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public StepType Type { get; private set; }
    public StepStatus Status { get; private set; }
    public bool IsRequired { get; private set; }
    public bool AllowSkip { get; internal set; } // Allow internal setter so parent can update it

    // Content
    public string? ContentUrl { get; private set; }
    public string? ContentHtml { get; private set; }
    public string? VideoUrl { get; private set; }
    public string? DocumentUrl { get; private set; }
    public string? FormData { get; private set; } // JSON
    public string? ActionUrl { get; private set; }
    
    // Progress
    public int EstimatedDurationMinutes { get; private set; }
    public int ActualDurationMinutes { get; private set; }
    public DateTime? StartedAt { get; private set; }
    public DateTime? CompletedAt { get; private set; }
    public DateTime? SkippedAt { get; private set; }
    public string? SkipReason { get; private set; }
    
    // Validation
    public string? ValidationRules { get; private set; } // JSON
    public bool RequiresVerification { get; private set; }
    public bool IsVerified { get; private set; }
    public DateTime? VerifiedAt { get; private set; }
    public string? VerifiedBy { get; private set; }
    
    // User Input
    public string? UserResponse { get; private set; } // JSON
    public string? UserFeedback { get; private set; }
    public int? UserRating { get; private set; } // 1-5
    
    // Audit
    public string? CompletedBy { get; private set; }
    public string? SkippedBy { get; private set; }
    
    // Navigation
    public TenantOnboarding? Onboarding { get; private set; }
    
    public static OnboardingStep Create(
        int order,
        string title,
        string? description,
        StepType type,
        bool isRequired,
        int estimatedDurationMinutes = 5)
    {
        return new OnboardingStep
        {
            Id = Guid.NewGuid(),
            Order = order,
            Title = title,
            Description = description,
            Type = type,
            Status = StepStatus.Pending,
            IsRequired = isRequired,
            EstimatedDurationMinutes = estimatedDurationMinutes
        };
    }
    
    public void Start()
    {
        if (Status != StepStatus.Pending)
            throw new InvalidOperationException("Step can only be started from Pending status");
            
        Status = StepStatus.InProgress;
        StartedAt = DateTime.UtcNow;
    }
    
    public void Complete(string? completedBy = null)
    {
        if (Status == StepStatus.Completed)
            return;
            
        Status = StepStatus.Completed;
        CompletedAt = DateTime.UtcNow;
        CompletedBy = completedBy;
        
        if (StartedAt.HasValue)
        {
            ActualDurationMinutes = (int)(CompletedAt.Value - StartedAt.Value).TotalMinutes;
        }
    }
    
    public void Skip(string reason, string? skippedBy = null)
    {
        if (IsRequired && !AllowSkip)
            throw new InvalidOperationException("Cannot skip required step");

        Status = StepStatus.Skipped;
        SkippedAt = DateTime.UtcNow;
        SkipReason = reason;
        SkippedBy = skippedBy;
    }
    
    public void SetContent(
        string? contentUrl,
        string? contentHtml,
        string? videoUrl,
        string? documentUrl,
        string? actionUrl)
    {
        ContentUrl = contentUrl;
        ContentHtml = contentHtml;
        VideoUrl = videoUrl;
        DocumentUrl = documentUrl;
        ActionUrl = actionUrl;
    }
    
    public void SetUserResponse(string? response, string? feedback, int? rating)
    {
        UserResponse = response;
        UserFeedback = feedback;
        
        if (rating.HasValue && (rating < 1 || rating > 5))
            throw new ArgumentException("Rating must be between 1 and 5", nameof(rating));
            
        UserRating = rating;
    }
    
    public void Verify(string verifiedBy)
    {
        if (!RequiresVerification)
            throw new InvalidOperationException("Step does not require verification");
            
        IsVerified = true;
        VerifiedAt = DateTime.UtcNow;
        VerifiedBy = verifiedBy;
    }
}

public class OnboardingTask : Entity<Guid>
{
    private OnboardingTask() { }
    public Guid OnboardingId { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public TaskStatus Status { get; private set; }
    public TaskPriority Priority { get; private set; }
    
    // Assignment
    public string? AssignedTo { get; private set; }
    public string? AssignedBy { get; private set; }
    public DateTime? AssignedAt { get; private set; }
    
    // Timeline
    public DateTime? DueDate { get; private set; }
    public DateTime? StartedAt { get; private set; }
    public DateTime? CompletedAt { get; private set; }
    
    // Details
    public string? Notes { get; private set; }
    public string? CompletionNotes { get; private set; }
    public string? Attachments { get; private set; } // JSON array
    
    // Navigation
    public TenantOnboarding? Onboarding { get; private set; }
    
    public static OnboardingTask Create(
        string title,
        string? description,
        TaskPriority priority,
        DateTime? dueDate = null)
    {
        return new OnboardingTask
        {
            Id = Guid.NewGuid(),
            Title = title,
            Description = description,
            Status = TaskStatus.Todo,
            Priority = priority,
            DueDate = dueDate
        };
    }
    
    public void Assign(string assignedTo, string assignedBy)
    {
        AssignedTo = assignedTo;
        AssignedBy = assignedBy;
        AssignedAt = DateTime.UtcNow;
        Status = TaskStatus.Assigned;
    }
    
    public void Start()
    {
        Status = TaskStatus.InProgress;
        StartedAt = DateTime.UtcNow;
    }
    
    public void Complete(string? completionNotes = null)
    {
        Status = TaskStatus.Completed;
        CompletedAt = DateTime.UtcNow;
        CompletionNotes = completionNotes;
    }
}

public enum OnboardingType
{
    NewEmployee,
    NewCustomer,
    NewVendor,
    NewPartner,
    NewAdmin,
    RoleChange,
    DepartmentChange,
    SystemMigration,
    ProductTraining,
    ComplianceTraining,
    Custom
}

public enum OnboardingStatus
{
    NotStarted,
    InProgress,
    Paused,
    Completed,
    Cancelled,
    Expired
}

public enum StepType
{
    Information,
    Video,
    Document,
    Form,
    Quiz,
    Task,
    Action,
    Review,
    Interactive,
    External
}

// StepStatus enum is defined in SetupWizardStep.cs to avoid duplication

public enum TaskStatus
{
    Todo,
    Assigned,
    InProgress,
    Completed,
    Cancelled
}

public enum TaskPriority
{
    Low,
    Medium,
    High,
    Urgent
}