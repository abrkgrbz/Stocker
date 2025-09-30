using FluentAssertions;
using Stocker.Domain.Tenant.Entities;
using Xunit;

namespace Stocker.UnitTests.Domain.Tenant;

public class TenantSecuritySettingsTests
{
    private const string CreatedBy = "admin@test.com";
    private const string ModifiedBy = "security@test.com";

    [Fact]
    public void CreateDefault_ShouldCreateWithDefaultSettings()
    {
        // Act
        var settings = TenantSecuritySettings.CreateDefault(CreatedBy);

        // Assert
        settings.Should().NotBeNull();
        settings.Id.Should().NotBeEmpty();
        settings.IsDefault.Should().BeTrue();
        settings.ProfileName.Should().Be("Default");
        settings.CreatedBy.Should().Be(CreatedBy);
        settings.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        settings.LastModifiedAt.Should().BeNull();
        settings.LastModifiedBy.Should().BeNull();

        // Verify default two-factor settings
        settings.TwoFactorRequired.Should().BeFalse();
        settings.TwoFactorOptional.Should().BeTrue();
        settings.TwoFactorMethods.Should().Contain("Email");
        settings.TwoFactorMethods.Should().Contain("Authenticator");
        settings.TwoFactorCodeLength.Should().Be(6);
        settings.TwoFactorCodeExpiryMinutes.Should().Be(5);
        settings.AllowBackupCodes.Should().BeTrue();
        settings.BackupCodesCount.Should().Be(10);

        // Verify default password policy
        settings.MinPasswordLength.Should().Be(8);
        settings.MaxPasswordLength.Should().Be(128);
        settings.RequireUppercase.Should().BeTrue();
        settings.RequireLowercase.Should().BeTrue();
        settings.RequireNumbers.Should().BeTrue();
        settings.RequireSpecialCharacters.Should().BeTrue();
        settings.PasswordExpiryDays.Should().Be(90);
        settings.PasswordHistoryCount.Should().Be(5);
        settings.PreventCommonPasswords.Should().BeTrue();
        settings.PreventUserInfoInPassword.Should().BeTrue();

        // Verify default login security
        settings.MaxLoginAttempts.Should().Be(5);
        settings.AccountLockoutMinutes.Should().Be(30);
        settings.RequireCaptchaAfterFailedAttempts.Should().BeTrue();
        settings.CaptchaThreshold.Should().Be(3);
        settings.SessionTimeoutMinutes.Should().Be(30);
        settings.InactivityTimeoutMinutes.Should().Be(15);
        settings.SingleSessionPerUser.Should().BeFalse();

        // Verify default security features
        settings.EnableAuditLogging.Should().BeTrue();
        settings.EnableApiRateLimiting.Should().BeTrue();
        settings.RequireEmailVerification.Should().BeTrue();
        settings.RequireHttps.Should().BeTrue();
        settings.EnableSecurityHeaders.Should().BeTrue();
    }

    [Fact]
    public void CreateCustomProfile_ShouldCreateWithProfileName()
    {
        // Arrange
        var profileName = "High Security";

        // Act
        var settings = TenantSecuritySettings.CreateCustomProfile(profileName, CreatedBy);

        // Assert
        settings.Should().NotBeNull();
        settings.IsDefault.Should().BeFalse();
        settings.ProfileName.Should().Be(profileName);
        settings.CreatedBy.Should().Be(CreatedBy);

        // Should still have default values initialized
        settings.MinPasswordLength.Should().Be(8);
        settings.TwoFactorOptional.Should().BeTrue();
    }

    [Fact]
    public void ConfigureTwoFactor_ShouldUpdateTwoFactorSettings()
    {
        // Arrange
        var settings = CreateSettings();
        var methods = new List<string> { "SMS", "Email", "Authenticator" };

        // Act
        settings.ConfigureTwoFactor(
            required: true,
            methods: methods,
            codeLength: 8,
            expiryMinutes: 10);

        // Assert
        settings.TwoFactorRequired.Should().BeTrue();
        settings.TwoFactorOptional.Should().BeFalse();
        settings.TwoFactorMethods.Should().BeEquivalentTo(methods);
        settings.TwoFactorCodeLength.Should().Be(8);
        settings.TwoFactorCodeExpiryMinutes.Should().Be(10);
        settings.LastModifiedAt.Should().NotBeNull();
    }

