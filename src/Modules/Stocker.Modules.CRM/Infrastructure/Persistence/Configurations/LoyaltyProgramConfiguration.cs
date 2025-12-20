using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.CRM.Domain.Entities;

namespace Stocker.Modules.CRM.Infrastructure.Persistence.Configurations;

public class LoyaltyProgramConfiguration : IEntityTypeConfiguration<LoyaltyProgram>
{
    public void Configure(EntityTypeBuilder<LoyaltyProgram> builder)
    {
        builder.ToTable("LoyaltyPrograms", "crm");

        builder.HasKey(l => l.Id);

        builder.Property(l => l.Id)
            .ValueGeneratedNever();

        builder.Property(l => l.TenantId)
            .IsRequired();

        builder.Property(l => l.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(l => l.Code)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(l => l.Description)
            .HasMaxLength(2000);

        builder.Property(l => l.PointsPerSpend)
            .HasPrecision(10, 4);

        builder.Property(l => l.SpendUnit)
            .HasPrecision(10, 2);

        builder.Property(l => l.Currency)
            .HasMaxLength(3);

        builder.Property(l => l.MinimumSpendForPoints)
            .HasPrecision(18, 2);

        builder.Property(l => l.PointValue)
            .HasPrecision(10, 4);

        builder.Property(l => l.MaxRedemptionPercentage)
            .HasPrecision(5, 2);

        builder.Property(l => l.TermsAndConditions)
            .HasColumnType("text");

        builder.Property(l => l.PrivacyPolicy)
            .HasColumnType("text");

        // Relationships
        builder.HasMany(l => l.Tiers)
            .WithOne(t => t.LoyaltyProgram)
            .HasForeignKey(t => t.LoyaltyProgramId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(l => l.Rewards)
            .WithOne(r => r.LoyaltyProgram)
            .HasForeignKey(r => r.LoyaltyProgramId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(l => l.TenantId);
        builder.HasIndex(l => new { l.TenantId, l.Code }).IsUnique();
        builder.HasIndex(l => new { l.TenantId, l.IsActive });
    }
}

public class LoyaltyTierConfiguration : IEntityTypeConfiguration<LoyaltyTier>
{
    public void Configure(EntityTypeBuilder<LoyaltyTier> builder)
    {
        builder.ToTable("LoyaltyTiers", "crm");

        builder.HasKey(t => t.Id);

        builder.Property(t => t.Id)
            .ValueGeneratedNever();

        builder.Property(t => t.TenantId)
            .IsRequired();

        builder.Property(t => t.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(t => t.DiscountPercentage)
            .HasPrecision(5, 2);

        builder.Property(t => t.BonusPointsMultiplier)
            .HasPrecision(5, 2);

        builder.Property(t => t.Benefits)
            .HasColumnType("text");

        builder.Property(t => t.IconUrl)
            .HasMaxLength(500);

        builder.Property(t => t.Color)
            .HasMaxLength(20);

        // Indexes
        builder.HasIndex(t => t.TenantId);
        builder.HasIndex(t => new { t.LoyaltyProgramId, t.Order });
    }
}

public class LoyaltyRewardConfiguration : IEntityTypeConfiguration<LoyaltyReward>
{
    public void Configure(EntityTypeBuilder<LoyaltyReward> builder)
    {
        builder.ToTable("LoyaltyRewards", "crm");

        builder.HasKey(r => r.Id);

        builder.Property(r => r.Id)
            .ValueGeneratedNever();

        builder.Property(r => r.TenantId)
            .IsRequired();

        builder.Property(r => r.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(r => r.Description)
            .IsRequired()
            .HasMaxLength(2000);

        builder.Property(r => r.DiscountValue)
            .HasPrecision(18, 2);

        builder.Property(r => r.DiscountPercentage)
            .HasPrecision(5, 2);

        builder.Property(r => r.ProductName)
            .HasMaxLength(200);

        builder.Property(r => r.ImageUrl)
            .HasMaxLength(500);

        builder.Property(r => r.Terms)
            .HasMaxLength(2000);

        // Indexes
        builder.HasIndex(r => r.TenantId);
        builder.HasIndex(r => new { r.LoyaltyProgramId, r.IsActive });
        builder.HasIndex(r => new { r.LoyaltyProgramId, r.RewardType });
    }
}

public class LoyaltyMembershipConfiguration : IEntityTypeConfiguration<LoyaltyMembership>
{
    public void Configure(EntityTypeBuilder<LoyaltyMembership> builder)
    {
        builder.ToTable("LoyaltyMemberships", "crm");

        builder.HasKey(m => m.Id);

        builder.Property(m => m.Id)
            .ValueGeneratedNever();

        builder.Property(m => m.TenantId)
            .IsRequired();

        builder.Property(m => m.MembershipNumber)
            .IsRequired()
            .HasMaxLength(50);

        // Relationships
        builder.HasOne(m => m.LoyaltyProgram)
            .WithMany()
            .HasForeignKey(m => m.LoyaltyProgramId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(m => m.Customer)
            .WithMany()
            .HasForeignKey(m => m.CustomerId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(m => m.CurrentTier)
            .WithMany()
            .HasForeignKey(m => m.CurrentTierId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasMany(m => m.Transactions)
            .WithOne(t => t.LoyaltyMembership)
            .HasForeignKey(t => t.LoyaltyMembershipId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(m => m.TenantId);
        builder.HasIndex(m => new { m.TenantId, m.MembershipNumber }).IsUnique();
        builder.HasIndex(m => new { m.TenantId, m.CustomerId });
        builder.HasIndex(m => new { m.LoyaltyProgramId, m.IsActive });
    }
}

public class LoyaltyTransactionConfiguration : IEntityTypeConfiguration<LoyaltyTransaction>
{
    public void Configure(EntityTypeBuilder<LoyaltyTransaction> builder)
    {
        builder.ToTable("LoyaltyTransactions", "crm");

        builder.HasKey(t => t.Id);

        builder.Property(t => t.Id)
            .ValueGeneratedNever();

        builder.Property(t => t.TenantId)
            .IsRequired();

        builder.Property(t => t.Description)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(t => t.ReferenceNumber)
            .HasMaxLength(100);

        // Indexes
        builder.HasIndex(t => t.TenantId);
        builder.HasIndex(t => new { t.LoyaltyMembershipId, t.TransactionDate });
        builder.HasIndex(t => new { t.LoyaltyMembershipId, t.TransactionType });
    }
}
