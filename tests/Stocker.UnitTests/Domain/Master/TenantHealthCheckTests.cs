using FluentAssertions;
using Stocker.Domain.Master.Entities;
using Xunit;

namespace Stocker.UnitTests.Domain.Master;

public class TenantHealthCheckTests
{
    private readonly Guid _tenantId = Guid.NewGuid();

    [Fact]
    public void Create_WithValidTenantId_ShouldCreateHealthCheck()
    {
        // Act
        var healthCheck = TenantHealthCheck.Create(_tenantId);

        // Assert
        healthCheck.Should().NotBeNull();
        healthCheck.Id.Should().NotBeEmpty();
        healthCheck.TenantId.Should().Be(_tenantId);
        healthCheck.CheckedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        healthCheck.OverallStatus.Should().Be("Unknown");
        healthCheck.HealthScore.Should().Be(0);
        
        // All health checks should be false by default
        healthCheck.IsDatabaseHealthy.Should().BeFalse();
        healthCheck.IsApiHealthy.Should().BeFalse();
        healthCheck.IsStorageHealthy.Should().BeFalse();
        healthCheck.IsEmailServiceHealthy.Should().BeFalse();
        healthCheck.IsNotificationServiceHealthy.Should().BeFalse();
        healthCheck.IsBackgroundJobsHealthy.Should().BeFalse();
        healthCheck.IsCacheHealthy.Should().BeFalse();
        healthCheck.IsBackupHealthy.Should().BeFalse();
    }

    [Fact]
    public void UpdateDatabaseHealth_ShouldUpdateDatabaseMetrics()
    {
        // Arrange
        var healthCheck = TenantHealthCheck.Create(_tenantId);
        var responseTime = 50L;
        var sizeMb = 1024L;
        var activeConnections = 10;

        // Act
        healthCheck.UpdateDatabaseHealth(true, responseTime, sizeMb, activeConnections);

        // Assert
        healthCheck.IsDatabaseHealthy.Should().BeTrue();
        healthCheck.DatabaseResponseTimeMs.Should().Be(responseTime);
        healthCheck.DatabaseSizeMb.Should().Be(sizeMb);
        healthCheck.ActiveConnections.Should().Be(activeConnections);
    }

    [Fact]
    public void UpdateApiHealth_ShouldUpdateApiMetrics()
    {
        // Arrange
        var healthCheck = TenantHealthCheck.Create(_tenantId);
        var responseTime = 100L;
        var errorRate = 2;
        var requestsPerMinute = 500;

        // Act
        healthCheck.UpdateApiHealth(true, responseTime, errorRate, requestsPerMinute);

        // Assert
        healthCheck.IsApiHealthy.Should().BeTrue();
        healthCheck.ApiResponseTimeMs.Should().Be(responseTime);
        healthCheck.ApiErrorRate.Should().Be(errorRate);
        healthCheck.ApiRequestsPerMinute.Should().Be(requestsPerMinute);
    }

    [Fact]
    public void UpdateStorageHealth_ShouldUpdateStorageMetricsAndCalculatePercent()
    {
        // Arrange
        var healthCheck = TenantHealthCheck.Create(_tenantId);
        var usedMb = 300L;
        var availableMb = 700L;

        // Act
        healthCheck.UpdateStorageHealth(true, usedMb, availableMb);

        // Assert
        healthCheck.IsStorageHealthy.Should().BeTrue();
        healthCheck.StorageUsedMb.Should().Be(usedMb);
        healthCheck.StorageAvailableMb.Should().Be(availableMb);
        healthCheck.StorageUsagePercent.Should().Be(30); // 300 / 1000 * 100
    }

    [Fact]
    public void UpdateStorageHealth_WithZeroTotal_ShouldSetPercentToZero()
    {
        // Arrange
        var healthCheck = TenantHealthCheck.Create(_tenantId);

        // Act
        healthCheck.UpdateStorageHealth(false, 0, 0);

        // Assert
        healthCheck.StorageUsagePercent.Should().Be(0);
    }