    [Fact]
    public void ConfigureTwoFactor_WithDefaults_ShouldUseDefaultValues()
    {
        // Arrange
        var settings = CreateSettings();
        var methods = new List<string> { "SMS" };

        // Act
        settings.ConfigureTwoFactor(false, methods);

        // Assert
        settings.TwoFactorRequired.Should().BeFalse();
        settings.TwoFactorOptional.Should().BeTrue();
        settings.TwoFactorMethods.Should().BeEquivalentTo(methods);
        settings.TwoFactorCodeLength.Should().Be(6);
        settings.TwoFactorCodeExpiryMinutes.Should().Be(5);
    }

    [Fact]
    public void SetPasswordPolicy_ShouldUpdatePasswordSettings()
    {
        // Arrange
        var settings = CreateSettings();

        // Act
        settings.SetPasswordPolicy(
            minLength: 12,
            requireUpper: true,
            requireLower: true,
            requireNumbers: false,
            requireSpecial: false,
            expiryDays: 180);

        // Assert
        settings.MinPasswordLength.Should().Be(12);
        settings.RequireUppercase.Should().BeTrue();
        settings.RequireLowercase.Should().BeTrue();
        settings.RequireNumbers.Should().BeFalse();
        settings.RequireSpecialCharacters.Should().BeFalse();
        settings.PasswordExpiryDays.Should().Be(180);
        settings.LastModifiedAt.Should().NotBeNull();
    }

    [Fact]
    public void ConfigureIpWhitelist_Enabled_ShouldSetWhitelist()
    {
        // Arrange
        var settings = CreateSettings();
        var addresses = new List<string> { "192.168.1.100", "10.0.0.1" };
        var ranges = new List<string> { "192.168.0.0/24", "10.0.0.0/16" };

        // Act
        settings.ConfigureIpWhitelist(true, addresses, ranges);

        // Assert
        settings.EnableIpWhitelist.Should().BeTrue();
        settings.AllowedIpAddresses.Should().BeEquivalentTo(addresses);
        settings.AllowedIpRanges.Should().BeEquivalentTo(ranges);
        settings.LastModifiedAt.Should().NotBeNull();
    }

    [Fact]
    public void ConfigureIpWhitelist_Disabled_ShouldDisableWhitelist()
    {
        // Arrange
        var settings = CreateSettings();

        // Act
        settings.ConfigureIpWhitelist(false);

        // Assert
        settings.EnableIpWhitelist.Should().BeFalse();
        settings.AllowedIpAddresses.Should().BeEmpty();
        settings.AllowedIpRanges.Should().BeEmpty();
    }

    [Fact]
    public void ConfigureIpWhitelist_WithNullLists_ShouldUseEmptyLists()
    {
        // Arrange
        var settings = CreateSettings();

        // Act
        settings.ConfigureIpWhitelist(true, null, null);

        // Assert
        settings.EnableIpWhitelist.Should().BeTrue();
        settings.AllowedIpAddresses.Should().NotBeNull();
        settings.AllowedIpAddresses.Should().BeEmpty();
        settings.AllowedIpRanges.Should().NotBeNull();
        settings.AllowedIpRanges.Should().BeEmpty();
    }

    [Fact]
    public void ConfigureIpBlacklist_Enabled_ShouldSetBlacklist()
    {
        // Arrange
        var settings = CreateSettings();
        var addresses = new List<string> { "192.168.1.200", "10.0.0.100" };
        var ranges = new List<string> { "172.16.0.0/12" };

        // Act
        settings.ConfigureIpBlacklist(true, addresses, ranges);

        // Assert
        settings.EnableIpBlacklist.Should().BeTrue();
        settings.BlockedIpAddresses.Should().BeEquivalentTo(addresses);
        settings.BlockedIpRanges.Should().BeEquivalentTo(ranges);
        settings.LastModifiedAt.Should().NotBeNull();
    }

