using Xunit;
using Moq;
using FluentAssertions;
using Stocker.Application.Features.Dashboard.Queries.GetDashboardStatistics;
using Stocker.SharedKernel.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.Domain.Master.Entities;
using Stocker.Domain.Master.ValueObjects;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Domain.Master.Enums;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MockQueryable.Moq;

namespace Stocker.UnitTests.Application.Features.Dashboard;

public class GetDashboardStatisticsQueryHandlerTests
{
    private readonly Mock<IMasterUnitOfWork> _unitOfWorkMock;
    private readonly GetDashboardStatisticsQueryHandler _handler;

    public GetDashboardStatisticsQueryHandlerTests()
    {
        _unitOfWorkMock = new Mock<IMasterUnitOfWork>();
        _handler = new GetDashboardStatisticsQueryHandler(_unitOfWorkMock.Object);
    }

    [Fact]
    public async Task Handle_Should_Return_DashboardStatisticsDto_With_Empty_Data()
    {
        // Arrange
        var query = new GetDashboardStatisticsQuery();

        // Mock empty repositories
        var mockTenants = Array.Empty<Stocker.Domain.Master.Entities.Tenant>().AsQueryable().BuildMockDbSet();
        var mockSubscriptions = Array.Empty<Subscription>().AsQueryable().BuildMockDbSet();
        var mockUsers = Array.Empty<MasterUser>().AsQueryable().BuildMockDbSet();

        var tenantRepoMock = new Mock<IRepository<Stocker.Domain.Master.Entities.Tenant>>();
        tenantRepoMock.Setup(x => x.AsQueryable()).Returns(mockTenants.Object);

        var subscriptionRepoMock = new Mock<IRepository<Subscription>>();
        subscriptionRepoMock.Setup(x => x.AsQueryable()).Returns(mockSubscriptions.Object);

        var userRepoMock = new Mock<IRepository<MasterUser>>();
        userRepoMock.Setup(x => x.AsQueryable()).Returns(mockUsers.Object);

        _unitOfWorkMock.Setup(x => x.Repository<Stocker.Domain.Master.Entities.Tenant>()).Returns(tenantRepoMock.Object);
        _unitOfWorkMock.Setup(x => x.Repository<Subscription>()).Returns(subscriptionRepoMock.Object);
        _unitOfWorkMock.Setup(x => x.Repository<MasterUser>()).Returns(userRepoMock.Object);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.TotalTenants.Should().Be(0);
        result.ActiveTenants.Should().Be(0);
        result.TotalUsers.Should().Be(0);
    }

    [Fact]
    public async Task Handle_Should_Return_Correct_Statistics_With_Data()
    {
        // Arrange
        var query = new GetDashboardStatisticsQuery();

        var email = Email.Create("test@example.com").Value!;
        var connectionString = ConnectionString.Create("Server=test;Database=test;").Value!;

        var tenant1 = Stocker.Domain.Master.Entities.Tenant.Create("Test Company 1", "TEST1", "testdb1", connectionString, email);
        var tenant2 = Stocker.Domain.Master.Entities.Tenant.Create("Test Company 2", "TEST2", "testdb2", connectionString, email);

        var packageLimits = PackageLimit.Create(100, 1000, 10, 5000);
        var basePrice = Money.Create(100m, "TRY");
        var package = Package.Create(
            "Basic Package",
            PackageType.Baslangic,
            basePrice,
            packageLimits
        );

        var subscription1 = Subscription.Create(
            tenant1.Id, package.Id,
            BillingCycle.Aylik, Money.Create(100m, "TRY"),
            DateTime.UtcNow  // No trial date = Aktif status
        );

        // Set Tenant navigation property using reflection (for GetRecentActivity)
        typeof(Subscription).GetProperty("Tenant")!
            .SetValue(subscription1, tenant1);

        var user = MasterUser.Create("testuser", email, "Password123!", "Test", "User", UserType.Personel);

        var mockTenants = new[] { tenant1, tenant2 }.AsQueryable().BuildMockDbSet();
        var mockSubscriptions = new[] { subscription1 }.AsQueryable().BuildMockDbSet();
        var mockUsers = new[] { user }.AsQueryable().BuildMockDbSet();

        var tenantRepoMock = new Mock<IRepository<Stocker.Domain.Master.Entities.Tenant>>();
        tenantRepoMock.Setup(x => x.AsQueryable()).Returns(mockTenants.Object);

        var subscriptionRepoMock = new Mock<IRepository<Subscription>>();
        subscriptionRepoMock.Setup(x => x.AsQueryable()).Returns(mockSubscriptions.Object);

        var userRepoMock = new Mock<IRepository<MasterUser>>();
        userRepoMock.Setup(x => x.AsQueryable()).Returns(mockUsers.Object);

        _unitOfWorkMock.Setup(x => x.Repository<Stocker.Domain.Master.Entities.Tenant>()).Returns(tenantRepoMock.Object);
        _unitOfWorkMock.Setup(x => x.Repository<Subscription>()).Returns(subscriptionRepoMock.Object);
        _unitOfWorkMock.Setup(x => x.Repository<MasterUser>()).Returns(userRepoMock.Object);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.TotalTenants.Should().Be(2);
        result.ActiveTenants.Should().Be(2);
        result.TotalUsers.Should().Be(1);
        result.ActiveSubscriptions.Should().Be(1);
    }

    [Fact]
    public async Task Handle_Should_Call_All_Repositories()
    {
        // Arrange
        var query = new GetDashboardStatisticsQuery();

        var mockTenants = Array.Empty<Stocker.Domain.Master.Entities.Tenant>().AsQueryable().BuildMockDbSet();
        var mockSubscriptions = Array.Empty<Subscription>().AsQueryable().BuildMockDbSet();
        var mockUsers = Array.Empty<MasterUser>().AsQueryable().BuildMockDbSet();

        var tenantRepoMock = new Mock<IRepository<Stocker.Domain.Master.Entities.Tenant>>();
        tenantRepoMock.Setup(x => x.AsQueryable()).Returns(mockTenants.Object);

        var subscriptionRepoMock = new Mock<IRepository<Subscription>>();
        subscriptionRepoMock.Setup(x => x.AsQueryable()).Returns(mockSubscriptions.Object);

        var userRepoMock = new Mock<IRepository<MasterUser>>();
        userRepoMock.Setup(x => x.AsQueryable()).Returns(mockUsers.Object);

        _unitOfWorkMock.Setup(x => x.Repository<Stocker.Domain.Master.Entities.Tenant>()).Returns(tenantRepoMock.Object);
        _unitOfWorkMock.Setup(x => x.Repository<Subscription>()).Returns(subscriptionRepoMock.Object);
        _unitOfWorkMock.Setup(x => x.Repository<MasterUser>()).Returns(userRepoMock.Object);

        // Act
        await _handler.Handle(query, CancellationToken.None);

        // Assert
        _unitOfWorkMock.Verify(x => x.Repository<Stocker.Domain.Master.Entities.Tenant>(), Times.AtLeastOnce);
        _unitOfWorkMock.Verify(x => x.Repository<Subscription>(), Times.AtLeastOnce);
        _unitOfWorkMock.Verify(x => x.Repository<MasterUser>(), Times.AtLeastOnce);
    }
}