    [Fact]
    public void UpdateServiceHealth_ShouldUpdateAllServiceStatuses()
    {
        // Arrange
        var healthCheck = TenantHealthCheck.Create(_tenantId);

        // Act
        healthCheck.UpdateServiceHealth(
            emailHealthy: true,
            notificationHealthy: false,
            backgroundJobsHealthy: true,
            cacheHealthy: true
        );

        // Assert
        healthCheck.IsEmailServiceHealthy.Should().BeTrue();
        healthCheck.IsNotificationServiceHealthy.Should().BeFalse();
        healthCheck.IsBackgroundJobsHealthy.Should().BeTrue();
        healthCheck.IsCacheHealthy.Should().BeTrue();
    }

    [Fact]
    public void UpdatePerformanceMetrics_ShouldUpdateAllPerformanceData()
    {
        // Arrange
        var healthCheck = TenantHealthCheck.Create(_tenantId);
        var cpuUsage = 65.5;
        var memoryUsage = 72.3;
        var activeUsers = 150;
        var concurrentSessions = 100;

        // Act
        healthCheck.UpdatePerformanceMetrics(cpuUsage, memoryUsage, activeUsers, concurrentSessions);

        // Assert
        healthCheck.CpuUsagePercent.Should().Be(cpuUsage);
        healthCheck.MemoryUsagePercent.Should().Be(memoryUsage);
        healthCheck.ActiveUsers.Should().Be(activeUsers);
        healthCheck.ConcurrentSessions.Should().Be(concurrentSessions);
    }

    [Fact]
    public void UpdateSecurityHealth_ShouldUpdateSecurityMetrics()
    {
        // Arrange
        var healthCheck = TenantHealthCheck.Create(_tenantId);
        var failedLogins = 5;
        var securityIncidents = 1;
        var lastScan = DateTime.UtcNow.AddDays(-1);
        var hasUpdates = true;

        // Act
        healthCheck.UpdateSecurityHealth(failedLogins, securityIncidents, lastScan, hasUpdates);

        // Assert
        healthCheck.FailedLoginAttempts.Should().Be(failedLogins);
        healthCheck.SecurityIncidents.Should().Be(securityIncidents);
        healthCheck.LastSecurityScan.Should().Be(lastScan);
        healthCheck.HasSecurityUpdates.Should().Be(hasUpdates);
    }

    [Fact]
    public void UpdateSecurityHealth_WithNullLastScan_ShouldSetNullLastScan()
    {
        // Arrange
        var healthCheck = TenantHealthCheck.Create(_tenantId);

        // Act
        healthCheck.UpdateSecurityHealth(0, 0, null, false);

        // Assert
        healthCheck.LastSecurityScan.Should().BeNull();
    }

    [Fact]
    public void UpdateBackupHealth_ShouldUpdateBackupMetrics()
    {
        // Arrange
        var healthCheck = TenantHealthCheck.Create(_tenantId);
        var lastBackupDate = DateTime.UtcNow.AddHours(-6);
        var sizeMb = 2048L;

        // Act
        healthCheck.UpdateBackupHealth(lastBackupDate, true, sizeMb);

        // Assert
        healthCheck.LastBackupDate.Should().Be(lastBackupDate);
        healthCheck.IsBackupHealthy.Should().BeTrue();
        healthCheck.LastBackupSizeMb.Should().Be(sizeMb);
    }

    [Fact]
    public void UpdateBackupHealth_WithNullDate_ShouldSetNullDate()
    {
        // Arrange
        var healthCheck = TenantHealthCheck.Create(_tenantId);

        // Act
        healthCheck.UpdateBackupHealth(null, false, 0);

        // Assert
        healthCheck.LastBackupDate.Should().BeNull();
        healthCheck.IsBackupHealthy.Should().BeFalse();
    }

    [Fact]
    public void SetErrors_ShouldSetErrorsAndCount()
    {
        // Arrange
        var healthCheck = TenantHealthCheck.Create(_tenantId);
        var errors = "[\"Database connection failed\", \"API timeout\"]";
        var count = 2;

        // Act
        healthCheck.SetErrors(errors, count);

        // Assert
        healthCheck.Errors.Should().Be(errors);
        healthCheck.ErrorCount.Should().Be(count);
    }

    [Fact]
    public void SetErrors_WithNull_ShouldSetNullErrorsAndCount()
    {
        // Arrange
        var healthCheck = TenantHealthCheck.Create(_tenantId);

        // Act
        healthCheck.SetErrors(null, 0);

        // Assert
        healthCheck.Errors.Should().BeNull();
        healthCheck.ErrorCount.Should().Be(0);
    }

