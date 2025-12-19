# MinIO Object Storage - Stocker Backend Documentation

## Overview

Stocker Backend uses **MinIO** as its primary object storage solution for managing files, documents, and media assets. MinIO is an S3-compatible, high-performance object storage system that provides multi-tenant isolation with quota management.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           STOCKER BACKEND                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐         │
│  │   CRM Module    │    │ Inventory Module│    │  Infrastructure │         │
│  │                 │    │                 │    │                 │         │
│  │ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │         │
│  │ │IDocument-   │ │    │ │IProductImage│ │    │ │ITenant-     │ │         │
│  │ │StorageService│ │    │ │StorageService│ │    │ │StorageService│ │         │
│  │ └──────┬──────┘ │    │ └──────┬──────┘ │    │ └──────┬──────┘ │         │
│  │        │        │    │        │        │    │        │        │         │
│  │ ┌──────▼──────┐ │    │ ┌──────▼──────┐ │    │ ┌──────▼──────┐ │         │
│  │ │MinioDocument│ │    │ │MinioProduct │ │    │ │MinioTenant  │ │         │
│  │ │StorageService│ │    │ │ImageStorage │ │    │ │StorageService│ │         │
│  │ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │         │
│  └────────┬────────┘    └────────┬────────┘    └────────┬────────┘         │
│           │                      │                      │                   │
│           └──────────────────────┼──────────────────────┘                   │
│                                  │                                          │
│                          ┌───────▼───────┐                                  │
│                          │  IMinioClient │                                  │
│                          │  (Singleton)  │                                  │
│                          └───────┬───────┘                                  │
│                                  │                                          │
└──────────────────────────────────┼──────────────────────────────────────────┘
                                   │
                           ┌───────▼───────┐
                           │    MinIO      │
                           │   Server      │
                           │  (Docker)     │
                           └───────────────┘
```

---

## Configuration

### appsettings.json

```json
{
  "MinioStorage": {
    "Endpoint": "minio:9000",
    "AdminEndpoint": "minio:9000",
    "PublicEndpoint": "localhost:9000",
    "AccessKey": "your-access-key",
    "SecretKey": "your-secret-key",
    "UseSSL": false,
    "BucketName": "stocker-documents",
    "Region": "us-east-1",
    "PresignedUrlExpirationHours": 24,
    "DefaultQuotaGB": 5
  }
}
```

### Configuration Properties

| Property | Description | Default |
|----------|-------------|---------|
| `Endpoint` | Internal MinIO server endpoint (Docker network) | `minio:9000` |
| `AdminEndpoint` | MinIO Admin API endpoint for quota management | Same as Endpoint |
| `PublicEndpoint` | External endpoint for presigned URLs (browser access) | `localhost:9000` |
| `AccessKey` | MinIO access key for authentication | - |
| `SecretKey` | MinIO secret key for authentication | - |
| `UseSSL` | Enable HTTPS connections | `false` |
| `BucketName` | Default bucket name for shared documents | `stocker-documents` |
| `Region` | AWS region for bucket creation | `us-east-1` |
| `PresignedUrlExpirationHours` | Presigned URL validity duration | `24` |
| `DefaultQuotaGB` | Default storage quota for new tenants (GB) | `5` |

---

## Core Components

### 1. ITenantStorageService (Infrastructure Layer)

Central service for tenant bucket and quota management.

**Location:** `src/Core/Stocker.Application/Common/Interfaces/ITenantStorageService.cs`

**Implementation:** `src/Infrastructure/Stocker.Infrastructure/Services/MinioTenantStorageService.cs`

```csharp
public interface ITenantStorageService
{
    // Create tenant bucket with quota
    Task<Result<string>> CreateTenantBucketAsync(Guid tenantId, long quotaGB, CancellationToken ct);

    // Update storage quota
    Task<Result> UpdateTenantQuotaAsync(Guid tenantId, long newQuotaGB, CancellationToken ct);

    // Get usage statistics
    Task<Result<TenantStorageUsage>> GetTenantStorageUsageAsync(Guid tenantId, CancellationToken ct);

