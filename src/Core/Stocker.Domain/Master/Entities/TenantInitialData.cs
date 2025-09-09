using Stocker.SharedKernel.Primitives;
using System.Text.Json;

namespace Stocker.Domain.Master.Entities;

public sealed class TenantInitialData : Entity
{
    public Guid TenantId { get; private set; }
    public DataSetType DataSetType { get; private set; }
    public DataSetStatus Status { get; private set; }
    
    // Company Information
    public string CompanyName { get; private set; }
    public string? CompanyCode { get; private set; }
    public string? TaxNumber { get; private set; }
    public string? TaxOffice { get; private set; }
    public string? TradeRegistryNumber { get; private set; }
    public string? MersisNumber { get; private set; }
    
    // Contact Information
    public string ContactEmail { get; private set; }
    public string ContactPhone { get; private set; }
    public string? ContactFax { get; private set; }
    public string? Website { get; private set; }
    
    // Address
    public string? AddressLine1 { get; private set; }
    public string? AddressLine2 { get; private set; }
    public string? City { get; private set; }
    public string? State { get; private set; }
    public string? Country { get; private set; }
    public string? PostalCode { get; private set; }
    
    // Business Information
    public string? IndustryType { get; private set; }
    public string? BusinessType { get; private set; }
    public int? EmployeeCount { get; private set; }
    public decimal? AnnualRevenue { get; private set; }
    public string? Currency { get; private set; }
    public int? FiscalYearStart { get; private set; } // Month (1-12)
    
    // Default Users
    public string AdminUserEmail { get; private set; }
    public string AdminUserName { get; private set; }
    public string? AdminFirstName { get; private set; }
    public string? AdminLastName { get; private set; }
    public string? AdminPhone { get; private set; }
    public bool AdminUserCreated { get; private set; }
    
    // Default Settings
    public string DefaultLanguage { get; private set; }
    public string DefaultTimeZone { get; private set; }
    public string DefaultDateFormat { get; private set; }
    public string DefaultTimeFormat { get; private set; }
    public string DefaultCurrency { get; private set; }
    public string? DefaultTheme { get; private set; }
    
    // Module Selections
    public string SelectedModules { get; private set; } // JSON array
    public string ModuleConfigurations { get; private set; } // JSON object
    
    // Initial Data Sets
    public bool CreateSampleData { get; private set; }
    public bool ImportExistingData { get; private set; }
    public string? ImportedDataSources { get; private set; } // JSON
    public int? ImportedRecordsCount { get; private set; }
    
    // Departments & Branches
    public string? DefaultDepartments { get; private set; } // JSON array
    public string? DefaultBranches { get; private set; } // JSON array
    public bool DepartmentsCreated { get; private set; }
    public bool BranchesCreated { get; private set; }
    
    // Chart of Accounts
    public bool UseDefaultChartOfAccounts { get; private set; }
    public string? ChartOfAccountsTemplate { get; private set; }
    public bool ChartOfAccountsCreated { get; private set; }
    
    // Product Categories
    public string? DefaultProductCategories { get; private set; } // JSON array
    public bool ProductCategoriesCreated { get; private set; }
    
    // Customer/Vendor Templates
    public string? CustomerTemplate { get; private set; } // JSON
    public string? VendorTemplate { get; private set; } // JSON
    public bool TemplatesCreated { get; private set; }
    
    // Workflow Configurations
    public string? ApprovalWorkflows { get; private set; } // JSON
    public string? NotificationRules { get; private set; } // JSON
    public bool WorkflowsConfigured { get; private set; }
    
    // Integration Preferences
    public string? PreferredIntegrations { get; private set; } // JSON array
    public bool IntegrationsConfigured { get; private set; }
    
    // Setup Progress
    public int SetupStepsCompleted { get; private set; }
    public int TotalSetupSteps { get; private set; }
    public decimal SetupProgressPercentage { get; private set; }
    
    // Validation
    public bool IsValidated { get; private set; }
    public DateTime? ValidatedAt { get; private set; }
    public string? ValidationErrors { get; private set; } // JSON
    
    // Processing
    public bool IsProcessed { get; private set; }
    public DateTime? ProcessedAt { get; private set; }
    public string? ProcessingErrors { get; private set; } // JSON
    public int ProcessingAttempts { get; private set; }
    
    // Audit
    public DateTime CreatedAt { get; private set; }
    public string CreatedBy { get; private set; }
    public DateTime? UpdatedAt { get; private set; }
    public string? UpdatedBy { get; private set; }
    
