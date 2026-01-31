using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Master.Entities.CMS;

namespace Stocker.Persistence.Configurations.Master.CMS;

public class CmsPageConfiguration : BaseEntityTypeConfiguration<CmsPage>
{
    public override void Configure(EntityTypeBuilder<CmsPage> builder)
    {
        base.Configure(builder);

        builder.ToTable("CmsPages", "cms");

        // Properties
        builder.Property(p => p.Title)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(p => p.Slug)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(p => p.Content)
            .IsRequired()
            .HasColumnType("text");

        builder.Property(p => p.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(p => p.MetaTitle)
            .HasMaxLength(200);

        builder.Property(p => p.MetaDescription)
            .HasMaxLength(500);

        builder.Property(p => p.FeaturedImage)
            .HasMaxLength(500);

        builder.Property(p => p.AuthorId)
            .IsRequired();

        builder.Property(p => p.Views)
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(p => p.CreatedAt)
            .IsRequired();

        builder.Property(p => p.UpdatedAt);

        builder.Property(p => p.PublishedAt);

        // Relationships
        builder.HasOne(p => p.Author)
            .WithMany()
            .HasForeignKey(p => p.AuthorId)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes
        builder.HasIndex(p => p.Slug)
            .IsUnique()
            .HasDatabaseName("IX_CmsPages_Slug");

        builder.HasIndex(p => p.Status)
            .HasDatabaseName("IX_CmsPages_Status");

        builder.HasIndex(p => p.AuthorId)
            .HasDatabaseName("IX_CmsPages_AuthorId");

        builder.HasIndex(p => p.CreatedAt)
            .HasDatabaseName("IX_CmsPages_CreatedAt");

        builder.HasIndex(p => p.PublishedAt)
            .HasDatabaseName("IX_CmsPages_PublishedAt");
    }
}
