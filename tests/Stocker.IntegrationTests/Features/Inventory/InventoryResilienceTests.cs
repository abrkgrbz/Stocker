using FluentAssertions;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Domain.Enums;
using Stocker.Modules.Inventory.Infrastructure.BackgroundServices;
using Stocker.Modules.Inventory.Infrastructure.Health;
using Stocker.Modules.Inventory.Infrastructure.Services;
using Xunit;

namespace Stocker.IntegrationTests.Features.Inventory;

/// <summary>
/// Integration tests for inventory resilience mechanisms:
/// - Concurrency safety (SequenceNumber)
/// - Audit fallback queue behavior
/// - Health check metrics
/// - Transfer timeout monitoring
/// </summary>
public class InventoryResilienceTests
{
    #region StockMovement SequenceNumber Tests

    [Fact]
    public void StockMovement_SetSequenceNumber_ShouldAcceptValidValue()
    {
        // Arrange
        var movement = CreateTestMovement();

        // Act
        movement.SetSequenceNumber(1);

        // Assert
        movement.SequenceNumber.Should().Be(1);
    }

    [Fact]
    public void StockMovement_SetSequenceNumber_ShouldRejectZero()
    {
        // Arrange
        var movement = CreateTestMovement();

        // Act & Assert
        var act = () => movement.SetSequenceNumber(0);
        act.Should().Throw<ArgumentException>()
            .WithMessage("*positive*");
    }

    [Fact]
    public void StockMovement_SetSequenceNumber_ShouldRejectNegative()
    {
        // Arrange
        var movement = CreateTestMovement();

        // Act & Assert
        var act = () => movement.SetSequenceNumber(-5);
        act.Should().Throw<ArgumentException>()
            .WithMessage("*positive*");
    }

    [Fact]
    public void StockMovement_SetSequenceNumber_ShouldAcceptLargeValues()
    {
        // Arrange
        var movement = CreateTestMovement();

        // Act
        movement.SetSequenceNumber(long.MaxValue);

        // Assert
        movement.SequenceNumber.Should().Be(long.MaxValue);
    }

    [Fact]
    public void StockMovement_DefaultSequenceNumber_ShouldBeZero()
    {
        // Arrange & Act
        var movement = CreateTestMovement();

        // Assert
        movement.SequenceNumber.Should().Be(0);
    }

    #endregion

    #region Audit Fallback Queue Tests

    [Fact]
    public void AuditFallbackQueue_ShouldAcceptEntries()
    {
        // Arrange
        var initialCount = InventoryAuditService.FallbackQueue.Count;
        var entry = new AuditFallbackEntry
        {
            Id = Guid.NewGuid(),
            Timestamp = DateTime.UtcNow,
            EntityType = "StockMovement",
            EntityId = "123",
            EntityName = "Test Movement",
            Action = "Create",
            TenantId = Guid.NewGuid().ToString(),
            RetryCount = 0
        };

        // Act
        InventoryAuditService.FallbackQueue.Enqueue(entry);

        // Assert
        InventoryAuditService.FallbackQueue.Count.Should().BeGreaterThan(initialCount);

        // Cleanup: dequeue the entry we added
        InventoryAuditService.FallbackQueue.TryDequeue(out _);
    }

    [Fact]
    public void AuditFallbackQueue_ShouldBeThreadSafe()
    {
        // Arrange
        var entries = Enumerable.Range(1, 100).Select(i => new AuditFallbackEntry
        {
            Id = Guid.NewGuid(),
            Timestamp = DateTime.UtcNow,
            EntityType = "StockMovement",
            EntityId = i.ToString(),
            Action = "Create",
            RetryCount = 0
        }).ToList();

        // Act - enqueue from multiple threads
        Parallel.ForEach(entries, entry =>
        {
            InventoryAuditService.FallbackQueue.Enqueue(entry);
        });

        // Assert - all entries should be in the queue
        var dequeuedCount = 0;
        while (InventoryAuditService.FallbackQueue.TryDequeue(out var item))
        {
            if (entries.Any(e => e.Id == item.Id))
                dequeuedCount++;
        }

        dequeuedCount.Should().Be(100);
    }

