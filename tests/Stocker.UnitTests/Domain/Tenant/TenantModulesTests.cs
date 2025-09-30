using FluentAssertions;
using Stocker.Domain.Tenant.Entities;
using Xunit;

namespace Stocker.UnitTests.Domain.Tenant;

public class TenantModulesTests
{
    private readonly Guid _tenantId = Guid.NewGuid();
    private const string ModuleName = "Inventory Management";
    private const string ModuleCode = "INV_MGT";
    private const string Description = "Complete inventory management module";
    private const string Configuration = "{\"settings\":{\"autoReorder\":true}}";

    [Fact]
    public void Create_WithValidData_ShouldCreateModule()
    {
        // Act
        var module = TenantModules.Create(
            _tenantId,
            ModuleName,
            ModuleCode,
            Description,
            true,
            Configuration,
            100,
            5000,
            10000);

        // Assert
        module.Should().NotBeNull();
        module.TenantId.Should().Be(_tenantId);
        module.ModuleName.Should().Be(ModuleName);
        module.ModuleCode.Should().Be(ModuleCode);
        module.Description.Should().Be(Description);
        module.IsEnabled.Should().BeTrue();
        module.EnabledDate.Should().NotBeNull();
        module.EnabledDate.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        module.DisabledDate.Should().BeNull();
        module.Configuration.Should().Be(Configuration);
        module.UserLimit.Should().Be(100);
        module.StorageLimit.Should().Be(5000);
        module.RecordLimit.Should().Be(10000);
        module.ExpiryDate.Should().BeNull();
        module.IsTrial.Should().BeFalse();
        module.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        module.UpdatedAt.Should().BeNull();
    }

    [Fact]
    public void Create_WithMinimalData_ShouldCreateModuleWithDefaults()
    {
        // Act
        var module = TenantModules.Create(
            _tenantId,
            ModuleName,
            ModuleCode);

        // Assert
        module.Should().NotBeNull();
        module.Description.Should().BeNull();
        module.IsEnabled.Should().BeTrue();
        module.Configuration.Should().BeNull();
        module.UserLimit.Should().BeNull();
        module.StorageLimit.Should().BeNull();
        module.RecordLimit.Should().BeNull();
        module.ExpiryDate.Should().BeNull();
        module.IsTrial.Should().BeFalse();
    }

    [Fact]
    public void Create_AsDisabled_ShouldNotSetEnabledDate()
    {
        // Act
        var module = TenantModules.Create(
            _tenantId,
            ModuleName,
            ModuleCode,
            isEnabled: false);

        // Assert
        module.IsEnabled.Should().BeFalse();
        module.EnabledDate.Should().BeNull();
    }

    [Fact]
    public void Create_AsTrialWithExpiry_ShouldSetTrialAndExpiry()
    {
        // Arrange
        var expiryDate = DateTime.UtcNow.AddDays(30);

        // Act
        var module = TenantModules.Create(
            _tenantId,
            ModuleName,
            ModuleCode,
            expiryDate: expiryDate,
            isTrial: true);

        // Assert
        module.IsTrial.Should().BeTrue();
        module.ExpiryDate.Should().Be(expiryDate);
    }

    [Fact]
    public void Create_WithEmptyTenantId_ShouldThrowArgumentException()
    {
        // Act
        var action = () => TenantModules.Create(
            Guid.Empty,
            ModuleName,
            ModuleCode);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithParameterName("tenantId");
    }

    [Fact]
    public void Create_WithNullModuleName_ShouldThrowArgumentException()
    {
        // Act
        var action = () => TenantModules.Create(
            _tenantId,
            null!,
            ModuleCode);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Module name cannot be empty.*")
            .WithParameterName("moduleName");
    }

    [Fact]
    public void Create_WithEmptyModuleName_ShouldThrowArgumentException()
    {
        // Act
        var action = () => TenantModules.Create(
            _tenantId,
            "",
            ModuleCode);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Module name cannot be empty.*")
            .WithParameterName("moduleName");
    }

    [Fact]
    public void Create_WithWhitespaceModuleName_ShouldThrowArgumentException()
    {
        // Act
        var action = () => TenantModules.Create(
            _tenantId,
            "   ",
            ModuleCode);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Module name cannot be empty.*")
            .WithParameterName("moduleName");
    }

