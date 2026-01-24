using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Sales.Domain.Entities;

namespace Stocker.Modules.Sales.Infrastructure.Persistence.Configurations;

public class InvoiceConfiguration : IEntityTypeConfiguration<Invoice>
{
    public void Configure(EntityTypeBuilder<Invoice> builder)
    {
        builder.ToTable("Invoices", "sales");

        builder.HasKey(i => i.Id);

        builder.Property(i => i.Id)
            .ValueGeneratedNever();

        builder.Property(i => i.TenantId)
            .IsRequired();

        builder.Property(i => i.InvoiceNumber)
            .IsRequired()
            .HasMaxLength(50);

        // Kaynak belge ilişkileri
        builder.Property(i => i.SalesOrderNumber)
            .HasMaxLength(50);

        builder.Property(i => i.ShipmentNumber)
            .HasMaxLength(50);

        builder.Property(i => i.DeliveryNoteNumber)
            .HasMaxLength(50);

        // Müşteri bilgileri
        builder.Property(i => i.CustomerName)
            .HasMaxLength(200);

        builder.Property(i => i.CustomerEmail)
            .HasMaxLength(255);

        builder.Property(i => i.CustomerPhone)
            .HasMaxLength(50);

        builder.Property(i => i.CustomerTaxNumber)
            .HasMaxLength(50);

        builder.Property(i => i.CustomerTaxOffice)
            .HasMaxLength(100);

        builder.Property(i => i.CustomerAddress)
            .HasMaxLength(500);

        // Tutarlar
        builder.Property(i => i.SubTotal)
            .HasPrecision(18, 2);

        builder.Property(i => i.DiscountAmount)
            .HasPrecision(18, 2);

        builder.Property(i => i.DiscountRate)
            .HasPrecision(5, 2);

        builder.Property(i => i.VatAmount)
            .HasPrecision(18, 2);

        builder.Property(i => i.TotalAmount)
            .HasPrecision(18, 2);

        builder.Property(i => i.PaidAmount)
            .HasPrecision(18, 2);

        builder.Property(i => i.RemainingAmount)
            .HasPrecision(18, 2);

        builder.Property(i => i.Currency)
            .IsRequired()
            .HasMaxLength(3);

        builder.Property(i => i.ExchangeRate)
            .HasPrecision(18, 6);

        builder.Property(i => i.Status)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(i => i.Type)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(i => i.Notes)
            .HasMaxLength(2000);

        // E-Fatura
        builder.Property(i => i.EInvoiceId)
            .HasMaxLength(100);

        builder.Property(i => i.EInvoiceDate);

        builder.Property(i => i.EInvoiceStatus)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(i => i.EInvoiceErrorMessage)
            .HasMaxLength(500);

        builder.Property(i => i.GibUuid)
            .HasMaxLength(36);

        // E-Arşiv
        builder.Property(i => i.IsEArchive);

        builder.Property(i => i.EArchiveNumber)
            .HasMaxLength(100);

        builder.Property(i => i.EArchiveDate);

        builder.Property(i => i.EArchiveStatus)
            .HasConversion<string>()
            .HasMaxLength(20);

        // Tevkifat
        builder.Property(i => i.HasWithholdingTax);

        builder.Property(i => i.WithholdingTaxRate)
            .HasPrecision(5, 2);

        builder.Property(i => i.WithholdingTaxAmount)
            .HasPrecision(18, 2);

        builder.Property(i => i.WithholdingTaxCode)
            .HasMaxLength(10);

        // Fatura Numaralama (VUK Uyumlu)
        builder.Property(i => i.InvoiceSeries)
            .HasMaxLength(5);

        builder.Property(i => i.SequenceNumber);

        builder.Property(i => i.InvoiceYear);

        // Müşteri Vergi Bilgileri (Türk Mevzuatı)
        builder.Property(i => i.CustomerTaxIdType)
            .HasConversion<string>()
            .HasMaxLength(10);

        builder.Property(i => i.CustomerTaxOfficeCode)
            .HasMaxLength(10);

        // BillingAddressSnapshot - Owned Entity olarak yapılandır
        builder.OwnsOne(i => i.BillingAddressSnapshot, address =>
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
        builder.HasMany(i => i.Items)
            .WithOne(item => item.Invoice)
            .HasForeignKey(item => item.InvoiceId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(i => i.SalesOrder)
            .WithMany()
            .HasForeignKey(i => i.SalesOrderId)
            .OnDelete(DeleteBehavior.SetNull);

        // Indexes
        builder.HasIndex(i => i.TenantId);
        builder.HasIndex(i => new { i.TenantId, i.InvoiceNumber }).IsUnique();
        builder.HasIndex(i => new { i.TenantId, i.CustomerId });
        builder.HasIndex(i => new { i.TenantId, i.Status });
        builder.HasIndex(i => new { i.TenantId, i.InvoiceDate });
        builder.HasIndex(i => new { i.TenantId, i.DueDate });
        builder.HasIndex(i => new { i.TenantId, i.SalesOrderId });
        builder.HasIndex(i => new { i.TenantId, i.ShipmentId });
        builder.HasIndex(i => new { i.TenantId, i.DeliveryNoteId });
        builder.HasIndex(i => new { i.TenantId, i.QuotationId });
        builder.HasIndex(i => new { i.TenantId, i.EInvoiceId });
        builder.HasIndex(i => new { i.TenantId, i.GibUuid });
        builder.HasIndex(i => new { i.TenantId, i.EArchiveNumber });
        builder.HasIndex(i => new { i.TenantId, i.InvoiceSeries, i.InvoiceYear, i.SequenceNumber });
    }
}
