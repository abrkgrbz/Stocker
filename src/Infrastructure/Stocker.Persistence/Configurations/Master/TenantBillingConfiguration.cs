using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Master.Entities;

namespace Stocker.Persistence.Configurations.Master;

public class TenantBillingConfiguration : IEntityTypeConfiguration<TenantBilling>
{
    public void Configure(EntityTypeBuilder<TenantBilling> builder)
    {
        builder.ToTable("TenantBillings", "Master");
        
        builder.HasKey(x => x.Id);
        
        // Billing Address
        builder.Property(x => x.CompanyName)
            .IsRequired()
            .HasMaxLength(200);
            
        builder.Property(x => x.TaxNumber)
            .HasMaxLength(50);
            
        builder.Property(x => x.TaxOffice)
            .HasMaxLength(100);
            
        builder.Property(x => x.AddressLine1)
            .IsRequired()
            .HasMaxLength(256);
            
        builder.Property(x => x.AddressLine2)
            .HasMaxLength(256);
            
        builder.Property(x => x.City)
            .IsRequired()
            .HasMaxLength(100);
            
        builder.Property(x => x.State)
            .HasMaxLength(100);
            
        builder.Property(x => x.PostalCode)
            .IsRequired()
            .HasMaxLength(20);
            
        builder.Property(x => x.Country)
            .IsRequired()
            .HasMaxLength(100);
            
        // Contact Information
        builder.OwnsOne(x => x.InvoiceEmail, email =>
        {
            email.Property(e => e.Value)
                .HasColumnName("InvoiceEmail")
                .IsRequired()
                .HasMaxLength(256);
        });
        
        builder.OwnsOne(x => x.CCEmail, email =>
        {
            email.Property(e => e.Value)
                .HasColumnName("CCEmail")
                .HasMaxLength(256);
        });
        
        builder.OwnsOne(x => x.ContactPhone, phone =>
        {
            phone.Property(p => p.Value)
                .HasColumnName("ContactPhone")
                .HasMaxLength(50);
        });
        
        // Payment Settings
        builder.Property(x => x.PreferredPaymentMethod)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);
            
        builder.Property(x => x.BillingCycle)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);
            
        builder.Property(x => x.BillingDay)
            .IsRequired();
            
        builder.Property(x => x.PaymentLimit)
            .HasPrecision(18, 2);
            
        builder.Property(x => x.Currency)
            .IsRequired()
            .HasMaxLength(3);
            
        // Bank Account
        builder.Property(x => x.BankName)
            .HasMaxLength(100);
            
        builder.Property(x => x.BankBranch)
            .HasMaxLength(100);
            
        builder.Property(x => x.AccountHolder)
            .HasMaxLength(200);
            
        builder.Property(x => x.IBAN)
            .HasMaxLength(50);
            
        builder.Property(x => x.SwiftCode)
            .HasMaxLength(20);
            
        builder.Property(x => x.AccountNumber)
            .HasMaxLength(50);
            
        builder.Property(x => x.RoutingNumber)
            .HasMaxLength(20);
            
        // Credit Card
        builder.Property(x => x.CardHolderName)
            .HasMaxLength(200);
            
        builder.Property(x => x.CardNumberMasked)
            .HasMaxLength(20);
            
        builder.Property(x => x.CardType)
            .HasMaxLength(50);
            
        builder.Property(x => x.CardToken)
            .HasMaxLength(256);
            
        // PayPal
        builder.Property(x => x.PayPalEmail)
            .HasMaxLength(256);
            
        builder.Property(x => x.PayPalAccountId)
            .HasMaxLength(100);
            
        // Billing Preferences
        builder.Property(x => x.PurchaseOrderNumber)
            .HasMaxLength(50);
            
        builder.Property(x => x.CostCenter)
            .HasMaxLength(50);
            
        // Late Payment Settings
        builder.Property(x => x.LatePaymentInterestRate)
            .HasPrecision(5, 2);
            
        // Status
        builder.Property(x => x.VerifiedBy)
            .HasMaxLength(100);
            
        builder.Property(x => x.LastPaymentAmount)
            .HasPrecision(18, 2);
            
        // Audit
        builder.Property(x => x.CreatedBy)
            .IsRequired()
            .HasMaxLength(100);
            
        builder.Property(x => x.UpdatedBy)
            .HasMaxLength(100);
            
        // Navigation
        builder.HasOne(x => x.Tenant)
            .WithOne(t => t.BillingInfo)
            .HasForeignKey<TenantBilling>(x => x.TenantId)
            .OnDelete(DeleteBehavior.Restrict);
            
        // Indexes
        builder.HasIndex(x => x.TenantId)
            .IsUnique();
        builder.HasIndex(x => x.IsActive);
        builder.HasIndex(x => x.PreferredPaymentMethod);
    }
}