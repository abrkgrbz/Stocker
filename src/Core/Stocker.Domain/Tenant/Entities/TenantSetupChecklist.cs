using Stocker.SharedKernel.Primitives;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;

namespace Stocker.Domain.Tenant.Entities;

/// <summary>
/// Tenant'a özel kurulum kontrol listesi - Onboarding sürecini takip eder
/// </summary>
public sealed class TenantSetupChecklist : Entity
{
    public ChecklistStatus Status { get; private set; }
    
    // Basic Setup
    public bool CompanyInfoCompleted { get; private set; }
    public DateTime? CompanyInfoCompletedAt { get; private set; }
    public string? CompanyInfoCompletedBy { get; private set; }
    
    public bool LogoUploaded { get; private set; }
    public DateTime? LogoUploadedAt { get; private set; }
    public string? LogoUploadedBy { get; private set; }
    
    public bool AdminUserCreated { get; private set; }
    public DateTime? AdminUserCreatedAt { get; private set; }
    public string? AdminUserCreatedBy { get; private set; }
    
    // Organization Setup
    public bool DepartmentsCreated { get; private set; }
    public int DepartmentCount { get; private set; }
    public DateTime? DepartmentsCreatedAt { get; private set; }
    
    public bool BranchesCreated { get; private set; }
    public int BranchCount { get; private set; }
    public DateTime? BranchesCreatedAt { get; private set; }
    
    public bool RolesConfigured { get; private set; }
    public int RoleCount { get; private set; }
    public DateTime? RolesConfiguredAt { get; private set; }
    
    public bool UsersInvited { get; private set; }
    public int UserCount { get; private set; }
    public DateTime? UsersInvitedAt { get; private set; }
    
    // Module Setup
    public bool ModulesSelected { get; private set; }
    public List<string> SelectedModulesList { get; private set; }
    public DateTime? ModulesSelectedAt { get; private set; }
    
    public bool ModulesConfigured { get; private set; }
    public DateTime? ModulesConfiguredAt { get; private set; }
    
    // Financial Setup
    public bool ChartOfAccountsSetup { get; private set; }
    public int AccountCount { get; private set; }
    public DateTime? ChartOfAccountsSetupAt { get; private set; }
    
    public bool TaxSettingsConfigured { get; private set; }
    public DateTime? TaxSettingsConfiguredAt { get; private set; }
    
    public bool CurrencyConfigured { get; private set; }
    public string? PrimaryCurrency { get; private set; }
    public DateTime? CurrencyConfiguredAt { get; private set; }
    
    public bool FiscalYearConfigured { get; private set; }
    public DateTime? FiscalYearConfiguredAt { get; private set; }
    
    // Product/Service Setup
    public bool ProductCategoriesCreated { get; private set; }
    public int ProductCategoryCount { get; private set; }
    public DateTime? ProductCategoriesCreatedAt { get; private set; }
    
    public bool ProductsImported { get; private set; }
    public int ProductCount { get; private set; }
    public DateTime? ProductsImportedAt { get; private set; }
    
    public bool PricingRulesConfigured { get; private set; }
    public DateTime? PricingRulesConfiguredAt { get; private set; }
    
    // Customer/Vendor Setup
    public bool CustomersImported { get; private set; }
    public int CustomerCount { get; private set; }
    public DateTime? CustomersImportedAt { get; private set; }
    
    public bool VendorsImported { get; private set; }
    public int VendorCount { get; private set; }
    public DateTime? VendorsImportedAt { get; private set; }
    
    // Security & Compliance
    public bool SecuritySettingsConfigured { get; private set; }
    public DateTime? SecuritySettingsConfiguredAt { get; private set; }
    
    public bool PasswordPolicySet { get; private set; }
    public DateTime? PasswordPolicySetAt { get; private set; }
    
    public bool TwoFactorEnabled { get; private set; }
    public DateTime? TwoFactorEnabledAt { get; private set; }
    
    public bool BackupConfigured { get; private set; }
    public DateTime? BackupConfiguredAt { get; private set; }
    
    public bool ComplianceConfigured { get; private set; }
    public DateTime? ComplianceConfiguredAt { get; private set; }
    
