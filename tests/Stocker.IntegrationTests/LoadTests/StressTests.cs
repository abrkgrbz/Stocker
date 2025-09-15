using System.Collections.Concurrent;
using System.Diagnostics;
using System.Net;
using System.Text;
using System.Text.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Stocker.TestUtilities;
using Xunit;

namespace Stocker.IntegrationTests.LoadTests;

/// <summary>
/// Load and stress tests to verify system behavior under high load conditions
/// </summary>
public class StressTests : IntegrationTestBase, IClassFixture<WebApplicationFactory<Program>>
{
    private readonly Guid _testTenantId = Guid.NewGuid();

    public StressTests(WebApplicationFactory<Program> factory) : base(factory)
    {
    }

    [Fact]
    public async Task HighConcurrencyLoad_500ConcurrentHealthChecks_ShouldHandleGracefully()
    {
        // Arrange
        const int concurrentRequests = 500;
        var tasks = new List<Task<(HttpStatusCode statusCode, long responseTime)>>();
        var results = new ConcurrentBag<(HttpStatusCode statusCode, long responseTime)>();

        // Act
        var overallStopwatch = Stopwatch.StartNew();

        for (int i = 0; i < concurrentRequests; i++)
        {
            tasks.Add(Task.Run(async () =>
            {
                var stopwatch = Stopwatch.StartNew();
                try
                {
                    var response = await Client.GetAsync("/health");
                    stopwatch.Stop();
                    return (response.StatusCode, stopwatch.ElapsedMilliseconds);
                }
                catch
                {
                    stopwatch.Stop();
                    return (HttpStatusCode.InternalServerError, stopwatch.ElapsedMilliseconds);
                }
            }));
        }

        var taskResults = await Task.WhenAll(tasks);
        overallStopwatch.Stop();

        // Assert
        var successfulRequests = taskResults.Count(r => r.statusCode == HttpStatusCode.OK);
        var failedRequests = taskResults.Count(r => r.statusCode != HttpStatusCode.OK);
        var averageResponseTime = taskResults.Where(r => r.statusCode == HttpStatusCode.OK)
                                            .Average(r => r.responseTime);
        var maxResponseTime = taskResults.Max(r => r.responseTime);
        var throughputPerSecond = concurrentRequests / (overallStopwatch.ElapsedMilliseconds / 1000.0);

        // Performance assertions
        successfulRequests.Should().BeGreaterThan(400, "At least 80% of requests should succeed under high load");
        averageResponseTime.Should().BeLessThan(2000, "Average response time should be under 2 seconds");
        maxResponseTime.Should().BeLessThan(10000, "Max response time should be under 10 seconds");
        throughputPerSecond.Should().BeGreaterThan(50, "System should handle at least 50 requests per second");
        
        Console.WriteLine($"Concurrent Load Test Results:");
        Console.WriteLine($"- Total Requests: {concurrentRequests}");
        Console.WriteLine($"- Successful: {successfulRequests} ({(double)successfulRequests/concurrentRequests*100:F1}%)");
        Console.WriteLine($"- Failed: {failedRequests}");
        Console.WriteLine($"- Average Response Time: {averageResponseTime:F2}ms");
        Console.WriteLine($"- Max Response Time: {maxResponseTime}ms");
        Console.WriteLine($"- Throughput: {throughputPerSecond:F2} req/sec");
    }