    // Check bucket existence
    Task<Result<bool>> TenantBucketExistsAsync(Guid tenantId, CancellationToken ct);

    // Delete tenant bucket (IRREVERSIBLE)
    Task<Result> DeleteTenantBucketAsync(Guid tenantId, CancellationToken ct);

    // Get bucket name for tenant
    string GetTenantBucketName(Guid tenantId);

    // Admin: List all buckets
    Task<Result<IEnumerable<BucketInfo>>> ListAllBucketsAsync(CancellationToken ct);

    // Admin: Delete bucket by name
    Task<Result> DeleteBucketByNameAsync(string bucketName, CancellationToken ct);
}
```

**Bucket Naming Convention:**
```
tenant-{first12charsOfGuid}
Example: tenant-a1b2c3d4e5f6
```

### 2. IProductImageStorageService (Inventory Module)

Specialized service for product image management.

**Location:** `src/Modules/Stocker.Modules.Inventory/Application/Contracts/IProductImageStorageService.cs`

**Implementation:** `src/Modules/Stocker.Modules.Inventory/Infrastructure/Services/MinioProductImageStorageService.cs`

```csharp
public interface IProductImageStorageService
{
    // Upload product image
    Task<Result<ImageStorageResult>> UploadImageAsync(
        byte[] imageData, string fileName, string contentType,
        Guid tenantId, int productId, CancellationToken ct);

    // Upload with thumbnail generation
    Task<Result<ImageStorageResult>> UploadImageWithThumbnailAsync(
        byte[] imageData, string fileName, string contentType,
        Guid tenantId, int productId,
        int thumbnailWidth = 200, int thumbnailHeight = 200, CancellationToken ct);

    // Delete image
    Task<Result> DeleteImageAsync(string storagePath, CancellationToken ct);

    // Get presigned URL
    Task<Result<string>> GetImageUrlAsync(string storagePath, TimeSpan expiresIn, CancellationToken ct);

    // Check existence
    Task<Result<bool>> ImageExistsAsync(string storagePath, CancellationToken ct);
}
```

**Storage Path Structure:**
```
{tenantId}/inventory/products/{productId}/{yyyy}/{MM}/{timestamp}_{guid}_{filename}

Example: a1b2c3d4-e5f6-7890-abcd-ef1234567890/inventory/products/123/2024/12/20241219_143022_abc123_product.jpg
```

### 3. IDocumentStorageService (CRM Module)

Service for CRM document and attachment management.

**Location:** `src/Modules/Stocker.Modules.CRM/Application/Contracts/IDocumentStorageService.cs`

**Implementation:** `src/Modules/Stocker.Modules.CRM/Infrastructure/Services/MinioDocumentStorageService.cs`

```csharp
public interface IDocumentStorageService
{
    // Upload file
    Task<Result<DocumentStorageResult>> UploadFileAsync(
        byte[] fileData, string fileName, string contentType,
        Guid tenantId, string entityType, string entityId, CancellationToken ct);

    // Download file
    Task<Result<byte[]>> DownloadFileAsync(string storagePath, CancellationToken ct);

    // Delete file
    Task<Result> DeleteFileAsync(string storagePath, CancellationToken ct);

    // Get download URL (with inline/attachment option)
    Task<Result<string>> GetDownloadUrlAsync(
        string storagePath, TimeSpan expiresIn, bool inline = false, CancellationToken ct);

    // Check existence
    Task<Result<bool>> FileExistsAsync(string storagePath, CancellationToken ct);
}
```

**Storage Path Structure:**
```
{tenantId}/crm/{entityType}/{entityId}/{yyyy}/{MM}/{timestamp}_{guid}_{filename}

Example: a1b2c3d4-e5f6-7890-abcd-ef1234567890/crm/lead/456/2024/12/20241219_143022_xyz789_contract.pdf
```

---

## API Endpoints

### Tenant Storage Controller

**Base URL:** `/api/tenant/storage`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/usage` | Get current storage usage for tenant |
| GET | `/exists` | Check if tenant bucket exists |
| GET | `/bucket-name` | Get the bucket name for current tenant |

