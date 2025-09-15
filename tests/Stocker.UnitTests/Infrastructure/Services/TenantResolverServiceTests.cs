using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Moq;
using Stocker.Application.Common.Interfaces;
using Stocker.Domain.Master.Entities;
using Stocker.Domain.Master.ValueObjects;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Infrastructure.Middleware;
using Stocker.Infrastructure.Services;
using Stocker.TestUtilities.Helpers;
using Xunit;

namespace Stocker.UnitTests.Infrastructure.Services;

public class TenantResolverServiceTests
{
    private readonly Mock<IMasterDbContext> _dbContextMock;
    private readonly IMemoryCache _memoryCache;
    private readonly Mock<ILogger<TenantResolverService>> _loggerMock;
    private readonly TenantResolverService _service;

    public TenantResolverServiceTests()
    {
        _dbContextMock = new Mock<IMasterDbContext>();
        _memoryCache = new MemoryCache(new MemoryCacheOptions());
        _loggerMock = new Mock<ILogger<TenantResolverService>>();
        _service = new TenantResolverService(_dbContextMock.Object, _memoryCache, _loggerMock.Object);
    }

    [Fact]
    public async Task GetTenantByCodeAsync_ValidCode_ReturnsTenantInfo()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var tenantCode = "testcompany";
        var tenants = new List<Tenant>
        {
            CreateTenant(tenantId, "Test Company", tenantCode, true)
        }.AsQueryable();

        var mockTenantSet = CreateMockDbSet(tenants);
        _dbContextMock.Setup(x => x.Tenants).Returns(mockTenantSet.Object);

        var domains = new List<TenantDomain>
        {
            CreateTenantDomain(tenantId, "testcompany.stocker.app", true)
        }.AsQueryable();

        var mockDomainSet = CreateMockDbSet(domains);
        _dbContextMock.Setup(x => x.TenantDomains).Returns(mockDomainSet.Object);

