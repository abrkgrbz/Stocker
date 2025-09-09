using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Master.Entities;

public sealed class TenantLimits : Entity
{
    public Guid TenantId { get; private set; }
    
    // User Limits
    public int MaxUsers { get; private set; }
    public int CurrentUsers { get; private set; }
    public int MaxAdminUsers { get; private set; }
    public int CurrentAdminUsers { get; private set; }
    public int MaxConcurrentUsers { get; private set; }
    public int CurrentConcurrentUsers { get; private set; }
    
    // Storage Limits (in GB)
    public decimal MaxStorageGB { get; private set; }
    public decimal CurrentStorageGB { get; private set; }
    public decimal MaxDatabaseSizeGB { get; private set; }
    public decimal CurrentDatabaseSizeGB { get; private set; }
    public decimal MaxFileUploadSizeMB { get; private set; }
    
    // Transaction Limits
    public long MaxMonthlyTransactions { get; private set; }
    public long CurrentMonthlyTransactions { get; private set; }
    public long MaxDailyTransactions { get; private set; }
    public long CurrentDailyTransactions { get; private set; }
    public int MaxTransactionsPerMinute { get; private set; }
    
    // API Limits
    public long MaxMonthlyApiCalls { get; private set; }
    public long CurrentMonthlyApiCalls { get; private set; }
    public long MaxDailyApiCalls { get; private set; }
    public long CurrentDailyApiCalls { get; private set; }
    public int MaxApiCallsPerMinute { get; private set; }
    public int MaxApiKeys { get; private set; }
    public int CurrentApiKeys { get; private set; }
    
    // Module & Feature Limits
    public int MaxCustomModules { get; private set; }
    public int CurrentCustomModules { get; private set; }
    public int MaxCustomReports { get; private set; }
    public int CurrentCustomReports { get; private set; }
    public int MaxCustomFields { get; private set; }
    public int CurrentCustomFields { get; private set; }
    public int MaxWorkflows { get; private set; }
    public int CurrentWorkflows { get; private set; }
    
    // Communication Limits
    public long MaxMonthlyEmails { get; private set; }
    public long CurrentMonthlyEmails { get; private set; }
    public long MaxMonthlySMS { get; private set; }
    public long CurrentMonthlySMS { get; private set; }
    public int MaxEmailTemplates { get; private set; }
    public int CurrentEmailTemplates { get; private set; }
    
    // Integration Limits
    public int MaxIntegrations { get; private set; }
    public int CurrentIntegrations { get; private set; }
    public int MaxWebhooks { get; private set; }
    public int CurrentWebhooks { get; private set; }
    public int MaxCustomDomains { get; private set; }
    public int CurrentCustomDomains { get; private set; }
    
    // Backup & Export Limits
    public int MaxBackupsPerMonth { get; private set; }
    public int CurrentBackupsThisMonth { get; private set; }
    public int MaxExportsPerDay { get; private set; }
    public int CurrentExportsToday { get; private set; }
    public decimal MaxExportSizeGB { get; private set; }
    
    // Performance Limits
    public int MaxDatabaseConnections { get; private set; }
    public int CurrentDatabaseConnections { get; private set; }
    public int MaxCPUCores { get; private set; }
    public int MaxMemoryGB { get; private set; }
    
    // Audit & Retention
    public int DataRetentionDays { get; private set; }
    public int AuditLogRetentionDays { get; private set; }
    public int BackupRetentionDays { get; private set; }
    
    // Limit Actions
    public LimitAction UserLimitAction { get; private set; }
    public LimitAction StorageLimitAction { get; private set; }
    public LimitAction TransactionLimitAction { get; private set; }
    public LimitAction ApiLimitAction { get; private set; }
    
    // Notifications
    public decimal WarningThresholdPercentage { get; private set; }
    public bool SendWarningNotifications { get; private set; }
    public DateTime? LastWarningNotificationSent { get; private set; }
    public bool SendLimitExceededNotifications { get; private set; }
    public DateTime? LastLimitExceededNotificationSent { get; private set; }
    
    // Status
    public bool IsActive { get; private set; }
    public DateTime? LastResetDate { get; private set; }
    public DateTime? NextResetDate { get; private set; }
    
    // Audit
    public DateTime CreatedAt { get; private set; }
    public string CreatedBy { get; private set; }
    public DateTime? UpdatedAt { get; private set; }
    public string? UpdatedBy { get; private set; }
    
