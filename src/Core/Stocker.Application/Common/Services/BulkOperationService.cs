using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.Common.Models;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Stocker.Application.Common.Services;

/// <summary>
/// Service for handling bulk operations
/// </summary>
public class BulkOperationService : IBulkOperationService
{
    private readonly ILogger<BulkOperationService> _logger;

    public BulkOperationService(ILogger<BulkOperationService> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Process items in bulk
    /// </summary>
    public async Task<BulkOperationResponse<T>> ProcessBulkAsync<T>(
        BulkOperationRequest<T> request,
        Func<T, Task<BulkOperationResult<T>>> processItem,
        CancellationToken cancellationToken = default)
    {
        var stopwatch = Stopwatch.StartNew();
        var response = new BulkOperationResponse<T>
        {
            TotalItems = request.Items.Count,
            BatchResults = new List<BatchResult>()
        };

        try
        {
            // Validate before processing if requested
            if (request.ValidateBeforeProcessing)
            {
                var validationResult = await ValidateItemsAsync(request.Items);
                if (!validationResult.IsValid)
                {
                    response.Status = BulkOperationStatus.ValidationFailed;
                    response.FailureCount = request.Items.Count;
                    return response;
                }
            }

            // Process in batches
            var batches = request.Items
                .Select((item, index) => new { item, index })
                .GroupBy(x => x.index / request.BatchSize)
                .Select(g => g.Select(x => x.item).ToList())
                .ToList();

            int batchNumber = 0;
            foreach (var batch in batches)
            {
                if (cancellationToken.IsCancellationRequested)
                {
                    response.Status = BulkOperationStatus.Cancelled;
                    break;
                }

                var batchResult = await ProcessBatchAsync(
                    batch,
                    processItem,
                    request.StopOnFirstError,
                    batchNumber++,
                    cancellationToken);

                response.BatchResults.Add(batchResult);
                response.SuccessCount += batchResult.SuccessCount;
                response.FailureCount += batchResult.FailureCount;

                if (request.StopOnFirstError && batchResult.FailureCount > 0)
                {
                    response.SkippedCount = request.Items.Count - response.SuccessCount - response.FailureCount;
                    break;
                }
            }

            // Determine overall status
            if (response.FailureCount == 0)
            {
                response.Status = BulkOperationStatus.Success;
            }
            else if (response.SuccessCount > 0)
            {
                response.Status = BulkOperationStatus.PartialSuccess;
            }
            else
            {
                response.Status = BulkOperationStatus.Failed;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Bulk operation failed");
            response.Status = BulkOperationStatus.Failed;
        }
        finally
        {
            stopwatch.Stop();
            response.ElapsedTime = stopwatch.Elapsed;
        }

        _logger.LogInformation(
            "Bulk operation completed. Total: {Total}, Success: {Success}, Failed: {Failed}, Time: {Time}ms",
            response.TotalItems,
            response.SuccessCount,
            response.FailureCount,
            response.ElapsedTime.TotalMilliseconds);

        return response;
    }

    private async Task<BatchResult> ProcessBatchAsync<T>(
        List<T> batch,
        Func<T, Task<BulkOperationResult<T>>> processItem,
        bool stopOnFirstError,
        int batchNumber,
        CancellationToken cancellationToken)
    {
        var batchStopwatch = Stopwatch.StartNew();
        var batchResult = new BatchResult
        {
            BatchNumber = batchNumber,
            ItemCount = batch.Count
        };

        var tasks = new List<Task<BulkOperationResult<T>>>();

        foreach (var item in batch)
        {
            if (cancellationToken.IsCancellationRequested)
            {
                break;
            }

            if (stopOnFirstError && batchResult.FailureCount > 0)
            {
                break;
            }

            // Process items in parallel within batch
            tasks.Add(processItem(item));
        }

        var results = await Task.WhenAll(tasks);

        foreach (var result in results)
        {
            if (result.Success)
            {
                batchResult.SuccessCount++;
            }
            else
            {
                batchResult.FailureCount++;
            }
        }

        // Determine batch status
        if (batchResult.FailureCount == 0)
        {
            batchResult.Status = BatchStatus.Success;
        }
        else if (batchResult.SuccessCount > 0)
        {
            batchResult.Status = BatchStatus.PartialSuccess;
        }
        else
        {
            batchResult.Status = BatchStatus.Failed;
        }

        batchStopwatch.Stop();
        batchResult.ElapsedTime = batchStopwatch.Elapsed;

        return batchResult;
    }

    private Task<ValidationResult> ValidateItemsAsync<T>(List<T> items)
    {
        // Placeholder for validation logic
        // In real implementation, this would use FluentValidation or similar
        return Task.FromResult(new ValidationResult { IsValid = true });
    }

    private class ValidationResult
    {
        public bool IsValid { get; set; }
        public List<string> Errors { get; set; } = new();
    }
}

/// <summary>
/// Interface for bulk operation service
/// </summary>
public interface IBulkOperationService
{
    /// <summary>
    /// Process items in bulk
    /// </summary>
    Task<BulkOperationResponse<T>> ProcessBulkAsync<T>(
        BulkOperationRequest<T> request,
        Func<T, Task<BulkOperationResult<T>>> processItem,
        CancellationToken cancellationToken = default);
}