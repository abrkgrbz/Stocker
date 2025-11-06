using Microsoft.Extensions.Configuration;
using Stocker.SharedKernel.Results;
using Microsoft.Extensions.Logging;
using Stocker.Modules.CRM.Application.Contracts;
using Stocker.SharedKernel.Common;

namespace Stocker.Modules.CRM.Infrastructure.Services;

/// <summary>
/// Local file system implementation of document storage
/// For production, use Azure Blob Storage or AWS S3
/// </summary>
public class LocalDocumentStorageService : IDocumentStorageService
{
    private readonly string _storagePath;
    private readonly string _baseUrl;
    private readonly ILogger<LocalDocumentStorageService> _logger;

    public LocalDocumentStorageService(
        IConfiguration configuration,
        ILogger<LocalDocumentStorageService> logger)
    {
        _storagePath = configuration["DocumentStorage:LocalPath"] ?? "uploads/documents";
        _baseUrl = configuration["DocumentStorage:BaseUrl"] ?? "http://localhost:5000/documents";
        _logger = logger;

        // Ensure storage directory exists
        if (!Directory.Exists(_storagePath))
        {
            Directory.CreateDirectory(_storagePath);
        }
    }

    public async Task<Result<DocumentStorageResult>> UploadFileAsync(
        byte[] fileData,
        string fileName,
        string contentType,
        Guid tenantId,
        string entityType,
        string entityId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            // Generate organized folder structure: tenant/entityType/entityId/year/month/day
            var now = DateTime.UtcNow;
            var folderPath = Path.Combine(
                _storagePath,
                tenantId.ToString(),
                entityType.ToLowerInvariant(),
                entityId,
                now.ToString("yyyy"),
                now.ToString("MM"),
                now.ToString("dd")
            );

            if (!Directory.Exists(folderPath))
            {
                Directory.CreateDirectory(folderPath);
            }

            var uniqueFileName = $"{now:yyyyMMdd_HHmmss}_{Guid.NewGuid():N}_{Path.GetFileName(fileName)}";
            var filePath = Path.Combine(folderPath, uniqueFileName);

            await File.WriteAllBytesAsync(filePath, fileData, cancellationToken);

            var relativePath = Path.GetRelativePath(_storagePath, filePath);
            var url = $"{_baseUrl}/{relativePath.Replace("\\", "/")}";

            _logger.LogInformation(
                "File uploaded successfully to local storage. Tenant: {TenantId}, Entity: {EntityType}/{EntityId}, Path: {FilePath}",
                tenantId, entityType, entityId, relativePath);

            return Result<DocumentStorageResult>.Success(
                new DocumentStorageResult(relativePath, "Local", url));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading file to local storage: {FileName}", fileName);
            return Result<DocumentStorageResult>.Failure(Error.Failure("DocumentStorage.Upload", $"Failed to upload file: {ex.Message}"));
        }
    }

    public async Task<Result<byte[]>> DownloadFileAsync(
        string storagePath,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var filePath = Path.Combine(_storagePath, storagePath);

            if (!File.Exists(filePath))
            {
                return Result<byte[]>.Failure(Error.NotFound("DocumentStorage.File", "File not found in storage"));
            }

            var fileData = await File.ReadAllBytesAsync(filePath, cancellationToken);

            _logger.LogInformation("File downloaded successfully from local storage: {FilePath}", storagePath);

            return Result<byte[]>.Success(fileData);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error downloading file from local storage: {StoragePath}", storagePath);
            return Result<byte[]>.Failure(Error.Failure("DocumentStorage.Download", $"Failed to download file: {ex.Message}"));
        }
    }

    public Task<Result> DeleteFileAsync(
        string storagePath,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var filePath = Path.Combine(_storagePath, storagePath);

            if (!File.Exists(filePath))
            {
                return Task.FromResult(Result.Failure(Error.NotFound("DocumentStorage.File", "File not found in storage")));
            }

            File.Delete(filePath);

            _logger.LogInformation("File deleted successfully from local storage: {FilePath}", storagePath);

            return Task.FromResult(Result.Success());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting file from local storage: {StoragePath}", storagePath);
            return Task.FromResult(Result.Failure(Error.Failure("DocumentStorage.Delete", $"Failed to delete file: {ex.Message}")));
        }
    }

    public Task<Result<string>> GetDownloadUrlAsync(
        string storagePath,
        TimeSpan expiresIn,
        CancellationToken cancellationToken = default)
    {
        try
        {
            // For local storage, return direct URL (no expiration)
            // In production with Azure/AWS, generate signed URL with expiration
            var url = $"{_baseUrl}/{storagePath.Replace("\\", "/")}";

            return Task.FromResult(Result<string>.Success(url));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating download URL: {StoragePath}", storagePath);
            return Task.FromResult(Result<string>.Failure(Error.Failure("DocumentStorage.Url", $"Failed to generate download URL: {ex.Message}")));
        }
    }

    public Task<Result<bool>> FileExistsAsync(
        string storagePath,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var filePath = Path.Combine(_storagePath, storagePath);
            var exists = File.Exists(filePath);

            return Task.FromResult(Result<bool>.Success(exists));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking file existence: {StoragePath}", storagePath);
            return Task.FromResult(Result<bool>.Failure(Error.Failure("DocumentStorage.Exists", $"Failed to check file existence: {ex.Message}")));
        }
    }
}
