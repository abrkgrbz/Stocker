namespace Stocker.Modules.Inventory.Infrastructure.Configuration;

/// <summary>
/// MinIO object storage configuration settings for Inventory module
/// </summary>
public class MinioSettings
{
    public const string SectionName = "MinioStorage";

    /// <summary>
    /// MinIO server endpoint (e.g., "minio:9000" or "minio.example.com")
    /// Used for internal backend connections
    /// </summary>
    public string Endpoint { get; set; } = string.Empty;

    /// <summary>
    /// Public endpoint for presigned URLs accessible from browser
    /// (e.g., "localhost:9000" or "minio.example.com")
    /// If not set, will use Endpoint value
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
    /// Whether to use SSL/TLS for connections (default: true for production)
    /// </summary>
    public bool UseSSL { get; set; } = false;

    /// <summary>
    /// Default bucket name for product images
    /// </summary>
    public string BucketName { get; set; } = "stocker-products";

    /// <summary>
    /// Region for bucket (optional, default: "us-east-1")
    /// </summary>
    public string Region { get; set; } = "us-east-1";

    /// <summary>
    /// Presigned URL expiration time in hours (default: 24 hours)
    /// </summary>
    public int PresignedUrlExpirationHours { get; set; } = 24;
}