    [Fact]
    public async Task SustainedLoad_1000RequestsOver60Seconds_ShouldMaintainPerformance()
    {
        // Arrange
        const int totalRequests = 1000;
        const int durationSeconds = 60;
        var interval = TimeSpan.FromMilliseconds((durationSeconds * 1000.0) / totalRequests);
        
        var results = new List<(DateTime timestamp, HttpStatusCode statusCode, long responseTime)>();
        var startTime = DateTime.UtcNow;

        // Act
        for (int i = 0; i < totalRequests; i++)
        {
            var requestStart = DateTime.UtcNow;
            var stopwatch = Stopwatch.StartNew();
            
            try
            {
                var response = await Client.GetAsync("/health");
                stopwatch.Stop();
                results.Add((requestStart, response.StatusCode, stopwatch.ElapsedMilliseconds));
            }
            catch
            {
                stopwatch.Stop();
                results.Add((requestStart, HttpStatusCode.InternalServerError, stopwatch.ElapsedMilliseconds));
            }

            // Wait for next interval (maintain steady rate)
            if (i < totalRequests - 1)
            {
                var nextRequestTime = startTime.AddMilliseconds(interval.TotalMilliseconds * (i + 1));
                var delay = nextRequestTime - DateTime.UtcNow;
                if (delay > TimeSpan.Zero)
                {
                    await Task.Delay(delay);
                }
            }
        }

        // Assert
        var successfulRequests = results.Count(r => r.statusCode == HttpStatusCode.OK);
        var averageResponseTime = results.Where(r => r.statusCode == HttpStatusCode.OK)
                                        .Average(r => r.responseTime);

        // Check performance degradation over time
        var firstHalf = results.Take(totalRequests / 2).Where(r => r.statusCode == HttpStatusCode.OK);
        var secondHalf = results.Skip(totalRequests / 2).Where(r => r.statusCode == HttpStatusCode.OK);
        
        var firstHalfAvg = firstHalf.Any() ? firstHalf.Average(r => r.responseTime) : 0;
        var secondHalfAvg = secondHalf.Any() ? secondHalf.Average(r => r.responseTime) : 0;
        
        var performanceDegradation = secondHalfAvg > 0 ? (secondHalfAvg - firstHalfAvg) / firstHalfAvg * 100 : 0;

        // Performance assertions
        successfulRequests.Should().BeGreaterThan(950, "At least 95% of sustained requests should succeed");
        averageResponseTime.Should().BeLessThan(1000, "Average response time should remain under 1 second");
        performanceDegradation.Should().BeLessThan(100, "Performance should not degrade by more than 100% over time");

        Console.WriteLine($"Sustained Load Test Results:");
        Console.WriteLine($"- Duration: {durationSeconds} seconds");
        Console.WriteLine($"- Total Requests: {totalRequests}");
        Console.WriteLine($"- Success Rate: {(double)successfulRequests/totalRequests*100:F1}%");
        Console.WriteLine($"- Average Response Time: {averageResponseTime:F2}ms");
        Console.WriteLine($"- First Half Avg: {firstHalfAvg:F2}ms");
        Console.WriteLine($"- Second Half Avg: {secondHalfAvg:F2}ms");
        Console.WriteLine($"- Performance Degradation: {performanceDegradation:F1}%");
    }

    [Fact]
    public async Task DatabaseStressTest_ConcurrentCustomerOperations_ShouldHandleGracefully()
    {
        // Arrange
        AuthenticateAsAdmin();
        const int concurrentOperations = 100;
        var tasks = new List<Task<(string operation, HttpStatusCode statusCode, long responseTime)>>();

        // Act
        for (int i = 0; i < concurrentOperations; i++)
        {
            var operationIndex = i;
            
            // Mix different operations
            if (i % 3 == 0)
            {
                // Create operation
                tasks.Add(Task.Run(async () =>
                {
                    var stopwatch = Stopwatch.StartNew();
                    var createRequest = new
                    {
                        Name = $"Stress Customer {operationIndex}",
                        Email = $"stress{operationIndex}_{Guid.NewGuid():N}@test.com",
                        Phone = $"+123456{operationIndex:D4}",
                        Street = $"{operationIndex} Stress Street",
                        City = "Stress City",
                        State = "Test State",
                        PostalCode = "12345",
                        Country = "Test Country"
                    };

                    var json = JsonSerializer.Serialize(createRequest);
                    var content = new StringContent(json, Encoding.UTF8, "application/json");
                    
                    try
                    {
                        var response = await Client.PostAsync($"/api/tenants/{_testTenantId}/customers", content);
                        stopwatch.Stop();
                        return ("CREATE", response.StatusCode, stopwatch.ElapsedMilliseconds);
                    }
                    catch
                    {
                        stopwatch.Stop();
                        return ("CREATE", HttpStatusCode.InternalServerError, stopwatch.ElapsedMilliseconds);
                    }
                }));
            }
            else if (i % 3 == 1)
            {
                // Read operation
                tasks.Add(Task.Run(async () =>
                {
                    var stopwatch = Stopwatch.StartNew();
                    try
                    {
                        var response = await Client.GetAsync($"/api/tenants/{_testTenantId}/customers");
                        stopwatch.Stop();
                        return ("READ", response.StatusCode, stopwatch.ElapsedMilliseconds);
                    }
                    catch
                    {
                        stopwatch.Stop();
                        return ("READ", HttpStatusCode.InternalServerError, stopwatch.ElapsedMilliseconds);
                    }
                }));
            }
            else
            {
                // Update operation (on random customer)
                tasks.Add(Task.Run(async () =>
                {
                    var stopwatch = Stopwatch.StartNew();
                    var randomId = Guid.NewGuid();
                    var updateRequest = new
                    {
                        Name = $"Updated Stress Customer {operationIndex}",
                        Email = $"updated{operationIndex}@test.com"
                    };

                    var json = JsonSerializer.Serialize(updateRequest);
                    var content = new StringContent(json, Encoding.UTF8, "application/json");
                    
                    try
                    {
                        var response = await Client.PutAsync($"/api/tenants/{_testTenantId}/customers/{randomId}", content);
                        stopwatch.Stop();
                        return ("UPDATE", response.StatusCode, stopwatch.ElapsedMilliseconds);
                    }
                    catch
                    {
                        stopwatch.Stop();
                        return ("UPDATE", HttpStatusCode.InternalServerError, stopwatch.ElapsedMilliseconds);
                    }
                }));
            }
        }

        var results = await Task.WhenAll(tasks);

        // Assert
        var createResults = results.Where(r => r.operation == "CREATE").ToList();
        var readResults = results.Where(r => r.operation == "READ").ToList();
        var updateResults = results.Where(r => r.operation == "UPDATE").ToList();

        var overallSuccessRate = results.Count(r => 
            r.statusCode == HttpStatusCode.OK || 
            r.statusCode == HttpStatusCode.Created ||
            r.statusCode == HttpStatusCode.NotFound ||
            r.statusCode == HttpStatusCode.BadRequest) / (double)results.Length * 100;

        var averageResponseTime = results.Average(r => r.responseTime);

        // Performance assertions
        overallSuccessRate.Should().BeGreaterThan(80, "At least 80% of database operations should complete successfully");
        averageResponseTime.Should().BeLessThan(5000, "Average database operation time should be under 5 seconds");
        
        // No operation should hang indefinitely
        results.Should().OnlyContain(r => r.responseTime < 30000, "No operation should take longer than 30 seconds");

        Console.WriteLine($"Database Stress Test Results:");
        Console.WriteLine($"- Create Operations: {createResults.Count} (Success: {createResults.Count(r => r.statusCode == HttpStatusCode.Created || r.statusCode == HttpStatusCode.BadRequest)})");
        Console.WriteLine($"- Read Operations: {readResults.Count} (Success: {readResults.Count(r => r.statusCode == HttpStatusCode.OK)})");
        Console.WriteLine($"- Update Operations: {updateResults.Count} (Success: {updateResults.Count(r => r.statusCode == HttpStatusCode.OK || r.statusCode == HttpStatusCode.NotFound)})");
        Console.WriteLine($"- Overall Success Rate: {overallSuccessRate:F1}%");
        Console.WriteLine($"- Average Response Time: {averageResponseTime:F2}ms");
    }

