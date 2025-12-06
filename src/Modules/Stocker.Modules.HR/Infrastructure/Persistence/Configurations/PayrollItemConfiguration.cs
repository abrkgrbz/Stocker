using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.HR.Domain.Entities;

namespace Stocker.Modules.HR.Infrastructure.Persistence.Configurations;

/// <summary>
/// Entity configuration for PayrollItem
/// </summary>
public class PayrollItemConfiguration : IEntityTypeConfiguration<PayrollItem>
{
    public void Configure(EntityTypeBuilder<PayrollItem> builder)
    {
        builder.ToTable("PayrollItems", "hr");

        builder.HasKey(pi => pi.Id);

        builder.Property(pi => pi.TenantId)
            .IsRequired();

        builder.Property(pi => pi.Code)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(pi => pi.Description)
            .HasMaxLength(500)
            .IsRequired();

        builder.Property(pi => pi.ItemType)
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(pi => pi.Amount)
            .HasPrecision(18, 2);

        builder.Property(pi => pi.Quantity)
            .HasPrecision(10, 2);

        builder.Property(pi => pi.Rate)
            .HasPrecision(10, 4);

        builder.Property(pi => pi.Notes)
            .HasMaxLength(1000);

        // Relationships
        builder.HasOne(pi => pi.Payroll)
            .WithMany(p => p.Items)
            .HasForeignKey(pi => pi.PayrollId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(pi => pi.TenantId);
        builder.HasIndex(pi => new { pi.TenantId, pi.PayrollId });
        builder.HasIndex(pi => new { pi.TenantId, pi.ItemType });
    }
}
