using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Purchase.Domain.Entities;

namespace Stocker.Modules.Purchase.Infrastructure.Persistence.Configurations;

public class SupplierConfiguration : IEntityTypeConfiguration<Supplier>
{
    public void Configure(EntityTypeBuilder<Supplier> builder)
    {
        builder.ToTable("Suppliers");

        builder.HasKey(s => s.Id);

        // Link to Inventory.Supplier for synchronization when both modules are active
        builder.Property(s => s.InventorySupplierId)
            .IsRequired(false);

        builder.HasIndex(s => new { s.TenantId, s.InventorySupplierId })
            .HasFilter("\"InventorySupplierId\" IS NOT NULL")
            .IsUnique();

        builder.Property(s => s.Code)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(s => s.Name)
            .IsRequired()
            .HasMaxLength(300);

        builder.Property(s => s.TaxNumber)
            .HasMaxLength(20);

        builder.Property(s => s.TaxOffice)
            .HasMaxLength(100);

        builder.Property(s => s.Email)
            .HasMaxLength(200);

        builder.Property(s => s.Phone)
            .HasMaxLength(30);

        builder.Property(s => s.Fax)
            .HasMaxLength(30);

        builder.Property(s => s.Website)
            .HasMaxLength(200);

        builder.Property(s => s.Address)
            .HasMaxLength(500);

        builder.Property(s => s.City)
            .HasMaxLength(100);

        builder.Property(s => s.District)
            .HasMaxLength(100);

        builder.Property(s => s.PostalCode)
            .HasMaxLength(20);

        builder.Property(s => s.Country)
            .HasMaxLength(100);

        builder.Property(s => s.ContactPerson)
            .HasMaxLength(200);

        builder.Property(s => s.ContactPhone)
            .HasMaxLength(30);

        builder.Property(s => s.ContactEmail)
            .HasMaxLength(200);

        builder.Property(s => s.Type)
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(s => s.Status)
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(s => s.Currency)
            .HasMaxLength(10);

        builder.Property(s => s.CreditLimit)
            .HasPrecision(18, 4);

        builder.Property(s => s.CurrentBalance)
            .HasPrecision(18, 4);

        builder.Property(s => s.BankName)
            .HasMaxLength(200);

        builder.Property(s => s.BankBranch)
            .HasMaxLength(100);

        builder.Property(s => s.BankAccountNumber)
            .HasMaxLength(50);

        builder.Property(s => s.IBAN)
            .HasMaxLength(50);

        builder.Property(s => s.SwiftCode)
            .HasMaxLength(20);

        builder.Property(s => s.DiscountRate)
            .HasPrecision(5, 2);

        builder.Property(s => s.Notes)
            .HasMaxLength(2000);

        builder.Property(s => s.TotalPurchaseAmount)
            .HasPrecision(18, 4);

        builder.Property(s => s.Rating)
            .HasPrecision(3, 2);

        builder.Property(s => s.Tags)
            .HasMaxLength(500);

        builder.HasMany(s => s.Contacts)
            .WithOne(c => c.Supplier)
            .HasForeignKey(c => c.SupplierId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(s => s.Products)
            .WithOne(p => p.Supplier)
            .HasForeignKey(p => p.SupplierId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(s => new { s.TenantId, s.Code }).IsUnique();
        builder.HasIndex(s => new { s.TenantId, s.Name });
        builder.HasIndex(s => new { s.TenantId, s.TaxNumber });
        builder.HasIndex(s => new { s.TenantId, s.Status });
        builder.HasIndex(s => new { s.TenantId, s.IsActive });
    }
}

public class SupplierContactConfiguration : IEntityTypeConfiguration<SupplierContact>
{
    public void Configure(EntityTypeBuilder<SupplierContact> builder)
    {
        builder.ToTable("SupplierContacts");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(c => c.Title)
            .HasMaxLength(100);

        builder.Property(c => c.Department)
            .HasMaxLength(100);

        builder.Property(c => c.Email)
            .HasMaxLength(200);

        builder.Property(c => c.Phone)
            .HasMaxLength(30);

        builder.Property(c => c.Mobile)
            .HasMaxLength(30);

        builder.Property(c => c.Notes)
            .HasMaxLength(1000);

        builder.HasIndex(c => new { c.TenantId, c.SupplierId });
    }
}

public class SupplierProductConfiguration : IEntityTypeConfiguration<SupplierProduct>
{
    public void Configure(EntityTypeBuilder<SupplierProduct> builder)
    {
        builder.ToTable("SupplierProducts");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.SupplierProductCode)
            .HasMaxLength(100);

        builder.Property(p => p.SupplierProductName)
            .HasMaxLength(300);

        builder.Property(p => p.UnitPrice)
            .HasPrecision(18, 4);

        builder.Property(p => p.Currency)
            .HasMaxLength(10);

        builder.Property(p => p.MinimumOrderQuantity)
            .HasPrecision(18, 4);

        builder.Property(p => p.Notes)
            .HasMaxLength(1000);

        builder.HasIndex(p => new { p.TenantId, p.SupplierId, p.ProductId }).IsUnique();
        builder.HasIndex(p => new { p.TenantId, p.ProductId });
    }
}
