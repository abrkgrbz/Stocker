using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Minio;
using Minio.DataModel.Args;
using Stocker.Application.Common.Interfaces;
using Stocker.Infrastructure.Configuration;
using Stocker.SharedKernel.Results;

namespace Stocker.Infrastructure.Services;

/// <summary>
/// MinIO-based implementation of backup storage service
/// Stores backups in tenant bucket under 'backups/' folder
/// Path format: {tenant-bucket}/backups/{backupId}/{filename}
/// </summary>
public class MinioBackupStorageService : IBackupStorageService
{
    private readonly IMinioClient _minioClient;
    private readonly ITenantStorageService _tenantStorageService;
    private readonly MinioStorageSettings _settings;
    private readonly ILogger<MinioBackupStorageService> _logger;

    private const string BackupsFolder = "backups";

    public MinioBackupStorageService(
        IMinioClient minioClient,
        ITenantStorageService tenantStorageService,
        IOptions<MinioStorageSettings> settings,
        ILogger<MinioBackupStorageService> logger)
    {
        _minioClient = minioClient;
        _tenantStorageService = tenantStorageService;
        _settings = settings.Value;
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task<Result<BackupUploadResult>> UploadBackupFileAsync(
        Guid tenantId,
        Guid backupId,
        string fileName,
        Stream fileStream,
        string contentType = "application/octet-stream",
        CancellationToken cancellationToken = default)
    {
        var bucketName = _tenantStorageService.GetTenantBucketName(tenantId);
        var objectPath = GetObjectPath(backupId, fileName);

        try
        {
            // Ensure tenant bucket exists
            var bucketExists = await _tenantStorageService.TenantBucketExistsAsync(tenantId, cancellationToken);
            if (bucketExists.IsFailure)
            {
                return Result<BackupUploadResult>.Failure(bucketExists.Error);
            }

            if (!bucketExists.Value)
            {
                _logger.LogWarning(
                    "Tenant bucket does not exist. TenantId: {TenantId}, Bucket: {Bucket}",
                    tenantId, bucketName);
                return Result<BackupUploadResult>.Failure(
                    Error.NotFound("Backup.BucketNotFound", $"Tenant storage bucket not found: {bucketName}"));
            }

            var fileSize = fileStream.Length;

            // Upload the file
            var putObjectArgs = new PutObjectArgs()
                .WithBucket(bucketName)
                .WithObject(objectPath)
                .WithStreamData(fileStream)
                .WithObjectSize(fileSize)
                .WithContentType(contentType);

            await _minioClient.PutObjectAsync(putObjectArgs, cancellationToken);

            var storagePath = GetBackupPath(tenantId, backupId, fileName);

            _logger.LogInformation(
                "Backup file uploaded. TenantId: {TenantId}, BackupId: {BackupId}, Path: {Path}, Size: {Size}",
                tenantId, backupId, storagePath, fileSize);

            return Result<BackupUploadResult>.Success(new BackupUploadResult(
                StoragePath: storagePath,
                StorageLocation: "MinIO",
                SizeInBytes: fileSize,
                DownloadUrl: null // Will be generated on-demand
            ));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Failed to upload backup file. TenantId: {TenantId}, BackupId: {BackupId}, File: {File}",
                tenantId, backupId, fileName);

            return Result<BackupUploadResult>.Failure(
                Error.Failure("Backup.UploadFailed", $"Failed to upload backup file: {ex.Message}"));
        }
    }

