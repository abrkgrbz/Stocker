using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Modules.Finance.Domain.Entities;

namespace Stocker.Modules.Finance.Infrastructure.Persistence.Configurations;

/// <summary>
/// Entity configuration for Expense
/// </summary>
public class ExpenseConfiguration : IEntityTypeConfiguration<Expense>
{
    public void Configure(EntityTypeBuilder<Expense> builder)
    {
        builder.ToTable("Expenses", "finance");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.TenantId)
            .IsRequired();

        builder.Property(e => e.ExpenseNumber)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(e => e.Currency)
            .IsRequired()
            .HasMaxLength(3)
            .HasDefaultValue("TRY");

        builder.Property(e => e.ExchangeRate)
            .HasPrecision(18, 6);

        builder.Property(e => e.Description)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(e => e.DetailedDescription)
            .HasMaxLength(2000);

        // Money value objects
        builder.OwnsOne(e => e.GrossAmount, ConfigureMoney("GrossAmount"));
        builder.OwnsOne(e => e.VatAmount, ConfigureMoney("VatAmount"));
        builder.OwnsOne(e => e.WithholdingAmount, ConfigureMoney("WithholdingAmount"));
        builder.OwnsOne(e => e.NetAmount, ConfigureMoney("NetAmount"));
        builder.OwnsOne(e => e.AmountTRY, ConfigureMoney("AmountTRY"));
        builder.OwnsOne(e => e.NonDeductibleVat, ConfigureMoney("NonDeductibleVat"));
        builder.OwnsOne(e => e.VatWithholdingAmount, ConfigureMoney("VatWithholdingAmount"));

        builder.Property(e => e.WithholdingRate)
            .HasPrecision(5, 2);

        // Supplier fields
        builder.Property(e => e.SupplierName)
            .HasMaxLength(200);

        builder.Property(e => e.SupplierTaxNumber)
            .HasMaxLength(11);

        // Document fields
        builder.Property(e => e.DocumentNumber)
            .HasMaxLength(50);

        builder.Property(e => e.InvoiceNumber)
            .HasMaxLength(16);

        builder.Property(e => e.AttachmentPath)
            .HasMaxLength(500);

        // Accounting fields
        builder.Property(e => e.ExpenseAccountCode)
            .HasMaxLength(20);

        // Approval fields
        builder.Property(e => e.ApprovalNote)
            .HasMaxLength(500);

        // Other fields
        builder.Property(e => e.Notes)
            .HasMaxLength(2000);

        builder.Property(e => e.Tags)
            .HasMaxLength(500);

        // Relationships
        builder.HasOne(e => e.CurrentAccount)
            .WithMany()
            .HasForeignKey(e => e.CurrentAccountId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(e => e.Invoice)
            .WithMany()
            .HasForeignKey(e => e.InvoiceId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(e => e.Payment)
            .WithMany()
            .HasForeignKey(e => e.PaymentId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(e => e.BankAccount)
            .WithMany()
            .HasForeignKey(e => e.BankAccountId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(e => e.CashAccount)
            .WithMany()
            .HasForeignKey(e => e.CashAccountId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(e => e.ExpenseAccount)
            .WithMany()
            .HasForeignKey(e => e.ExpenseAccountId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(e => e.JournalEntry)
            .WithMany()
            .HasForeignKey(e => e.JournalEntryId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(e => e.CostCenter)
            .WithMany()
            .HasForeignKey(e => e.CostCenterId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(e => e.ParentRecurringExpense)
            .WithMany(e => e.RecurringInstances)
            .HasForeignKey(e => e.ParentRecurringExpenseId)
            .OnDelete(DeleteBehavior.SetNull);

        // Indexes
        builder.HasIndex(e => e.TenantId);
        builder.HasIndex(e => new { e.TenantId, e.ExpenseNumber }).IsUnique();
        builder.HasIndex(e => new { e.TenantId, e.ExpenseDate });
        builder.HasIndex(e => new { e.TenantId, e.Status });
        builder.HasIndex(e => new { e.TenantId, e.Category });
        builder.HasIndex(e => new { e.TenantId, e.CurrentAccountId });
        builder.HasIndex(e => e.CostCenterId);
        builder.HasIndex(e => e.ProjectId);
        builder.HasIndex(e => e.IsPaid);
        builder.HasIndex(e => e.ApprovalStatus);
    }

    private static Action<OwnedNavigationBuilder<Expense, Money>> ConfigureMoney(string columnPrefix)
    {
        return money =>
        {
            money.Property(m => m.Amount).HasColumnName(columnPrefix).HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName($"{columnPrefix}Currency").HasMaxLength(3);
        };
    }
}
