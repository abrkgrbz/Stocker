using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Finance.Domain.Entities;

namespace Stocker.Modules.Finance.Infrastructure.Persistence.Configurations;

/// <summary>
/// Entity configuration for Check
/// </summary>
public class CheckConfiguration : IEntityTypeConfiguration<Check>
{
    public void Configure(EntityTypeBuilder<Check> builder)
    {
        builder.ToTable("Checks", "finance");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.TenantId)
            .IsRequired();

        builder.Property(c => c.CheckNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(c => c.PortfolioNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(c => c.SerialNumber)
            .HasMaxLength(50);

        builder.Property(c => c.Currency)
            .IsRequired()
            .HasMaxLength(3)
            .HasDefaultValue("TRY");

        builder.Property(c => c.ExchangeRate)
            .HasPrecision(18, 6);

        // Bank Information
        builder.Property(c => c.BankName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(c => c.BranchName)
            .HasMaxLength(200);

        builder.Property(c => c.BranchCode)
            .HasMaxLength(20);

        builder.Property(c => c.AccountNumber)
            .HasMaxLength(50);

        builder.Property(c => c.Iban)
            .HasMaxLength(34);

        // Drawer Information
        builder.Property(c => c.DrawerName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(c => c.DrawerTaxId)
            .HasMaxLength(11);

        builder.Property(c => c.DrawerAddress)
            .HasMaxLength(500);

        builder.Property(c => c.DrawerPhone)
            .HasMaxLength(50);

        // Beneficiary Information
        builder.Property(c => c.BeneficiaryName)
            .HasMaxLength(200);

        builder.Property(c => c.BeneficiaryTaxId)
            .HasMaxLength(11);

        // Current Account Information
        builder.Property(c => c.CurrentAccountName)
            .HasMaxLength(200);

        // Movement Information
        builder.Property(c => c.CollateralGivenTo)
            .HasMaxLength(200);

        // Bounced/Protest Information
        builder.Property(c => c.BouncedReason)
            .HasMaxLength(500);

        // Notes
        builder.Property(c => c.Notes)
            .HasMaxLength(2000);

        // Money value objects - owned entities
        builder.OwnsOne(c => c.Amount, money =>
        {
            money.Property(m => m.Amount).HasColumnName("Amount").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("AmountCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(c => c.AmountTRY, money =>
        {
            money.Property(m => m.Amount).HasColumnName("AmountTRY").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("AmountTRYCurrency").HasMaxLength(3);
        });

        // Relationships
        builder.HasOne(c => c.CurrentAccount)
            .WithMany()
            .HasForeignKey(c => c.CurrentAccountId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(c => c.EndorsedToCurrentAccount)
            .WithMany()
            .HasForeignKey(c => c.EndorsedToCurrentAccountId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(c => c.CollectionBankAccount)
            .WithMany()
            .HasForeignKey(c => c.CollectionBankAccountId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(c => c.Payment)
            .WithMany()
            .HasForeignKey(c => c.PaymentId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(c => c.JournalEntry)
            .WithMany()
            .HasForeignKey(c => c.JournalEntryId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasMany(c => c.Movements)
            .WithOne(m => m.Check)
            .HasForeignKey(m => m.CheckId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(c => c.TenantId);
        builder.HasIndex(c => new { c.TenantId, c.CheckNumber }).IsUnique();
        builder.HasIndex(c => new { c.TenantId, c.PortfolioNumber });
        builder.HasIndex(c => new { c.TenantId, c.CheckType });
        builder.HasIndex(c => new { c.TenantId, c.Direction });
        builder.HasIndex(c => new { c.TenantId, c.Status });
        builder.HasIndex(c => new { c.TenantId, c.DueDate });
        builder.HasIndex(c => new { c.TenantId, c.RegistrationDate });
        builder.HasIndex(c => new { c.TenantId, c.IsGivenToBank });
        builder.HasIndex(c => new { c.TenantId, c.IsEndorsed });
        builder.HasIndex(c => new { c.TenantId, c.IsBounced });
        builder.HasIndex(c => c.CurrentAccountId);
    }
}

/// <summary>
/// Entity configuration for CheckMovement
/// </summary>
public class CheckMovementConfiguration : IEntityTypeConfiguration<CheckMovement>
{
    public void Configure(EntityTypeBuilder<CheckMovement> builder)
    {
        builder.ToTable("CheckMovements", "finance");

        builder.HasKey(cm => cm.Id);

        builder.Property(cm => cm.TenantId)
            .IsRequired();

        builder.Property(cm => cm.Description)
            .IsRequired()
            .HasMaxLength(500);

        // Relationships
        builder.HasOne(cm => cm.Check)
            .WithMany(c => c.Movements)
            .HasForeignKey(cm => cm.CheckId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(cm => cm.TenantId);
        builder.HasIndex(cm => cm.CheckId);
        builder.HasIndex(cm => new { cm.TenantId, cm.MovementType });
        builder.HasIndex(cm => new { cm.TenantId, cm.MovementDate });
    }
}