    // Navigation
    public Tenant Tenant { get; private set; }
    
    private TenantLimits() { } // EF Constructor
    
    private TenantLimits(Guid tenantId, string createdBy)
    {
        Id = Guid.NewGuid();
        TenantId = tenantId;
        
        // Set default limits (starter package)
        MaxUsers = 10;
        MaxStorageGB = 10;
        MaxDatabaseSizeGB = 5;
        MaxFileUploadSizeMB = 100;
        MaxMonthlyTransactions = 10000;
        MaxDailyTransactions = 1000;
        MaxTransactionsPerMinute = 10;
        MaxMonthlyApiCalls = 100000;
        MaxDailyApiCalls = 10000;
        MaxApiCallsPerMinute = 100;
        MaxApiKeys = 5;
        MaxCustomModules = 2;
        MaxCustomReports = 10;
        MaxCustomFields = 50;
        MaxWorkflows = 5;
        MaxMonthlyEmails = 5000;
        MaxMonthlySMS = 1000;
        MaxEmailTemplates = 20;
        MaxIntegrations = 3;
        MaxWebhooks = 10;
        MaxCustomDomains = 1;
        MaxBackupsPerMonth = 30;
        MaxExportsPerDay = 10;
        MaxExportSizeGB = 1;
        MaxDatabaseConnections = 10;
        MaxCPUCores = 2;
        MaxMemoryGB = 4;
        DataRetentionDays = 365;
        AuditLogRetentionDays = 90;
        BackupRetentionDays = 30;
        
        // Set default actions
        UserLimitAction = LimitAction.BlockNewUsers;
        StorageLimitAction = LimitAction.BlockUploads;
        TransactionLimitAction = LimitAction.ThrottleRequests;
        ApiLimitAction = LimitAction.ThrottleRequests;
        
        // Set default notification settings
        WarningThresholdPercentage = 80;
        SendWarningNotifications = true;
        SendLimitExceededNotifications = true;
        
        IsActive = true;
        CreatedAt = DateTime.UtcNow;
        CreatedBy = createdBy;
        
        ResetMonthlyCounters();
    }
    
    public static TenantLimits Create(Guid tenantId, string createdBy)
    {
        if (tenantId == Guid.Empty)
            throw new ArgumentException("Tenant ID cannot be empty.", nameof(tenantId));
            
        return new TenantLimits(tenantId, createdBy);
    }
    
