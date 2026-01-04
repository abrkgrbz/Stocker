using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Finance.Domain.Entities;

namespace Stocker.Modules.Finance.Infrastructure.Persistence.Configurations;

/// <summary>
/// Entity configuration for PromissoryNote
/// </summary>
public class PromissoryNoteConfiguration : IEntityTypeConfiguration<PromissoryNote>
{
    public void Configure(EntityTypeBuilder<PromissoryNote> builder)
    {
        builder.ToTable("PromissoryNotes", "finance");

        builder.HasKey(pn => pn.Id);

        builder.Property(pn => pn.TenantId)
            .IsRequired();

        builder.Property(pn => pn.NoteNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(pn => pn.PortfolioNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(pn => pn.SerialNumber)
            .HasMaxLength(50);

        builder.Property(pn => pn.IssuePlace)
            .HasMaxLength(200);

        builder.Property(pn => pn.Currency)
            .IsRequired()
            .HasMaxLength(3)
            .HasDefaultValue("TRY");

        builder.Property(pn => pn.ExchangeRate)
            .HasPrecision(18, 6);

        // Debtor Information
        builder.Property(pn => pn.DebtorName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(pn => pn.DebtorTaxId)
            .HasMaxLength(11);

        builder.Property(pn => pn.DebtorAddress)
            .HasMaxLength(500);

        builder.Property(pn => pn.DebtorPhone)
            .HasMaxLength(50);

        // Creditor Information
        builder.Property(pn => pn.CreditorName)
            .HasMaxLength(200);

        builder.Property(pn => pn.CreditorTaxId)
            .HasMaxLength(11);

        // Guarantor Information
        builder.Property(pn => pn.GuarantorName)
            .HasMaxLength(200);

        builder.Property(pn => pn.GuarantorTaxId)
            .HasMaxLength(11);

        builder.Property(pn => pn.GuarantorAddress)
            .HasMaxLength(500);

        // Current Account Information
        builder.Property(pn => pn.CurrentAccountName)
            .HasMaxLength(200);

        // Movement Information
        builder.Property(pn => pn.CollateralGivenTo)
            .HasMaxLength(200);

        // Protest Information
        builder.Property(pn => pn.ProtestReason)
            .HasMaxLength(500);

        // Notes
        builder.Property(pn => pn.Notes)
            .HasMaxLength(2000);

        // Money value objects - owned entities
        builder.OwnsOne(pn => pn.Amount, money =>
        {
            money.Property(m => m.Amount).HasColumnName("Amount").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("AmountCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(pn => pn.AmountTRY, money =>
        {
            money.Property(m => m.Amount).HasColumnName("AmountTRY").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("AmountTRYCurrency").HasMaxLength(3);
        });

        builder.OwnsOne(pn => pn.DiscountAmount, money =>
        {
            money.Property(m => m.Amount).HasColumnName("DiscountAmount").HasPrecision(18, 4);
            money.Property(m => m.Currency).HasColumnName("DiscountAmountCurrency").HasMaxLength(3);
        });

        // Relationships
        builder.HasOne(pn => pn.CurrentAccount)
            .WithMany()
            .HasForeignKey(pn => pn.CurrentAccountId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(pn => pn.EndorsedToCurrentAccount)
            .WithMany()
            .HasForeignKey(pn => pn.EndorsedToCurrentAccountId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(pn => pn.CollectionBankAccount)
            .WithMany()
            .HasForeignKey(pn => pn.CollectionBankAccountId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(pn => pn.Payment)
            .WithMany()
            .HasForeignKey(pn => pn.PaymentId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(pn => pn.JournalEntry)
            .WithMany()
            .HasForeignKey(pn => pn.JournalEntryId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasMany(pn => pn.Movements)
            .WithOne(m => m.PromissoryNote)
            .HasForeignKey(m => m.PromissoryNoteId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(pn => pn.TenantId);
        builder.HasIndex(pn => new { pn.TenantId, pn.NoteNumber }).IsUnique();
        builder.HasIndex(pn => new { pn.TenantId, pn.PortfolioNumber });
        builder.HasIndex(pn => new { pn.TenantId, pn.NoteType });
        builder.HasIndex(pn => new { pn.TenantId, pn.Direction });
        builder.HasIndex(pn => new { pn.TenantId, pn.Status });
        builder.HasIndex(pn => new { pn.TenantId, pn.DueDate });
        builder.HasIndex(pn => new { pn.TenantId, pn.RegistrationDate });
        builder.HasIndex(pn => new { pn.TenantId, pn.IsGivenToBank });
        builder.HasIndex(pn => new { pn.TenantId, pn.IsEndorsed });
        builder.HasIndex(pn => new { pn.TenantId, pn.IsProtested });
        builder.HasIndex(pn => pn.CurrentAccountId);
    }
}

/// <summary>
/// Entity configuration for PromissoryNoteMovement
/// </summary>
public class PromissoryNoteMovementConfiguration : IEntityTypeConfiguration<PromissoryNoteMovement>
{
    public void Configure(EntityTypeBuilder<PromissoryNoteMovement> builder)
    {
        builder.ToTable("PromissoryNoteMovements", "finance");

        builder.HasKey(pm => pm.Id);

        builder.Property(pm => pm.TenantId)
            .IsRequired();

        builder.Property(pm => pm.Description)
            .IsRequired()
            .HasMaxLength(500);

        // Relationships
        builder.HasOne(pm => pm.PromissoryNote)
            .WithMany(pn => pn.Movements)
            .HasForeignKey(pm => pm.PromissoryNoteId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(pm => pm.TenantId);
        builder.HasIndex(pm => pm.PromissoryNoteId);
        builder.HasIndex(pm => new { pm.TenantId, pm.MovementType });
        builder.HasIndex(pm => new { pm.TenantId, pm.MovementDate });
    }
}
