using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Sales.Domain.Entities;

namespace Stocker.Modules.Sales.Infrastructure.Persistence.Configurations;

public class WarrantyConfiguration : IEntityTypeConfiguration<Warranty>
{
    public void Configure(EntityTypeBuilder<Warranty> builder)
    {
        builder.ToTable("Warranties", "sales");

        builder.HasKey(w => w.Id);

        builder.Property(w => w.WarrantyNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(w => w.Type)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(w => w.CoverageType)
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(w => w.Status)
            .HasConversion<string>()
            .HasMaxLength(20);

        // Product
        builder.Property(w => w.ProductCode)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(w => w.ProductName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(w => w.SerialNumber)
            .HasMaxLength(100);

        builder.Property(w => w.LotNumber)
            .HasMaxLength(100);

        // Sale Information
        builder.Property(w => w.SalesOrderNumber)
            .HasMaxLength(50);

        builder.Property(w => w.InvoiceNumber)
            .HasMaxLength(50);

        // Customer
        builder.Property(w => w.CustomerName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(w => w.CustomerEmail)
            .HasMaxLength(200);

        builder.Property(w => w.CustomerPhone)
            .HasMaxLength(50);

        builder.Property(w => w.CustomerAddress)
            .HasMaxLength(500);

        // Coverage
        builder.Property(w => w.CoverageDescription)
            .HasMaxLength(2000);

        builder.Property(w => w.VoidReason)
            .HasMaxLength(500);

        // Financial
        builder.Property(w => w.MaxClaimAmount)
            .HasPrecision(18, 2);

        builder.Property(w => w.ExtensionPrice)
            .HasPrecision(18, 2);

        // Registration
        builder.Property(w => w.RegisteredBy)
            .HasMaxLength(200);

        // Metadata
        builder.Property(w => w.Notes)
            .HasMaxLength(2000);

        // Navigation
        builder.HasMany(w => w.Claims)
            .WithOne()
            .HasForeignKey(c => c.WarrantyId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(w => w.TenantId);
        builder.HasIndex(w => w.WarrantyNumber);
        builder.HasIndex(w => new { w.TenantId, w.WarrantyNumber }).IsUnique();
        builder.HasIndex(w => w.ProductId);
        builder.HasIndex(w => w.SerialNumber);
        builder.HasIndex(w => w.CustomerId);
        builder.HasIndex(w => w.SalesOrderId);
        builder.HasIndex(w => w.InvoiceId);
        builder.HasIndex(w => w.Status);
        builder.HasIndex(w => w.EndDate);
        builder.HasIndex(w => new { w.TenantId, w.Status, w.EndDate });
    }
}

public class WarrantyClaimConfiguration : IEntityTypeConfiguration<WarrantyClaim>
{
    public void Configure(EntityTypeBuilder<WarrantyClaim> builder)
    {
        builder.ToTable("WarrantyClaims", "sales");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.ClaimNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(c => c.ClaimType)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(c => c.Status)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(c => c.ResolutionType)
            .HasConversion<string>()
            .HasMaxLength(20);

        // Issue Details
        builder.Property(c => c.IssueDescription)
            .IsRequired()
            .HasMaxLength(2000);

        builder.Property(c => c.FailureCode)
            .HasMaxLength(50);

        builder.Property(c => c.DiagnosticNotes)
            .HasMaxLength(2000);

        // Resolution
        builder.Property(c => c.Resolution)
            .HasMaxLength(2000);

        // Replacement
        builder.Property(c => c.ReplacementSerialNumber)
            .HasMaxLength(100);

        // Service Order
        builder.Property(c => c.ServiceOrderNumber)
            .HasMaxLength(50);

        // Financial
        builder.Property(c => c.ClaimAmount)
            .HasPrecision(18, 2);

        builder.Property(c => c.ApprovedAmount)
            .HasPrecision(18, 2);

        builder.Property(c => c.PaidAmount)
            .HasPrecision(18, 2);

        // Metadata
        builder.Property(c => c.Notes)
            .HasMaxLength(2000);

        // Indexes
        builder.HasIndex(c => c.TenantId);
        builder.HasIndex(c => c.ClaimNumber);
        builder.HasIndex(c => new { c.TenantId, c.ClaimNumber }).IsUnique();
        builder.HasIndex(c => c.WarrantyId);
        builder.HasIndex(c => c.Status);
        builder.HasIndex(c => c.ClaimDate);
        builder.HasIndex(c => new { c.TenantId, c.Status });
    }
}