    [Fact]
    public void SetWarnings_ShouldSetWarningsAndCount()
    {
        // Arrange
        var healthCheck = TenantHealthCheck.Create(_tenantId);
        var warnings = "[\"Storage usage high\", \"API rate limit approaching\"]";
        var count = 2;

        // Act
        healthCheck.SetWarnings(warnings, count);

        // Assert
        healthCheck.Warnings.Should().Be(warnings);
        healthCheck.WarningCount.Should().Be(count);
    }

    [Fact]
    public void CalculateOverallHealth_WithPerfectHealth_ShouldReturn100()
    {
        // Arrange
        var healthCheck = TenantHealthCheck.Create(_tenantId);
        healthCheck.UpdateDatabaseHealth(true, 50, 1000, 10);
        healthCheck.UpdateApiHealth(true, 100, 0, 500);
        healthCheck.UpdateStorageHealth(true, 300, 700);
        healthCheck.UpdateServiceHealth(true, true, true, true);
        healthCheck.UpdatePerformanceMetrics(50, 60, 100, 50);
        healthCheck.UpdateSecurityHealth(0, 0, DateTime.UtcNow, false);
        healthCheck.UpdateBackupHealth(DateTime.UtcNow, true, 1000);

        // Act
        healthCheck.CalculateOverallHealth();

        // Assert
        healthCheck.HealthScore.Should().Be(100);
        healthCheck.OverallStatus.Should().Be("Healthy");
    }

    [Fact]
    public void CalculateOverallHealth_WithCriticalIssues_ShouldDeductPoints()
    {
        // Arrange
        var healthCheck = TenantHealthCheck.Create(_tenantId);
        healthCheck.UpdateDatabaseHealth(false, 5000, 1000, 10); // -20
        healthCheck.UpdateApiHealth(false, 3000, 10, 500); // -20
        healthCheck.UpdateStorageHealth(false, 900, 100); // -20
        healthCheck.UpdateServiceHealth(true, true, true, true);

        // Act
        healthCheck.CalculateOverallHealth();

        // Assert
        healthCheck.HealthScore.Should().Be(25); // 100 - 60 - 5 (API error rate) - 10 (API error rate > 5)
        healthCheck.OverallStatus.Should().Be("Unhealthy");
    }

    [Fact]
    public void CalculateOverallHealth_WithServiceIssues_ShouldDeductPoints()
    {
        // Arrange
        var healthCheck = TenantHealthCheck.Create(_tenantId);
        healthCheck.UpdateDatabaseHealth(true, 50, 1000, 10);
        healthCheck.UpdateApiHealth(true, 100, 0, 500);
        healthCheck.UpdateStorageHealth(true, 300, 700);
        healthCheck.UpdateServiceHealth(false, true, false, true); // -20 (email -10, jobs -10)
        healthCheck.UpdateBackupHealth(DateTime.UtcNow, false, 0); // -10

        // Act
        healthCheck.CalculateOverallHealth();

        // Assert
        healthCheck.HealthScore.Should().Be(70); // 100 - 30
        healthCheck.OverallStatus.Should().Be("Degraded");
    }

    [Fact]
    public void CalculateOverallHealth_WithHighCpuUsage_ShouldDeductPoints()
    {
        // Arrange
        var healthCheck = TenantHealthCheck.Create(_tenantId);
        SetHealthyDefaults(healthCheck);
        healthCheck.UpdatePerformanceMetrics(85, 60, 100, 50); // CPU > 80

        // Act
        healthCheck.CalculateOverallHealth();

        // Assert
        healthCheck.HealthScore.Should().Be(95); // 100 - 5
        healthCheck.OverallStatus.Should().Be("Healthy");
    }

    [Fact]
    public void CalculateOverallHealth_WithHighMemoryUsage_ShouldDeductPoints()
    {
        // Arrange
        var healthCheck = TenantHealthCheck.Create(_tenantId);
        SetHealthyDefaults(healthCheck);
        healthCheck.UpdatePerformanceMetrics(60, 85, 100, 50); // Memory > 80

        // Act
        healthCheck.CalculateOverallHealth();

        // Assert
        healthCheck.HealthScore.Should().Be(95); // 100 - 5
        healthCheck.OverallStatus.Should().Be("Healthy");
    }

