using Stocker.SharedKernel.Primitives;
using System.Text.Json;

namespace Stocker.Domain.Master.Entities;

public sealed class TenantSetupChecklist : Entity
{
    public Guid TenantId { get; private set; }
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
    public string SelectedModulesList { get; private set; } // JSON array
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
    public string? IntegratedServices { get; private set; } // JSON array
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
    public string? PendingTasks { get; private set; } // JSON array
    public string? BlockingIssues { get; private set; } // JSON array
    
    // Audit
    public DateTime CreatedAt { get; private set; }
    public string CreatedBy { get; private set; }
    public DateTime? UpdatedAt { get; private set; }
    public string? UpdatedBy { get; private set; }
    public DateTime? CompletedAt { get; private set; }
    
    // Navigation
    public Tenant Tenant { get; private set; }
    
    private TenantSetupChecklist() { } // EF Constructor
    
    private TenantSetupChecklist(Guid tenantId, string createdBy)
    {
        Id = Guid.NewGuid();
        TenantId = tenantId;
        Status = ChecklistStatus.NotStarted;
        CreatedAt = DateTime.UtcNow;
        CreatedBy = createdBy;
        
        // Initialize counts
        TotalItems = 40; // Total checklist items
        CompletedItems = 0;
        RequiredItems = 15; // Required items for go-live
        RequiredCompletedItems = 0;
        OverallProgress = 0;
        RequiredProgress = 0;
        
        SelectedModulesList = "[]";
        IntegratedServices = "[]";
        PendingTasks = "[]";
        BlockingIssues = "[]";
    }
    
    public static TenantSetupChecklist Create(Guid tenantId, string createdBy)
    {
        if (tenantId == Guid.Empty)
            throw new ArgumentException("Tenant ID cannot be empty.", nameof(tenantId));
            
        if (string.IsNullOrWhiteSpace(createdBy))
            throw new ArgumentException("Created by cannot be empty.", nameof(createdBy));
            
        return new TenantSetupChecklist(tenantId, createdBy);
    }
    
    public void CompleteCompanyInfo(string completedBy)
    {
        CompanyInfoCompleted = true;
        CompanyInfoCompletedAt = DateTime.UtcNow;
        CompanyInfoCompletedBy = completedBy;
        UpdateProgress(true);
    }
    
    public void UploadLogo(string uploadedBy)
    {
        LogoUploaded = true;
        LogoUploadedAt = DateTime.UtcNow;
        LogoUploadedBy = uploadedBy;
        UpdateProgress(false);
    }
    
    public void CreateAdminUser(string createdBy)
    {
        AdminUserCreated = true;
        AdminUserCreatedAt = DateTime.UtcNow;
        AdminUserCreatedBy = createdBy;
        UpdateProgress(true);
    }
    
    public void CreateDepartments(int count)
    {
        DepartmentsCreated = true;
        DepartmentCount = count;
        DepartmentsCreatedAt = DateTime.UtcNow;
        UpdateProgress(false);
    }
    
    public void CreateBranches(int count)
    {
        BranchesCreated = true;
        BranchCount = count;
        BranchesCreatedAt = DateTime.UtcNow;
        UpdateProgress(false);
    }
    
    public void ConfigureRoles(int count)
    {
        RolesConfigured = true;
        RoleCount = count;
        RolesConfiguredAt = DateTime.UtcNow;
        UpdateProgress(true);
    }
    
    public void InviteUsers(int count)
    {
        UsersInvited = true;
        UserCount = count;
        UsersInvitedAt = DateTime.UtcNow;
        UpdateProgress(false);
    }
    
    public void SelectModules(List<string> modules)
    {
        ModulesSelected = true;
        SelectedModulesList = JsonSerializer.Serialize(modules);
        ModulesSelectedAt = DateTime.UtcNow;
        UpdateProgress(true);
    }
    
    public void ConfigureModules()
    {
        ModulesConfigured = true;
        ModulesConfiguredAt = DateTime.UtcNow;
        UpdateProgress(true);
    }
    
    public void SetupChartOfAccounts(int accountCount)
    {
        ChartOfAccountsSetup = true;
        AccountCount = accountCount;
        ChartOfAccountsSetupAt = DateTime.UtcNow;
        UpdateProgress(true);
    }
    
    public void ConfigureTaxSettings()
    {
        TaxSettingsConfigured = true;
        TaxSettingsConfiguredAt = DateTime.UtcNow;
        UpdateProgress(true);
    }
    
    public void ConfigureCurrency(string primaryCurrency)
    {
        CurrencyConfigured = true;
        PrimaryCurrency = primaryCurrency;
        CurrencyConfiguredAt = DateTime.UtcNow;
        UpdateProgress(true);
    }
    
    public void ConfigureFiscalYear()
    {
        FiscalYearConfigured = true;
        FiscalYearConfiguredAt = DateTime.UtcNow;
        UpdateProgress(false);
    }
    
