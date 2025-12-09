using Stocker.SharedKernel.Results;

namespace Stocker.Application.Common.Interfaces;

/// <summary>
/// Service for managing tenant-specific storage buckets and quotas in MinIO
/// </summary>
public interface ITenantStorageService
{
    /// <summary>
    /// Creates a dedicated storage bucket for a tenant with the specified quota
    /// </summary>
    /// <param name="tenantId">The tenant's unique identifier</param>
    /// <param name="quotaGB">Storage quota in gigabytes</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Result containing the bucket name if successful</returns>
    Task<Result<string>> CreateTenantBucketAsync(
        Guid tenantId,
        long quotaGB,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates the storage quota for an existing tenant bucket
    /// </summary>
    /// <param name="tenantId">The tenant's unique identifier</param>
    /// <param name="newQuotaGB">New storage quota in gigabytes</param>
    /// <param name="cancellationToken">Cancellation token</param>
    Task<Result> UpdateTenantQuotaAsync(
        Guid tenantId,
        long newQuotaGB,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the current storage usage for a tenant
    /// </summary>
    /// <param name="tenantId">The tenant's unique identifier</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Result containing storage usage information</returns>
    Task<Result<TenantStorageUsage>> GetTenantStorageUsageAsync(
        Guid tenantId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if a tenant's bucket exists
    /// </summary>
    /// <param name="tenantId">The tenant's unique identifier</param>
    /// <param name="cancellationToken">Cancellation token</param>
    Task<Result<bool>> TenantBucketExistsAsync(
        Guid tenantId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes a tenant's storage bucket and all its contents
    /// WARNING: This operation is irreversible
    /// </summary>
    /// <param name="tenantId">The tenant's unique identifier</param>
    /// <param name="cancellationToken">Cancellation token</param>
    Task<Result> DeleteTenantBucketAsync(
        Guid tenantId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the bucket name for a tenant
    /// </summary>
    /// <param name="tenantId">The tenant's unique identifier</param>
    /// <returns>The bucket name</returns>
    string GetTenantBucketName(Guid tenantId);
}

/// <summary>
/// Storage usage information for a tenant
/// </summary>
public record TenantStorageUsage(
    string BucketName,
    long QuotaBytes,
    long UsedBytes,
    long AvailableBytes,
    double UsagePercentage,
    int ObjectCount);
