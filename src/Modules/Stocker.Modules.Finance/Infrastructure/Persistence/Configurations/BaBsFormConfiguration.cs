using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Finance.Domain.Entities;

namespace Stocker.Modules.Finance.Infrastructure.Persistence.Configurations;

/// <summary>
/// Entity configuration for BaBsForm
/// </summary>
public class BaBsFormConfiguration : IEntityTypeConfiguration<BaBsForm>
{
    public void Configure(EntityTypeBuilder<BaBsForm> builder)
    {
        builder.ToTable("BaBsForms", "finance");

        builder.HasKey(f => f.Id);

        builder.Property(f => f.TenantId)
            .IsRequired();

        builder.Property(f => f.FormNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(f => f.TaxId)
            .IsRequired()
            .HasMaxLength(11);

        builder.Property(f => f.TaxOffice)
            .HasMaxLength(200);

        builder.Property(f => f.CompanyName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(f => f.GibApprovalNumber)
            .HasMaxLength(50);

        builder.Property(f => f.GibSubmissionReference)
            .HasMaxLength(100);

        builder.Property(f => f.CorrectionReason)
            .HasMaxLength(500);

        builder.Property(f => f.PreparedBy)
            .HasMaxLength(200);

        builder.Property(f => f.ApprovedBy)
            .HasMaxLength(200);

        builder.Property(f => f.Notes)
            .HasMaxLength(2000);

        // Money value objects - owned entities
        builder.OwnsOne(f => f.TotalAmountExcludingVat, money =>
        {
            money.Property(m => m.Amount).HasColumnName("TotalAmountExcludingVat").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("TotalAmountExcludingVatCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(f => f.TotalVat, money =>
        {
            money.Property(m => m.Amount).HasColumnName("TotalVat").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("TotalVatCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(f => f.TotalAmountIncludingVat, money =>
        {
            money.Property(m => m.Amount).HasColumnName("TotalAmountIncludingVat").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("TotalAmountIncludingVatCurrency").HasMaxLength(3);
        });

        // Self-referencing relationship (Corrections)
        builder.HasOne(f => f.CorrectedForm)
            .WithMany(f => f.Corrections)
            .HasForeignKey(f => f.CorrectedFormId)
            .OnDelete(DeleteBehavior.Restrict);

        // Relationships
        builder.HasMany(f => f.Items)
            .WithOne(i => i.BaBsForm)
            .HasForeignKey(i => i.BaBsFormId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(f => f.TenantId);
        builder.HasIndex(f => new { f.TenantId, f.FormNumber }).IsUnique();
        builder.HasIndex(f => new { f.TenantId, f.FormType });
        builder.HasIndex(f => new { f.TenantId, f.PeriodYear, f.PeriodMonth });
        builder.HasIndex(f => new { f.TenantId, f.Status });
        builder.HasIndex(f => new { f.TenantId, f.FilingDeadline });
        builder.HasIndex(f => new { f.TenantId, f.IsCorrection });
        builder.HasIndex(f => f.AccountingPeriodId);
    }
}

/// <summary>
/// Entity configuration for BaBsFormItem
/// </summary>
public class BaBsFormItemConfiguration : IEntityTypeConfiguration<BaBsFormItem>
{
    public void Configure(EntityTypeBuilder<BaBsFormItem> builder)
    {
        builder.ToTable("BaBsFormItems", "finance");

        builder.HasKey(i => i.Id);

        builder.Property(i => i.TenantId)
            .IsRequired();

        builder.Property(i => i.CounterpartyTaxId)
            .IsRequired()
            .HasMaxLength(11);

        builder.Property(i => i.CounterpartyName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(i => i.CountryCode)
            .HasMaxLength(3);

        builder.Property(i => i.Notes)
            .HasMaxLength(2000);

        // Money value objects - owned entities
        builder.OwnsOne(i => i.AmountExcludingVat, money =>
        {
            money.Property(m => m.Amount).HasColumnName("AmountExcludingVat").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("AmountExcludingVatCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(i => i.VatAmount, money =>
        {
            money.Property(m => m.Amount).HasColumnName("VatAmount").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("VatAmountCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(i => i.TotalAmountIncludingVat, money =>
        {
            money.Property(m => m.Amount).HasColumnName("TotalAmountIncludingVat").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("TotalAmountIncludingVatCurrency").HasMaxLength(3);
        });

        // Relationships
        builder.HasOne(i => i.BaBsForm)
            .WithMany(f => f.Items)
            .HasForeignKey(i => i.BaBsFormId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(i => i.TenantId);
        builder.HasIndex(i => i.BaBsFormId);
        builder.HasIndex(i => new { i.TenantId, i.BaBsFormId, i.CounterpartyTaxId });
        builder.HasIndex(i => new { i.TenantId, i.DocumentType });
    }
}
