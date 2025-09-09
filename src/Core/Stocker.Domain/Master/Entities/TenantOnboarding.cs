using Stocker.SharedKernel.Primitives;
using System.Text.Json;

namespace Stocker.Domain.Master.Entities;

public sealed class TenantOnboarding : Entity
{
    private readonly List<OnboardingStep> _steps = new();
    private readonly List<OnboardingTask> _tasks = new();
    
    public Guid TenantId { get; private set; }
    public OnboardingStatus Status { get; private set; }
    public OnboardingType OnboardingType { get; private set; }
    public int CurrentStepNumber { get; private set; }
    public decimal ProgressPercentage { get; private set; }
    
    // Timeline
    public DateTime StartedAt { get; private set; }
    public DateTime? CompletedAt { get; private set; }
    public DateTime EstimatedCompletionDate { get; private set; }
    public int TotalDaysExpected { get; private set; }
    
    // Assignment
    public string? AssignedToUserId { get; private set; }
    public string? AssignedToName { get; private set; }
    public string? AssignedToEmail { get; private set; }
    public DateTime? AssignedAt { get; private set; }
    
    // Contact Person
    public string ContactPersonName { get; private set; }
    public string ContactPersonEmail { get; private set; }
    public string? ContactPersonPhone { get; private set; }
    public string? PreferredContactMethod { get; private set; }
    public string? PreferredContactTime { get; private set; }
    
    // Meeting & Training
    public DateTime? KickoffMeetingDate { get; private set; }
    public string? KickoffMeetingNotes { get; private set; }
    public int TrainingSessionsCompleted { get; private set; }
    public int TotalTrainingSessions { get; private set; }
    public DateTime? NextTrainingDate { get; private set; }
    
    // Data Migration
    public bool RequiresDataMigration { get; private set; }
    public string? DataMigrationStatus { get; private set; }
    public DateTime? DataMigrationStarted { get; private set; }
    public DateTime? DataMigrationCompleted { get; private set; }
    public long? RecordsMigrated { get; private set; }
    public long? TotalRecordsToMigrate { get; private set; }
    
    // Customization
    public bool RequiresCustomization { get; private set; }
    public string? CustomizationRequirements { get; private set; }
    public string? CustomizationStatus { get; private set; }
    
    // Integration
    public bool RequiresIntegration { get; private set; }
    public string? IntegrationSystems { get; private set; } // JSON list
    public string? IntegrationStatus { get; private set; }
    
    // Documents
    public string? WelcomePackageUrl { get; private set; }
    public bool WelcomePackageSent { get; private set; }
    public DateTime? WelcomePackageSentAt { get; private set; }
    public string? DocumentationUrl { get; private set; }
    public string? TrainingMaterialsUrl { get; private set; }
    
    // Feedback
    public int? SatisfactionScore { get; private set; } // 1-10
    public string? FeedbackComments { get; private set; }
    public DateTime? FeedbackReceivedAt { get; private set; }
    
    // Notes & Issues
    public string? Notes { get; private set; }
    public string? Issues { get; private set; }
    public string? Blockers { get; private set; }
    public OnboardingPriority Priority { get; private set; }
    
    // Audit
    public DateTime CreatedAt { get; private set; }
    public string CreatedBy { get; private set; }
    public DateTime? UpdatedAt { get; private set; }
    public string? UpdatedBy { get; private set; }
    
    // Navigation
    public Tenant Tenant { get; private set; }
    public IReadOnlyList<OnboardingStep> Steps => _steps.AsReadOnly();
    public IReadOnlyList<OnboardingTask> Tasks => _tasks.AsReadOnly();
    
    private TenantOnboarding() { } // EF Constructor
    
    private TenantOnboarding(
        Guid tenantId,
        OnboardingType onboardingType,
        string contactPersonName,
        string contactPersonEmail,
        string createdBy)
    {
        Id = Guid.NewGuid();
        TenantId = tenantId;
        OnboardingType = onboardingType;
        Status = OnboardingStatus.NotStarted;
        CurrentStepNumber = 0;
        ProgressPercentage = 0;
        ContactPersonName = contactPersonName;
        ContactPersonEmail = contactPersonEmail;
        StartedAt = DateTime.UtcNow;
        TotalDaysExpected = onboardingType == OnboardingType.Express ? 3 : 14;
        EstimatedCompletionDate = DateTime.UtcNow.AddDays(TotalDaysExpected);
        Priority = OnboardingPriority.Normal;
        CreatedAt = DateTime.UtcNow;
        CreatedBy = createdBy;
        
        InitializeSteps();
    }
    
