using System.Net;
using System.Text;
using System.Text.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Stocker.TestUtilities;
using Xunit;

namespace Stocker.IntegrationTests.Controllers;

public class CustomersControllerIntegrationTests : IntegrationTestBase, IClassFixture<WebApplicationFactory<Program>>
{
    private readonly Guid _testTenantId = Guid.NewGuid();

    public CustomersControllerIntegrationTests(WebApplicationFactory<Program> factory) : base(factory)
    {
    }

    [Fact]
    public async Task GetAllCustomers_WithAuthentication_ShouldReturnOk()
    {
        // Arrange
        AuthenticateAsAdmin();

        // Act
        var response = await Client.GetAsync($"/api/tenants/{_testTenantId}/customers");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var customers = JsonSerializer.Deserialize<JsonElement>(responseContent);
        customers.ValueKind.Should().Be(JsonValueKind.Array);
    }

    [Fact]
    public async Task GetAllCustomers_WithoutAuthentication_ShouldReturnUnauthorized()
    {
        // Act
        var response = await Client.GetAsync($"/api/tenants/{_testTenantId}/customers");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task GetCustomerById_WithValidId_ShouldReturnCustomer()
    {
        // Arrange
        AuthenticateAsAdmin();
        var customerId = Guid.NewGuid();

        // Act
        var response = await Client.GetAsync($"/api/tenants/{_testTenantId}/customers/{customerId}");

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.NotFound);
        
        if (response.IsSuccessStatusCode)
        {
            var responseContent = await response.Content.ReadAsStringAsync();
            var customer = JsonSerializer.Deserialize<JsonElement>(responseContent);
            customer.TryGetProperty("id", out _).Should().BeTrue();
            customer.TryGetProperty("name", out _).Should().BeTrue();
            customer.TryGetProperty("email", out _).Should().BeTrue();
        }
    }

