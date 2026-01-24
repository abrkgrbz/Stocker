using Microsoft.Extensions.Logging;
using Stocker.Modules.Inventory.Application.Contracts;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Infrastructure.Resilience;

/// <summary>
/// Resilient wrapper for IProductImageStorageService with circuit breaker protection.
/// Decorates the actual storage service with fault tolerance.
/// </summary>
public class ResilientStorageService : IProductImageStorageService
{
    private readonly IProductImageStorageService _innerService;
    private readonly CircuitBreaker _circuitBreaker;
    private readonly ILogger<ResilientStorageService> _logger;

    public ResilientStorageService(
        IProductImageStorageService innerService,
        CircuitBreakerRegistry registry,
        ILogger<ResilientStorageService> logger)
    {
        _innerService = innerService;
        _logger = logger;
        _circuitBreaker = registry.GetOrCreate(InventoryCircuitBreakers.MinioStorage, options =>
        {
            options.FailureThreshold = 3;
            options.OpenDuration = TimeSpan.FromSeconds(30);
            options.SuccessThresholdInHalfOpen = 2;
            options.OperationTimeout = TimeSpan.FromSeconds(30);
        });
    }

    public async Task<Result<ImageStorageResult>> UploadImageAsync(
        byte[] imageData, string fileName, string contentType,
        Guid tenantId, int productId, CancellationToken cancellationToken = default)
    {
        try
        {
            return await _circuitBreaker.ExecuteAsync(
                async ct => await _innerService.UploadImageAsync(imageData, fileName, contentType, tenantId, productId, ct),
                cancellationToken);
        }
        catch (CircuitBreakerOpenException ex)
        {
            _logger.LogWarning(ex, "MinIO circuit breaker open, upload rejected for product {ProductId}", productId);
            return Result<ImageStorageResult>.Failure(
                Error.Failure("Storage.CircuitOpen", $"Storage service temporarily unavailable. Retry after {ex.RemainingOpenTime.TotalSeconds:F0}s."));
        }
        catch (OperationCanceledException)
        {
            return Result<ImageStorageResult>.Failure(
                Error.Failure("Storage.Timeout", "Storage operation timed out."));
        }
    }

    public async Task<Result<ImageStorageResult>> UploadImageWithThumbnailAsync(
        byte[] imageData, string fileName, string contentType,
        Guid tenantId, int productId,
        int thumbnailWidth = 200, int thumbnailHeight = 200,
        CancellationToken cancellationToken = default)
    {
        try
        {
            return await _circuitBreaker.ExecuteAsync(
                async ct => await _innerService.UploadImageWithThumbnailAsync(
                    imageData, fileName, contentType, tenantId, productId, thumbnailWidth, thumbnailHeight, ct),
                cancellationToken);
        }
        catch (CircuitBreakerOpenException ex)
        {
            _logger.LogWarning(ex, "MinIO circuit breaker open, thumbnail upload rejected");
            return Result<ImageStorageResult>.Failure(
                Error.Failure("Storage.CircuitOpen", $"Storage service temporarily unavailable. Retry after {ex.RemainingOpenTime.TotalSeconds:F0}s."));
        }
        catch (OperationCanceledException)
        {
            return Result<ImageStorageResult>.Failure(
                Error.Failure("Storage.Timeout", "Storage operation timed out."));
        }
    }

    public async Task<Result> DeleteImageAsync(string storagePath, CancellationToken cancellationToken = default)
    {
        try
        {
            return await _circuitBreaker.ExecuteAsync(
                async ct => await _innerService.DeleteImageAsync(storagePath, ct),
                cancellationToken);
        }
        catch (CircuitBreakerOpenException ex)
        {
            _logger.LogWarning(ex, "MinIO circuit breaker open, delete rejected");
            return Result.Failure(
                Error.Failure("Storage.CircuitOpen", $"Storage service temporarily unavailable. Retry after {ex.RemainingOpenTime.TotalSeconds:F0}s."));
        }
        catch (OperationCanceledException)
        {
            return Result.Failure(Error.Failure("Storage.Timeout", "Storage operation timed out."));
        }
    }

    public async Task<Result<string>> GetImageUrlAsync(string storagePath, TimeSpan expiresIn, CancellationToken cancellationToken = default)
    {
        try
        {
            return await _circuitBreaker.ExecuteAsync(
                async ct => await _innerService.GetImageUrlAsync(storagePath, expiresIn, ct),
                cancellationToken);
        }
        catch (CircuitBreakerOpenException ex)
        {
            _logger.LogWarning(ex, "MinIO circuit breaker open, URL generation rejected");
            return Result<string>.Failure(
                Error.Failure("Storage.CircuitOpen", $"Storage service temporarily unavailable. Retry after {ex.RemainingOpenTime.TotalSeconds:F0}s."));
        }
        catch (OperationCanceledException)
        {
            return Result<string>.Failure(Error.Failure("Storage.Timeout", "Storage operation timed out."));
        }
    }

    public async Task<Result<bool>> ImageExistsAsync(string storagePath, CancellationToken cancellationToken = default)
    {
        try
        {
            return await _circuitBreaker.ExecuteAsync(
                async ct => await _innerService.ImageExistsAsync(storagePath, ct),
                cancellationToken);
        }
        catch (CircuitBreakerOpenException)
        {
            // For existence check, assume false when circuit is open
            return Result<bool>.Success(false);
        }
        catch (OperationCanceledException)
        {
            return Result<bool>.Failure(Error.Failure("Storage.Timeout", "Storage operation timed out."));
        }
    }
}
