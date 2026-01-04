using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Finance.Domain.Entities;

namespace Stocker.Modules.Finance.Infrastructure.Persistence.Configurations;

/// <summary>
/// Entity configuration for Budget
/// </summary>
public class BudgetConfiguration : IEntityTypeConfiguration<Budget>
{
    public void Configure(EntityTypeBuilder<Budget> builder)
    {
        builder.ToTable("Budgets", "finance");

        builder.HasKey(b => b.Id);

        builder.Property(b => b.TenantId)
            .IsRequired();

        builder.Property(b => b.Code)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(b => b.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(b => b.Description)
            .HasMaxLength(500);

        builder.Property(b => b.Currency)
            .IsRequired()
            .HasMaxLength(3)
            .HasDefaultValue("TRY");

        // Control Information
        builder.Property(b => b.WarningThreshold)
            .HasPrecision(5, 2);

        builder.Property(b => b.CriticalThreshold)
            .HasPrecision(5, 2);

        builder.Property(b => b.MaxTransferRate)
            .HasPrecision(5, 2);

        // Relationship Information
        builder.Property(b => b.AccountCode)
            .HasMaxLength(50);

        // Responsibility Information
        builder.Property(b => b.OwnerUserName)
            .HasMaxLength(200);

        // Notes
        builder.Property(b => b.Notes)
            .HasMaxLength(2000);

        // Money value objects - owned entities
        builder.OwnsOne(b => b.TotalBudget, money =>
        {
            money.Property(m => m.Amount).HasColumnName("TotalBudget").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("TotalBudgetCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(b => b.UsedAmount, money =>
        {
            money.Property(m => m.Amount).HasColumnName("UsedAmount").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("UsedAmountCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(b => b.RemainingAmount, money =>
        {
            money.Property(m => m.Amount).HasColumnName("RemainingAmount").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("RemainingAmountCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(b => b.CommittedAmount, money =>
        {
            money.Property(m => m.Amount).HasColumnName("CommittedAmount").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("CommittedAmountCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(b => b.AvailableAmount, money =>
        {
            money.Property(m => m.Amount).HasColumnName("AvailableAmount").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("AvailableAmountCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(b => b.RevisedBudget, money =>
        {
            money.Property(m => m.Amount).HasColumnName("RevisedBudget").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("RevisedBudgetCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(b => b.OriginalBudget, money =>
        {
            money.Property(m => m.Amount).HasColumnName("OriginalBudget").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("OriginalBudgetCurrency").HasMaxLength(3);
        });

        // Self-referencing relationship (Hierarchy)
        builder.HasOne(b => b.ParentBudget)
            .WithMany(b => b.ChildBudgets)
            .HasForeignKey(b => b.ParentBudgetId)
            .OnDelete(DeleteBehavior.Restrict);

        // Relationships
        builder.HasOne(b => b.CostCenter)
            .WithMany()
            .HasForeignKey(b => b.CostCenterId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(b => b.Account)
            .WithMany()
            .HasForeignKey(b => b.AccountId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasMany(b => b.Items)
            .WithOne(i => i.Budget)
            .HasForeignKey(i => i.BudgetId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(b => b.TransfersOut)
            .WithOne(t => t.SourceBudget)
            .HasForeignKey(t => t.SourceBudgetId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(b => b.TransfersIn)
            .WithOne(t => t.TargetBudget)
            .HasForeignKey(t => t.TargetBudgetId)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes
        builder.HasIndex(b => b.TenantId);
        builder.HasIndex(b => new { b.TenantId, b.Code }).IsUnique();
        builder.HasIndex(b => new { b.TenantId, b.Name });
        builder.HasIndex(b => new { b.TenantId, b.Type });
        builder.HasIndex(b => new { b.TenantId, b.Category });
        builder.HasIndex(b => new { b.TenantId, b.FiscalYear });
        builder.HasIndex(b => new { b.TenantId, b.Status });
        builder.HasIndex(b => new { b.TenantId, b.IsActive });
        builder.HasIndex(b => new { b.TenantId, b.IsLocked });
        builder.HasIndex(b => new { b.TenantId, b.StartDate, b.EndDate });
        builder.HasIndex(b => b.CostCenterId);
        builder.HasIndex(b => b.DepartmentId);
        builder.HasIndex(b => b.ProjectId);
    }
}

/// <summary>
/// Entity configuration for BudgetItem
/// </summary>
public class BudgetItemConfiguration : IEntityTypeConfiguration<BudgetItem>
{
    public void Configure(EntityTypeBuilder<BudgetItem> builder)
    {
        builder.ToTable("BudgetItems", "finance");

        builder.HasKey(bi => bi.Id);

        builder.Property(bi => bi.TenantId)
            .IsRequired();

        builder.Property(bi => bi.Code)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(bi => bi.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(bi => bi.AccountCode)
            .HasMaxLength(50);

        builder.Property(bi => bi.Currency)
            .IsRequired()
            .HasMaxLength(3)
            .HasDefaultValue("TRY");

        builder.Property(bi => bi.Notes)
            .HasMaxLength(2000);

        // Money value objects - owned entities
        builder.OwnsOne(bi => bi.BudgetAmount, money =>
        {
            money.Property(m => m.Amount).HasColumnName("BudgetAmount").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("BudgetAmountCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(bi => bi.UsedAmount, money =>
        {
            money.Property(m => m.Amount).HasColumnName("UsedAmount").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("UsedAmountCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(bi => bi.RemainingAmount, money =>
        {
            money.Property(m => m.Amount).HasColumnName("RemainingAmount").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("RemainingAmountCurrency").HasMaxLength(3);
        });

        // Relationships
        builder.HasOne(bi => bi.Budget)
            .WithMany(b => b.Items)
            .HasForeignKey(bi => bi.BudgetId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(bi => bi.Account)
            .WithMany()
            .HasForeignKey(bi => bi.AccountId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(bi => bi.CostCenter)
            .WithMany(cc => cc.BudgetItems)
            .HasForeignKey(bi => bi.CostCenterId)
            .OnDelete(DeleteBehavior.SetNull);

        // Indexes
        builder.HasIndex(bi => bi.TenantId);
        builder.HasIndex(bi => bi.BudgetId);
        builder.HasIndex(bi => new { bi.TenantId, bi.BudgetId, bi.Code }).IsUnique();
        builder.HasIndex(bi => new { bi.TenantId, bi.IsActive });
        builder.HasIndex(bi => bi.AccountId);
        builder.HasIndex(bi => bi.CostCenterId);
    }
}

/// <summary>
/// Entity configuration for BudgetTransfer
/// </summary>
public class BudgetTransferConfiguration : IEntityTypeConfiguration<BudgetTransfer>
{
    public void Configure(EntityTypeBuilder<BudgetTransfer> builder)
    {
        builder.ToTable("BudgetTransfers", "finance");

        builder.HasKey(bt => bt.Id);

        builder.Property(bt => bt.TenantId)
            .IsRequired();

        builder.Property(bt => bt.TransferNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(bt => bt.Description)
            .HasMaxLength(500);

        // Money value objects - owned entities
        builder.OwnsOne(bt => bt.Amount, money =>
        {
            money.Property(m => m.Amount).HasColumnName("Amount").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("AmountCurrency").HasMaxLength(3);
        });

        // Relationships
        builder.HasOne(bt => bt.SourceBudget)
            .WithMany(b => b.TransfersOut)
            .HasForeignKey(bt => bt.SourceBudgetId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(bt => bt.TargetBudget)
            .WithMany(b => b.TransfersIn)
            .HasForeignKey(bt => bt.TargetBudgetId)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes
        builder.HasIndex(bt => bt.TenantId);
        builder.HasIndex(bt => new { bt.TenantId, bt.TransferNumber }).IsUnique();
        builder.HasIndex(bt => new { bt.TenantId, bt.Status });
        builder.HasIndex(bt => new { bt.TenantId, bt.TransferDate });
        builder.HasIndex(bt => bt.SourceBudgetId);
        builder.HasIndex(bt => bt.TargetBudgetId);
    }
}
