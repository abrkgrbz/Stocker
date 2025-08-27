using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Tenant.Entities;

namespace Stocker.Persistence.Configurations.Tenant;

public class CompanyConfiguration : BaseEntityTypeConfiguration<Company>
{
    public override void Configure(EntityTypeBuilder<Company> builder)
    {
        base.Configure(builder);

        builder.ToTable("Companies", "tenant");

        // Properties
        builder.Property(c => c.TenantId)
            .IsRequired();

        builder.Property(c => c.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(c => c.LegalName)
            .HasMaxLength(200);

        builder.Property(c => c.TaxNumber)
            .HasMaxLength(50);

        builder.Property(c => c.TradeRegisterNumber)
            .HasMaxLength(100);

        builder.Property(c => c.Website)
            .HasMaxLength(255);

        builder.Property(c => c.LogoUrl)
            .HasMaxLength(500);

        builder.Property(c => c.Sector)
            .HasMaxLength(100);

        builder.Property(c => c.FoundedDate)
            .IsRequired();

        builder.Property(c => c.Currency)
            .IsRequired()
            .HasMaxLength(3);

        builder.Property(c => c.Timezone)
            .HasMaxLength(100);

        builder.Property(c => c.IsActive)
            .IsRequired();

        builder.Property(c => c.CreatedAt)
            .IsRequired();

        // Value Objects
        builder.OwnsOne(c => c.Email, email =>
        {
            email.Property(e => e.Value)
                .IsRequired()
                .HasMaxLength(256)
                .HasColumnName("Email");
        });

        builder.OwnsOne(c => c.Phone, phone =>
        {
            phone.Property(p => p.Value)
                .IsRequired()
                .HasMaxLength(20)
                .HasColumnName("Phone");
        });

        builder.OwnsOne(c => c.Fax, fax =>
        {
            fax.Property(f => f.Value)
                .HasMaxLength(20)
                .HasColumnName("Fax");
        });

        builder.OwnsOne(c => c.Address, address =>
        {
            address.Property(a => a.Country)
                .IsRequired()
                .HasMaxLength(100)
                .HasColumnName("AddressCountry");

            address.Property(a => a.City)
                .IsRequired()
                .HasMaxLength(100)
                .HasColumnName("AddressCity");

            address.Property(a => a.District)
                .IsRequired()
                .HasMaxLength(100)
                .HasColumnName("AddressDistrict");

            address.Property(a => a.PostalCode)
                .HasMaxLength(20)
                .HasColumnName("AddressPostalCode");

            address.Property(a => a.AddressLine)
                .IsRequired()
                .HasMaxLength(500)
                .HasColumnName("AddressLine");
        });

        // Relationships
        builder.HasMany(c => c.Departments)
            .WithOne()
            .HasForeignKey(d => d.CompanyId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(c => c.Branches)
            .WithOne()
            .HasForeignKey(b => b.CompanyId)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes
        builder.HasIndex(c => c.TenantId)
            .HasDatabaseName("IX_Companies_TenantId");

        builder.HasIndex(c => c.IsActive)
            .HasDatabaseName("IX_Companies_IsActive");

        builder.HasIndex(c => c.TaxNumber)
            .HasDatabaseName("IX_Companies_TaxNumber");
    }
}