    public void CreateProductCategories(int count)
    {
        ProductCategoriesCreated = true;
        ProductCategoryCount = count;
        ProductCategoriesCreatedAt = DateTime.UtcNow;
        UpdateProgress(false);
    }
    
    public void ImportProducts(int count)
    {
        ProductsImported = true;
        ProductCount = count;
        ProductsImportedAt = DateTime.UtcNow;
        UpdateProgress(false);
    }
    
    public void ImportCustomers(int count)
    {
        CustomersImported = true;
        CustomerCount = count;
        CustomersImportedAt = DateTime.UtcNow;
        UpdateProgress(false);
    }
    
    public void ImportVendors(int count)
    {
        VendorsImported = true;
        VendorCount = count;
        VendorsImportedAt = DateTime.UtcNow;
        UpdateProgress(false);
    }
    
    public void ConfigureSecuritySettings()
    {
        SecuritySettingsConfigured = true;
        SecuritySettingsConfiguredAt = DateTime.UtcNow;
        UpdateProgress(true);
    }
    
    public void SetPasswordPolicy()
    {
        PasswordPolicySet = true;
        PasswordPolicySetAt = DateTime.UtcNow;
        UpdateProgress(true);
    }
    
    public void EnableTwoFactor()
    {
        TwoFactorEnabled = true;
        TwoFactorEnabledAt = DateTime.UtcNow;
        UpdateProgress(false);
    }
    
    public void ConfigureBackup()
    {
        BackupConfigured = true;
        BackupConfiguredAt = DateTime.UtcNow;
        UpdateProgress(true);
    }
    
    public void ConfigureCompliance()
    {
        ComplianceConfigured = true;
        ComplianceConfiguredAt = DateTime.UtcNow;
        UpdateProgress(true);
    }
    
    public void ConfigureEmailIntegration()
    {
        EmailIntegrationConfigured = true;
        EmailIntegrationConfiguredAt = DateTime.UtcNow;
        UpdateProgress(true);
    }
    
    public void CompleteTraining(int trainedUsers)
    {
        TrainingCompleted = true;
        TrainedUserCount = trainedUsers;
        TrainingCompletedAt = DateTime.UtcNow;
        UpdateProgress(false);
    }
    
    public void CompleteTesting()
    {
        SystemTestingCompleted = true;
        SystemTestingCompletedAt = DateTime.UtcNow;
        UpdateProgress(true);
    }
    
    public void ApproveGoLive(string approvedBy)
    {
        if (!CanGoLive())
            throw new InvalidOperationException("Cannot approve go-live. Required items are not completed.");
            
        GoLiveApproved = true;
        GoLiveApprovedAt = DateTime.UtcNow;
        GoLiveApprovedBy = approvedBy;
        Status = ChecklistStatus.Completed;
        CompletedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }
    
    private void UpdateProgress(bool isRequired)
    {
        CompletedItems++;
        if (isRequired)
            RequiredCompletedItems++;
            
        OverallProgress = (decimal)CompletedItems / TotalItems * 100;
        RequiredProgress = (decimal)RequiredCompletedItems / RequiredItems * 100;
        
        UpdateStatus();
        UpdatedAt = DateTime.UtcNow;
    }
    
    private void UpdateStatus()
    {
        if (CompletedItems == 0)
            Status = ChecklistStatus.NotStarted;
        else if (RequiredCompletedItems == RequiredItems)
            Status = ChecklistStatus.ReadyForGoLive;
        else if (CompletedItems == TotalItems)
            Status = ChecklistStatus.Completed;
        else if (OverallProgress >= 50)
            Status = ChecklistStatus.InProgress;
        else
            Status = ChecklistStatus.Started;
    }
    
    public bool CanGoLive()
    {
        return RequiredCompletedItems >= RequiredItems;
    }
    
    public void AddNote(string note)
    {
        Notes = note;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void AddPendingTask(string task)
    {
        var tasks = GetPendingTasks();
        tasks.Add(task);
        PendingTasks = JsonSerializer.Serialize(tasks);
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void AddBlockingIssue(string issue)
    {
        var issues = GetBlockingIssues();
        issues.Add(issue);
        BlockingIssues = JsonSerializer.Serialize(issues);
        UpdatedAt = DateTime.UtcNow;
    }
    
    public List<string> GetPendingTasks()
    {
        return string.IsNullOrEmpty(PendingTasks) 
            ? new List<string>() 
            : JsonSerializer.Deserialize<List<string>>(PendingTasks) ?? new List<string>();
    }
    
    public List<string> GetBlockingIssues()
    {
        return string.IsNullOrEmpty(BlockingIssues) 
            ? new List<string>() 
            : JsonSerializer.Deserialize<List<string>>(BlockingIssues) ?? new List<string>();
    }
}

public enum ChecklistStatus
{
    NotStarted = 0,
    Started = 1,
    InProgress = 2,
    ReadyForGoLive = 3,
    Completed = 4,
    OnHold = 5
}