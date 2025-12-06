using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.HR.Domain.Entities;

namespace Stocker.Modules.HR.Infrastructure.Persistence.Configurations;

/// <summary>
/// Entity configuration for Announcement
/// </summary>
public class AnnouncementConfiguration : IEntityTypeConfiguration<Announcement>
{
    public void Configure(EntityTypeBuilder<Announcement> builder)
    {
        builder.ToTable("Announcements", "hr");

        builder.HasKey(a => a.Id);

        builder.Property(a => a.TenantId)
            .IsRequired();

        builder.Property(a => a.Title)
            .HasMaxLength(500)
            .IsRequired();

        builder.Property(a => a.Content)
            .IsRequired();

        builder.Property(a => a.Type)
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(a => a.Priority)
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(a => a.AttachmentUrl)
            .HasMaxLength(500);

        // Relationships
        builder.HasOne(a => a.Author)
            .WithMany()
            .HasForeignKey(a => a.AuthorId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(a => a.Department)
            .WithMany()
            .HasForeignKey(a => a.DepartmentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(a => a.Acknowledgments)
            .WithOne(aa => aa.Announcement)
            .HasForeignKey(aa => aa.AnnouncementId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(a => a.TenantId);
        builder.HasIndex(a => new { a.TenantId, a.IsPublished });
        builder.HasIndex(a => new { a.TenantId, a.IsPinned });
        builder.HasIndex(a => new { a.TenantId, a.Type });
        builder.HasIndex(a => new { a.TenantId, a.PublishDate });
        builder.HasIndex(a => new { a.TenantId, a.DepartmentId });
    }
}
