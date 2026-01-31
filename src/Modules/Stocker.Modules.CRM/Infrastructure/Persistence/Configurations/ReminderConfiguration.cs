using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.CRM.Domain.Entities;

namespace Stocker.Modules.CRM.Infrastructure.Persistence.Configurations;

public class ReminderConfiguration : IEntityTypeConfiguration<Reminder>
{
    public void Configure(EntityTypeBuilder<Reminder> builder)
    {
        builder.ToTable("Reminders", "crm");

        builder.HasKey(r => r.Id);

        builder.Property(r => r.TenantId)
            .IsRequired();

        builder.Property(r => r.UserId)
            .IsRequired();

        builder.Property(r => r.Title)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(r => r.Description)
            .HasMaxLength(2000);

        builder.Property(r => r.RemindAt)
            .IsRequired();

        builder.Property(r => r.Type)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(r => r.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(r => r.RelatedEntityType)
            .HasMaxLength(100);

        builder.Property(r => r.RecurrenceType)
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(r => r.RecurrencePattern)
            .HasMaxLength(1000);

        builder.Property(r => r.Participants)
            .HasMaxLength(4000);

        // Indexes for common queries
        builder.HasIndex(r => r.TenantId);
        builder.HasIndex(r => r.UserId);
        builder.HasIndex(r => r.Status);
        builder.HasIndex(r => r.RemindAt);
        builder.HasIndex(r => new { r.TenantId, r.UserId, r.Status });
        builder.HasIndex(r => new { r.TenantId, r.Status, r.RemindAt });
    }
}
