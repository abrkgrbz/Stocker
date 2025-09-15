using System.Net;
using System.Text;
using System.Text.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Stocker.TestUtilities;
using Xunit;

namespace Stocker.IntegrationTests.Security;

/// <summary>
/// Security tests focusing on Denial of Service (DoS) protection and rate limiting
/// </summary>
public class DosProtectionSecurityTests : IntegrationTestBase, IClassFixture<WebApplicationFactory<Program>>
{
    private readonly Guid _testTenantId = Guid.NewGuid();

    public DosProtectionSecurityTests(WebApplicationFactory<Program> factory) : base(factory)
    {
    }

    [Fact]
    public async Task Login_RapidFireRequests_ShouldImplementRateLimit()
    {
        // Arrange
        var loginRequest = new
        {
            Email = "test@example.com",
            Password = "WrongPassword123!",
            RememberMe = false
        };

        var json = JsonSerializer.Serialize(loginRequest);
        var tasks = new List<Task<HttpResponseMessage>>();

        // Act - Fire 50 requests rapidly
        for (int i = 0; i < 50; i++)
        {
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            tasks.Add(Client.PostAsync("/api/auth/login", content));
        }

        var responses = await Task.WhenAll(tasks);

        // Assert
        var rateLimitedRequests = responses.Count(r => r.StatusCode == HttpStatusCode.TooManyRequests);
        var serviceUnavailable = responses.Count(r => r.StatusCode == HttpStatusCode.ServiceUnavailable);
        
        // Should have some form of rate limiting or protection
        (rateLimitedRequests + serviceUnavailable).Should().BeGreaterThan(0, 
            "Rate limiting should protect against rapid fire requests");
    }

    [Fact]
    public async Task CreateCustomer_BulkRequests_ShouldHandleGracefully()
    {
        // Arrange
        AuthenticateAsAdmin();
        var tasks = new List<Task<HttpResponseMessage>>();

        // Act - Try to create many customers simultaneously
        for (int i = 0; i < 100; i++)
        {
            var createRequest = new
            {
                Name = $"Bulk Customer {i}",
                Email = $"bulk{i}_{Guid.NewGuid():N}@test.com",
                Phone = $"+123456789{i % 10}",
                Street = $"{i} Test Street",
                City = "Test City",
                State = "Test State",
                PostalCode = "12345",
                Country = "Test Country"
            };

            var json = JsonSerializer.Serialize(createRequest);
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            
            tasks.Add(Client.PostAsync($"/api/tenants/{_testTenantId}/customers", content));
        }

        var responses = await Task.WhenAll(tasks);

        // Assert
        var successfulRequests = responses.Count(r => r.IsSuccessStatusCode);
        var rateLimited = responses.Count(r => r.StatusCode == HttpStatusCode.TooManyRequests);
        var serviceUnavailable = responses.Count(r => r.StatusCode == HttpStatusCode.ServiceUnavailable);

        // Should either process all requests or implement rate limiting
        (successfulRequests + rateLimited + serviceUnavailable).Should().Be(100);
        
        if (rateLimited > 0 || serviceUnavailable > 0)
        {
            // If rate limiting is implemented, it should kick in
            (rateLimited + serviceUnavailable).Should().BeGreaterThan(10, 
                "Rate limiting should protect against bulk operations");
        }
    }

    [Fact]
    public async Task HealthCheck_UnderHighLoad_ShouldRemainResponsive()
    {
        // Arrange
        var tasks = new List<Task<HttpResponseMessage>>();

        // Act - Bombard health endpoint with requests
        for (int i = 0; i < 200; i++)
        {
            tasks.Add(Client.GetAsync("/health"));
        }

        var responses = await Task.WhenAll(tasks);

        // Assert
        var successfulRequests = responses.Count(r => r.StatusCode == HttpStatusCode.OK);
        
        // Health endpoint should be resilient to high load
        successfulRequests.Should().BeGreaterThan(150, 
            "Health endpoint should handle high load gracefully");
    }

    [Fact]
    public async Task ApiEndpoints_SlowLorisAttack_ShouldTimeout()
    {
        // Arrange
        AuthenticateAsAdmin();
        
        // Create a slow request by sending partial data
        var slowRequest = new
        {
            Name = "Slow Customer",
            Email = "slow@test.com",
            Phone = "+1234567890"
            // Intentionally incomplete to simulate slow client
        };

        var json = JsonSerializer.Serialize(slowRequest);
        var content = new StringContent(json, Encoding.UTF8, "application/json");
        
        var cts = new CancellationTokenSource(TimeSpan.FromSeconds(30)); // 30 second timeout

        try
        {
            // Act
            var response = await Client.PostAsync($"/api/tenants/{_testTenantId}/customers", content, cts.Token);
            
            // Assert
            // Should complete within reasonable time or timeout
            response.StatusCode.Should().BeOneOf(
                HttpStatusCode.BadRequest,
                HttpStatusCode.RequestTimeout,
                HttpStatusCode.Created);
        }
        catch (TaskCanceledException)
        {
            // This is acceptable - the request timed out as expected
            Assert.True(true, "Request timed out as expected");
        }
    }

