using FluentAssertions;
using Stocker.Domain.Master.Entities;
using Xunit;

namespace Stocker.UnitTests.Domain.Master;

public class TenantBackupTests
{
    private readonly Guid _tenantId = Guid.NewGuid();
    private readonly string _backupName = "Daily Backup";
    private readonly string _backupType = "Full";
    private readonly string _createdBy = "admin@system.com";
    private readonly string _description = "Daily full backup";

    [Fact]
    public void Create_WithValidData_ShouldCreateBackup()
    {
        // Act
        var backup = TenantBackup.Create(
            _tenantId,
            _backupName,
            _backupType,
            _createdBy,
            includesDatabase: true,
            includesFiles: true,
            includesConfiguration: true,
            isCompressed: true,
            isEncrypted: true,
            _description
        );

        // Assert
        backup.Should().NotBeNull();
        backup.Id.Should().NotBeEmpty();
        backup.TenantId.Should().Be(_tenantId);
        backup.BackupName.Should().Be(_backupName);
        backup.BackupType.Should().Be(_backupType);
        backup.Status.Should().Be("Pending");
        backup.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        backup.CreatedBy.Should().Be(_createdBy);
        backup.IncludesDatabase.Should().BeTrue();
        backup.IncludesFiles.Should().BeTrue();
        backup.IncludesConfiguration.Should().BeTrue();
        backup.IsCompressed.Should().BeTrue();
        backup.IsEncrypted.Should().BeTrue();
        backup.Description.Should().Be(_description);
        backup.IsRestorable.Should().BeFalse();
        backup.RestoreCount.Should().Be(0);
        backup.RetryCount.Should().Be(0);
    }

    [Fact]
    public void Create_WithDefaultOptions_ShouldUseDefaults()
    {
        // Act
        var backup = TenantBackup.Create(
            _tenantId,
            _backupName,
            _backupType,
            _createdBy
        );

        // Assert
        backup.IncludesDatabase.Should().BeTrue();
        backup.IncludesFiles.Should().BeTrue();
        backup.IncludesConfiguration.Should().BeTrue();
        backup.IsCompressed.Should().BeTrue();
        backup.IsEncrypted.Should().BeTrue();
        backup.Description.Should().BeNull();
    }

    [Fact]
    public void Create_WithEmptyBackupName_ShouldThrowArgumentException()
    {
        // Act
        var action = () => TenantBackup.Create(
            _tenantId,
            "",
            _backupType,
            _createdBy
        );

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Backup name cannot be empty.*")
            .WithParameterName("backupName");
    }

    [Fact]
    public void Create_WithInvalidBackupType_ShouldThrowArgumentException()
    {
        // Act
        var action = () => TenantBackup.Create(
            _tenantId,
            _backupName,
            "Invalid",
            _createdBy
        );

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Invalid backup type. Must be one of: Full, Incremental, Differential*")
            .WithParameterName("backupType");
    }

    [Theory]
    [InlineData("Full")]
    [InlineData("Incremental")]
    [InlineData("Differential")]
    public void Create_WithValidBackupTypes_ShouldSucceed(string backupType)
    {
        // Act
        var backup = TenantBackup.Create(
            _tenantId,
            _backupName,
            backupType,
            _createdBy
        );

        // Assert
        backup.BackupType.Should().Be(backupType);
    }

    [Fact]
    public void StartBackup_WhenPending_ShouldChangeStatusToInProgress()
    {
        // Arrange
        var backup = CreateBackup();

        // Act
        backup.StartBackup();

        // Assert
        backup.Status.Should().Be("InProgress");
    }

    [Fact]
    public void StartBackup_WhenNotPending_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var backup = CreateBackup();
        backup.StartBackup();

