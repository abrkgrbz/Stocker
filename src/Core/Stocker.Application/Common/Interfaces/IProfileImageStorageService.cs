using Stocker.SharedKernel.Results;

namespace Stocker.Application.Common.Interfaces;

/// <summary>
/// Service for managing profile images in MinIO storage
/// </summary>
public interface IProfileImageStorageService
{
    /// <summary>
    /// Uploads a profile image to MinIO storage
    /// </summary>
    /// <param name="tenantId">Tenant ID (null for master admin)</param>
    /// <param name="userId">User ID</param>
    /// <param name="imageStream">Image file stream</param>
    /// <param name="contentType">Content type of the image</param>
    /// <param name="fileName">Original file name</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Result containing the public URL of the uploaded image</returns>
    Task<Result<string>> UploadProfileImageAsync(
        Guid? tenantId,
        Guid userId,
        Stream imageStream,
        string contentType,
        string fileName,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes a profile image from MinIO storage
    /// </summary>
    /// <param name="tenantId">Tenant ID (null for master admin)</param>
    /// <param name="userId">User ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    Task<Result> DeleteProfileImageAsync(
        Guid? tenantId,
        Guid userId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the presigned URL for a profile image
    /// </summary>
    /// <param name="tenantId">Tenant ID (null for master admin)</param>
    /// <param name="userId">User ID</param>
    /// <param name="expiryInHours">URL expiry time in hours</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Result containing the presigned URL</returns>
    Task<Result<string>> GetProfileImageUrlAsync(
        Guid? tenantId,
        Guid userId,
        int expiryInHours = 24,
        CancellationToken cancellationToken = default);
}