    public void UpdateUserLimits(int maxUsers, int maxAdminUsers, int maxConcurrentUsers)
    {
        MaxUsers = maxUsers;
        MaxAdminUsers = maxAdminUsers;
        MaxConcurrentUsers = maxConcurrentUsers;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void UpdateStorageLimits(decimal maxStorageGB, decimal maxDatabaseSizeGB, decimal maxFileUploadSizeMB)
    {
        MaxStorageGB = maxStorageGB;
        MaxDatabaseSizeGB = maxDatabaseSizeGB;
        MaxFileUploadSizeMB = maxFileUploadSizeMB;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void UpdateTransactionLimits(long maxMonthly, long maxDaily, int maxPerMinute)
    {
        MaxMonthlyTransactions = maxMonthly;
        MaxDailyTransactions = maxDaily;
        MaxTransactionsPerMinute = maxPerMinute;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void UpdateApiLimits(long maxMonthly, long maxDaily, int maxPerMinute, int maxApiKeys)
    {
        MaxMonthlyApiCalls = maxMonthly;
        MaxDailyApiCalls = maxDaily;
        MaxApiCallsPerMinute = maxPerMinute;
        MaxApiKeys = maxApiKeys;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void UpdateCurrentUsage(
        int? users = null,
        decimal? storageGB = null,
        long? transactions = null,
        long? apiCalls = null)
    {
        if (users.HasValue)
            CurrentUsers = users.Value;
            
        if (storageGB.HasValue)
            CurrentStorageGB = storageGB.Value;
            
        if (transactions.HasValue)
            CurrentMonthlyTransactions = transactions.Value;
            
        if (apiCalls.HasValue)
            CurrentMonthlyApiCalls = apiCalls.Value;
            
        CheckLimitsAndNotify();
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void IncrementUsage(UsageType usageType, int amount = 1)
    {
        switch (usageType)
        {
            case UsageType.Users:
                CurrentUsers += amount;
                break;
            case UsageType.ApiCalls:
                CurrentMonthlyApiCalls += amount;
                CurrentDailyApiCalls += amount;
                break;
            case UsageType.Transactions:
                CurrentMonthlyTransactions += amount;
                CurrentDailyTransactions += amount;
                break;
            case UsageType.Emails:
                CurrentMonthlyEmails += amount;
                break;
            case UsageType.SMS:
                CurrentMonthlySMS += amount;
                break;
            case UsageType.Backups:
                CurrentBackupsThisMonth += amount;
                break;
            case UsageType.Exports:
                CurrentExportsToday += amount;
                break;
        }
        
        CheckLimitsAndNotify();
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void SetLimitActions(
        LimitAction userAction,
        LimitAction storageAction,
        LimitAction transactionAction,
        LimitAction apiAction)
    {
        UserLimitAction = userAction;
        StorageLimitAction = storageAction;
        TransactionLimitAction = transactionAction;
        ApiLimitAction = apiAction;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void SetNotificationSettings(decimal warningThreshold, bool sendWarnings, bool sendExceeded)
    {
        WarningThresholdPercentage = warningThreshold;
        SendWarningNotifications = sendWarnings;
        SendLimitExceededNotifications = sendExceeded;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void ResetMonthlyCounters()
    {
        CurrentMonthlyTransactions = 0;
        CurrentMonthlyApiCalls = 0;
        CurrentMonthlyEmails = 0;
        CurrentMonthlySMS = 0;
        CurrentBackupsThisMonth = 0;
        LastResetDate = DateTime.UtcNow;
        NextResetDate = DateTime.UtcNow.AddMonths(1);
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void ResetDailyCounters()
    {
        CurrentDailyTransactions = 0;
        CurrentDailyApiCalls = 0;
        CurrentExportsToday = 0;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public bool IsLimitExceeded(UsageType usageType)
    {
        return usageType switch
        {
            UsageType.Users => CurrentUsers >= MaxUsers,
            UsageType.Storage => CurrentStorageGB >= MaxStorageGB,
            UsageType.ApiCalls => CurrentMonthlyApiCalls >= MaxMonthlyApiCalls,
            UsageType.Transactions => CurrentMonthlyTransactions >= MaxMonthlyTransactions,
            UsageType.Emails => CurrentMonthlyEmails >= MaxMonthlyEmails,
            UsageType.SMS => CurrentMonthlySMS >= MaxMonthlySMS,
            _ => false
        };
    }
    
    public decimal GetUsagePercentage(UsageType usageType)
    {
        return usageType switch
        {
            UsageType.Users => MaxUsers > 0 ? (decimal)CurrentUsers / MaxUsers * 100 : 0,
            UsageType.Storage => MaxStorageGB > 0 ? CurrentStorageGB / MaxStorageGB * 100 : 0,
            UsageType.ApiCalls => MaxMonthlyApiCalls > 0 ? (decimal)CurrentMonthlyApiCalls / MaxMonthlyApiCalls * 100 : 0,
            UsageType.Transactions => MaxMonthlyTransactions > 0 ? (decimal)CurrentMonthlyTransactions / MaxMonthlyTransactions * 100 : 0,
            _ => 0
        };
    }
    
    private void CheckLimitsAndNotify()
    {
        foreach (UsageType usageType in Enum.GetValues(typeof(UsageType)))
        {
            var percentage = GetUsagePercentage(usageType);
            
            if (percentage >= 100 && SendLimitExceededNotifications)
            {
                // Trigger limit exceeded notification
                LastLimitExceededNotificationSent = DateTime.UtcNow;
            }
            else if (percentage >= WarningThresholdPercentage && SendWarningNotifications)
            {
                // Trigger warning notification
                LastWarningNotificationSent = DateTime.UtcNow;
            }
        }
    }
    
    public void Activate()
    {
        IsActive = true;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void Deactivate()
    {
        IsActive = false;
        UpdatedAt = DateTime.UtcNow;
    }
}

public enum UsageType
{
    Users = 0,
    Storage = 1,
    Transactions = 2,
    ApiCalls = 3,
    Emails = 4,
    SMS = 5,
    Backups = 6,
    Exports = 7
}

public enum LimitAction
{
    None = 0,
    SendNotification = 1,
    ThrottleRequests = 2,
    BlockNewUsers = 3,
    BlockUploads = 4,
    BlockAllRequests = 5,
    SuspendTenant = 6
}