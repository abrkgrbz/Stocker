namespace Stocker.Application.Common.Interfaces;

/// <summary>
/// File storage service interface for CMS media uploads
/// </summary>
public interface IFileStorageService
{
    /// <summary>
    /// Uploads a file to storage
    /// </summary>
    /// <param name="stream">File stream</param>
    /// <param name="path">Storage path</param>
    /// <param name="contentType">MIME type</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Public URL of the uploaded file</returns>
    Task<string> UploadFileAsync(Stream stream, string path, string contentType, CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes a file from storage
    /// </summary>
    /// <param name="path">Storage path</param>
    /// <param name="cancellationToken">Cancellation token</param>
    Task DeleteFileAsync(string path, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a signed URL for accessing a file
    /// </summary>
    /// <param name="path">Storage path</param>
    /// <param name="expiresIn">URL expiration time</param>
    /// <returns>Signed URL</returns>
    Task<string> GetSignedUrlAsync(string path, TimeSpan expiresIn);

    /// <summary>
    /// Checks if a file exists
    /// </summary>
    /// <param name="path">Storage path</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>True if file exists</returns>
    Task<bool> ExistsAsync(string path, CancellationToken cancellationToken = default);
}