**Response: Storage Usage**
```json
{
  "success": true,
  "data": {
    "bucketName": "tenant-a1b2c3d4e5f6",
    "quotaGB": 5.0,
    "usedGB": 1.25,
    "availableGB": 3.75,
    "usagePercentage": 25.0,
    "objectCount": 150,
    "quotaBytes": 5368709120,
    "usedBytes": 1342177280,
    "availableBytes": 4026531840
  },
  "message": "Depolama kullanımı başarıyla alındı"
}
```

### Master Storage Controller (Admin Only)

**Base URL:** `/api/master/storage`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/buckets` | List all MinIO buckets with statistics |
| DELETE | `/buckets/{bucketName}` | Delete a bucket (IRREVERSIBLE) |
| POST | `/buckets/delete-multiple` | Delete multiple buckets |

**Response: List Buckets**
```json
{
  "success": true,
  "data": [
    {
      "name": "tenant-a1b2c3d4e5f6",
      "creationDate": "2024-12-01T10:00:00Z",
      "usedBytes": 1342177280,
      "usedMB": 1280.0,
      "usedGB": 1.25,
      "objectCount": 150,
      "tenantId": null
    }
  ],
  "totalCount": 5,
  "totalUsedBytes": 6710886400,
  "totalUsedGB": 6.25,
  "totalObjects": 750
}
```

---

## Dependency Injection Setup

### Infrastructure Layer

```csharp
// src/Infrastructure/Stocker.Infrastructure/Extensions/ServiceCollectionExtensions.cs

private static IServiceCollection AddMinioStorageServices(
    this IServiceCollection services,
    IConfiguration configuration)
{
    // Configure settings
    services.Configure<MinioStorageSettings>(
        configuration.GetSection(MinioStorageSettings.SectionName));

    // Register MinIO client as singleton
    services.AddSingleton<IMinioClient>(sp =>
    {
        var settings = sp.GetRequiredService<IOptions<MinioStorageSettings>>().Value;
        var client = new MinioClient()
            .WithEndpoint(settings.Endpoint)
            .WithCredentials(settings.AccessKey, settings.SecretKey);

        if (settings.UseSSL)
            client.WithSSL();

        return client.Build();
    });

    // Register tenant storage service
    services.AddScoped<ITenantStorageService, MinioTenantStorageService>();

    return services;
}
```

### Inventory Module

```csharp
// src/Modules/Stocker.Modules.Inventory/Infrastructure/DependencyInjection.cs

// Register MinIO Storage Configuration
services.Configure<MinioSettings>(configuration.GetSection(MinioSettings.SectionName));

// Register MinIO Client
services.AddSingleton<IMinioClient>(serviceProvider =>
{
    var settings = configuration.GetSection(MinioSettings.SectionName).Get<MinioSettings>()
        ?? throw new InvalidOperationException("MinioStorage configuration missing");

    return new MinioClient()
        .WithEndpoint(settings.Endpoint)
        .WithCredentials(settings.AccessKey, settings.SecretKey)
        .WithSSL(settings.UseSSL)
        .Build();
});

// Register storage service
services.AddScoped<IProductImageStorageService, MinioProductImageStorageService>();
```

### CRM Module

```csharp
// src/Modules/Stocker.Modules.CRM/Infrastructure/DependencyInjection.cs

services.Configure<MinioSettings>(configuration.GetSection(MinioSettings.SectionName));

services.AddSingleton<IMinioClient>(/* same pattern */);

services.AddScoped<IDocumentStorageService, MinioDocumentStorageService>();
```

---

## Data Models

### TenantStorageUsage

```csharp
public record TenantStorageUsage(
    string BucketName,
    long QuotaBytes,
    long UsedBytes,
    long AvailableBytes,
    double UsagePercentage,
    int ObjectCount);
```

### ImageStorageResult

```csharp
public record ImageStorageResult(
    string StoragePath,
    string Url,
    string? ThumbnailStoragePath = null,
    string? ThumbnailUrl = null,
    long? FileSize = null,
    int? Width = null,
    int? Height = null);