    // Navigation
    public Tenant Tenant { get; private set; }
    
    private TenantInitialData() { } // EF Constructor
    
    private TenantInitialData(
        Guid tenantId,
        string companyName,
        string contactEmail,
        string contactPhone,
        string adminUserEmail,
        string adminUserName,
        string createdBy)
    {
        Id = Guid.NewGuid();
        TenantId = tenantId;
        DataSetType = DataSetType.Manual;
        Status = DataSetStatus.Pending;
        CompanyName = companyName;
        ContactEmail = contactEmail;
        ContactPhone = contactPhone;
        AdminUserEmail = adminUserEmail;
        AdminUserName = adminUserName;
        AdminUserCreated = false;
        
        // Set defaults
        DefaultLanguage = "tr-TR";
        DefaultTimeZone = "Turkey Standard Time";
        DefaultDateFormat = "dd.MM.yyyy";
        DefaultTimeFormat = "HH:mm";
        DefaultCurrency = "TRY";
        DefaultTheme = "light";
        
        SelectedModules = "[]";
        ModuleConfigurations = "{}";
        CreateSampleData = false;
        ImportExistingData = false;
        DepartmentsCreated = false;
        BranchesCreated = false;
        UseDefaultChartOfAccounts = true;
        ChartOfAccountsCreated = false;
        ProductCategoriesCreated = false;
        TemplatesCreated = false;
        WorkflowsConfigured = false;
        IntegrationsConfigured = false;
        
        SetupStepsCompleted = 0;
        TotalSetupSteps = 10;
        SetupProgressPercentage = 0;
        
        IsValidated = false;
        IsProcessed = false;
        ProcessingAttempts = 0;
        
        CreatedAt = DateTime.UtcNow;
        CreatedBy = createdBy;
    }
    
    public static TenantInitialData Create(
        Guid tenantId,
        string companyName,
        string contactEmail,
        string contactPhone,
        string adminUserEmail,
        string adminUserName,
        string createdBy)
    {
        if (tenantId == Guid.Empty)
            throw new ArgumentException("Tenant ID cannot be empty.", nameof(tenantId));
            
        if (string.IsNullOrWhiteSpace(companyName))
            throw new ArgumentException("Company name cannot be empty.", nameof(companyName));
            
        if (string.IsNullOrWhiteSpace(contactEmail))
            throw new ArgumentException("Contact email cannot be empty.", nameof(contactEmail));
            
        if (string.IsNullOrWhiteSpace(adminUserEmail))
            throw new ArgumentException("Admin user email cannot be empty.", nameof(adminUserEmail));
            
        return new TenantInitialData(
            tenantId,
            companyName,
            contactEmail,
            contactPhone,
            adminUserEmail,
            adminUserName,
            createdBy);
    }
    
