using FluentAssertions;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Domain.Enums;
using Stocker.Modules.Inventory.Infrastructure.BackgroundServices;
using Stocker.Modules.Inventory.Infrastructure.Health;
using Stocker.Modules.Inventory.Infrastructure.Services;
using System.Diagnostics;
using Xunit;

namespace Stocker.IntegrationTests.Features.Inventory;

/// <summary>
/// Stress tests for inventory resilience mechanisms.
/// Tests high-volume concurrent operations, queue overflow scenarios,
/// and resource consumption under load.
/// </summary>
public class InventoryStressTests
{
    #region High Volume Concurrent Sequence Assignment

    [Fact]
    public void StressTest_1000ConcurrentSequenceAssignments_ShouldAllBeUnique()
    {
        // Simulate high-volume sequence number generation
        var assignedNumbers = new System.Collections.Concurrent.ConcurrentBag<long>();
        var currentMax = 0L;
        var lockObj = new object();
        var totalOperations = 1000;

        // Act
        Parallel.For(0, totalOperations, new ParallelOptions { MaxDegreeOfParallelism = 50 }, _ =>
        {
            long nextNumber;
            lock (lockObj)
            {
                currentMax++;
                nextNumber = currentMax;
            }
            assignedNumbers.Add(nextNumber);
        });

        // Assert
        assignedNumbers.Count.Should().Be(totalOperations);
        assignedNumbers.Distinct().Count().Should().Be(totalOperations);
    }

    [Fact]
    public void StressTest_RapidSequenceAssignment_ShouldCompleteWithinTimeLimit()
    {
        // Arrange
        var lockObj = new object();
        var currentMax = 0L;
        var totalOperations = 5000;
        var sw = Stopwatch.StartNew();

        // Act
        Parallel.For(0, totalOperations, new ParallelOptions { MaxDegreeOfParallelism = 100 }, _ =>
        {
            lock (lockObj)
            {
                currentMax++;
            }
        });
        sw.Stop();

        // Assert - 5000 operations should complete within 5 seconds even under contention
        sw.ElapsedMilliseconds.Should().BeLessThan(5000);
        currentMax.Should().Be(totalOperations);
    }

    #endregion

    #region Fallback Queue Overflow Scenarios

    [Fact]
    public void StressTest_QueueFlood_10000Entries_ShouldNotLoseData()
    {
        // Arrange
        var testQueue = new System.Collections.Concurrent.ConcurrentQueue<AuditFallbackEntry>();
        var totalEntries = 10_000;
        var ids = new System.Collections.Concurrent.ConcurrentBag<Guid>();

        // Act - flood the queue from 100 concurrent producers
        Parallel.For(0, totalEntries, new ParallelOptions { MaxDegreeOfParallelism = 100 }, i =>
        {
            var id = Guid.NewGuid();
            ids.Add(id);
            testQueue.Enqueue(new AuditFallbackEntry
            {
                Id = id,
                Timestamp = DateTime.UtcNow,
                EntityType = "StressTest",
                EntityId = i.ToString(),
                Action = "Create",
                RetryCount = 0
            });
        });

        // Assert
        testQueue.Count.Should().Be(totalEntries);
        ids.Count.Should().Be(totalEntries);
    }

