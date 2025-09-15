using System.Net;
using System.Net.Http.Headers;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Stocker.TestUtilities;
using Xunit;

namespace Stocker.IntegrationTests;

public class AuthenticationTest : IntegrationTestBase, IClassFixture<WebApplicationFactory<Program>>
{
    public AuthenticationTest(WebApplicationFactory<Program> factory) : base(factory)
    {
    }

    [Fact]
    public async Task CustomerEndpoint_ShouldReturn401_WithoutAuth()
    {
        // Act
        var response = await Client.GetAsync($"/api/tenants/{Guid.NewGuid()}/customers");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task CustomerEndpoint_ShouldReturn200_WithAuth()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        Client.DefaultRequestHeaders.Authorization = 
            new AuthenticationHeaderValue("Bearer", "test-token-admin@test.com-Admin");

        // Act
        var response = await Client.GetAsync($"/api/tenants/{tenantId}/customers");

        // Assert  
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task CustomerEndpoint_ShouldReturn200_WithAuthenticateAsAdmin()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        AuthenticateAsAdmin();

        // Act
        var response = await Client.GetAsync($"/api/tenants/{tenantId}/customers");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }
}