using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Master.Entities;

public sealed class TenantSetupWizard : Entity
{
    public Guid TenantId { get; private set; }
    public WizardType WizardType { get; private set; }
    public WizardStatus Status { get; private set; }
    
    // Progress Tracking
    public int TotalSteps { get; private set; }
    public int CompletedSteps { get; private set; }
    public int CurrentStep { get; private set; }
    public decimal ProgressPercentage { get; private set; }
    
    // Step Details
    public string CurrentStepName { get; private set; }
    public string CurrentStepDescription { get; private set; }
    public StepCategory CurrentStepCategory { get; private set; }
    public bool IsCurrentStepRequired { get; private set; }
    public bool CanSkipCurrentStep { get; private set; }
    
    // Completed Steps JSON
    public string CompletedStepsData { get; private set; } // JSON
    public string SkippedStepsData { get; private set; } // JSON
    public string PendingStepsData { get; private set; } // JSON
    
    // Time Tracking
    public DateTime StartedAt { get; private set; }
    public DateTime? CompletedAt { get; private set; }
    public DateTime? LastActivityAt { get; private set; }
    public DateTime? EstimatedCompletionTime { get; private set; }
    public TimeSpan? TotalTimeSpent { get; private set; }
    public TimeSpan? AverageStepTime { get; private set; }
    
    // User Information
    public string StartedBy { get; private set; }
    public string? CompletedBy { get; private set; }
    public string? LastModifiedBy { get; private set; }
    
    // Help & Support
    public bool NeedsAssistance { get; private set; }
    public string? AssistanceNotes { get; private set; }
    public int HelpRequestCount { get; private set; }
    public DateTime? LastHelpRequestAt { get; private set; }
    
    // Validation
    public bool HasErrors { get; private set; }
    public string? ErrorMessages { get; private set; } // JSON
    public bool HasWarnings { get; private set; }
    public string? WarningMessages { get; private set; } // JSON
    
    // Configuration
    public string? SavedConfiguration { get; private set; } // JSON - Saved progress
    public string? DefaultConfiguration { get; private set; } // JSON - Default values
    public bool AutoSaveEnabled { get; private set; }
    public DateTime? LastAutoSaveAt { get; private set; }
    
    // Navigation
    public Tenant Tenant { get; private set; }
    
    private TenantSetupWizard() { } // EF Constructor
    
    private TenantSetupWizard(
        Guid tenantId,
        WizardType wizardType,
        int totalSteps,
        string startedBy)
    {
        Id = Guid.NewGuid();
        TenantId = tenantId;
        WizardType = wizardType;
        Status = WizardStatus.NotStarted;
        TotalSteps = totalSteps;
        CompletedSteps = 0;
        CurrentStep = 1;
        ProgressPercentage = 0;
        StartedAt = DateTime.UtcNow;
        StartedBy = startedBy;
        AutoSaveEnabled = true;
        NeedsAssistance = false;
        HasErrors = false;
        HasWarnings = false;
        HelpRequestCount = 0;
        CompletedStepsData = "[]";
        SkippedStepsData = "[]";
        PendingStepsData = "[]";
    }
    
    public static TenantSetupWizard Create(
        Guid tenantId,
        WizardType wizardType,
        int totalSteps,
        string startedBy)
    {
        if (tenantId == Guid.Empty)
            throw new ArgumentException("Tenant ID cannot be empty.", nameof(tenantId));
            
        if (totalSteps <= 0)
            throw new ArgumentException("Total steps must be greater than zero.", nameof(totalSteps));
            
        if (string.IsNullOrWhiteSpace(startedBy))
            throw new ArgumentException("Started by cannot be empty.", nameof(startedBy));
            
        return new TenantSetupWizard(tenantId, wizardType, totalSteps, startedBy);
    }
    
    public void StartWizard()
    {
        if (Status != WizardStatus.NotStarted)
            throw new InvalidOperationException("Wizard has already been started.");
            
        Status = WizardStatus.InProgress;
        LastActivityAt = DateTime.UtcNow;
    }
    
