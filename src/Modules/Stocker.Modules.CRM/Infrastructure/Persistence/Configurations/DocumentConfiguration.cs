using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Domain.Enums;

namespace Stocker.Modules.CRM.Infrastructure.Persistence.Configurations;

public class DocumentConfiguration : IEntityTypeConfiguration<Document>
{
    public void Configure(EntityTypeBuilder<Document> builder)
    {
        builder.ToTable("Documents");

        builder.HasKey(d => d.Id);

        builder.Property(d => d.FileName)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(d => d.OriginalFileName)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(d => d.ContentType)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(d => d.FileSize)
            .IsRequired();

        builder.Property(d => d.StoragePath)
            .IsRequired()
            .HasMaxLength(2000);

        builder.Property(d => d.StorageProvider)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(d => d.EntityId)
            .IsRequired();

        builder.Property(d => d.EntityType)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(d => d.Category)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(d => d.Description)
            .HasMaxLength(2000);

        builder.Property(d => d.Tags)
            .HasMaxLength(1000);

        builder.Property(d => d.Version)
            .IsRequired()
            .HasDefaultValue(1);

        builder.Property(d => d.ParentDocumentId)
            .IsRequired(false);

        builder.Property(d => d.UploadedAt)
            .IsRequired();

        builder.Property(d => d.UploadedBy)
            .IsRequired();

        builder.Property(d => d.ExpiresAt)
            .IsRequired(false);

        builder.Property(d => d.IsArchived)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(d => d.AccessLevel)
            .IsRequired()
            .HasConversion<int>()
            .HasDefaultValue(AccessLevel.Private);

        builder.Property(d => d.EncryptionKey)
            .HasMaxLength(500);

        builder.Property(d => d.Metadata)
            .HasMaxLength(4000);

        builder.Property(d => d.TenantId)
            .IsRequired();

        builder.Property(d => d.CreatedDate)
            .IsRequired();

        builder.Property(d => d.UpdatedDate);

        builder.Property(d => d.IsDeleted)
            .IsRequired()
            .HasDefaultValue(false);

        // Indexes for performance
        builder.HasIndex(d => d.TenantId)
            .HasDatabaseName("IX_Documents_TenantId");

        builder.HasIndex(d => new { d.EntityId, d.EntityType, d.TenantId })
            .HasDatabaseName("IX_Documents_Entity_Tenant");

        builder.HasIndex(d => d.UploadedBy)
            .HasDatabaseName("IX_Documents_UploadedBy");

        builder.HasIndex(d => d.Category)
            .HasDatabaseName("IX_Documents_Category");

        builder.HasIndex(d => d.IsArchived)
            .HasDatabaseName("IX_Documents_IsArchived");

        builder.HasIndex(d => d.ParentDocumentId)
            .HasDatabaseName("IX_Documents_ParentDocumentId");

        // Query filter for soft delete and tenant isolation
        builder.HasQueryFilter(d => !d.IsDeleted);
    }
}
