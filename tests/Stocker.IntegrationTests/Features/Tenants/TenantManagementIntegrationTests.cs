using FluentAssertions;
using System.Net;
using System.Net.Http.Json;
using Stocker.IntegrationTests.DTOs;
using Stocker.IntegrationTests.Common;
using Stocker.Domain.Master.Enums;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Stocker.IntegrationTests.Features.Tenants;

public class TenantManagementIntegrationTests : SimplifiedIntegrationTestBase
{
    private readonly TestDataBuilder _testDataBuilder;

    public TenantManagementIntegrationTests()
    {
        _testDataBuilder = new TestDataBuilder();
    }

    [Fact]
    public async Task CreateTenant_WithValidData_ShouldCreateSuccessfully()
    {
        // Arrange
        AuthenticateAsAdmin(); // Add authentication
        
        var package = _testDataBuilder.CreatePackage(isActive: true);
        await AddAsync(package);

        var createRequest = new
        {
            Name = "Test Company",
            Code = "testco",
            ContactEmail = "admin@testco.com",
            ContactPhone = "+905551234567",
            PackageId = package.Id,
            BillingCycle = "Aylik",
            Domain = "testco.stocker.app"
        };

        // Act
        var response = await Client.PostAsJsonAsync("/api/master/tenants", createRequest);

        // Assert - 201 Created is correct for POST that creates a resource
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        
        var apiResponse = await response.Content.ReadFromJsonAsync<ApiResponseWrapper<TenantDto>>();
        apiResponse.Should().NotBeNull();
        apiResponse!.Data.Should().NotBeNull();
        var result = apiResponse.Data!;
        result.Name.Should().Be("Test Company");
        result.Code.Should().Be("testco");
        result.IsActive.Should().BeTrue();

        // Verify tenant and subscription were created
        var createdTenant = await FindAsync<Stocker.Domain.Master.Entities.Tenant>(result.Id);
        createdTenant.Should().NotBeNull();
        
        var subscriptions = MasterDbContext.Subscriptions
            .Where(s => s.TenantId == result.Id)
            .ToList();
        subscriptions.Should().HaveCount(1);
    }

    [Fact]
    public async Task GetTenantById_WithValidId_ShouldReturnTenant()
    {
        // Arrange
        AuthenticateAsAdmin(); // Add authentication
        
        var tenant = _testDataBuilder.CreateTenant();
        await AddAsync(tenant);

        // Act
        var response = await Client.GetAsync($"/api/master/tenants/{tenant.Id}");

        // Assert
        if (response.StatusCode != HttpStatusCode.OK)
        {
            var content = await response.Content.ReadAsStringAsync();
            Console.WriteLine($"Response: {response.StatusCode} - {content}");
            Console.WriteLine($"Headers: {string.Join(", ", response.Headers.Select(h => $"{h.Key}: {string.Join(", ", h.Value)}"))}");
        }
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var apiResponse = await response.Content.ReadFromJsonAsync<ApiResponseWrapper<TenantDto>>();
        apiResponse.Should().NotBeNull();
        apiResponse!.Data.Should().NotBeNull();
        apiResponse.Data!.Id.Should().Be(tenant.Id);
        apiResponse.Data.Name.Should().Be(tenant.Name);
        apiResponse.Data.Code.Should().Be(tenant.Code);
    }

    [Fact]
    public async Task GetAllTenants_ShouldReturnPaginatedList()
    {
        // Arrange
        AuthenticateAsAdmin(); // Add authentication

        var tenants = new List<Stocker.Domain.Master.Entities.Tenant>();
        for (int i = 0; i < 15; i++)
        {
            var tenant = _testDataBuilder.CreateTenant(
                name: $"Company {i:D2}",
                code: $"comp{i:D2}");  // Changed to lowercase
            tenants.Add(tenant);
            await AddAsync(tenant);
        }

        // Act
        var response = await Client.GetAsync("/api/master/tenants?pageNumber=1&pageSize=10");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var apiResponse = await response.Content.ReadFromJsonAsync<ApiResponseWrapper<List<TenantListDto>>>();
        apiResponse.Should().NotBeNull();
        apiResponse!.Data.Should().NotBeNull();
        var result = apiResponse.Data!;
        result.Should().HaveCountGreaterThan(0);
        result.Should().HaveCountLessOrEqualTo(10); // Page size limit
    }

