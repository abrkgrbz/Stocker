using MediatR;
using Microsoft.AspNetCore.Mvc;
using Stocker.Application.Common.Interfaces;
using Swashbuckle.AspNetCore.Annotations;
using System.Net.Mime;

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

    // ==================== FILE BROWSER ENDPOINTS ====================

    /// <summary>
    /// Create a new bucket
    /// </summary>
    [HttpPost("buckets")]
    [SwaggerOperation(
        Summary = "Create a new bucket",
        Description = "Creates a new MinIO bucket"
    )]
    [SwaggerResponse(200, "Bucket created successfully")]
    [SwaggerResponse(400, "Invalid bucket name")]
    [SwaggerResponse(409, "Bucket already exists")]
    public async Task<IActionResult> CreateBucket(
        [FromBody] CreateBucketRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.BucketName))
            {
                return BadRequest(new { success = false, message = "Bucket name is required" });
            }

            // Validate bucket name (lowercase, 3-63 chars, no special chars except dash)
            var bucketName = request.BucketName.ToLowerInvariant().Trim();
            if (bucketName.Length < 3 || bucketName.Length > 63)
            {
                return BadRequest(new { success = false, message = "Bucket name must be between 3 and 63 characters" });
            }

            var result = await _storageService.CreateBucketAsync(bucketName, cancellationToken);

            if (result.IsFailure)
            {
                if (result.Error.Code == "Storage.BucketExists")
                {
                    return Conflict(new { success = false, message = result.Error.Description });
                }
                return StatusCode(500, new { success = false, message = result.Error.Description });
            }

            return Ok(new { success = true, message = $"Bucket '{bucketName}' created successfully", bucketName });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create bucket: {BucketName}", request.BucketName);
            return StatusCode(500, new { success = false, message = $"Failed to create bucket: {ex.Message}" });
        }
    }

    /// <summary>
    /// List objects in a bucket
    /// </summary>
    [HttpGet("buckets/{bucketName}/objects")]
    [SwaggerOperation(
        Summary = "List objects in a bucket",
        Description = "Returns all objects (files and folders) in a bucket with optional prefix filtering"
    )]
    [SwaggerResponse(200, "Objects retrieved successfully")]
    [SwaggerResponse(404, "Bucket not found")]
    public async Task<IActionResult> ListObjects(
        string bucketName,
        [FromQuery] string? prefix = null,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var result = await _storageService.ListObjectsAsync(bucketName, prefix, cancellationToken);

            if (result.IsFailure)
            {
                if (result.Error.Code == "Storage.BucketNotFound")
                {
                    return NotFound(new { success = false, message = result.Error.Description });
                }
                return StatusCode(500, new { success = false, message = result.Error.Description });
            }

            var objects = result.Value.Select(o => new StorageObjectResponse
            {
                Name = o.Name,
                Key = o.Key,
                Size = o.Size,
                LastModified = o.LastModified,
                ContentType = o.ContentType,
                IsFolder = o.IsFolder,
                ETag = o.ETag
            }).ToList();

            return Ok(new
            {
                success = true,
                data = objects,
                bucketName,
                prefix = prefix ?? "",
                totalCount = objects.Count,
                totalSize = objects.Where(o => !o.IsFolder).Sum(o => o.Size),
                folderCount = objects.Count(o => o.IsFolder),
                fileCount = objects.Count(o => !o.IsFolder)
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to list objects in bucket: {BucketName}", bucketName);
            return StatusCode(500, new { success = false, message = $"Failed to list objects: {ex.Message}" });
        }
    }

    /// <summary>
    /// Upload a file to a bucket
    /// </summary>
    [HttpPost("buckets/{bucketName}/upload")]
    [SwaggerOperation(
        Summary = "Upload a file to a bucket",
        Description = "Uploads a file to the specified bucket with optional path prefix"
    )]
    [SwaggerResponse(200, "File uploaded successfully")]
    [SwaggerResponse(400, "No file provided")]
    [RequestSizeLimit(104857600)] // 100MB limit
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UploadFile(
        string bucketName,
        [FromForm] List<IFormFile> files,
        [FromQuery] string? path = null,
        CancellationToken cancellationToken = default)
    {
        try
        {
            if (files == null || files.Count == 0)
            {
                return BadRequest(new { success = false, message = "No file provided" });
            }

            var results = new List<object>();

            foreach (var file in files)
            {
                // Build object name with optional path prefix
                var objectName = string.IsNullOrEmpty(path)
                    ? file.FileName
                    : $"{path.TrimEnd('/')}/{file.FileName}";

                using var stream = file.OpenReadStream();
                var result = await _storageService.UploadObjectAsync(
                    bucketName,
                    objectName,
                    stream,
                    file.ContentType ?? "application/octet-stream",
                    cancellationToken);

                if (result.IsSuccess)
                {
                    results.Add(new
                    {
                        success = true,
                        fileName = file.FileName,
                        objectName = result.Value.ObjectName,
                        size = result.Value.Size,
                        etag = result.Value.ETag,
                        url = result.Value.Url
                    });
                }
                else
                {
                    results.Add(new
                    {
                        success = false,
                        fileName = file.FileName,
                        error = result.Error.Description
                    });
                }
            }

            var successCount = results.Count(r => ((dynamic)r).success);
            var failCount = results.Count - successCount;

            return Ok(new
            {
                success = failCount == 0,
                message = $"Uploaded {successCount} of {results.Count} files",
                results,
                successCount,
                failCount
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to upload file to bucket: {BucketName}", bucketName);
            return StatusCode(500, new { success = false, message = $"Failed to upload file: {ex.Message}" });
        }
    }

    /// <summary>
    /// Download a file from a bucket
    /// </summary>
    [HttpGet("buckets/{bucketName}/objects/download")]
    [SwaggerOperation(
        Summary = "Download a file from a bucket",
        Description = "Downloads a file from the specified bucket"
    )]
    [SwaggerResponse(200, "File downloaded successfully")]
    [SwaggerResponse(404, "Object not found")]
    public async Task<IActionResult> DownloadFile(
        string bucketName,
        [FromQuery] string objectName,
        CancellationToken cancellationToken)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(objectName))
            {
                return BadRequest(new { success = false, message = "Object name is required" });
            }

            var result = await _storageService.DownloadObjectAsync(bucketName, objectName, cancellationToken);

            if (result.IsFailure)
            {
                if (result.Error.Code == "Storage.ObjectNotFound")
                {
                    return NotFound(new { success = false, message = result.Error.Description });
                }
                return StatusCode(500, new { success = false, message = result.Error.Description });
            }

            var download = result.Value;
            return File(download.Data, download.ContentType, download.FileName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to download file: {BucketName}/{ObjectName}", bucketName, objectName);
            return StatusCode(500, new { success = false, message = $"Failed to download file: {ex.Message}" });
        }
    }

    /// <summary>
    /// Get presigned URL for a file
    /// </summary>
    [HttpGet("buckets/{bucketName}/objects/url")]
    [SwaggerOperation(
        Summary = "Get presigned URL for a file",
        Description = "Generates a presigned URL for downloading a file"
    )]
    [SwaggerResponse(200, "URL generated successfully")]
    [SwaggerResponse(404, "Object not found")]
    public async Task<IActionResult> GetPresignedUrl(
        string bucketName,
        [FromQuery] string objectName,
        [FromQuery] int expiresInHours = 24,
        CancellationToken cancellationToken = default)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(objectName))
            {
                return BadRequest(new { success = false, message = "Object name is required" });
            }

            var result = await _storageService.GetPresignedUrlAsync(
                bucketName,
                objectName,
                TimeSpan.FromHours(expiresInHours),
                cancellationToken);

            if (result.IsFailure)
            {
                return StatusCode(500, new { success = false, message = result.Error.Description });
            }

            return Ok(new
            {
                success = true,
                url = result.Value,
                objectName,
                expiresInHours,
                expiresAt = DateTime.UtcNow.AddHours(expiresInHours)
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to generate presigned URL: {BucketName}/{ObjectName}", bucketName, objectName);
            return StatusCode(500, new { success = false, message = $"Failed to generate URL: {ex.Message}" });
        }
    }

    /// <summary>
    /// Delete an object from a bucket
    /// </summary>
    [HttpDelete("buckets/{bucketName}/objects")]
    [SwaggerOperation(
        Summary = "Delete an object from a bucket",
        Description = "Deletes a single object from the specified bucket"
    )]
    [SwaggerResponse(200, "Object deleted successfully")]
    public async Task<IActionResult> DeleteObject(
        string bucketName,
        [FromQuery] string objectName,
        CancellationToken cancellationToken)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(objectName))
            {
                return BadRequest(new { success = false, message = "Object name is required" });
            }

            _logger.LogWarning("Deleting object: {BucketName}/{ObjectName}", bucketName, objectName);

            var result = await _storageService.DeleteObjectAsync(bucketName, objectName, cancellationToken);

            if (result.IsFailure)
            {
                return StatusCode(500, new { success = false, message = result.Error.Description });
            }

            return Ok(new { success = true, message = $"Object '{objectName}' deleted successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to delete object: {BucketName}/{ObjectName}", bucketName, objectName);
            return StatusCode(500, new { success = false, message = $"Failed to delete object: {ex.Message}" });
        }
    }

    /// <summary>
    /// Delete multiple objects from a bucket
    /// </summary>
    [HttpPost("buckets/{bucketName}/objects/delete-multiple")]
    [SwaggerOperation(
        Summary = "Delete multiple objects from a bucket",
        Description = "Deletes multiple objects from the specified bucket"
    )]
    [SwaggerResponse(200, "Objects deleted successfully")]
    public async Task<IActionResult> DeleteMultipleObjects(
        string bucketName,
        [FromBody] DeleteObjectsRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            if (request.ObjectNames == null || !request.ObjectNames.Any())
            {
                return BadRequest(new { success = false, message = "No object names provided" });
            }

            _logger.LogWarning("Deleting {Count} objects from bucket: {BucketName}", request.ObjectNames.Count, bucketName);

            var result = await _storageService.DeleteObjectsAsync(bucketName, request.ObjectNames, cancellationToken);

            if (result.IsFailure)
            {
                return StatusCode(500, new { success = false, message = result.Error.Description });
            }

            return Ok(new
            {
                success = true,
                message = $"Deleted {result.Value} objects",
                deletedCount = result.Value
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to delete objects from bucket: {BucketName}", bucketName);
            return StatusCode(500, new { success = false, message = $"Failed to delete objects: {ex.Message}" });
        }
    }

    /// <summary>
    /// Create a folder in a bucket
    /// </summary>
    [HttpPost("buckets/{bucketName}/folders")]
    [SwaggerOperation(
        Summary = "Create a folder in a bucket",
        Description = "Creates a new folder (empty object with trailing slash) in the specified bucket"
    )]
    [SwaggerResponse(200, "Folder created successfully")]
    public async Task<IActionResult> CreateFolder(
        string bucketName,
        [FromBody] CreateFolderRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.FolderPath))
            {
                return BadRequest(new { success = false, message = "Folder path is required" });
            }

            var result = await _storageService.CreateFolderAsync(bucketName, request.FolderPath, cancellationToken);

            if (result.IsFailure)
            {
                return StatusCode(500, new { success = false, message = result.Error.Description });
            }

            return Ok(new
            {
                success = true,
                message = $"Folder '{request.FolderPath}' created successfully",
                folderPath = request.FolderPath
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create folder: {BucketName}/{FolderPath}", bucketName, request.FolderPath);
            return StatusCode(500, new { success = false, message = $"Failed to create folder: {ex.Message}" });
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

public class CreateBucketRequest
{
    public string BucketName { get; set; } = string.Empty;
}

public class CreateFolderRequest
{
    public string FolderPath { get; set; } = string.Empty;
}

public class DeleteObjectsRequest
{
    public List<string> ObjectNames { get; set; } = new();
}

public class StorageObjectResponse
{
    public string Name { get; set; } = string.Empty;
    public string Key { get; set; } = string.Empty;
    public long Size { get; set; }
    public DateTime LastModified { get; set; }
    public string ContentType { get; set; } = string.Empty;
    public bool IsFolder { get; set; }
    public string? ETag { get; set; }
    public string? Url { get; set; }
}

#endregion
