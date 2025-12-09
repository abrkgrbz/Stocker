using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Master.Entities;

namespace Stocker.Persistence.Configurations.Master;

public class SubscriptionConfiguration : BaseEntityTypeConfiguration<Subscription>
{
    public override void Configure(EntityTypeBuilder<Subscription> builder)
    {
        base.Configure(builder);

        builder.ToTable("Subscriptions", "master");

        // Properties
        builder.Property(s => s.TenantId)
            .IsRequired();

        builder.Property(s => s.PackageId)
            .IsRequired(false);

        builder.Property(s => s.SubscriptionNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(s => s.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(s => s.BillingCycle)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(s => s.StartDate)
            .IsRequired();

        builder.Property(s => s.CurrentPeriodStart)
            .IsRequired();

        builder.Property(s => s.CurrentPeriodEnd)
            .IsRequired();

        builder.Property(s => s.AutoRenew)
            .IsRequired();

        builder.Property(s => s.UserCount)
            .IsRequired();

        builder.Property(s => s.CancellationReason)
            .HasMaxLength(500);

        // Storage quota and usage tracking
        builder.Property(s => s.StorageBucketName)
            .HasMaxLength(100);

        builder.Property(s => s.StorageQuotaGB)
            .IsRequired()
            .HasDefaultValue(0L);

        builder.Property(s => s.StorageUsedBytes)
            .IsRequired()
            .HasDefaultValue(0L);

        builder.Property(s => s.StorageLastCheckedAt);

        // Value Objects
        builder.OwnsOne(s => s.Price, price =>
        {
            price.Property(m => m.Amount)
                .IsRequired()
                .HasPrecision(18, 2)
                .HasColumnName("PriceAmount");

            price.Property(m => m.Currency)
                .IsRequired()
                .HasMaxLength(3)
                .HasColumnName("PriceCurrency");
        });

        // Relationships
        builder.HasMany(s => s.Modules)
            .WithOne()
            .HasForeignKey(m => m.SubscriptionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(s => s.Usages)
            .WithOne()
            .HasForeignKey(u => u.SubscriptionId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(s => s.SubscriptionNumber)
            .IsUnique()
            .HasDatabaseName("IX_Subscriptions_SubscriptionNumber");

        builder.HasIndex(s => s.TenantId)
            .HasDatabaseName("IX_Subscriptions_TenantId");

        builder.HasIndex(s => s.Status)
            .HasDatabaseName("IX_Subscriptions_Status");

        builder.HasIndex(s => new { s.Status, s.CurrentPeriodEnd })
            .HasDatabaseName("IX_Subscriptions_Status_CurrentPeriodEnd");
    }
}