    [Fact]
    public async Task UpdateTenant_WithValidData_ShouldUpdateSuccessfully()
    {
        // Arrange
        AuthenticateAsAdmin(); // Add authentication
        
        var tenant = _testDataBuilder.CreateTenant(name: "Old Name");
        await AddAsync(tenant);

        var updateRequest = new
        {
            Id = tenant.Id,
            Name = "New Name",
            ContactEmail = "newemail@example.com",
            ContactPhone = "+905559876543",
            Description = "Updated description"
        };

        // Act
        var response = await Client.PutAsJsonAsync($"/api/master/tenants/{tenant.Id}", updateRequest);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        // Verify tenant was updated
        var updatedTenant = await FindAsync<Stocker.Domain.Master.Entities.Tenant>(tenant.Id);
        updatedTenant.Should().NotBeNull();
        updatedTenant!.Name.Should().Be("New Name");
        updatedTenant.ContactEmail.Value.Should().Be("newemail@example.com");
    }

    [Fact]
    public async Task ToggleTenantStatus_ShouldChangeActiveState()
    {
        // Arrange
        AuthenticateAsAdmin(); // Add authentication
        
        var tenant = _testDataBuilder.CreateTenant(isActive: true);
        await AddAsync(tenant);

        // Act - Deactivate
        var deactivateResponse = await Client.PostAsync($"/api/master/tenants/{tenant.Id}/toggle-status", null);

        // Assert
        deactivateResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var deactivatedTenant = await FindAsync<Stocker.Domain.Master.Entities.Tenant>(tenant.Id);
        deactivatedTenant!.IsActive.Should().BeFalse();

        // Act - Reactivate
        var activateResponse = await Client.PostAsync($"/api/master/tenants/{tenant.Id}/toggle-status", null);

        // Assert
        activateResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var activatedTenant = await FindAsync<Stocker.Domain.Master.Entities.Tenant>(tenant.Id);
        activatedTenant!.IsActive.Should().BeTrue();
    }

    [Fact]
    public async Task DeleteTenant_WithValidId_ShouldDeactivateTenant()
    {
        // Arrange
        AuthenticateAsAdmin(); // Add authentication
        
        var tenant = _testDataBuilder.CreateTenant(isActive: true);
        await AddAsync(tenant);

        // Act
        var response = await Client.DeleteAsync($"/api/master/tenants/{tenant.Id}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        // Verify tenant is deactivated
        var deactivatedTenant = await FindAsync<Stocker.Domain.Master.Entities.Tenant>(tenant.Id);
        
        deactivatedTenant.Should().NotBeNull();
        deactivatedTenant!.IsActive.Should().BeFalse();
    }

    [Fact]
    public async Task CreateTenant_WithDuplicateCode_ShouldReturnBadRequest()
    {
        // Arrange
        AuthenticateAsAdmin(); // Add authentication
        
        var existingTenant = _testDataBuilder.CreateTenant(code: "existing");
        await AddAsync(existingTenant);

        var package = _testDataBuilder.CreatePackage();
        await AddAsync(package);

        var createRequest = new
        {
            Name = "Another Company",
            Code = "existing", // Duplicate code
            ContactEmail = "admin@another.com",
            PackageId = package.Id,
            BillingCycle = "Aylik"
        };

        // Act
        var response = await Client.PostAsJsonAsync("/api/master/tenants", createRequest);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task GetTenantStatistics_ShouldReturnCorrectData()
    {
        // Arrange
        AuthenticateAsAdmin(); // Add authentication
        
        var tenant = _testDataBuilder.CreateTenant();
        var package = _testDataBuilder.CreatePackage();
        var subscription = _testDataBuilder.CreateSubscription(tenant, package);
        
        await AddAsync(tenant);
        await AddAsync(package);
        await AddAsync(subscription);

        // Create some master users for the tenant (instead of tenant-specific data)
        for (int i = 0; i < 5; i++)
        {
            var user = _testDataBuilder.CreateMasterUser($"user{i}", $"user{i}@example.com");
            await AddAsync(user);
        }

        // Act
        var response = await Client.GetAsync($"/api/master/tenants/{tenant.Id}/statistics");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var apiResponse = await response.Content.ReadFromJsonAsync<ApiResponseWrapper<TenantStatisticsDto>>();
        apiResponse.Should().NotBeNull();
        apiResponse!.Data.Should().NotBeNull();
        var result = apiResponse.Data!;
        result.UserCount.Should().Be(5);
        result.ActiveSubscription.Should().BeTrue();
        result.PackageName.Should().Be(package.Name);
    }
}