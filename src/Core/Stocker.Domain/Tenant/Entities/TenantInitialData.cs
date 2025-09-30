using Stocker.SharedKernel.Primitives;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Stocker.Domain.Tenant.Entities;

/// <summary>
/// Tenant'a özel başlangıç verileri - İlk kurulum sırasında kullanılan veriler
/// </summary>
public sealed class TenantInitialData : AggregateRoot<Guid>
{
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
    public string? DefaultLanguage { get; private set; }
    public string? DefaultTimeZone { get; private set; }
    public string? DefaultDateFormat { get; private set; }
    public string? DefaultNumberFormat { get; private set; }
    public bool Use24HourTime { get; private set; }
    
    // Initial Modules
    public List<string> EnabledModules { get; private set; }
    public List<string> RequestedFeatures { get; private set; }
    
    // Initial Data Sets
    public bool CreateSampleData { get; private set; }
    public bool ImportExistingData { get; private set; }
    public string? DataImportSource { get; private set; }
    public string? DataImportFormat { get; private set; }
    
    // Initial Departments (JSON)
    public List<InitialDepartment> InitialDepartments { get; private set; }
    
    // Initial Branches (JSON)
    public List<InitialBranch> InitialBranches { get; private set; }
    
    // Initial Roles (JSON)
    public List<InitialRole> InitialRoles { get; private set; }
    
    // Initial Chart of Accounts (JSON)
    public List<InitialAccount> InitialAccounts { get; private set; }
    
    // Initial Tax Settings (JSON)
    public List<InitialTaxRate> InitialTaxRates { get; private set; }
    
    // Initial Product Categories (JSON)
    public List<InitialProductCategory> InitialProductCategories { get; private set; }
    
    // Initial Warehouses (JSON)
    public List<InitialWarehouse> InitialWarehouses { get; private set; }
    
    // Processing Information
    public DateTime CreatedAt { get; private set; }
    public string CreatedBy { get; private set; }
    public DateTime? ProcessedAt { get; private set; }
    public string? ProcessedBy { get; private set; }
    public int ProcessAttempts { get; private set; }
    public string? ProcessingError { get; private set; }
    public string? ProcessingLog { get; private set; } // JSON array of processing steps
    
    // Validation
    public bool IsValidated { get; private set; }
    public DateTime? ValidatedAt { get; private set; }
    public List<string> ValidationErrors { get; private set; }
    public List<string> ValidationWarnings { get; private set; }
    
    private TenantInitialData()
    {
        EnabledModules = new List<string>();
        RequestedFeatures = new List<string>();
        InitialDepartments = new List<InitialDepartment>();
        InitialBranches = new List<InitialBranch>();
        InitialRoles = new List<InitialRole>();
        InitialAccounts = new List<InitialAccount>();
        InitialTaxRates = new List<InitialTaxRate>();
        InitialProductCategories = new List<InitialProductCategory>();
        InitialWarehouses = new List<InitialWarehouse>();
        ValidationErrors = new List<string>();
        ValidationWarnings = new List<string>();
    }
    
    private TenantInitialData(
        string companyName,
        string contactEmail,
        string contactPhone,
        string adminUserEmail,
        string adminUserName,
        string createdBy) : this()
    {
        Id = Guid.NewGuid();
        CompanyName = companyName;
        ContactEmail = contactEmail;
        ContactPhone = contactPhone;
        AdminUserEmail = adminUserEmail;
        AdminUserName = adminUserName;
        CreatedBy = createdBy;
        CreatedAt = DateTime.UtcNow;
        Status = DataSetStatus.Pending;
        DataSetType = DataSetType.InitialSetup;
        ProcessAttempts = 0;
        AdminUserCreated = false;
        IsValidated = false;
        Use24HourTime = false;
        CreateSampleData = false;
        ImportExistingData = false;
    }
    
