using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Finance.Domain.Entities;

namespace Stocker.Modules.Finance.Infrastructure.Persistence.Configurations;

/// <summary>
/// Entity configuration for CostCenter
/// </summary>
public class CostCenterConfiguration : IEntityTypeConfiguration<CostCenter>
{
    public void Configure(EntityTypeBuilder<CostCenter> builder)
    {
        builder.ToTable("CostCenters", "finance");

        builder.HasKey(cc => cc.Id);

        builder.Property(cc => cc.TenantId)
            .IsRequired();

        builder.Property(cc => cc.Code)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(cc => cc.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(cc => cc.Description)
            .HasMaxLength(500);

        // Hierarchy Information
        builder.Property(cc => cc.FullPath)
            .HasMaxLength(500);

        // Responsibility Information
        builder.Property(cc => cc.ResponsibleUserName)
            .HasMaxLength(200);

        // Allocation Information
        builder.Property(cc => cc.AllocationKey)
            .HasMaxLength(100);

        builder.Property(cc => cc.AllocationRate)
            .HasPrecision(5, 2);

        builder.Property(cc => cc.BudgetWarningThreshold)
            .HasPrecision(5, 2);

        // Accounting Integration
        builder.Property(cc => cc.AccountingAccountCode)
            .HasMaxLength(50);

        // Notes
        builder.Property(cc => cc.Notes)
            .HasMaxLength(2000);

        // Money value objects - owned entities
        builder.OwnsOne(cc => cc.AnnualBudget, money =>
        {
            money.Property(m => m.Amount).HasColumnName("AnnualBudget").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("AnnualBudgetCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(cc => cc.MonthlyBudget, money =>
        {
            money.Property(m => m.Amount).HasColumnName("MonthlyBudget").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("MonthlyBudgetCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(cc => cc.SpentAmount, money =>
        {
            money.Property(m => m.Amount).HasColumnName("SpentAmount").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("SpentAmountCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(cc => cc.RemainingBudget, money =>
        {
            money.Property(m => m.Amount).HasColumnName("RemainingBudget").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("RemainingBudgetCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(cc => cc.MonthlyAverageSpending, money =>
        {
            money.Property(m => m.Amount).HasColumnName("MonthlyAverageSpending").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("MonthlyAverageSpendingCurrency").HasMaxLength(3);
        });

        // Self-referencing relationship (Hierarchy)
        builder.HasOne(cc => cc.Parent)
            .WithMany(cc => cc.Children)
            .HasForeignKey(cc => cc.ParentId)
            .OnDelete(DeleteBehavior.Restrict);

        // Relationships
        builder.HasOne(cc => cc.AccountingAccount)
            .WithMany()
            .HasForeignKey(cc => cc.AccountingAccountId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(cc => cc.DefaultExpenseAccount)
            .WithMany()
            .HasForeignKey(cc => cc.DefaultExpenseAccountId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasMany(cc => cc.Expenses)
            .WithOne(e => e.CostCenter)
            .HasForeignKey(e => e.CostCenterId)
            .OnDelete(DeleteBehavior.SetNull);

        // Note: JournalEntries navigation is incorrect in domain model - JournalEntry doesn't have CostCenterId
        // JournalEntryLine has CostCenterId, so ignoring this collection
        builder.Ignore(cc => cc.JournalEntries);

        builder.HasMany(cc => cc.BudgetItems)
            .WithOne(bi => bi.CostCenter)
            .HasForeignKey(bi => bi.CostCenterId)
            .OnDelete(DeleteBehavior.SetNull);

        // Indexes
        builder.HasIndex(cc => cc.TenantId);
        builder.HasIndex(cc => new { cc.TenantId, cc.Code }).IsUnique();
        builder.HasIndex(cc => new { cc.TenantId, cc.Name });
        builder.HasIndex(cc => new { cc.TenantId, cc.Type });
        builder.HasIndex(cc => new { cc.TenantId, cc.Category });
        builder.HasIndex(cc => new { cc.TenantId, cc.ParentId });
        builder.HasIndex(cc => new { cc.TenantId, cc.IsActive });
        builder.HasIndex(cc => new { cc.TenantId, cc.IsDefault });
        builder.HasIndex(cc => new { cc.TenantId, cc.IsFrozen });
        builder.HasIndex(cc => cc.DepartmentId);
        builder.HasIndex(cc => cc.BranchId);
    }
}
