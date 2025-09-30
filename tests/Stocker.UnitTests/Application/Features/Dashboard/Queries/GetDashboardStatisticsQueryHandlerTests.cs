using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using MockQueryable.Moq;
using Stocker.Application.DTOs.Dashboard;
using Stocker.Application.Features.Dashboard.Queries.GetDashboardStatistics;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Domain.Master.Entities;
using Stocker.Domain.Master.ValueObjects;
using TenantEntity = Stocker.Domain.Master.Entities.Tenant;
using Stocker.Domain.Master.Enums;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Repositories;
using System.Linq.Expressions;
using Xunit;

namespace Stocker.UnitTests.Application.Features.Dashboard.Queries;

public class GetDashboardStatisticsQueryHandlerTests
{
    private readonly Mock<IMasterUnitOfWork> _unitOfWorkMock;
    private readonly Mock<IRepository<TenantEntity>> _tenantRepositoryMock;
    private readonly Mock<IRepository<Subscription>> _subscriptionRepositoryMock;
    private readonly Mock<IRepository<MasterUser>> _userRepositoryMock;
    private readonly GetDashboardStatisticsQueryHandler _handler;

    public GetDashboardStatisticsQueryHandlerTests()
    {
        _unitOfWorkMock = new Mock<IMasterUnitOfWork>();
        _tenantRepositoryMock = new Mock<IRepository<TenantEntity>>();
        _subscriptionRepositoryMock = new Mock<IRepository<Subscription>>();
        _userRepositoryMock = new Mock<IRepository<MasterUser>>();

        _unitOfWorkMock.Setup(x => x.Repository<TenantEntity>())
            .Returns(_tenantRepositoryMock.Object);
        _unitOfWorkMock.Setup(x => x.Repository<Subscription>())
            .Returns(_subscriptionRepositoryMock.Object);
        _unitOfWorkMock.Setup(x => x.Repository<MasterUser>())
            .Returns(_userRepositoryMock.Object);

        _handler = new GetDashboardStatisticsQueryHandler(_unitOfWorkMock.Object);
    }

    [Fact]
    public async Task Handle_WithValidData_ShouldReturnCorrectStatistics()
    {
        // Arrange
        var query = new GetDashboardStatisticsQuery();

        // Create test tenants
        var tenants = new List<TenantEntity>
        {
            CreateTestTenant("Tenant1", true),
            CreateTestTenant("Tenant2", true),
            CreateTestTenant("Tenant3", false)
        };

        // Create test subscriptions
        var package = Package.Create(
            name: "Standard",
            type: PackageType.Baslangic,
            basePrice: Money.Create(100, "USD"),
            limits: PackageLimit.Create(10, 100, 5, 1000),
            description: "Standard Package",
            trialDays: 14,
            displayOrder: 1,
            isPublic: true);

        var subscriptions = new List<Subscription>
        {
            CreateTestSubscription(tenants[0], package, SubscriptionStatus.Aktif, DateTime.UtcNow),
            CreateTestSubscription(tenants[1], package, SubscriptionStatus.Deneme, DateTime.UtcNow),
            CreateTestSubscription(tenants[2], package, SubscriptionStatus.Askida, DateTime.UtcNow.AddMonths(-2))
        };

        SetupMockQueryable(_tenantRepositoryMock, tenants.AsQueryable());
        SetupMockQueryable(_subscriptionRepositoryMock, subscriptions.AsQueryable());
        
        var users = new List<MasterUser> { };
        SetupMockQueryable(_userRepositoryMock, users.AsQueryable());

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.TotalTenants.Should().Be(3);
        result.ActiveTenants.Should().Be(2);
        result.TotalUsers.Should().Be(0);
        result.ActiveSubscriptions.Should().Be(1);
        result.TrialSubscriptions.Should().Be(1);
        result.MonthlyRevenue.Should().Be(100);
    }

    [Fact]
    public async Task Handle_WithNoData_ShouldReturnZeroStatistics()
    {
        // Arrange
        var query = new GetDashboardStatisticsQuery();

        SetupMockQueryable(_tenantRepositoryMock, new List<TenantEntity>().AsQueryable());
        SetupMockQueryable(_subscriptionRepositoryMock, new List<Subscription>().AsQueryable());
        SetupMockQueryable(_userRepositoryMock, new List<MasterUser>().AsQueryable());

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.TotalTenants.Should().Be(0);
        result.ActiveTenants.Should().Be(0);
        result.TotalUsers.Should().Be(0);
        result.ActiveSubscriptions.Should().Be(0);
        result.TrialSubscriptions.Should().Be(0);
        result.MonthlyRevenue.Should().Be(0);
        result.YearlyRevenue.Should().Be(0);
    }

    [Fact]
    public async Task Handle_ShouldCalculateRevenueCorrectly()
    {
        // Arrange
        var query = new GetDashboardStatisticsQuery();
        var currentMonth = DateTime.UtcNow.Month;
        var currentYear = DateTime.UtcNow.Year;

        var tenants = new List<TenantEntity> { CreateTestTenant("Tenant1", true) };
        
        var package = Package.Create(
            name: "Premium",
            type: PackageType.Profesyonel,
            basePrice: Money.Create(250, "USD"),
            limits: PackageLimit.Create(50, 500, 20, 10000),
            description: "Premium Package",
            trialDays: 30,
            displayOrder: 2,
            isPublic: true);

        var subscriptions = new List<Subscription>
        {
            // Current month subscription
            CreateTestSubscription(tenants[0], package, SubscriptionStatus.Aktif, 
                new DateTime(currentYear, currentMonth, 1)),
            // Last month subscription (should not be in monthly but in yearly)
            CreateTestSubscription(tenants[0], package, SubscriptionStatus.Aktif, 
                new DateTime(currentYear, Math.Max(1, currentMonth - 1), 1)),
            // Last year subscription (should not be counted)
            CreateTestSubscription(tenants[0], package, SubscriptionStatus.Aktif, 
                DateTime.UtcNow.AddYears(-1))
        };

        SetupMockQueryable(_tenantRepositoryMock, tenants.AsQueryable());
        SetupMockQueryable(_subscriptionRepositoryMock, subscriptions.AsQueryable());
        SetupMockQueryable(_userRepositoryMock, new List<MasterUser>().AsQueryable());

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.MonthlyRevenue.Should().Be(250); // Only current month
        result.YearlyRevenue.Should().Be(500); // Current month + last month
    }