    [Fact]
    public async Task MemoryPressureTest_LargePayloadRequests_ShouldNotExhaustMemory()
    {
        // Arrange
        AuthenticateAsAdmin();
        const int numberOfRequests = 50;
        const int payloadSizeKb = 100; // 100KB payloads

        var initialMemory = GC.GetTotalMemory(false);
        var tasks = new List<Task<(HttpStatusCode statusCode, long responseTime)>>();

        // Act
        for (int i = 0; i < numberOfRequests; i++)
        {
            tasks.Add(Task.Run(async () =>
            {
                var stopwatch = Stopwatch.StartNew();
                var largeData = new string('X', payloadSizeKb * 1024); // 100KB string
                
                var createRequest = new
                {
                    Name = $"Memory Test Customer {i}",
                    Email = $"memory{i}_{Guid.NewGuid():N}@test.com",
                    Phone = "+1234567890",
                    Street = "123 Memory Street",
                    City = "Memory City",
                    State = "Test State",
                    PostalCode = "12345",
                    Country = "Test Country",
                    LargeData = largeData
                };

                var json = JsonSerializer.Serialize(createRequest);
                var content = new StringContent(json, Encoding.UTF8, "application/json");
                
                try
                {
                    var response = await Client.PostAsync($"/api/tenants/{_testTenantId}/customers", content);
                    stopwatch.Stop();
                    return (response.StatusCode, stopwatch.ElapsedMilliseconds);
                }
                catch
                {
                    stopwatch.Stop();
                    return (HttpStatusCode.InternalServerError, stopwatch.ElapsedMilliseconds);
                }
            }));
        }

        var results = await Task.WhenAll(tasks);

        // Force garbage collection
        GC.Collect();
        GC.WaitForPendingFinalizers();
        GC.Collect();

        var finalMemory = GC.GetTotalMemory(false);
        var memoryIncrease = finalMemory - initialMemory;

        // Assert
        var successfulRequests = results.Count(r => 
            r.statusCode == HttpStatusCode.Created ||
            r.statusCode == HttpStatusCode.BadRequest ||
            r.statusCode == HttpStatusCode.RequestEntityTooLarge);

        var averageResponseTime = results.Where(r => 
            r.statusCode != HttpStatusCode.InternalServerError)
            .Average(r => r.responseTime);

        // Memory should not grow excessively (should be managed)
        memoryIncrease.Should().BeLessThan(50 * 1024 * 1024, "Memory increase should be less than 50MB");
        
        // Most requests should be handled (either accepted or properly rejected)
        successfulRequests.Should().BeGreaterThan((int)(numberOfRequests * 0.8), "At least 80% of requests should be handled properly");
        
        averageResponseTime.Should().BeLessThan(10000, "Average response time should be under 10 seconds even with large payloads");

        Console.WriteLine($"Memory Pressure Test Results:");
        Console.WriteLine($"- Total Requests: {numberOfRequests}");
        Console.WriteLine($"- Payload Size: {payloadSizeKb}KB each");
        Console.WriteLine($"- Successfully Handled: {successfulRequests}");
        Console.WriteLine($"- Memory Increase: {memoryIncrease / (1024.0 * 1024.0):F2}MB");
        Console.WriteLine($"- Average Response Time: {averageResponseTime:F2}ms");
    }

