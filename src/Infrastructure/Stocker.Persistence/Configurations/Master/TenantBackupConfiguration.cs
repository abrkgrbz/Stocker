using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Master.Entities;

namespace Stocker.Persistence.Configurations.Master;

public class TenantBackupConfiguration : IEntityTypeConfiguration<TenantBackup>
{
    public void Configure(EntityTypeBuilder<TenantBackup> builder)
    {
        builder.ToTable("TenantBackups", "master");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
            .HasColumnName("Id")
            .ValueGeneratedNever();

        builder.Property(x => x.TenantId)
            .HasColumnName("TenantId")
            .IsRequired();

        builder.Property(x => x.BackupName)
            .HasColumnName("BackupName")
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(x => x.BackupType)
            .HasColumnName("BackupType")
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(x => x.Status)
            .HasColumnName("Status")
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(x => x.CreatedAt)
            .HasColumnName("CreatedAt")
            .IsRequired();

        builder.Property(x => x.CompletedAt)
            .HasColumnName("CompletedAt");

        builder.Property(x => x.CreatedBy)
            .HasColumnName("CreatedBy")
            .HasMaxLength(100)
            .IsRequired();

        // Backup Details
        builder.Property(x => x.SizeInBytes)
            .HasColumnName("SizeInBytes")
            .IsRequired();

        builder.Property(x => x.FilePath)
            .HasColumnName("FilePath")
            .HasMaxLength(500);

        builder.Property(x => x.StorageLocation)
            .HasColumnName("StorageLocation")
            .HasMaxLength(100);

        builder.Property(x => x.DownloadUrl)
            .HasColumnName("DownloadUrl")
            .HasMaxLength(1000);

        builder.Property(x => x.ExpiresAt)
            .HasColumnName("ExpiresAt");

        // Backup Content
        builder.Property(x => x.IncludesDatabase)
            .HasColumnName("IncludesDatabase")
            .IsRequired();

        builder.Property(x => x.IncludesFiles)
            .HasColumnName("IncludesFiles")
            .IsRequired();

        builder.Property(x => x.IncludesConfiguration)
            .HasColumnName("IncludesConfiguration")
            .IsRequired();

        builder.Property(x => x.IsCompressed)
            .HasColumnName("IsCompressed")
            .IsRequired();

        builder.Property(x => x.IsEncrypted)
            .HasColumnName("IsEncrypted")
            .IsRequired();

        builder.Property(x => x.EncryptionKey)
            .HasColumnName("EncryptionKey")
            .HasMaxLength(500);

        // Restore Information
        builder.Property(x => x.IsRestorable)
            .HasColumnName("IsRestorable")
            .IsRequired();

        builder.Property(x => x.LastRestoredAt)
            .HasColumnName("LastRestoredAt");

        builder.Property(x => x.RestoreCount)
            .HasColumnName("RestoreCount")
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(x => x.RestoreNotes)
            .HasColumnName("RestoreNotes")
            .HasMaxLength(1000);

        // Error Handling
        builder.Property(x => x.ErrorMessage)
            .HasColumnName("ErrorMessage")
            .HasMaxLength(1000);

        builder.Property(x => x.RetryCount)
            .HasColumnName("RetryCount")
            .IsRequired()
            .HasDefaultValue(0);

        // Metadata
        builder.Property(x => x.Description)
            .HasColumnName("Description")
            .HasMaxLength(500);

        builder.Property(x => x.Tags)
            .HasColumnName("Tags")
            .HasColumnType("text");

        builder.Property(x => x.Metadata)
            .HasColumnName("Metadata")
            .HasColumnType("text");

        // Relationships
        builder.HasOne(x => x.Tenant)
            .WithMany()
            .HasForeignKey(x => x.TenantId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(x => x.TenantId)
            .HasDatabaseName("IX_TenantBackups_TenantId");

        builder.HasIndex(x => x.CreatedAt)
            .HasDatabaseName("IX_TenantBackups_CreatedAt");

        builder.HasIndex(x => new { x.TenantId, x.Status })
            .HasDatabaseName("IX_TenantBackups_TenantId_Status");

        builder.HasIndex(x => new { x.TenantId, x.CreatedAt })
            .HasDatabaseName("IX_TenantBackups_TenantId_CreatedAt");

        builder.HasIndex(x => new { x.TenantId, x.BackupType })
            .HasDatabaseName("IX_TenantBackups_TenantId_BackupType");
    }
}