    public static TenantInitialData Create(
        string companyName,
        string contactEmail,
        string contactPhone,
        string adminUserEmail,
        string adminUserName,
        string createdBy)
    {
        if (string.IsNullOrWhiteSpace(companyName))
            throw new ArgumentException("Company name cannot be empty.", nameof(companyName));
        if (string.IsNullOrWhiteSpace(contactEmail))
            throw new ArgumentException("Contact email cannot be empty.", nameof(contactEmail));
        if (string.IsNullOrWhiteSpace(contactPhone))
            throw new ArgumentException("Contact phone cannot be empty.", nameof(contactPhone));
        if (string.IsNullOrWhiteSpace(adminUserEmail))
            throw new ArgumentException("Admin user email cannot be empty.", nameof(adminUserEmail));
        if (string.IsNullOrWhiteSpace(adminUserName))
            throw new ArgumentException("Admin user name cannot be empty.", nameof(adminUserName));
        if (string.IsNullOrWhiteSpace(createdBy))
            throw new ArgumentException("Created by cannot be empty.", nameof(createdBy));
            
        return new TenantInitialData(
            companyName,
            contactEmail,
            contactPhone,
            adminUserEmail,
            adminUserName,
            createdBy);
    }
    
    // Company Information
    public void SetCompanyDetails(
        string? companyCode,
        string? taxNumber,
        string? taxOffice,
        string? tradeRegistryNumber,
        string? mersisNumber)
    {
        CompanyCode = companyCode;
        TaxNumber = taxNumber;
        TaxOffice = taxOffice;
        TradeRegistryNumber = tradeRegistryNumber;
        MersisNumber = mersisNumber;
    }
    
    public void SetContactDetails(string? fax, string? website)
    {
        ContactFax = fax;
        Website = website;
    }
    
    public void SetAddress(
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
    }
    
    // Business Information
    public void SetBusinessInfo(
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
        
        if (fiscalYearStart.HasValue && (fiscalYearStart < 1 || fiscalYearStart > 12))
            throw new ArgumentException("Fiscal year start must be between 1 and 12.", nameof(fiscalYearStart));
            
        FiscalYearStart = fiscalYearStart;
    }
    
    // Admin User
    public void SetAdminUserDetails(string? firstName, string? lastName, string? phone)
    {
        AdminFirstName = firstName;
        AdminLastName = lastName;
        AdminPhone = phone;
    }
    
    public void MarkAdminUserCreated()
    {
        AdminUserCreated = true;
    }
    
    // Default Settings
    public void SetDefaultSettings(
        string? language,
        string? timeZone,
        string? dateFormat,
        string? numberFormat,
        bool use24HourTime)
    {
        DefaultLanguage = language;
        DefaultTimeZone = timeZone;
        DefaultDateFormat = dateFormat;
        DefaultNumberFormat = numberFormat;
        Use24HourTime = use24HourTime;
    }
    
    // Modules and Features
    public void SetEnabledModules(List<string> modules)
    {
        EnabledModules = modules ?? new List<string>();
    }
    
    public void SetRequestedFeatures(List<string> features)
    {
        RequestedFeatures = features ?? new List<string>();
    }
    
    // Data Import
    public void EnableSampleData()
    {
        CreateSampleData = true;
    }
    
    public void SetupDataImport(string source, string format)
    {
        ImportExistingData = true;
        DataImportSource = source;
        DataImportFormat = format;
    }
    
    // Initial Data
    public void AddInitialDepartment(string code, string name, string? description = null)
    {
        InitialDepartments.Add(new InitialDepartment
        {
            Code = code,
            Name = name,
            Description = description
        });
    }
    
    public void AddInitialBranch(string code, string name, string? address = null)
    {
        InitialBranches.Add(new InitialBranch
        {
            Code = code,
            Name = name,
            Address = address
        });
    }
    
    public void AddInitialRole(string code, string name, List<string> permissions)
    {
        InitialRoles.Add(new InitialRole
        {
            Code = code,
            Name = name,
            Permissions = permissions
        });
    }
    
    public void AddInitialAccount(string code, string name, string type, string? parentCode = null)
    {
        InitialAccounts.Add(new InitialAccount
        {
            Code = code,
            Name = name,
            AccountType = type,
            ParentCode = parentCode
        });
    }
    
    public void AddInitialTaxRate(string code, string name, decimal rate, string? type = null)
    {
        InitialTaxRates.Add(new InitialTaxRate
        {
            Code = code,
            Name = name,
            Rate = rate,
            TaxType = type
        });
    }
    
    public void AddInitialProductCategory(string code, string name, string? parentCode = null)
    {
        InitialProductCategories.Add(new InitialProductCategory
        {
            Code = code,
            Name = name,
            ParentCode = parentCode
        });
    }
    
    public void AddInitialWarehouse(string code, string name, string? address = null)
    {
        InitialWarehouses.Add(new InitialWarehouse
        {
            Code = code,
            Name = name,
            Address = address
        });
    }
    
