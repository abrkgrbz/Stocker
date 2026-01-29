using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Sales.Domain.Entities;

namespace Stocker.Modules.Sales.Infrastructure.Persistence.Configurations;

public class SalesCustomerConfiguration : IEntityTypeConfiguration<SalesCustomer>
{
    public void Configure(EntityTypeBuilder<SalesCustomer> builder)
    {
        builder.ToTable("SalesCustomers", "sales");

        builder.HasKey(e => e.Id);

        // Tenant index
        builder.HasIndex(e => e.TenantId)
            .HasDatabaseName("IX_SalesCustomers_TenantId");

        // Unique customer code per tenant
        builder.HasIndex(e => new { e.TenantId, e.CustomerCode })
            .IsUnique()
            .HasDatabaseName("IX_SalesCustomers_TenantId_CustomerCode");

        // Tax number index (for quick lookup)
        builder.HasIndex(e => new { e.TenantId, e.TaxNumber })
            .HasDatabaseName("IX_SalesCustomers_TenantId_TaxNumber");

        // Identity number index
        builder.HasIndex(e => new { e.TenantId, e.IdentityNumber })
            .HasDatabaseName("IX_SalesCustomers_TenantId_IdentityNumber");

        // Active customers index
        builder.HasIndex(e => new { e.TenantId, e.IsActive })
            .HasDatabaseName("IX_SalesCustomers_TenantId_IsActive");

        // CRM link index
        builder.HasIndex(e => new { e.TenantId, e.CrmCustomerId })
            .HasDatabaseName("IX_SalesCustomers_TenantId_CrmCustomerId");

        // Properties
        builder.Property(e => e.CustomerCode)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(e => e.CustomerType)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(e => e.CompanyName)
            .HasMaxLength(500);

        builder.Property(e => e.FirstName)
            .HasMaxLength(100);

        builder.Property(e => e.LastName)
            .HasMaxLength(100);

        builder.Property(e => e.TaxNumber)
            .HasMaxLength(11); // VKN: 10, TCKN: 11

        builder.Property(e => e.IdentityNumber)
            .HasMaxLength(11);

        builder.Property(e => e.TaxOffice)
            .HasMaxLength(100);

        builder.Property(e => e.Email)
            .HasMaxLength(255);

        builder.Property(e => e.Phone)
            .HasMaxLength(30);

        builder.Property(e => e.MobilePhone)
            .HasMaxLength(30);

        builder.Property(e => e.AddressLine)
            .HasMaxLength(500);

        builder.Property(e => e.District)
            .HasMaxLength(100);

        builder.Property(e => e.City)
            .HasMaxLength(100);

        builder.Property(e => e.PostalCode)
            .HasMaxLength(20);

        builder.Property(e => e.Country)
            .IsRequired()
            .HasMaxLength(100)
            .HasDefaultValue("Türkiye");

        builder.Property(e => e.CountryCode)
            .IsRequired()
            .HasMaxLength(2)
            .HasDefaultValue("TR");

        // e-Fatura
        builder.Property(e => e.IsEInvoiceRegistered)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(e => e.EInvoiceAlias)
            .HasMaxLength(255);

        // Financial
        builder.Property(e => e.Currency)
            .IsRequired()
            .HasMaxLength(3)
            .HasDefaultValue("TRY");

        builder.Property(e => e.CreditLimit)
            .HasPrecision(18, 2)
            .HasDefaultValue(0);

        builder.Property(e => e.CurrentBalance)
            .HasPrecision(18, 2)
            .HasDefaultValue(0);

        builder.Property(e => e.DefaultPaymentTermDays)
            .HasDefaultValue(0);

        builder.Property(e => e.DefaultVatRate)
            .HasPrecision(5, 2)
            .HasDefaultValue(20);

        builder.Property(e => e.VatExemptionCode)
            .HasMaxLength(10);

        builder.Property(e => e.VatExemptionReason)
            .HasMaxLength(500);

        // Shipping Address
        builder.Property(e => e.ShippingAddressLine)
            .HasMaxLength(500);

        builder.Property(e => e.ShippingDistrict)
            .HasMaxLength(100);

        builder.Property(e => e.ShippingCity)
            .HasMaxLength(100);

        builder.Property(e => e.ShippingPostalCode)
            .HasMaxLength(20);

        builder.Property(e => e.ShippingCountry)
            .HasMaxLength(100);

        builder.Property(e => e.ShippingSameAsBilling)
            .IsRequired()
            .HasDefaultValue(true);

        // Status
        builder.Property(e => e.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(e => e.Notes)
            .HasMaxLength(2000);

        builder.Property(e => e.DataSource)
            .IsRequired()
            .HasConversion<int>()
            .HasDefaultValue(Domain.Enums.CustomerDataSource.Sales);

        // Audit
        builder.Property(e => e.CreatedAt)
            .IsRequired();

        builder.Property(e => e.CreatedBy)
            .HasMaxLength(100);

        builder.Property(e => e.UpdatedBy)
            .HasMaxLength(100);

        // Ignore computed properties
        builder.Ignore(e => e.DisplayName);
        builder.Ignore(e => e.FullAddress);
    }
}
