using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Finance.Domain.Entities;

namespace Stocker.Modules.Finance.Infrastructure.Persistence.Configurations;

/// <summary>
/// Entity configuration for Loan
/// </summary>
public class LoanConfiguration : IEntityTypeConfiguration<Loan>
{
    public void Configure(EntityTypeBuilder<Loan> builder)
    {
        builder.ToTable("Loans", "finance");

        builder.HasKey(l => l.Id);

        builder.Property(l => l.TenantId)
            .IsRequired();

        builder.Property(l => l.LoanNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(l => l.ExternalReference)
            .HasMaxLength(100);

        builder.Property(l => l.LenderName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(l => l.AnnualInterestRate)
            .HasPrecision(8, 4);

        builder.Property(l => l.Spread)
            .HasPrecision(8, 4);

        builder.Property(l => l.PrepaymentPenaltyRate)
            .HasPrecision(5, 2);

        builder.Property(l => l.CollateralDescription)
            .HasMaxLength(500);

        builder.Property(l => l.GuarantorInfo)
            .HasMaxLength(500);

        builder.Property(l => l.Purpose)
            .HasMaxLength(500);

        builder.Property(l => l.Notes)
            .HasMaxLength(2000);

        // Money value objects - owned entities
        builder.OwnsOne(l => l.PrincipalAmount, money =>
        {
            money.Property(m => m.Amount).HasColumnName("PrincipalAmount").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("PrincipalAmountCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(l => l.RemainingPrincipal, money =>
        {
            money.Property(m => m.Amount).HasColumnName("RemainingPrincipal").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("RemainingPrincipalCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(l => l.TotalInterest, money =>
        {
            money.Property(m => m.Amount).HasColumnName("TotalInterest").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("TotalInterestCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(l => l.PaidInterest, money =>
        {
            money.Property(m => m.Amount).HasColumnName("PaidInterest").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("PaidInterestCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(l => l.BsmvAmount, money =>
        {
            money.Property(m => m.Amount).HasColumnName("BsmvAmount").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("BsmvAmountCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(l => l.KkdfAmount, money =>
        {
            money.Property(m => m.Amount).HasColumnName("KkdfAmount").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("KkdfAmountCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(l => l.ProcessingFee, money =>
        {
            money.Property(m => m.Amount).HasColumnName("ProcessingFee").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("ProcessingFeeCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(l => l.OtherFees, money =>
        {
            money.Property(m => m.Amount).HasColumnName("OtherFees").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("OtherFeesCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(l => l.CollateralValue, money =>
        {
            money.Property(m => m.Amount).HasColumnName("CollateralValue").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("CollateralValueCurrency").HasMaxLength(3);
        });

        // Relationships
        builder.HasMany(l => l.Payments)
            .WithOne(p => p.Loan)
            .HasForeignKey(p => p.LoanId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(l => l.Schedule)
            .WithOne(s => s.Loan)
            .HasForeignKey(s => s.LoanId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(l => l.TenantId);
        builder.HasIndex(l => new { l.TenantId, l.LoanNumber }).IsUnique();
        builder.HasIndex(l => new { l.TenantId, l.LoanType });
        builder.HasIndex(l => new { l.TenantId, l.SubType });
        builder.HasIndex(l => new { l.TenantId, l.Status });
        builder.HasIndex(l => new { l.TenantId, l.StartDate });
        builder.HasIndex(l => new { l.TenantId, l.EndDate });
        builder.HasIndex(l => l.LenderId);
        builder.HasIndex(l => l.BankAccountId);
    }
}

/// <summary>
/// Entity configuration for LoanSchedule
/// </summary>
public class LoanScheduleConfiguration : IEntityTypeConfiguration<LoanSchedule>
{
    public void Configure(EntityTypeBuilder<LoanSchedule> builder)
    {
        builder.ToTable("LoanSchedules", "finance");

        builder.HasKey(ls => ls.Id);

        builder.Property(ls => ls.TenantId)
            .IsRequired();

        // Money value objects - owned entities
        builder.OwnsOne(ls => ls.PrincipalAmount, money =>
        {
            money.Property(m => m.Amount).HasColumnName("PrincipalAmount").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("PrincipalAmountCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(ls => ls.InterestAmount, money =>
        {
            money.Property(m => m.Amount).HasColumnName("InterestAmount").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("InterestAmountCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(ls => ls.TotalAmount, money =>
        {
            money.Property(m => m.Amount).HasColumnName("TotalAmount").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("TotalAmountCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(ls => ls.RemainingBalance, money =>
        {
            money.Property(m => m.Amount).HasColumnName("RemainingBalance").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("RemainingBalanceCurrency").HasMaxLength(3);
        });

        // Relationships
        builder.HasOne(ls => ls.Loan)
            .WithMany(l => l.Schedule)
            .HasForeignKey(ls => ls.LoanId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(ls => ls.TenantId);
        builder.HasIndex(ls => ls.LoanId);
        builder.HasIndex(ls => new { ls.TenantId, ls.LoanId, ls.InstallmentNumber }).IsUnique();
        builder.HasIndex(ls => new { ls.TenantId, ls.DueDate });
        builder.HasIndex(ls => new { ls.TenantId, ls.IsPaid });
    }
}

/// <summary>
/// Entity configuration for LoanPayment
/// </summary>
public class LoanPaymentConfiguration : IEntityTypeConfiguration<LoanPayment>
{
    public void Configure(EntityTypeBuilder<LoanPayment> builder)
    {
        builder.ToTable("LoanPayments", "finance");

        builder.HasKey(lp => lp.Id);

        builder.Property(lp => lp.TenantId)
            .IsRequired();

        builder.Property(lp => lp.Reference)
            .HasMaxLength(100);

        builder.Property(lp => lp.Notes)
            .HasMaxLength(2000);

        // Money value objects - owned entities
        builder.OwnsOne(lp => lp.PrincipalPaid, money =>
        {
            money.Property(m => m.Amount).HasColumnName("PrincipalPaid").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("PrincipalPaidCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(lp => lp.InterestPaid, money =>
        {
            money.Property(m => m.Amount).HasColumnName("InterestPaid").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("InterestPaidCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(lp => lp.PenaltyPaid, money =>
        {
            money.Property(m => m.Amount).HasColumnName("PenaltyPaid").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("PenaltyPaidCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(lp => lp.TotalPaid, money =>
        {
            money.Property(m => m.Amount).HasColumnName("TotalPaid").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("TotalPaidCurrency").HasMaxLength(3);
        });

        // Relationships
        builder.HasOne(lp => lp.Loan)
            .WithMany(l => l.Payments)
            .HasForeignKey(lp => lp.LoanId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(lp => lp.TenantId);
        builder.HasIndex(lp => lp.LoanId);
        builder.HasIndex(lp => new { lp.TenantId, lp.PaymentDate });
        builder.HasIndex(lp => new { lp.TenantId, lp.PaymentType });
        builder.HasIndex(lp => lp.BankTransactionId);
    }
}