    public static TenantOnboarding Create(
        Guid tenantId,
        OnboardingType onboardingType,
        string contactPersonName,
        string contactPersonEmail,
        string createdBy)
    {
        if (tenantId == Guid.Empty)
            throw new ArgumentException("Tenant ID cannot be empty.", nameof(tenantId));
            
        if (string.IsNullOrWhiteSpace(contactPersonName))
            throw new ArgumentException("Contact person name cannot be empty.", nameof(contactPersonName));
            
        if (string.IsNullOrWhiteSpace(contactPersonEmail))
            throw new ArgumentException("Contact person email cannot be empty.", nameof(contactPersonEmail));
            
        return new TenantOnboarding(
            tenantId,
            onboardingType,
            contactPersonName,
            contactPersonEmail,
            createdBy);
    }
    
    private void InitializeSteps()
    {
        var steps = OnboardingType switch
        {
            OnboardingType.Express => new[]
            {
                ("Welcome & Account Setup", 1),
                ("Basic Configuration", 2),
                ("Quick Training", 3),
                ("Go Live", 4)
            },
            OnboardingType.Standard => new[]
            {
                ("Welcome & Kickoff", 1),
                ("Account Setup", 2),
                ("Configuration", 3),
                ("Data Migration", 4),
                ("Training", 5),
                ("Testing", 6),
                ("Go Live", 7)
            },
            OnboardingType.Enterprise => new[]
            {
                ("Project Kickoff", 1),
                ("Requirements Analysis", 2),
                ("Account Setup", 3),
                ("Customization", 4),
                ("Integration Setup", 5),
                ("Data Migration", 6),
                ("User Training", 7),
                ("UAT Testing", 8),
                ("Go Live Preparation", 9),
                ("Production Launch", 10)
            },
            _ => new[] { ("Setup", 1) }
        };
        
        foreach (var (name, order) in steps)
        {
            _steps.Add(OnboardingStep.Create(Id, name, order));
        }
    }
    
