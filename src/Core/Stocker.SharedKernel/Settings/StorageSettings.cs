namespace Stocker.SharedKernel.Settings;

public class StorageSettings
{
    public StorageProvider Provider { get; set; } = StorageProvider.Local;
    public string ConnectionString { get; set; } = string.Empty;
    public string ContainerName { get; set; } = "stocker-files";
    public string LocalStoragePath { get; set; } = "Storage";
    public long MaxFileSizeInBytes { get; set; } = 10 * 1024 * 1024; // 10MB
    public string[] AllowedFileExtensions { get; set; } = { ".jpg", ".jpeg", ".png", ".pdf", ".doc", ".docx", ".xls", ".xlsx" };
}

public enum StorageProvider
{
    Local,
    AzureBlob,
    AmazonS3,
    GoogleCloud
}