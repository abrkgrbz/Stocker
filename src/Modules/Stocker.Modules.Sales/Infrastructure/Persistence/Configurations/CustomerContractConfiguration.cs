using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Sales.Domain.Entities;

namespace Stocker.Modules.Sales.Infrastructure.Persistence.Configurations;

public class CustomerContractConfiguration : IEntityTypeConfiguration<CustomerContract>
{
    public void Configure(EntityTypeBuilder<CustomerContract> builder)
    {
        builder.ToTable("CustomerContracts", "sales");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.ContractNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(c => c.Title)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(c => c.Description)
            .HasMaxLength(2000);

        builder.Property(c => c.ContractType)
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(c => c.CustomerName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(c => c.CustomerTaxNumber)
            .HasMaxLength(20);

        builder.Property(c => c.Status)
            .HasConversion<string>()
            .HasMaxLength(20);

        // Signatories
        builder.Property(c => c.CustomerSignatory)
            .HasMaxLength(200);

        builder.Property(c => c.CustomerSignatoryTitle)
            .HasMaxLength(100);

        builder.Property(c => c.CompanySignatory)
            .HasMaxLength(200);

        builder.Property(c => c.CompanySignatoryTitle)
            .HasMaxLength(100);

        // Sales Rep
        builder.Property(c => c.SalesRepresentativeName)
            .HasMaxLength(200);

        // Terms
        builder.Property(c => c.GeneralDiscountPercentage)
            .HasPrecision(5, 2);

        builder.Property(c => c.SpecialTerms)
            .HasMaxLength(4000);

        builder.Property(c => c.InternalNotes)
            .HasColumnType("nvarchar(max)");

        // Termination
        builder.Property(c => c.TerminationType)
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(c => c.TerminationReason)
            .HasMaxLength(2000);

        // Money - ContractValue
        builder.OwnsOne(c => c.ContractValue, money =>
        {
            money.Property(m => m.Amount)
                .HasColumnName("ContractValue")
                .HasPrecision(18, 2);
            money.Property(m => m.Currency)
                .HasColumnName("ContractValueCurrency")
                .HasMaxLength(3);
        });

        // Money - MinimumAnnualCommitment
        builder.OwnsOne(c => c.MinimumAnnualCommitment, money =>
        {
            money.Property(m => m.Amount)
                .HasColumnName("MinimumAnnualCommitment")
                .HasPrecision(18, 2);
            money.Property(m => m.Currency)
                .HasColumnName("MinimumAnnualCommitmentCurrency")
                .HasMaxLength(3);
        });

        // Money - CreditLimit
        builder.OwnsOne(c => c.CreditLimit, money =>
        {
            money.Property(m => m.Amount)
                .HasColumnName("CreditLimit")
                .HasPrecision(18, 2);
            money.Property(m => m.Currency)
                .HasColumnName("CreditLimitCurrency")
                .HasMaxLength(3);
        });

        #region Phase 3: SLA & Credit Management

        builder.Property(c => c.ServiceLevel)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(c => c.SupportPriority)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(c => c.SupportHours)
            .HasMaxLength(50);

        builder.Property(c => c.DedicatedSupportContact)
            .HasMaxLength(200);

        builder.Property(c => c.CurrentCreditBalance)
            .HasPrecision(18, 2);

        builder.Property(c => c.BlockReason)
            .HasMaxLength(500);

        #endregion

        // Navigation - PriceAgreements
        builder.HasMany(c => c.PriceAgreements)
            .WithOne()
            .HasForeignKey(p => p.ContractId)
            .OnDelete(DeleteBehavior.Cascade);

        // Navigation - PaymentTerms
        builder.HasMany(c => c.PaymentTerms)
            .WithOne()
            .HasForeignKey(p => p.ContractId)
            .OnDelete(DeleteBehavior.Cascade);

        // Navigation - Commitments
        builder.HasMany(c => c.Commitments)
            .WithOne()
            .HasForeignKey(c => c.ContractId)
            .OnDelete(DeleteBehavior.Cascade);

        // Navigation - Documents
        builder.HasMany(c => c.Documents)
            .WithOne()
            .HasForeignKey(d => d.ContractId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(c => c.TenantId);
        builder.HasIndex(c => c.ContractNumber);
        builder.HasIndex(c => new { c.TenantId, c.ContractNumber }).IsUnique();
        builder.HasIndex(c => c.CustomerId);
        builder.HasIndex(c => new { c.TenantId, c.CustomerId });
        builder.HasIndex(c => c.Status);
        builder.HasIndex(c => new { c.TenantId, c.Status });
        builder.HasIndex(c => c.EndDate);
        builder.HasIndex(c => new { c.TenantId, c.EndDate });
        builder.HasIndex(c => c.SalesRepresentativeId);

        // Phase 3 Indexes
        builder.HasIndex(c => c.IsBlocked);
        builder.HasIndex(c => new { c.TenantId, c.IsBlocked });
        builder.HasIndex(c => c.ServiceLevel);
        builder.HasIndex(c => new { c.TenantId, c.ServiceLevel });
    }
}

public class ContractPriceAgreementConfiguration : IEntityTypeConfiguration<ContractPriceAgreement>
{
    public void Configure(EntityTypeBuilder<ContractPriceAgreement> builder)
    {
        builder.ToTable("ContractPriceAgreements", "sales");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.ProductCode)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(p => p.ProductName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(p => p.DiscountPercentage)
            .HasPrecision(5, 2);

        builder.Property(p => p.MinimumQuantity)
            .HasPrecision(18, 4);

        // Money - SpecialPrice
        builder.OwnsOne(p => p.SpecialPrice, money =>
        {
            money.Property(m => m.Amount)
                .HasColumnName("SpecialPrice")
                .HasPrecision(18, 2);
            money.Property(m => m.Currency)
                .HasColumnName("SpecialPriceCurrency")
                .HasMaxLength(3);
        });

        // Indexes
        builder.HasIndex(p => p.ContractId);
        builder.HasIndex(p => p.ProductId);
        builder.HasIndex(p => new { p.ContractId, p.ProductId });
        builder.HasIndex(p => new { p.ContractId, p.IsActive });
    }
}

public class ContractPaymentTermConfiguration : IEntityTypeConfiguration<ContractPaymentTerm>
{
    public void Configure(EntityTypeBuilder<ContractPaymentTerm> builder)
    {
        builder.ToTable("ContractPaymentTerms", "sales");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.TermType)
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(p => p.EarlyPaymentDiscountPercentage)
            .HasPrecision(5, 2);

        // Indexes
        builder.HasIndex(p => p.ContractId);
        builder.HasIndex(p => new { p.ContractId, p.IsDefault });
    }
}

public class ContractCommitmentConfiguration : IEntityTypeConfiguration<ContractCommitment>
{
    public void Configure(EntityTypeBuilder<ContractCommitment> builder)
    {
        builder.ToTable("ContractCommitments", "sales");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.CommitmentType)
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(c => c.Period)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(c => c.BonusPercentage)
            .HasPrecision(5, 2);

