using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Tenant.Entities;

namespace Stocker.Persistence.Configurations.Tenant;

public class BranchConfiguration : BaseEntityTypeConfiguration<Branch>
{
    public override void Configure(EntityTypeBuilder<Branch> builder)
    {
        base.Configure(builder);

        builder.ToTable("Branches", "tenant");

        // Properties
        builder.Property(b => b.TenantId)
            .IsRequired();

        builder.Property(b => b.CompanyId)
            .IsRequired();

        builder.Property(b => b.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(b => b.Code)
            .HasMaxLength(50);

        builder.Property(b => b.IsHeadOffice)
            .IsRequired();

        builder.Property(b => b.IsActive)
            .IsRequired();

        builder.Property(b => b.CreatedAt)
            .IsRequired();

        // Value Objects
        builder.OwnsOne(b => b.Address, address =>
        {
            address.Property(a => a.Street)
                .IsRequired()
                .HasMaxLength(200)
                .HasColumnName("AddressStreet");

            address.Property(a => a.Building)
                .HasMaxLength(100)
                .HasColumnName("AddressBuilding");

            address.Property(a => a.Floor)
                .HasMaxLength(50)
                .HasColumnName("AddressFloor");

            address.Property(a => a.Apartment)
                .HasMaxLength(50)
                .HasColumnName("AddressApartment");

            address.Property(a => a.City)
                .IsRequired()
                .HasMaxLength(100)
                .HasColumnName("AddressCity");

            address.Property(a => a.State)
                .HasMaxLength(100)
                .HasColumnName("AddressState");

            address.Property(a => a.Country)
                .IsRequired()
                .HasMaxLength(100)
                .HasColumnName("AddressCountry");

            address.Property(a => a.PostalCode)
                .HasMaxLength(20)
                .HasColumnName("AddressPostalCode");
        });

        builder.OwnsOne(b => b.Phone, phone =>
        {
            phone.Property(p => p.Value)
                .IsRequired()
                .HasMaxLength(20)
                .HasColumnName("Phone");
        });

        builder.OwnsOne(b => b.Email, email =>
        {
            email.Property(e => e.Value)
                .HasMaxLength(256)
                .HasColumnName("Email");
        });

        // Indexes
        builder.HasIndex(b => b.TenantId)
            .HasDatabaseName("IX_Branches_TenantId");

        builder.HasIndex(b => b.CompanyId)
            .HasDatabaseName("IX_Branches_CompanyId");

        builder.HasIndex(b => new { b.CompanyId, b.Code })
            .IsUnique()
            .HasFilter("\"Code\" IS NOT NULL")
            .HasDatabaseName("IX_Branches_CompanyId_Code");

        builder.HasIndex(b => new { b.CompanyId, b.IsHeadOffice })
            .HasFilter("\"IsHeadOffice\" = TRUE")
            .IsUnique()
            .HasDatabaseName("IX_Branches_CompanyId_HeadOffice");

        builder.HasIndex(b => b.IsActive)
            .HasDatabaseName("IX_Branches_IsActive");
    }
}