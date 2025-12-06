using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.HR.Domain.Entities;

namespace Stocker.Modules.HR.Infrastructure.Persistence.Configurations;

/// <summary>
/// Entity configuration for Holiday
/// </summary>
public class HolidayConfiguration : IEntityTypeConfiguration<Holiday>
{
    public void Configure(EntityTypeBuilder<Holiday> builder)
    {
        builder.ToTable("Holidays", "hr");

        builder.HasKey(h => h.Id);

        builder.Property(h => h.TenantId)
            .IsRequired();

        builder.Property(h => h.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(h => h.Description)
            .HasMaxLength(500);

        // Indexes
        builder.HasIndex(h => h.TenantId);
        builder.HasIndex(h => new { h.TenantId, h.Date });
        builder.HasIndex(h => new { h.TenantId, h.IsRecurring });
        builder.HasIndex(h => new { h.TenantId, h.Year });
        builder.HasIndex(h => new { h.TenantId, h.IsActive });
    }
}