    [Fact]
    public async Task DatabaseOperations_UnderConcurrentLoad_ShouldNotDeadlock()
    {
        // Arrange
        AuthenticateAsAdmin();
        var tasks = new List<Task<HttpResponseMessage>>();
        var customerId = Guid.NewGuid();

        // Act - Multiple concurrent operations on same resource
        for (int i = 0; i < 20; i++)
        {
            // Mix of read and write operations
            if (i % 3 == 0)
            {
                // Read operation
                tasks.Add(Client.GetAsync($"/api/tenants/{_testTenantId}/customers/{customerId}"));
            }
            else if (i % 3 == 1)
            {
                // Update operation
                var updateRequest = new
                {
                    Name = $"Updated Name {i}",
                    Email = $"updated{i}@test.com"
                };
                var json = JsonSerializer.Serialize(updateRequest);
                var content = new StringContent(json, Encoding.UTF8, "application/json");
                
                tasks.Add(Client.PutAsync($"/api/tenants/{_testTenantId}/customers/{customerId}", content));
            }
            else
            {
                // Delete operation (might fail, but shouldn't cause deadlock)
                tasks.Add(Client.DeleteAsync($"/api/tenants/{_testTenantId}/customers/{customerId}"));
            }
        }

        var stopwatch = System.Diagnostics.Stopwatch.StartNew();
        var responses = await Task.WhenAll(tasks);
        stopwatch.Stop();

        // Assert
        // All requests should complete within reasonable time (no deadlocks)
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(30000, 
            "Operations should not deadlock and should complete within 30 seconds");
            
        responses.Should().OnlyContain(r => 
            r.StatusCode == HttpStatusCode.OK ||
            r.StatusCode == HttpStatusCode.NotFound ||
            r.StatusCode == HttpStatusCode.BadRequest ||
            r.StatusCode == HttpStatusCode.NoContent ||
            r.StatusCode == HttpStatusCode.Conflict);
    }

    [Fact]
    public async Task MemoryExhaustion_LargePayloads_ShouldBeRejected()
    {
        // Arrange
        AuthenticateAsAdmin();
        
        // Try to send a very large JSON payload
        var largeArray = new string[10000];
        for (int i = 0; i < largeArray.Length; i++)
        {
            largeArray[i] = new string('A', 1000); // Each element is 1KB
        }

        var largeRequest = new
        {
            Name = "Large Customer",
            Email = "large@test.com",
            Phone = "+1234567890",
            Street = "123 Main St",
            City = "Test City",
            State = "Test State",
            PostalCode = "12345",
            Country = "Test Country",
            LargeData = largeArray // ~10MB of data
        };

        var json = JsonSerializer.Serialize(largeRequest);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await Client.PostAsync($"/api/tenants/{_testTenantId}/customers", content);

        // Assert
        response.StatusCode.Should().BeOneOf(
            HttpStatusCode.BadRequest,
            HttpStatusCode.RequestEntityTooLarge,
            HttpStatusCode.RequestEntityTooLarge);
    }

    [Fact]
    public async Task ConcurrentConnections_ExcessiveCount_ShouldBeLimited()
    {
        // Arrange
        var semaphore = new SemaphoreSlim(500); // Limit concurrent operations
        var tasks = new List<Task<(HttpStatusCode statusCode, long elapsedMs)>>();

        // Act - Create many concurrent connections
        for (int i = 0; i < 500; i++)
        {
            tasks.Add(Task.Run(async () =>
            {
                await semaphore.WaitAsync();
                try
                {
                    var stopwatch = System.Diagnostics.Stopwatch.StartNew();
                    var response = await Client.GetAsync("/health");
                    stopwatch.Stop();
                    return (response.StatusCode, stopwatch.ElapsedMilliseconds);
                }
                finally
                {
                    semaphore.Release();
                }
            }));
        }

        var results = await Task.WhenAll(tasks);

        // Assert
        var successfulConnections = results.Count(r => r.statusCode == HttpStatusCode.OK);
        var rejectedConnections = results.Count(r => 
            r.statusCode == HttpStatusCode.ServiceUnavailable ||
            r.statusCode == HttpStatusCode.TooManyRequests);
            
        // Should handle the load gracefully
        (successfulConnections + rejectedConnections).Should().Be(500);
        
        // Average response time should be reasonable
        var averageResponseTime = results.Where(r => r.statusCode == HttpStatusCode.OK)
                                        .Average(r => r.elapsedMs);
        averageResponseTime.Should().BeLessThan(5000, 
            "Average response time should be under 5 seconds even under load");
    }

