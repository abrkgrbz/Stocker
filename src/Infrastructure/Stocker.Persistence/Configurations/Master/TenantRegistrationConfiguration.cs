using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Master.Entities;

namespace Stocker.Persistence.Configurations.Master;

public class TenantRegistrationConfiguration : IEntityTypeConfiguration<TenantRegistration>
{
    public void Configure(EntityTypeBuilder<TenantRegistration> builder)
    {
        builder.ToTable("TenantRegistrations", "Master");
        
        builder.HasKey(x => x.Id);
        
        builder.Property(x => x.RegistrationCode)
            .IsRequired()
            .HasMaxLength(50);
            
        builder.HasIndex(x => x.RegistrationCode)
            .IsUnique();
            
        builder.Property(x => x.CompanyName)
            .IsRequired()
            .HasMaxLength(200);
            
        builder.Property(x => x.TaxNumber)
            .HasMaxLength(50);
            
        builder.Property(x => x.TaxOffice)
            .HasMaxLength(100);
            
        builder.Property(x => x.ContactPersonName)
            .IsRequired()
            .HasMaxLength(100);
            
        builder.Property(x => x.ContactPersonSurname)
            .IsRequired()
            .HasMaxLength(100);
            
        builder.OwnsOne(x => x.ContactEmail, email =>
        {
            email.Property(e => e.Value)
                .HasColumnName("ContactEmail")
                .IsRequired()
                .HasMaxLength(256);

            email.WithOwner();
        });
        
        builder.OwnsOne(x => x.ContactPhone, phone =>
        {
            phone.Property(p => p.Value)
                .HasColumnName("ContactPhone")
                .IsRequired()
                .HasMaxLength(50);

            phone.WithOwner();
        });
        
        builder.Property(x => x.CompanyWebsite)
            .HasMaxLength(256);
            
        builder.Property(x => x.Industry)
            .HasMaxLength(100);
            
        // Address
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
            
        // Status
        builder.Property(x => x.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);
            
        builder.Property(x => x.RejectionReason)
            .HasMaxLength(500);
            
        builder.Property(x => x.ApprovedBy)
            .HasMaxLength(100);
            
        builder.Property(x => x.RejectedBy)
            .HasMaxLength(100);
            
        // Configure AdminEmail as owned type
        builder.OwnsOne(x => x.AdminEmail, email =>
        {
            email.Property(e => e.Value)
                .HasColumnName("AdminEmail")
                .IsRequired()
                .HasMaxLength(256);

            email.WithOwner();
        });
            
        // Package Selection
        builder.Property(x => x.ReferralCode)
            .HasMaxLength(50);
            
        builder.Property(x => x.PromoCode)
            .HasMaxLength(50);
            
        // Verification
        builder.Property(x => x.EmailVerificationToken)
            .HasMaxLength(256);
            
        builder.Property(x => x.PhoneVerificationCode)
            .HasMaxLength(10);
            
        // Terms
        builder.Property(x => x.TermsVersion)
            .HasMaxLength(20);
            
        // Navigation
        builder.HasOne(x => x.Tenant)
            .WithOne(t => t.Registration)
            .HasForeignKey<TenantRegistration>(x => x.TenantId)
            .OnDelete(DeleteBehavior.Restrict);
            
        builder.HasOne(x => x.SelectedPackage)
            .WithMany()
            .HasForeignKey(x => x.SelectedPackageId)
            .OnDelete(DeleteBehavior.Restrict);
            
        // Indexes
        builder.HasIndex(x => x.Status);
        builder.HasIndex(x => x.RegistrationDate);
        builder.HasIndex(x => new { x.Status, x.RegistrationDate });
    }
}