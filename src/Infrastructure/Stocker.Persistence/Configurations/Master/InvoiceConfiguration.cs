using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Master.Entities;

namespace Stocker.Persistence.Configurations.Master;

public class InvoiceConfiguration : BaseEntityTypeConfiguration<Invoice>
{
    public override void Configure(EntityTypeBuilder<Invoice> builder)
    {
        base.Configure(builder);

        builder.ToTable("Invoices", "master");

        // Properties
        builder.Property(i => i.TenantId)
            .IsRequired();

        builder.Property(i => i.SubscriptionId)
            .IsRequired();

        builder.Property(i => i.InvoiceNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(i => i.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(i => i.TaxRate)
            .IsRequired()
            .HasPrecision(5, 2);

        builder.Property(i => i.IssueDate)
            .IsRequired();

        builder.Property(i => i.DueDate)
            .IsRequired();

        builder.Property(i => i.Notes)
            .HasMaxLength(1000);

        // Value Objects
        builder.OwnsOne(i => i.Subtotal, money =>
        {
            money.Property(m => m.Amount)
                .IsRequired()
                .HasPrecision(18, 2)
                .HasColumnName("SubtotalAmount");

            money.Property(m => m.Currency)
                .IsRequired()
                .HasMaxLength(3)
                .HasColumnName("SubtotalCurrency");
        });

        builder.OwnsOne(i => i.TaxAmount, money =>
        {
            money.Property(m => m.Amount)
                .IsRequired()
                .HasPrecision(18, 2)
                .HasColumnName("TaxAmount");

            money.Property(m => m.Currency)
                .IsRequired()
                .HasMaxLength(3)
                .HasColumnName("TaxCurrency");
        });

        builder.OwnsOne(i => i.TotalAmount, money =>
        {
            money.Property(m => m.Amount)
                .IsRequired()
                .HasPrecision(18, 2)
                .HasColumnName("TotalAmount");

            money.Property(m => m.Currency)
                .IsRequired()
                .HasMaxLength(3)
                .HasColumnName("TotalCurrency");
        });

        builder.OwnsOne(i => i.PaidAmount, money =>
        {
            money.Property(m => m.Amount)
                .IsRequired()
                .HasPrecision(18, 2)
                .HasColumnName("PaidAmount");

            money.Property(m => m.Currency)
                .IsRequired()
                .HasMaxLength(3)
                .HasColumnName("PaidCurrency");
        });

        builder.OwnsOne(i => i.BillingAddress, address =>
        {
            address.Property(a => a.Street)
                .HasMaxLength(200)
                .HasColumnName("BillingStreet");

            address.Property(a => a.Building)
                .HasMaxLength(100)
                .HasColumnName("BillingBuilding");

            address.Property(a => a.Floor)
                .HasMaxLength(50)
                .HasColumnName("BillingFloor");

            address.Property(a => a.Apartment)
                .HasMaxLength(50)
                .HasColumnName("BillingApartment");

            address.Property(a => a.City)
                .HasMaxLength(100)
                .HasColumnName("BillingCity");

            address.Property(a => a.State)
                .HasMaxLength(100)
                .HasColumnName("BillingState");

            address.Property(a => a.Country)
                .HasMaxLength(100)
                .HasColumnName("BillingCountry");

            address.Property(a => a.PostalCode)
                .HasMaxLength(20)
                .HasColumnName("BillingPostalCode");
        });

        // Relationships
        builder.HasMany(i => i.Items)
            .WithOne()
            .HasForeignKey(item => item.InvoiceId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(i => i.Payments)
            .WithOne()
            .HasForeignKey(p => p.InvoiceId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(i => i.InvoiceNumber)
            .IsUnique()
            .HasDatabaseName("IX_Invoices_InvoiceNumber");

        builder.HasIndex(i => i.TenantId)
            .HasDatabaseName("IX_Invoices_TenantId");

        builder.HasIndex(i => i.Status)
            .HasDatabaseName("IX_Invoices_Status");

        builder.HasIndex(i => new { i.Status, i.DueDate })
            .HasDatabaseName("IX_Invoices_Status_DueDate");
    }
}