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
    [SwaggerOperation(Summary = "Tüm bucket'lar", Description = "MinIO'daki tüm bucket'ları kullanım istatistikleriyle birlikte getirir")]
    [ProducesResponseType(typeof(ApiResponse<BucketListResponse>), 200)]
    public async Task<IActionResult> GetAllBuckets(CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation("Tüm bucket'lar getiriliyor");

            var result = await _storageService.ListAllBucketsAsync(cancellationToken);

            if (result.IsFailure)
            {
                _logger.LogWarning("Bucket listesi alınamadı: {Error}", result.Error.Description);
                return StatusCode(500, new ApiResponse<BucketListResponse>
                {
                    Success = false,
                    Message = result.Error.Description,
                    Timestamp = DateTime.UtcNow
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

            return Ok(new ApiResponse<BucketListResponse>
            {
                Success = true,
                Data = new BucketListResponse
                {
                    Buckets = buckets,
                    TotalCount = buckets.Count,
                    TotalUsedBytes = buckets.Sum(b => b.UsedBytes),
                    TotalUsedGB = Math.Round(buckets.Sum(b => b.UsedBytes) / (1024.0 * 1024 * 1024), 2),
                    TotalObjects = buckets.Sum(b => b.ObjectCount)
                },
                Message = "Bucket'lar başarıyla getirildi",
                Timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Bucket listesi getirilirken hata oluştu");
            return StatusCode(500, new ApiResponse<BucketListResponse>
            {
                Success = false,
                Message = $"Bucket listesi getirilirken hata oluştu: {ex.Message}",
                Timestamp = DateTime.UtcNow
            });
        }
    }

    /// <summary>
    /// Delete a bucket by name
    /// </summary>
    [HttpDelete("buckets/{bucketName}")]
    [SwaggerOperation(Summary = "Bucket sil", Description = "MinIO bucket'ını ve tüm içeriğini siler. Bu işlem GERİ ALINAMAZ!")]
    [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
    public async Task<IActionResult> DeleteBucket(string bucketName, CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogWarning("Master kullanıcı bucket siliyor: {BucketName}", bucketName);

            var result = await _storageService.DeleteBucketByNameAsync(bucketName, cancellationToken);

            if (result.IsFailure)
            {
                _logger.LogWarning("Bucket silinemedi: {BucketName}, Hata: {Error}", bucketName, result.Error.Description);
                return StatusCode(500, new ApiResponse<bool>
                {
                    Success = false,
                    Message = result.Error.Description,
                    Timestamp = DateTime.UtcNow
                });
            }

            _logger.LogInformation("Bucket başarıyla silindi: {BucketName}", bucketName);

            return Ok(new ApiResponse<bool>
            {
                Success = true,
                Data = true,
                Message = $"'{bucketName}' bucket'ı başarıyla silindi",
                Timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Bucket silinirken hata oluştu: {BucketName}", bucketName);
            return StatusCode(500, new ApiResponse<bool>
            {
                Success = false,
                Message = $"Bucket silinirken hata oluştu: {ex.Message}",
                Timestamp = DateTime.UtcNow
            });
        }
    }

    /// <summary>
    /// Delete multiple buckets
    /// </summary>
    [HttpPost("buckets/delete-multiple")]
    [SwaggerOperation(Summary = "Çoklu bucket sil", Description = "Birden fazla MinIO bucket'ını ve tüm içeriklerini siler. Bu işlem GERİ ALINAMAZ!")]
    [ProducesResponseType(typeof(ApiResponse<BucketDeleteMultipleResponse>), 200)]
    public async Task<IActionResult> DeleteMultipleBuckets(
        [FromBody] DeleteBucketsRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            if (request.BucketNames == null || !request.BucketNames.Any())
            {
                return BadRequest(new ApiResponse<BucketDeleteMultipleResponse>
                {
                    Success = false,
                    Message = "Bucket adı belirtilmedi",
                    Timestamp = DateTime.UtcNow
                });
            }

            _logger.LogWarning("Master kullanıcı çoklu bucket siliyor: {BucketNames}", string.Join(", ", request.BucketNames));

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

            return Ok(new ApiResponse<BucketDeleteMultipleResponse>
            {
                Success = failCount == 0,
                Data = new BucketDeleteMultipleResponse
                {
                    Results = results,
                    SuccessCount = successCount,
                    FailCount = failCount
                },
                Message = $"{results.Count} bucket'tan {successCount} tanesi silindi",
                Timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Çoklu bucket silinirken hata oluştu");
            return StatusCode(500, new ApiResponse<BucketDeleteMultipleResponse>
            {
                Success = false,
                Message = $"Bucket'lar silinirken hata oluştu: {ex.Message}",
                Timestamp = DateTime.UtcNow
            });
        }
    }

    // ==================== FILE BROWSER ENDPOINTS ====================

    /// <summary>
    /// Create a new bucket
    /// </summary>
    [HttpPost("buckets")]
    [SwaggerOperation(Summary = "Bucket oluştur", Description = "Yeni bir MinIO bucket'ı oluşturur")]
    [ProducesResponseType(typeof(ApiResponse<CreateBucketResponse>), 200)]
    [ProducesResponseType(typeof(ApiResponse<CreateBucketResponse>), 400)]
    [ProducesResponseType(typeof(ApiResponse<CreateBucketResponse>), 409)]
    public async Task<IActionResult> CreateBucket(
        [FromBody] CreateBucketRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.BucketName))
            {
                return BadRequest(new ApiResponse<CreateBucketResponse>
                {
                    Success = false,
                    Message = "Bucket adı gereklidir",
                    Timestamp = DateTime.UtcNow
                });
            }

            // Validate bucket name (lowercase, 3-63 chars, no special chars except dash)
            var bucketName = request.BucketName.ToLowerInvariant().Trim();
            if (bucketName.Length < 3 || bucketName.Length > 63)
            {
                return BadRequest(new ApiResponse<CreateBucketResponse>
                {
                    Success = false,
                    Message = "Bucket adı 3-63 karakter arasında olmalıdır",
                    Timestamp = DateTime.UtcNow
                });
            }

            _logger.LogInformation("Bucket oluşturuluyor: {BucketName}", bucketName);

            var result = await _storageService.CreateBucketAsync(bucketName, cancellationToken);

            if (result.IsFailure)
            {
                if (result.Error.Code == "Storage.BucketExists")
                {
                    return Conflict(new ApiResponse<CreateBucketResponse>
                    {
                        Success = false,
                        Message = result.Error.Description,
                        Timestamp = DateTime.UtcNow
                    });
                }
                return StatusCode(500, new ApiResponse<CreateBucketResponse>
                {
                    Success = false,
                    Message = result.Error.Description,
                    Timestamp = DateTime.UtcNow
                });
            }

            _logger.LogInformation("Bucket başarıyla oluşturuldu: {BucketName}", bucketName);

            return Ok(new ApiResponse<CreateBucketResponse>
            {
                Success = true,
                Data = new CreateBucketResponse { BucketName = bucketName },
                Message = $"'{bucketName}' bucket'ı başarıyla oluşturuldu",
                Timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Bucket oluşturulurken hata oluştu: {BucketName}", request.BucketName);
            return StatusCode(500, new ApiResponse<CreateBucketResponse>
            {
                Success = false,
                Message = $"Bucket oluşturulurken hata oluştu: {ex.Message}",
                Timestamp = DateTime.UtcNow
            });
        }
    }

    /// <summary>
    /// List objects in a bucket
    /// </summary>
    [HttpGet("buckets/{bucketName}/objects")]
    [SwaggerOperation(Summary = "Bucket içeriğini listele", Description = "Bucket içindeki tüm dosya ve klasörleri prefix filtreleme ile getirir")]
    [ProducesResponseType(typeof(ApiResponse<ObjectListResponse>), 200)]
    [ProducesResponseType(typeof(ApiResponse<ObjectListResponse>), 404)]
    public async Task<IActionResult> ListObjects(
        string bucketName,
        [FromQuery] string? prefix = null,
        CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Bucket içeriği listeleniyor: {BucketName}, Prefix: {Prefix}", bucketName, prefix ?? "(yok)");

            var result = await _storageService.ListObjectsAsync(bucketName, prefix, cancellationToken);

            if (result.IsFailure)
            {
                if (result.Error.Code == "Storage.BucketNotFound")
                {
                    return NotFound(new ApiResponse<ObjectListResponse>
                    {
                        Success = false,
                        Message = result.Error.Description,
                        Timestamp = DateTime.UtcNow
                    });
                }
                return StatusCode(500, new ApiResponse<ObjectListResponse>
                {
                    Success = false,
                    Message = result.Error.Description,
                    Timestamp = DateTime.UtcNow
                });
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

            return Ok(new ApiResponse<ObjectListResponse>
            {
                Success = true,
                Data = new ObjectListResponse
                {
                    Objects = objects,
                    BucketName = bucketName,
                    Prefix = prefix ?? "",
                    TotalCount = objects.Count,
                    TotalSize = objects.Where(o => !o.IsFolder).Sum(o => o.Size),
                    FolderCount = objects.Count(o => o.IsFolder),
                    FileCount = objects.Count(o => !o.IsFolder)
                },
                Message = "İçerik başarıyla listelendi",
                Timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Bucket içeriği listelenirken hata oluştu: {BucketName}", bucketName);
            return StatusCode(500, new ApiResponse<ObjectListResponse>
            {
                Success = false,
                Message = $"İçerik listelenirken hata oluştu: {ex.Message}",
                Timestamp = DateTime.UtcNow
            });
        }
    }

    /// <summary>
    /// Upload a file to a bucket
    /// </summary>
    [HttpPost("buckets/{bucketName}/upload")]
    [SwaggerOperation(Summary = "Dosya yükle", Description = "Bucket'a dosya yükler (opsiyonel path prefix ile)")]
    [ProducesResponseType(typeof(ApiResponse<UploadResultResponse>), 200)]
    [ProducesResponseType(typeof(ApiResponse<UploadResultResponse>), 400)]
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
                return BadRequest(new ApiResponse<UploadResultResponse>
                {
                    Success = false,
                    Message = "Dosya belirtilmedi",
                    Timestamp = DateTime.UtcNow
                });
            }

            _logger.LogInformation("{Count} dosya yükleniyor: {BucketName}", files.Count, bucketName);

            var results = new List<UploadFileResult>();

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
                    results.Add(new UploadFileResult
                    {
                        Success = true,
                        FileName = file.FileName,
                        ObjectName = result.Value.ObjectName,
                        Size = result.Value.Size,
                        ETag = result.Value.ETag,
                        Url = result.Value.Url
                    });
                }
                else
                {
                    results.Add(new UploadFileResult
                    {
                        Success = false,
                        FileName = file.FileName,
                        Error = result.Error.Description
                    });
                }
            }

            var successCount = results.Count(r => r.Success);
            var failCount = results.Count - successCount;

            _logger.LogInformation("{SuccessCount}/{TotalCount} dosya başarıyla yüklendi", successCount, results.Count);

            return Ok(new ApiResponse<UploadResultResponse>
            {
                Success = failCount == 0,
                Data = new UploadResultResponse
                {
                    Results = results,
                    SuccessCount = successCount,
                    FailCount = failCount
                },
                Message = $"{results.Count} dosyadan {successCount} tanesi yüklendi",
                Timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Dosya yüklenirken hata oluştu: {BucketName}", bucketName);
            return StatusCode(500, new ApiResponse<UploadResultResponse>
            {
                Success = false,
                Message = $"Dosya yüklenirken hata oluştu: {ex.Message}",
                Timestamp = DateTime.UtcNow
            });
        }
    }

    /// <summary>
    /// Download a file from a bucket
    /// </summary>
    [HttpGet("buckets/{bucketName}/objects/download")]
    [SwaggerOperation(Summary = "Dosya indir", Description = "Bucket'tan dosya indirir")]
    [ProducesResponseType(typeof(FileResult), 200)]
    [ProducesResponseType(typeof(ApiResponse<bool>), 400)]
    [ProducesResponseType(typeof(ApiResponse<bool>), 404)]
    public async Task<IActionResult> DownloadFile(
        string bucketName,
        [FromQuery] string objectName,
        CancellationToken cancellationToken)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(objectName))
            {
                return BadRequest(new ApiResponse<bool>
                {
                    Success = false,
                    Message = "Dosya adı gereklidir",
                    Timestamp = DateTime.UtcNow
                });
            }

            _logger.LogInformation("Dosya indiriliyor: {BucketName}/{ObjectName}", bucketName, objectName);

            var result = await _storageService.DownloadObjectAsync(bucketName, objectName, cancellationToken);

            if (result.IsFailure)
            {
                if (result.Error.Code == "Storage.ObjectNotFound")
                {
                    return NotFound(new ApiResponse<bool>
                    {
                        Success = false,
                        Message = result.Error.Description,
                        Timestamp = DateTime.UtcNow
                    });
                }
                return StatusCode(500, new ApiResponse<bool>
                {
                    Success = false,
                    Message = result.Error.Description,
                    Timestamp = DateTime.UtcNow
                });
            }

            var download = result.Value;
            return File(download.Data, download.ContentType, download.FileName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Dosya indirilirken hata oluştu: {BucketName}/{ObjectName}", bucketName, objectName);
            return StatusCode(500, new ApiResponse<bool>
            {
                Success = false,
                Message = $"Dosya indirilirken hata oluştu: {ex.Message}",
                Timestamp = DateTime.UtcNow
            });
        }
    }

    /// <summary>
    /// Get presigned URL for a file
    /// </summary>
    [HttpGet("buckets/{bucketName}/objects/url")]
    [SwaggerOperation(Summary = "Presigned URL oluştur", Description = "Dosya indirmek için geçici URL oluşturur")]
    [ProducesResponseType(typeof(ApiResponse<PresignedUrlResponse>), 200)]
    [ProducesResponseType(typeof(ApiResponse<PresignedUrlResponse>), 400)]
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
                return BadRequest(new ApiResponse<PresignedUrlResponse>
                {
                    Success = false,
                    Message = "Dosya adı gereklidir",
                    Timestamp = DateTime.UtcNow
                });
            }

            _logger.LogInformation("Presigned URL oluşturuluyor: {BucketName}/{ObjectName}, Süre: {Hours} saat",
                bucketName, objectName, expiresInHours);

            var result = await _storageService.GetPresignedUrlAsync(
                bucketName,
                objectName,
                TimeSpan.FromHours(expiresInHours),
                cancellationToken);

            if (result.IsFailure)
            {
                return StatusCode(500, new ApiResponse<PresignedUrlResponse>
                {
                    Success = false,
                    Message = result.Error.Description,
                    Timestamp = DateTime.UtcNow
                });
            }

            return Ok(new ApiResponse<PresignedUrlResponse>
            {
                Success = true,
                Data = new PresignedUrlResponse
                {
                    Url = result.Value,
                    ObjectName = objectName,
                    ExpiresInHours = expiresInHours,
                    ExpiresAt = DateTime.UtcNow.AddHours(expiresInHours)
                },
                Message = "URL başarıyla oluşturuldu",
                Timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Presigned URL oluşturulurken hata oluştu: {BucketName}/{ObjectName}", bucketName, objectName);
            return StatusCode(500, new ApiResponse<PresignedUrlResponse>
            {
                Success = false,
                Message = $"URL oluşturulurken hata oluştu: {ex.Message}",
                Timestamp = DateTime.UtcNow
            });
        }
    }

    /// <summary>
    /// Delete an object from a bucket
    /// </summary>
    [HttpDelete("buckets/{bucketName}/objects")]
    [SwaggerOperation(Summary = "Dosya sil", Description = "Bucket'tan tek bir dosya siler")]
    [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
    [ProducesResponseType(typeof(ApiResponse<bool>), 400)]
    public async Task<IActionResult> DeleteObject(
        string bucketName,
        [FromQuery] string objectName,
        CancellationToken cancellationToken)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(objectName))
            {
                return BadRequest(new ApiResponse<bool>
                {
                    Success = false,
                    Message = "Dosya adı gereklidir",
                    Timestamp = DateTime.UtcNow
                });
            }

            _logger.LogWarning("Dosya siliniyor: {BucketName}/{ObjectName}", bucketName, objectName);

            var result = await _storageService.DeleteObjectAsync(bucketName, objectName, cancellationToken);

            if (result.IsFailure)
            {
                return StatusCode(500, new ApiResponse<bool>
                {
                    Success = false,
                    Message = result.Error.Description,
                    Timestamp = DateTime.UtcNow
                });
            }

            _logger.LogInformation("Dosya başarıyla silindi: {BucketName}/{ObjectName}", bucketName, objectName);

            return Ok(new ApiResponse<bool>
            {
                Success = true,
                Data = true,
                Message = $"'{objectName}' dosyası başarıyla silindi",
                Timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Dosya silinirken hata oluştu: {BucketName}/{ObjectName}", bucketName, objectName);
            return StatusCode(500, new ApiResponse<bool>
            {
                Success = false,
                Message = $"Dosya silinirken hata oluştu: {ex.Message}",
                Timestamp = DateTime.UtcNow
            });
        }
    }

    /// <summary>
    /// Delete multiple objects from a bucket
    /// </summary>
    [HttpPost("buckets/{bucketName}/objects/delete-multiple")]
    [SwaggerOperation(Summary = "Çoklu dosya sil", Description = "Bucket'tan birden fazla dosya siler")]
    [ProducesResponseType(typeof(ApiResponse<ObjectDeleteMultipleResponse>), 200)]
    [ProducesResponseType(typeof(ApiResponse<ObjectDeleteMultipleResponse>), 400)]
    public async Task<IActionResult> DeleteMultipleObjects(
        string bucketName,
        [FromBody] DeleteObjectsRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            if (request.ObjectNames == null || !request.ObjectNames.Any())
            {
                return BadRequest(new ApiResponse<ObjectDeleteMultipleResponse>
                {
                    Success = false,
                    Message = "Dosya adı belirtilmedi",
                    Timestamp = DateTime.UtcNow
                });
            }

            _logger.LogWarning("{Count} dosya siliniyor: {BucketName}", request.ObjectNames.Count, bucketName);

            var result = await _storageService.DeleteObjectsAsync(bucketName, request.ObjectNames, cancellationToken);

            if (result.IsFailure)
            {
                return StatusCode(500, new ApiResponse<ObjectDeleteMultipleResponse>
                {
                    Success = false,
                    Message = result.Error.Description,
                    Timestamp = DateTime.UtcNow
                });
            }

            _logger.LogInformation("{Count} dosya başarıyla silindi: {BucketName}", result.Value, bucketName);

            return Ok(new ApiResponse<ObjectDeleteMultipleResponse>
            {
                Success = true,
                Data = new ObjectDeleteMultipleResponse
                {
                    DeletedCount = result.Value
                },
                Message = $"{result.Value} dosya başarıyla silindi",
                Timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Dosyalar silinirken hata oluştu: {BucketName}", bucketName);
            return StatusCode(500, new ApiResponse<ObjectDeleteMultipleResponse>
            {
                Success = false,
                Message = $"Dosyalar silinirken hata oluştu: {ex.Message}",
                Timestamp = DateTime.UtcNow
            });
        }
    }

    /// <summary>
    /// Create a folder in a bucket
    /// </summary>
    [HttpPost("buckets/{bucketName}/folders")]
    [SwaggerOperation(Summary = "Klasör oluştur", Description = "Bucket içinde yeni bir klasör oluşturur")]
    [ProducesResponseType(typeof(ApiResponse<CreateFolderResponse>), 200)]
    [ProducesResponseType(typeof(ApiResponse<CreateFolderResponse>), 400)]
    public async Task<IActionResult> CreateFolder(
        string bucketName,
        [FromBody] CreateFolderRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.FolderPath))
            {
                return BadRequest(new ApiResponse<CreateFolderResponse>
                {
                    Success = false,
                    Message = "Klasör yolu gereklidir",
                    Timestamp = DateTime.UtcNow
                });
            }

            _logger.LogInformation("Klasör oluşturuluyor: {BucketName}/{FolderPath}", bucketName, request.FolderPath);

            var result = await _storageService.CreateFolderAsync(bucketName, request.FolderPath, cancellationToken);

            if (result.IsFailure)
            {
                return StatusCode(500, new ApiResponse<CreateFolderResponse>
                {
                    Success = false,
                    Message = result.Error.Description,
                    Timestamp = DateTime.UtcNow
                });
            }

            _logger.LogInformation("Klasör başarıyla oluşturuldu: {BucketName}/{FolderPath}", bucketName, request.FolderPath);

            return Ok(new ApiResponse<CreateFolderResponse>
            {
                Success = true,
                Data = new CreateFolderResponse { FolderPath = request.FolderPath },
                Message = $"'{request.FolderPath}' klasörü başarıyla oluşturuldu",
                Timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Klasör oluşturulurken hata oluştu: {BucketName}/{FolderPath}", bucketName, request.FolderPath);
            return StatusCode(500, new ApiResponse<CreateFolderResponse>
            {
                Success = false,
                Message = $"Klasör oluşturulurken hata oluştu: {ex.Message}",
                Timestamp = DateTime.UtcNow
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

public class BucketListResponse
{
    public List<BucketResponse> Buckets { get; set; } = new();
    public int TotalCount { get; set; }
    public long TotalUsedBytes { get; set; }
    public double TotalUsedGB { get; set; }
    public int TotalObjects { get; set; }
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

public class BucketDeleteMultipleResponse
{
    public List<BucketDeleteResult> Results { get; set; } = new();
    public int SuccessCount { get; set; }
    public int FailCount { get; set; }
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

public class ObjectListResponse
{
    public List<StorageObjectResponse> Objects { get; set; } = new();
    public string BucketName { get; set; } = string.Empty;
    public string Prefix { get; set; } = string.Empty;
    public int TotalCount { get; set; }
    public long TotalSize { get; set; }
    public int FolderCount { get; set; }
    public int FileCount { get; set; }
}

public class UploadResultResponse
{
    public List<UploadFileResult> Results { get; set; } = new();
    public int SuccessCount { get; set; }
    public int FailCount { get; set; }
}

public class UploadFileResult
{
    public bool Success { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string? ObjectName { get; set; }
    public long Size { get; set; }
    public string? ETag { get; set; }
    public string? Url { get; set; }
    public string? Error { get; set; }
}

public class PresignedUrlResponse
{
    public string Url { get; set; } = string.Empty;
    public string ObjectName { get; set; } = string.Empty;
    public int ExpiresInHours { get; set; }
    public DateTime ExpiresAt { get; set; }
}

public class CreateBucketResponse
{
    public string BucketName { get; set; } = string.Empty;
}

public class CreateFolderResponse
{
    public string FolderPath { get; set; } = string.Empty;
}

public class ObjectDeleteMultipleResponse
{
    public int DeletedCount { get; set; }
}

#endregion