    [Fact]
    public void ConfigureGeoBlocking_Enabled_ShouldSetCountryLists()
    {
        // Arrange
        var settings = CreateSettings();
        var allowedCountries = new List<string> { "US", "CA", "GB" };
        var blockedCountries = new List<string> { "CN", "RU" };

        // Act
        settings.ConfigureGeoBlocking(true, allowedCountries, blockedCountries);

        // Assert
        settings.EnableGeoBlocking.Should().BeTrue();
        settings.AllowedCountries.Should().BeEquivalentTo(allowedCountries);
        settings.BlockedCountries.Should().BeEquivalentTo(blockedCountries);
        settings.LastModifiedAt.Should().NotBeNull();
    }

    [Fact]
    public void ConfigureGeoBlocking_Disabled_ShouldDisableGeoBlocking()
    {
        // Arrange
        var settings = CreateSettings();

        // Act
        settings.ConfigureGeoBlocking(false);

        // Assert
        settings.EnableGeoBlocking.Should().BeFalse();
        settings.AllowedCountries.Should().BeEmpty();
        settings.BlockedCountries.Should().BeEmpty();
    }

    [Fact]
    public void ConfigureSession_ShouldUpdateSessionSettings()
    {
        // Arrange
        var settings = CreateSettings();

        // Act
        settings.ConfigureSession(
            timeoutMinutes: 60,
            inactivityMinutes: 20,
            singleSession: true);

        // Assert
        settings.SessionTimeoutMinutes.Should().Be(60);
        settings.InactivityTimeoutMinutes.Should().Be(20);
        settings.SingleSessionPerUser.Should().BeTrue();
        settings.LastModifiedAt.Should().NotBeNull();
    }

    [Fact]
    public void ConfigureApiSecurity_ShouldUpdateApiSettings()
    {
        // Arrange
        var settings = CreateSettings();

        // Act
        settings.ConfigureApiSecurity(
            requireKey: true,
            requireHttps: true,
            rateLimitPerMinute: 100);

        // Assert
        settings.RequireApiKey.Should().BeTrue();
        settings.RequireHttps.Should().BeTrue();
        settings.ApiRateLimitPerMinute.Should().Be(100);
        settings.EnableApiRateLimiting.Should().BeTrue();
        settings.LastModifiedAt.Should().NotBeNull();
    }

    [Fact]
    public void ConfigureApiSecurity_WithZeroRateLimit_ShouldDisableRateLimiting()
    {
        // Arrange
        var settings = CreateSettings();

        // Act
        settings.ConfigureApiSecurity(true, true, 0);

        // Assert
        settings.ApiRateLimitPerMinute.Should().Be(0);
        settings.EnableApiRateLimiting.Should().BeFalse();
    }

    [Fact]
    public void ConfigureAuditLogging_ShouldUpdateAuditSettings()
    {
        // Arrange
        var settings = CreateSettings();

        // Act
        settings.ConfigureAuditLogging(
            enable: true,
            logSuccess: false,
            logFailure: true,
            retentionDays: 730);

        // Assert
        settings.EnableAuditLogging.Should().BeTrue();
        settings.LogSuccessfulLogins.Should().BeFalse();
        settings.LogFailedLogins.Should().BeTrue();
        settings.AuditLogRetentionDays.Should().Be(730);
        settings.LastModifiedAt.Should().NotBeNull();
    }

    [Fact]
    public void SetCustomConfiguration_ShouldUpdateJsonConfig()
    {
        // Arrange
        var settings = CreateSettings();
        var jsonConfig = "{\"custom\":\"settings\",\"value\":123}";

        // Act
        settings.SetCustomConfiguration(jsonConfig);

        // Assert
        settings.CustomConfiguration.Should().Be(jsonConfig);
        settings.LastModifiedAt.Should().NotBeNull();
    }