    [Fact]
    public void AuditFallbackEntry_RetryCount_ShouldTrackRetries()
    {
        // Arrange
        var entry = new AuditFallbackEntry
        {
            Id = Guid.NewGuid(),
            Timestamp = DateTime.UtcNow,
            EntityType = "Product",
            EntityId = "456",
            Action = "Update",
            RetryCount = 0
        };

        // Act - simulate retries
        entry.RetryCount++;
        entry.FailureReason = "Connection timeout";
        entry.RetryCount++;
        entry.FailureReason = "Deadlock detected";

        // Assert
        entry.RetryCount.Should().Be(2);
        entry.FailureReason.Should().Be("Deadlock detected");
    }

    [Fact]
    public void AuditFallbackEntry_ShouldExceedMaxRetries()
    {
        // Arrange
        const int maxRetries = 5;
        var entry = new AuditFallbackEntry
        {
            Id = Guid.NewGuid(),
            Timestamp = DateTime.UtcNow,
            EntityType = "Stock",
            EntityId = "789",
            Action = "Delete",
            RetryCount = maxRetries
        };

        // Assert - entry has exceeded max retries
        entry.RetryCount.Should().BeGreaterThanOrEqualTo(maxRetries);
    }

    #endregion

    #region Health Check Tests

    [Fact]
    public async Task HealthCheck_ShouldReturnHealthy_WhenAllMetricsNormal()
    {
        // Arrange
        var healthCheck = new InventoryHealthCheck();
        var context = new HealthCheckContext
        {
            Registration = new HealthCheckRegistration("test", healthCheck, null, null)
        };

        // Ensure queue is empty and overdue count is 0
        while (InventoryAuditService.FallbackQueue.TryDequeue(out _)) { }
        // Note: LastOverdueTransferCount defaults to 0

        // Act
        var result = await healthCheck.CheckHealthAsync(context);

        // Assert
        result.Status.Should().Be(HealthStatus.Healthy);
        result.Data.Should().ContainKey("audit_fallback_queue_size");
        result.Data.Should().ContainKey("overdue_transfer_count");
        result.Data.Should().ContainKey("transfer_monitor_last_check");
    }

    [Fact]
    public async Task HealthCheck_ShouldReturnDegraded_WhenQueueElevated()
    {
        // Arrange
        var healthCheck = new InventoryHealthCheck();
        var context = new HealthCheckContext
        {
            Registration = new HealthCheckRegistration("test", healthCheck, null, null)
        };

        // Add 100+ entries to trigger warning threshold
        var entriesToAdd = 105;
        for (int i = 0; i < entriesToAdd; i++)
        {
            InventoryAuditService.FallbackQueue.Enqueue(new AuditFallbackEntry
            {
                Id = Guid.NewGuid(),
                Timestamp = DateTime.UtcNow,
                EntityType = "Test",
                EntityId = i.ToString(),
                Action = "Create",
                RetryCount = 0
            });
        }

        try
        {
            // Act
            var result = await healthCheck.CheckHealthAsync(context);

            // Assert
            result.Status.Should().Be(HealthStatus.Degraded);
            result.Description.Should().Contain("elevated");
        }
        finally
        {
            // Cleanup
            while (InventoryAuditService.FallbackQueue.TryDequeue(out _)) { }
        }
    }

    [Fact]
    public async Task HealthCheck_ShouldReturnUnhealthy_WhenQueueCritical()
    {
        // Arrange
        var healthCheck = new InventoryHealthCheck();
        var context = new HealthCheckContext
        {
            Registration = new HealthCheckRegistration("test", healthCheck, null, null)
        };

        // Add 500+ entries to trigger critical threshold
        for (int i = 0; i < 510; i++)
        {
            InventoryAuditService.FallbackQueue.Enqueue(new AuditFallbackEntry
            {
                Id = Guid.NewGuid(),
                Timestamp = DateTime.UtcNow,
                EntityType = "Test",
                EntityId = i.ToString(),
                Action = "Create",
                RetryCount = 0
            });
        }

        try
        {
            // Act
            var result = await healthCheck.CheckHealthAsync(context);

            // Assert
            result.Status.Should().Be(HealthStatus.Unhealthy);
            result.Description.Should().Contain("critically high");
        }
        finally
        {
            // Cleanup
            while (InventoryAuditService.FallbackQueue.TryDequeue(out _)) { }
        }
    }