```

### DocumentStorageResult

```csharp
public record DocumentStorageResult(
    string StoragePath,
    string Provider,
    string Url);
```

### BucketInfo

```csharp
public record BucketInfo(
    string Name,
    DateTime CreationDate,
    long UsedBytes,
    int ObjectCount,
    Guid? TenantId);
```

---

## Presigned URLs

MinIO supports presigned URLs for secure, time-limited access to objects without requiring authentication.

### Generation

```csharp
public async Task<Result<string>> GetDownloadUrlAsync(
    string storagePath,
    TimeSpan expiresIn,
    bool inline = false,
    CancellationToken cancellationToken = default)
{
    var disposition = inline ? "inline" : "attachment";

    var presignedGetObjectArgs = new PresignedGetObjectArgs()
        .WithBucket(_settings.BucketName)
        .WithObject(storagePath)
        .WithExpiry((int)expiresIn.TotalSeconds)
        .WithHeaders(new Dictionary<string, string>
        {
            ["response-content-disposition"] = $"{disposition}; filename=\"{fileName}\""
        });

    // Use public endpoint for browser-accessible URLs
    if (!string.IsNullOrEmpty(_settings.PublicEndpoint))
    {
        var publicMinioClient = new MinioClient()
            .WithEndpoint(_settings.PublicEndpoint)
            .WithCredentials(_settings.AccessKey, _settings.SecretKey)
            .WithSSL(_settings.PublicEndpoint.StartsWith("https://"))
            .Build();

        return await publicMinioClient.PresignedGetObjectAsync(presignedGetObjectArgs);
    }

    return await _minioClient.PresignedGetObjectAsync(presignedGetObjectArgs);
}
```

### Content Disposition Options

| Mode | Behavior |
|------|----------|
| `inline = true` | Browser displays the file directly (view in browser) |
| `inline = false` | Browser downloads the file (save as dialog) |

---

## Quota Management

### Creating Tenant Bucket with Quota

```csharp
public async Task<Result<string>> CreateTenantBucketAsync(
    Guid tenantId,
    long quotaGB,
    CancellationToken cancellationToken = default)
{
    var bucketName = GetTenantBucketName(tenantId);

    // Check if bucket exists
    var exists = await _minioClient.BucketExistsAsync(
        new BucketExistsArgs().WithBucket(bucketName), cancellationToken);

    if (!exists)
    {
        // Create new bucket
        await _minioClient.MakeBucketAsync(
            new MakeBucketArgs()
                .WithBucket(bucketName)
                .WithLocation(_settings.Region),
            cancellationToken);
    }

    // Set quota via bucket tags (MinIO Admin API workaround)
    await SetBucketQuotaTagAsync(bucketName, quotaGB, cancellationToken);

    return Result<string>.Success(bucketName);
}
```

### Quota Tracking via Tags

Since MinIO .NET SDK doesn't directly support quota operations, quotas are tracked via bucket tags:

```csharp
private async Task SetBucketQuotaTagAsync(string bucketName, long quotaGB, CancellationToken ct)
{
    var tags = new Dictionary<string, string>
    {
        { "quota-gb", quotaGB.ToString() },
        { "created-at", DateTime.UtcNow.ToString("O") }
    };

    await _minioClient.SetBucketTagsAsync(
        new SetBucketTagsArgs()
            .WithBucket(bucketName)
            .WithTagging(new Tagging(tags, false)),
        ct);
}
```

---

## File Organization

### Folder Structure Best Practices

```
bucket/
├── {tenantId}/
│   ├── inventory/
│   │   └── products/
│   │       └── {productId}/
│   │           └── {yyyy}/
│   │               └── {MM}/
│   │                   └── {timestamp}_{guid}_{filename}
│   ├── crm/
│   │   ├── lead/
│   │   │   └── {entityId}/...
│   │   ├── contact/
│   │   │   └── {entityId}/...
│   │   └── deal/
│   │       └── {entityId}/...
│   └── sales/
│       └── orders/
│           └── {orderId}/...
```

### Filename Sanitization

```csharp
private static string SanitizeFileName(string fileName)
{
    var invalidChars = Path.GetInvalidFileNameChars();
    var sanitized = string.Join("_", fileName.Split(invalidChars, StringSplitOptions.RemoveEmptyEntries));
    return sanitized.Replace(" ", "_").ToLowerInvariant();
}
```

---

## Docker Configuration

### docker-compose.yml

```yaml
services:
  minio:
    image: minio/minio:latest
    container_name: stocker-minio
    ports:
      - "9000:9000"      # API
      - "9001:9001"      # Console
    environment:
      MINIO_ROOT_USER: stoocker-minio
      MINIO_ROOT_PASSWORD: your-secure-password
    volumes:
      - minio_data:/data
    command: server /data --console-address ":9001"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 30s
      timeout: 20s
      retries: 3
    networks:
      - stocker-network

