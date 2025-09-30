using Microsoft.EntityFrameworkCore;
using Stocker.Persistence.Contexts;
using Stocker.Application.Common.Interfaces;
using FluentAssertions;
using Xunit;

namespace Stocker.UnitTests.Infrastructure.Persistence.Contexts;

public class MasterDbContextTests : IDisposable
{
    private readonly MasterDbContext _context;
    private readonly DbContextOptions<MasterDbContext> _options;

    public MasterDbContextTests()
    {
        _options = new DbContextOptionsBuilder<MasterDbContext>()
            .UseInMemoryDatabase(databaseName: $"MasterTestDb_{Guid.NewGuid()}")
            .Options;

        _context = new MasterDbContext(_options);
        _context.Database.EnsureCreated();
    }

    public void Dispose()
    {
        _context?.Dispose();
    }

    #region DbSet Property Tests

    [Fact]
    public void MasterDbContext_Should_Have_All_Required_DbSets()
    {
        // Tenant Management DbSets
        _context.Tenants.Should().NotBeNull();
        _context.TenantDomains.Should().NotBeNull();
        _context.TenantHealthChecks.Should().NotBeNull();
        _context.TenantBackups.Should().NotBeNull();
        _context.TenantLimits.Should().NotBeNull();

        // Tenant Registration & Contracts DbSets
        _context.TenantRegistrations.Should().NotBeNull();
        _context.TenantContracts.Should().NotBeNull();
        _context.TenantBillings.Should().NotBeNull();

        // Package & Subscription DbSets
        _context.Packages.Should().NotBeNull();
        _context.PackageFeatures.Should().NotBeNull();
        _context.PackageModules.Should().NotBeNull();
        _context.Subscriptions.Should().NotBeNull();
        _context.SubscriptionModules.Should().NotBeNull();
        _context.SubscriptionUsages.Should().NotBeNull();

        // Billing & Payment DbSets
        _context.Invoices.Should().NotBeNull();
        _context.InvoiceItems.Should().NotBeNull();
        _context.Payments.Should().NotBeNull();

        // User Management DbSets
        _context.MasterUsers.Should().NotBeNull();
        _context.UserLoginHistories.Should().NotBeNull();

        // System Settings DbSet
        _context.SystemSettings.Should().NotBeNull();
    }

    #endregion

    #region Configuration Tests

    [Fact]
    public void MasterDbContext_Should_Have_Default_Schema_Set_To_Master()
    {
        // Arrange & Act
        var model = _context.Model;
        var defaultSchema = model.GetDefaultSchema();

        // Assert
        defaultSchema.Should().Be("master");
    }

    #endregion

    #region Interface Implementation Tests

    [Fact]
    public void MasterDbContext_Should_Implement_Required_Interfaces()
    {
        // Assert
        _context.Should().BeAssignableTo<IMasterDbContext>();
        _context.Should().BeAssignableTo<IApplicationDbContext>();
    }

    #endregion
}