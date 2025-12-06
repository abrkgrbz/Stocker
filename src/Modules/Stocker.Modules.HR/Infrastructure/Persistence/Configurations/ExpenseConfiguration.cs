using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.HR.Domain.Entities;

namespace Stocker.Modules.HR.Infrastructure.Persistence.Configurations;

/// <summary>
/// Entity configuration for Expense
/// </summary>
public class ExpenseConfiguration : IEntityTypeConfiguration<Expense>
{
    public void Configure(EntityTypeBuilder<Expense> builder)
    {
        builder.ToTable("Expenses", "hr");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.TenantId)
            .IsRequired();

        builder.Property(e => e.ExpenseNumber)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(e => e.ExpenseType)
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(e => e.Description)
            .HasMaxLength(1000)
            .IsRequired();

        builder.Property(e => e.Amount)
            .HasPrecision(18, 2);

        builder.Property(e => e.Currency)
            .HasMaxLength(3)
            .HasDefaultValue("TRY");

        builder.Property(e => e.MerchantName)
            .HasMaxLength(200);

        builder.Property(e => e.ReceiptNumber)
            .HasMaxLength(100);

        builder.Property(e => e.ReceiptUrl)
            .HasMaxLength(500);

        builder.Property(e => e.Status)
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(e => e.ApprovalNotes)
            .HasMaxLength(2000);

        builder.Property(e => e.RejectionReason)
            .HasMaxLength(1000);

        builder.Property(e => e.PaymentReference)
            .HasMaxLength(100);

        builder.Property(e => e.Notes)
            .HasMaxLength(2000);

        // Relationships
        builder.HasOne(e => e.Employee)
            .WithMany(emp => emp.Expenses)
            .HasForeignKey(e => e.EmployeeId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(e => e.ApprovedBy)
            .WithMany()
            .HasForeignKey(e => e.ApprovedById)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.Payroll)
            .WithMany()
            .HasForeignKey(e => e.PayrollId)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes
        builder.HasIndex(e => e.TenantId);
        builder.HasIndex(e => new { e.TenantId, e.ExpenseNumber }).IsUnique();
        builder.HasIndex(e => new { e.TenantId, e.EmployeeId });
        builder.HasIndex(e => new { e.TenantId, e.Status });
        builder.HasIndex(e => new { e.TenantId, e.ExpenseType });
        builder.HasIndex(e => new { e.TenantId, e.ExpenseDate });
    }
}
