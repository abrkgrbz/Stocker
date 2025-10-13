using System;
using System.Collections.Generic;

namespace Stocker.Application.Common.Models;

/// <summary>
/// Request model for bulk operations
/// </summary>
/// <typeparam name="T">Type of items to operate on</typeparam>
public class BulkOperationRequest<T>
{
    /// <summary>
    /// Items to process in bulk
    /// </summary>
    public List<T> Items { get; set; } = new();

    /// <summary>
    /// Operation to perform (create, update, delete, patch)
    /// </summary>
    public BulkOperationType Operation { get; set; } = BulkOperationType.Create;

    /// <summary>
    /// Whether to stop on first error or continue
    /// </summary>
    public bool StopOnFirstError { get; set; } = false;

    /// <summary>
    /// Whether to validate all items before processing
    /// </summary>
    public bool ValidateBeforeProcessing { get; set; } = true;

    /// <summary>
    /// Whether to use transaction for the bulk operation
    /// </summary>
    public bool UseTransaction { get; set; } = true;

    /// <summary>
    /// Batch size for processing
    /// </summary>
    public int BatchSize { get; set; } = 100;
}

/// <summary>
/// Response model for bulk operations
/// </summary>
/// <typeparam name="T">Type of processed items</typeparam>
public class BulkOperationResponse<T>
{
    /// <summary>
    /// Total items processed
    /// </summary>
    public int TotalItems { get; set; }

    /// <summary>
    /// Successfully processed items count
    /// </summary>
    public int SuccessCount { get; set; }

    /// <summary>
    /// Failed items count
    /// </summary>
    public int FailureCount { get; set; }

    /// <summary>
    /// Skipped items count
    /// </summary>
    public int SkippedCount { get; set; }

    /// <summary>
    /// Time taken for the operation
    /// </summary>
    public TimeSpan ElapsedTime { get; set; }

    /// <summary>
    /// Successfully processed items
    /// </summary>
    public List<BulkOperationResult<T>> SuccessfulItems { get; set; } = new();

    /// <summary>
    /// Failed items with error details
    /// </summary>
    public List<BulkOperationResult<T>> FailedItems { get; set; } = new();

    /// <summary>
    /// Overall operation status
    /// </summary>
    public BulkOperationStatus Status { get; set; }

    /// <summary>
    /// Batch processing details
    /// </summary>
    public List<BatchResult>? BatchResults { get; set; }
}

/// <summary>
/// Result for individual item in bulk operation
/// </summary>
/// <typeparam name="T">Type of the item</typeparam>
public class BulkOperationResult<T>
{
    /// <summary>
    /// Original item index in the request
    /// </summary>
    public int Index { get; set; }

    /// <summary>
    /// The item that was processed
    /// </summary>
    public T? Item { get; set; }

    /// <summary>
    /// Identifier of the processed item
    /// </summary>
    public string? Id { get; set; }

    /// <summary>
    /// Whether the operation succeeded
    /// </summary>
    public bool Success { get; set; }

    /// <summary>
    /// Error message if failed
    /// </summary>
    public string? ErrorMessage { get; set; }

    /// <summary>
    /// Error code if failed
    /// </summary>
    public string? ErrorCode { get; set; }

    /// <summary>
    /// Validation errors if any
    /// </summary>
    public Dictionary<string, string[]>? ValidationErrors { get; set; }

    /// <summary>
    /// HTTP status code for this item
    /// </summary>
    public int StatusCode { get; set; }
}

/// <summary>
/// Result for a batch in bulk operation
/// </summary>
public class BatchResult
{
    /// <summary>
    /// Batch number
    /// </summary>
    public int BatchNumber { get; set; }

    /// <summary>
    /// Items in this batch
    /// </summary>
    public int ItemCount { get; set; }

    /// <summary>
    /// Successful items in batch
    /// </summary>
    public int SuccessCount { get; set; }

    /// <summary>
    /// Failed items in batch
    /// </summary>
    public int FailureCount { get; set; }

    /// <summary>
    /// Time taken for this batch
    /// </summary>
    public TimeSpan ElapsedTime { get; set; }

    /// <summary>
    /// Batch status
    /// </summary>
    public BatchStatus Status { get; set; }
}

/// <summary>
/// Type of bulk operation
/// </summary>
public enum BulkOperationType
{
    Create,
    Update,
    Delete,
    Patch,
    Upsert
}

/// <summary>
/// Overall status of bulk operation
/// </summary>
public enum BulkOperationStatus
{
    /// <summary>
    /// All items processed successfully
    /// </summary>
    Success,

    /// <summary>
    /// Some items succeeded, some failed
    /// </summary>
    PartialSuccess,

    /// <summary>
    /// All items failed
    /// </summary>
    Failed,

    /// <summary>
    /// Operation was cancelled
    /// </summary>
    Cancelled,

    /// <summary>
    /// Validation failed before processing
    /// </summary>
    ValidationFailed
}

/// <summary>
/// Status of a batch
/// </summary>
public enum BatchStatus
{
    Success,
    PartialSuccess,
    Failed,
    Skipped
}

/// <summary>
/// Options for bulk delete operations
/// </summary>
public class BulkDeleteOptions
{
    /// <summary>
    /// IDs of items to delete
    /// </summary>
    public List<string> Ids { get; set; } = new();

    /// <summary>
    /// Whether to perform soft delete
    /// </summary>
    public bool SoftDelete { get; set; } = true;

    /// <summary>
    /// Whether to cascade delete related entities
    /// </summary>
    public bool CascadeDelete { get; set; } = false;

    /// <summary>
    /// Whether to check for references before deleting
    /// </summary>
    public bool CheckReferences { get; set; } = true;
}

/// <summary>
/// Options for bulk update operations
/// </summary>
public class BulkUpdateOptions<T>
{
    /// <summary>
    /// Items to update
    /// </summary>
    public List<T> Items { get; set; } = new();

    /// <summary>
    /// Fields to update (null means all fields)
    /// </summary>
    public string[]? UpdateFields { get; set; }

    /// <summary>
    /// Whether to skip unchanged items
    /// </summary>
    public bool SkipUnchanged { get; set; } = true;

    /// <summary>
    /// Whether to update timestamps
    /// </summary>
    public bool UpdateTimestamps { get; set; } = true;
}