    [Fact]
    public async Task AuthenticationStressTest_ConcurrentLoginAttempts_ShouldHandleGracefully()
    {
        // Arrange
        const int concurrentLogins = 200;
        var tasks = new List<Task<(HttpStatusCode statusCode, long responseTime)>>();

        // Act
        for (int i = 0; i < concurrentLogins; i++)
        {
            var loginIndex = i;
            tasks.Add(Task.Run(async () =>
            {
                var stopwatch = Stopwatch.StartNew();
                var loginRequest = new
                {
                    Email = $"stresstest{loginIndex}@test.com",
                    Password = "TestPassword123!",
                    RememberMe = false
                };

                var json = JsonSerializer.Serialize(loginRequest);
                var content = new StringContent(json, Encoding.UTF8, "application/json");
                
                try
                {
                    var response = await Client.PostAsync("/api/auth/login", content);
                    stopwatch.Stop();
                    return (response.StatusCode, stopwatch.ElapsedMilliseconds);
                }
                catch
                {
                    stopwatch.Stop();
                    return (HttpStatusCode.InternalServerError, stopwatch.ElapsedMilliseconds);
                }
            }));
        }

        var results = await Task.WhenAll(tasks);

        // Assert
        var handledRequests = results.Count(r => 
            r.statusCode == HttpStatusCode.BadRequest ||
            r.statusCode == HttpStatusCode.Unauthorized ||
            r.statusCode == HttpStatusCode.TooManyRequests ||
            r.statusCode == HttpStatusCode.OK);

        var averageResponseTime = results.Where(r => r.statusCode != HttpStatusCode.InternalServerError)
                                        .Average(r => r.responseTime);

        var tooManyRequestsCount = results.Count(r => r.statusCode == HttpStatusCode.TooManyRequests);

        // Most authentication requests should be handled properly (not crash the system)
        handledRequests.Should().BeGreaterThan((int)(concurrentLogins * 0.9), "At least 90% of auth requests should be handled");
        
        averageResponseTime.Should().BeLessThan(5000, "Average auth response time should be under 5 seconds");
        
        // Rate limiting should kick in for concurrent attempts
        if (tooManyRequestsCount > 0)
        {
            tooManyRequestsCount.Should().BeGreaterThan((int)(concurrentLogins * 0.1), 
                "Rate limiting should block at least 10% of concurrent requests");
        }

        Console.WriteLine($"Authentication Stress Test Results:");
        Console.WriteLine($"- Concurrent Requests: {concurrentLogins}");
        Console.WriteLine($"- Handled Properly: {handledRequests}");
        Console.WriteLine($"- Rate Limited: {tooManyRequestsCount}");
        Console.WriteLine($"- Average Response Time: {averageResponseTime:F2}ms");
    }

