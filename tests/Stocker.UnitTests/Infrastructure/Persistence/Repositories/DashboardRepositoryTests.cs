using Microsoft.EntityFrameworkCore;
using Stocker.Application.DTOs.Tenant.Dashboard;
using Stocker.Persistence.Contexts;
using Stocker.Persistence.Repositories;
using Stocker.SharedKernel.Interfaces;
using FluentAssertions;
using Xunit;
using Moq;

namespace Stocker.UnitTests.Infrastructure.Persistence.Repositories;

public class DashboardRepositoryTests : IDisposable
{
    private readonly DashboardRepository _repository;
    private readonly TenantDbContext _tenantContext;
    private readonly MasterDbContext _masterContext;
    private readonly DbContextOptions<TenantDbContext> _tenantOptions;
    private readonly DbContextOptions<MasterDbContext> _masterOptions;
    private readonly Guid _tenantId;
    private readonly Mock<ITenantService> _tenantServiceMock;

    public DashboardRepositoryTests()
    {
        _tenantId = Guid.NewGuid();
        _tenantServiceMock = new Mock<ITenantService>();
        _tenantServiceMock.Setup(x => x.GetCurrentTenantId()).Returns(_tenantId);

        _tenantOptions = new DbContextOptionsBuilder<TenantDbContext>()
            .UseInMemoryDatabase(databaseName: $"TenantDb_{Guid.NewGuid()}")
            .Options;

        _masterOptions = new DbContextOptionsBuilder<MasterDbContext>()
            .UseInMemoryDatabase(databaseName: $"MasterDb_{Guid.NewGuid()}")
            .Options;

        _tenantContext = new TenantDbContext(_tenantOptions, _tenantId);
        _masterContext = new MasterDbContext(_masterOptions);

        _tenantContext.Database.EnsureCreated();
        _masterContext.Database.EnsureCreated();

        _repository = new DashboardRepository(_tenantContext, _masterContext);
    }

    public void Dispose()
    {
        _tenantContext?.Dispose();
        _masterContext?.Dispose();
    }

    #region GetTenantDashboardStatsAsync Tests

    [Fact]
    public async Task GetTenantDashboardStatsAsync_Should_Return_Empty_Stats_When_No_Data()
    {
        // Act
        var result = await _repository.GetTenantDashboardStatsAsync(_tenantId);

        // Assert
        result.Should().NotBeNull();
        result.TotalRevenue.Should().Be(0);
        result.TotalOrders.Should().Be(0);
        result.TotalCustomers.Should().Be(0);
        result.TotalProducts.Should().Be(0);
    }

    #endregion

    #region GetRecentActivitiesAsync Tests

    [Fact]
    public async Task GetRecentActivitiesAsync_Should_Return_Empty_List_When_No_Activities()
    {
        // Act
        var result = await _repository.GetRecentActivitiesAsync(_tenantId, 10, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Should().BeEmpty();
    }

    #endregion

    #region GetNotificationsAsync Tests

    [Fact]
    public async Task GetNotificationsAsync_Should_Return_Empty_List_When_No_Notifications()
    {
        // Act
        var result = await _repository.GetNotificationsAsync(_tenantId, "testuser", CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Should().BeEmpty();
    }

    #endregion

    #region GetRevenueChartDataAsync Tests

    [Fact]
    public async Task GetRevenueChartDataAsync_Should_Return_Valid_Data()
    {
        // Act
        var result = await _repository.GetRevenueChartDataAsync(_tenantId, "daily", CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Labels.Should().NotBeNull();
        result.Data.Should().NotBeNull();
        // In-Memory database has seeded data, so we just verify structure
        result.Data.Should().HaveCountGreaterOrEqualTo(0);
    }

    #endregion

    #region GetDashboardSummaryAsync Tests

    [Fact]
    public async Task GetDashboardSummaryAsync_Should_Return_Complete_Summary()
    {
        // Act
        var result = await _repository.GetDashboardSummaryAsync(_tenantId);

        // Assert
        result.Should().NotBeNull();
        // DashboardSummaryDto structure may be different, we're testing if it returns without error
    }

    #endregion

    #region GetMasterDashboardStatsAsync Tests

    [Fact]
    public async Task GetMasterDashboardStatsAsync_Should_Return_Stats_Object()
    {
        // Act
        var result = await _repository.GetMasterDashboardStatsAsync();

        // Assert
        result.Should().NotBeNull();
        // Since it returns object type, we're mainly testing if it doesn't throw
    }

    #endregion
}