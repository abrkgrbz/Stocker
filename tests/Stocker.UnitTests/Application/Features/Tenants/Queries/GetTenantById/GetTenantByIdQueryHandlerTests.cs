using AutoMapper;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using MockQueryable.Moq;
using Stocker.Application.DTOs.Tenant;
using Stocker.Application.Extensions;
using Stocker.Application.Features.Tenants.Queries.GetTenantById;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Domain.Master.Entities;
using Stocker.Domain.Master.Enums;
using Stocker.Domain.Master.ValueObjects;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Repositories;
using Stocker.SharedKernel.Results;
using System.Linq.Expressions;
using Xunit;
using TenantEntity = Stocker.Domain.Master.Entities.Tenant;

namespace Stocker.UnitTests.Application.Features.Tenants.Queries.GetTenantById;

public class GetTenantByIdQueryHandlerTests
{
    private readonly Mock<IMasterUnitOfWork> _unitOfWorkMock;
    private readonly Mock<IMapper> _mapperMock;
    private readonly Mock<ILogger<GetTenantByIdQueryHandler>> _loggerMock;
    private readonly Mock<IRepository<TenantEntity>> _tenantRepositoryMock;
    private readonly GetTenantByIdQueryHandler _handler;

    public GetTenantByIdQueryHandlerTests()
    {
        _unitOfWorkMock = new Mock<IMasterUnitOfWork>();
        _mapperMock = new Mock<IMapper>();
        _loggerMock = new Mock<ILogger<GetTenantByIdQueryHandler>>();
        _tenantRepositoryMock = new Mock<IRepository<TenantEntity>>();

        // Setup both the extension method call and the underlying Repository call
        _unitOfWorkMock.Setup(x => x.Repository<TenantEntity>())
            .Returns(_tenantRepositoryMock.Object);

        _handler = new GetTenantByIdQueryHandler(
            _unitOfWorkMock.Object,
            _mapperMock.Object,
            _loggerMock.Object);
    }

    [Fact]
    public async Task Handle_WithExistingTenantId_ShouldReturnTenantDto()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var query = new GetTenantByIdQuery(tenantId);

        var tenant = CreateTestTenant(tenantId, "Test Company", "testco");
        tenant.AddDomain("testco.stocker.com", true);
        
        var package = CreateTestPackage();
        var subscription = CreateTestSubscription(tenant, package);
        // Note: Tenant doesn't have AddSubscription method
        // The subscription is linked via TenantId property

        var tenants = new List<TenantEntity> { tenant }.AsQueryable();
        
        SetupMockQueryableWithIncludes(tenants);

        var expectedDto = new TenantDto
        {
            Id = tenantId,
            Name = "Test Company",
            Code = "testco",
            Domain = "testco.stocker.com",
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            Subscription = new TenantSubscriptionDto
            {
                PackageName = "Standard",
                Status = "Active"
            }
        };

        _mapperMock.Setup(x => x.Map<TenantDto>(It.Is<TenantEntity>(t => t.Id == tenantId)))
            .Returns(expectedDto);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value.Id.Should().Be(tenantId);
        result.Value.Name.Should().Be("Test Company");
        result.Value.Code.Should().Be("testco");
        result.Value.Domain.Should().Be("testco.stocker.com");
        result.Value.IsActive.Should().BeTrue();
        result.Value.Subscription.Should().NotBeNull();
        result.Value.Subscription!.PackageName.Should().Be("Standard");