    [Fact]
    public void UpdateModifiedBy_ShouldSetModifiedByAndTimestamp()
    {
        // Arrange
        var settings = CreateSettings();

        // Act
        settings.UpdateModifiedBy(ModifiedBy);

        // Assert
        settings.LastModifiedBy.Should().Be(ModifiedBy);
        settings.LastModifiedAt.Should().NotBeNull();
        settings.LastModifiedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
    }

    [Fact]
    public void DefaultSettings_ShouldHaveSecureDefaults()
    {
        // Arrange & Act
        var settings = TenantSecuritySettings.CreateDefault(CreatedBy);

        // Assert - Security by default principle
        settings.PreventCommonPasswords.Should().BeTrue();
        settings.PreventUserInfoInPassword.Should().BeTrue();
        settings.EnableSecurityHeaders.Should().BeTrue();
        settings.EnableHsts.Should().BeTrue();
        settings.RequireEmailVerification.Should().BeTrue();
        settings.NotifyPasswordChanges.Should().BeTrue();
        settings.NotifyLoginFromNewLocation.Should().BeTrue();
        settings.NotifySecurityChanges.Should().BeTrue();
        settings.EnableBruteForceProtection.Should().BeTrue();
        settings.EnableSqlInjectionProtection.Should().BeTrue();
        settings.EnableXssProtection.Should().BeTrue();
        settings.EnableCsrfProtection.Should().BeTrue();
        settings.RequireHttps.Should().BeTrue();
    }

    [Fact]
    public void DefaultSettings_ShouldHaveReasonableLimits()
    {
        // Arrange & Act
        var settings = TenantSecuritySettings.CreateDefault(CreatedBy);

        // Assert
        settings.MinPasswordLength.Should().BeGreaterThanOrEqualTo(8);
        settings.MaxLoginAttempts.Should().BeInRange(3, 10);
        settings.AccountLockoutMinutes.Should().BeInRange(15, 60);
        settings.SessionTimeoutMinutes.Should().BeInRange(15, 120);
        settings.ApiRateLimitPerMinute.Should().BeGreaterThan(0);
        settings.AuditLogRetentionDays.Should().BeGreaterThanOrEqualTo(90);
    }