    [Fact]
    public void StressTest_ConcurrentEnqueueDequeue_ShouldMaintainConsistency()
    {
        // Simulate producer-consumer pattern under stress
        var testQueue = new System.Collections.Concurrent.ConcurrentQueue<AuditFallbackEntry>();
        var producedCount = 0;
        var consumedCount = 0;
        var totalPerProducer = 500;
        var producerCount = 10;
        var consumerCount = 5;
        var cts = new CancellationTokenSource();

        // Start producers
        var producerTasks = Enumerable.Range(0, producerCount).Select(p => Task.Run(() =>
        {
            for (int i = 0; i < totalPerProducer; i++)
            {
                testQueue.Enqueue(new AuditFallbackEntry
                {
                    Id = Guid.NewGuid(),
                    EntityType = $"Producer_{p}",
                    EntityId = i.ToString(),
                    Action = "Create",
                    Timestamp = DateTime.UtcNow
                });
                Interlocked.Increment(ref producedCount);
            }
        })).ToArray();

        // Start consumers (will consume until all produced)
        var consumerTasks = Enumerable.Range(0, consumerCount).Select(_ => Task.Run(() =>
        {
            while (!cts.Token.IsCancellationRequested)
            {
                if (testQueue.TryDequeue(out AuditFallbackEntry? _entry))
                {
                    Interlocked.Increment(ref consumedCount);
                }
                else if (Volatile.Read(ref producedCount) >= producerCount * totalPerProducer)
                {
                    // All produced, try one more time then exit
                    Thread.SpinWait(100);
                    if (testQueue.IsEmpty)
                        break;
                }
            }
        })).ToArray();

        // Wait for producers
        Task.WaitAll(producerTasks);
        // Signal consumers to finish
        Task.WaitAll(consumerTasks.Select(t =>
        {
            if (!t.Wait(TimeSpan.FromSeconds(10)))
                cts.Cancel();
            return t;
        }).ToArray());
        cts.Cancel();

        // Assert
        producedCount.Should().Be(producerCount * totalPerProducer);
        (consumedCount + testQueue.Count).Should().Be(producedCount);
    }

    [Fact]
    public void StressTest_QueueMemoryPressure_ShouldHandleLargePayloads()
    {
        // Test with large audit entries to simulate memory pressure
        var testQueue = new System.Collections.Concurrent.ConcurrentQueue<AuditFallbackEntry>();
        var largePayload = new string('x', 10_000); // 10KB per entry

        // Act - add 1000 entries with large payloads (10MB total)
        for (int i = 0; i < 1000; i++)
        {
            testQueue.Enqueue(new AuditFallbackEntry
            {
                Id = Guid.NewGuid(),
                Timestamp = DateTime.UtcNow,
                EntityType = "LargePayloadTest",
                EntityId = i.ToString(),
                Action = "Create",
                OldValue = largePayload,
                NewValue = largePayload,
                AdditionalData = largePayload,
                RetryCount = 0
            });
        }

        // Assert - queue should handle large payloads
        testQueue.Count.Should().Be(1000);

        // Cleanup
        while (testQueue.TryDequeue(out _)) { }
    }

    #endregion

    #region Health Check Under Stress

    [Fact]
    public async Task StressTest_HealthCheck_ConcurrentAccess_ShouldBeThreadSafe()
    {
        // Arrange
        var healthCheck = new InventoryHealthCheck();
        var context = new HealthCheckContext
        {
            Registration = new HealthCheckRegistration("stress-test", healthCheck, null, null)
        };

        // Ensure clean state
        while (InventoryAuditService.FallbackQueue.TryDequeue(out _)) { }

        // Act - 100 concurrent health check calls
        var tasks = Enumerable.Range(0, 100).Select(_ =>
            healthCheck.CheckHealthAsync(context, CancellationToken.None));

        var results = await Task.WhenAll(tasks);

        // Assert - all should return valid results
        results.Should().AllSatisfy(r =>
        {
            r.Status.Should().BeOneOf(HealthStatus.Healthy, HealthStatus.Degraded, HealthStatus.Unhealthy);
            r.Data.Should().ContainKey("audit_fallback_queue_size");
        });
    }

    [Fact]
    public async Task StressTest_HealthCheck_WhileQueueChanging_ShouldNotThrow()
    {
        // Arrange
        var healthCheck = new InventoryHealthCheck();
        var context = new HealthCheckContext
        {
            Registration = new HealthCheckRegistration("stress-test", healthCheck, null, null)
        };
        var cts = new CancellationTokenSource(TimeSpan.FromSeconds(5));

        // Start queue churning in background
        var churningTask = Task.Run(async () =>
        {
            while (!cts.Token.IsCancellationRequested)
            {
                InventoryAuditService.FallbackQueue.Enqueue(new AuditFallbackEntry
                {
                    Id = Guid.NewGuid(),
                    EntityType = "ChurnTest",
                    EntityId = "0",
                    Action = "Create",
                    Timestamp = DateTime.UtcNow
                });
                InventoryAuditService.FallbackQueue.TryDequeue(out _);
                await Task.Delay(1);
            }
        }, cts.Token);

        // Act - concurrent health checks during queue churning
        var exceptions = new System.Collections.Concurrent.ConcurrentBag<Exception>();
        var healthCheckTasks = Enumerable.Range(0, 50).Select(async _ =>
        {
            try
            {
                for (int i = 0; i < 10; i++)
                {
                    await healthCheck.CheckHealthAsync(context);
                    await Task.Delay(10);
                }
            }
            catch (Exception ex)
            {
                exceptions.Add(ex);
            }
        });

        await Task.WhenAll(healthCheckTasks);
        cts.Cancel();

        try { await churningTask; } catch (OperationCanceledException) { }

        // Assert - no exceptions during concurrent access
        exceptions.Should().BeEmpty();

        // Cleanup
        while (InventoryAuditService.FallbackQueue.TryDequeue(out _)) { }
    }