    // Validation
    public void Validate()
    {
        ValidationErrors.Clear();
        ValidationWarnings.Clear();
        
        // Required field validations
        if (string.IsNullOrWhiteSpace(CompanyName))
            ValidationErrors.Add("Company name is required.");
            
        if (string.IsNullOrWhiteSpace(ContactEmail))
            ValidationErrors.Add("Contact email is required.");
        else if (!IsValidEmail(ContactEmail))
            ValidationErrors.Add("Contact email is not valid.");
            
        if (string.IsNullOrWhiteSpace(ContactPhone))
            ValidationErrors.Add("Contact phone is required.");
            
        if (string.IsNullOrWhiteSpace(AdminUserEmail))
            ValidationErrors.Add("Admin user email is required.");
        else if (!IsValidEmail(AdminUserEmail))
            ValidationErrors.Add("Admin user email is not valid.");
            
        if (string.IsNullOrWhiteSpace(AdminUserName))
            ValidationErrors.Add("Admin user name is required.");
            
        // Optional field warnings
        if (string.IsNullOrWhiteSpace(TaxNumber))
            ValidationWarnings.Add("Tax number is not provided.");
            
        if (!EnabledModules.Any())
            ValidationWarnings.Add("No modules are enabled.");
            
        if (!InitialDepartments.Any())
            ValidationWarnings.Add("No initial departments defined.");
            
        if (!InitialRoles.Any())
            ValidationWarnings.Add("No initial roles defined.");
            
        IsValidated = true;
        ValidatedAt = DateTime.UtcNow;
    }
    
    // Processing
    public void MarkAsProcessing()
    {
        Status = DataSetStatus.Processing;
        ProcessAttempts++;
    }
    
    public void MarkAsProcessed(string processedBy)
    {
        Status = DataSetStatus.Processed;
        ProcessedAt = DateTime.UtcNow;
        ProcessedBy = processedBy;
        ProcessingError = null;
    }
    
    public void MarkAsFailed(string error)
    {
        Status = DataSetStatus.Failed;
        ProcessingError = error;
    }
    
    public void MarkAsPartiallyProcessed(string processedBy, string? warning = null)
    {
        Status = DataSetStatus.PartiallyProcessed;
        ProcessedAt = DateTime.UtcNow;
        ProcessedBy = processedBy;
        
        if (!string.IsNullOrWhiteSpace(warning))
        {
            ValidationWarnings.Add(warning);
        }
    }
    
    public void AddProcessingLog(string message)
    {
        ProcessingLog = ProcessingLog ?? "";
        var timestamp = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss");
        ProcessingLog += $"[{timestamp}] {message}\n";
    }
    
    private bool IsValidEmail(string email)
    {
        try
        {
            var addr = new System.Net.Mail.MailAddress(email);
            return addr.Address == email;
        }
        catch
        {
            return false;
        }
    }
}

// Value Objects for Initial Data
public class InitialDepartment
{
    public string Code { get; set; }
    public string Name { get; set; }
    public string? Description { get; set; }
}

public class InitialBranch
{
    public string Code { get; set; }
    public string Name { get; set; }
    public string? Address { get; set; }
}

public class InitialRole
{
    public string Code { get; set; }
    public string Name { get; set; }
    public List<string> Permissions { get; set; } = new List<string>();
}

public class InitialAccount
{
    public string Code { get; set; }
    public string Name { get; set; }
    public string AccountType { get; set; }
    public string? ParentCode { get; set; }
}

public class InitialTaxRate
{
    public string Code { get; set; }
    public string Name { get; set; }
    public decimal Rate { get; set; }
    public string? TaxType { get; set; }
}

public class InitialProductCategory
{
    public string Code { get; set; }
    public string Name { get; set; }
    public string? ParentCode { get; set; }
}

public class InitialWarehouse
{
    public string Code { get; set; }
    public string Name { get; set; }
    public string? Address { get; set; }
}

public enum DataSetType
{
    InitialSetup = 0,
    Import = 1,
    Migration = 2,
    SampleData = 3,
    Template = 4
}

public enum DataSetStatus
{
    Pending = 0,
    Validated = 1,
    Processing = 2,
    Processed = 3,
    PartiallyProcessed = 4,
    Failed = 5,
    Cancelled = 6
}