    [Fact]
    public async Task Handle_ShouldIncludeRecentActivity()
    {
        // Arrange
        var query = new GetDashboardStatisticsQuery();

        var tenants = new List<TenantEntity>
        {
            CreateTestTenant("Recent Tenant 1", true, DateTime.UtcNow.AddDays(-1)),
            CreateTestTenant("Recent Tenant 2", true, DateTime.UtcNow.AddDays(-2)),
            CreateTestTenant("Old Tenant", true, DateTime.UtcNow.AddMonths(-1))
        };

        SetupMockQueryable(_tenantRepositoryMock, tenants.AsQueryable());
        SetupMockQueryable(_subscriptionRepositoryMock, new List<Subscription>().AsQueryable());
        SetupMockQueryable(_userRepositoryMock, new List<MasterUser>().AsQueryable());

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.RecentActivity.Should().NotBeNull();
        result.RecentActivity.Should().HaveCount(3);
        result.RecentActivity.First().Type.Should().Be("TenantRegistration");
        result.RecentActivity.First().EntityName.Should().Be("Recent Tenant 1");
    }

    [Fact]
    public async Task Handle_ShouldCountUsersCorrectly()
    {
        // Arrange
        var query = new GetDashboardStatisticsQuery();

        var users = new List<MasterUser>
        {
            CreateTestUser("user1"),
            CreateTestUser("user2"),
            CreateTestUser("user3")
        };

        SetupMockQueryable(_tenantRepositoryMock, new List<TenantEntity>().AsQueryable());
        SetupMockQueryable(_subscriptionRepositoryMock, new List<Subscription>().AsQueryable());
        SetupMockQueryable(_userRepositoryMock, users.AsQueryable());

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.TotalUsers.Should().Be(3);
    }

    private TenantEntity CreateTestTenant(string name, bool isActive, DateTime? createdAt = null)
    {
        // Remove spaces from name for email creation
        var emailName = name.Replace(" ", "").ToLower();
        var email = Email.Create($"{emailName}@example.com").Value;
        var connectionString = Stocker.Domain.Master.ValueObjects.ConnectionString.Create("Server=localhost;Database=TestDb;Trusted_Connection=true;").Value;
        
        var tenant = TenantEntity.Create(
            name: name,
            code: name.ToLower(),
            databaseName: $"DB_{name}",
            connectionString: connectionString,
            contactEmail: email,
            contactPhone: null,
            description: "Test tenant",
            logoUrl: null);

        if (!isActive)
        {
            tenant.Deactivate();
        }

        // Use reflection to set CreatedAt if provided
        if (createdAt.HasValue)
        {
            var createdAtProperty = tenant.GetType().GetProperty("CreatedAt");
            if (createdAtProperty != null && createdAtProperty.CanWrite)
            {
                createdAtProperty.SetValue(tenant, createdAt.Value);
            }
        }

        return tenant;
    }

    private Subscription CreateTestSubscription(TenantEntity tenant, Package package, SubscriptionStatus status, DateTime startDate)
    {
        var subscription = Subscription.Create(
            tenantId: tenant.Id,
            packageId: package.Id,
            billingCycle: BillingCycle.Aylik,
            price: package.BasePrice,
            startDate: startDate,
            trialEndDate: null);

        // Use reflection to set properties
        var statusProperty = subscription.GetType().GetProperty("Status");
        if (statusProperty != null && statusProperty.CanWrite)
        {
            statusProperty.SetValue(subscription, status);
        }

        var tenantProperty = subscription.GetType().GetProperty("Tenant");
        if (tenantProperty != null && tenantProperty.CanWrite)
        {
            tenantProperty.SetValue(subscription, tenant);
        }

        var packageProperty = subscription.GetType().GetProperty("Package");
        if (packageProperty != null && packageProperty.CanWrite)
        {
            packageProperty.SetValue(subscription, package);
        }

        var priceProperty = subscription.GetType().GetProperty("Price");
        if (priceProperty != null && priceProperty.CanWrite)
        {
            priceProperty.SetValue(subscription, package.BasePrice);
        }

        var currentPeriodStartProperty = subscription.GetType().GetProperty("CurrentPeriodStart");
        if (currentPeriodStartProperty != null && currentPeriodStartProperty.CanWrite)
        {
            currentPeriodStartProperty.SetValue(subscription, startDate);
        }

        return subscription;
    }

    private MasterUser CreateTestUser(string username)
    {
        var email = Email.Create($"{username}@example.com").Value;
        return MasterUser.Create(
            username: username,
            email: email,
            plainPassword: "Password123!",
            firstName: "Test",
            lastName: "User",
            userType: UserType.Personel,
            phoneNumber: null);
    }

    private void SetupMockQueryable<T>(Mock<IRepository<T>> repositoryMock, IQueryable<T> data) where T : Stocker.SharedKernel.Primitives.Entity<Guid>
    {
        var mockDbSet = data.BuildMockDbSet();
        repositoryMock.Setup(x => x.AsQueryable()).Returns(mockDbSet.Object);
    }

}