    // Integration Setup
    public bool EmailIntegrationConfigured { get; private set; }
    public DateTime? EmailIntegrationConfiguredAt { get; private set; }
    
    public bool PaymentGatewayConfigured { get; private set; }
    public DateTime? PaymentGatewayConfiguredAt { get; private set; }
    
    public bool SmsIntegrationConfigured { get; private set; }
    public DateTime? SmsIntegrationConfiguredAt { get; private set; }
    
    public bool ThirdPartyIntegrationsConfigured { get; private set; }
    public List<string>? IntegratedServices { get; private set; }
    public DateTime? ThirdPartyIntegrationsConfiguredAt { get; private set; }
    
    // Customization
    public bool ThemeCustomized { get; private set; }
    public DateTime? ThemeCustomizedAt { get; private set; }
    
    public bool EmailTemplatesConfigured { get; private set; }
    public DateTime? EmailTemplatesConfiguredAt { get; private set; }
    
    public bool ReportTemplatesConfigured { get; private set; }
    public DateTime? ReportTemplatesConfiguredAt { get; private set; }
    
    public bool DashboardConfigured { get; private set; }
    public DateTime? DashboardConfiguredAt { get; private set; }
    
    // Workflow & Automation
    public bool ApprovalWorkflowsConfigured { get; private set; }
    public int WorkflowCount { get; private set; }
    public DateTime? ApprovalWorkflowsConfiguredAt { get; private set; }
    
    public bool NotificationRulesConfigured { get; private set; }
    public int NotificationRuleCount { get; private set; }
    public DateTime? NotificationRulesConfiguredAt { get; private set; }
    
    public bool AutomationRulesConfigured { get; private set; }
    public int AutomationRuleCount { get; private set; }
    public DateTime? AutomationRulesConfiguredAt { get; private set; }
    
    // Training & Documentation
    public bool TrainingCompleted { get; private set; }
    public int TrainedUserCount { get; private set; }
    public DateTime? TrainingCompletedAt { get; private set; }
    
    public bool DocumentationReviewed { get; private set; }
    public DateTime? DocumentationReviewedAt { get; private set; }
    
    public bool SupportContactsAdded { get; private set; }
    public DateTime? SupportContactsAddedAt { get; private set; }
    
    // Go-Live Readiness
    public bool DataMigrationCompleted { get; private set; }
    public DateTime? DataMigrationCompletedAt { get; private set; }
    
    public bool SystemTestingCompleted { get; private set; }
    public DateTime? SystemTestingCompletedAt { get; private set; }
    
    public bool UserAcceptanceCompleted { get; private set; }
    public DateTime? UserAcceptanceCompletedAt { get; private set; }
    
    public bool GoLiveApproved { get; private set; }
    public DateTime? GoLiveApprovedAt { get; private set; }
    public string? GoLiveApprovedBy { get; private set; }
    
    // Progress Tracking
    public int TotalItems { get; private set; }
    public int CompletedItems { get; private set; }
    public int RequiredItems { get; private set; }
    public int RequiredCompletedItems { get; private set; }
    public decimal OverallProgress { get; private set; }
    public decimal RequiredProgress { get; private set; }
    
    // Notes & Comments
    public string? Notes { get; private set; }
    public List<string>? PendingTasks { get; private set; }
    public List<string>? BlockingIssues { get; private set; }
    
    // Audit
    public DateTime CreatedAt { get; private set; }
    public string CreatedBy { get; private set; }
    public DateTime? UpdatedAt { get; private set; }
    public string? UpdatedBy { get; private set; }
    public DateTime? CompletedAt { get; private set; }
    
    private TenantSetupChecklist()
    {
        SelectedModulesList = new List<string>();
        IntegratedServices = new List<string>();
        PendingTasks = new List<string>();
        BlockingIssues = new List<string>();
    }
    
    private TenantSetupChecklist(string createdBy) : this()
    {
        Id = Guid.NewGuid();
        Status = ChecklistStatus.NotStarted;
        CreatedAt = DateTime.UtcNow;
        CreatedBy = createdBy;
        
        // Initialize counts
        TotalItems = 0;
        CompletedItems = 0;
        RequiredItems = 0;
        RequiredCompletedItems = 0;
        OverallProgress = 0;
        RequiredProgress = 0;
        
        CalculateTotalItems();
    }
    
