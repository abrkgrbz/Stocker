using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Finance.Domain.Entities;

namespace Stocker.Modules.Finance.Infrastructure.Persistence.Configurations;

/// <summary>
/// Entity configuration for TaxDeclaration
/// </summary>
public class TaxDeclarationConfiguration : IEntityTypeConfiguration<TaxDeclaration>
{
    public void Configure(EntityTypeBuilder<TaxDeclaration> builder)
    {
        builder.ToTable("TaxDeclarations", "finance");

        builder.HasKey(td => td.Id);

        builder.Property(td => td.TenantId)
            .IsRequired();

        builder.Property(td => td.DeclarationNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(td => td.TaxOfficeCode)
            .HasMaxLength(20);

        builder.Property(td => td.TaxOfficeName)
            .HasMaxLength(200);

        builder.Property(td => td.AccrualSlipNumber)
            .HasMaxLength(50);

        builder.Property(td => td.GibApprovalNumber)
            .HasMaxLength(50);

        builder.Property(td => td.AmendmentReason)
            .HasMaxLength(500);

        builder.Property(td => td.PreparedBy)
            .HasMaxLength(200);

        builder.Property(td => td.ApprovedBy)
            .HasMaxLength(200);

        builder.Property(td => td.Notes)
            .HasMaxLength(2000);

        // Money value objects - owned entities
        builder.OwnsOne(td => td.TaxBase, money =>
        {
            money.Property(m => m.Amount).HasColumnName("TaxBase").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("TaxBaseCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(td => td.CalculatedTax, money =>
        {
            money.Property(m => m.Amount).HasColumnName("CalculatedTax").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("CalculatedTaxCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(td => td.DeductibleTax, money =>
        {
            money.Property(m => m.Amount).HasColumnName("DeductibleTax").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("DeductibleTaxCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(td => td.CarriedForwardTax, money =>
        {
            money.Property(m => m.Amount).HasColumnName("CarriedForwardTax").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("CarriedForwardTaxCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(td => td.BroughtForwardTax, money =>
        {
            money.Property(m => m.Amount).HasColumnName("BroughtForwardTax").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("BroughtForwardTaxCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(td => td.DeferredTax, money =>
        {
            money.Property(m => m.Amount).HasColumnName("DeferredTax").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("DeferredTaxCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(td => td.NetTax, money =>
        {
            money.Property(m => m.Amount).HasColumnName("NetTax").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("NetTaxCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(td => td.PaidAmount, money =>
        {
            money.Property(m => m.Amount).HasColumnName("PaidAmount").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("PaidAmountCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(td => td.RemainingBalance, money =>
        {
            money.Property(m => m.Amount).HasColumnName("RemainingBalance").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("RemainingBalanceCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(td => td.LateInterest, money =>
        {
            money.Property(m => m.Amount).HasColumnName("LateInterest").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("LateInterestCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(td => td.LatePenalty, money =>
        {
            money.Property(m => m.Amount).HasColumnName("LatePenalty").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("LatePenaltyCurrency").HasMaxLength(3);
        });

        // Self-referencing relationship (Amendments)
        builder.HasOne(td => td.AmendedDeclaration)
            .WithMany(td => td.Amendments)
            .HasForeignKey(td => td.AmendedDeclarationId)
            .OnDelete(DeleteBehavior.Restrict);

        // Relationships
        builder.HasMany(td => td.Details)
            .WithOne(d => d.TaxDeclaration)
            .HasForeignKey(d => d.TaxDeclarationId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(td => td.Payments)
            .WithOne(p => p.TaxDeclaration)
            .HasForeignKey(p => p.TaxDeclarationId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(td => td.TenantId);
        builder.HasIndex(td => new { td.TenantId, td.DeclarationNumber }).IsUnique();
        builder.HasIndex(td => new { td.TenantId, td.DeclarationType });
        builder.HasIndex(td => new { td.TenantId, td.TaxYear });
        builder.HasIndex(td => new { td.TenantId, td.TaxYear, td.TaxMonth });
        builder.HasIndex(td => new { td.TenantId, td.TaxYear, td.TaxQuarter });
        builder.HasIndex(td => new { td.TenantId, td.Status });
        builder.HasIndex(td => new { td.TenantId, td.FilingDeadline });
        builder.HasIndex(td => new { td.TenantId, td.PaymentDeadline });
        builder.HasIndex(td => new { td.TenantId, td.IsAmendment });
        builder.HasIndex(td => td.AccountId);
        builder.HasIndex(td => td.AccountingPeriodId);
    }
}

/// <summary>
/// Entity configuration for TaxDeclarationDetail
/// </summary>
public class TaxDeclarationDetailConfiguration : IEntityTypeConfiguration<TaxDeclarationDetail>
{
    public void Configure(EntityTypeBuilder<TaxDeclarationDetail> builder)
    {
        builder.ToTable("TaxDeclarationDetails", "finance");

        builder.HasKey(d => d.Id);

        builder.Property(d => d.TenantId)
            .IsRequired();

        builder.Property(d => d.Code)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(d => d.Description)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(d => d.Rate)
            .HasPrecision(5, 2);

        // Money value objects - owned entities
        builder.OwnsOne(d => d.Amount, money =>
        {
            money.Property(m => m.Amount).HasColumnName("Amount").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("AmountCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(d => d.TaxAmount, money =>
        {
            money.Property(m => m.Amount).HasColumnName("TaxAmount").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("TaxAmountCurrency").HasMaxLength(3);
        });

        // Relationships
        builder.HasOne(d => d.TaxDeclaration)
            .WithMany(td => td.Details)
            .HasForeignKey(d => d.TaxDeclarationId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(d => d.TenantId);
        builder.HasIndex(d => d.TaxDeclarationId);
        builder.HasIndex(d => new { d.TenantId, d.TaxDeclarationId, d.Code });
    }
}

/// <summary>
/// Entity configuration for TaxDeclarationPayment
/// </summary>
public class TaxDeclarationPaymentConfiguration : IEntityTypeConfiguration<TaxDeclarationPayment>
{
    public void Configure(EntityTypeBuilder<TaxDeclarationPayment> builder)
    {
        builder.ToTable("TaxDeclarationPayments", "finance");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.TenantId)
            .IsRequired();

        builder.Property(p => p.ReceiptNumber)
            .HasMaxLength(50);

        builder.Property(p => p.Notes)
            .HasMaxLength(2000);

        // Money value objects - owned entities
        builder.OwnsOne(p => p.Amount, money =>
        {
            money.Property(m => m.Amount).HasColumnName("Amount").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("AmountCurrency").HasMaxLength(3);
        });

        // Relationships
        builder.HasOne(p => p.TaxDeclaration)
            .WithMany(td => td.Payments)
            .HasForeignKey(p => p.TaxDeclarationId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(p => p.TenantId);
        builder.HasIndex(p => p.TaxDeclarationId);
        builder.HasIndex(p => new { p.TenantId, p.PaymentDate });
        builder.HasIndex(p => new { p.TenantId, p.PaymentMethod });
        builder.HasIndex(p => p.BankTransactionId);
    }
}