    public void AssignTo(string userId, string name, string email)
    {
        AssignedToUserId = userId;
        AssignedToName = name;
        AssignedToEmail = email;
        AssignedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void UpdateContactInfo(string? phone, string? preferredMethod, string? preferredTime)
    {
        ContactPersonPhone = phone;
        PreferredContactMethod = preferredMethod;
        PreferredContactTime = preferredTime;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void ScheduleKickoffMeeting(DateTime meetingDate)
    {
        KickoffMeetingDate = meetingDate;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void CompleteKickoffMeeting(string? notes)
    {
        KickoffMeetingNotes = notes;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void SetDataMigrationRequired(long totalRecords)
    {
        RequiresDataMigration = true;
        TotalRecordsToMigrate = totalRecords;
        DataMigrationStatus = "Pending";
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void UpdateDataMigrationProgress(long recordsMigrated, string status)
    {
        RecordsMigrated = recordsMigrated;
        DataMigrationStatus = status;
        
        if (status == "Started" && !DataMigrationStarted.HasValue)
            DataMigrationStarted = DateTime.UtcNow;
            
        if (status == "Completed")
            DataMigrationCompleted = DateTime.UtcNow;
            
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void SetCustomizationRequired(string requirements)
    {
        RequiresCustomization = true;
        CustomizationRequirements = requirements;
        CustomizationStatus = "Pending";
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void SetIntegrationRequired(List<string> systems)
    {
        RequiresIntegration = true;
        IntegrationSystems = JsonSerializer.Serialize(systems);
        IntegrationStatus = "Pending";
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void CompleteStep(int stepNumber, string? notes = null)
    {
        var step = _steps.FirstOrDefault(s => s.StepNumber == stepNumber);
        if (step == null)
            throw new InvalidOperationException($"Step {stepNumber} not found.");
            
        step.Complete(notes);
        
        if (stepNumber == CurrentStepNumber + 1)
            CurrentStepNumber = stepNumber;
            
        UpdateProgress();
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void AddTask(string title, string description, DateTime? dueDate = null)
    {
        var task = OnboardingTask.Create(Id, title, description, dueDate);
        _tasks.Add(task);
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void CompleteTask(Guid taskId, string? notes = null)
    {
        var task = _tasks.FirstOrDefault(t => t.Id == taskId);
        if (task == null)
            throw new InvalidOperationException("Task not found.");
            
        task.Complete(notes);
        UpdateProgress();
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void ScheduleTraining(int totalSessions, DateTime firstSessionDate)
    {
        TotalTrainingSessions = totalSessions;
        NextTrainingDate = firstSessionDate;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void CompleteTrainingSession()
    {
        TrainingSessionsCompleted++;
        
        if (TrainingSessionsCompleted >= TotalTrainingSessions)
            NextTrainingDate = null;
            
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void SendWelcomePackage(string packageUrl)
    {
        WelcomePackageUrl = packageUrl;
        WelcomePackageSent = true;
        WelcomePackageSentAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void ProvideFeedback(int satisfactionScore, string? comments)
    {
        if (satisfactionScore < 1 || satisfactionScore > 10)
            throw new ArgumentException("Satisfaction score must be between 1 and 10.", nameof(satisfactionScore));
            
        SatisfactionScore = satisfactionScore;
        FeedbackComments = comments;
        FeedbackReceivedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void UpdateNotes(string? notes, string? issues = null, string? blockers = null)
    {
        Notes = notes;
        Issues = issues;
        Blockers = blockers;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void SetPriority(OnboardingPriority priority)
    {
        Priority = priority;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void Start()
    {
        if (Status != OnboardingStatus.NotStarted)
            throw new InvalidOperationException("Onboarding has already started.");
            
        Status = OnboardingStatus.InProgress;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void Pause(string reason)
    {
        if (Status != OnboardingStatus.InProgress)
            throw new InvalidOperationException("Only in-progress onboarding can be paused.");
            
        Status = OnboardingStatus.OnHold;
        Notes = $"Paused: {reason}. {Notes}";
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void Resume()
    {
        if (Status != OnboardingStatus.OnHold)
            throw new InvalidOperationException("Only on-hold onboarding can be resumed.");
            
        Status = OnboardingStatus.InProgress;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void Complete()
    {
        if (_steps.Any(s => !s.IsCompleted))
            throw new InvalidOperationException("All steps must be completed before completing onboarding.");
            
        Status = OnboardingStatus.Completed;
        CompletedAt = DateTime.UtcNow;
        ProgressPercentage = 100;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void Cancel(string reason)
    {
        Status = OnboardingStatus.Cancelled;
        Notes = $"Cancelled: {reason}. {Notes}";
        UpdatedAt = DateTime.UtcNow;
    }
    
    private void UpdateProgress()
    {
        var completedSteps = _steps.Count(s => s.IsCompleted);
        var totalSteps = _steps.Count;
        
        var completedTasks = _tasks.Count(t => t.IsCompleted);
        var totalTasks = _tasks.Count;
        
        if (totalSteps > 0)
        {
            var stepProgress = (decimal)completedSteps / totalSteps * 70; // Steps are 70% of progress
            var taskProgress = totalTasks > 0 ? (decimal)completedTasks / totalTasks * 30 : 0; // Tasks are 30%
            
            ProgressPercentage = Math.Round(stepProgress + taskProgress, 2);
        }
    }
}

public sealed class OnboardingStep : Entity
{
    public Guid OnboardingId { get; private set; }
    public string StepName { get; private set; }
    public int StepNumber { get; private set; }
    public bool IsCompleted { get; private set; }
    public DateTime? CompletedAt { get; private set; }
    public string? CompletedBy { get; private set; }
    public string? Notes { get; private set; }
    
    private OnboardingStep() { } // EF Constructor
    
    private OnboardingStep(Guid onboardingId, string stepName, int stepNumber)
    {
        Id = Guid.NewGuid();
        OnboardingId = onboardingId;
        StepName = stepName;
        StepNumber = stepNumber;
        IsCompleted = false;
    }
    
    public static OnboardingStep Create(Guid onboardingId, string stepName, int stepNumber)
    {
        return new OnboardingStep(onboardingId, stepName, stepNumber);
    }
    
    public void Complete(string? notes = null)
    {
        IsCompleted = true;
        CompletedAt = DateTime.UtcNow;
        Notes = notes;
    }
}

public sealed class OnboardingTask : Entity
{
    public Guid OnboardingId { get; private set; }
    public string Title { get; private set; }
    public string? Description { get; private set; }
    public DateTime? DueDate { get; private set; }
    public bool IsCompleted { get; private set; }
    public DateTime? CompletedAt { get; private set; }
    public string? CompletedBy { get; private set; }
    public string? Notes { get; private set; }
    
    private OnboardingTask() { } // EF Constructor
    
    private OnboardingTask(Guid onboardingId, string title, string? description, DateTime? dueDate)
    {
        Id = Guid.NewGuid();
        OnboardingId = onboardingId;
        Title = title;
        Description = description;
        DueDate = dueDate;
        IsCompleted = false;
    }
    
    public static OnboardingTask Create(Guid onboardingId, string title, string? description, DateTime? dueDate)
    {
        return new OnboardingTask(onboardingId, title, description, dueDate);
    }
    
    public void Complete(string? notes = null)
    {
        IsCompleted = true;
        CompletedAt = DateTime.UtcNow;
        Notes = notes;
    }
}

public enum OnboardingStatus
{
    NotStarted = 0,
    InProgress = 1,
    OnHold = 2,
    Completed = 3,
    Cancelled = 4
}

public enum OnboardingType
{
    Express = 0,    // 1-3 days
    Standard = 1,   // 1-2 weeks
    Enterprise = 2, // 2-4 weeks
    Custom = 3
}

public enum OnboardingPriority
{
    Low = 0,
    Normal = 1,
    High = 2,
    Critical = 3
}