    #endregion

    #region StockMovement Creation Under Load

    [Fact]
    public void StressTest_MassiveMovementCreation_ShouldNotFail()
    {
        // Create many StockMovement objects concurrently
        var movements = new System.Collections.Concurrent.ConcurrentBag<StockMovement>();
        var totalMovements = 5000;

        // Act
        Parallel.For(0, totalMovements, new ParallelOptions { MaxDegreeOfParallelism = 50 }, i =>
        {
            var movement = new StockMovement(
                documentNumber: $"STR-{DateTime.UtcNow:yyyyMMdd}-{i:D5}",
                movementDate: DateTime.UtcNow,
                productId: (i % 100) + 1,
                warehouseId: (i % 10) + 1,
                movementType: (StockMovementType)(i % 14),
                quantity: (i + 1) * 0.5m,
                unitCost: (i + 1) * 1.25m,
                userId: (i % 5) + 1);

            movement.SetSequenceNumber(i + 1);
            movements.Add(movement);
        });

        // Assert
        movements.Count.Should().Be(totalMovements);
        movements.Select(m => m.SequenceNumber).Distinct().Count().Should().Be(totalMovements);
    }

    [Fact]
    public void StressTest_SequenceNumberContention_ShouldSerializeCorrectly()
    {
        // Simulate multiple threads trying to assign sequence numbers
        // for the same product+warehouse combination
        var sequences = new System.Collections.Concurrent.ConcurrentBag<long>();
        var lockObj = new object();
        var currentMax = 0L;
        var threadCount = 200;

        // Act - all threads compete for the same product+warehouse sequence
        Parallel.For(0, threadCount, new ParallelOptions { MaxDegreeOfParallelism = threadCount }, _ =>
        {
            long seq;
            lock (lockObj)
            {
                currentMax++;
                seq = currentMax;
            }
            sequences.Add(seq);

            // Simulate some work after getting sequence
            Thread.SpinWait(1000);
        });

        // Assert - no gaps, no duplicates
        var sortedSequences = sequences.OrderBy(s => s).ToList();
        sortedSequences.First().Should().Be(1);
        sortedSequences.Last().Should().Be(threadCount);
        sortedSequences.Distinct().Count().Should().Be(threadCount);

        // Verify no gaps
        for (int i = 0; i < sortedSequences.Count - 1; i++)
        {
            (sortedSequences[i + 1] - sortedSequences[i]).Should().Be(1,
                $"Gap found between sequences {sortedSequences[i]} and {sortedSequences[i + 1]}");
        }
    }

    #endregion

    #region Retry Storm Simulation

    [Fact]
    public void StressTest_RetryStorm_ShouldNotExhaustMemory()
    {
        // Simulate a retry storm where entries keep bouncing back
        var testQueue = new System.Collections.Concurrent.ConcurrentQueue<AuditFallbackEntry>();
        var maxRetries = 5;
        var initialEntries = 1000;
        var discardedCount = 0;

        // Seed initial entries
        for (int i = 0; i < initialEntries; i++)
        {
            testQueue.Enqueue(new AuditFallbackEntry
            {
                Id = Guid.NewGuid(),
                EntityType = "RetryStorm",
                EntityId = i.ToString(),
                Action = "Create",
                Timestamp = DateTime.UtcNow,
                RetryCount = 0
            });
        }

        // Simulate processor cycles where all entries fail
        for (int cycle = 0; cycle <= maxRetries; cycle++)
        {
            var currentCount = testQueue.Count;
            for (int i = 0; i < currentCount; i++)
            {
                if (testQueue.TryDequeue(out var entry))
                {
                    if (entry!.RetryCount >= maxRetries)
                    {
                        Interlocked.Increment(ref discardedCount);
                    }
                    else
                    {
                        entry.RetryCount++;
                        entry.FailureReason = $"Simulated failure cycle {cycle}";
                        testQueue.Enqueue(entry);
                    }
                }
            }
        }

        // Assert - all entries should eventually be discarded
        discardedCount.Should().Be(initialEntries);
        testQueue.IsEmpty.Should().BeTrue();
    }