        // Act
        var result = await _service.GetTenantByCodeAsync(tenantCode);

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().Be(tenantId);
        result.Code.Should().Be(tenantCode);
        result.Name.Should().Be("Test Company");
        result.IsActive.Should().BeTrue();
    }

    [Fact]
    public async Task GetTenantByCodeAsync_InactiveTenant_ReturnsNull()
    {
        // Arrange
        var tenantCode = "inactive";
        var tenants = new List<Tenant>
        {
            CreateTenant(Guid.NewGuid(), "Inactive Company", tenantCode, false)
        }.AsQueryable();

        var mockTenantSet = CreateMockDbSet(tenants);
        _dbContextMock.Setup(x => x.Tenants).Returns(mockTenantSet.Object);

        // Act
        var result = await _service.GetTenantByCodeAsync(tenantCode);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetTenantByCodeAsync_NonExistentCode_ReturnsNull()
    {
        // Arrange
        var tenants = new List<Tenant>().AsQueryable();
        var mockTenantSet = CreateMockDbSet(tenants);
        _dbContextMock.Setup(x => x.Tenants).Returns(mockTenantSet.Object);

        // Act
        var result = await _service.GetTenantByCodeAsync("nonexistent");

        // Assert
        result.Should().BeNull();
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public async Task GetTenantByCodeAsync_InvalidCode_ReturnsNull(string invalidCode)
    {
        // Act
        var result = await _service.GetTenantByCodeAsync(invalidCode);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetTenantByCodeAsync_CasesInsensitive_ReturnsTenant()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var tenantCode = "TestCompany";
        var tenants = new List<Tenant>
        {
            CreateTenant(tenantId, "Test Company", tenantCode, true)
        }.AsQueryable();

        var mockTenantSet = CreateMockDbSet(tenants);
        _dbContextMock.Setup(x => x.Tenants).Returns(mockTenantSet.Object);

        var domains = new List<TenantDomain>().AsQueryable();
        var mockDomainSet = CreateMockDbSet(domains);
        _dbContextMock.Setup(x => x.TenantDomains).Returns(mockDomainSet.Object);

        // Act
        var result1 = await _service.GetTenantByCodeAsync("testcompany");
        var result2 = await _service.GetTenantByCodeAsync("TESTCOMPANY");

        // Assert
        result1.Should().NotBeNull();
        result2.Should().NotBeNull();
        result1.Id.Should().Be(result2.Id);
    }

    [Fact]
    public async Task GetTenantByCodeAsync_UsesCache_OnSecondCall()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var tenantCode = "cached";
        var tenants = new List<Tenant>
        {
            CreateTenant(tenantId, "Cached Company", tenantCode, true)
        }.AsQueryable();

        var mockTenantSet = CreateMockDbSet(tenants);
        _dbContextMock.Setup(x => x.Tenants).Returns(mockTenantSet.Object);

        var domains = new List<TenantDomain>().AsQueryable();
        var mockDomainSet = CreateMockDbSet(domains);
        _dbContextMock.Setup(x => x.TenantDomains).Returns(mockDomainSet.Object);

        // Act
        var result1 = await _service.GetTenantByCodeAsync(tenantCode);
        var result2 = await _service.GetTenantByCodeAsync(tenantCode);

        // Assert
        result1.Should().NotBeNull();
        result2.Should().NotBeNull();
        result1.Id.Should().Be(result2.Id);
        
        // Verify database was only called once (second call uses cache)
        _dbContextMock.Verify(x => x.Tenants, Times.Once);
    }

    [Fact]
    public async Task GetTenantByDomainAsync_ValidDomain_ReturnsTenantInfo()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var domain = "testcompany.stocker.app";
        
        var tenants = new List<Tenant>
        {
            CreateTenant(tenantId, "Test Company", "testcompany", true)
        }.AsQueryable();

        var domains = new List<TenantDomain>
        {
            CreateTenantDomain(tenantId, domain, true)
        }.AsQueryable();

        var mockTenantSet = CreateMockDbSet(tenants);
        var mockDomainSet = CreateMockDbSet(domains);
        
        _dbContextMock.Setup(x => x.Tenants).Returns(mockTenantSet.Object);
        _dbContextMock.Setup(x => x.TenantDomains).Returns(mockDomainSet.Object);

        // Act
        var result = await _service.GetTenantByDomainAsync(domain);

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().Be(tenantId);
        result.Domain.Should().Be(domain);
    }

    [Fact]
    public async Task GetTenantByIdAsync_ValidId_ReturnsTenantInfo()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var tenants = new List<Tenant>
        {
            CreateTenant(tenantId, "Test Company", "testcompany", true)
        }.AsQueryable();

        var mockTenantSet = CreateMockDbSet(tenants);
        _dbContextMock.Setup(x => x.Tenants).Returns(mockTenantSet.Object);

        var domains = new List<TenantDomain>
        {
            CreateTenantDomain(tenantId, "testcompany.stocker.app", true)
        }.AsQueryable();

        var mockDomainSet = CreateMockDbSet(domains);
        _dbContextMock.Setup(x => x.TenantDomains).Returns(mockDomainSet.Object);

        // Act
        var result = await _service.GetTenantByIdAsync(tenantId);

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().Be(tenantId);
        result.Name.Should().Be("Test Company");
    }

    [Fact]
    public void ClearCache_RemovesCachedTenant()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var cacheKey = $"tenant_id_{tenantId}";
        var tenantInfo = new TenantInfo 
        { 
            Id = tenantId, 
            Name = "Cached Tenant",
            Code = "cached",
            IsActive = true
        };
        
        _memoryCache.Set(cacheKey, tenantInfo);

        // Act
        _service.ClearCache(tenantId);

        // Assert
        _memoryCache.TryGetValue(cacheKey, out TenantInfo cachedValue).Should().BeFalse();
    }

    [Fact]
    public async Task GetTenantByCodeAsync_MultipleTenants_ReturnsCorrectOne()
    {
        // Arrange
        var targetId = Guid.NewGuid();
        var tenants = new List<Tenant>
        {
            CreateTenant(Guid.NewGuid(), "Company A", "companya", true),
            CreateTenant(targetId, "Company B", "companyb", true),
            CreateTenant(Guid.NewGuid(), "Company C", "companyc", true)
        }.AsQueryable();

        var mockTenantSet = CreateMockDbSet(tenants);
        _dbContextMock.Setup(x => x.Tenants).Returns(mockTenantSet.Object);

        var domains = new List<TenantDomain>().AsQueryable();
        var mockDomainSet = CreateMockDbSet(domains);
        _dbContextMock.Setup(x => x.TenantDomains).Returns(mockDomainSet.Object);

        // Act
        var result = await _service.GetTenantByCodeAsync("companyb");

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().Be(targetId);
        result.Name.Should().Be("Company B");
    }

    // Helper methods
    private static Tenant CreateTenant(Guid id, string name, string code, bool isActive)
    {
        var tenant = Tenant.Create(
            name: name,
            code: code,
            databaseName: $"DB_{code}",
            connectionString: ConnectionString.Create($"Server=.;Database=DB_{code}").Value,
            contactEmail: Email.Create($"admin@{code}.com").Value,
            contactPhone: null,
            description: null,
            logoUrl: null
        );
        
        // Use reflection to set the Id (since it's protected)
        var idProperty = typeof(Tenant).GetProperty("Id");
        idProperty?.SetValue(tenant, id);
        
        if (!isActive)
        {
            tenant.Deactivate();
        }
        
        return tenant;
    }

    private static Mock<DbSet<T>> CreateMockDbSet<T>(IQueryable<T> data) where T : class
    {
        var asyncData = AsyncQueryableTestHelper.CreateAsyncDbSet(data.AsEnumerable());
        var mockSet = new Mock<DbSet<T>>();
        
        var queryable = asyncData.AsQueryable();
        
        mockSet.As<IQueryable<T>>().Setup(m => m.Provider).Returns(queryable.Provider);
        mockSet.As<IQueryable<T>>().Setup(m => m.Expression).Returns(queryable.Expression);
        mockSet.As<IQueryable<T>>().Setup(m => m.ElementType).Returns(queryable.ElementType);
        mockSet.As<IQueryable<T>>().Setup(m => m.GetEnumerator()).Returns(() => queryable.GetEnumerator());
        
        mockSet.As<IAsyncEnumerable<T>>()
            .Setup(m => m.GetAsyncEnumerator(It.IsAny<System.Threading.CancellationToken>()))
            .Returns(asyncData.GetAsyncEnumerator);
            
        return mockSet;
    }

    private static TenantDomain CreateTenantDomain(Guid tenantId, string domainName, bool isPrimary)
    {
        var domain = TenantDomain.Create(tenantId, domainName, isPrimary);
        
        // Use reflection to set the Id (since it's protected)
        var idProperty = typeof(TenantDomain).GetProperty("Id");
        idProperty?.SetValue(domain, Guid.NewGuid());
        
        if (isPrimary)
        {
            domain.SetAsPrimary(true);
        }
        
        return domain;
    }
}