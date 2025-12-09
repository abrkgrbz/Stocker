using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.API.Controllers.Base;
using Stocker.Application.Common.Interfaces;
using Swashbuckle.AspNetCore.Annotations;
using ICurrentUserService = Stocker.SharedKernel.Interfaces.ICurrentUserService;

namespace Stocker.API.Controllers.Tenant;

/// <summary>
/// API endpoints for tenant storage management and quota monitoring
/// </summary>
[Route("api/tenant/[controller]")]
[ApiController]
[Authorize]
[SwaggerTag("Storage - Tenant storage bucket and quota management")]
public class StorageController : ApiController
{
    private readonly ITenantStorageService _tenantStorageService;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<StorageController> _logger;

    public StorageController(
        ITenantStorageService tenantStorageService,
        ICurrentUserService currentUserService,
        ILogger<StorageController> logger)
    {
        _tenantStorageService = tenantStorageService;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    /// <summary>
    /// Get current storage usage for the tenant
    /// </summary>
    /// <returns>Storage usage information including quota, used space, and object count</returns>
    [HttpGet("usage")]
    [SwaggerOperation(
        Summary = "Get tenant storage usage",
        Description = "Returns current storage usage including quota, used bytes, available bytes, and object count"
    )]
    [SwaggerResponse(200, "Storage usage retrieved successfully")]
    [SwaggerResponse(401, "Unauthorized - missing or invalid token")]
    [SwaggerResponse(404, "Tenant bucket not found")]
    [SwaggerResponse(500, "Internal server error")]
    public async Task<IActionResult> GetStorageUsage(CancellationToken cancellationToken)
    {
        var tenantId = _currentUserService.TenantId;
        if (tenantId == null || tenantId == Guid.Empty)
        {
            return Unauthorized(new ApiResponse<object>
            {
                Success = false,
                Message = "Tenant bilgisi bulunamadı"
            });
        }

        var result = await _tenantStorageService.GetTenantStorageUsageAsync(tenantId.Value, cancellationToken);

        if (result.IsFailure)
        {
            if (result.Error.Code == "Storage.BucketNotFound")
            {
                return NotFound(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Depolama alanı henüz oluşturulmamış"
                });
            }

            return StatusCode(500, new ApiResponse<object>
            {
                Success = false,
                Message = result.Error.Description
            });
        }

        return Ok(new ApiResponse<StorageUsageResponse>
        {
            Success = true,
            Data = new StorageUsageResponse
            {
                BucketName = result.Value.BucketName,
                QuotaGB = result.Value.QuotaBytes / (1024.0 * 1024 * 1024),
                UsedGB = result.Value.UsedBytes / (1024.0 * 1024 * 1024),
                AvailableGB = result.Value.AvailableBytes / (1024.0 * 1024 * 1024),
                UsagePercentage = result.Value.UsagePercentage,
                ObjectCount = result.Value.ObjectCount,
                QuotaBytes = result.Value.QuotaBytes,
                UsedBytes = result.Value.UsedBytes,
                AvailableBytes = result.Value.AvailableBytes
            },
            Message = "Depolama kullanımı başarıyla alındı"
        });
    }

    /// <summary>
    /// Check if tenant storage bucket exists
    /// </summary>
    [HttpGet("exists")]
    [SwaggerOperation(
        Summary = "Check if tenant bucket exists",
        Description = "Returns whether the tenant's storage bucket has been created"
    )]
    [SwaggerResponse(200, "Bucket existence check completed")]
    [SwaggerResponse(401, "Unauthorized")]
    public async Task<IActionResult> CheckBucketExists(CancellationToken cancellationToken)
    {
        var tenantId = _currentUserService.TenantId;
        if (tenantId == null || tenantId == Guid.Empty)
        {
            return Unauthorized(new ApiResponse<object>
            {
                Success = false,
                Message = "Tenant bilgisi bulunamadı"
            });
        }

        var result = await _tenantStorageService.TenantBucketExistsAsync(tenantId.Value, cancellationToken);

        if (result.IsFailure)
        {
            return StatusCode(500, new ApiResponse<object>
            {
                Success = false,
                Message = result.Error.Description
            });
        }

        return Ok(new ApiResponse<BucketExistsResponse>
        {
            Success = true,
            Data = new BucketExistsResponse
            {
                Exists = result.Value,
                BucketName = _tenantStorageService.GetTenantBucketName(tenantId.Value)
            }
        });
    }

    /// <summary>
    /// Get the bucket name for the current tenant
    /// </summary>
    [HttpGet("bucket-name")]
    [SwaggerOperation(
        Summary = "Get tenant bucket name",
        Description = "Returns the MinIO bucket name for the current tenant"
    )]
    [SwaggerResponse(200, "Bucket name retrieved")]
    [SwaggerResponse(401, "Unauthorized")]
    public IActionResult GetBucketName()
    {
        var tenantId = _currentUserService.TenantId;
        if (tenantId == null || tenantId == Guid.Empty)
        {
            return Unauthorized(new ApiResponse<object>
            {
                Success = false,
                Message = "Tenant bilgisi bulunamadı"
            });
        }

        var bucketName = _tenantStorageService.GetTenantBucketName(tenantId.Value);

        return Ok(new ApiResponse<BucketNameResponse>
        {
            Success = true,
            Data = new BucketNameResponse
            {
                BucketName = bucketName
            }
        });
    }
}

#region Response DTOs

public class StorageUsageResponse
{
    public string BucketName { get; set; } = string.Empty;
    public double QuotaGB { get; set; }
    public double UsedGB { get; set; }
    public double AvailableGB { get; set; }
    public double UsagePercentage { get; set; }
    public int ObjectCount { get; set; }
    public long QuotaBytes { get; set; }
    public long UsedBytes { get; set; }
    public long AvailableBytes { get; set; }
}

public class BucketExistsResponse
{
    public bool Exists { get; set; }
    public string BucketName { get; set; } = string.Empty;
}

public class BucketNameResponse
{
    public string BucketName { get; set; } = string.Empty;
}

#endregion