    [Fact]
    public void CalculateOverallHealth_WithHighApiErrorRate_ShouldDeductPoints()
    {
        // Arrange
        var healthCheck = TenantHealthCheck.Create(_tenantId);
        SetHealthyDefaults(healthCheck);
        healthCheck.UpdateApiHealth(true, 100, 8, 500); // Error rate > 5

        // Act
        healthCheck.CalculateOverallHealth();

        // Assert
        healthCheck.HealthScore.Should().Be(95); // 100 - 5
        healthCheck.OverallStatus.Should().Be("Healthy");
    }

    [Fact]
    public void CalculateOverallHealth_WithSecurityIncidents_ShouldDeductPoints()
    {
        // Arrange
        var healthCheck = TenantHealthCheck.Create(_tenantId);
        SetHealthyDefaults(healthCheck);
        healthCheck.UpdateSecurityHealth(10, 2, DateTime.UtcNow, false); // Has incidents

        // Act
        healthCheck.CalculateOverallHealth();

        // Assert
        healthCheck.HealthScore.Should().Be(95); // 100 - 5
        healthCheck.OverallStatus.Should().Be("Healthy");
    }

    [Fact]
    public void CalculateOverallHealth_WithSecurityUpdates_ShouldDeductPoints()
    {
        // Arrange
        var healthCheck = TenantHealthCheck.Create(_tenantId);
        SetHealthyDefaults(healthCheck);
        healthCheck.UpdateSecurityHealth(0, 0, DateTime.UtcNow, true); // Has updates

        // Act
        healthCheck.CalculateOverallHealth();

        // Assert
        healthCheck.HealthScore.Should().Be(95); // 100 - 5
        healthCheck.OverallStatus.Should().Be("Healthy");
    }

    [Fact]
    public void CalculateOverallHealth_WithErrors_ShouldDeductPoints()
    {
        // Arrange
        var healthCheck = TenantHealthCheck.Create(_tenantId);
        SetHealthyDefaults(healthCheck);
        healthCheck.SetErrors("[\"Error 1\", \"Error 2\", \"Error 3\"]", 3);

        // Act
        healthCheck.CalculateOverallHealth();

        // Assert
        healthCheck.HealthScore.Should().Be(94); // 100 - 6 (3 errors * 2)
        healthCheck.OverallStatus.Should().Be("Healthy");
    }

    [Fact]
    public void CalculateOverallHealth_WithWarnings_ShouldDeductPoints()
    {
        // Arrange
        var healthCheck = TenantHealthCheck.Create(_tenantId);
        SetHealthyDefaults(healthCheck);
        healthCheck.SetWarnings("[\"Warning 1\", \"Warning 2\"]", 2);

        // Act
        healthCheck.CalculateOverallHealth();

        // Assert
        healthCheck.HealthScore.Should().Be(98); // 100 - 2 (2 warnings * 1)
        healthCheck.OverallStatus.Should().Be("Healthy");
    }

    [Fact]
    public void CalculateOverallHealth_WithMultipleIssues_ShouldAccumulateDeductions()
    {
        // Arrange
        var healthCheck = TenantHealthCheck.Create(_tenantId);
        healthCheck.UpdateDatabaseHealth(false, 5000, 1000, 10); // -20
        healthCheck.UpdateApiHealth(true, 100, 7, 500); // -5 (error rate)
        healthCheck.UpdateStorageHealth(true, 300, 700);
        healthCheck.UpdateServiceHealth(false, true, true, true); // -10 (email)
        healthCheck.UpdatePerformanceMetrics(85, 85, 100, 50); // -10 (CPU + Memory)
        healthCheck.UpdateSecurityHealth(10, 1, DateTime.UtcNow, true); // -10 (incidents + updates)
        healthCheck.UpdateBackupHealth(DateTime.UtcNow, false, 0); // -10
        healthCheck.SetErrors("[\"Error\"]", 1); // -2
        healthCheck.SetWarnings("[\"Warning\"]", 1); // -1

        // Act
        healthCheck.CalculateOverallHealth();

        // Assert
        healthCheck.HealthScore.Should().Be(32); // 100 - 68
        healthCheck.OverallStatus.Should().Be("Unhealthy");
    }

