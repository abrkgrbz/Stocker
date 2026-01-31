using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Master.Entities.CMS;

namespace Stocker.Persistence.Configurations.Master.CMS;

public class CmsMediaConfiguration : BaseEntityTypeConfiguration<CmsMedia>
{
    public override void Configure(EntityTypeBuilder<CmsMedia> builder)
    {
        base.Configure(builder);

        builder.ToTable("CmsMedia", "cms");

        // Properties
        builder.Property(m => m.FileName)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(m => m.StoredFileName)
            .IsRequired()
            .HasMaxLength(300);

        builder.Property(m => m.FilePath)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(m => m.Url)
            .IsRequired()
            .HasMaxLength(1000);

        builder.Property(m => m.Type)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(m => m.MimeType)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(m => m.Size)
            .IsRequired();

        builder.Property(m => m.Width);

        builder.Property(m => m.Height);

        builder.Property(m => m.AltText)
            .HasMaxLength(500);

        builder.Property(m => m.Title)
            .HasMaxLength(255);

        builder.Property(m => m.Folder)
            .HasMaxLength(100);

        builder.Property(m => m.UploadedById)
            .IsRequired();

        builder.Property(m => m.UploadedAt)
            .IsRequired();

        builder.Property(m => m.UsageCount)
            .IsRequired()
            .HasDefaultValue(0);

        // Relationships
        builder.HasOne(m => m.UploadedBy)
            .WithMany()
            .HasForeignKey(m => m.UploadedById)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes
        builder.HasIndex(m => m.StoredFileName)
            .IsUnique()
            .HasDatabaseName("IX_CmsMedia_StoredFileName");

        builder.HasIndex(m => m.Type)
            .HasDatabaseName("IX_CmsMedia_Type");

        builder.HasIndex(m => m.Folder)
            .HasDatabaseName("IX_CmsMedia_Folder");

        builder.HasIndex(m => m.UploadedById)
            .HasDatabaseName("IX_CmsMedia_UploadedById");

        builder.HasIndex(m => m.UploadedAt)
            .HasDatabaseName("IX_CmsMedia_UploadedAt");

        builder.HasIndex(m => m.MimeType)
            .HasDatabaseName("IX_CmsMedia_MimeType");
    }
}
