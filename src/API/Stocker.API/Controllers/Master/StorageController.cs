using MediatR;
using Microsoft.AspNetCore.Mvc;
using Stocker.Application.Common.Interfaces;
using Swashbuckle.AspNetCore.Annotations;

namespace Stocker.API.Controllers.Master;

/// <summary>
/// Master API endpoints for MinIO storage bucket management
/// </summary>
[SwaggerTag("Master Storage - MinIO bucket management")]
public class StorageController : MasterControllerBase
{
    private readonly ITenantStorageService _storageService;

    public StorageController(
        IMediator mediator,
        ITenantStorageService storageService,
        ILogger<StorageController> logger)
        : base(mediator, logger)
    {
        _storageService = storageService;
    }

    /// <summary>
    /// Get all MinIO buckets
    /// </summary>
    [HttpGet("buckets")]
    [SwaggerOperation(
        Summary = "List all MinIO buckets",
        Description = "Returns all buckets in MinIO with their usage statistics"
    )]
    [SwaggerResponse(200, "Buckets retrieved successfully")]
    [SwaggerResponse(401, "Unauthorized")]
    [SwaggerResponse(403, "Forbidden - Master access required")]
    [SwaggerResponse(500, "Internal server error")]
    public async Task<IActionResult> GetAllBuckets(CancellationToken cancellationToken)
    {
        try
        {
            var result = await _storageService.ListAllBucketsAsync(cancellationToken);

            if (result.IsFailure)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = result.Error.Description
                });
            }

            var buckets = result.Value.Select(b => new BucketResponse
            {
                Name = b.Name,
                CreationDate = b.CreationDate,
                UsedBytes = b.UsedBytes,
                UsedMB = Math.Round(b.UsedBytes / (1024.0 * 1024), 2),
                UsedGB = Math.Round(b.UsedBytes / (1024.0 * 1024 * 1024), 4),
                ObjectCount = b.ObjectCount,
                TenantId = b.TenantId
            }).OrderBy(b => b.Name).ToList();

            return Ok(new
            {
                success = true,
                data = buckets,
                totalCount = buckets.Count,
                totalUsedBytes = buckets.Sum(b => b.UsedBytes),
                totalUsedGB = Math.Round(buckets.Sum(b => b.UsedBytes) / (1024.0 * 1024 * 1024), 2),
                totalObjects = buckets.Sum(b => b.ObjectCount)
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to list buckets");
            return StatusCode(500, new
            {
                success = false,
                message = $"Failed to list buckets: {ex.Message}"
            });
        }
    }

    /// <summary>
    /// Delete a bucket by name
    /// </summary>
    [HttpDelete("buckets/{bucketName}")]
    [SwaggerOperation(
        Summary = "Delete a bucket",
        Description = "Deletes a MinIO bucket and all its contents. This operation is IRREVERSIBLE!"
    )]
    [SwaggerResponse(200, "Bucket deleted successfully")]
    [SwaggerResponse(401, "Unauthorized")]
    [SwaggerResponse(403, "Forbidden - Master access required")]
    [SwaggerResponse(500, "Internal server error")]
    public async Task<IActionResult> DeleteBucket(string bucketName, CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogWarning("Master user deleting bucket: {BucketName}", bucketName);

            var result = await _storageService.DeleteBucketByNameAsync(bucketName, cancellationToken);

            if (result.IsFailure)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = result.Error.Description
                });
            }

            _logger.LogInformation("Bucket deleted successfully: {BucketName}", bucketName);

            return Ok(new
            {
                success = true,
                message = $"Bucket '{bucketName}' deleted successfully"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to delete bucket: {BucketName}", bucketName);
            return StatusCode(500, new
            {
                success = false,
                message = $"Failed to delete bucket: {ex.Message}"
            });
        }
    }

    /// <summary>
    /// Delete multiple buckets
    /// </summary>
    [HttpPost("buckets/delete-multiple")]
    [SwaggerOperation(
        Summary = "Delete multiple buckets",
        Description = "Deletes multiple MinIO buckets and all their contents. This operation is IRREVERSIBLE!"
    )]
    [SwaggerResponse(200, "Buckets deleted successfully")]
    [SwaggerResponse(401, "Unauthorized")]
    [SwaggerResponse(403, "Forbidden - Master access required")]
    [SwaggerResponse(500, "Internal server error")]
    public async Task<IActionResult> DeleteMultipleBuckets(
        [FromBody] DeleteBucketsRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            if (request.BucketNames == null || !request.BucketNames.Any())
            {
                return BadRequest(new
                {
                    success = false,
                    message = "No bucket names provided"
                });
            }

            _logger.LogWarning("Master user deleting multiple buckets: {BucketNames}", string.Join(", ", request.BucketNames));

            var results = new List<BucketDeleteResult>();

            foreach (var bucketName in request.BucketNames)
            {
                var result = await _storageService.DeleteBucketByNameAsync(bucketName, cancellationToken);
                results.Add(new BucketDeleteResult
                {
                    BucketName = bucketName,
                    Success = result.IsSuccess,
                    Error = result.IsFailure ? result.Error.Description : null
                });
            }

            var successCount = results.Count(r => r.Success);
            var failCount = results.Count(r => !r.Success);

            return Ok(new
            {
                success = failCount == 0,
                message = $"Deleted {successCount} of {results.Count} buckets",
                results = results,
                successCount,
                failCount
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to delete multiple buckets");
            return StatusCode(500, new
            {
                success = false,
                message = $"Failed to delete buckets: {ex.Message}"
            });
        }
    }
}

#region DTOs

public class BucketResponse
{
    public string Name { get; set; } = string.Empty;
    public DateTime CreationDate { get; set; }
    public long UsedBytes { get; set; }
    public double UsedMB { get; set; }
    public double UsedGB { get; set; }
    public int ObjectCount { get; set; }
    public Guid? TenantId { get; set; }
}

public class DeleteBucketsRequest
{
    public List<string> BucketNames { get; set; } = new();
}

public class BucketDeleteResult
{
    public string BucketName { get; set; } = string.Empty;
    public bool Success { get; set; }
    public string? Error { get; set; }
}

#endregion