    public void CompleteCurrentStep()
    {
        if (Status != WizardStatus.InProgress)
            throw new InvalidOperationException("Wizard is not in progress.");
            
        CompletedSteps++;
        ProgressPercentage = (decimal)CompletedSteps / TotalSteps * 100;
        
        if (CompletedSteps >= TotalSteps)
        {
            CompleteWizard();
        }
        else
        {
            CurrentStep++;
            LastActivityAt = DateTime.UtcNow;
        }
    }
    
    public void SkipCurrentStep(string reason)
    {
        if (!CanSkipCurrentStep)
            throw new InvalidOperationException("Current step cannot be skipped.");
            
        CurrentStep++;
        LastActivityAt = DateTime.UtcNow;
    }
    
    public void GoToPreviousStep()
    {
        if (CurrentStep <= 1)
            throw new InvalidOperationException("Already at the first step.");
            
        CurrentStep--;
        LastActivityAt = DateTime.UtcNow;
    }
    
    public void GoToStep(int stepNumber)
    {
        if (stepNumber < 1 || stepNumber > TotalSteps)
            throw new ArgumentOutOfRangeException(nameof(stepNumber));
            
        CurrentStep = stepNumber;
        LastActivityAt = DateTime.UtcNow;
    }
    
    public void SaveProgress(string configuration)
    {
        SavedConfiguration = configuration;
        LastAutoSaveAt = DateTime.UtcNow;
        LastActivityAt = DateTime.UtcNow;
    }
    
    public void RequestHelp(string notes)
    {
        NeedsAssistance = true;
        AssistanceNotes = notes;
        HelpRequestCount++;
        LastHelpRequestAt = DateTime.UtcNow;
    }
    
    public void ResolveHelp()
    {
        NeedsAssistance = false;
        AssistanceNotes = null;
    }
    
    public void SetError(string errorMessage)
    {
        HasErrors = true;
        ErrorMessages = errorMessage;
        Status = WizardStatus.Error;
    }
    
    public void ClearErrors()
    {
        HasErrors = false;
        ErrorMessages = null;
        if (Status == WizardStatus.Error)
            Status = WizardStatus.InProgress;
    }
    
    public void SetWarning(string warningMessage)
    {
        HasWarnings = true;
        WarningMessages = warningMessage;
    }
    
    public void PauseWizard()
    {
        if (Status != WizardStatus.InProgress)
            throw new InvalidOperationException("Can only pause a wizard in progress.");
            
        Status = WizardStatus.Paused;
        LastActivityAt = DateTime.UtcNow;
    }
    
    public void ResumeWizard()
    {
        if (Status != WizardStatus.Paused)
            throw new InvalidOperationException("Can only resume a paused wizard.");
            
        Status = WizardStatus.InProgress;
        LastActivityAt = DateTime.UtcNow;
    }
    
    public void CancelWizard(string reason)
    {
        Status = WizardStatus.Cancelled;
        CompletedAt = DateTime.UtcNow;
    }
    
    private void CompleteWizard()
    {
        Status = WizardStatus.Completed;
        CompletedAt = DateTime.UtcNow;
        ProgressPercentage = 100;
        TotalTimeSpent = CompletedAt.Value - StartedAt;
        
        if (CompletedSteps > 0)
            AverageStepTime = TotalTimeSpent.Value / CompletedSteps;
    }
    
    public void UpdateStepDetails(
        string stepName,
        string stepDescription,
        StepCategory category,
        bool isRequired,
        bool canSkip)
    {
        CurrentStepName = stepName;
        CurrentStepDescription = stepDescription;
        CurrentStepCategory = category;
        IsCurrentStepRequired = isRequired;
        CanSkipCurrentStep = canSkip;
        LastActivityAt = DateTime.UtcNow;
    }
}

public enum WizardType
{
    InitialSetup = 0,
    CompanySetup = 1,
    UserSetup = 2,
    ModuleSetup = 3,
    SecuritySetup = 4,
    IntegrationSetup = 5,
    CustomizationSetup = 6,
    DataImport = 7,
    Training = 8,
    Advanced = 9
}

public enum WizardStatus
{
    NotStarted = 0,
    InProgress = 1,
    Paused = 2,
    Completed = 3,
    Cancelled = 4,
    Error = 5
}

public enum StepCategory
{
    Required = 0,
    Recommended = 1,
    Optional = 2,
    Advanced = 3,
    Review = 4,
    Confirmation = 5
}