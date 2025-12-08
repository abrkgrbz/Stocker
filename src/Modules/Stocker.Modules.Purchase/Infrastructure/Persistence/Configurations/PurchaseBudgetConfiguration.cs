using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Purchase.Domain.Entities;

namespace Stocker.Modules.Purchase.Infrastructure.Persistence.Configurations;

public class PurchaseBudgetConfiguration : IEntityTypeConfiguration<PurchaseBudget>
{
    public void Configure(EntityTypeBuilder<PurchaseBudget> builder)
    {
        builder.ToTable("PurchaseBudgets");

        builder.HasKey(b => b.Id);

        builder.Property(b => b.Code)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(b => b.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(b => b.Description)
            .HasMaxLength(1000);

        builder.Property(b => b.Status)
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(b => b.PeriodType)
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(b => b.DepartmentName)
            .HasMaxLength(200);

        builder.Property(b => b.CostCenterCode)
            .HasMaxLength(50);

        builder.Property(b => b.CostCenterName)
            .HasMaxLength(200);

        builder.Property(b => b.CategoryName)
            .HasMaxLength(200);

        builder.Property(b => b.AllocatedAmount)
            .HasPrecision(18, 4);

        builder.Property(b => b.CommittedAmount)
            .HasPrecision(18, 4);

        builder.Property(b => b.SpentAmount)
            .HasPrecision(18, 4);

        builder.Property(b => b.RemainingAmount)
            .HasPrecision(18, 4);

        builder.Property(b => b.AvailableAmount)
            .HasPrecision(18, 4);

        builder.Property(b => b.Currency)
            .HasMaxLength(10);

        builder.Property(b => b.WarningThreshold)
            .HasPrecision(5, 2);

        builder.Property(b => b.CriticalThreshold)
            .HasPrecision(5, 2);

        builder.Property(b => b.ParentBudgetCode)
            .HasMaxLength(50);

        builder.Property(b => b.Notes)
            .HasMaxLength(2000);

        builder.Property(b => b.InternalNotes)
            .HasMaxLength(2000);

        builder.Property(b => b.CreatedByName)
            .HasMaxLength(200);

        builder.Property(b => b.ApprovedByName)
            .HasMaxLength(200);

        builder.HasMany(b => b.Revisions)
            .WithOne()
            .HasForeignKey(r => r.BudgetId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(b => b.Transactions)
            .WithOne()
            .HasForeignKey(t => t.BudgetId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(b => new { b.TenantId, b.Code }).IsUnique();
        builder.HasIndex(b => new { b.TenantId, b.Status });
        builder.HasIndex(b => new { b.TenantId, b.Year });
        builder.HasIndex(b => new { b.TenantId, b.DepartmentId });
        builder.HasIndex(b => new { b.TenantId, b.CategoryId });
        builder.HasIndex(b => new { b.TenantId, b.ParentBudgetId });
    }
}

public class PurchaseBudgetRevisionConfiguration : IEntityTypeConfiguration<PurchaseBudgetRevision>
{
    public void Configure(EntityTypeBuilder<PurchaseBudgetRevision> builder)
    {
        builder.ToTable("PurchaseBudgetRevisions");

        builder.HasKey(r => r.Id);

        builder.Property(r => r.PreviousAmount)
            .HasPrecision(18, 4);

        builder.Property(r => r.NewAmount)
            .HasPrecision(18, 4);

        builder.Property(r => r.ChangeAmount)
            .HasPrecision(18, 4);

        builder.Property(r => r.Reason)
            .IsRequired()
            .HasMaxLength(1000);

        builder.Property(r => r.RevisedByName)
            .IsRequired()
            .HasMaxLength(200);

        builder.HasIndex(r => new { r.TenantId, r.BudgetId });
        builder.HasIndex(r => new { r.TenantId, r.RevisedAt });
    }
}

public class PurchaseBudgetTransactionConfiguration : IEntityTypeConfiguration<PurchaseBudgetTransaction>
{
    public void Configure(EntityTypeBuilder<PurchaseBudgetTransaction> builder)
    {
        builder.ToTable("PurchaseBudgetTransactions");

        builder.HasKey(t => t.Id);

        builder.Property(t => t.Type)
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(t => t.Amount)
            .HasPrecision(18, 4);

        builder.Property(t => t.Reference)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(t => t.Description)
            .HasMaxLength(500);

        builder.HasIndex(t => new { t.TenantId, t.BudgetId });
        builder.HasIndex(t => new { t.TenantId, t.ReferenceId });
        builder.HasIndex(t => new { t.TenantId, t.TransactionDate });
    }
}