    public static TenantSetupChecklist Create(string createdBy)
    {
        if (string.IsNullOrWhiteSpace(createdBy))
            throw new ArgumentException("Created by cannot be empty.", nameof(createdBy));
            
        return new TenantSetupChecklist(createdBy);
    }
    
    // Company Info
    public void CompleteCompanyInfo(string completedBy)
    {
        CompanyInfoCompleted = true;
        CompanyInfoCompletedAt = DateTime.UtcNow;
        CompanyInfoCompletedBy = completedBy;
        UpdateProgress();
    }
    
    public void UploadLogo(string uploadedBy)
    {
        LogoUploaded = true;
        LogoUploadedAt = DateTime.UtcNow;
        LogoUploadedBy = uploadedBy;
        UpdateProgress();
    }
    
    // Admin User
    public void CreateAdminUser(string createdBy)
    {
        AdminUserCreated = true;
        AdminUserCreatedAt = DateTime.UtcNow;
        AdminUserCreatedBy = createdBy;
        UpdateProgress();
    }
    
    // Organization
    public void CreateDepartments(int count)
    {
        DepartmentsCreated = true;
        DepartmentCount = count;
        DepartmentsCreatedAt = DateTime.UtcNow;
        UpdateProgress();
    }
    
    public void CreateBranches(int count)
    {
        BranchesCreated = true;
        BranchCount = count;
        BranchesCreatedAt = DateTime.UtcNow;
        UpdateProgress();
    }
    
    public void ConfigureRoles(int count)
    {
        RolesConfigured = true;
        RoleCount = count;
        RolesConfiguredAt = DateTime.UtcNow;
        UpdateProgress();
    }
    
    public void InviteUsers(int count)
    {
        UsersInvited = true;
        UserCount = count;
        UsersInvitedAt = DateTime.UtcNow;
        UpdateProgress();
    }
    
    // Modules
    public void SelectModules(List<string> modules)
    {
        ModulesSelected = true;
        SelectedModulesList = modules;
        ModulesSelectedAt = DateTime.UtcNow;
        UpdateProgress();
    }
    
    public void ConfigureModules()
    {
        ModulesConfigured = true;
        ModulesConfiguredAt = DateTime.UtcNow;
        UpdateProgress();
    }
    
    // Financial
    public void SetupChartOfAccounts(int count)
    {
        ChartOfAccountsSetup = true;
        AccountCount = count;
        ChartOfAccountsSetupAt = DateTime.UtcNow;
        UpdateProgress();
    }
    
    public void ConfigureTaxSettings()
    {
        TaxSettingsConfigured = true;
        TaxSettingsConfiguredAt = DateTime.UtcNow;
        UpdateProgress();
    }
    
    public void ConfigureCurrency(string currency)
    {
        CurrencyConfigured = true;
        PrimaryCurrency = currency;
        CurrencyConfiguredAt = DateTime.UtcNow;
        UpdateProgress();
    }
    
    public void ConfigureFiscalYear()
    {
        FiscalYearConfigured = true;
        FiscalYearConfiguredAt = DateTime.UtcNow;
        UpdateProgress();
    }
    
    // Products
    public void CreateProductCategories(int count)
    {
        ProductCategoriesCreated = true;
        ProductCategoryCount = count;
        ProductCategoriesCreatedAt = DateTime.UtcNow;
        UpdateProgress();
    }
    
    public void ImportProducts(int count)
    {
        ProductsImported = true;
        ProductCount = count;
        ProductsImportedAt = DateTime.UtcNow;
        UpdateProgress();
    }
    
    public void ConfigurePricingRules()
    {
        PricingRulesConfigured = true;
        PricingRulesConfiguredAt = DateTime.UtcNow;
        UpdateProgress();
    }
    
    // Customers/Vendors
    public void ImportCustomers(int count)
    {
        CustomersImported = true;
        CustomerCount = count;
        CustomersImportedAt = DateTime.UtcNow;
        UpdateProgress();
    }
    
    public void ImportVendors(int count)
    {
        VendorsImported = true;
        VendorCount = count;
        VendorsImportedAt = DateTime.UtcNow;
        UpdateProgress();
    }
    
