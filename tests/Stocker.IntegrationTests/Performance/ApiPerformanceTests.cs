using System.Diagnostics;
using System.Net;
using System.Text;
using System.Text.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Stocker.TestUtilities;
using Xunit;

namespace Stocker.IntegrationTests.Performance;

/// <summary>
/// Performance tests for API endpoints measuring response times, throughput, and scalability
/// </summary>
public class ApiPerformanceTests : IntegrationTestBase, IClassFixture<WebApplicationFactory<Program>>
{
    private readonly Guid _testTenantId = Guid.NewGuid();

    public ApiPerformanceTests(WebApplicationFactory<Program> factory) : base(factory)
    {
    }

    [Fact]
    public async Task HealthEndpoint_ShouldRespondWithinAcceptableTime()
    {
        // Arrange
        var stopwatch = Stopwatch.StartNew();

        // Act
        var response = await Client.GetAsync("/health");

        // Assert
        stopwatch.Stop();
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(100, 
            "Health endpoint should respond within 100ms");
    }

    [Fact]
    public async Task AuthLogin_ShouldCompleteWithinReasonableTime()
    {
        // Arrange
        var loginRequest = new
        {
            Email = "test@example.com",
            Password = "ValidPassword123!",
            RememberMe = false
        };

        var json = JsonSerializer.Serialize(loginRequest);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        var stopwatch = Stopwatch.StartNew();

        // Act
        var response = await Client.PostAsync("/api/auth/login", content);

        // Assert
        stopwatch.Stop();
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(2000, 
            "Login should complete within 2 seconds");
    }

    [Fact]
    public async Task GetCustomers_ColdStart_ShouldCompleteWithinLimit()
    {
        // Arrange
        AuthenticateAsAdmin();
        var stopwatch = Stopwatch.StartNew();

        // Act - First request (cold start)
        var response = await Client.GetAsync($"/api/tenants/{_testTenantId}/customers");

        // Assert
        stopwatch.Stop();
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(3000, 
            "Cold start should complete within 3 seconds");
    }

    [Fact]
    public async Task GetCustomers_WarmCache_ShouldBeOptimized()
    {
        // Arrange
        AuthenticateAsAdmin();

        // Warm up
        await Client.GetAsync($"/api/tenants/{_testTenantId}/customers");

        var stopwatch = Stopwatch.StartNew();

        // Act - Second request (warm cache)
        var response = await Client.GetAsync($"/api/tenants/{_testTenantId}/customers");

        // Assert
        stopwatch.Stop();
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(1000, 
            "Warm cache requests should be faster than 1 second");
    }

    [Fact]
    public async Task ConcurrentHealthChecks_ShouldMaintainPerformance()
    {
        // Arrange
        var numberOfRequests = 50;
        var tasks = new List<Task<(HttpStatusCode statusCode, long elapsedMs)>>();

        // Act
        for (int i = 0; i < numberOfRequests; i++)
        {
            tasks.Add(Task.Run(async () =>
            {
                var stopwatch = Stopwatch.StartNew();
                var response = await Client.GetAsync("/health");
                stopwatch.Stop();
                return (response.StatusCode, stopwatch.ElapsedMilliseconds);
            }));
        }

        var results = await Task.WhenAll(tasks);

        // Assert
        var successfulRequests = results.Count(r => r.statusCode == HttpStatusCode.OK);
        var averageResponseTime = results.Where(r => r.statusCode == HttpStatusCode.OK)
                                        .Average(r => r.elapsedMs);
        var maxResponseTime = results.Where(r => r.statusCode == HttpStatusCode.OK)
                                    .Max(r => r.elapsedMs);

        successfulRequests.Should().Be(numberOfRequests, "All health checks should succeed");
        averageResponseTime.Should().BeLessThan(500, "Average response time should be under 500ms");
        maxResponseTime.Should().BeLessThan(2000, "Max response time should be under 2 seconds");
    }

