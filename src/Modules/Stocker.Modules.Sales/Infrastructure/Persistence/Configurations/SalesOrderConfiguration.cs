using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Sales.Domain.Entities;

namespace Stocker.Modules.Sales.Infrastructure.Persistence.Configurations;

public class SalesOrderConfiguration : IEntityTypeConfiguration<SalesOrder>
{
    public void Configure(EntityTypeBuilder<SalesOrder> builder)
    {
        builder.ToTable("SalesOrders", "sales");

        builder.HasKey(o => o.Id);

        builder.Property(o => o.Id)
            .ValueGeneratedNever();

        builder.Property(o => o.TenantId)
            .IsRequired();

        builder.Property(o => o.OrderNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(o => o.CustomerName)
            .HasMaxLength(200);

        builder.Property(o => o.CustomerEmail)
            .HasMaxLength(255);

        builder.Property(o => o.CustomerOrderNumber)
            .HasMaxLength(100);

        builder.Property(o => o.SubTotal)
            .HasPrecision(18, 2);

        builder.Property(o => o.DiscountAmount)
            .HasPrecision(18, 2);

        builder.Property(o => o.DiscountRate)
            .HasPrecision(5, 2);

        builder.Property(o => o.VatAmount)
            .HasPrecision(18, 2);

        builder.Property(o => o.TotalAmount)
            .HasPrecision(18, 2);

        builder.Property(o => o.Currency)
            .IsRequired()
            .HasMaxLength(3);

        builder.Property(o => o.ExchangeRate)
            .HasPrecision(18, 6);

        builder.Property(o => o.Status)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(o => o.ShippingAddress)
            .HasMaxLength(500);

        builder.Property(o => o.BillingAddress)
            .HasMaxLength(500);

        builder.Property(o => o.Notes)
            .HasMaxLength(2000);

        builder.Property(o => o.SalesPersonName)
            .HasMaxLength(200);

        builder.Property(o => o.CancellationReason)
            .HasMaxLength(500);

        // Concurrency Token - Optimistic Locking (PostgreSQL xmin system column)
        builder.Property(o => o.RowVersion)
            .HasColumnName("xmin")
            .HasColumnType("xid")
            .ValueGeneratedOnAddOrUpdate()
            .IsConcurrencyToken();

        // Yeni alanlar - Kaynak belge ilişkileri
        builder.Property(o => o.QuotationNumber)
            .HasMaxLength(50);

        builder.Property(o => o.InvoicingStatus)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(o => o.FulfillmentStatus)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(o => o.TotalInvoicedAmount)
            .HasPrecision(18, 2);

        // Phase 3: Stock Reservation
        builder.Property(o => o.TotalReservedQuantity)
            .HasPrecision(18, 4);

        builder.Property(o => o.IsStockReserved)
            .HasDefaultValue(false);

        // Phase 3: Payment Integration
        builder.Property(o => o.TotalAdvancePaymentAmount)
            .HasPrecision(18, 2);

        builder.Property(o => o.TotalPaymentAmount)
            .HasPrecision(18, 2);

        builder.Property(o => o.PaymentStatus)
            .HasConversion<string>()
            .HasMaxLength(20);

        // Phase 3: BackOrder Integration
        builder.Property(o => o.UnresolvedBackOrderCount)
            .HasDefaultValue(0);

        // Phase 3: Territory
        builder.Property(o => o.TerritoryName)
            .HasMaxLength(200);

        // ShippingAddressSnapshot - Owned Entity olarak yapılandır
        builder.OwnsOne(o => o.ShippingAddressSnapshot, address =>
        {
            address.Property(a => a.RecipientName).HasColumnName("Shipping_RecipientName").HasMaxLength(200);
            address.Property(a => a.RecipientPhone).HasColumnName("Shipping_RecipientPhone").HasMaxLength(50);
            address.Property(a => a.CompanyName).HasColumnName("Shipping_CompanyName").HasMaxLength(200);
            address.Property(a => a.AddressLine1).HasColumnName("Shipping_AddressLine1").HasMaxLength(300);
            address.Property(a => a.AddressLine2).HasColumnName("Shipping_AddressLine2").HasMaxLength(200);
            address.Property(a => a.District).HasColumnName("Shipping_District").HasMaxLength(100);
            address.Property(a => a.Town).HasColumnName("Shipping_Town").HasMaxLength(100);
            address.Property(a => a.City).HasColumnName("Shipping_City").HasMaxLength(100);
            address.Property(a => a.State).HasColumnName("Shipping_State").HasMaxLength(100);
            address.Property(a => a.Country).HasColumnName("Shipping_Country").HasMaxLength(100);
            address.Property(a => a.PostalCode).HasColumnName("Shipping_PostalCode").HasMaxLength(20);
            address.Property(a => a.TaxId).HasColumnName("Shipping_TaxId").HasMaxLength(20);
            address.Property(a => a.TaxOffice).HasColumnName("Shipping_TaxOffice").HasMaxLength(100);
        });

        // BillingAddressSnapshot - Owned Entity olarak yapılandır
        builder.OwnsOne(o => o.BillingAddressSnapshot, address =>
        {
            address.Property(a => a.RecipientName).HasColumnName("Billing_RecipientName").HasMaxLength(200);
            address.Property(a => a.RecipientPhone).HasColumnName("Billing_RecipientPhone").HasMaxLength(50);
            address.Property(a => a.CompanyName).HasColumnName("Billing_CompanyName").HasMaxLength(200);
            address.Property(a => a.AddressLine1).HasColumnName("Billing_AddressLine1").HasMaxLength(300);
            address.Property(a => a.AddressLine2).HasColumnName("Billing_AddressLine2").HasMaxLength(200);
            address.Property(a => a.District).HasColumnName("Billing_District").HasMaxLength(100);
            address.Property(a => a.Town).HasColumnName("Billing_Town").HasMaxLength(100);
            address.Property(a => a.City).HasColumnName("Billing_City").HasMaxLength(100);
            address.Property(a => a.State).HasColumnName("Billing_State").HasMaxLength(100);
            address.Property(a => a.Country).HasColumnName("Billing_Country").HasMaxLength(100);
            address.Property(a => a.PostalCode).HasColumnName("Billing_PostalCode").HasMaxLength(20);
            address.Property(a => a.TaxId).HasColumnName("Billing_TaxId").HasMaxLength(20);
            address.Property(a => a.TaxOffice).HasColumnName("Billing_TaxOffice").HasMaxLength(100);
        });

        // Relationships
        builder.HasMany(o => o.Items)
            .WithOne(i => i.SalesOrder)
            .HasForeignKey(i => i.SalesOrderId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(o => o.TenantId);
        builder.HasIndex(o => new { o.TenantId, o.OrderNumber }).IsUnique();
        builder.HasIndex(o => new { o.TenantId, o.CustomerId });
        builder.HasIndex(o => new { o.TenantId, o.Status });
        builder.HasIndex(o => new { o.TenantId, o.OrderDate });
        builder.HasIndex(o => new { o.TenantId, o.SalesPersonId });
        builder.HasIndex(o => new { o.TenantId, o.QuotationId });
        builder.HasIndex(o => new { o.TenantId, o.InvoicingStatus });
        builder.HasIndex(o => new { o.TenantId, o.FulfillmentStatus });

        // Phase 3 Indexes
        builder.HasIndex(o => new { o.TenantId, o.TerritoryId });
        builder.HasIndex(o => new { o.TenantId, o.PaymentStatus });
        builder.HasIndex(o => o.PaymentDueDate);
        builder.HasIndex(o => new { o.TenantId, o.IsStockReserved });

        // Soft Delete Configuration
        builder.Property(o => o.IsDeleted)
            .HasDefaultValue(false)
            .IsRequired();

        builder.Property(o => o.DeletedAt);

        builder.Property(o => o.DeletedBy)
            .HasMaxLength(255);

        // Soft delete index for efficient filtering
        builder.HasIndex(o => new { o.TenantId, o.IsDeleted });
    }
}
