using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.HR.Domain.Entities;

namespace Stocker.Modules.HR.Infrastructure.Persistence.Configurations;

/// <summary>
/// Entity configuration for AnnouncementAcknowledgment
/// </summary>
public class AnnouncementAcknowledgmentConfiguration : IEntityTypeConfiguration<AnnouncementAcknowledgment>
{
    public void Configure(EntityTypeBuilder<AnnouncementAcknowledgment> builder)
    {
        builder.ToTable("AnnouncementAcknowledgments", "hr");

        builder.HasKey(aa => aa.Id);

        builder.Property(aa => aa.TenantId)
            .IsRequired();

        builder.Property(aa => aa.Comments)
            .HasMaxLength(1000);

        // Relationships
        builder.HasOne(aa => aa.Announcement)
            .WithMany(a => a.Acknowledgments)
            .HasForeignKey(aa => aa.AnnouncementId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(aa => aa.Employee)
            .WithMany()
            .HasForeignKey(aa => aa.EmployeeId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(aa => aa.TenantId);
        builder.HasIndex(aa => new { aa.TenantId, aa.AnnouncementId });
        builder.HasIndex(aa => new { aa.TenantId, aa.EmployeeId });
        builder.HasIndex(aa => new { aa.AnnouncementId, aa.EmployeeId }).IsUnique();
    }
}
