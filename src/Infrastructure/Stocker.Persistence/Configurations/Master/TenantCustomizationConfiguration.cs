using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Master.Entities;

namespace Stocker.Persistence.Configurations.Master;

public class TenantCustomizationConfiguration : IEntityTypeConfiguration<TenantCustomization>
{
    public void Configure(EntityTypeBuilder<TenantCustomization> builder)
    {
        builder.ToTable("TenantCustomizations", "Master");
        
        builder.HasKey(x => x.Id);
        
        // Theme Settings
        builder.Property(x => x.Theme)
            .IsRequired()
            .HasMaxLength(50);
            
        builder.Property(x => x.PrimaryColor)
            .IsRequired()
            .HasMaxLength(7);
            
        builder.Property(x => x.SecondaryColor)
            .IsRequired()
            .HasMaxLength(7);
            
        builder.Property(x => x.AccentColor)
            .IsRequired()
            .HasMaxLength(7);
            
        builder.Property(x => x.BackgroundColor)
            .IsRequired()
            .HasMaxLength(7);
            
        builder.Property(x => x.TextColor)
            .IsRequired()
            .HasMaxLength(7);
            
        builder.Property(x => x.FontFamily)
            .IsRequired()
            .HasMaxLength(200);
            
        builder.Property(x => x.FontSize)
            .IsRequired()
            .HasMaxLength(10);
            
        // Branding
        builder.Property(x => x.LogoUrl)
            .HasMaxLength(500);
            
        builder.Property(x => x.LogoDarkUrl)
            .HasMaxLength(500);
            
        builder.Property(x => x.FaviconUrl)
            .HasMaxLength(500);
            
        builder.Property(x => x.CompanyName)
            .HasMaxLength(200);
            
        builder.Property(x => x.Tagline)
            .HasMaxLength(500);
            
        builder.Property(x => x.FooterText)
            .HasMaxLength(1000);
            
        builder.Property(x => x.CopyrightText)
            .HasMaxLength(200);
            
        // Login Page
        builder.Property(x => x.LoginBackgroundUrl)
            .HasMaxLength(500);
            
        builder.Property(x => x.LoginBackgroundColor)
            .HasMaxLength(7);
            
        builder.Property(x => x.LoginLogoUrl)
            .HasMaxLength(500);
            
        builder.Property(x => x.LoginTitle)
            .HasMaxLength(200);
            
        builder.Property(x => x.LoginSubtitle)
            .HasMaxLength(500);
            
        builder.Property(x => x.LoginFooterText)
            .HasMaxLength(1000);
            
        // Navigation & Layout
        builder.Property(x => x.NavigationStyle)
            .IsRequired()
            .HasMaxLength(20);
            
        builder.Property(x => x.NavigationPosition)
            .IsRequired()
            .HasMaxLength(20);
            
        builder.Property(x => x.SidebarPosition)
            .IsRequired()
            .HasMaxLength(20);
            
        builder.Property(x => x.CustomMenuItems)
            .HasMaxLength(4000);
            
        // Dashboard
        builder.Property(x => x.DashboardLayout)
            .HasMaxLength(4000);
            
        builder.Property(x => x.DefaultWidgets)
            .HasMaxLength(4000);
            
        builder.Property(x => x.WelcomeMessageTemplate)
            .HasMaxLength(1000);
            
        // Email Templates
        builder.Property(x => x.WelcomeEmailTemplate)
            .HasMaxLength(4000);
            
        builder.Property(x => x.PasswordResetEmailTemplate)
            .HasMaxLength(4000);
            
        builder.Property(x => x.InvoiceEmailTemplate)
            .HasMaxLength(4000);
            
        builder.Property(x => x.NotificationEmailTemplate)
            .HasMaxLength(4000);
            
        builder.Property(x => x.EmailSignature)
            .HasMaxLength(1000);
            
        builder.Property(x => x.EmailHeaderHtml)
            .HasMaxLength(2000);
            
        builder.Property(x => x.EmailFooterHtml)
            .HasMaxLength(2000);
            
        // Report Templates
        builder.Property(x => x.ReportHeaderTemplate)
            .HasMaxLength(2000);
            
        builder.Property(x => x.ReportFooterTemplate)
            .HasMaxLength(2000);
            
        builder.Property(x => x.InvoiceTemplate)
            .HasMaxLength(4000);
            
        builder.Property(x => x.QuotationTemplate)
            .HasMaxLength(4000);
            
        builder.Property(x => x.PurchaseOrderTemplate)
            .HasMaxLength(4000);
            
        builder.Property(x => x.WatermarkText)
            .HasMaxLength(100);
            
        // Custom CSS & JavaScript
        builder.Property(x => x.CustomCSS)
            .HasMaxLength(8000);
            
        builder.Property(x => x.CustomJavaScript)
            .HasMaxLength(8000);
            
        builder.Property(x => x.HeadHtml)
            .HasMaxLength(2000);
            
        builder.Property(x => x.BodyHtml)
            .HasMaxLength(2000);
            
        // Language & Localization
        builder.Property(x => x.DefaultLanguage)
            .IsRequired()
            .HasMaxLength(5);
            
        builder.Property(x => x.SupportedLanguages)
            .HasMaxLength(500);
            
        builder.Property(x => x.DateFormat)
            .IsRequired()
            .HasMaxLength(20);
            
        builder.Property(x => x.TimeFormat)
            .IsRequired()
            .HasMaxLength(20);
            
        builder.Property(x => x.NumberFormat)
            .IsRequired()
            .HasMaxLength(20);
            
        builder.Property(x => x.CurrencyPosition)
            .IsRequired()
            .HasMaxLength(10);
            
        builder.Property(x => x.FirstDayOfWeek)
            .IsRequired()
            .HasMaxLength(10);
            
        // Mobile Settings
        builder.Property(x => x.MobileLogoUrl)
            .HasMaxLength(500);
            
        builder.Property(x => x.MobileTheme)
            .HasMaxLength(50);
            
        builder.Property(x => x.IOSAppUrl)
            .HasMaxLength(500);
            
        builder.Property(x => x.AndroidAppUrl)
            .HasMaxLength(500);
            
        // Status
        builder.Property(x => x.LastModifiedBy)
            .HasMaxLength(100);
            
        // Audit
        builder.Property(x => x.CreatedBy)
            .IsRequired()
            .HasMaxLength(100);
            
        builder.Property(x => x.UpdatedBy)
            .HasMaxLength(100);
            
        // Navigation
        builder.HasOne(x => x.Tenant)
            .WithOne()
            .HasForeignKey<TenantCustomization>(x => x.TenantId)
            .OnDelete(DeleteBehavior.Restrict);
            
        // Indexes
        builder.HasIndex(x => x.TenantId)
            .IsUnique();
        builder.HasIndex(x => x.IsActive);
        builder.HasIndex(x => x.Version);
    }
}