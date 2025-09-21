using Stocker.SharedKernel.Primitives;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Stocker.Domain.Tenant.Entities;

/// <summary>
/// Tenant'a özel kurulum sihirbazı
/// </summary>
public sealed class SetupWizard : Entity
{
    public WizardType WizardType { get; private set; }
    public WizardStatus Status { get; private set; }
    
    // Progress Tracking
    public int TotalSteps { get; private set; }
    public int CompletedSteps { get; private set; }
    public int CurrentStepIndex { get; private set; }
    public decimal ProgressPercentage { get; private set; }
    
    // Time Tracking
    public DateTime StartedAt { get; private set; }
    public DateTime? CompletedAt { get; private set; }
    public DateTime? LastActivityAt { get; private set; }
    
    // User Information
    public string StartedBy { get; private set; }
    public string? CompletedBy { get; private set; }
    public string? LastModifiedBy { get; private set; }
    
    // Navigation
    public ICollection<SetupWizardStep> Steps { get; private set; }
    
    private SetupWizard() 
    { 
        Steps = new List<SetupWizardStep>();
    }
    
    private SetupWizard(
        WizardType wizardType,
        string startedBy) : this()
    {
        Id = Guid.NewGuid();
        WizardType = wizardType;
        Status = WizardStatus.NotStarted;
        StartedAt = DateTime.UtcNow;
        StartedBy = startedBy;
        CurrentStepIndex = 0;
        CompletedSteps = 0;
        ProgressPercentage = 0;
    }
    
    public static SetupWizard Create(
        WizardType wizardType,
        string startedBy)
    {
        if (string.IsNullOrWhiteSpace(startedBy))
            throw new ArgumentException("Started by cannot be empty.", nameof(startedBy));
            
        var wizard = new SetupWizard(wizardType, startedBy);
        
        // Initialize steps based on wizard type
        wizard.InitializeSteps();
        
        return wizard;
    }
    
    private void InitializeSteps()
    {
        var stepDefinitions = WizardType switch
        {
            WizardType.InitialSetup => GetInitialSetupSteps(),
            WizardType.ModuleSetup => GetModuleSetupSteps(),
            WizardType.SecuritySetup => GetSecuritySetupSteps(),
            _ => GetDefaultSteps()
        };
        
        foreach (var (index, definition) in stepDefinitions.Select((s, i) => (i, s)))
        {
            var step = SetupWizardStep.Create(
                Id,
                index,
                definition.Name,
                definition.Title,
                definition.Description,
                definition.Category,
                definition.IsRequired,
                definition.CanSkip
            );
            Steps.Add(step);
        }
        
        TotalSteps = Steps.Count;
    }
    
    private List<StepDefinition> GetInitialSetupSteps()
    {
        return new List<StepDefinition>
        {
            new("company_info", "Şirket Bilgileri", "Temel şirket bilgilerini tamamlayın", StepCategory.Required, true, false),
            new("users", "Kullanıcılar", "Yönetici ve kullanıcı tanımlamaları", StepCategory.Required, true, false),
            new("modules", "Modüller", "Kullanılacak modülleri seçin", StepCategory.Recommended, false, true),
            new("security", "Güvenlik", "İki faktörlü doğrulama, IP kısıtlamaları", StepCategory.Recommended, false, true),
            new("integrations", "Entegrasyonlar", "E-fatura, muhasebe entegrasyonları", StepCategory.Optional, false, true),
            new("completed", "Tamamlandı", "Kurulum tamamlandı", StepCategory.Review, false, false)
        };
    }
    
    private List<StepDefinition> GetModuleSetupSteps()
    {
        return new List<StepDefinition>
        {
            new("module_selection", "Modül Seçimi", "Aktif edilecek modülleri seçin", StepCategory.Required, true, false),
            new("module_config", "Modül Yapılandırma", "Modül ayarlarını yapın", StepCategory.Required, true, false),
            new("permissions", "Yetkiler", "Modül yetkilerini ayarlayın", StepCategory.Required, true, false),
            new("completed", "Tamamlandı", "Modül kurulumu tamamlandı", StepCategory.Review, false, false)
        };
    }
    
    private List<StepDefinition> GetSecuritySetupSteps()
    {
        return new List<StepDefinition>
        {
            new("two_factor", "İki Faktörlü Doğrulama", "2FA ayarlarını yapın", StepCategory.Required, true, false),
            new("ip_restriction", "IP Kısıtlaması", "İzin verilen IP adreslerini tanımlayın", StepCategory.Recommended, false, true),
            new("password_policy", "Şifre Politikası", "Şifre kurallarını belirleyin", StepCategory.Required, true, false),
            new("completed", "Tamamlandı", "Güvenlik ayarları tamamlandı", StepCategory.Review, false, false)
        };
    }
    
