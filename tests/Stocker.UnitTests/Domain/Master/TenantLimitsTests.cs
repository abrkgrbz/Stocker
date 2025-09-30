using FluentAssertions;
using Stocker.Domain.Master.Entities;
using Xunit;

namespace Stocker.UnitTests.Domain.Master;

public class TenantLimitsTests
{
    private readonly Guid _tenantId = Guid.NewGuid();
    private readonly string _createdBy = "admin@test.com";

    [Fact]
    public void Create_WithValidData_ShouldCreateLimitsWithDefaults()
    {
        // Act
        var limits = TenantLimits.Create(_tenantId, _createdBy);

        // Assert
        limits.Should().NotBeNull();
        limits.Id.Should().NotBeEmpty();
        limits.TenantId.Should().Be(_tenantId);
        
        // Check default limits
        limits.MaxUsers.Should().Be(10);
        limits.MaxStorageGB.Should().Be(10);
        limits.MaxDatabaseSizeGB.Should().Be(5);
        limits.MaxFileUploadSizeMB.Should().Be(100);
        limits.MaxMonthlyTransactions.Should().Be(10000);
        limits.MaxDailyTransactions.Should().Be(1000);
        limits.MaxTransactionsPerMinute.Should().Be(10);
        limits.MaxMonthlyApiCalls.Should().Be(100000);
        limits.MaxDailyApiCalls.Should().Be(10000);
        limits.MaxApiCallsPerMinute.Should().Be(100);
        limits.MaxApiKeys.Should().Be(5);
        limits.MaxCustomModules.Should().Be(2);
        limits.MaxCustomReports.Should().Be(10);
        limits.MaxCustomFields.Should().Be(50);
        limits.MaxWorkflows.Should().Be(5);
        limits.MaxMonthlyEmails.Should().Be(5000);
        limits.MaxMonthlySMS.Should().Be(1000);
        limits.MaxEmailTemplates.Should().Be(20);
        limits.MaxIntegrations.Should().Be(3);
        limits.MaxWebhooks.Should().Be(10);
        limits.MaxCustomDomains.Should().Be(1);
        limits.MaxBackupsPerMonth.Should().Be(30);
        limits.MaxExportsPerDay.Should().Be(10);
        limits.MaxExportSizeGB.Should().Be(1);
        limits.MaxDatabaseConnections.Should().Be(10);
        limits.MaxCPUCores.Should().Be(2);
        limits.MaxMemoryGB.Should().Be(4);
        limits.DataRetentionDays.Should().Be(365);
        limits.AuditLogRetentionDays.Should().Be(90);
        limits.BackupRetentionDays.Should().Be(30);
        
        // Check default actions
        limits.UserLimitAction.Should().Be(LimitAction.BlockNewUsers);
        limits.StorageLimitAction.Should().Be(LimitAction.BlockUploads);
        limits.TransactionLimitAction.Should().Be(LimitAction.ThrottleRequests);
        limits.ApiLimitAction.Should().Be(LimitAction.ThrottleRequests);
        
        // Check default notification settings
        limits.WarningThresholdPercentage.Should().Be(80);
        limits.SendWarningNotifications.Should().BeTrue();
        limits.SendLimitExceededNotifications.Should().BeTrue();
        
        // Check status
        limits.IsActive.Should().BeTrue();
        limits.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        limits.CreatedBy.Should().Be(_createdBy);
        limits.LastResetDate.Should().NotBeNull();
        limits.NextResetDate.Should().NotBeNull();
        limits.NextResetDate.Should().BeCloseTo(DateTime.UtcNow.AddMonths(1), TimeSpan.FromSeconds(1));
        
        // Check counters are reset
        limits.CurrentMonthlyTransactions.Should().Be(0);
        limits.CurrentMonthlyApiCalls.Should().Be(0);
        limits.CurrentMonthlyEmails.Should().Be(0);
        limits.CurrentMonthlySMS.Should().Be(0);
        limits.CurrentBackupsThisMonth.Should().Be(0);
    }

    [Fact]
    public void Create_WithEmptyTenantId_ShouldThrowArgumentException()
    {
        // Act
        var action = () => TenantLimits.Create(Guid.Empty, _createdBy);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Tenant ID cannot be empty.*")
            .WithParameterName("tenantId");
    }