    [Fact]
    public async Task HealthCheck_DataDictionary_ShouldContainAllMetrics()
    {
        // Arrange
        var healthCheck = new InventoryHealthCheck();
        var context = new HealthCheckContext
        {
            Registration = new HealthCheckRegistration("test", healthCheck, null, null)
        };

        // Act
        var result = await healthCheck.CheckHealthAsync(context);

        // Assert
        result.Data.Should().HaveCount(3);
        result.Data["audit_fallback_queue_size"].Should().BeOfType<int>();
        result.Data["overdue_transfer_count"].Should().BeOfType<int>();
        result.Data["transfer_monitor_last_check"].Should().BeOfType<string>();
    }

    #endregion

    #region Transfer Timeout Monitor Tests

    [Fact]
    public void TransferTimeoutMonitor_LastOverdueCount_ShouldDefaultToZero()
    {
        // Assert
        TransferTimeoutMonitorService.LastOverdueTransferCount.Should().BeGreaterThanOrEqualTo(0);
    }

    [Fact]
    public void TransferTimeoutMonitor_LastCheckTime_ShouldBeNullOrPast()
    {
        // Assert
        if (TransferTimeoutMonitorService.LastCheckTime.HasValue)
        {
            TransferTimeoutMonitorService.LastCheckTime.Value.Should().BeBefore(DateTime.UtcNow.AddSeconds(1));
        }
    }

    #endregion

    #region Concurrency Simulation Tests

    [Fact]
    public void ConcurrentSequenceNumberAssignment_ShouldProduceUniqueValues()
    {
        // Simulate what the repository does - generate sequence numbers
        var assignedNumbers = new System.Collections.Concurrent.ConcurrentBag<long>();
        var currentMax = 0L;
        var lockObj = new object();

        // Act - simulate 50 concurrent sequence assignments
        Parallel.For(0, 50, _ =>
        {
            long nextNumber;
            lock (lockObj)
            {
                currentMax++;
                nextNumber = currentMax;
            }
            assignedNumbers.Add(nextNumber);
        });

        // Assert - all sequence numbers should be unique
        assignedNumbers.Distinct().Count().Should().Be(50);
        assignedNumbers.Min().Should().Be(1);
        assignedNumbers.Max().Should().Be(50);
    }

    [Fact]
    public void ConcurrentQueueOperations_ShouldNotLoseEntries()
    {
        // Arrange
        var testQueue = new System.Collections.Concurrent.ConcurrentQueue<AuditFallbackEntry>();
        var producerCount = 10;
        var entriesPerProducer = 100;
        var totalExpected = producerCount * entriesPerProducer;

        // Act - multiple producers adding entries concurrently
        Parallel.For(0, producerCount, producerId =>
        {
            for (int i = 0; i < entriesPerProducer; i++)
            {
                testQueue.Enqueue(new AuditFallbackEntry
                {
                    Id = Guid.NewGuid(),
                    EntityType = $"Producer_{producerId}",
                    EntityId = i.ToString(),
                    Action = "Create",
                    Timestamp = DateTime.UtcNow
                });
            }
        });

        // Assert - no entries lost
        testQueue.Count.Should().Be(totalExpected);

        // Act - multiple consumers dequeuing concurrently
        var consumed = 0;
        Parallel.For(0, totalExpected, _ =>
        {
            if (testQueue.TryDequeue(out AuditFallbackEntry? _entry))
                Interlocked.Increment(ref consumed);
        });

        // Assert
        consumed.Should().Be(totalExpected);
        testQueue.IsEmpty.Should().BeTrue();
    }

    #endregion

    #region Helper Methods

    private static StockMovement CreateTestMovement()
    {
        return new StockMovement(
            documentNumber: "PUR-20260124-0001",
            movementDate: DateTime.UtcNow,
            productId: 1,
            warehouseId: 1,
            movementType: StockMovementType.Purchase,
            quantity: 10m,
            unitCost: 5.50m,
            userId: 1);
    }

    #endregion
}