    private List<StepDefinition> GetDefaultSteps()
    {
        return new List<StepDefinition>
        {
            new("step1", "Adım 1", "İlk adım", StepCategory.Required, true, false),
            new("step2", "Adım 2", "İkinci adım", StepCategory.Optional, false, true),
            new("completed", "Tamamlandı", "İşlem tamamlandı", StepCategory.Review, false, false)
        };
    }
    
    public void StartWizard()
    {
        if (Status != WizardStatus.NotStarted)
            throw new InvalidOperationException("Wizard has already been started.");
            
        Status = WizardStatus.InProgress;
        LastActivityAt = DateTime.UtcNow;
        
        // Mark first step as current
        var firstStep = Steps.OrderBy(s => s.StepOrder).FirstOrDefault();
        firstStep?.MarkAsCurrent();
    }
    
    public void CompleteCurrentStep(string completedBy, string? stepData = null)
    {
        if (Status != WizardStatus.InProgress)
            throw new InvalidOperationException("Wizard is not in progress.");
            
        var currentStep = GetCurrentStep();
        if (currentStep == null)
            throw new InvalidOperationException("No current step found.");
            
        currentStep.Complete(completedBy, stepData);
        CompletedSteps++;
        ProgressPercentage = (decimal)CompletedSteps / TotalSteps * 100;
        LastActivityAt = DateTime.UtcNow;
        LastModifiedBy = completedBy;
        
        // Move to next step or complete wizard
        var nextStep = GetNextStep();
        if (nextStep != null)
        {
            CurrentStepIndex++;
            nextStep.MarkAsCurrent();
        }
        else
        {
            CompleteWizard(completedBy);
        }
    }
    
    public void SkipCurrentStep(string skippedBy, string reason)
    {
        var currentStep = GetCurrentStep();
        if (currentStep == null)
            throw new InvalidOperationException("No current step found.");
            
        if (!currentStep.CanSkip)
            throw new InvalidOperationException("Current step cannot be skipped.");
            
        currentStep.Skip(skippedBy, reason);
        LastActivityAt = DateTime.UtcNow;
        LastModifiedBy = skippedBy;
        
        // Move to next step
        var nextStep = GetNextStep();
        if (nextStep != null)
        {
            CurrentStepIndex++;
            nextStep.MarkAsCurrent();
        }
        else
        {
            // If this was the last step and it was skipped, check if we can complete
            if (CanCompleteWithSkippedSteps())
            {
                CompleteWizard(skippedBy);
            }
        }
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
    
    public void CancelWizard(string cancelledBy, string reason)
    {
        Status = WizardStatus.Cancelled;
        CompletedAt = DateTime.UtcNow;
        LastModifiedBy = cancelledBy;
        
        // Mark all incomplete steps as cancelled
        foreach (var step in Steps.Where(s => s.Status == StepStatus.Pending || s.Status == StepStatus.Current))
        {
            step.Cancel(reason);
        }
    }
    
    private void CompleteWizard(string completedBy)
    {
        Status = WizardStatus.Completed;
        CompletedAt = DateTime.UtcNow;
        CompletedBy = completedBy;
        ProgressPercentage = 100;
    }
    
    private SetupWizardStep? GetCurrentStep()
    {
        return Steps.FirstOrDefault(s => s.Status == StepStatus.Current);
    }
    
    private SetupWizardStep? GetNextStep()
    {
        return Steps
            .Where(s => s.Status == StepStatus.Pending)
            .OrderBy(s => s.StepOrder)
            .FirstOrDefault();
    }
    
    private bool CanCompleteWithSkippedSteps()
    {
        // Check if all required steps are completed
        var requiredSteps = Steps.Where(s => s.IsRequired);
        return requiredSteps.All(s => s.Status == StepStatus.Completed);
    }
    
    // Value object for step definition
    private record StepDefinition(
        string Name,
        string Title,
        string Description,
        StepCategory Category,
        bool IsRequired,
        bool CanSkip
    );
}

public enum WizardType
{
    InitialSetup = 0,
    ModuleSetup = 1,
    SecuritySetup = 2,
    IntegrationSetup = 3,
    CustomizationSetup = 4,
    DataImport = 5
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
    Review = 3
}