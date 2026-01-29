using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Master.Entities;
using Stocker.Domain.Master.Enums;

namespace Stocker.Persistence.Configurations.Master;

/// <summary>
/// SubscriptionCart entity configuration
/// </summary>
public class SubscriptionCartConfiguration : BaseEntityTypeConfiguration<SubscriptionCart>
{
    public override void Configure(EntityTypeBuilder<SubscriptionCart> builder)
    {
        base.Configure(builder);

        builder.ToTable("SubscriptionCarts", "master");

        // Properties
        builder.Property(c => c.TenantId)
            .IsRequired();

        builder.Property(c => c.UserId);

        builder.Property(c => c.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(30)
            .HasDefaultValue(CartStatus.Active);

        builder.Property(c => c.BillingCycle)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(c => c.Currency)
            .IsRequired()
            .HasMaxLength(3)
            .HasDefaultValue("TRY");

        builder.Property(c => c.CreatedAt)
            .IsRequired();

        builder.Property(c => c.UpdatedAt);

        builder.Property(c => c.ExpiresAt);

        // Coupon/Discount
        builder.Property(c => c.CouponCode)
            .HasMaxLength(50);

        builder.Property(c => c.DiscountPercent)
            .HasPrecision(5, 2)
            .HasDefaultValue(0m);

        builder.Property(c => c.DiscountAmount)
            .HasPrecision(18, 2)
            .HasDefaultValue(0m);

        // Ignore calculated properties
        builder.Ignore(c => c.SubTotal);
        builder.Ignore(c => c.DiscountTotal);
        builder.Ignore(c => c.Total);
        builder.Ignore(c => c.ItemCount);
        builder.Ignore(c => c.IsEmpty);
        builder.Ignore(c => c.HasExpired);

        // Relationships
        builder.HasMany(c => c.Items)
            .WithOne()
            .HasForeignKey(i => i.CartId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Navigation(c => c.Items)
            .UsePropertyAccessMode(PropertyAccessMode.Field);

        // Indexes
        builder.HasIndex(c => c.TenantId)
            .HasDatabaseName("IX_SubscriptionCarts_TenantId");

        builder.HasIndex(c => c.UserId)
            .HasDatabaseName("IX_SubscriptionCarts_UserId");

        builder.HasIndex(c => c.Status)
            .HasDatabaseName("IX_SubscriptionCarts_Status");

        builder.HasIndex(c => new { c.TenantId, c.Status })
            .HasDatabaseName("IX_SubscriptionCarts_TenantId_Status");

        builder.HasIndex(c => c.ExpiresAt)
            .HasDatabaseName("IX_SubscriptionCarts_ExpiresAt");
    }
}

/// <summary>
/// SubscriptionCartItem entity configuration
/// </summary>
public class SubscriptionCartItemConfiguration : IEntityTypeConfiguration<SubscriptionCartItem>
{
    public void Configure(EntityTypeBuilder<SubscriptionCartItem> builder)
    {
        builder.ToTable("SubscriptionCartItems", "master");

        builder.HasKey(i => i.Id);

        builder.Property(i => i.CartId)
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

        // Money value object - UnitPrice
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

        // Ignore calculated LineTotal
        builder.Ignore(i => i.LineTotal);

        // Item-specific metadata
        builder.Property(i => i.TrialDays);

        builder.Property(i => i.DiscountPercent)
            .HasPrecision(5, 2);

        builder.Property(i => i.IncludedModuleCodesJson)
            .HasMaxLength(1000);

        builder.Property(i => i.RequiredModuleCode)
            .HasMaxLength(50);

        builder.Property(i => i.StorageGB);

        builder.Property(i => i.AddedAt)
            .IsRequired();

        builder.Property(i => i.UpdatedAt);

        // Ignore calculated IncludedModuleCodes
        builder.Ignore(i => i.IncludedModuleCodes);

        // Indexes
        builder.HasIndex(i => i.CartId)
            .HasDatabaseName("IX_SubscriptionCartItems_CartId");

        builder.HasIndex(i => new { i.CartId, i.ItemType })
            .HasDatabaseName("IX_SubscriptionCartItems_CartId_ItemType");

        builder.HasIndex(i => new { i.CartId, i.ItemCode })
            .HasDatabaseName("IX_SubscriptionCartItems_CartId_ItemCode");
    }
}
