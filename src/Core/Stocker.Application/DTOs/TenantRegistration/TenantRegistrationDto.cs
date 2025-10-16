using Stocker.Domain.Master.Entities;

namespace Stocker.Application.DTOs.TenantRegistration;

public class TenantRegistrationDto
{
    public Guid Id { get; set; }
    public string RegistrationCode { get; set; } = string.Empty;
    public string CompanyName { get; set; } = string.Empty;
    public string CompanyCode { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public RegistrationStatus StatusCode { get; set; }
    public string ContactEmail { get; set; } = string.Empty;
    public string ContactPhone { get; set; } = string.Empty;
    public string AdminEmail { get; set; } = string.Empty;
    public string AdminName { get; set; } = string.Empty;
    public bool EmailVerified { get; set; }
    public DateTime? EmailVerifiedAt { get; set; }
    public DateTime RequestedAt { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public Guid? PackageId { get; set; }
    public string? PackageName { get; set; }
    public string? BillingCycle { get; set; }
    public Guid? InitialDataId { get; set; }
    public Guid? SetupWizardId { get; set; }
    public Guid? ChecklistId { get; set; }
}

public class TenantSetupWizardDto
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public string WizardType { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int TotalSteps { get; set; }
    public int CompletedSteps { get; set; }
    public int CurrentStep { get; set; }
    public decimal ProgressPercentage { get; set; }
    public string? CurrentStepName { get; set; }
    public string? CurrentStepDescription { get; set; }
    public bool IsCurrentStepRequired { get; set; }
    public bool CanSkipCurrentStep { get; set; }
    public DateTime StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
}

public class TenantSetupChecklistDto
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public string Status { get; set; } = string.Empty;
    
    // Basic Setup
    public bool CompanyInfoCompleted { get; set; }
    public bool LogoUploaded { get; set; }
    public bool AdminUserCreated { get; set; }
    
    // Organization Setup
    public bool DepartmentsCreated { get; set; }
    public bool BranchesCreated { get; set; }
    public bool RolesConfigured { get; set; }
    public bool UsersInvited { get; set; }
    
    // Module Setup
    public bool ModulesSelected { get; set; }
    public bool ModulesConfigured { get; set; }
    
    // Financial Setup
    public bool ChartOfAccountsSetup { get; set; }
    public bool TaxSettingsConfigured { get; set; }
    public bool CurrencyConfigured { get; set; }
    
    // Security
    public bool SecuritySettingsConfigured { get; set; }
    public bool PasswordPolicySet { get; set; }
    public bool BackupConfigured { get; set; }
    
    // Progress
    public int TotalItems { get; set; }
    public int CompletedItems { get; set; }
    public int RequiredItems { get; set; }
    public int RequiredCompletedItems { get; set; }
    public decimal OverallProgress { get; set; }
    public decimal RequiredProgress { get; set; }
    public bool CanGoLive { get; set; }
}