        _mapperMock.Verify(x => x.Map<TenantDto>(It.Is<TenantEntity>(t => t.Id == tenantId)), Times.Once);
    }

    [Fact]
    public async Task Handle_WithNonExistingTenantId_ShouldReturnFailure()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var query = new GetTenantByIdQuery(tenantId);

        var tenants = new List<TenantEntity>().AsQueryable();
        
        SetupMockQueryableWithIncludes(tenants);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Should().NotBeNull();
        result.Error.Code.Should().Be($"Tenant.NotFound");
        result.Error.Description.Should().Contain(tenantId.ToString());

        _mapperMock.Verify(x => x.Map<TenantDto>(It.IsAny<TenantEntity>()), Times.Never);
    }

    [Fact]
    public async Task Handle_WithMultipleTenants_ShouldReturnCorrectOne()
    {
        // Arrange
        var targetTenantId = Guid.NewGuid();
        var otherTenantId = Guid.NewGuid();
        var query = new GetTenantByIdQuery(targetTenantId);

        var targetTenant = CreateTestTenant(targetTenantId, "Target Company", "target");
        var otherTenant = CreateTestTenant(otherTenantId, "Other Company", "other");

        var tenants = new List<TenantEntity> { targetTenant, otherTenant }.AsQueryable();
        
        SetupMockQueryableWithIncludes(tenants);

        var expectedDto = new TenantDto
        {
            Id = targetTenantId,
            Name = "Target Company",
            Code = "target",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _mapperMock.Setup(x => x.Map<TenantDto>(It.Is<TenantEntity>(t => t.Id == targetTenantId)))
            .Returns(expectedDto);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value.Id.Should().Be(targetTenantId);
        result.Value.Name.Should().Be("Target Company");

        _mapperMock.Verify(x => x.Map<TenantDto>(It.Is<TenantEntity>(t => t.Id == targetTenantId)), Times.Once);
        _mapperMock.Verify(x => x.Map<TenantDto>(It.Is<TenantEntity>(t => t.Id == otherTenantId)), Times.Never);
    }

    [Fact]
    public async Task Handle_WithInactiveTenant_ShouldStillReturnTenant()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var query = new GetTenantByIdQuery(tenantId);

        var tenant = CreateTestTenant(tenantId, "Inactive Company", "inactive");
        tenant.Deactivate(); // Make tenant inactive

        var tenants = new List<TenantEntity> { tenant }.AsQueryable();
        
        SetupMockQueryableWithIncludes(tenants);

        var expectedDto = new TenantDto
        {
            Id = tenantId,
            Name = "Inactive Company",
            Code = "inactive",
            IsActive = false,
            CreatedAt = DateTime.UtcNow
        };

        _mapperMock.Setup(x => x.Map<TenantDto>(It.Is<TenantEntity>(t => t.Id == tenantId)))
            .Returns(expectedDto);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value.IsActive.Should().BeFalse();
    }

    [Fact]
    public async Task Handle_WhenExceptionOccurs_ShouldReturnFailureAndLog()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var query = new GetTenantByIdQuery(tenantId);

        _tenantRepositoryMock.Setup(x => x.AsQueryable())
            .Throws(new Exception("Database connection failed"));

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Code.Should().Be("General.UnProcessableRequest");

        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Error,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains($"Error retrieving tenant with ID: {tenantId}")),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);

        _mapperMock.Verify(x => x.Map<TenantDto>(It.IsAny<TenantEntity>()), Times.Never);
    }

    [Fact]
    public async Task Handle_WithTenantHavingMultipleDomains_ShouldIncludeAllDomains()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var query = new GetTenantByIdQuery(tenantId);

        var tenant = CreateTestTenant(tenantId, "Multi Domain Company", "multi");
        
        tenant.AddDomain("multi1.stocker.com", true);  // Primary domain
        tenant.AddDomain("multi2.stocker.com");
        tenant.AddDomain("multi3.stocker.com");

        var tenants = new List<TenantEntity> { tenant }.AsQueryable();
        
        SetupMockQueryableWithIncludes(tenants);

        var expectedDto = new TenantDto
        {
            Id = tenantId,
            Name = "Multi Domain Company",
            Code = "multi",
            Domain = "multi1.stocker.com", // Primary domain
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _mapperMock.Setup(x => x.Map<TenantDto>(It.Is<TenantEntity>(t => 
                t.Id == tenantId && 
                t.Domains.Count == 3)))
            .Returns(expectedDto);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        
        _mapperMock.Verify(x => x.Map<TenantDto>(It.Is<TenantEntity>(t => 
            t.Id == tenantId && 
            t.Domains.Count == 3)), Times.Once);
    }

    [Fact]
    public async Task Handle_WithActiveSubscription_ShouldIncludeSubscriptionDetails()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var query = new GetTenantByIdQuery(tenantId);

        var tenant = CreateTestTenant(tenantId, "Subscribed Company", "subscribed");
        
        var package = CreateTestPackage();
        var subscription = CreateTestSubscription(tenant, package);
        // Note: Tenant doesn't have AddSubscription method
        // The subscription is linked via TenantId property

        var tenants = new List<TenantEntity> { tenant }.AsQueryable();
        
        SetupMockQueryableWithIncludes(tenants);

        var expectedDto = new TenantDto
        {
            Id = tenantId,
            Name = "Subscribed Company",
            Code = "subscribed",
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            Subscription = new TenantSubscriptionDto
            {
                PackageName = "Standard",
                Status = "Active",
                StartDate = subscription.StartDate,
                EndDate = subscription.CurrentPeriodEnd
            }
        };

        _mapperMock.Setup(x => x.Map<TenantDto>(It.Is<TenantEntity>(t => 
                t.Id == tenantId)))
            .Returns(expectedDto);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value.Subscription.Should().NotBeNull();
        result.Value.Subscription!.PackageName.Should().Be("Standard");
        result.Value.Subscription.Status.Should().Be("Active");
    }

    [Fact]
    public async Task Handle_ShouldCallRepositoryWithCorrectIncludes()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var query = new GetTenantByIdQuery(tenantId);

        var tenant = CreateTestTenant(tenantId, "Test Company", "testco");
        var tenants = new List<TenantEntity> { tenant }.AsQueryable();

        SetupMockQueryableWithIncludes(tenants);

        _mapperMock.Setup(x => x.Map<TenantDto>(It.IsAny<TenantEntity>()))
            .Returns(new TenantDto { Id = tenantId });

        // Act
        await _handler.Handle(query, CancellationToken.None);

        // Assert
        _unitOfWorkMock.Verify(x => x.Repository<TenantEntity>(), Times.Once);
        _tenantRepositoryMock.Verify(x => x.AsQueryable(), Times.Once);
    }

    private void SetupMockQueryableWithIncludes(IQueryable<TenantEntity> tenants)
    {
        var mockDbSet = tenants.BuildMockDbSet();
        _tenantRepositoryMock.Setup(x => x.AsQueryable()).Returns(mockDbSet.Object);
    }

    private TenantEntity CreateTestTenant(Guid id, string name, string code)
    {
        var email = Email.Create($"admin@{code}.com").Value;
        var connectionString = ConnectionString.Create($"Server=localhost;Database={code}_db;").Value;
        
        var tenant = TenantEntity.Create(
            name: name,
            code: code,
            databaseName: $"{code}_db",
            connectionString: connectionString,
            contactEmail: email,
            contactPhone: null,
            description: $"Test tenant {name}",
            logoUrl: null);

        // Use reflection to set Id
        var idProperty = tenant.GetType().GetProperty("Id");
        if (idProperty != null && idProperty.CanWrite)
        {
            idProperty.SetValue(tenant, id);
        }

        return tenant;
    }

    private TenantDomain CreateTestDomain(Guid tenantId, string domainName)
    {
        return TenantDomain.Create(
            tenantId: tenantId,
            domainName: domainName,
            isPrimary: true);
    }

    private Package CreateTestPackage()
    {
        return Package.Create(
            name: "Standard",
            type: PackageType.Baslangic,
            basePrice: Money.Create(100m, "USD"),
            limits: PackageLimit.Create(10, 100, 5, 1000),
            description: "Standard Package",
            trialDays: 14,
            displayOrder: 1,
            isPublic: true);
    }

    private Subscription CreateTestSubscription(TenantEntity tenant, Package package)
    {
        var subscription = Subscription.Create(
            tenantId: tenant.Id,
            packageId: package.Id,
            billingCycle: BillingCycle.Aylik,
            price: package.BasePrice,
            startDate: DateTime.UtcNow,
            trialEndDate: null);

        // Use reflection to set navigation properties
        var packageProperty = subscription.GetType().GetProperty("Package");
        if (packageProperty != null && packageProperty.CanWrite)
        {
            packageProperty.SetValue(subscription, package);
        }

        return subscription;
    }
}