    [Fact]
    public void CalculateOverallHealth_WithNegativeScore_ShouldClampToZero()
    {
        // Arrange
        var healthCheck = TenantHealthCheck.Create(_tenantId);
        healthCheck.UpdateDatabaseHealth(false, 5000, 1000, 10); // -20
        healthCheck.UpdateApiHealth(false, 3000, 50, 500); // -20 - 5
        healthCheck.UpdateStorageHealth(false, 900, 100); // -20
        healthCheck.UpdateServiceHealth(false, false, false, false); // -30
        healthCheck.UpdateBackupHealth(null, false, 0); // -10
        healthCheck.SetErrors("[\"Many errors\"]", 10); // -20

        // Act
        healthCheck.CalculateOverallHealth();

        // Assert
        healthCheck.HealthScore.Should().Be(0);
        healthCheck.OverallStatus.Should().Be("Unhealthy");
    }

    [Fact]
    public void CalculateOverallHealth_ScoreThresholds_ShouldSetCorrectStatus()
    {
        // Test Healthy threshold (>= 90)
        var healthCheck1 = TenantHealthCheck.Create(_tenantId);
        SetHealthyDefaults(healthCheck1);
        healthCheck1.UpdateServiceHealth(false, true, true, true); // -10
        healthCheck1.CalculateOverallHealth();
        healthCheck1.HealthScore.Should().Be(90);
        healthCheck1.OverallStatus.Should().Be("Healthy");

        // Test Degraded threshold (>= 60)
        var healthCheck2 = TenantHealthCheck.Create(_tenantId);
        SetHealthyDefaults(healthCheck2);
        healthCheck2.UpdateDatabaseHealth(false, 1000, 1000, 10); // -20
        healthCheck2.UpdateApiHealth(false, 1000, 0, 500); // -20
        healthCheck2.CalculateOverallHealth();
        healthCheck2.HealthScore.Should().Be(60);
        healthCheck2.OverallStatus.Should().Be("Degraded");

        // Test Unhealthy threshold (< 60)
        var healthCheck3 = TenantHealthCheck.Create(_tenantId);
        SetHealthyDefaults(healthCheck3);
        healthCheck3.UpdateDatabaseHealth(false, 1000, 1000, 10); // -20
        healthCheck3.UpdateApiHealth(false, 1000, 0, 500); // -20
        healthCheck3.UpdateServiceHealth(false, true, true, true); // -10
        healthCheck3.CalculateOverallHealth();
        healthCheck3.HealthScore.Should().Be(50);
        healthCheck3.OverallStatus.Should().Be("Unhealthy");
    }

    [Fact]
    public void CompleteHealthCheckWorkflow_ShouldWorkCorrectly()
    {
        // Arrange & Act
        var healthCheck = TenantHealthCheck.Create(_tenantId);

        // Update all health metrics
        healthCheck.UpdateDatabaseHealth(true, 45, 2048, 15);
        healthCheck.UpdateApiHealth(true, 85, 2, 750);
        healthCheck.UpdateStorageHealth(true, 512, 1536);
        healthCheck.UpdateServiceHealth(true, true, true, true);
        healthCheck.UpdatePerformanceMetrics(65.5, 72.3, 250, 180);
        healthCheck.UpdateSecurityHealth(3, 0, DateTime.UtcNow.AddHours(-12), false);
        healthCheck.UpdateBackupHealth(DateTime.UtcNow.AddHours(-4), true, 1536);
        healthCheck.SetErrors(null, 0);
        healthCheck.SetWarnings("[\"Storage usage above 25%\"]", 1);

        // Calculate overall health
        healthCheck.CalculateOverallHealth();

        // Assert
        healthCheck.HealthScore.Should().Be(99); // 100 - 1 (warning)
        healthCheck.OverallStatus.Should().Be("Healthy");
        healthCheck.StorageUsagePercent.Should().Be(25);
        healthCheck.CheckedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
    }

    private void SetHealthyDefaults(TenantHealthCheck healthCheck)
    {
        healthCheck.UpdateDatabaseHealth(true, 50, 1000, 10);
        healthCheck.UpdateApiHealth(true, 100, 0, 500);
        healthCheck.UpdateStorageHealth(true, 300, 700);
        healthCheck.UpdateServiceHealth(true, true, true, true);
        healthCheck.UpdatePerformanceMetrics(50, 60, 100, 50);
        healthCheck.UpdateSecurityHealth(0, 0, DateTime.UtcNow, false);
        healthCheck.UpdateBackupHealth(DateTime.UtcNow, true, 1000);
    }
}