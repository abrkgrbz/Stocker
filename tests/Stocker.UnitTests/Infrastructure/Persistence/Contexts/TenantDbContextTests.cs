using Microsoft.EntityFrameworkCore;
using Stocker.Persistence.Contexts;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Interfaces;
using FluentAssertions;
using Xunit;
using Moq;

namespace Stocker.UnitTests.Infrastructure.Persistence.Contexts;

public class TenantDbContextTests : IDisposable
{
    private readonly DbContextOptions<TenantDbContext> _options;
    private readonly Mock<ITenantService> _tenantServiceMock;
    private readonly Guid _tenantId;
    private TenantDbContext? _context;

    public TenantDbContextTests()
    {
        _options = new DbContextOptionsBuilder<TenantDbContext>()
            .UseInMemoryDatabase(databaseName: $"TenantTestDb_{Guid.NewGuid()}")
            .Options;

        _tenantServiceMock = new Mock<ITenantService>();
        _tenantId = Guid.NewGuid();
        _tenantServiceMock.Setup(x => x.GetCurrentTenantId()).Returns(_tenantId);
    }

    public void Dispose()
    {
        _context?.Dispose();
    }

    #region Constructor Tests

    [Fact]
    public void TenantDbContext_Should_Initialize_With_TenantService()
    {
        // Act
        _context = new TenantDbContext(_options, _tenantServiceMock.Object);

        // Assert
        _context.Should().NotBeNull();
        _context.TenantId.Should().Be(_tenantId);
    }

    [Fact]
    public void TenantDbContext_Should_Initialize_With_Explicit_TenantId()
    {
        // Arrange
        var specificTenantId = Guid.NewGuid();

        // Act
        _context = new TenantDbContext(_options, specificTenantId);

        // Assert
        _context.Should().NotBeNull();
        _context.TenantId.Should().Be(specificTenantId);
    }

    [Fact]
    public void TenantDbContext_Should_Throw_When_TenantService_Is_Null()
    {
        // Act
        var action = () => new TenantDbContext(_options, (ITenantService)null!);

        // Assert
        action.Should().Throw<ArgumentNullException>()
            .WithParameterName("tenantService");
    }

    [Fact]
    public void TenantId_Should_Throw_When_No_TenantId_Available()
    {
        // Arrange
        var mockService = new Mock<ITenantService>();
        mockService.Setup(x => x.GetCurrentTenantId()).Returns((Guid?)null);
        _context = new TenantDbContext(_options, mockService.Object);

        // Act
        var action = () => _ = _context.TenantId;

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("TenantId is not set");
    }

    #endregion

    #region DbSet Property Tests

    [Fact]
    public void TenantDbContext_Should_Have_All_Required_DbSets()
    {
        // Arrange
        _context = new TenantDbContext(_options, _tenantId);

        // Assert - Company & Organization
        _context.Companies.Should().NotBeNull();
        _context.Departments.Should().NotBeNull();
        _context.Branches.Should().NotBeNull();

        // User & Authorization
        _context.TenantUsers.Should().NotBeNull();
        _context.Roles.Should().NotBeNull();
        _context.RolePermissions.Should().NotBeNull();
        _context.UserRoles.Should().NotBeNull();
        _context.UserPermissions.Should().NotBeNull();

        // Settings & Configuration
        _context.TenantSettings.Should().NotBeNull();
        _context.TenantModules.Should().NotBeNull();
        _context.AuditLogs.Should().NotBeNull();

        // Setup & Onboarding
        _context.SetupWizards.Should().NotBeNull();
        _context.SetupWizardSteps.Should().NotBeNull();

        // Security & Compliance
        _context.TenantSecuritySettings.Should().NotBeNull();
        _context.TenantApiKeys.Should().NotBeNull();

        // Activity & Notifications
        _context.TenantActivityLogs.Should().NotBeNull();
        _context.TenantNotifications.Should().NotBeNull();

        // Onboarding & Initial Setup
        _context.TenantSetupChecklists.Should().NotBeNull();
        _context.TenantInitialData.Should().NotBeNull();

        // User Management
        _context.UserTenants.Should().NotBeNull();

        // Phase 3 Entities
        _context.TenantWebhooks.Should().NotBeNull();
        _context.TenantCompliances.Should().NotBeNull();
        _context.TenantCustomizations.Should().NotBeNull();
        _context.TenantOnboardings.Should().NotBeNull();
        _context.OnboardingSteps.Should().NotBeNull();
        _context.OnboardingTasks.Should().NotBeNull();
        _context.TenantFeatures.Should().NotBeNull();
        _context.PasswordHistories.Should().NotBeNull();

        // Documents & Integrations
        _context.TenantDocuments.Should().NotBeNull();
        _context.TenantIntegrations.Should().NotBeNull();

        // Financial
        _context.Invoices.Should().NotBeNull();
        _context.InvoiceItems.Should().NotBeNull();
        _context.Payments.Should().NotBeNull();

        // Customer & Product Management
        _context.Customers.Should().NotBeNull();
        _context.Products.Should().NotBeNull();
    }

    #endregion

    #region Interface Implementation Tests

    [Fact]
    public void TenantDbContext_Should_Implement_Required_Interface()
    {
        // Arrange
        _context = new TenantDbContext(_options, _tenantId);

        // Assert
        _context.Should().BeAssignableTo<ITenantDbContext>();
    }

    #endregion

    #region Tenant Isolation Tests

    [Fact]
    public void Should_Use_Correct_TenantId_From_Service()
    {
        // Arrange
        var specificTenantId = Guid.NewGuid();
        var mockService = new Mock<ITenantService>();
        mockService.Setup(x => x.GetCurrentTenantId()).Returns(specificTenantId);

        // Act
        _context = new TenantDbContext(_options, mockService.Object);

        // Assert
        _context.TenantId.Should().Be(specificTenantId);
        mockService.Verify(x => x.GetCurrentTenantId(), Times.Once);
    }

    [Fact]
    public void Should_Prefer_Explicit_TenantId_Over_Service()
    {
        // Arrange
        var explicitTenantId = Guid.NewGuid();

        // Act
        _context = new TenantDbContext(_options, explicitTenantId);

        // Assert
        _context.TenantId.Should().Be(explicitTenantId);
    }

    #endregion
}