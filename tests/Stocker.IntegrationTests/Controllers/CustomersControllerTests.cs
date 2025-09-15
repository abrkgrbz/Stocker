using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Stocker.Application.Common.Interfaces;
using Stocker.Domain.Master.Entities;
using Stocker.Domain.Tenant.Entities;
using Stocker.IntegrationTests.DTOs;
using Stocker.Persistence.Contexts;
using Stocker.TestUtilities;
using Xunit;

namespace Stocker.IntegrationTests.Controllers;

public class CustomersControllerTests : IntegrationTestBase, IClassFixture<WebApplicationFactory<Program>>
{
    private readonly Guid _tenantId;
    private readonly MasterUser _testUser;
    private readonly Tenant _testTenant;
    private readonly MasterDbContext _masterDbContext;

    public CustomersControllerTests(WebApplicationFactory<Program> factory) : base(factory)
    {
        // Setup test data
        _testTenant = TestDataBuilder.Master.CreateTenant("Test Company");
        _testUser = TestDataBuilder.Master.CreateUser("admin@test.com");
        _tenantId = _testTenant.Id;

        // Get master database context
        _masterDbContext = GetMasterDbContext();
        
        // Seed master database
        _masterDbContext.Tenants.Add(_testTenant);
        _masterDbContext.MasterUsers.Add(_testUser);
        _masterDbContext.SaveChanges();
    }

    [Fact]
    public async Task GetAll_ShouldReturnEmptyList_WhenNoCustomers()
    {
        // Arrange
        AuthenticateAsAdmin();

        // Act
        var response = await Client.GetAsync($"/api/tenants/{_tenantId}/customers");

        // Assert - Show error details if failed
        if (response.StatusCode != HttpStatusCode.OK)
        {
            var errorContent = await response.Content.ReadAsStringAsync();
            // Try to deserialize the error to get more details
            try
            {
                var errorObj = System.Text.Json.JsonSerializer.Deserialize<System.Text.Json.JsonElement>(errorContent);
                if (errorObj.TryGetProperty("details", out var details))
                {
                    throw new Exception($"API returned {response.StatusCode}. Details: {details.GetString()}");
                }
            }
            catch { }
            throw new Exception($"API returned {response.StatusCode}: {errorContent}");
        }
        
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var customers = await response.Content.ReadFromJsonAsync<List<CustomerDto>>();
        customers.Should().BeEmpty();
    }

    [Fact]
    public async Task GetAll_ShouldReturnCustomers_WhenCustomersExist()
    {
        // Arrange
        AuthenticateAsAdmin();
        
        // Create tenant database context
        var tenantDbContext = CreateTenantDbContext();
        var customer1 = TestDataBuilder.TenantData.CreateCustomer(_tenantId, "Customer 1");
        var customer2 = TestDataBuilder.TenantData.CreateCustomer(_tenantId, "Customer 2");
        
        tenantDbContext.Customers.AddRange(customer1, customer2);
        await tenantDbContext.SaveChangesAsync();

        // Act
        var response = await Client.GetAsync($"/api/tenants/{_tenantId}/customers");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var customers = await response.Content.ReadFromJsonAsync<List<CustomerDto>>();
        customers.Should().HaveCount(2);
        customers.Should().Contain(c => c.Name == "Customer 1");
        customers.Should().Contain(c => c.Name == "Customer 2");
    }