    [Fact]
    public void CompleteSecurityConfiguration_ShouldWorkCorrectly()
    {
        // Arrange & Act
        // Create a high-security profile
        var settings = TenantSecuritySettings.CreateCustomProfile("Maximum Security", CreatedBy);

        // Configure strict two-factor authentication
        settings.ConfigureTwoFactor(
            required: true,
            methods: new List<string> { "Authenticator", "SMS", "Email" },
            codeLength: 8,
            expiryMinutes: 3);

        settings.TwoFactorRequired.Should().BeTrue();
        settings.TwoFactorCodeLength.Should().Be(8);

        // Set strong password policy
        settings.SetPasswordPolicy(
            minLength: 16,
            requireUpper: true,
            requireLower: true,
            requireNumbers: true,
            requireSpecial: true,
            expiryDays: 60);

        settings.MinPasswordLength.Should().Be(16);
        settings.PasswordExpiryDays.Should().Be(60);

        // Configure IP restrictions
        var allowedIps = new List<string> { "10.0.0.0", "10.0.0.1" };
        var allowedRanges = new List<string> { "192.168.1.0/24" };
        settings.ConfigureIpWhitelist(true, allowedIps, allowedRanges);

        var blockedIps = new List<string> { "192.168.100.100" };
        settings.ConfigureIpBlacklist(true, blockedIps, null);

        settings.EnableIpWhitelist.Should().BeTrue();
        settings.EnableIpBlacklist.Should().BeTrue();

        // Configure geo-blocking
        settings.ConfigureGeoBlocking(
            enable: true,
            allowedCountries: new List<string> { "US", "CA", "GB", "AU" },
            blockedCountries: new List<string> { "CN", "RU", "KP" });

        settings.EnableGeoBlocking.Should().BeTrue();
        settings.AllowedCountries.Should().HaveCount(4);

        // Configure strict session management
        settings.ConfigureSession(
            timeoutMinutes: 15,
            inactivityMinutes: 5,
            singleSession: true);

        settings.SessionTimeoutMinutes.Should().Be(15);
        settings.SingleSessionPerUser.Should().BeTrue();

        // Configure API security
        settings.ConfigureApiSecurity(
            requireKey: true,
            requireHttps: true,
            rateLimitPerMinute: 30);

        settings.ApiRateLimitPerMinute.Should().Be(30);

        // Configure comprehensive audit logging
        settings.ConfigureAuditLogging(
            enable: true,
            logSuccess: true,
            logFailure: true,
            retentionDays: 2555); // 7 years

        settings.AuditLogRetentionDays.Should().Be(2555);

        // Add custom configuration
        settings.SetCustomConfiguration("{\"alertEmail\":\"security@company.com\",\"maxRiskScore\":5}");
        settings.CustomConfiguration.Should().Contain("alertEmail");

        // Update modified by
        settings.UpdateModifiedBy(ModifiedBy);
        settings.LastModifiedBy.Should().Be(ModifiedBy);
        settings.LastModifiedAt.Should().NotBeNull();

        // Verify all security features are enabled
        settings.EnableIpWhitelist.Should().BeTrue();
        settings.EnableIpBlacklist.Should().BeTrue();
        settings.EnableGeoBlocking.Should().BeTrue();
        settings.TwoFactorRequired.Should().BeTrue();
        settings.SingleSessionPerUser.Should().BeTrue();
        settings.EnableAuditLogging.Should().BeTrue();
        settings.RequireApiKey.Should().BeTrue();
        settings.RequireHttps.Should().BeTrue();
    }

    [Fact]
    public void MultipleConfigurationChanges_ShouldUpdateTimestampEachTime()
    {
        // Arrange
        var settings = CreateSettings();

        // Act & Assert
        settings.ConfigureTwoFactor(true, new List<string> { "SMS" });
        var firstModification = settings.LastModifiedAt;
        firstModification.Should().NotBeNull();

        // Small delay to ensure timestamp difference
        System.Threading.Thread.Sleep(10);

        settings.SetPasswordPolicy(10, true, true, true, true, 30);
        var secondModification = settings.LastModifiedAt;
        secondModification.Should().NotBeNull();
        secondModification.Should().BeAfter(firstModification!.Value);

        System.Threading.Thread.Sleep(10);

        settings.ConfigureSession(45, 10, false);
        var thirdModification = settings.LastModifiedAt;
        thirdModification.Should().NotBeNull();
        thirdModification.Should().BeAfter(secondModification!.Value);
    }

    [Fact]
    public void DefaultSettings_ShouldHaveBalancedSecurityUsability()
    {
        // Arrange & Act
        var settings = TenantSecuritySettings.CreateDefault(CreatedBy);

        // Assert - Not too restrictive by default
        settings.TwoFactorRequired.Should().BeFalse(); // Optional by default
        settings.SingleSessionPerUser.Should().BeFalse(); // Allow multiple devices
        settings.EnableGeoBlocking.Should().BeFalse(); // No geo restrictions by default
        settings.EnableIpWhitelist.Should().BeFalse(); // No IP restrictions by default
        settings.RequireDeviceApproval.Should().BeFalse(); // No device approval by default

        // But still secure
        settings.RequireEmailVerification.Should().BeTrue();
        settings.EnableAuditLogging.Should().BeTrue();
        settings.EnableSecurityHeaders.Should().BeTrue();
        settings.RequireHttps.Should().BeTrue();
    }

    private TenantSecuritySettings CreateSettings()
    {
        return TenantSecuritySettings.CreateDefault(CreatedBy);
    }
}