using Stocker.SharedKernel.Primitives;
using System;

namespace Stocker.Domain.Tenant.Entities;

/// <summary>
/// Kurulum sihirbazı adımı
/// </summary>
public sealed class SetupWizardStep : Entity
{
    public Guid WizardId { get; private set; }
    public int StepOrder { get; private set; }
    public string Name { get; private set; }
    public string Title { get; private set; }
    public string Description { get; private set; }
    public StepCategory Category { get; private set; }
    public StepStatus Status { get; private set; }
    public bool IsRequired { get; private set; }
    public bool CanSkip { get; private set; }
    
    // Step Data
    public string? StepData { get; private set; } // JSON data for the step
    public string? ValidationErrors { get; private set; } // JSON array of validation errors
    
    // Time Tracking
    public DateTime? StartedAt { get; private set; }
    public DateTime? CompletedAt { get; private set; }
    public TimeSpan? Duration { get; private set; }
    
    // User Tracking
    public string? StartedBy { get; private set; }
    public string? CompletedBy { get; private set; }
    
    // Skip Information
    public bool IsSkipped { get; private set; }
    public string? SkipReason { get; private set; }
    public string? SkippedBy { get; private set; }
    public DateTime? SkippedAt { get; private set; }
    
    // Navigation
    public SetupWizard Wizard { get; private set; }
    
    private SetupWizardStep() { }
    
    private SetupWizardStep(
        Guid wizardId,
        int stepOrder,
        string name,
        string title,
        string description,
        StepCategory category,
        bool isRequired,
        bool canSkip)
    {
        Id = Guid.NewGuid();
        WizardId = wizardId;
        StepOrder = stepOrder;
        Name = name;
        Title = title;
        Description = description;
        Category = category;
        Status = StepStatus.Pending;
        IsRequired = isRequired;
        CanSkip = canSkip;
        IsSkipped = false;
    }
    
    public static SetupWizardStep Create(
        Guid wizardId,
        int stepOrder,
        string name,
        string title,
        string description,
        StepCategory category,
        bool isRequired,
        bool canSkip)
    {
        if (wizardId == Guid.Empty)
            throw new ArgumentException("Wizard ID cannot be empty.", nameof(wizardId));
            
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Step name cannot be empty.", nameof(name));
            
        if (string.IsNullOrWhiteSpace(title))
            throw new ArgumentException("Step title cannot be empty.", nameof(title));
            
        if (stepOrder < 0)
            throw new ArgumentException("Step order must be non-negative.", nameof(stepOrder));
            
        return new SetupWizardStep(
            wizardId,
            stepOrder,
            name,
            title,
            description,
            category,
            isRequired,
            canSkip
        );
    }
    
    public void MarkAsCurrent()
    {
        if (Status != StepStatus.Pending)
            throw new InvalidOperationException($"Cannot mark step as current. Current status: {Status}");
            
        Status = StepStatus.Current;
        StartedAt = DateTime.UtcNow;
    }
    
    public void Start(string startedBy)
    {
        if (Status != StepStatus.Pending && Status != StepStatus.Current)
            throw new InvalidOperationException($"Cannot start step. Current status: {Status}");
            
        Status = StepStatus.InProgress;
        StartedAt = DateTime.UtcNow;
        StartedBy = startedBy;
    }
    
    public void Complete(string completedBy, string? stepData = null)
    {
        if (Status != StepStatus.Current && Status != StepStatus.InProgress)
            throw new InvalidOperationException($"Cannot complete step. Current status: {Status}");
            
        Status = StepStatus.Completed;
        CompletedAt = DateTime.UtcNow;
        CompletedBy = completedBy;
        StepData = stepData;
        
        if (StartedAt.HasValue)
        {
            Duration = CompletedAt.Value - StartedAt.Value;
        }
    }
    
    public void Skip(string skippedBy, string reason)
    {
        if (!CanSkip)
            throw new InvalidOperationException("This step cannot be skipped.");
            
        if (Status != StepStatus.Current && Status != StepStatus.Pending)
            throw new InvalidOperationException($"Cannot skip step. Current status: {Status}");
            
        Status = StepStatus.Skipped;
        IsSkipped = true;
        SkipReason = reason;
        SkippedBy = skippedBy;
        SkippedAt = DateTime.UtcNow;
    }
    
    public void Cancel(string reason)
    {
        if (Status == StepStatus.Completed || Status == StepStatus.Skipped)
            return; // Already finished, no need to cancel
            
        Status = StepStatus.Cancelled;
        SkipReason = reason;
    }
    
    public void UpdateData(string stepData)
    {
        if (Status != StepStatus.InProgress && Status != StepStatus.Current)
            throw new InvalidOperationException("Can only update data for active steps.");
            
        StepData = stepData;
    }
    
    public void SetValidationErrors(string validationErrors)
    {
        ValidationErrors = validationErrors;
        Status = StepStatus.Error;
    }
    
    public void ClearValidationErrors()
    {
        ValidationErrors = null;
        if (Status == StepStatus.Error)
        {
            Status = StartedAt.HasValue ? StepStatus.InProgress : StepStatus.Current;
        }
    }
    
    public void ResetStep()
    {
        Status = StepStatus.Pending;
        StartedAt = null;
        StartedBy = null;
        CompletedAt = null;
        CompletedBy = null;
        Duration = null;
        StepData = null;
        ValidationErrors = null;
        IsSkipped = false;
        SkipReason = null;
        SkippedBy = null;
        SkippedAt = null;
    }
}

public enum StepStatus
{
    Pending = 0,
    Current = 1,
    InProgress = 2,
    Completed = 3,
    Skipped = 4,
    Error = 5,
    Cancelled = 6
}