    /// <inheritdoc />
    public async Task<Result<Stream>> DownloadBackupFileAsync(
        Guid tenantId,
        Guid backupId,
        string fileName,
        CancellationToken cancellationToken = default)
    {
        var bucketName = _tenantStorageService.GetTenantBucketName(tenantId);
        var objectPath = GetObjectPath(backupId, fileName);

        try
        {
            // Check if file exists
            var statArgs = new StatObjectArgs()
                .WithBucket(bucketName)
                .WithObject(objectPath);

            await _minioClient.StatObjectAsync(statArgs, cancellationToken);

            // Create memory stream to hold the data
            var memoryStream = new MemoryStream();

            var getObjectArgs = new GetObjectArgs()
                .WithBucket(bucketName)
                .WithObject(objectPath)
                .WithCallbackStream(stream =>
                {
                    stream.CopyTo(memoryStream);
                    memoryStream.Position = 0;
                });

            await _minioClient.GetObjectAsync(getObjectArgs, cancellationToken);

            _logger.LogInformation(
                "Backup file downloaded. TenantId: {TenantId}, BackupId: {BackupId}, File: {File}",
                tenantId, backupId, fileName);

            return Result<Stream>.Success(memoryStream);
        }
        catch (Minio.Exceptions.ObjectNotFoundException)
        {
            _logger.LogWarning(
                "Backup file not found. TenantId: {TenantId}, BackupId: {BackupId}, File: {File}",
                tenantId, backupId, fileName);

            return Result<Stream>.Failure(
                Error.NotFound("Backup.FileNotFound", $"Backup file not found: {fileName}"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Failed to download backup file. TenantId: {TenantId}, BackupId: {BackupId}, File: {File}",
                tenantId, backupId, fileName);

            return Result<Stream>.Failure(
                Error.Failure("Backup.DownloadFailed", $"Failed to download backup file: {ex.Message}"));
        }
    }

    /// <inheritdoc />
    public async Task<Result<string>> GetDownloadUrlAsync(
        Guid tenantId,
        Guid backupId,
        string fileName,
        int expiryMinutes = 60,
        CancellationToken cancellationToken = default)
    {
        var bucketName = _tenantStorageService.GetTenantBucketName(tenantId);
        var objectPath = GetObjectPath(backupId, fileName);

        try
        {
            // Check if file exists first
            var statArgs = new StatObjectArgs()
                .WithBucket(bucketName)
                .WithObject(objectPath);

            await _minioClient.StatObjectAsync(statArgs, cancellationToken);

            // Generate presigned URL
            var presignedGetObjectArgs = new PresignedGetObjectArgs()
                .WithBucket(bucketName)
                .WithObject(objectPath)
                .WithExpiry(expiryMinutes * 60); // Convert to seconds

            var url = await _minioClient.PresignedGetObjectAsync(presignedGetObjectArgs);

            _logger.LogDebug(
                "Generated download URL. TenantId: {TenantId}, BackupId: {BackupId}, ExpiryMinutes: {Expiry}",
                tenantId, backupId, expiryMinutes);

            return Result<string>.Success(url);
        }
        catch (Minio.Exceptions.ObjectNotFoundException)
        {
            return Result<string>.Failure(
                Error.NotFound("Backup.FileNotFound", $"Backup file not found: {fileName}"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Failed to generate download URL. TenantId: {TenantId}, BackupId: {BackupId}",
                tenantId, backupId);

            return Result<string>.Failure(
                Error.Failure("Backup.UrlGenerationFailed", $"Failed to generate download URL: {ex.Message}"));
        }
    }

    /// <inheritdoc />
    public async Task<Result> DeleteBackupFileAsync(
        Guid tenantId,
        Guid backupId,
        string? fileName = null,
        CancellationToken cancellationToken = default)
    {
        var bucketName = _tenantStorageService.GetTenantBucketName(tenantId);

        try
        {
            if (!string.IsNullOrEmpty(fileName))
            {
                // Delete specific file
                var objectPath = GetObjectPath(backupId, fileName);
                var removeObjectArgs = new RemoveObjectArgs()
                    .WithBucket(bucketName)
                    .WithObject(objectPath);

                await _minioClient.RemoveObjectAsync(removeObjectArgs, cancellationToken);

                _logger.LogInformation(
                    "Backup file deleted. TenantId: {TenantId}, BackupId: {BackupId}, File: {File}",
                    tenantId, backupId, fileName);
            }
            else
            {
                // Delete all files for this backup
                var prefix = $"{BackupsFolder}/{backupId}/";
                var objectsToDelete = new List<string>();

                var listObjectsArgs = new ListObjectsArgs()
                    .WithBucket(bucketName)
                    .WithPrefix(prefix)
                    .WithRecursive(true);

                await foreach (var item in _minioClient.ListObjectsEnumAsync(listObjectsArgs, cancellationToken))
                {
                    objectsToDelete.Add(item.Key);
                }

                if (objectsToDelete.Count > 0)
                {
                    var removeObjectsArgs = new RemoveObjectsArgs()
                        .WithBucket(bucketName)
                        .WithObjects(objectsToDelete);

                    await _minioClient.RemoveObjectsAsync(removeObjectsArgs, cancellationToken);

                    _logger.LogInformation(
                        "Deleted {Count} backup files. TenantId: {TenantId}, BackupId: {BackupId}",
                        objectsToDelete.Count, tenantId, backupId);
                }
            }

            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Failed to delete backup file(s). TenantId: {TenantId}, BackupId: {BackupId}",
                tenantId, backupId);

            return Result.Failure(
                Error.Failure("Backup.DeleteFailed", $"Failed to delete backup file(s): {ex.Message}"));
        }
    }

    /// <inheritdoc />
    public async Task<Result> DeleteBackupAsync(
        Guid tenantId,
        Guid backupId,
        CancellationToken cancellationToken = default)
    {
        // Delegate to DeleteBackupFileAsync with null fileName to delete all files
        return await DeleteBackupFileAsync(tenantId, backupId, null, cancellationToken);
    }

    /// <inheritdoc />
    public async Task<Result<int>> DeleteOldBackupsAsync(
        Guid tenantId,
        DateTime olderThan,
        CancellationToken cancellationToken = default)
    {
        var bucketName = _tenantStorageService.GetTenantBucketName(tenantId);
        var prefix = $"{BackupsFolder}/";

        try
        {
            var objectsToDelete = new List<string>();

            var listObjectsArgs = new ListObjectsArgs()
                .WithBucket(bucketName)
                .WithPrefix(prefix)
                .WithRecursive(true);

            await foreach (var item in _minioClient.ListObjectsEnumAsync(listObjectsArgs, cancellationToken))
            {
                if (item.LastModifiedDateTime < olderThan)
                {
                    objectsToDelete.Add(item.Key);
                }
            }

            if (objectsToDelete.Count > 0)
            {
                var removeObjectsArgs = new RemoveObjectsArgs()
                    .WithBucket(bucketName)
                    .WithObjects(objectsToDelete);

                await _minioClient.RemoveObjectsAsync(removeObjectsArgs, cancellationToken);

                _logger.LogInformation(
                    "Deleted {Count} old backup files. TenantId: {TenantId}, OlderThan: {OlderThan}",
                    objectsToDelete.Count, tenantId, olderThan);
            }

            return Result<int>.Success(objectsToDelete.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Failed to delete old backups. TenantId: {TenantId}, OlderThan: {OlderThan}",
                tenantId, olderThan);

            return Result<int>.Failure(
                Error.Failure("Backup.DeleteOldFailed", $"Failed to delete old backups: {ex.Message}"));
        }
    }

    /// <inheritdoc />
    public async Task<Result<IEnumerable<BackupFileInfo>>> ListBackupFilesAsync(
        Guid tenantId,
        Guid? backupId = null,
        CancellationToken cancellationToken = default)
    {
        var bucketName = _tenantStorageService.GetTenantBucketName(tenantId);
        var prefix = backupId.HasValue
            ? $"{BackupsFolder}/{backupId.Value}/"
            : $"{BackupsFolder}/";

        try
        {
            var files = new List<BackupFileInfo>();

            var listObjectsArgs = new ListObjectsArgs()
                .WithBucket(bucketName)
                .WithPrefix(prefix)
                .WithRecursive(true);

            await foreach (var item in _minioClient.ListObjectsEnumAsync(listObjectsArgs, cancellationToken))
            {
                // Extract backup ID from path: backups/{backupId}/{filename}
                var pathParts = item.Key.Split('/');
                Guid? extractedBackupId = null;

                if (pathParts.Length >= 2 && Guid.TryParse(pathParts[1], out var parsedId))
                {
                    extractedBackupId = parsedId;
                }

                var fileName = pathParts.Length > 0 ? pathParts[^1] : item.Key;

                files.Add(new BackupFileInfo(
                    FileName: fileName,
                    FullPath: item.Key,
                    SizeInBytes: (long)item.Size,
                    LastModified: item.LastModifiedDateTime ?? DateTime.UtcNow,
                    BackupId: extractedBackupId));
            }

            _logger.LogDebug(
                "Listed {Count} backup files. TenantId: {TenantId}, BackupId: {BackupId}",
                files.Count, tenantId, backupId);

            return Result<IEnumerable<BackupFileInfo>>.Success(files);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Failed to list backup files. TenantId: {TenantId}, BackupId: {BackupId}",
                tenantId, backupId);

            return Result<IEnumerable<BackupFileInfo>>.Failure(
                Error.Failure("Backup.ListFailed", $"Failed to list backup files: {ex.Message}"));
        }
    }

