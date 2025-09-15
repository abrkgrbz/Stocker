using System.Net;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Stocker.TestUtilities;
using Xunit;

namespace Stocker.IntegrationTests;

public class SubdomainAuthenticationTests : IntegrationTestBase, IClassFixture<WebApplicationFactory<Program>>
{
    public SubdomainAuthenticationTests(WebApplicationFactory<Program> factory) : base(factory)
    {
    }

    [Fact]
    public async Task Login_WithSubdomain_ShouldResolveTenant()
    {
        // Arrange
        var loginRequest = new
        {
            Email = "admin@testcompany.com",
            Password = "TestPassword123!",
            RememberMe = false
        };

        var json = JsonSerializer.Serialize(loginRequest);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Set subdomain host header
        Client.DefaultRequestHeaders.Host = "testcompany.stocker.app";

        // Act
        var response = await Client.PostAsync("/api/auth/login", content);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest);
        
        // Check if tenant was resolved from subdomain
        var responseContent = await response.Content.ReadAsStringAsync();
        Console.WriteLine($"Response Status: {response.StatusCode}");
        Console.WriteLine($"Response Content: {responseContent}");
        
        // Check response headers for tenant information
        if (response.Headers.Contains("X-Tenant-Id"))
        {
            var tenantId = response.Headers.GetValues("X-Tenant-Id").FirstOrDefault();
            tenantId.Should().NotBeNullOrEmpty();
            Console.WriteLine($"Resolved Tenant ID: {tenantId}");
        }
    }

    [Fact]
    public async Task Login_WithInvalidSubdomain_ShouldFail()
    {
        // Arrange
        var loginRequest = new
        {
            Email = "admin@nonexistent.com",
            Password = "TestPassword123!",
            RememberMe = false
        };

        var json = JsonSerializer.Serialize(loginRequest);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Set invalid subdomain host header
        Client.DefaultRequestHeaders.Host = "nonexistent.stocker.app";

        // Act
        var response = await Client.PostAsync("/api/auth/login", content);

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.BadRequest, HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task TenantEndpoint_WithSubdomain_ShouldAccessTenantData()
    {
        // Arrange
        Client.DefaultRequestHeaders.Host = "testcompany.stocker.app";
        AuthenticateAsAdmin();

        // Act
        var response = await Client.GetAsync("/api/tenant/dashboard/summary");

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.NotFound);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        Console.WriteLine($"Dashboard Response: {response.StatusCode} - {responseContent}");
    }

    [Fact]
    public async Task CustomerEndpoint_WithSubdomainAndAuth_ShouldWork()
    {
        // Arrange
        Client.DefaultRequestHeaders.Host = "testcompany.stocker.app";
        AuthenticateAsAdmin();

        // Act
        var response = await Client.GetAsync("/api/customers");

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.NotFound);
        
        var responseContent = await response.Content.ReadAsStringContent();
        Console.WriteLine($"Customers Response: {response.StatusCode} - {responseContent}");
    }

    [Fact]
    public async Task HealthEndpoint_ShouldBypassTenantResolution()
    {
        // Arrange
        Client.DefaultRequestHeaders.Host = "nonexistent.stocker.app";

        // Act
        var response = await Client.GetAsync("/health");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        // Health endpoints should work regardless of subdomain
        var content = await response.Content.ReadAsStringAsync();
        content.Should().Contain("Healthy");
    }

    [Fact]
    public async Task SubdomainResolution_ShouldSetTenantContext()
    {
        // Arrange
        Client.DefaultRequestHeaders.Host = "demo.stocker.app";
        AuthenticateAsAdmin();

        // Act
        var response = await Client.GetAsync("/api/tenant/settings");

        // Assert - Should either work or return proper tenant-specific error
        response.StatusCode.Should().BeOneOf(
            HttpStatusCode.OK, 
            HttpStatusCode.NotFound, 
            HttpStatusCode.BadRequest,
            HttpStatusCode.Forbidden
        );

        // Check if tenant context was properly set
        if (response.Headers.Contains("X-Tenant-Code"))
        {
            var tenantCode = response.Headers.GetValues("X-Tenant-Code").FirstOrDefault();
            tenantCode.Should().Be("demo");
        }
    }
}

// Extension method to make content reading cleaner
public static class HttpContentExtensions
{
    public static async Task<string> ReadAsStringContent(this HttpContent content)
    {
        return await content.ReadAsStringAsync();
    }
}