    [Fact]
    public async Task GetById_ShouldReturnCustomer_WhenCustomerExists()
    {
        // Arrange
        AuthenticateAsAdmin();
        
        var tenantDbContext = CreateTenantDbContext();
        var customer = TestDataBuilder.TenantData.CreateCustomer(_tenantId, "Test Customer");
        tenantDbContext.Customers.Add(customer);
        await tenantDbContext.SaveChangesAsync();

        // Act
        var response = await Client.GetAsync($"/api/tenants/{_tenantId}/customers/{customer.Id}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<CustomerDto>();
        result.Should().NotBeNull();
        result!.Name.Should().Be("Test Customer");
        result.Id.Should().Be(customer.Id);
    }

    [Fact]
    public async Task GetById_ShouldReturnNotFound_WhenCustomerDoesNotExist()
    {
        // Arrange
        AuthenticateAsAdmin();
        var nonExistentId = Guid.NewGuid();

        // Act
        var response = await Client.GetAsync($"/api/tenants/{_tenantId}/customers/{nonExistentId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task Create_ShouldCreateCustomer_WithValidData()
    {
        // Arrange
        AuthenticateAsAdmin();
        
        var createDto = new CreateCustomerDto
        {
            Name = "New Customer",
            Email = "newcustomer@test.com",
            Phone = "+905551234567",
            Street = "123 Main St",
            City = "Istanbul",
            State = "Istanbul",
            PostalCode = "34000",
            Country = "Turkey"
        };

        // Act
        var response = await Client.PostAsJsonAsync($"/api/tenants/{_tenantId}/customers", createDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        
        var result = await response.Content.ReadFromJsonAsync<CustomerDto>();
        result.Should().NotBeNull();
        result!.Name.Should().Be("New Customer");
        result.Email.Should().Be("newcustomer@test.com");
        
        // Verify in database
        var tenantDbContext = CreateTenantDbContext();
        var customer = await tenantDbContext.Customers
            .FirstOrDefaultAsync(c => c.Id == result.Id);
        customer.Should().NotBeNull();
    }

    [Fact]
    public async Task Create_ShouldReturnBadRequest_WithInvalidEmail()
    {
        // Arrange
        AuthenticateAsAdmin();
        
        var createDto = new CreateCustomerDto
        {
            Name = "New Customer",
            Email = "invalid-email", // Invalid email
            Phone = "+905551234567",
            Street = "123 Main St",
            City = "Istanbul",
            State = "Istanbul",
            PostalCode = "34000",
            Country = "Turkey"
        };

        // Act
        var response = await Client.PostAsJsonAsync($"/api/tenants/{_tenantId}/customers", createDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Update_ShouldUpdateCustomer_WithValidData()
    {
        // Arrange
        AuthenticateAsAdmin();
        
        var tenantDbContext = CreateTenantDbContext();
        var customer = TestDataBuilder.TenantData.CreateCustomer(_tenantId, "Original Name");
        tenantDbContext.Customers.Add(customer);
        await tenantDbContext.SaveChangesAsync();

        var updateDto = new UpdateCustomerDto
        {
            Name = "Updated Name",
            Email = "updated@test.com",
            Phone = "+905559876543"
        };

        // Act
        var response = await Client.PutAsJsonAsync($"/api/tenants/{_tenantId}/customers/{customer.Id}", updateDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var result = await response.Content.ReadFromJsonAsync<CustomerDto>();
        result.Should().NotBeNull();
        result!.Name.Should().Be("Updated Name");
        result.Email.Should().Be("updated@test.com");
    }

    [Fact]
    public async Task Delete_ShouldDeleteCustomer_WhenCustomerExists()
    {
        // Arrange
        AuthenticateAsAdmin();
        
        var tenantDbContext = CreateTenantDbContext();
        var customer = TestDataBuilder.TenantData.CreateCustomer(_tenantId, "To Delete");
        tenantDbContext.Customers.Add(customer);
        await tenantDbContext.SaveChangesAsync();

        // Act
        var response = await Client.DeleteAsync($"/api/tenants/{_tenantId}/customers/{customer.Id}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NoContent);
        
        // Verify deletion
        tenantDbContext = CreateTenantDbContext();
        var deletedCustomer = await tenantDbContext.Customers
            .FirstOrDefaultAsync(c => c.Id == customer.Id);
        deletedCustomer.Should().BeNull();
    }

    [Fact]
    public async Task Delete_ShouldReturnNotFound_WhenCustomerDoesNotExist()
    {
        // Arrange
        AuthenticateAsAdmin();
        var nonExistentId = Guid.NewGuid();

        // Act
        var response = await Client.DeleteAsync($"/api/tenants/{_tenantId}/customers/{nonExistentId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task GetAll_ShouldReturnUnauthorized_WithoutAuthentication()
    {
        // Act
        var response = await Client.GetAsync($"/api/tenants/{_tenantId}/customers");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    private TenantDbContext CreateTenantDbContext()
    {
        // Use the same factory that the controllers use
        var factory = Services.GetRequiredService<ITenantDbContextFactory>();
        return (TenantDbContext)factory.CreateDbContext(_tenantId);
    }
    
    private MasterDbContext GetMasterDbContext()
    {
        var options = new DbContextOptionsBuilder<MasterDbContext>()
            .UseInMemoryDatabase($"MasterDb_{Guid.NewGuid()}")
            .Options;
        
        return new MasterDbContext(options);
    }
}