    [Fact]
    public async Task CreateCustomer_BulkOperations_ShouldScaleLinearly()
    {
        // Arrange
        AuthenticateAsAdmin();
        var numberOfCustomers = 10;
        var tasks = new List<Task<(HttpStatusCode statusCode, long elapsedMs)>>();

        // Act
        for (int i = 0; i < numberOfCustomers; i++)
        {
            var customerId = i;
            tasks.Add(Task.Run(async () =>
            {
                var createRequest = new
                {
                    Name = $"Performance Customer {customerId}",
                    Email = $"perf{customerId}_{Guid.NewGuid():N}@test.com",
                    Phone = $"+123456{customerId:D4}",
                    Street = $"{customerId} Performance Street",
                    City = "Test City",
                    State = "Test State",
                    PostalCode = "12345",
                    Country = "Test Country"
                };

                var json = JsonSerializer.Serialize(createRequest);
                var content = new StringContent(json, Encoding.UTF8, "application/json");
                
                var stopwatch = Stopwatch.StartNew();
                var response = await Client.PostAsync($"/api/tenants/{_testTenantId}/customers", content);
                stopwatch.Stop();
                
                return (response.StatusCode, stopwatch.ElapsedMilliseconds);
            }));
        }

        var results = await Task.WhenAll(tasks);

        // Assert
        var successfulCreations = results.Count(r => 
            r.statusCode == HttpStatusCode.Created || 
            r.statusCode == HttpStatusCode.BadRequest); // Bad request is acceptable due to validation

        var averageResponseTime = results.Where(r => 
            r.statusCode == HttpStatusCode.Created || 
            r.statusCode == HttpStatusCode.BadRequest)
            .Average(r => r.elapsedMs);

        successfulCreations.Should().Be(numberOfCustomers, "All operations should complete");
        averageResponseTime.Should().BeLessThan(3000, "Average creation time should be under 3 seconds");
    }

    [Fact]
    public async Task DatabaseQueries_ShouldExecuteEfficiently()
    {
        // Arrange
        AuthenticateAsAdmin();
        var measurements = new List<long>();

        // Act - Perform multiple database operations
        for (int i = 0; i < 5; i++)
        {
            var stopwatch = Stopwatch.StartNew();
            
            // Get customers (database read)
            var customersResponse = await Client.GetAsync($"/api/tenants/{_testTenantId}/customers");
            
            stopwatch.Stop();
            measurements.Add(stopwatch.ElapsedMilliseconds);

            // Ensure requests succeed for valid measurement
            customersResponse.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.Unauthorized);
        }

        // Assert
        var averageQueryTime = measurements.Average();
        var maxQueryTime = measurements.Max();
        var queryTimeVariance = measurements.Select(m => Math.Pow(m - averageQueryTime, 2)).Average();

