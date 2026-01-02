using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.CRM.Domain.Entities;

namespace Stocker.Modules.CRM.Infrastructure.Persistence.Configurations;

/// <summary>
/// Entity configuration for Customer
/// </summary>
public class CustomerConfiguration : IEntityTypeConfiguration<Customer>
{
    public void Configure(EntityTypeBuilder<Customer> builder)
    {
        builder.ToTable("Customers", "crm");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.Id)
            .ValueGeneratedNever();

        builder.Property(c => c.TenantId)
            .IsRequired();

        builder.Property(c => c.CompanyName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(c => c.Email)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(c => c.Phone)
            .HasMaxLength(50);

        builder.Property(c => c.Website)
            .HasMaxLength(255);

        builder.Property(c => c.Industry)
            .HasMaxLength(100);

        builder.Property(c => c.Address)
            .HasMaxLength(500);

        // GeoLocation FK fields (cross-database reference to Master.Countries/Cities/Districts)
        // Note: These are NOT EF navigation properties since they reference Master DB
        builder.Property(c => c.CountryId);
        builder.Property(c => c.CityId);
        builder.Property(c => c.DistrictId);

        // Denormalized string fields for display and backward compatibility
        builder.Property(c => c.City)
            .HasMaxLength(100);

        builder.Property(c => c.State)
            .HasMaxLength(100);

        builder.Property(c => c.Country)
            .HasMaxLength(100);

        builder.Property(c => c.District)
            .HasMaxLength(100);

        builder.Property(c => c.PostalCode)
            .HasMaxLength(20);

        builder.Property(c => c.AnnualRevenue)
            .HasPrecision(18, 2);

        builder.Property(c => c.Description)
            .HasMaxLength(2000);

        // Relationships
        builder.HasMany(c => c.Contacts)
            .WithOne(contact => contact.Customer)
            .HasForeignKey(contact => contact.CustomerId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(c => c.TenantId);
        builder.HasIndex(c => new { c.TenantId, c.Email }).IsUnique();
        builder.HasIndex(c => new { c.TenantId, c.CompanyName });
        builder.HasIndex(c => new { c.TenantId, c.IsActive });

        // GeoLocation indexes for filtering
        builder.HasIndex(c => new { c.TenantId, c.CountryId });
        builder.HasIndex(c => new { c.TenantId, c.CityId });
        builder.HasIndex(c => new { c.TenantId, c.DistrictId });
    }
}