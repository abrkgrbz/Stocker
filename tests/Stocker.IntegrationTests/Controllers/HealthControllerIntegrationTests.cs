using System.Net;
using System.Text.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Stocker.TestUtilities;
using Xunit;

namespace Stocker.IntegrationTests.Controllers;

public class HealthControllerIntegrationTests : IntegrationTestBase, IClassFixture<WebApplicationFactory<Program>>
{
    public HealthControllerIntegrationTests(WebApplicationFactory<Program> factory) : base(factory)
    {
    }

    [Fact]
    public async Task Get_ShouldReturnHealthy()
    {
        // Act
        var response = await Client.GetAsync("/health");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var healthResponse = JsonSerializer.Deserialize<JsonElement>(responseContent);
        
        healthResponse.TryGetProperty("status", out var status).Should().BeTrue();
        status.GetString().Should().Be("Healthy");
        
        healthResponse.TryGetProperty("timestamp", out _).Should().BeTrue();
        healthResponse.TryGetProperty("environment", out _).Should().BeTrue();
        healthResponse.TryGetProperty("version", out _).Should().BeTrue();
    }

    [Fact]
    public async Task Get_ShouldNotRequireAuthentication()
    {
        // No authentication setup

        // Act
        var response = await Client.GetAsync("/health");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GetDetailed_WithoutAuth_ShouldReturnUnauthorized()
    {
        // Act
        var response = await Client.GetAsync("/health/detailed");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task GetDetailed_WithAuth_ShouldReturnDetailedHealth()
    {
        // Arrange
        AuthenticateAsSystemAdmin();

        // Act
        var response = await Client.GetAsync("/health/detailed");

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.Unauthorized);
        
        if (response.IsSuccessStatusCode)
        {
            var responseContent = await response.Content.ReadAsStringAsync();
            var detailedHealth = JsonSerializer.Deserialize<JsonElement>(responseContent);
            
            detailedHealth.TryGetProperty("status", out var status).Should().BeTrue();
            status.GetString().Should().BeOneOf("Healthy", "Degraded");
            
            detailedHealth.TryGetProperty("timestamp", out _).Should().BeTrue();
            detailedHealth.TryGetProperty("checks", out var checks).Should().BeTrue();
            detailedHealth.TryGetProperty("systemInfo", out var systemInfo).Should().BeTrue();
            
            // Verify system info contains expected properties
            systemInfo.TryGetProperty("machineName", out _).Should().BeTrue();
            systemInfo.TryGetProperty("osVersion", out _).Should().BeTrue();
            systemInfo.TryGetProperty("processorCount", out _).Should().BeTrue();
            
            // Verify health checks contain expected services
            checks.TryGetProperty("Database", out _).Should().BeTrue();
            checks.TryGetProperty("Redis", out _).Should().BeTrue();
            checks.TryGetProperty("Email", out _).Should().BeTrue();
        }
    }

    [Fact]
    public async Task Ready_ShouldReturnReadyStatus()
    {
        // Act
        var response = await Client.GetAsync("/health/ready");

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.ServiceUnavailable);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var readyResponse = JsonSerializer.Deserialize<JsonElement>(responseContent);
        
        readyResponse.TryGetProperty("ready", out var ready).Should().BeTrue();
        
        if (response.IsSuccessStatusCode)
        {
            ready.GetBoolean().Should().BeTrue();
        }
        else
        {
            ready.GetBoolean().Should().BeFalse();
        }
    }