        // Act
        var action = () => backup.StartBackup();

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Can only start pending backups.");
    }

    [Fact]
    public void CompleteBackup_WhenInProgress_ShouldCompleteSuccessfully()
    {
        // Arrange
        var backup = CreateBackup();
        backup.StartBackup();
        var sizeInBytes = 1024000L;
        var filePath = "/backups/backup-001.zip";
        var storageLocation = "S3";
        var downloadUrl = "https://s3.amazonaws.com/backups/backup-001.zip";
        var expiresAt = DateTime.UtcNow.AddDays(30);

        // Act
        backup.CompleteBackup(sizeInBytes, filePath, storageLocation, downloadUrl, expiresAt);

        // Assert
        backup.Status.Should().Be("Completed");
        backup.CompletedAt.Should().NotBeNull();
        backup.CompletedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        backup.SizeInBytes.Should().Be(sizeInBytes);
        backup.FilePath.Should().Be(filePath);
        backup.StorageLocation.Should().Be(storageLocation);
        backup.DownloadUrl.Should().Be(downloadUrl);
        backup.ExpiresAt.Should().Be(expiresAt);
        backup.IsRestorable.Should().BeTrue();
    }

    [Fact]
    public void CompleteBackup_WhenNotInProgress_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var backup = CreateBackup();

        // Act
        var action = () => backup.CompleteBackup(1024, "/path", "Local");

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Can only complete in-progress backups.");
    }

    [Fact]
    public void FailBackup_ShouldSetStatusToFailed()
    {
        // Arrange
        var backup = CreateBackup();
        var errorMessage = "Disk space insufficient";

        // Act
        backup.FailBackup(errorMessage);

        // Assert
        backup.Status.Should().Be("Failed");
        backup.ErrorMessage.Should().Be(errorMessage);
        backup.CompletedAt.Should().NotBeNull();
        backup.RetryCount.Should().Be(1);
    }

    [Fact]
    public void FailBackup_MultipleTimes_ShouldIncrementRetryCount()
    {
        // Arrange
        var backup = CreateBackup();

        // Act
        backup.FailBackup("Error 1");
        backup.FailBackup("Error 2");
        backup.FailBackup("Error 3");

        // Assert
        backup.RetryCount.Should().Be(3);
        backup.ErrorMessage.Should().Be("Error 3");
    }

    [Fact]
    public void MarkAsDeleted_WhenCompleted_ShouldMarkAsDeleted()
    {
        // Arrange
        var backup = CreateBackup();
        backup.StartBackup();
        backup.CompleteBackup(1024, "/path", "Local", "http://download.url");

        // Act
        backup.MarkAsDeleted();

        // Assert
        backup.Status.Should().Be("Deleted");
        backup.IsRestorable.Should().BeFalse();
        backup.FilePath.Should().BeNull();
        backup.DownloadUrl.Should().BeNull();
    }

    [Fact]
    public void MarkAsDeleted_WhenNotCompleted_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var backup = CreateBackup();

        // Act
        var action = () => backup.MarkAsDeleted();

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Can only delete completed backups.");
    }

    [Fact]
    public void RecordRestore_WhenRestorable_ShouldRecordRestore()
    {
        // Arrange
        var backup = CreateBackup();
        backup.StartBackup();
        backup.CompleteBackup(1024, "/path", "Local");
        var notes = "Restored for testing purposes";

        // Act
        backup.RecordRestore(notes);

        // Assert
        backup.LastRestoredAt.Should().NotBeNull();
        backup.LastRestoredAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        backup.RestoreCount.Should().Be(1);
        backup.RestoreNotes.Should().Be(notes);
    }

    [Fact]
    public void RecordRestore_MultipleTimes_ShouldIncrementRestoreCount()
    {
        // Arrange
        var backup = CreateBackup();
        backup.StartBackup();
        backup.CompleteBackup(1024, "/path", "Local");

        // Act
        backup.RecordRestore("Restore 1");
        backup.RecordRestore("Restore 2");
        backup.RecordRestore("Restore 3");

        // Assert
        backup.RestoreCount.Should().Be(3);
        backup.RestoreNotes.Should().Be("Restore 3");
    }

    [Fact]
    public void RecordRestore_WhenNotRestorable_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var backup = CreateBackup();

        // Act
        var action = () => backup.RecordRestore();

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("This backup is not restorable.");
    }

    [Fact]
    public void SetEncryptionKey_WhenEncrypted_ShouldSetKey()
    {
        // Arrange
        var backup = CreateBackup();
        var encryptedKey = "encrypted-key-value";

        // Act
        backup.SetEncryptionKey(encryptedKey);

        // Assert
        backup.EncryptionKey.Should().Be(encryptedKey);
    }

    [Fact]
    public void SetEncryptionKey_WhenNotEncrypted_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var backup = TenantBackup.Create(
            _tenantId,
            _backupName,
            _backupType,
            _createdBy,
            isEncrypted: false
        );

        // Act
        var action = () => backup.SetEncryptionKey("key");

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Cannot set encryption key for non-encrypted backup.");
    }

    [Fact]
    public void SetMetadata_ShouldSetMetadata()
    {
        // Arrange
        var backup = CreateBackup();
        var metadata = "{\"server\":\"prod-01\",\"version\":\"1.0.0\"}";

        // Act
        backup.SetMetadata(metadata);

        // Assert
        backup.Metadata.Should().Be(metadata);
    }

    [Fact]
    public void SetTags_ShouldSetTags()
    {
        // Arrange
        var backup = CreateBackup();
        var tags = "[\"daily\",\"production\",\"critical\"]";

        // Act
        backup.SetTags(tags);

        // Assert
        backup.Tags.Should().Be(tags);
    }

    [Fact]
    public void IsExpired_WhenExpiresAtPassed_ShouldReturnTrue()
    {
        // Arrange
        var backup = CreateBackup();
        backup.StartBackup();
        backup.CompleteBackup(1024, "/path", "Local", expiresAt: DateTime.UtcNow.AddDays(-1));

        // Act
        var isExpired = backup.IsExpired();

        // Assert
        isExpired.Should().BeTrue();
    }

    [Fact]
    public void IsExpired_WhenExpiresAtInFuture_ShouldReturnFalse()
    {
        // Arrange
        var backup = CreateBackup();
        backup.StartBackup();
        backup.CompleteBackup(1024, "/path", "Local", expiresAt: DateTime.UtcNow.AddDays(30));

        // Act
        var isExpired = backup.IsExpired();

        // Assert
        isExpired.Should().BeFalse();
    }

    [Fact]
    public void IsExpired_WhenNoExpiration_ShouldReturnFalse()
    {
        // Arrange
        var backup = CreateBackup();
        backup.StartBackup();
        backup.CompleteBackup(1024, "/path", "Local");

        // Act
        var isExpired = backup.IsExpired();

        // Assert
        isExpired.Should().BeFalse();
    }

    [Fact]
    public void CanRetry_WhenFailedAndUnderLimit_ShouldReturnTrue()
    {
        // Arrange
        var backup = CreateBackup();
        backup.FailBackup("Error");

        // Act
        var canRetry = backup.CanRetry();

        // Assert
        canRetry.Should().BeTrue();
    }

    [Fact]
    public void CanRetry_WhenFailedAndAtLimit_ShouldReturnFalse()
    {
        // Arrange
        var backup = CreateBackup();
        backup.FailBackup("Error 1");
        backup.FailBackup("Error 2");
        backup.FailBackup("Error 3");

        // Act
        var canRetry = backup.CanRetry();

        // Assert
        canRetry.Should().BeFalse();
    }

    [Fact]
    public void CanRetry_WhenNotFailed_ShouldReturnFalse()
    {
        // Arrange
        var backup = CreateBackup();

        // Act
        var canRetry = backup.CanRetry();

        // Assert
        canRetry.Should().BeFalse();
    }

    [Fact]
    public void CompleteBackupWorkflow_ShouldWorkCorrectly()
    {
        // Arrange & Act
        var backup = TenantBackup.Create(
            _tenantId,
            "Production Backup",
            "Full",
            "admin@company.com",
            includesDatabase: true,
            includesFiles: true,
            includesConfiguration: true,
            isCompressed: true,
            isEncrypted: true,
            "Complete production backup"
        );

        // Set metadata and tags
        backup.SetMetadata("{\"server\":\"prod-01\"}");
        backup.SetTags("[\"production\",\"critical\"]");

        // Set encryption key
        backup.SetEncryptionKey("encrypted-key-123");

        // Start backup process
        backup.StartBackup();
        backup.Status.Should().Be("InProgress");

        // Complete backup
        var sizeInBytes = 5000000L;
        var filePath = "/backups/prod/backup-20250922.zip";
        var storageLocation = "AWS S3";
        var downloadUrl = "https://s3.amazonaws.com/backups/prod/backup-20250922.zip";
        var expiresAt = DateTime.UtcNow.AddDays(90);
        
        backup.CompleteBackup(sizeInBytes, filePath, storageLocation, downloadUrl, expiresAt);

        // Verify completion
        backup.Status.Should().Be("Completed");
        backup.IsRestorable.Should().BeTrue();
        backup.SizeInBytes.Should().Be(sizeInBytes);

        // Perform restore
        backup.RecordRestore("Emergency restore to staging environment");
        backup.RestoreCount.Should().Be(1);
        backup.LastRestoredAt.Should().NotBeNull();

        // Check expiration
        backup.IsExpired().Should().BeFalse();
    }

    private TenantBackup CreateBackup()
    {
        return TenantBackup.Create(
            _tenantId,
            _backupName,
            _backupType,
            _createdBy,
            includesDatabase: true,
            includesFiles: true,
            includesConfiguration: true,
            isCompressed: true,
            isEncrypted: true,
            _description
        );
    }
}