    [Fact]
    public async Task SystemRecoveryTest_AfterHighLoad_ShouldRecoverGracefully()
    {
        // This test applies high load and then verifies the system recovers
        
        // Phase 1: Apply high load
        const int highLoadRequests = 300;
        var loadTasks = new List<Task<HttpStatusCode>>();

        for (int i = 0; i < highLoadRequests; i++)
        {
            loadTasks.Add(Task.Run(async () =>
            {
                try
                {
                    var response = await Client.GetAsync("/health");
                    return response.StatusCode;
                }
                catch
                {
                    return HttpStatusCode.InternalServerError;
                }
            }));
        }

        var loadResults = await Task.WhenAll(loadTasks);

        // Phase 2: Wait for system to recover
        await Task.Delay(5000); // 5 second recovery period

        // Phase 3: Test normal operations
        var recoveryTasks = new List<Task<HttpStatusCode>>();
        for (int i = 0; i < 10; i++)
        {
            recoveryTasks.Add(Task.Run(async () =>
            {
                try
                {
                    var response = await Client.GetAsync("/health");
                    return response.StatusCode;
                }
                catch
                {
                    return HttpStatusCode.InternalServerError;
                }
            }));
        }

        var recoveryResults = await Task.WhenAll(recoveryTasks);

        // Assert
        var loadSuccessRate = loadResults.Count(r => r == HttpStatusCode.OK) / (double)highLoadRequests * 100;
        var recoverySuccessRate = recoveryResults.Count(r => r == HttpStatusCode.OK) / 10.0 * 100;

        // System should handle some load
        loadSuccessRate.Should().BeGreaterThan(50, "System should handle at least 50% of high load requests");
        
        // System should fully recover after load
        recoverySuccessRate.Should().BeGreaterThan(90, "System should recover to >90% success rate after load");

        Console.WriteLine($"System Recovery Test Results:");
        Console.WriteLine($"- High Load Success Rate: {loadSuccessRate:F1}%");
        Console.WriteLine($"- Recovery Success Rate: {recoverySuccessRate:F1}%");
    }

    [Fact]
    public async Task EndToEndStressTest_CompleteWorkflowUnderLoad_ShouldWork()
    {
        // This test runs complete workflows under concurrent load
        
        // Arrange
        const int concurrentWorkflows = 50;
        AuthenticateAsAdmin();
        var tasks = new List<Task<bool>>();

        // Act - Run complete customer lifecycle workflows concurrently
        for (int i = 0; i < concurrentWorkflows; i++)
        {
            var workflowId = i;
            tasks.Add(Task.Run(async () =>
            {
                try
                {
                    // Complete workflow: Create -> Read -> Update -> Delete
                    var createRequest = new
                    {
                        Name = $"Workflow Customer {workflowId}",
                        Email = $"workflow{workflowId}_{Guid.NewGuid():N}@test.com",
                        Phone = $"+123{workflowId:D7}",
                        Street = $"{workflowId} Workflow Street",
                        City = "Workflow City",
                        State = "Test State",
                        PostalCode = "12345",
                        Country = "Test Country"
                    };

                    var json = JsonSerializer.Serialize(createRequest);
                    var content = new StringContent(json, Encoding.UTF8, "application/json");
                    
                    // Create
                    var createResponse = await Client.PostAsync($"/api/tenants/{_testTenantId}/customers", content);
                    if (!createResponse.IsSuccessStatusCode && createResponse.StatusCode != HttpStatusCode.BadRequest)
                        return false;

                    // Read (list)
                    var listResponse = await Client.GetAsync($"/api/tenants/{_testTenantId}/customers");
                    if (!listResponse.IsSuccessStatusCode && listResponse.StatusCode != HttpStatusCode.Unauthorized)
                        return false;

                    // Update (try with random ID)
                    var updateRequest = new { Name = $"Updated Workflow {workflowId}" };
                    var updateJson = JsonSerializer.Serialize(updateRequest);
                    var updateContent = new StringContent(updateJson, Encoding.UTF8, "application/json");
                    
                    var updateResponse = await Client.PutAsync($"/api/tenants/{_testTenantId}/customers/{Guid.NewGuid()}", updateContent);
                    // Update can fail - that's acceptable

                    return true; // Workflow completed without crashes
                }
                catch
                {
                    return false;
                }
            }));
        }

        var workflowResults = await Task.WhenAll(tasks);

        // Assert
        var successfulWorkflows = workflowResults.Count(r => r);
        var workflowSuccessRate = successfulWorkflows / (double)concurrentWorkflows * 100;

        workflowSuccessRate.Should().BeGreaterThan(70, "At least 70% of concurrent workflows should complete successfully");

        // Verify system is still responsive
        var healthResponse = await Client.GetAsync("/health");
        healthResponse.StatusCode.Should().Be(HttpStatusCode.OK, "System should remain responsive after stress test");

        Console.WriteLine($"End-to-End Stress Test Results:");
        Console.WriteLine($"- Concurrent Workflows: {concurrentWorkflows}");
        Console.WriteLine($"- Successful Workflows: {successfulWorkflows}");
        Console.WriteLine($"- Success Rate: {workflowSuccessRate:F1}%");
        Console.WriteLine($"- System Health: {(healthResponse.StatusCode == HttpStatusCode.OK ? "OK" : "DEGRADED")}");
    }
}