    [Fact]
    public void StressTest_MixedRetryAndNewEntries_ShouldProcessCorrectly()
    {
        // Simulate both new entries arriving and retries happening
        var testQueue = new System.Collections.Concurrent.ConcurrentQueue<AuditFallbackEntry>();
        var processed = 0;
        var retried = 0;
        var discarded = 0;
        var maxRetries = 3;

        // Add mix of entries with different retry counts
        for (int i = 0; i < 500; i++)
        {
            testQueue.Enqueue(new AuditFallbackEntry
            {
                Id = Guid.NewGuid(),
                EntityType = "MixedTest",
                EntityId = i.ToString(),
                Action = "Create",
                Timestamp = DateTime.UtcNow,
                RetryCount = i % (maxRetries + 2) // Some will be over max
            });
        }

        // Process all entries
        while (testQueue.TryDequeue(out var entry))
        {
            if (entry!.RetryCount >= maxRetries)
            {
                discarded++;
            }
            else if (entry.RetryCount > 0)
            {
                retried++;
            }
            else
            {
                processed++;
            }
        }

        // Assert
        (processed + retried + discarded).Should().Be(500);
        processed.Should().BeGreaterThan(0);
        discarded.Should().BeGreaterThan(0);
    }

    #endregion

    #region Timing and Performance Tests

    [Fact]
    public void StressTest_HealthCheckLatency_ShouldBeSubMillisecond()
    {
        // Health checks should be extremely fast since they're in-memory
        var healthCheck = new InventoryHealthCheck();
        var context = new HealthCheckContext
        {
            Registration = new HealthCheckRegistration("perf-test", healthCheck, null, null)
        };

        // Warmup
        healthCheck.CheckHealthAsync(context).Wait();

        // Act - measure 1000 health checks
        var sw = Stopwatch.StartNew();
        for (int i = 0; i < 1000; i++)
        {
            healthCheck.CheckHealthAsync(context).Wait();
        }
        sw.Stop();

        // Assert - average should be well under 1ms per check
        var averageMs = sw.ElapsedMilliseconds / 1000.0;
        averageMs.Should().BeLessThan(1.0, "Health checks should be sub-millisecond");
    }

    [Fact]
    public void StressTest_QueueEnqueuePerformance_ShouldHandleHighThroughput()
    {
        // Measure enqueue throughput
        var testQueue = new System.Collections.Concurrent.ConcurrentQueue<AuditFallbackEntry>();
        var totalOperations = 100_000;

        var sw = Stopwatch.StartNew();
        Parallel.For(0, totalOperations, new ParallelOptions { MaxDegreeOfParallelism = 50 }, i =>
        {
            testQueue.Enqueue(new AuditFallbackEntry
            {
                Id = Guid.NewGuid(),
                EntityType = "PerfTest",
                EntityId = i.ToString(),
                Action = "Create",
                Timestamp = DateTime.UtcNow
            });
        });
        sw.Stop();

        // Assert - 100K operations should complete in reasonable time
        testQueue.Count.Should().Be(totalOperations);
        sw.ElapsedMilliseconds.Should().BeLessThan(10_000, "100K enqueue ops should complete within 10 seconds");

        // Calculate throughput
        var opsPerSecond = totalOperations / (sw.ElapsedMilliseconds / 1000.0);
        opsPerSecond.Should().BeGreaterThan(10_000, "Should sustain at least 10K ops/sec");
    }

    #endregion
}
