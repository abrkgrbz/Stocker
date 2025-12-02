using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Inventory.Domain.Entities;

namespace Stocker.Modules.Inventory.Infrastructure.Persistence.Configurations;

/// <summary>
/// Entity configuration for Supplier
/// </summary>
public class SupplierConfiguration : IEntityTypeConfiguration<Supplier>
{
    public void Configure(EntityTypeBuilder<Supplier> builder)
    {
        builder.ToTable("Suppliers", "inventory");

        builder.HasKey(s => s.Id);

        builder.Property(s => s.TenantId)
            .IsRequired();

        builder.Property(s => s.Code)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(s => s.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(s => s.TaxNumber)
            .HasMaxLength(50);

        builder.Property(s => s.TaxOffice)
            .HasMaxLength(100);

        builder.OwnsOne(s => s.Email, e =>
        {
            e.Property(em => em.Value)
                .HasColumnName("Email")
                .HasMaxLength(255);
        });

        builder.OwnsOne(s => s.Phone, p =>
        {
            p.Property(ph => ph.Value)
                .HasColumnName("Phone")
                .HasMaxLength(50);
        });

        builder.OwnsOne(s => s.Fax, f =>
        {
            f.Property(fx => fx.Value)
                .HasColumnName("Fax")
                .HasMaxLength(50);
        });

        builder.OwnsOne(s => s.Address, a =>
        {
            a.Property(ad => ad.Street).HasColumnName("Street").HasMaxLength(200);
            a.Property(ad => ad.Building).HasColumnName("Building").HasMaxLength(50);
            a.Property(ad => ad.Floor).HasColumnName("Floor").HasMaxLength(20);
            a.Property(ad => ad.Apartment).HasColumnName("Apartment").HasMaxLength(20);
            a.Property(ad => ad.City).HasColumnName("City").HasMaxLength(100);
            a.Property(ad => ad.State).HasColumnName("State").HasMaxLength(100);
            a.Property(ad => ad.Country).HasColumnName("Country").HasMaxLength(100);
            a.Property(ad => ad.PostalCode).HasColumnName("PostalCode").HasMaxLength(20);
        });

        builder.Property(s => s.Website)
            .HasMaxLength(255);

        builder.Property(s => s.ContactPerson)
            .HasMaxLength(100);

        builder.Property(s => s.ContactPhone)
            .HasMaxLength(50);

        builder.Property(s => s.ContactEmail)
            .HasMaxLength(255);

        builder.Property(s => s.CreditLimit)
            .HasPrecision(18, 2);

        // Indexes
        builder.HasIndex(s => s.TenantId);
        builder.HasIndex(s => new { s.TenantId, s.Code }).IsUnique();
        builder.HasIndex(s => new { s.TenantId, s.Name });
        builder.HasIndex(s => new { s.TenantId, s.IsActive });
    }
}
