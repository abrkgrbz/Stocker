using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Master.Entities;

namespace Stocker.Persistence.Configurations.Master;

public class IyzicoSubscriptionConfiguration : BaseEntityTypeConfiguration<IyzicoSubscription>
{
    public override void Configure(EntityTypeBuilder<IyzicoSubscription> builder)
    {
        base.Configure(builder);

        builder.ToTable("IyzicoSubscriptions", "master");

        // Tenant & Internal Subscription Link
        builder.Property(s => s.TenantId)
            .IsRequired();

        builder.Property(s => s.SubscriptionId)
            .IsRequired(false);

        // Iyzico External IDs
        builder.Property(s => s.IyzicoSubscriptionReferenceCode)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(s => s.IyzicoCustomerReferenceCode)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(s => s.IyzicoPricingPlanReferenceCode)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(s => s.IyzicoParentReferenceCode)
            .HasMaxLength(100);

        // Customer Info
        builder.Property(s => s.CustomerEmail)
            .IsRequired()
            .HasMaxLength(256);

        builder.Property(s => s.CustomerName)
            .HasMaxLength(200);

        builder.Property(s => s.CustomerGsmNumber)
            .HasMaxLength(20);

        builder.Property(s => s.CustomerIdentityNumber)
            .HasMaxLength(20);

        // Plan Info
        builder.Property(s => s.PlanName)
            .HasMaxLength(200);

        builder.Property(s => s.ProductName)
            .HasMaxLength(200);

        // Status
        builder.Property(s => s.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20);

        // Dates
        builder.Property(s => s.TrialStartDate);
        builder.Property(s => s.TrialEndDate);
        builder.Property(s => s.StartDate);
        builder.Property(s => s.EndDate);

        // Card Info
        builder.Property(s => s.CardToken)
            .HasMaxLength(100);

        builder.Property(s => s.CardBrand)
            .HasMaxLength(30);

        builder.Property(s => s.CardLastFour)
            .HasMaxLength(4);

        builder.Property(s => s.CardHolderName)
            .HasMaxLength(200);

        builder.Property(s => s.CardAssociation)
            .HasMaxLength(20);

        builder.Property(s => s.CardFamily)
            .HasMaxLength(50);

        // Pricing
        builder.Property(s => s.Price)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(s => s.Currency)
            .IsRequired()
            .HasMaxLength(3)
            .HasDefaultValue("TRY");

        builder.Property(s => s.BillingPeriod)
            .IsRequired()
            .HasMaxLength(20)
            .HasDefaultValue("MONTHLY");

        builder.Property(s => s.BillingPeriodCount)
            .IsRequired()
            .HasDefaultValue(1);

        // Installment
        builder.Property(s => s.InstallmentCount);

        builder.Property(s => s.InstallmentPrice)
            .HasPrecision(18, 2);

        // Address Info
        builder.Property(s => s.BillingAddress)
            .HasMaxLength(500);

        builder.Property(s => s.BillingCity)
            .HasMaxLength(100);

        builder.Property(s => s.BillingCountry)
            .HasMaxLength(100);

        builder.Property(s => s.BillingZipCode)
            .HasMaxLength(20);

        // Metadata
        builder.Property(s => s.CreatedAt)
            .IsRequired();

        builder.Property(s => s.UpdatedAt)
            .IsRequired();

        builder.Property(s => s.LastWebhookEventId)
            .HasMaxLength(100);

        builder.Property(s => s.LastWebhookAt);

        builder.Property(s => s.FailureReason)
            .HasMaxLength(500);

        builder.Property(s => s.RetryCount)
            .HasDefaultValue(0);

        // Indexes
        builder.HasIndex(s => s.TenantId)
            .HasDatabaseName("IX_IyzicoSubscriptions_TenantId");

        builder.HasIndex(s => s.IyzicoSubscriptionReferenceCode)
            .IsUnique()
            .HasDatabaseName("IX_IyzicoSubscriptions_SubscriptionReferenceCode");

        builder.HasIndex(s => s.IyzicoCustomerReferenceCode)
            .HasDatabaseName("IX_IyzicoSubscriptions_CustomerReferenceCode");

        builder.HasIndex(s => s.Status)
            .HasDatabaseName("IX_IyzicoSubscriptions_Status");

        builder.HasIndex(s => new { s.TenantId, s.Status })
            .HasDatabaseName("IX_IyzicoSubscriptions_TenantId_Status");

        builder.HasIndex(s => s.CustomerEmail)
            .HasDatabaseName("IX_IyzicoSubscriptions_CustomerEmail");

        // Relationships
        builder.HasOne(s => s.Tenant)
            .WithMany()
            .HasForeignKey(s => s.TenantId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