    [Fact]
    public void Create_WithNullModuleCode_ShouldThrowArgumentException()
    {
        // Act
        var action = () => TenantModules.Create(
            _tenantId,
            ModuleName,
            null!);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Module code cannot be empty.*")
            .WithParameterName("moduleCode");
    }

    [Fact]
    public void Create_WithEmptyModuleCode_ShouldThrowArgumentException()
    {
        // Act
        var action = () => TenantModules.Create(
            _tenantId,
            ModuleName,
            "");

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Module code cannot be empty.*")
            .WithParameterName("moduleCode");
    }

    [Fact]
    public void Enable_WhenDisabled_ShouldEnableModule()
    {
        // Arrange
        var module = CreateModule(isEnabled: false);

        // Act
        module.Enable();

        // Assert
        module.IsEnabled.Should().BeTrue();
        module.EnabledDate.Should().NotBeNull();
        module.EnabledDate.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        module.DisabledDate.Should().BeNull();
        module.UpdatedAt.Should().NotBeNull();
        module.UpdatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
    }

    [Fact]
    public void Enable_WhenAlreadyEnabled_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var module = CreateModule(isEnabled: true);

        // Act
        var action = () => module.Enable();

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Module is already enabled.");
    }

    [Fact]
    public void Enable_WhenExpired_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var module = CreateModule(
            isEnabled: false,
            expiryDate: DateTime.UtcNow.AddDays(-1));

        // Act
        var action = () => module.Enable();

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Cannot enable expired module.");
    }

    [Fact]
    public void Enable_WhenNotExpired_ShouldEnableSuccessfully()
    {
        // Arrange
        var module = CreateModule(
            isEnabled: false,
            expiryDate: DateTime.UtcNow.AddDays(30));

        // Act
        module.Enable();

        // Assert
        module.IsEnabled.Should().BeTrue();
    }

    [Fact]
    public void Disable_WhenEnabled_ShouldDisableModule()
    {
        // Arrange
        var module = CreateModule(isEnabled: true);

        // Act
        module.Disable();

        // Assert
        module.IsEnabled.Should().BeFalse();
        module.DisabledDate.Should().NotBeNull();
        module.DisabledDate.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        module.UpdatedAt.Should().NotBeNull();
        module.UpdatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
    }

    [Fact]
    public void Disable_WhenAlreadyDisabled_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var module = CreateModule(isEnabled: false);

        // Act
        var action = () => module.Disable();

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Module is already disabled.");
    }

    [Fact]
    public void UpdateConfiguration_ShouldUpdateConfigAndTimestamp()
    {
        // Arrange
        var module = CreateModule();
        var newConfig = "{\"settings\":{\"autoReorder\":false,\"threshold\":10}}";

        // Act
        module.UpdateConfiguration(newConfig);

        // Assert
        module.Configuration.Should().Be(newConfig);
        module.UpdatedAt.Should().NotBeNull();
        module.UpdatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
    }

    [Fact]
    public void UpdateConfiguration_WithNull_ShouldSetToNull()
    {
        // Arrange
        var module = CreateModule(configuration: "existing config");

        // Act
        module.UpdateConfiguration(null);

        // Assert
        module.Configuration.Should().BeNull();
        module.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public void UpdateLimits_ShouldUpdateAllLimits()
    {
        // Arrange
        var module = CreateModule();

        // Act
        module.UpdateLimits(200, 10000, 50000);

        // Assert
        module.UserLimit.Should().Be(200);
        module.StorageLimit.Should().Be(10000);
        module.RecordLimit.Should().Be(50000);
        module.UpdatedAt.Should().NotBeNull();
        module.UpdatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
    }

    [Fact]
    public void UpdateLimits_WithNulls_ShouldSetToNull()
    {
        // Arrange
        var module = CreateModule(userLimit: 100, storageLimit: 5000, recordLimit: 10000);

        // Act
        module.UpdateLimits(null, null, null);

        // Assert
        module.UserLimit.Should().BeNull();
        module.StorageLimit.Should().BeNull();
        module.RecordLimit.Should().BeNull();
        module.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public void UpdateLimits_PartialUpdate_ShouldUpdateSpecifiedLimits()
    {
        // Arrange
        var module = CreateModule(userLimit: 100, storageLimit: 5000, recordLimit: 10000);

        // Act
        module.UpdateLimits(150, null, 20000);

        // Assert
        module.UserLimit.Should().Be(150);
        module.StorageLimit.Should().BeNull();
        module.RecordLimit.Should().Be(20000);
    }

    [Fact]
    public void ExtendExpiry_WithFutureDate_ShouldUpdateExpiry()
    {
        // Arrange
        var module = CreateModule();
        var newExpiryDate = DateTime.UtcNow.AddMonths(6);

        // Act
        module.ExtendExpiry(newExpiryDate);

        // Assert
        module.ExpiryDate.Should().Be(newExpiryDate);
        module.UpdatedAt.Should().NotBeNull();
        module.UpdatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
    }

    [Fact]
    public void ExtendExpiry_WithPastDate_ShouldThrowArgumentException()
    {
        // Arrange
        var module = CreateModule();
        var pastDate = DateTime.UtcNow.AddDays(-1);

        // Act
        var action = () => module.ExtendExpiry(pastDate);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Expiry date must be in the future.*")
            .WithParameterName("newExpiryDate");
    }

    [Fact]
    public void ExtendExpiry_WithCurrentDate_ShouldThrowArgumentException()
    {
        // Arrange
        var module = CreateModule();
        var currentDate = DateTime.UtcNow;

        // Act
        var action = () => module.ExtendExpiry(currentDate);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Expiry date must be in the future.*")
            .WithParameterName("newExpiryDate");
    }

    [Fact]
    public void ConvertToPaid_WhenTrial_ShouldSetIsTrialToFalse()
    {
        // Arrange
        var module = CreateModule(isTrial: true);

        // Act
        module.ConvertToPaid();

        // Assert
        module.IsTrial.Should().BeFalse();
        module.UpdatedAt.Should().NotBeNull();
        module.UpdatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
    }

    [Fact]
    public void ConvertToPaid_WhenAlreadyPaid_ShouldStillWork()
    {
        // Arrange
        var module = CreateModule(isTrial: false);

        // Act
        module.ConvertToPaid();

        // Assert
        module.IsTrial.Should().BeFalse();
        module.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public void IsExpired_WithNoExpiry_ShouldReturnFalse()
    {
        // Arrange
        var module = CreateModule(expiryDate: null);

        // Act
        var result = module.IsExpired();

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public void IsExpired_WithFutureExpiry_ShouldReturnFalse()
    {
        // Arrange
        var module = CreateModule(expiryDate: DateTime.UtcNow.AddDays(30));

        // Act
        var result = module.IsExpired();

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public void IsExpired_WithPastExpiry_ShouldReturnTrue()
    {
        // Arrange
        var module = CreateModule(expiryDate: DateTime.UtcNow.AddDays(-1));

        // Act
        var result = module.IsExpired();

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void IsUserLimitReached_WithNoLimit_ShouldReturnFalse()
    {
        // Arrange
        var module = CreateModule(userLimit: null);

        // Act
        var result = module.IsUserLimitReached(1000);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public void IsUserLimitReached_BelowLimit_ShouldReturnFalse()
    {
        // Arrange
        var module = CreateModule(userLimit: 100);

        // Act
        var result = module.IsUserLimitReached(99);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public void IsUserLimitReached_AtLimit_ShouldReturnTrue()
    {
        // Arrange
        var module = CreateModule(userLimit: 100);

        // Act
        var result = module.IsUserLimitReached(100);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void IsUserLimitReached_AboveLimit_ShouldReturnTrue()
    {
        // Arrange
        var module = CreateModule(userLimit: 100);

        // Act
        var result = module.IsUserLimitReached(101);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void IsStorageLimitReached_WithNoLimit_ShouldReturnFalse()
    {
        // Arrange
        var module = CreateModule(storageLimit: null);

        // Act
        var result = module.IsStorageLimitReached(100000);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public void IsStorageLimitReached_BelowLimit_ShouldReturnFalse()
    {
        // Arrange
        var module = CreateModule(storageLimit: 5000);

        // Act
        var result = module.IsStorageLimitReached(4999);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public void IsStorageLimitReached_AtLimit_ShouldReturnTrue()
    {
        // Arrange
        var module = CreateModule(storageLimit: 5000);

        // Act
        var result = module.IsStorageLimitReached(5000);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void IsStorageLimitReached_AboveLimit_ShouldReturnTrue()
    {
        // Arrange
        var module = CreateModule(storageLimit: 5000);

        // Act
        var result = module.IsStorageLimitReached(5001);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void IsRecordLimitReached_WithNoLimit_ShouldReturnFalse()
    {
        // Arrange
        var module = CreateModule(recordLimit: null);

        // Act
        var result = module.IsRecordLimitReached(1000000);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public void IsRecordLimitReached_BelowLimit_ShouldReturnFalse()
    {
        // Arrange
        var module = CreateModule(recordLimit: 10000);

        // Act
        var result = module.IsRecordLimitReached(9999);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public void IsRecordLimitReached_AtLimit_ShouldReturnTrue()
    {
        // Arrange
        var module = CreateModule(recordLimit: 10000);

        // Act
        var result = module.IsRecordLimitReached(10000);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void IsRecordLimitReached_AboveLimit_ShouldReturnTrue()
    {
        // Arrange
        var module = CreateModule(recordLimit: 10000);

        // Act
        var result = module.IsRecordLimitReached(10001);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void CompleteModuleLifecycle_ShouldWorkCorrectly()
    {
        // Arrange & Act
        // Create a trial module with limits
        var module = TenantModules.Create(
            _tenantId,
            "Advanced Analytics",
            "ADV_ANALYTICS",
            "Advanced analytics and reporting module",
            isEnabled: false,
            configuration: "{\"charts\":true,\"export\":true}",
            userLimit: 10,
            storageLimit: 1000,
            recordLimit: 5000,
            expiryDate: DateTime.UtcNow.AddDays(30),
            isTrial: true);

        // Verify initial state
        module.IsEnabled.Should().BeFalse();
        module.IsTrial.Should().BeTrue();
        module.IsExpired().Should().BeFalse();

        // Enable the module
        module.Enable();
        module.IsEnabled.Should().BeTrue();
        module.EnabledDate.Should().NotBeNull();

        // Check limits
        module.IsUserLimitReached(5).Should().BeFalse();
        module.IsUserLimitReached(10).Should().BeTrue();
        module.IsStorageLimitReached(500).Should().BeFalse();
        module.IsStorageLimitReached(1000).Should().BeTrue();
        module.IsRecordLimitReached(4999).Should().BeFalse();
        module.IsRecordLimitReached(5000).Should().BeTrue();

        // Update configuration
        module.UpdateConfiguration("{\"charts\":true,\"export\":true,\"api\":true}");
        module.Configuration.Should().Contain("api");

        // Convert to paid
        module.ConvertToPaid();
        module.IsTrial.Should().BeFalse();

        // Extend limits for paid version
        module.UpdateLimits(100, 10000, 50000);
        module.UserLimit.Should().Be(100);
        module.StorageLimit.Should().Be(10000);
        module.RecordLimit.Should().Be(50000);

        // Extend expiry
        module.ExtendExpiry(DateTime.UtcNow.AddYears(1));
        module.ExpiryDate.Should().BeAfter(DateTime.UtcNow.AddMonths(11));

        // Disable the module
        module.Disable();
        module.IsEnabled.Should().BeFalse();
        module.DisabledDate.Should().NotBeNull();

        // Re-enable
        module.Enable();
        module.IsEnabled.Should().BeTrue();

        // Verify update timestamp is set
        module.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public void EnableDisableCycle_ShouldTrackDatesCorrectly()
    {
        // Arrange
        var module = CreateModule(isEnabled: true);
        var initialEnabledDate = module.EnabledDate;

        // Act & Assert - First disable
        module.Disable();
        module.IsEnabled.Should().BeFalse();
        module.DisabledDate.Should().NotBeNull();
        var firstDisabledDate = module.DisabledDate;

        // Re-enable
        module.Enable();
        module.IsEnabled.Should().BeTrue();
        module.EnabledDate.Should().NotBe(initialEnabledDate);
        module.DisabledDate.Should().BeNull(); // Should be cleared

        // Disable again
        module.Disable();
        module.IsEnabled.Should().BeFalse();
        module.DisabledDate.Should().NotBeNull();
        module.DisabledDate.Should().NotBe(firstDisabledDate);
    }

    private TenantModules CreateModule(
        bool isEnabled = true,
        string? configuration = null,
        int? userLimit = null,
        int? storageLimit = null,
        int? recordLimit = null,
        DateTime? expiryDate = null,
        bool isTrial = false)
    {
        return TenantModules.Create(
            _tenantId,
            ModuleName,
            ModuleCode,
            Description,
            isEnabled,
            configuration,
            userLimit,
            storageLimit,
            recordLimit,
            expiryDate,
            isTrial);
    }
}