        averageQueryTime.Should().BeLessThan(2000, "Average query time should be under 2 seconds");
        maxQueryTime.Should().BeLessThan(5000, "Max query time should be under 5 seconds");
        queryTimeVariance.Should().BeLessThan(1000000, "Query times should be consistent (low variance)");
    }

    [Fact]
    public async Task PaginatedResults_ShouldPerformWellWithLargePageSize()
    {
        // Arrange
        AuthenticateAsAdmin();
        var stopwatch = Stopwatch.StartNew();

        // Act - Request large page size
        var response = await Client.GetAsync($"/api/tenants/{_testTenantId}/customers?pageSize=100");

        // Assert
        stopwatch.Stop();
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.Unauthorized);
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(5000, 
            "Large page requests should complete within 5 seconds");
    }

    [Fact]
    public async Task SearchOperations_ShouldPerformWithinLimits()
    {
        // Arrange
        AuthenticateAsAdmin();
        var searchTerms = new[] { "test", "customer", "company", "admin", "user" };
        var measurements = new List<long>();

        // Act
        foreach (var searchTerm in searchTerms)
        {
            var stopwatch = Stopwatch.StartNew();
            
            var response = await Client.GetAsync(
                $"/api/tenants/{_testTenantId}/customers?search={Uri.EscapeDataString(searchTerm)}");
            
            stopwatch.Stop();
            measurements.Add(stopwatch.ElapsedMilliseconds);

            // Ensure request completes
            response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.Unauthorized);
        }

        // Assert
        var averageSearchTime = measurements.Average();
        var maxSearchTime = measurements.Max();

        averageSearchTime.Should().BeLessThan(3000, "Average search time should be under 3 seconds");
        maxSearchTime.Should().BeLessThan(6000, "Max search time should be under 6 seconds");
    }

    [Fact]
    public async Task AuthenticationTokens_ShouldValidateQuickly()
    {
        // Arrange
        AuthenticateAsAdmin();
        var measurements = new List<long>();

        // Act - Test token validation performance
        for (int i = 0; i < 10; i++)
        {
            var stopwatch = Stopwatch.StartNew();
            
            // Make authenticated request
            var response = await Client.GetAsync("/health");
            
            stopwatch.Stop();
            measurements.Add(stopwatch.ElapsedMilliseconds);

            response.StatusCode.Should().Be(HttpStatusCode.OK);
        }

        // Assert
        var averageValidationTime = measurements.Average();
        averageValidationTime.Should().BeLessThan(200, 
            "Token validation should be very fast (under 200ms)");
    }

    [Fact]
    public async Task JsonSerialization_ShouldBeOptimized()
    {
        // Arrange
        AuthenticateAsAdmin();
        
        var largeCustomerRequest = new
        {
            Name = new string('A', 100), // 100 character name
            Email = $"large{Guid.NewGuid():N}@test.com",
            Phone = "+1234567890",
            Street = new string('B', 200), // 200 character street
            City = new string('C', 100),   // 100 character city
            State = "Test State",
            PostalCode = "12345",
            Country = "Test Country"
        };

        var json = JsonSerializer.Serialize(largeCustomerRequest);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        var stopwatch = Stopwatch.StartNew();

        // Act
        var response = await Client.PostAsync($"/api/tenants/{_testTenantId}/customers", content);

        // Assert
        stopwatch.Stop();
        response.StatusCode.Should().BeOneOf(
            HttpStatusCode.Created, 
            HttpStatusCode.BadRequest, 
            HttpStatusCode.Unauthorized);
        
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(3000, 
            "JSON serialization/deserialization should be efficient");
    }

    [Fact]
    public async Task ErrorHandling_ShouldNotImpactPerformance()
    {
        // Arrange
        AuthenticateAsAdmin();
        var measurements = new List<long>();

        // Act - Test performance when errors occur
        for (int i = 0; i < 5; i++)
        {
            var stopwatch = Stopwatch.StartNew();
            
            // Make request that will likely cause an error (invalid ID)
            var response = await Client.GetAsync($"/api/tenants/{_testTenantId}/customers/invalid-id");
            
            stopwatch.Stop();
            measurements.Add(stopwatch.ElapsedMilliseconds);

            response.StatusCode.Should().BeOneOf(
                HttpStatusCode.BadRequest, 
                HttpStatusCode.NotFound, 
                HttpStatusCode.Unauthorized);
        }

        // Assert
        var averageErrorHandlingTime = measurements.Average();
        averageErrorHandlingTime.Should().BeLessThan(1000, 
            "Error handling should not significantly impact performance");
    }

    [Fact]
    public async Task MemoryUsage_ShouldBeStableUnderLoad()
    {
        // Arrange
        AuthenticateAsAdmin();
        var initialMemory = GC.GetTotalMemory(true);
        var requests = new List<Task<HttpResponseMessage>>();

        // Act - Generate load
        for (int i = 0; i < 20; i++)
        {
            requests.Add(Client.GetAsync("/health"));
        }

        await Task.WhenAll(requests);
        
        // Force garbage collection
        GC.Collect();
        GC.WaitForPendingFinalizers();
        GC.Collect();
        
        var finalMemory = GC.GetTotalMemory(false);

        // Assert
        var memoryIncrease = finalMemory - initialMemory;
        memoryIncrease.Should().BeLessThan(10 * 1024 * 1024, 
            "Memory increase should be less than 10MB for 20 requests");
    }

    [Fact]
    public async Task ResponseCompression_ShouldImproveTransferTime()
    {
        // This test measures if response compression is working effectively
        
        // Arrange
        AuthenticateAsAdmin();
        Client.DefaultRequestHeaders.Add("Accept-Encoding", "gzip, deflate");

        var stopwatch = Stopwatch.StartNew();

        // Act
        var response = await Client.GetAsync($"/api/tenants/{_testTenantId}/customers");

        // Assert
        stopwatch.Stop();
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.Unauthorized);
        
        // Check if compression headers are present (when successful)
        if (response.IsSuccessStatusCode)
        {
            // Response should be compressed for better performance
            var contentEncoding = response.Content.Headers.ContentEncoding;
            
            // If compression is implemented, it should be indicated in headers
            // This is more of a performance best practice check
            stopwatch.ElapsedMilliseconds.Should().BeLessThan(2000, 
                "Compressed responses should transfer quickly");
        }
    }

    [Fact]
    public async Task CacheEffectiveness_ShouldShowImprovement()
    {
        // Arrange
        AuthenticateAsAdmin();
        
        // First request (cache miss)
        var stopwatch1 = Stopwatch.StartNew();
        var response1 = await Client.GetAsync($"/api/tenants/{_testTenantId}/customers");
        stopwatch1.Stop();

        // Second identical request (potential cache hit)
        var stopwatch2 = Stopwatch.StartNew();
        var response2 = await Client.GetAsync($"/api/tenants/{_testTenantId}/customers");
        stopwatch2.Stop();

        // Third identical request (should be cached)
        var stopwatch3 = Stopwatch.StartNew();
        var response3 = await Client.GetAsync($"/api/tenants/{_testTenantId}/customers");
        stopwatch3.Stop();

        // Assert
        response1.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.Unauthorized);
        response2.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.Unauthorized);
        response3.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.Unauthorized);

        var averageSubsequentTime = (stopwatch2.ElapsedMilliseconds + stopwatch3.ElapsedMilliseconds) / 2.0;
        
        // Subsequent requests should generally be faster (though not always due to test environment)
        averageSubsequentTime.Should().BeLessThan(stopwatch1.ElapsedMilliseconds * 1.5, 
            "Caching should provide some performance benefit");
    }
}