    /// <inheritdoc />
    public async Task<Result<long>> GetTotalBackupSizeAsync(
        Guid tenantId,
        CancellationToken cancellationToken = default)
    {
        var bucketName = _tenantStorageService.GetTenantBucketName(tenantId);
        var prefix = $"{BackupsFolder}/";

        try
        {
            long totalSize = 0;

            var listObjectsArgs = new ListObjectsArgs()
                .WithBucket(bucketName)
                .WithPrefix(prefix)
                .WithRecursive(true);

            await foreach (var item in _minioClient.ListObjectsEnumAsync(listObjectsArgs, cancellationToken))
            {
                totalSize += (long)item.Size;
            }

            return Result<long>.Success(totalSize);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Failed to calculate total backup size. TenantId: {TenantId}",
                tenantId);

            return Result<long>.Failure(
                Error.Failure("Backup.SizeCalculationFailed", $"Failed to calculate backup size: {ex.Message}"));
        }
    }

    /// <inheritdoc />
    public async Task<Result<bool>> BackupFileExistsAsync(
        Guid tenantId,
        Guid backupId,
        string fileName,
        CancellationToken cancellationToken = default)
    {
        var bucketName = _tenantStorageService.GetTenantBucketName(tenantId);
        var objectPath = GetObjectPath(backupId, fileName);

        try
        {
            var statArgs = new StatObjectArgs()
                .WithBucket(bucketName)
                .WithObject(objectPath);

            await _minioClient.StatObjectAsync(statArgs, cancellationToken);
            return Result<bool>.Success(true);
        }
        catch (Minio.Exceptions.ObjectNotFoundException)
        {
            return Result<bool>.Success(false);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Failed to check backup file existence. TenantId: {TenantId}, BackupId: {BackupId}",
                tenantId, backupId);

            return Result<bool>.Failure(
                Error.Failure("Backup.ExistenceCheckFailed", $"Failed to check file existence: {ex.Message}"));
        }
    }

    /// <inheritdoc />
    public string GetBackupPath(Guid tenantId, Guid backupId, string fileName)
    {
        var bucketName = _tenantStorageService.GetTenantBucketName(tenantId);
        return $"{bucketName}/{BackupsFolder}/{backupId}/{fileName}";
    }

    /// <summary>
    /// Gets the object path within the bucket (without bucket name)
    /// </summary>
    private static string GetObjectPath(Guid backupId, string fileName)
    {
        return $"{BackupsFolder}/{backupId}/{fileName}";
    }
}
