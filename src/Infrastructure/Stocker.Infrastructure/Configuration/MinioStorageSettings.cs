namespace Stocker.Infrastructure.Configuration;

/// <summary>
/// MinIO storage configuration settings for tenant storage management
/// </summary>
public class MinioStorageSettings
{
    public const string SectionName = "MinioStorage";

    /// <summary>
    /// MinIO server endpoint (e.g., "minio:9000" for internal, "s3.example.com" for external)
    /// </summary>
    public string Endpoint { get; set; } = string.Empty;

    /// <summary>
    /// MinIO Admin API endpoint (optional, defaults to Endpoint)
    /// Used for quota management and admin operations
    /// </summary>
    public string? AdminEndpoint { get; set; }

    /// <summary>
    /// Public endpoint for presigned URLs accessible from browser
    /// </summary>
    public string? PublicEndpoint { get; set; }

    /// <summary>
    /// Access key for MinIO authentication
    /// </summary>
    public string AccessKey { get; set; } = string.Empty;

    /// <summary>
    /// Secret key for MinIO authentication
    /// </summary>
    public string SecretKey { get; set; } = string.Empty;

    /// <summary>
    /// Whether to use SSL/TLS for connections
    /// </summary>
    public bool UseSSL { get; set; } = false;

    /// <summary>
    /// Default bucket name for shared documents
    /// </summary>
    public string BucketName { get; set; } = "stocker-documents";

    /// <summary>
    /// Region for bucket creation
    /// </summary>
    public string Region { get; set; } = "us-east-1";

    /// <summary>
    /// Presigned URL expiration time in hours
    /// </summary>
    public int PresignedUrlExpirationHours { get; set; } = 24;

    /// <summary>
    /// Default storage quota in GB for new tenants (if not specified in package)
    /// </summary>
    public long DefaultQuotaGB { get; set; } = 5;
}