    [Fact]
    public void UpdateUserLimits_ShouldUpdateAllUserLimits()
    {
        // Arrange
        var limits = CreateLimits();
        var maxUsers = 100;
        var maxAdminUsers = 10;
        var maxConcurrentUsers = 50;

        // Act
        limits.UpdateUserLimits(maxUsers, maxAdminUsers, maxConcurrentUsers);

        // Assert
        limits.MaxUsers.Should().Be(maxUsers);
        limits.MaxAdminUsers.Should().Be(maxAdminUsers);
        limits.MaxConcurrentUsers.Should().Be(maxConcurrentUsers);
        limits.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public void UpdateStorageLimits_ShouldUpdateAllStorageLimits()
    {
        // Arrange
        var limits = CreateLimits();
        var maxStorageGB = 100m;
        var maxDatabaseSizeGB = 50m;
        var maxFileUploadSizeMB = 500m;

        // Act
        limits.UpdateStorageLimits(maxStorageGB, maxDatabaseSizeGB, maxFileUploadSizeMB);

        // Assert
        limits.MaxStorageGB.Should().Be(maxStorageGB);
        limits.MaxDatabaseSizeGB.Should().Be(maxDatabaseSizeGB);
        limits.MaxFileUploadSizeMB.Should().Be(maxFileUploadSizeMB);
        limits.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public void UpdateTransactionLimits_ShouldUpdateAllTransactionLimits()
    {
        // Arrange
        var limits = CreateLimits();
        var maxMonthly = 100000L;
        var maxDaily = 10000L;
        var maxPerMinute = 100;

        // Act
        limits.UpdateTransactionLimits(maxMonthly, maxDaily, maxPerMinute);

        // Assert
        limits.MaxMonthlyTransactions.Should().Be(maxMonthly);
        limits.MaxDailyTransactions.Should().Be(maxDaily);
        limits.MaxTransactionsPerMinute.Should().Be(maxPerMinute);
        limits.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public void UpdateApiLimits_ShouldUpdateAllApiLimits()
    {
        // Arrange
        var limits = CreateLimits();
        var maxMonthly = 1000000L;
        var maxDaily = 100000L;
        var maxPerMinute = 1000;
        var maxApiKeys = 20;

        // Act
        limits.UpdateApiLimits(maxMonthly, maxDaily, maxPerMinute, maxApiKeys);

        // Assert
        limits.MaxMonthlyApiCalls.Should().Be(maxMonthly);
        limits.MaxDailyApiCalls.Should().Be(maxDaily);
        limits.MaxApiCallsPerMinute.Should().Be(maxPerMinute);
        limits.MaxApiKeys.Should().Be(maxApiKeys);
        limits.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public void UpdateCurrentUsage_ShouldUpdateProvidedValues()
    {
        // Arrange
        var limits = CreateLimits();

        // Act
        limits.UpdateCurrentUsage(users: 5, storageGB: 3.5m, transactions: 500, apiCalls: 1000);

        // Assert
        limits.CurrentUsers.Should().Be(5);
        limits.CurrentStorageGB.Should().Be(3.5m);
        limits.CurrentMonthlyTransactions.Should().Be(500);
        limits.CurrentMonthlyApiCalls.Should().Be(1000);
        limits.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public void UpdateCurrentUsage_WithNullValues_ShouldNotUpdateThoseFields()
    {
        // Arrange
        var limits = CreateLimits();
        limits.UpdateCurrentUsage(users: 3, storageGB: 2m);

        // Act
        limits.UpdateCurrentUsage(users: null, storageGB: 4m);

        // Assert
        limits.CurrentUsers.Should().Be(3); // Not updated
        limits.CurrentStorageGB.Should().Be(4m); // Updated
    }

    [Theory]
    [InlineData(UsageType.Users, 5, 5)]
    [InlineData(UsageType.ApiCalls, 100, 100)]
    [InlineData(UsageType.Transactions, 50, 50)]
    [InlineData(UsageType.Emails, 10, 10)]
    [InlineData(UsageType.SMS, 5, 5)]
    [InlineData(UsageType.Backups, 2, 2)]
    [InlineData(UsageType.Exports, 3, 3)]
    public void IncrementUsage_ShouldIncrementCorrectCounter(UsageType usageType, int amount, int expected)
    {
        // Arrange
        var limits = CreateLimits();

        // Act
        limits.IncrementUsage(usageType, amount);

        // Assert
        switch (usageType)
        {
            case UsageType.Users:
                limits.CurrentUsers.Should().Be(expected);
                break;
            case UsageType.ApiCalls:
                limits.CurrentMonthlyApiCalls.Should().Be(expected);
                limits.CurrentDailyApiCalls.Should().Be(expected);
                break;
            case UsageType.Transactions:
                limits.CurrentMonthlyTransactions.Should().Be(expected);
                limits.CurrentDailyTransactions.Should().Be(expected);
                break;
            case UsageType.Emails:
                limits.CurrentMonthlyEmails.Should().Be(expected);
                break;
            case UsageType.SMS:
                limits.CurrentMonthlySMS.Should().Be(expected);
                break;
            case UsageType.Backups:
                limits.CurrentBackupsThisMonth.Should().Be(expected);
                break;
            case UsageType.Exports:
                limits.CurrentExportsToday.Should().Be(expected);
                break;
        }
        
        limits.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public void IncrementUsage_WithDefaultAmount_ShouldIncrementByOne()
    {
        // Arrange
        var limits = CreateLimits();

        // Act
        limits.IncrementUsage(UsageType.Users);

        // Assert
        limits.CurrentUsers.Should().Be(1);
    }

    [Theory]
    [InlineData(LimitAction.None, LimitAction.SendNotification, LimitAction.ThrottleRequests, LimitAction.BlockNewUsers)]
    [InlineData(LimitAction.BlockNewUsers, LimitAction.BlockUploads, LimitAction.BlockAllRequests, LimitAction.SuspendTenant)]
    public void SetLimitActions_ShouldUpdateAllActions(
        LimitAction userAction,
        LimitAction storageAction,
        LimitAction transactionAction,
        LimitAction apiAction)
    {
        // Arrange
        var limits = CreateLimits();

        // Act
        limits.SetLimitActions(userAction, storageAction, transactionAction, apiAction);

        // Assert
        limits.UserLimitAction.Should().Be(userAction);
        limits.StorageLimitAction.Should().Be(storageAction);
        limits.TransactionLimitAction.Should().Be(transactionAction);
        limits.ApiLimitAction.Should().Be(apiAction);
        limits.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public void SetNotificationSettings_ShouldUpdateNotificationSettings()
    {
        // Arrange
        var limits = CreateLimits();
        var warningThreshold = 90m;
        var sendWarnings = false;
        var sendExceeded = true;

        // Act
        limits.SetNotificationSettings(warningThreshold, sendWarnings, sendExceeded);

        // Assert
        limits.WarningThresholdPercentage.Should().Be(warningThreshold);
        limits.SendWarningNotifications.Should().Be(sendWarnings);
        limits.SendLimitExceededNotifications.Should().Be(sendExceeded);
        limits.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public void ResetMonthlyCounters_ShouldResetAllMonthlyCounters()
    {
        // Arrange
        var limits = CreateLimits();
        limits.IncrementUsage(UsageType.Transactions, 100);
        limits.IncrementUsage(UsageType.ApiCalls, 200);
        limits.IncrementUsage(UsageType.Emails, 50);
        limits.IncrementUsage(UsageType.SMS, 25);
        limits.IncrementUsage(UsageType.Backups, 5);

        // Act
        limits.ResetMonthlyCounters();

        // Assert
        limits.CurrentMonthlyTransactions.Should().Be(0);
        limits.CurrentMonthlyApiCalls.Should().Be(0);
        limits.CurrentMonthlyEmails.Should().Be(0);
        limits.CurrentMonthlySMS.Should().Be(0);
        limits.CurrentBackupsThisMonth.Should().Be(0);
        limits.LastResetDate.Should().NotBeNull();
        limits.LastResetDate.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        limits.NextResetDate.Should().NotBeNull();
        limits.NextResetDate.Should().BeCloseTo(DateTime.UtcNow.AddMonths(1), TimeSpan.FromSeconds(1));
        limits.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public void ResetDailyCounters_ShouldResetAllDailyCounters()
    {
        // Arrange
        var limits = CreateLimits();
        limits.IncrementUsage(UsageType.Transactions, 100);
        limits.IncrementUsage(UsageType.ApiCalls, 200);
        limits.IncrementUsage(UsageType.Exports, 5);

        // Act
        limits.ResetDailyCounters();

        // Assert
        limits.CurrentDailyTransactions.Should().Be(0);
        limits.CurrentDailyApiCalls.Should().Be(0);
        limits.CurrentExportsToday.Should().Be(0);
        
        // Monthly counters should NOT be reset
        limits.CurrentMonthlyTransactions.Should().Be(100);
        limits.CurrentMonthlyApiCalls.Should().Be(200);
        limits.UpdatedAt.Should().NotBeNull();
    }

    [Theory]
    [InlineData(UsageType.Users, 10, 10, true)]
    [InlineData(UsageType.Users, 9, 10, false)]
    [InlineData(UsageType.Storage, 10, 10, true)]
    [InlineData(UsageType.Storage, 9.9, 10, false)]
    [InlineData(UsageType.ApiCalls, 100000, 100000, true)]
    [InlineData(UsageType.Transactions, 10000, 10000, true)]
    [InlineData(UsageType.Emails, 5000, 5000, true)]
    [InlineData(UsageType.SMS, 1000, 1000, true)]
    public void IsLimitExceeded_ShouldReturnCorrectResult(UsageType usageType, decimal current, decimal max, bool expectedExceeded)
    {
        // Arrange
        var limits = CreateLimits();
        
        switch (usageType)
        {
            case UsageType.Users:
                limits.UpdateCurrentUsage(users: (int)current);
                break;
            case UsageType.Storage:
                limits.UpdateCurrentUsage(storageGB: current);
                break;
            case UsageType.ApiCalls:
                limits.UpdateCurrentUsage(apiCalls: (long)current);
                break;
            case UsageType.Transactions:
                limits.UpdateCurrentUsage(transactions: (long)current);
                break;
            case UsageType.Emails:
                limits.IncrementUsage(UsageType.Emails, (int)current);
                break;
            case UsageType.SMS:
                limits.IncrementUsage(UsageType.SMS, (int)current);
                break;
        }

        // Act
        var isExceeded = limits.IsLimitExceeded(usageType);

        // Assert
        isExceeded.Should().Be(expectedExceeded);
    }

    [Theory]
    [InlineData(UsageType.Users, 5, 10, 50)]
    [InlineData(UsageType.Users, 10, 10, 100)]
    [InlineData(UsageType.Storage, 3, 10, 30)]
    [InlineData(UsageType.Storage, 7.5, 10, 75)]
    [InlineData(UsageType.ApiCalls, 50000, 100000, 50)]
    [InlineData(UsageType.Transactions, 2500, 10000, 25)]
    public void GetUsagePercentage_ShouldCalculateCorrectly(UsageType usageType, decimal current, decimal max, decimal expectedPercentage)
    {
        // Arrange
        var limits = CreateLimits();
        
        switch (usageType)
        {
            case UsageType.Users:
                limits.UpdateCurrentUsage(users: (int)current);
                break;
            case UsageType.Storage:
                limits.UpdateCurrentUsage(storageGB: current);
                break;
            case UsageType.ApiCalls:
                limits.UpdateCurrentUsage(apiCalls: (long)current);
                break;
            case UsageType.Transactions:
                limits.UpdateCurrentUsage(transactions: (long)current);
                break;
        }

        // Act
        var percentage = limits.GetUsagePercentage(usageType);

        // Assert
        percentage.Should().Be(expectedPercentage);
    }

    [Fact]
    public void GetUsagePercentage_WithZeroMax_ShouldReturnZero()
    {
        // Arrange
        var limits = CreateLimits();
        limits.UpdateUserLimits(0, 0, 0);

        // Act
        var percentage = limits.GetUsagePercentage(UsageType.Users);

        // Assert
        percentage.Should().Be(0);
    }

    [Fact]
    public void CheckLimitsAndNotify_WhenExceedsLimit_ShouldSetNotificationDate()
    {
        // Arrange
        var limits = CreateLimits();
        
        // Act - Set usage to 100%
        limits.UpdateCurrentUsage(users: limits.MaxUsers);

        // Assert
        limits.LastLimitExceededNotificationSent.Should().NotBeNull();
        limits.LastLimitExceededNotificationSent.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
    }

    [Fact]
    public void CheckLimitsAndNotify_WhenExceedsWarningThreshold_ShouldSetWarningDate()
    {
        // Arrange
        var limits = CreateLimits();
        
        // Act - Set usage to 80% (warning threshold)
        limits.UpdateCurrentUsage(users: 8); // 8 out of 10 = 80%

        // Assert
        limits.LastWarningNotificationSent.Should().NotBeNull();
        limits.LastWarningNotificationSent.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
    }

    [Fact]
    public void CheckLimitsAndNotify_WhenNotificationsDisabled_ShouldNotSetDates()
    {
        // Arrange
        var limits = CreateLimits();
        limits.SetNotificationSettings(80, false, false);
        
        // Act
        limits.UpdateCurrentUsage(users: 10);

        // Assert
        limits.LastLimitExceededNotificationSent.Should().BeNull();
        limits.LastWarningNotificationSent.Should().BeNull();
    }

    [Fact]
    public void Activate_WhenDeactivated_ShouldActivate()
    {
        // Arrange
        var limits = CreateLimits();
        limits.Deactivate();

        // Act
        limits.Activate();

        // Assert
        limits.IsActive.Should().BeTrue();
        limits.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public void Deactivate_WhenActive_ShouldDeactivate()
    {
        // Arrange
        var limits = CreateLimits();

        // Act
        limits.Deactivate();

        // Assert
        limits.IsActive.Should().BeFalse();
        limits.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public void CompleteLimitsWorkflow_WithUpgrade_ShouldWorkCorrectly()
    {
        // Arrange & Act - Create with starter package
        var limits = TenantLimits.Create(_tenantId, _createdBy);
        
        // Simulate some usage
        limits.UpdateCurrentUsage(users: 3, storageGB: 2m);
        limits.IncrementUsage(UsageType.ApiCalls, 1000);
        limits.IncrementUsage(UsageType.Transactions, 500);
        limits.IncrementUsage(UsageType.Emails, 100);
        
        // Upgrade to enterprise package
        limits.UpdateUserLimits(1000, 50, 500);
        limits.UpdateStorageLimits(1000m, 500m, 1024m);
        limits.UpdateTransactionLimits(10000000, 1000000, 1000);
        limits.UpdateApiLimits(100000000, 10000000, 10000, 100);
        
        // Set more lenient actions for enterprise
        limits.SetLimitActions(
            LimitAction.SendNotification,
            LimitAction.SendNotification,
            LimitAction.ThrottleRequests,
            LimitAction.ThrottleRequests
        );
        
        // Check usage percentages after upgrade
        var userPercentage = limits.GetUsagePercentage(UsageType.Users);
        var storagePercentage = limits.GetUsagePercentage(UsageType.Storage);
        
        // Assert
        userPercentage.Should().Be(0.3m); // 3 / 1000 * 100
        storagePercentage.Should().Be(0.2m); // 2 / 1000 * 100
        limits.UserLimitAction.Should().Be(LimitAction.SendNotification);
        limits.IsLimitExceeded(UsageType.Users).Should().BeFalse();
        limits.IsLimitExceeded(UsageType.Storage).Should().BeFalse();
    }

    [Fact]
    public void CompleteLimitsWorkflow_WithMonthlyReset_ShouldWorkCorrectly()
    {
        // Arrange
        var limits = CreateLimits();
        
        // Simulate heavy usage
        limits.IncrementUsage(UsageType.Transactions, 8000);
        limits.IncrementUsage(UsageType.ApiCalls, 80000);
        limits.IncrementUsage(UsageType.Emails, 4000);
        limits.IncrementUsage(UsageType.SMS, 800);
        limits.IncrementUsage(UsageType.Backups, 25);
        
        var beforeReset = limits.CurrentMonthlyTransactions;
        
        // Act - Monthly reset
        limits.ResetMonthlyCounters();
        
        // Assert
        beforeReset.Should().Be(8000);
        limits.CurrentMonthlyTransactions.Should().Be(0);
        limits.CurrentMonthlyApiCalls.Should().Be(0);
        limits.CurrentMonthlyEmails.Should().Be(0);
        limits.CurrentMonthlySMS.Should().Be(0);
        limits.CurrentBackupsThisMonth.Should().Be(0);
        
        // Daily counters are NOT reset with monthly reset, only with daily reset
        limits.CurrentDailyTransactions.Should().Be(8000); // These are NOT reset with monthly
        limits.CurrentDailyApiCalls.Should().Be(80000); // These are NOT reset with monthly
    }

    private TenantLimits CreateLimits()
    {
        return TenantLimits.Create(_tenantId, _createdBy);
    }
}