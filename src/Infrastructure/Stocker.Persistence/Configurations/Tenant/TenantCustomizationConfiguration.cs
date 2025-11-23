using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Tenant.Entities;

namespace Stocker.Persistence.Configurations.Tenant;

public class TenantCustomizationConfiguration : BaseEntityTypeConfiguration<TenantCustomization>
{
    public override void Configure(EntityTypeBuilder<TenantCustomization> builder)
    {
        base.Configure(builder);
        
        builder.ToTable("TenantCustomizations", "tenant");
        
        // Branding
        builder.Property(x => x.LogoUrl)
            .HasMaxLength(500);
            
        builder.Property(x => x.LogoDarkUrl)
            .HasMaxLength(500);
            
        builder.Property(x => x.FaviconUrl)
            .HasMaxLength(500);
            
        builder.Property(x => x.CompanyName)
            .HasMaxLength(200);
            
        builder.Property(x => x.BrandName)
            .HasMaxLength(200);
            
        builder.Property(x => x.Slogan)
            .HasMaxLength(500);
            
        // Colors
        builder.Property(x => x.PrimaryColor)
            .HasMaxLength(50);
            
        builder.Property(x => x.SecondaryColor)
            .HasMaxLength(50);
            
        builder.Property(x => x.AccentColor)
            .HasMaxLength(50);
            
        builder.Property(x => x.SuccessColor)
            .HasMaxLength(50);
            
        builder.Property(x => x.WarningColor)
            .HasMaxLength(50);
            
        builder.Property(x => x.ErrorColor)
            .HasMaxLength(50);
            
        builder.Property(x => x.InfoColor)
            .HasMaxLength(50);
            
        builder.Property(x => x.BackgroundColor)
            .HasMaxLength(50);
            
        builder.Property(x => x.TextColor)
            .HasMaxLength(50);
            
        builder.Property(x => x.BorderColor)
            .HasMaxLength(50);
            
        // Typography
        builder.Property(x => x.PrimaryFont)
            .HasMaxLength(100);
            
        builder.Property(x => x.SecondaryFont)
            .HasMaxLength(100);
            
        builder.Property(x => x.FontSizeBase)
            .HasMaxLength(20);
            
        builder.Property(x => x.LineHeight)
            .HasMaxLength(20);
            
        builder.Property(x => x.HeaderFont)
            .HasMaxLength(100);
            
        builder.Property(x => x.MonospaceFont)
            .HasMaxLength(100);
            
        // Layout
        builder.Property(x => x.SidebarPosition)
            .HasMaxLength(20);
            
        builder.Property(x => x.SidebarCollapsed)
            .IsRequired();
            
        builder.Property(x => x.HeaderStyle)
            .HasMaxLength(20);
            
        builder.Property(x => x.FooterStyle)
            .HasMaxLength(20);
            
        builder.Property(x => x.LayoutMode)
            .HasMaxLength(20);
            
        builder.Property(x => x.MenuStyle)
            .HasMaxLength(20);
            
        builder.Property(x => x.ShowBreadcrumb)
            .IsRequired();
            
        builder.Property(x => x.ShowFooter)
            .IsRequired();
            
        // Theme
        builder.Property(x => x.ThemeMode)
            .HasMaxLength(20);
            
        builder.Property(x => x.ThemePreset)
            .HasMaxLength(50);
            
        builder.Property(x => x.CustomCss)
            .HasColumnType("text");
            
        builder.Property(x => x.CustomJavaScript)
            .HasColumnType("text");
            
        builder.Property(x => x.CustomHtml)
            .HasColumnType("text");
            
        // Login Page
        builder.Property(x => x.LoginBackgroundUrl)
            .HasMaxLength(500);
            
        builder.Property(x => x.LoginBackgroundColor)
            .HasMaxLength(50);
            
        builder.Property(x => x.LoginLogoUrl)
            .HasMaxLength(500);
            
        builder.Property(x => x.LoginTitle)
            .HasMaxLength(200);
            
        builder.Property(x => x.LoginSubtitle)
            .HasMaxLength(500);
            
        builder.Property(x => x.LoginFooterText)
            .HasMaxLength(500);
            
        builder.Property(x => x.ShowLoginSocialButtons)
            .IsRequired();
            
        builder.Property(x => x.ShowLoginRememberMe)
            .IsRequired();
            
        builder.Property(x => x.ShowLoginForgotPassword)
            .IsRequired();
            
        // Email Templates
        builder.Property(x => x.EmailHeaderHtml)
            .HasColumnType("text");
            
        builder.Property(x => x.EmailFooterHtml)
            .HasColumnType("text");
            
        builder.Property(x => x.EmailLogoUrl)
            .HasMaxLength(500);
            
        builder.Property(x => x.EmailPrimaryColor)
            .HasMaxLength(50);
            
        builder.Property(x => x.EmailFromName)
            .HasMaxLength(200);
            
        builder.Property(x => x.EmailReplyTo)
            .HasMaxLength(200);
            
        builder.Property(x => x.EmailSignature)
            .HasMaxLength(1000);
            
        // Dashboard
        builder.Property(x => x.DashboardLayout)
            .HasColumnType("text");
            
        builder.Property(x => x.DefaultWidgets)
            .HasColumnType("text");
            
        builder.Property(x => x.ShowDashboardStats)
            .IsRequired();
            
        builder.Property(x => x.ShowDashboardCharts)
            .IsRequired();
            
        builder.Property(x => x.ShowDashboardActivities)
            .IsRequired();
            
        builder.Property(x => x.ShowDashboardNotifications)
            .IsRequired();
            
        builder.Property(x => x.DashboardWelcomeMessage)
            .HasMaxLength(500);
            
        // Reports
        builder.Property(x => x.ReportHeaderTemplate)
            .HasColumnType("text");
            
        builder.Property(x => x.ReportFooterTemplate)
            .HasColumnType("text");
            
        builder.Property(x => x.ReportLogoUrl)
            .HasMaxLength(500);
            
        builder.Property(x => x.ReportWatermarkUrl)
            .HasMaxLength(500);
            
        builder.Property(x => x.ShowReportPageNumbers)
            .IsRequired();
            
        builder.Property(x => x.ShowReportGeneratedDate)
            .IsRequired();
            
        // Invoice Templates
        builder.Property(x => x.InvoiceTemplate)
            .HasColumnType("text");
            
        builder.Property(x => x.InvoiceLogoUrl)
            .HasMaxLength(500);
            
        builder.Property(x => x.InvoiceHeaderText)
            .HasMaxLength(500);
            
        builder.Property(x => x.InvoiceFooterText)
            .HasMaxLength(500);
            
        builder.Property(x => x.InvoiceTermsAndConditions)
            .HasColumnType("text");
            
        builder.Property(x => x.InvoicePaymentInstructions)
            .HasColumnType("text");
            
        // Localization
        builder.Property(x => x.DefaultLanguage)
            .HasMaxLength(10);
            
        builder.Property(x => x.DefaultCurrency)
            .HasMaxLength(3);
            
        builder.Property(x => x.DefaultTimezone)
            .HasMaxLength(50);
            
        builder.Property(x => x.DateFormat)
            .HasMaxLength(50);
            
        builder.Property(x => x.TimeFormat)
            .HasMaxLength(50);
            
        builder.Property(x => x.NumberFormat)
            .HasMaxLength(50);
            
        builder.Property(x => x.Use24HourTime)
            .IsRequired();
            
        builder.Property(x => x.FirstDayOfWeek)
            .HasMaxLength(20);
            
        // Features Toggle
        builder.Property(x => x.EnableDarkMode)
            .IsRequired();
            
        builder.Property(x => x.EnableMultiLanguage)
            .IsRequired();
            
        builder.Property(x => x.EnableNotifications)
            .IsRequired();
            
        builder.Property(x => x.EnableChat)
            .IsRequired();
            
        builder.Property(x => x.EnableSearch)
            .IsRequired();
            
        builder.Property(x => x.EnableHelp)
            .IsRequired();
            
        builder.Property(x => x.EnableProfile)
            .IsRequired();
            
        builder.Property(x => x.EnableSettings)
            .IsRequired();
            
        // Custom Menu Items
        builder.Property(x => x.CustomMenuItems)
            .HasColumnType("text");
            
        builder.Property(x => x.CustomShortcuts)
            .HasColumnType("text");
            
        builder.Property(x => x.CustomActions)
            .HasColumnType("text");
            
        // SEO & Metadata
        builder.Property(x => x.MetaTitle)
            .HasMaxLength(200);
            
        builder.Property(x => x.MetaDescription)
            .HasMaxLength(500);
            
        builder.Property(x => x.MetaKeywords)
            .HasMaxLength(500);
            
        builder.Property(x => x.OpenGraphImage)
            .HasMaxLength(500);
            
        builder.Property(x => x.TwitterCard)
            .HasMaxLength(500);
            
        // Advanced
        builder.Property(x => x.CustomDomain)
            .HasMaxLength(200);
            
        builder.Property(x => x.GoogleAnalyticsId)
            .HasMaxLength(50);
            
        builder.Property(x => x.FacebookPixelId)
            .HasMaxLength(50);
            
        builder.Property(x => x.IntercomAppId)
            .HasMaxLength(50);
            
        builder.Property(x => x.HotjarId)
            .HasMaxLength(50);
            
        builder.Property(x => x.CustomTrackingScripts)
            .HasColumnType("text");
            
        // Audit
        builder.Property(x => x.CreatedAt)
            .IsRequired();
            
        builder.Property(x => x.CreatedBy)
            .HasMaxLength(100)
            .IsRequired();
            
        builder.Property(x => x.ModifiedAt);
        
        builder.Property(x => x.ModifiedBy)
            .HasMaxLength(100);
            
        builder.Property(x => x.Version)
            .IsRequired();
            
        // Indexes
        builder.HasIndex(x => x.ThemeMode);
        builder.HasIndex(x => x.Version);
    }
}