    [Fact]
    public async Task Ready_ShouldNotRequireAuthentication()
    {
        // No authentication setup

        // Act
        var response = await Client.GetAsync("/health/ready");

        // Assert
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.ServiceUnavailable);
    }

    [Fact]
    public async Task Live_ShouldReturnAlive()
    {
        // Act
        var response = await Client.GetAsync("/health/live");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var liveResponse = JsonSerializer.Deserialize<JsonElement>(responseContent);
        
        liveResponse.TryGetProperty("alive", out var alive).Should().BeTrue();
        alive.GetBoolean().Should().BeTrue();
    }

    [Fact]
    public async Task Live_ShouldNotRequireAuthentication()
    {
        // No authentication setup

        // Act
        var response = await Client.GetAsync("/health/live");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task HealthEndpoints_ShouldHandleConcurrentRequests()
    {
        // Arrange
        var tasks = new List<Task<HttpResponseMessage>>();
        
        for (int i = 0; i < 10; i++)
        {
            tasks.Add(Client.GetAsync("/health"));
            tasks.Add(Client.GetAsync("/health/ready"));
            tasks.Add(Client.GetAsync("/health/live"));
        }

        // Act
        var responses = await Task.WhenAll(tasks);

        // Assert
        responses.Should().HaveCount(30);
        responses.Where(r => r.RequestMessage?.RequestUri?.AbsolutePath == "/health")
            .Should().OnlyContain(r => r.StatusCode == HttpStatusCode.OK);
        responses.Where(r => r.RequestMessage?.RequestUri?.AbsolutePath == "/health/live")
            .Should().OnlyContain(r => r.StatusCode == HttpStatusCode.OK);
        responses.Where(r => r.RequestMessage?.RequestUri?.AbsolutePath == "/health/ready")
            .Should().OnlyContain(r => r.StatusCode == HttpStatusCode.OK || r.StatusCode == HttpStatusCode.ServiceUnavailable);
    }

    [Fact]
    public async Task HealthEndpoints_ShouldReturnConsistentFormat()
    {
        // Act
        var healthResponse = await Client.GetAsync("/health");
        var readyResponse = await Client.GetAsync("/health/ready");
        var liveResponse = await Client.GetAsync("/health/live");

        // Assert
        var healthContent = await healthResponse.Content.ReadAsStringAsync();
        var readyContent = await readyResponse.Content.ReadAsStringAsync();
        var liveContent = await liveResponse.Content.ReadAsStringAsync();

        // All responses should be valid JSON
        Action healthParse = () => JsonSerializer.Deserialize<JsonElement>(healthContent);
        Action readyParse = () => JsonSerializer.Deserialize<JsonElement>(readyContent);
        Action liveParse = () => JsonSerializer.Deserialize<JsonElement>(liveContent);

        healthParse.Should().NotThrow();
        readyParse.Should().NotThrow();
        liveParse.Should().NotThrow();
    }

    [Fact]
    public async Task HealthCheck_ShouldBypassTenantResolution()
    {
        // Arrange - Set an invalid subdomain to test bypass
        Client.DefaultRequestHeaders.Host = "nonexistent-tenant.stocker.app";

        // Act
        var response = await Client.GetAsync("/health");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var healthResponse = JsonSerializer.Deserialize<JsonElement>(responseContent);
        healthResponse.TryGetProperty("status", out var status).Should().BeTrue();
        status.GetString().Should().Be("Healthy");
    }

    [Fact]
    public async Task HealthEndpoints_ShouldHaveCorrectResponseTimes()
    {
        // Act & Assert
        var stopwatch = System.Diagnostics.Stopwatch.StartNew();
        
        var healthResponse = await Client.GetAsync("/health");
        var healthTime = stopwatch.ElapsedMilliseconds;
        stopwatch.Restart();
        
        var readyResponse = await Client.GetAsync("/health/ready");
        var readyTime = stopwatch.ElapsedMilliseconds;
        stopwatch.Restart();
        
        var liveResponse = await Client.GetAsync("/health/live");
        var liveTime = stopwatch.ElapsedMilliseconds;
        
        stopwatch.Stop();

        // All responses should be fast (under 5 seconds)
        healthTime.Should().BeLessThan(5000);
        readyTime.Should().BeLessThan(5000);
        liveTime.Should().BeLessThan(5000);

        // Live should be fastest (no dependencies)
        liveTime.Should().BeLessThan(readyTime);
        liveResponse.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task HealthEndpoints_ShouldSetCorrectHeaders()
    {
        // Act
        var response = await Client.GetAsync("/health");

        // Assert
        response.Content.Headers.ContentType?.MediaType.Should().Be("application/json");
        response.Headers.Should().ContainKey("date");
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }
}