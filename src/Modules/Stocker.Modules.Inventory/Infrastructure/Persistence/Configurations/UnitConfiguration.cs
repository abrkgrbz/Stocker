using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Inventory.Domain.Entities;

namespace Stocker.Modules.Inventory.Infrastructure.Persistence.Configurations;

/// <summary>
/// Entity configuration for Unit
/// </summary>
public class UnitConfiguration : IEntityTypeConfiguration<Unit>
{
    public void Configure(EntityTypeBuilder<Unit> builder)
    {
        builder.ToTable("Units", "inventory");

        builder.HasKey(u => u.Id);

        builder.Property(u => u.TenantId)
            .IsRequired();

        builder.Property(u => u.Code)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(u => u.Name)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(u => u.Symbol)
            .HasMaxLength(10);

        builder.Property(u => u.Description)
            .HasMaxLength(200);

        builder.Property(u => u.ConversionFactor)
            .HasPrecision(18, 8);

        // Self-referencing for base unit
        builder.HasOne(u => u.BaseUnit)
            .WithMany()
            .HasForeignKey(u => u.BaseUnitId)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes
        builder.HasIndex(u => u.TenantId);
        builder.HasIndex(u => new { u.TenantId, u.Code }).IsUnique();
        builder.HasIndex(u => new { u.TenantId, u.IsActive });
    }
}