        builder.Property(c => c.PenaltyPercentage)
            .HasPrecision(5, 2);

        // Money - TargetAmount
        builder.OwnsOne(c => c.TargetAmount, money =>
        {
            money.Property(m => m.Amount)
                .HasColumnName("TargetAmount")
                .HasPrecision(18, 2);
            money.Property(m => m.Currency)
                .HasColumnName("TargetAmountCurrency")
                .HasMaxLength(3);
        });

        // Money - ActualAmount
        builder.OwnsOne(c => c.ActualAmount, money =>
        {
            money.Property(m => m.Amount)
                .HasColumnName("ActualAmount")
                .HasPrecision(18, 2);
            money.Property(m => m.Currency)
                .HasColumnName("ActualAmountCurrency")
                .HasMaxLength(3);
        });

        // Indexes
        builder.HasIndex(c => c.ContractId);
        builder.HasIndex(c => new { c.ContractId, c.CommitmentType });
        builder.HasIndex(c => new { c.ContractId, c.IsAchieved });
    }
}

public class ContractDocumentConfiguration : IEntityTypeConfiguration<ContractDocument>
{
    public void Configure(EntityTypeBuilder<ContractDocument> builder)
    {
        builder.ToTable("ContractDocuments", "sales");

        builder.HasKey(d => d.Id);

        builder.Property(d => d.DocumentName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(d => d.DocumentType)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(d => d.FilePath)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(d => d.Description)
            .HasMaxLength(1000);

        // Indexes
        builder.HasIndex(d => d.ContractId);
        builder.HasIndex(d => new { d.ContractId, d.DocumentType });
    }
}
