using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Master.Entities;

namespace Stocker.Persistence.Configurations.Master;

public class LemonSqueezySubscriptionConfiguration : BaseEntityTypeConfiguration<LemonSqueezySubscription>
{
    public override void Configure(EntityTypeBuilder<LemonSqueezySubscription> builder)
    {
        base.Configure(builder);

        builder.ToTable("LemonSqueezySubscriptions", "master");

        // Tenant & Internal Subscription Link
        builder.Property(s => s.TenantId)
            .IsRequired();

        builder.Property(s => s.SubscriptionId)
            .IsRequired(false);

        // Lemon Squeezy External IDs
        builder.Property(s => s.LsSubscriptionId)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(s => s.LsCustomerId)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(s => s.LsProductId)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(s => s.LsVariantId)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(s => s.LsOrderId)
            .HasMaxLength(50);

        // Customer Info
        builder.Property(s => s.CustomerEmail)
            .HasMaxLength(256);

        // Product/Plan Info
        builder.Property(s => s.ProductName)
            .HasMaxLength(200);

        builder.Property(s => s.VariantName)
            .HasMaxLength(200);

        // Status
        builder.Property(s => s.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(s => s.StatusFormatted)
            .HasMaxLength(50);

        // Dates
        builder.Property(s => s.TrialEndsAt);
        builder.Property(s => s.RenewsAt);
        builder.Property(s => s.EndsAt);
        builder.Property(s => s.PausedAt);
        builder.Property(s => s.CancelledAt);

        // Billing Info
        builder.Property(s => s.CardBrand)
            .HasMaxLength(20);

        builder.Property(s => s.CardLastFour)
            .HasMaxLength(4);

        builder.Property(s => s.BillingAnchor)
            .HasMaxLength(10);

        // Pricing
        builder.Property(s => s.UnitPrice)
            .IsRequired();

        builder.Property(s => s.Currency)
            .IsRequired()
            .HasMaxLength(3)
            .HasDefaultValue("TRY");

        builder.Property(s => s.BillingInterval)
            .IsRequired()
            .HasMaxLength(20)
            .HasDefaultValue("month");

        builder.Property(s => s.BillingIntervalCount)
            .IsRequired()
            .HasDefaultValue(1);

        // Customer Portal URLs
        builder.Property(s => s.CustomerPortalUrl)
            .HasMaxLength(500);

        builder.Property(s => s.UpdatePaymentMethodUrl)
            .HasMaxLength(500);

        // Metadata
        builder.Property(s => s.CreatedAt)
            .IsRequired();

        builder.Property(s => s.UpdatedAt)
            .IsRequired();

        builder.Property(s => s.LastWebhookEventId)
            .HasMaxLength(100);

        builder.Property(s => s.LastWebhookAt);

        // Indexes
        builder.HasIndex(s => s.TenantId)
            .HasDatabaseName("IX_LemonSqueezySubscriptions_TenantId");

        builder.HasIndex(s => s.LsSubscriptionId)
            .IsUnique()
            .HasDatabaseName("IX_LemonSqueezySubscriptions_LsSubscriptionId");

        builder.HasIndex(s => s.LsCustomerId)
            .HasDatabaseName("IX_LemonSqueezySubscriptions_LsCustomerId");

        builder.HasIndex(s => s.Status)
            .HasDatabaseName("IX_LemonSqueezySubscriptions_Status");

        builder.HasIndex(s => new { s.TenantId, s.Status })
            .HasDatabaseName("IX_LemonSqueezySubscriptions_TenantId_Status");

        // Relationships
        builder.HasOne(s => s.Tenant)
            .WithMany()
            .HasForeignKey(s => s.TenantId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
