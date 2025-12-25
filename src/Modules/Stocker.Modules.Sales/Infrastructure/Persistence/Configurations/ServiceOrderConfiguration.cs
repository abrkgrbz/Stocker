using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Sales.Domain.Entities;

namespace Stocker.Modules.Sales.Infrastructure.Persistence.Configurations;

public class ServiceOrderConfiguration : IEntityTypeConfiguration<ServiceOrder>
{
    public void Configure(EntityTypeBuilder<ServiceOrder> builder)
    {
        builder.ToTable("ServiceOrders", "sales");

        builder.HasKey(s => s.Id);

        builder.Property(s => s.ServiceOrderNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(s => s.Type)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(s => s.Priority)
            .HasConversion<string>()
            .HasMaxLength(20);

        // Customer
        builder.Property(s => s.CustomerName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(s => s.CustomerEmail)
            .HasMaxLength(200);

        builder.Property(s => s.CustomerPhone)
            .HasMaxLength(50);

        builder.Property(s => s.CustomerAddress)
            .HasMaxLength(500);

        // Product
        builder.Property(s => s.ProductCode)
            .HasMaxLength(50);

        builder.Property(s => s.ProductName)
            .HasMaxLength(200);

        builder.Property(s => s.SerialNumber)
            .HasMaxLength(100);

        builder.Property(s => s.AssetTag)
            .HasMaxLength(100);

        // Source Documents
        builder.Property(s => s.SalesOrderNumber)
            .HasMaxLength(50);

        builder.Property(s => s.InvoiceNumber)
            .HasMaxLength(50);

        builder.Property(s => s.WarrantyNumber)
            .HasMaxLength(50);

        // Issue
        builder.Property(s => s.ReportedIssue)
            .HasMaxLength(2000);

        builder.Property(s => s.DiagnosisNotes)
            .HasMaxLength(2000);

        builder.Property(s => s.RepairNotes)
            .HasMaxLength(2000);

        builder.Property(s => s.IssueCategory)
            .HasConversion<string>()
            .HasMaxLength(20);

        // Scheduling
        builder.Property(s => s.Location)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(s => s.ServiceAddress)
            .HasMaxLength(500);

        // Technician
        builder.Property(s => s.TechnicianName)
            .HasMaxLength(200);

        builder.Property(s => s.AssignedTeamName)
            .HasMaxLength(200);

        // Status
        builder.Property(s => s.Status)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(s => s.CancellationReason)
            .HasMaxLength(500);

        // Billing
        builder.Property(s => s.LaborCost)
            .HasPrecision(18, 2);

        builder.Property(s => s.PartsCost)
            .HasPrecision(18, 2);

        builder.Property(s => s.TravelCost)
            .HasPrecision(18, 2);

        builder.Property(s => s.OtherCost)
            .HasPrecision(18, 2);

        builder.Property(s => s.DiscountAmount)
            .HasPrecision(18, 2);

        builder.Property(s => s.TaxAmount)
            .HasPrecision(18, 2);

        builder.Property(s => s.Currency)
            .HasMaxLength(3)
            .HasDefaultValue("TRY");

        // Service Invoice
        builder.Property(s => s.ServiceInvoiceNumber)
            .HasMaxLength(50);

        // Feedback
        builder.Property(s => s.CustomerFeedback)
            .HasMaxLength(2000);

        // Audit
        builder.Property(s => s.CreatedByName)
            .HasMaxLength(200);

        // Navigation
        builder.HasMany(s => s.Items)
            .WithOne()
            .HasForeignKey(i => i.ServiceOrderId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(s => s.Notes)
            .WithOne()
            .HasForeignKey(n => n.ServiceOrderId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(s => s.TenantId);
        builder.HasIndex(s => s.ServiceOrderNumber);
        builder.HasIndex(s => new { s.TenantId, s.ServiceOrderNumber }).IsUnique();
        builder.HasIndex(s => s.CustomerId);
        builder.HasIndex(s => s.ProductId);
        builder.HasIndex(s => s.SerialNumber);
        builder.HasIndex(s => s.SalesOrderId);
        builder.HasIndex(s => s.WarrantyId);
        builder.HasIndex(s => s.TechnicianId);
        builder.HasIndex(s => s.Status);
        builder.HasIndex(s => s.Priority);
        builder.HasIndex(s => s.ScheduledDate);
        builder.HasIndex(s => new { s.TenantId, s.Status });
        builder.HasIndex(s => new { s.TenantId, s.TechnicianId, s.Status });
    }
}

public class ServiceOrderItemConfiguration : IEntityTypeConfiguration<ServiceOrderItem>
{
    public void Configure(EntityTypeBuilder<ServiceOrderItem> builder)
    {
        builder.ToTable("ServiceOrderItems", "sales");

        builder.HasKey(i => i.Id);

        builder.Property(i => i.ItemType)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(i => i.Code)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(i => i.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(i => i.Description)
            .HasMaxLength(500);

        builder.Property(i => i.Unit)
            .HasMaxLength(20)
            .HasDefaultValue("Adet");

        // Quantities & Pricing
        builder.Property(i => i.Quantity)
            .HasPrecision(18, 4);

        builder.Property(i => i.UnitPrice)
            .HasPrecision(18, 4);

        builder.Property(i => i.DiscountRate)
            .HasPrecision(5, 2);

        // Labor
        builder.Property(i => i.HoursWorked)
            .HasPrecision(18, 2);

        builder.Property(i => i.HourlyRate)
            .HasPrecision(18, 2);

        // Indexes
        builder.HasIndex(i => i.TenantId);
        builder.HasIndex(i => i.ServiceOrderId);
        builder.HasIndex(i => i.ProductId);
        builder.HasIndex(i => i.ItemType);
    }
}

public class ServiceOrderNoteConfiguration : IEntityTypeConfiguration<ServiceOrderNote>
{
    public void Configure(EntityTypeBuilder<ServiceOrderNote> builder)
    {
        builder.ToTable("ServiceOrderNotes", "sales");

        builder.HasKey(n => n.Id);

        builder.Property(n => n.Type)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(n => n.Content)
            .IsRequired()
            .HasMaxLength(4000);

        builder.Property(n => n.CreatedByName)
            .HasMaxLength(200);

        // Indexes
        builder.HasIndex(n => n.TenantId);
        builder.HasIndex(n => n.ServiceOrderId);
        builder.HasIndex(n => n.Type);
        builder.HasIndex(n => n.CreatedAt);
    }
}