    public void UpdateCompanyDetails(
        string? taxNumber,
        string? taxOffice,
        string? tradeRegistryNumber,
        string? mersisNumber,
        string? website)
    {
        TaxNumber = taxNumber;
        TaxOffice = taxOffice;
        TradeRegistryNumber = tradeRegistryNumber;
        MersisNumber = mersisNumber;
        Website = website;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void UpdateAddress(
        string? addressLine1,
        string? addressLine2,
        string? city,
        string? state,
        string? country,
        string? postalCode)
    {
        AddressLine1 = addressLine1;
        AddressLine2 = addressLine2;
        City = city;
        State = state;
        Country = country;
        PostalCode = postalCode;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void UpdateBusinessInfo(
        string? industryType,
        string? businessType,
        int? employeeCount,
        decimal? annualRevenue,
        string? currency,
        int? fiscalYearStart)
    {
        IndustryType = industryType;
        BusinessType = businessType;
        EmployeeCount = employeeCount;
        AnnualRevenue = annualRevenue;
        Currency = currency;
        FiscalYearStart = fiscalYearStart;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void UpdateAdminUser(
        string? firstName,
        string? lastName,
        string? phone)
    {
        AdminFirstName = firstName;
        AdminLastName = lastName;
        AdminPhone = phone;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void UpdateDefaultSettings(
        string language,
        string timeZone,
        string dateFormat,
        string timeFormat,
        string currency,
        string? theme)
    {
        DefaultLanguage = language;
        DefaultTimeZone = timeZone;
        DefaultDateFormat = dateFormat;
        DefaultTimeFormat = timeFormat;
        DefaultCurrency = currency;
        DefaultTheme = theme;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void SelectModules(List<string> modules, Dictionary<string, object>? configurations = null)
    {
        SelectedModules = JsonSerializer.Serialize(modules);
        if (configurations != null)
            ModuleConfigurations = JsonSerializer.Serialize(configurations);
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void SetDepartments(List<string> departments)
    {
        DefaultDepartments = JsonSerializer.Serialize(departments);
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void SetBranches(List<string> branches)
    {
        DefaultBranches = JsonSerializer.Serialize(branches);
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void SetProductCategories(List<string> categories)
    {
        DefaultProductCategories = JsonSerializer.Serialize(categories);
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void EnableSampleData()
    {
        CreateSampleData = true;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void EnableDataImport(List<string> dataSources)
    {
        ImportExistingData = true;
        ImportedDataSources = JsonSerializer.Serialize(dataSources);
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void MarkAdminUserCreated()
    {
        AdminUserCreated = true;
        IncrementProgress();
    }
    
    public void MarkDepartmentsCreated()
    {
        DepartmentsCreated = true;
        IncrementProgress();
    }
    
    public void MarkBranchesCreated()
    {
        BranchesCreated = true;
        IncrementProgress();
    }
    
    public void MarkChartOfAccountsCreated()
    {
        ChartOfAccountsCreated = true;
        IncrementProgress();
    }
    
    public void MarkProductCategoriesCreated()
    {
        ProductCategoriesCreated = true;
        IncrementProgress();
    }
    
    public void MarkTemplatesCreated()
    {
        TemplatesCreated = true;
        IncrementProgress();
    }
    
    public void MarkWorkflowsConfigured()
    {
        WorkflowsConfigured = true;
        IncrementProgress();
    }
    
    public void MarkIntegrationsConfigured()
    {
        IntegrationsConfigured = true;
        IncrementProgress();
    }
    
    private void IncrementProgress()
    {
        SetupStepsCompleted++;
        SetupProgressPercentage = (decimal)SetupStepsCompleted / TotalSetupSteps * 100;
        UpdatedAt = DateTime.UtcNow;
        
        if (SetupStepsCompleted >= TotalSetupSteps)
        {
            Status = DataSetStatus.Ready;
        }
    }
    
    public void Validate()
    {
        var errors = new List<string>();
        
        if (string.IsNullOrWhiteSpace(CompanyName))
            errors.Add("Company name is required.");
            
        if (string.IsNullOrWhiteSpace(ContactEmail))
            errors.Add("Contact email is required.");
            
        if (string.IsNullOrWhiteSpace(AdminUserEmail))
            errors.Add("Admin user email is required.");
            
        if (errors.Any())
        {
            ValidationErrors = JsonSerializer.Serialize(errors);
            Status = DataSetStatus.ValidationFailed;
        }
        else
        {
            IsValidated = true;
            ValidatedAt = DateTime.UtcNow;
            Status = DataSetStatus.Validated;
        }
    }
    
    public void StartProcessing()
    {
        if (!IsValidated)
            throw new InvalidOperationException("Data must be validated before processing.");
            
        Status = DataSetStatus.Processing;
        ProcessingAttempts++;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void CompleteProcessing()
    {
        IsProcessed = true;
        ProcessedAt = DateTime.UtcNow;
        Status = DataSetStatus.Completed;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void FailProcessing(List<string> errors)
    {
        ProcessingErrors = JsonSerializer.Serialize(errors);
        Status = DataSetStatus.Failed;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public List<string> GetSelectedModules()
    {
        return string.IsNullOrEmpty(SelectedModules) 
            ? new List<string>() 
            : JsonSerializer.Deserialize<List<string>>(SelectedModules) ?? new List<string>();
    }
    
    public Dictionary<string, object> GetModuleConfigurations()
    {
        return string.IsNullOrEmpty(ModuleConfigurations) 
            ? new Dictionary<string, object>() 
            : JsonSerializer.Deserialize<Dictionary<string, object>>(ModuleConfigurations) ?? new Dictionary<string, object>();
    }
}

public enum DataSetType
{
    Manual = 0,
    Import = 1,
    Template = 2,
    Migration = 3,
    Clone = 4
}

public enum DataSetStatus
{
    Pending = 0,
    Ready = 1,
    Validated = 2,
    ValidationFailed = 3,
    Processing = 4,
    Completed = 5,
    Failed = 6,
    Cancelled = 7
}