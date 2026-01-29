using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Master.Entities;
using Stocker.Domain.Master.Enums;

namespace Stocker.Persistence.Configurations.Master;

/// <summary>
/// SubscriptionOrder entity configuration
/// </summary>
public class SubscriptionOrderConfiguration : BaseEntityTypeConfiguration<SubscriptionOrder>
{
    public override void Configure(EntityTypeBuilder<SubscriptionOrder> builder)
    {
        base.Configure(builder);

        builder.ToTable("SubscriptionOrders", "master");

        // Properties
        builder.Property(o => o.OrderNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(o => o.TenantId)
            .IsRequired();

        builder.Property(o => o.UserId);

        builder.Property(o => o.CartId)
            .IsRequired();

        builder.Property(o => o.SubscriptionId);

        builder.Property(o => o.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(30)
            .HasDefaultValue(OrderStatus.Pending);

        builder.Property(o => o.BillingCycle)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20);

        // Money value objects
        builder.OwnsOne(o => o.SubTotal, price =>
        {
            price.Property(p => p.Amount)
                .HasColumnName("SubTotalAmount")
                .HasPrecision(18, 2)
                .IsRequired();

            price.Property(p => p.Currency)
                .HasColumnName("SubTotalCurrency")
                .HasMaxLength(3)
                .HasDefaultValue("TRY")
                .IsRequired();
        });

        builder.OwnsOne(o => o.DiscountTotal, price =>
        {
            price.Property(p => p.Amount)
                .HasColumnName("DiscountTotalAmount")
                .HasPrecision(18, 2)
                .IsRequired();

            price.Property(p => p.Currency)
                .HasColumnName("DiscountTotalCurrency")
                .HasMaxLength(3)
                .HasDefaultValue("TRY")
                .IsRequired();
        });

        builder.OwnsOne(o => o.TaxAmount, price =>
        {
            price.Property(p => p.Amount)
                .HasColumnName("TaxAmount")
                .HasPrecision(18, 2)
                .IsRequired();

            price.Property(p => p.Currency)
                .HasColumnName("TaxCurrency")
                .HasMaxLength(3)
                .HasDefaultValue("TRY")
                .IsRequired();
        });

        builder.OwnsOne(o => o.Total, price =>
        {
            price.Property(p => p.Amount)
                .HasColumnName("TotalAmount")
                .HasPrecision(18, 2)
                .IsRequired();

            price.Property(p => p.Currency)
                .HasColumnName("TotalCurrency")
                .HasMaxLength(3)
                .HasDefaultValue("TRY")
                .IsRequired();
        });

        // Coupon
        builder.Property(o => o.CouponCode)
            .HasMaxLength(50);

        builder.Property(o => o.CouponDiscountPercent)
            .HasPrecision(5, 2)
            .HasDefaultValue(0m);

        // Payment information
        builder.Property(o => o.PaymentMethod)
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(o => o.PaymentProviderOrderId)
            .HasMaxLength(100);

        builder.Property(o => o.PaymentProviderToken)
            .HasMaxLength(500);

        builder.Property(o => o.PaymentInitiatedAt);

        builder.Property(o => o.PaymentCompletedAt);

        builder.Property(o => o.PaymentFailureReason)
            .HasMaxLength(500);

        // Timestamps
        builder.Property(o => o.CreatedAt)
            .IsRequired();

        builder.Property(o => o.UpdatedAt);

        builder.Property(o => o.CompletedAt);

        builder.Property(o => o.CancelledAt);

        builder.Property(o => o.CancellationReason)
            .HasMaxLength(500);

        // Billing address
        builder.Property(o => o.BillingName)
            .HasMaxLength(200);

        builder.Property(o => o.BillingAddress)
            .HasMaxLength(500);

        builder.Property(o => o.BillingCity)
            .HasMaxLength(100);

        builder.Property(o => o.BillingCountry)
            .HasMaxLength(100);

        builder.Property(o => o.BillingZipCode)
            .HasMaxLength(20);

        builder.Property(o => o.TaxId)
            .HasMaxLength(50);

        // Relationships
        builder.HasMany(o => o.Items)
            .WithOne()
            .HasForeignKey(i => i.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Navigation(o => o.Items)
            .UsePropertyAccessMode(PropertyAccessMode.Field);

        // Indexes
        builder.HasIndex(o => o.OrderNumber)
            .IsUnique()
            .HasDatabaseName("IX_SubscriptionOrders_OrderNumber");

        builder.HasIndex(o => o.TenantId)
            .HasDatabaseName("IX_SubscriptionOrders_TenantId");

        builder.HasIndex(o => o.UserId)
            .HasDatabaseName("IX_SubscriptionOrders_UserId");

        builder.HasIndex(o => o.CartId)
            .HasDatabaseName("IX_SubscriptionOrders_CartId");

        builder.HasIndex(o => o.SubscriptionId)
            .HasDatabaseName("IX_SubscriptionOrders_SubscriptionId");

        builder.HasIndex(o => o.Status)
            .HasDatabaseName("IX_SubscriptionOrders_Status");

        builder.HasIndex(o => new { o.TenantId, o.Status })
            .HasDatabaseName("IX_SubscriptionOrders_TenantId_Status");

        builder.HasIndex(o => o.PaymentProviderOrderId)
            .HasDatabaseName("IX_SubscriptionOrders_PaymentProviderOrderId");

        builder.HasIndex(o => o.CreatedAt)
            .HasDatabaseName("IX_SubscriptionOrders_CreatedAt");
    }
}

/// <summary>
/// SubscriptionOrderItem entity configuration
/// </summary>
public class SubscriptionOrderItemConfiguration : IEntityTypeConfiguration<SubscriptionOrderItem>
{
    public void Configure(EntityTypeBuilder<SubscriptionOrderItem> builder)
    {
        builder.ToTable("SubscriptionOrderItems", "master");

        builder.HasKey(i => i.Id);

        builder.Property(i => i.OrderId)
            .IsRequired();

        builder.Property(i => i.ItemType)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(i => i.ItemId)
            .IsRequired();

        builder.Property(i => i.ItemCode)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(i => i.ItemName)
            .IsRequired()
            .HasMaxLength(200);

        // Money value objects
        builder.OwnsOne(i => i.UnitPrice, price =>
        {
            price.Property(p => p.Amount)
                .HasColumnName("UnitPriceAmount")
                .HasPrecision(18, 2)
                .IsRequired();

            price.Property(p => p.Currency)
                .HasColumnName("UnitPriceCurrency")
                .HasMaxLength(3)
                .HasDefaultValue("TRY")
                .IsRequired();
        });

        builder.Property(i => i.Quantity)
            .IsRequired()
            .HasDefaultValue(1);

        builder.OwnsOne(i => i.LineTotal, price =>
        {
            price.Property(p => p.Amount)
                .HasColumnName("LineTotalAmount")
                .HasPrecision(18, 2)
                .IsRequired();

            price.Property(p => p.Currency)
                .HasColumnName("LineTotalCurrency")
                .HasMaxLength(3)
                .HasDefaultValue("TRY")
                .IsRequired();
        });

        // Activation status
        builder.Property(i => i.IsActivated)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(i => i.ActivatedAt);

        builder.Property(i => i.ActivationError)
            .HasMaxLength(500);

        // Item-specific metadata
        builder.Property(i => i.TrialDays);

        builder.Property(i => i.DiscountPercent)
            .HasPrecision(5, 2);

        builder.Property(i => i.IncludedModuleCodesJson)
            .HasMaxLength(1000);

        builder.Property(i => i.RequiredModuleCode)
            .HasMaxLength(50);

        builder.Property(i => i.StorageGB);

        // Ignore calculated IncludedModuleCodes
        builder.Ignore(i => i.IncludedModuleCodes);

        // Indexes
        builder.HasIndex(i => i.OrderId)
            .HasDatabaseName("IX_SubscriptionOrderItems_OrderId");

        builder.HasIndex(i => new { i.OrderId, i.ItemType })
            .HasDatabaseName("IX_SubscriptionOrderItems_OrderId_ItemType");

        builder.HasIndex(i => i.IsActivated)
            .HasDatabaseName("IX_SubscriptionOrderItems_IsActivated");
    }
}
