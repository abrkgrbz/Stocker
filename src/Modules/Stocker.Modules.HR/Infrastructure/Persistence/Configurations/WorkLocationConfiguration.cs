using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.HR.Domain.Entities;

namespace Stocker.Modules.HR.Infrastructure.Persistence.Configurations;

/// <summary>
/// Entity configuration for WorkLocation
/// </summary>
public class WorkLocationConfiguration : IEntityTypeConfiguration<WorkLocation>
{
    public void Configure(EntityTypeBuilder<WorkLocation> builder)
    {
        builder.ToTable("WorkLocations", "hr");

        builder.HasKey(w => w.Id);

        builder.Property(w => w.TenantId)
            .IsRequired();

        builder.Property(w => w.Code)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(w => w.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(w => w.Description)
            .HasMaxLength(500);

        // Address Value Object
        builder.OwnsOne(w => w.Address, address =>
        {
            address.Property(a => a.Street).HasColumnName("Street").HasMaxLength(200);
            address.Property(a => a.City).HasColumnName("City").HasMaxLength(100);
            address.Property(a => a.State).HasColumnName("State").HasMaxLength(100);
            address.Property(a => a.PostalCode).HasColumnName("PostalCode").HasMaxLength(20);
            address.Property(a => a.Country).HasColumnName("Country").HasMaxLength(100);
        });

        builder.Property(w => w.Phone)
            .HasMaxLength(20);

        builder.Property(w => w.Email)
            .HasMaxLength(100);

        builder.Property(w => w.TimeZone)
            .HasMaxLength(50);

        builder.Property(w => w.Latitude)
            .HasPrecision(10, 7);

        builder.Property(w => w.Longitude)
            .HasPrecision(10, 7);

        // Indexes
        builder.HasIndex(w => w.TenantId);
        builder.HasIndex(w => new { w.TenantId, w.Code }).IsUnique();
        builder.HasIndex(w => new { w.TenantId, w.IsActive });
        builder.HasIndex(w => new { w.TenantId, w.IsHeadquarters });
    }
}