volumes:
  minio_data:

networks:
  stocker-network:
    driver: bridge
```

### Network Considerations

| Endpoint | Usage | Example |
|----------|-------|---------|
| Internal (`minio:9000`) | Backend API to MinIO (Docker network) | `Endpoint` setting |
| External (`localhost:9000`) | Browser/client access via presigned URLs | `PublicEndpoint` setting |

---

## Error Handling

All storage operations return `Result<T>` or `Result` types for consistent error handling:

```csharp
// Success case
return Result<ImageStorageResult>.Success(new ImageStorageResult(...));

// Failure cases
return Result<ImageStorageResult>.Failure(
    Error.Failure("Storage.Upload", $"Failed to upload image: {ex.Message}"));

return Result.Failure(
    Error.NotFound("Storage.BucketNotFound", $"Tenant bucket not found: {bucketName}"));
```

### Common Error Codes

| Code | Description |
|------|-------------|
| `Storage.CreateBucket` | Failed to create tenant bucket |
| `Storage.UpdateQuota` | Failed to update storage quota |
| `Storage.GetUsage` | Failed to retrieve usage statistics |
| `Storage.BucketNotFound` | Tenant bucket does not exist |
| `Storage.Upload` | File upload failed |
| `Storage.Download` | File download failed |
| `Storage.Delete` | File deletion failed |
| `Storage.PresignedUrl` | Presigned URL generation failed |
| `Storage.FileExists` | File existence check failed |

---

## Security Considerations

1. **Access Control**: All storage endpoints require authentication
2. **Tenant Isolation**: Each tenant has isolated bucket with unique naming
3. **Presigned URLs**: Time-limited access prevents unauthorized long-term access
4. **Quota Enforcement**: Storage limits prevent resource abuse
5. **Credential Management**: Use Azure Key Vault or environment variables for secrets
6. **SSL/TLS**: Enable `UseSSL: true` in production environments

---

## Monitoring & Logging

All storage operations are logged with structured logging:

```csharp
_logger.LogInformation(
    "Product image uploaded to MinIO. Tenant: {TenantId}, Product: {ProductId}, Path: {ObjectPath}, Size: {Size} bytes",
    tenantId, productId, objectName, imageData.Length);

_logger.LogError(ex,
    "Failed to upload file to MinIO. FileName: {FileName}",
    fileName);
```

### Key Metrics to Monitor

- Bucket storage usage per tenant
- Object count per bucket
- Upload/download operation latency
- Error rates by operation type
- Quota utilization percentage

---

## Future Enhancements

1. **Thumbnail Generation**: ImageSharp or SkiaSharp integration for automatic thumbnails
2. **Admin API Integration**: Direct MinIO Admin API for quota management
3. **Lifecycle Policies**: Automatic archival/deletion of old objects
4. **Versioning**: Object versioning for document history
5. **CDN Integration**: CloudFront or similar for cached content delivery
6. **Backup/Replication**: Cross-region replication for disaster recovery

---

## Related Documentation

- [MinIO Official Documentation](https://min.io/docs/minio/linux/index.html)
- [MinIO .NET SDK](https://github.com/minio/minio-dotnet)
- [AWS S3 API Compatibility](https://min.io/docs/minio/linux/integrations/aws-sdk-for-net.html)