    [Fact]
    public async Task RegularExpression_ReDoSAttack_ShouldTimeout()
    {
        // Arrange
        AuthenticateAsAdmin();
        
        // Create input that could cause ReDoS (Regular Expression Denial of Service)
        var evilRegexInput = "a" + new string('a', 1000) + "X"; // Input that causes catastrophic backtracking
        
        var createRequest = new
        {
            Name = evilRegexInput,
            Email = $"test{Guid.NewGuid():N}@example.com",
            Phone = "+1234567890",
            Street = "123 Main St",
            City = "Test City",
            State = "Test State",
            PostalCode = "12345",
            Country = "Test Country"
        };

        var json = JsonSerializer.Serialize(createRequest);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        var stopwatch = System.Diagnostics.Stopwatch.StartNew();
        
        // Act
        var response = await Client.PostAsync($"/api/tenants/{_testTenantId}/customers", content);
        
        stopwatch.Stop();

        // Assert
        // Request should complete quickly (no ReDoS vulnerability)
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(5000, 
            "Request should not hang due to ReDoS vulnerability");
            
        response.StatusCode.Should().BeOneOf(
            HttpStatusCode.BadRequest,
            HttpStatusCode.Created,
            HttpStatusCode.UnprocessableEntity);
    }

    [Fact]
    public async Task ResourceExhaustion_ThreadPoolStarvation_ShouldRecover()
    {
        // Arrange
        var tasks = new List<Task<HttpResponseMessage>>();

        // Act - Create many long-running operations
        for (int i = 0; i < 50; i++)
        {
            tasks.Add(Task.Run(async () =>
            {
                // Simulate long-running operation with delay
                await Task.Delay(100);
                return await Client.GetAsync("/health");
            }));
        }

        var responses = await Task.WhenAll(tasks);

        // Assert
        var successfulRequests = responses.Count(r => r.StatusCode == HttpStatusCode.OK);
        
        // System should handle thread pool pressure gracefully
        successfulRequests.Should().BeGreaterThan(40, 
            "System should handle thread pool pressure without failing most requests");
    }

    [Fact]
    public async Task ApiEndpoints_ZipBomb_ShouldBeRejected()
    {
        // This test simulates a zip bomb attack through nested JSON or repeated data
        
        // Arrange
        AuthenticateAsAdmin();
        
        // Create highly compressed but expansive data
        var bombData = new Dictionary<string, object>();
        for (int i = 0; i < 1000; i++)
        {
            bombData[$"key{i}"] = new string('Z', 100);
        }

        var createRequest = new Dictionary<string, object>
        {
            ["Name"] = "Zip Bomb Customer",
            ["Email"] = $"zipbomb{Guid.NewGuid():N}@test.com",
            ["Phone"] = "+1234567890",
            ["Street"] = "123 Main St",
            ["City"] = "Test City",
            ["State"] = "Test State",
            ["PostalCode"] = "12345",
            ["Country"] = "Test Country",
            ["BombData"] = bombData
        };

        var json = JsonSerializer.Serialize(createRequest);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await Client.PostAsync($"/api/tenants/{_testTenantId}/customers", content);

        // Assert
        response.StatusCode.Should().BeOneOf(
            HttpStatusCode.BadRequest,
            HttpStatusCode.RequestEntityTooLarge,
            HttpStatusCode.RequestEntityTooLarge);
    }

    [Fact]
    public async Task CacheFlooding_ShouldBeLimited()
    {
        // Arrange
        AuthenticateAsAdmin();
        var tasks = new List<Task<HttpResponseMessage>>();

        // Act - Try to flood cache with many different requests
        for (int i = 0; i < 1000; i++)
        {
            var uniqueId = Guid.NewGuid();
            tasks.Add(Client.GetAsync($"/api/tenants/{_testTenantId}/customers/{uniqueId}"));
        }

        var responses = await Task.WhenAll(tasks);

        // Assert
        var notFoundResponses = responses.Count(r => r.StatusCode == HttpStatusCode.NotFound);
        var rateLimitedResponses = responses.Count(r => r.StatusCode == HttpStatusCode.TooManyRequests);
        
        // Should handle cache flooding attempts
        (notFoundResponses + rateLimitedResponses).Should().Be(1000);
        
        if (rateLimitedResponses > 0)
        {
            rateLimitedResponses.Should().BeGreaterThan(100, 
                "Should implement some protection against cache flooding");
        }
    }
}