    // Security
    public void ConfigureSecuritySettings()
    {
        SecuritySettingsConfigured = true;
        SecuritySettingsConfiguredAt = DateTime.UtcNow;
        UpdateProgress();
    }
    
    public void SetPasswordPolicy()
    {
        PasswordPolicySet = true;
        PasswordPolicySetAt = DateTime.UtcNow;
        UpdateProgress();
    }
    
    public void EnableTwoFactor()
    {
        TwoFactorEnabled = true;
        TwoFactorEnabledAt = DateTime.UtcNow;
        UpdateProgress();
    }
    
    public void ConfigureBackup()
    {
        BackupConfigured = true;
        BackupConfiguredAt = DateTime.UtcNow;
        UpdateProgress();
    }
    
    public void ConfigureCompliance()
    {
        ComplianceConfigured = true;
        ComplianceConfiguredAt = DateTime.UtcNow;
        UpdateProgress();
    }
    
    // Go-Live
    public void ApproveGoLive(string approvedBy)
    {
        GoLiveApproved = true;
        GoLiveApprovedAt = DateTime.UtcNow;
        GoLiveApprovedBy = approvedBy;
        Status = ChecklistStatus.Completed;
        CompletedAt = DateTime.UtcNow;
        UpdateProgress();
    }
    
    // Notes
    public void UpdateNotes(string notes)
    {
        Notes = notes;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void AddPendingTask(string task)
    {
        PendingTasks ??= new List<string>();
        PendingTasks.Add(task);
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void AddBlockingIssue(string issue)
    {
        BlockingIssues ??= new List<string>();
        BlockingIssues.Add(issue);
        UpdatedAt = DateTime.UtcNow;
    }
    
    // Progress calculation
    private void CalculateTotalItems()
    {
        // Count all boolean properties as checkable items
        var properties = GetType().GetProperties()
            .Where(p => p.PropertyType == typeof(bool) && 
                       !p.Name.Contains("Required") &&
                       p.Name != "IsActive");
                       
        TotalItems = properties.Count();
        
        // Define required items
        var requiredItemNames = new[]
        {
            nameof(CompanyInfoCompleted),
            nameof(AdminUserCreated),
            nameof(ModulesSelected),
            nameof(SecuritySettingsConfigured),
            nameof(PasswordPolicySet)
        };
        
        RequiredItems = requiredItemNames.Length;
    }
    
    private void UpdateProgress()
    {
        // Count completed items
        var properties = GetType().GetProperties()
            .Where(p => p.PropertyType == typeof(bool) && 
                       !p.Name.Contains("Required") &&
                       p.Name != "IsActive");
                       
        CompletedItems = properties.Count(p => (bool)(p.GetValue(this) ?? false));
        
        // Count required completed items
        var requiredItemNames = new[]
        {
            nameof(CompanyInfoCompleted),
            nameof(AdminUserCreated),
            nameof(ModulesSelected),
            nameof(SecuritySettingsConfigured),
            nameof(PasswordPolicySet)
        };
        
        RequiredCompletedItems = requiredItemNames
            .Count(name => (bool)(GetType().GetProperty(name)?.GetValue(this) ?? false));
        
        // Calculate progress percentages
        OverallProgress = TotalItems > 0 ? (decimal)CompletedItems / TotalItems * 100 : 0;
        RequiredProgress = RequiredItems > 0 ? (decimal)RequiredCompletedItems / RequiredItems * 100 : 0;
        
        // Update status based on progress (only if not already completed)
        if (Status != ChecklistStatus.Completed)
        {
            if (CompletedItems == 0)
            {
                Status = ChecklistStatus.NotStarted;
            }
            else if (RequiredCompletedItems == RequiredItems)
            {
                Status = ChecklistStatus.RequiredCompleted;
            }
            else if (CompletedItems > 0)
            {
                Status = ChecklistStatus.InProgress;
            }
        }
        
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void UpdateModifiedBy(string modifiedBy)
    {
        UpdatedBy = modifiedBy;
        UpdatedAt = DateTime.UtcNow;
    }
}

public enum ChecklistStatus
{
    NotStarted = 0,
    InProgress = 1,
    RequiredCompleted = 2,
    Completed = 3,
    Abandoned = 4
}