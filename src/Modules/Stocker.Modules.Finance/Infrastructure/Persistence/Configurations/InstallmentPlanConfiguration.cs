using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Finance.Domain.Entities;

namespace Stocker.Modules.Finance.Infrastructure.Persistence.Configurations;

/// <summary>
/// Entity configuration for InstallmentPlan
/// </summary>
public class InstallmentPlanConfiguration : IEntityTypeConfiguration<InstallmentPlan>
{
    public void Configure(EntityTypeBuilder<InstallmentPlan> builder)
    {
        builder.ToTable("InstallmentPlans", "finance");

        builder.HasKey(ip => ip.Id);

        builder.Property(ip => ip.TenantId)
            .IsRequired();

        builder.Property(ip => ip.PlanNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(ip => ip.CurrentAccountName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(ip => ip.InvoiceNumber)
            .HasMaxLength(50);

        builder.Property(ip => ip.AnnualInterestRate)
            .HasPrecision(8, 4);

        builder.Property(ip => ip.EarlyPaymentDiscountRate)
            .HasPrecision(5, 2);

        builder.Property(ip => ip.LatePaymentInterestRate)
            .HasPrecision(5, 2);

        builder.Property(ip => ip.ContractNumber)
            .HasMaxLength(50);

        builder.Property(ip => ip.CollateralInfo)
            .HasMaxLength(500);

        builder.Property(ip => ip.Notes)
            .HasMaxLength(2000);

        builder.Property(ip => ip.ApprovedBy)
            .HasMaxLength(200);

        // Money value objects - owned entities
        builder.OwnsOne(ip => ip.TotalAmount, money =>
        {
            money.Property(m => m.Amount).HasColumnName("TotalAmount").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("TotalAmountCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(ip => ip.DownPayment, money =>
        {
            money.Property(m => m.Amount).HasColumnName("DownPayment").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("DownPaymentCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(ip => ip.FinancedAmount, money =>
        {
            money.Property(m => m.Amount).HasColumnName("FinancedAmount").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("FinancedAmountCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(ip => ip.TotalInterest, money =>
        {
            money.Property(m => m.Amount).HasColumnName("TotalInterest").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("TotalInterestCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(ip => ip.TotalPayable, money =>
        {
            money.Property(m => m.Amount).HasColumnName("TotalPayable").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("TotalPayableCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(ip => ip.PaidAmount, money =>
        {
            money.Property(m => m.Amount).HasColumnName("PaidAmount").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("PaidAmountCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(ip => ip.RemainingBalance, money =>
        {
            money.Property(m => m.Amount).HasColumnName("RemainingBalance").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("RemainingBalanceCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(ip => ip.InstallmentAmount, money =>
        {
            money.Property(m => m.Amount).HasColumnName("InstallmentAmount").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("InstallmentAmountCurrency").HasMaxLength(3);
        });

        // Relationships
        builder.HasMany(ip => ip.Installments)
            .WithOne(i => i.InstallmentPlan)
            .HasForeignKey(i => i.InstallmentPlanId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(ip => ip.TenantId);
        builder.HasIndex(ip => new { ip.TenantId, ip.PlanNumber }).IsUnique();
        builder.HasIndex(ip => new { ip.TenantId, ip.PlanType });
        builder.HasIndex(ip => new { ip.TenantId, ip.Direction });
        builder.HasIndex(ip => new { ip.TenantId, ip.Status });
        builder.HasIndex(ip => new { ip.TenantId, ip.StartDate });
        builder.HasIndex(ip => new { ip.TenantId, ip.EndDate });
        builder.HasIndex(ip => ip.CurrentAccountId);
        builder.HasIndex(ip => ip.InvoiceId);
    }
}

/// <summary>
/// Entity configuration for Installment
/// </summary>
public class InstallmentConfiguration : IEntityTypeConfiguration<Installment>
{
    public void Configure(EntityTypeBuilder<Installment> builder)
    {
        builder.ToTable("Installments", "finance");

        builder.HasKey(i => i.Id);

        builder.Property(i => i.TenantId)
            .IsRequired();

        builder.Property(i => i.PaymentReference)
            .HasMaxLength(100);

        builder.Property(i => i.Notes)
            .HasMaxLength(2000);

        // Money value objects - owned entities
        builder.OwnsOne(i => i.PrincipalAmount, money =>
        {
            money.Property(m => m.Amount).HasColumnName("PrincipalAmount").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("PrincipalAmountCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(i => i.InterestAmount, money =>
        {
            money.Property(m => m.Amount).HasColumnName("InterestAmount").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("InterestAmountCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(i => i.TotalAmount, money =>
        {
            money.Property(m => m.Amount).HasColumnName("TotalAmount").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("TotalAmountCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(i => i.PaidAmount, money =>
        {
            money.Property(m => m.Amount).HasColumnName("PaidAmount").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("PaidAmountCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(i => i.RemainingAmount, money =>
        {
            money.Property(m => m.Amount).HasColumnName("RemainingAmount").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("RemainingAmountCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(i => i.LateInterest, money =>
        {
            money.Property(m => m.Amount).HasColumnName("LateInterest").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("LateInterestCurrency").HasMaxLength(3);
        });

        // Relationships
        builder.HasOne(i => i.InstallmentPlan)
            .WithMany(ip => ip.Installments)
            .HasForeignKey(i => i.InstallmentPlanId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(i => i.TenantId);
        builder.HasIndex(i => i.InstallmentPlanId);
        builder.HasIndex(i => new { i.TenantId, i.InstallmentPlanId, i.InstallmentNumber }).IsUnique();
        builder.HasIndex(i => new { i.TenantId, i.DueDate });
        builder.HasIndex(i => new { i.TenantId, i.IsPaid });
        builder.HasIndex(i => new { i.TenantId, i.IsPartiallyPaid });
        builder.HasIndex(i => i.PaymentId);
        builder.HasIndex(i => i.BankTransactionId);
    }
}
