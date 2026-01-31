using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Master.Entities.CMS;

namespace Stocker.Persistence.Configurations.Master.CMS;

public class DocItemConfiguration : BaseEntityTypeConfiguration<DocItem>
{
    public override void Configure(EntityTypeBuilder<DocItem> builder)
    {
        base.Configure(builder);

        builder.ToTable("DocItems", "cms");

        // Properties
        builder.Property(d => d.Title)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(d => d.Slug)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(d => d.Type)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(d => d.ParentId);

        builder.Property(d => d.Content)
            .HasColumnType("text");

        builder.Property(d => d.Order)
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(d => d.Icon)
            .HasMaxLength(50);

        builder.Property(d => d.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(d => d.CreatedAt)
            .IsRequired();

        builder.Property(d => d.UpdatedAt);

        builder.Property(d => d.AuthorId);

        // Self-referencing relationship
        builder.HasOne(d => d.Parent)
            .WithMany(d => d.Children)
            .HasForeignKey(d => d.ParentId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(d => d.Author)
            .WithMany()
            .HasForeignKey(d => d.AuthorId)
            .OnDelete(DeleteBehavior.SetNull);

        // Indexes
        builder.HasIndex(d => d.Slug)
            .HasDatabaseName("IX_DocItems_Slug");

        builder.HasIndex(d => d.ParentId)
            .HasDatabaseName("IX_DocItems_ParentId");

        builder.HasIndex(d => d.Type)
            .HasDatabaseName("IX_DocItems_Type");

        builder.HasIndex(d => d.Order)
            .HasDatabaseName("IX_DocItems_Order");

        builder.HasIndex(d => d.IsActive)
            .HasDatabaseName("IX_DocItems_IsActive");

        // Composite index for tree queries
        builder.HasIndex(d => new { d.ParentId, d.Order })
            .HasDatabaseName("IX_DocItems_ParentId_Order");
    }
}
