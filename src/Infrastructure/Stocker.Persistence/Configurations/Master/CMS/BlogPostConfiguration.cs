using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Master.Entities.CMS;
using System.Text.Json;

namespace Stocker.Persistence.Configurations.Master.CMS;

public class BlogPostConfiguration : BaseEntityTypeConfiguration<BlogPost>
{
    public override void Configure(EntityTypeBuilder<BlogPost> builder)
    {
        base.Configure(builder);

        builder.ToTable("BlogPosts", "cms");

        // Properties
        builder.Property(p => p.Title)
            .IsRequired()
            .HasMaxLength(300);

        builder.Property(p => p.Slug)
            .IsRequired()
            .HasMaxLength(300);

        builder.Property(p => p.Content)
            .IsRequired()
            .HasColumnType("text");

        builder.Property(p => p.Excerpt)
            .HasMaxLength(500);

        builder.Property(p => p.CategoryId)
            .IsRequired();

        // Tags stored as JSON array
        builder.Property(p => p.Tags)
            .HasConversion(
                v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                v => JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions?)null) ?? new List<string>())
            .HasColumnType("jsonb")
            .HasColumnName("Tags");

        builder.Property(p => p.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(p => p.PublishDate);

        builder.Property(p => p.FeaturedImage)
            .HasMaxLength(500);

        builder.Property(p => p.AuthorId)
            .IsRequired();

        builder.Property(p => p.Views)
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(p => p.MetaTitle)
            .HasMaxLength(300);

        builder.Property(p => p.MetaDescription)
            .HasMaxLength(500);

        builder.Property(p => p.CreatedAt)
            .IsRequired();

        builder.Property(p => p.UpdatedAt);

        // Relationships
        builder.HasOne(p => p.Category)
            .WithMany(c => c.Posts)
            .HasForeignKey(p => p.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(p => p.Author)
            .WithMany()
            .HasForeignKey(p => p.AuthorId)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes
        builder.HasIndex(p => p.Slug)
            .IsUnique()
            .HasDatabaseName("IX_BlogPosts_Slug");

        builder.HasIndex(p => p.CategoryId)
            .HasDatabaseName("IX_BlogPosts_CategoryId");

        builder.HasIndex(p => p.Status)
            .HasDatabaseName("IX_BlogPosts_Status");

        builder.HasIndex(p => p.AuthorId)
            .HasDatabaseName("IX_BlogPosts_AuthorId");

        builder.HasIndex(p => p.PublishDate)
            .HasDatabaseName("IX_BlogPosts_PublishDate");

        builder.HasIndex(p => p.CreatedAt)
            .HasDatabaseName("IX_BlogPosts_CreatedAt");

        // Composite index for listing
        builder.HasIndex(p => new { p.Status, p.PublishDate })
            .HasDatabaseName("IX_BlogPosts_Status_PublishDate");
    }
}