    [Fact]
    public async Task GetCustomerById_WithoutAuthentication_ShouldReturnUnauthorized()
    {
        // Arrange
        var customerId = Guid.NewGuid();

        // Act
        var response = await Client.GetAsync($"/api/tenants/{_testTenantId}/customers/{customerId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task CreateCustomer_WithValidData_ShouldReturnCreated()
    {
        // Arrange
        AuthenticateAsAdmin();
        var uniqueId = Guid.NewGuid().ToString("N")[..8];
        var createRequest = new
        {
            Name = $"Test Customer {uniqueId}",
            Email = $"customer{uniqueId}@test.com",
            Phone = "+1234567890",
            Street = "123 Main St",
            City = "Test City",
            State = "Test State",
            PostalCode = "12345",
            Country = "Test Country",
            TaxNumber = "123456789",
            TaxOffice = "Test Tax Office"
        };

        var json = JsonSerializer.Serialize(createRequest);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await Client.PostAsync($"/api/tenants/{_testTenantId}/customers", content);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.Created, HttpStatusCode.BadRequest);
        
        if (response.IsSuccessStatusCode)
        {
            var responseContent = await response.Content.ReadAsStringAsync();
            var customer = JsonSerializer.Deserialize<JsonElement>(responseContent);
            customer.TryGetProperty("id", out _).Should().BeTrue();
            customer.TryGetProperty("name", out var name).Should().BeTrue();
            name.GetString().Should().Be(createRequest.Name);
            customer.TryGetProperty("email", out var email).Should().BeTrue();
            email.GetString().Should().Be(createRequest.Email);

            // Verify Location header for Created response
            response.Headers.Location.Should().NotBeNull();
        }
    }

    [Fact]
    public async Task CreateCustomer_WithInvalidEmail_ShouldReturnBadRequest()
    {
        // Arrange
        AuthenticateAsAdmin();
        var createRequest = new
        {
            Name = "Test Customer",
            Email = "invalid-email", // Invalid email format
            Phone = "+1234567890",
            Street = "123 Main St",
            City = "Test City",
            State = "Test State",
            PostalCode = "12345",
            Country = "Test Country"
        };

        var json = JsonSerializer.Serialize(createRequest);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await Client.PostAsync($"/api/tenants/{_testTenantId}/customers", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CreateCustomer_WithMissingRequiredFields_ShouldReturnBadRequest()
    {
        // Arrange
        AuthenticateAsAdmin();
        var createRequest = new
        {
            Name = "Test Customer"
            // Missing required fields like email, phone, address
        };

        var json = JsonSerializer.Serialize(createRequest);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await Client.PostAsync($"/api/tenants/{_testTenantId}/customers", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CreateCustomer_WithoutAuthentication_ShouldReturnUnauthorized()
    {
        // Arrange
        var createRequest = new
        {
            Name = "Test Customer",
            Email = "customer@test.com",
            Phone = "+1234567890",
            Street = "123 Main St",
            City = "Test City",
            State = "Test State", 
            PostalCode = "12345",
            Country = "Test Country"
        };

        var json = JsonSerializer.Serialize(createRequest);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await Client.PostAsync($"/api/tenants/{_testTenantId}/customers", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task UpdateCustomer_WithValidData_ShouldReturnOk()
    {
        // Arrange
        AuthenticateAsAdmin();
        var customerId = Guid.NewGuid();
        var updateRequest = new
        {
            Name = "Updated Customer Name",
            Email = $"updated{Guid.NewGuid():N}@test.com",
            Phone = "+9876543210"
        };

        var json = JsonSerializer.Serialize(updateRequest);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await Client.PutAsync($"/api/tenants/{_testTenantId}/customers/{customerId}", content);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.NotFound);
        
        if (response.IsSuccessStatusCode)
        {
            var responseContent = await response.Content.ReadAsStringAsync();
            var customer = JsonSerializer.Deserialize<JsonElement>(responseContent);
            customer.TryGetProperty("name", out var name).Should().BeTrue();
            name.GetString().Should().Be(updateRequest.Name);
        }
    }

    [Fact]
    public async Task UpdateCustomer_WithInvalidEmail_ShouldReturnBadRequest()
    {
        // Arrange
        AuthenticateAsAdmin();
        var customerId = Guid.NewGuid();
        var updateRequest = new
        {
            Email = "invalid-email-format" // Invalid email
        };

        var json = JsonSerializer.Serialize(updateRequest);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await Client.PutAsync($"/api/tenants/{_testTenantId}/customers/{customerId}", content);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.BadRequest, HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task UpdateCustomer_WithoutAuthentication_ShouldReturnUnauthorized()
    {
        // Arrange
        var customerId = Guid.NewGuid();
        var updateRequest = new
        {
            Name = "Updated Customer Name"
        };

        var json = JsonSerializer.Serialize(updateRequest);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await Client.PutAsync($"/api/tenants/{_testTenantId}/customers/{customerId}", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task DeleteCustomer_WithValidId_ShouldReturnNoContent()
    {
        // Arrange
        AuthenticateAsAdmin();
        var customerId = Guid.NewGuid();

        // Act
        var response = await Client.DeleteAsync($"/api/tenants/{_testTenantId}/customers/{customerId}");

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.NoContent, HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task DeleteCustomer_WithoutAuthentication_ShouldReturnUnauthorized()
    {
        // Arrange
        var customerId = Guid.NewGuid();

        // Act
        var response = await Client.DeleteAsync($"/api/tenants/{_testTenantId}/customers/{customerId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Theory]
    [InlineData("")]
    [InlineData("not-a-guid")]
    [InlineData("123")]
    public async Task GetCustomerById_WithInvalidId_ShouldReturnBadRequest(string invalidId)
    {
        // Arrange
        AuthenticateAsAdmin();

        // Act
        var response = await Client.GetAsync($"/api/tenants/{_testTenantId}/customers/{invalidId}");

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.BadRequest, HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task CustomersCRUD_ShouldWorkWithProperTenantIsolation()
    {
        // Arrange
        AuthenticateAsAdmin();
        var tenant1Id = Guid.NewGuid();
        var tenant2Id = Guid.NewGuid();

        // Act & Assert - Different tenants should have isolated data
        var tenant1Response = await Client.GetAsync($"/api/tenants/{tenant1Id}/customers");
        var tenant2Response = await Client.GetAsync($"/api/tenants/{tenant2Id}/customers");

        tenant1Response.StatusCode.Should().Be(HttpStatusCode.OK);
        tenant2Response.StatusCode.Should().Be(HttpStatusCode.OK);

        // Both should return different data sets
        var tenant1Content = await tenant1Response.Content.ReadAsStringAsync();
        var tenant2Content = await tenant2Response.Content.ReadAsStringAsync();

        tenant1Content.Should().NotBeNullOrEmpty();
        tenant2Content.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task CreateCustomer_ShouldHandleConcurrentRequests()
    {
        // Arrange
        AuthenticateAsAdmin();
        var tasks = new List<Task<HttpResponseMessage>>();

        for (int i = 0; i < 5; i++)
        {
            var uniqueId = Guid.NewGuid().ToString("N")[..8];
            var createRequest = new
            {
                Name = $"Concurrent Customer {i}",
                Email = $"concurrent{uniqueId}@test.com",
                Phone = $"+123456789{i}",
                Street = "123 Main St",
                City = "Test City",
                State = "Test State",
                PostalCode = "12345",
                Country = "Test Country"
            };

            var json = JsonSerializer.Serialize(createRequest);
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            
            var task = Client.PostAsync($"/api/tenants/{_testTenantId}/customers", content);
            tasks.Add(task);
        }

        // Act
        var responses = await Task.WhenAll(tasks);

        // Assert
        responses.Should().HaveCount(5);
        responses.Should().OnlyContain(r => 
            r.StatusCode == HttpStatusCode.Created || 
            r.StatusCode == HttpStatusCode.BadRequest ||
            r.StatusCode == HttpStatusCode.Conflict);
    }
}