using System;
using System.Collections.Generic;
using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Tenant.Entities;

public class TenantCustomization : AggregateRoot<Guid>
{
    private TenantCustomization() { }
    
    // Branding
    public string? LogoUrl { get; private set; }
    public string? LogoDarkUrl { get; private set; }
    public string? FaviconUrl { get; private set; }
    public string? CompanyName { get; private set; }
    public string? BrandName { get; private set; }
    public string? Slogan { get; private set; }
    
    // Colors
    public string? PrimaryColor { get; private set; }
    public string? SecondaryColor { get; private set; }
    public string? AccentColor { get; private set; }
    public string? SuccessColor { get; private set; }
    public string? WarningColor { get; private set; }
    public string? ErrorColor { get; private set; }
    public string? InfoColor { get; private set; }
    public string? BackgroundColor { get; private set; }
    public string? TextColor { get; private set; }
    public string? BorderColor { get; private set; }
    
    // Typography
    public string? PrimaryFont { get; private set; }
    public string? SecondaryFont { get; private set; }
    public string? FontSizeBase { get; private set; }
    public string? LineHeight { get; private set; }
    public string? HeaderFont { get; private set; }
    public string? MonospaceFont { get; private set; }
    
    // Layout
    public string? SidebarPosition { get; private set; } = "left"; // left, right
    public bool SidebarCollapsed { get; private set; }
    public string? HeaderStyle { get; private set; } = "fixed"; // fixed, static, hidden
    public string? FooterStyle { get; private set; } = "static"; // fixed, static, hidden
    public string? LayoutMode { get; private set; } = "fluid"; // fluid, boxed
    public string? MenuStyle { get; private set; } = "vertical"; // vertical, horizontal
    public bool ShowBreadcrumb { get; private set; } = true;
    public bool ShowFooter { get; private set; } = true;
    
    // Theme
    public string? ThemeMode { get; private set; } = "light"; // light, dark, auto
    public string? ThemePreset { get; private set; } = "default";
    public string? CustomCss { get; private set; }
    public string? CustomJavaScript { get; private set; }
    public string? CustomHtml { get; private set; } // For header/footer injection
    
    // Login Page
    public string? LoginBackgroundUrl { get; private set; }
    public string? LoginBackgroundColor { get; private set; }
    public string? LoginLogoUrl { get; private set; }
    public string? LoginTitle { get; private set; }
    public string? LoginSubtitle { get; private set; }
    public string? LoginFooterText { get; private set; }
    public bool ShowLoginSocialButtons { get; private set; } = false;
    public bool ShowLoginRememberMe { get; private set; } = true;
    public bool ShowLoginForgotPassword { get; private set; } = true;
    
    // Email Templates
    public string? EmailHeaderHtml { get; private set; }
    public string? EmailFooterHtml { get; private set; }
    public string? EmailLogoUrl { get; private set; }
    public string? EmailPrimaryColor { get; private set; }
    public string? EmailFromName { get; private set; }
    public string? EmailReplyTo { get; private set; }
    public string? EmailSignature { get; private set; }
    
    // Dashboard
    public string? DashboardLayout { get; private set; } // JSON configuration
    public string? DefaultWidgets { get; private set; } // JSON array of widget IDs
    public bool ShowDashboardStats { get; private set; } = true;
    public bool ShowDashboardCharts { get; private set; } = true;
    public bool ShowDashboardActivities { get; private set; } = true;
    public bool ShowDashboardNotifications { get; private set; } = true;
    public string? DashboardWelcomeMessage { get; private set; }
    
    // Reports
    public string? ReportHeaderTemplate { get; private set; }
    public string? ReportFooterTemplate { get; private set; }
    public string? ReportLogoUrl { get; private set; }
    public string? ReportWatermarkUrl { get; private set; }
    public bool ShowReportPageNumbers { get; private set; } = true;
    public bool ShowReportGeneratedDate { get; private set; } = true;
    
    // Invoice Templates  
    public string? InvoiceTemplate { get; private set; }
    public string? InvoiceLogoUrl { get; private set; }
    public string? InvoiceHeaderText { get; private set; }
    public string? InvoiceFooterText { get; private set; }
    public string? InvoiceTermsAndConditions { get; private set; }
    public string? InvoicePaymentInstructions { get; private set; }
    
    // Localization
    public string? DefaultLanguage { get; private set; } = "tr-TR";
    public string? DefaultCurrency { get; private set; } = "TRY";
    public string? DefaultTimezone { get; private set; } = "Europe/Istanbul";
    public string? DateFormat { get; private set; } = "dd/MM/yyyy";
    public string? TimeFormat { get; private set; } = "HH:mm";
    public string? NumberFormat { get; private set; } = "#,##0.00";
    public bool Use24HourTime { get; private set; } = true;
    public string? FirstDayOfWeek { get; private set; } = "Monday";
    
    // Features Toggle
    public bool EnableDarkMode { get; private set; } = true;
    public bool EnableMultiLanguage { get; private set; } = true;
    public bool EnableNotifications { get; private set; } = true;
    public bool EnableChat { get; private set; } = false;
    public bool EnableSearch { get; private set; } = true;
    public bool EnableHelp { get; private set; } = true;
    public bool EnableProfile { get; private set; } = true;
    public bool EnableSettings { get; private set; } = true;
    
    // Custom Menu Items
    public string? CustomMenuItems { get; private set; } // JSON array
    public string? CustomShortcuts { get; private set; } // JSON array
    public string? CustomActions { get; private set; } // JSON array
    
    // SEO & Metadata
    public string? MetaTitle { get; private set; }
    public string? MetaDescription { get; private set; }
    public string? MetaKeywords { get; private set; }
    public string? OpenGraphImage { get; private set; }
    public string? TwitterCard { get; private set; }
    
    // Advanced
    public string? CustomDomain { get; private set; }
    public string? GoogleAnalyticsId { get; private set; }
    public string? FacebookPixelId { get; private set; }
    public string? IntercomAppId { get; private set; }
    public string? HotjarId { get; private set; }
    public string? CustomTrackingScripts { get; private set; }
    
    // Audit
    public DateTime CreatedAt { get; private set; }
    public string CreatedBy { get; private set; } = string.Empty;
    public DateTime? ModifiedAt { get; private set; }
    public string? ModifiedBy { get; private set; }
    public int Version { get; private set; } = 1;
    
    public static TenantCustomization Create(string createdBy)
    {
        if (string.IsNullOrWhiteSpace(createdBy))
            throw new ArgumentException("Creator is required", nameof(createdBy));
            
        return new TenantCustomization
        {
            Id = Guid.NewGuid(),
            CreatedAt = DateTime.UtcNow,
            CreatedBy = createdBy
        };
    }
    
    public void UpdateBranding(
        string? logoUrl,
        string? logoDarkUrl,
        string? faviconUrl,
        string? companyName,
        string? brandName,
        string? slogan,
        string modifiedBy)
    {
        LogoUrl = logoUrl;
        LogoDarkUrl = logoDarkUrl;
        FaviconUrl = faviconUrl;
        CompanyName = companyName;
        BrandName = brandName;
        Slogan = slogan;
        
        UpdateModificationInfo(modifiedBy);
    }
    
    public void UpdateColors(
        string? primaryColor,
        string? secondaryColor,
        string? accentColor,
        string? successColor,
        string? warningColor,
        string? errorColor,
        string? infoColor,
        string? backgroundColor,
        string? textColor,
        string? borderColor,
        string modifiedBy)
    {
        if (!string.IsNullOrWhiteSpace(primaryColor) && !IsValidColor(primaryColor))
            throw new ArgumentException("Invalid primary color format", nameof(primaryColor));
            
        PrimaryColor = primaryColor;
        SecondaryColor = secondaryColor;
        AccentColor = accentColor;
        SuccessColor = successColor;
        WarningColor = warningColor;
        ErrorColor = errorColor;
        InfoColor = infoColor;
        BackgroundColor = backgroundColor;
        TextColor = textColor;
        BorderColor = borderColor;
        
        UpdateModificationInfo(modifiedBy);
    }
    
    public void UpdateTypography(
        string? primaryFont,
        string? secondaryFont,
        string? fontSizeBase,
        string? lineHeight,
        string? headerFont,
        string? monospaceFont,
        string modifiedBy)
    {
        PrimaryFont = primaryFont;
        SecondaryFont = secondaryFont;
        FontSizeBase = fontSizeBase;
        LineHeight = lineHeight;
        HeaderFont = headerFont;
        MonospaceFont = monospaceFont;
        
        UpdateModificationInfo(modifiedBy);
    }
    
    public void UpdateLayout(
        string? sidebarPosition,
        bool sidebarCollapsed,
        string? headerStyle,
        string? footerStyle,
        string? layoutMode,
        string? menuStyle,
        bool showBreadcrumb,
        bool showFooter,
        string modifiedBy)
    {
        SidebarPosition = sidebarPosition;
        SidebarCollapsed = sidebarCollapsed;
        HeaderStyle = headerStyle;
        FooterStyle = footerStyle;
        LayoutMode = layoutMode;
        MenuStyle = menuStyle;
        ShowBreadcrumb = showBreadcrumb;
        ShowFooter = showFooter;
        
        UpdateModificationInfo(modifiedBy);
    }
    
    public void UpdateTheme(
        string? themeMode,
        string? themePreset,
        string? customCss,
        string? customJavaScript,
        string? customHtml,
        string modifiedBy)
    {
        ThemeMode = themeMode;
        ThemePreset = themePreset;
        CustomCss = customCss;
        CustomJavaScript = customJavaScript;
        CustomHtml = customHtml;
        
        UpdateModificationInfo(modifiedBy);
    }
    
    public void UpdateLoginPage(
        string? loginBackgroundUrl,
        string? loginBackgroundColor,
        string? loginLogoUrl,
        string? loginTitle,
        string? loginSubtitle,
        string? loginFooterText,
        bool showLoginSocialButtons,
        bool showLoginRememberMe,
        bool showLoginForgotPassword,
        string modifiedBy)
    {
        LoginBackgroundUrl = loginBackgroundUrl;
        LoginBackgroundColor = loginBackgroundColor;
        LoginLogoUrl = loginLogoUrl;
        LoginTitle = loginTitle;
        LoginSubtitle = loginSubtitle;
        LoginFooterText = loginFooterText;
        ShowLoginSocialButtons = showLoginSocialButtons;
        ShowLoginRememberMe = showLoginRememberMe;
        ShowLoginForgotPassword = showLoginForgotPassword;
        
        UpdateModificationInfo(modifiedBy);
    }
    
    public void UpdateEmailTemplates(
        string? emailHeaderHtml,
        string? emailFooterHtml,
        string? emailLogoUrl,
        string? emailPrimaryColor,
        string? emailFromName,
        string? emailReplyTo,
        string? emailSignature,
        string modifiedBy)
    {
        EmailHeaderHtml = emailHeaderHtml;
        EmailFooterHtml = emailFooterHtml;
        EmailLogoUrl = emailLogoUrl;
        EmailPrimaryColor = emailPrimaryColor;
        EmailFromName = emailFromName;
        EmailReplyTo = emailReplyTo;
        EmailSignature = emailSignature;
        
        UpdateModificationInfo(modifiedBy);
    }
    
    public void UpdateDashboard(
        string? dashboardLayout,
        string? defaultWidgets,
        bool showDashboardStats,
        bool showDashboardCharts,
        bool showDashboardActivities,
        bool showDashboardNotifications,
        string? dashboardWelcomeMessage,
        string modifiedBy)
    {
        DashboardLayout = dashboardLayout;
        DefaultWidgets = defaultWidgets;
        ShowDashboardStats = showDashboardStats;
        ShowDashboardCharts = showDashboardCharts;
        ShowDashboardActivities = showDashboardActivities;
        ShowDashboardNotifications = showDashboardNotifications;
        DashboardWelcomeMessage = dashboardWelcomeMessage;
        
        UpdateModificationInfo(modifiedBy);
    }
    
    public void UpdateLocalization(
        string? defaultLanguage,
        string? defaultCurrency,
        string? defaultTimezone,
        string? dateFormat,
        string? timeFormat,
        string? numberFormat,
        bool use24HourTime,
        string? firstDayOfWeek,
        string modifiedBy)
    {
        DefaultLanguage = defaultLanguage;
        DefaultCurrency = defaultCurrency;
        DefaultTimezone = defaultTimezone;
        DateFormat = dateFormat;
        TimeFormat = timeFormat;
        NumberFormat = numberFormat;
        Use24HourTime = use24HourTime;
        FirstDayOfWeek = firstDayOfWeek;
        
        UpdateModificationInfo(modifiedBy);
    }
    
    public void UpdateFeatureToggles(
        bool enableDarkMode,
        bool enableMultiLanguage,
        bool enableNotifications,
        bool enableChat,
        bool enableSearch,
        bool enableHelp,
        bool enableProfile,
        bool enableSettings,
        string modifiedBy)
    {
        EnableDarkMode = enableDarkMode;
        EnableMultiLanguage = enableMultiLanguage;
        EnableNotifications = enableNotifications;
        EnableChat = enableChat;
        EnableSearch = enableSearch;
        EnableHelp = enableHelp;
        EnableProfile = enableProfile;
        EnableSettings = enableSettings;
        
        UpdateModificationInfo(modifiedBy);
    }
    
    public void UpdateTracking(
        string? googleAnalyticsId,
        string? facebookPixelId,
        string? intercomAppId,
        string? hotjarId,
        string? customTrackingScripts,
        string modifiedBy)
    {
        GoogleAnalyticsId = googleAnalyticsId;
        FacebookPixelId = facebookPixelId;
        IntercomAppId = intercomAppId;
        HotjarId = hotjarId;
        CustomTrackingScripts = customTrackingScripts;
        
        UpdateModificationInfo(modifiedBy);
    }
    
    public void ResetToDefaults(string modifiedBy)
    {
        // Reset all customizations to default values
        ThemeMode = "light";
        ThemePreset = "default";
        LayoutMode = "fluid";
        MenuStyle = "vertical";
        SidebarPosition = "left";
        HeaderStyle = "fixed";
        FooterStyle = "static";
        ShowBreadcrumb = true;
        ShowFooter = true;
        DefaultLanguage = "tr-TR";
        DefaultCurrency = "TRY";
        DefaultTimezone = "Europe/Istanbul";
        DateFormat = "dd/MM/yyyy";
        TimeFormat = "HH:mm";
        Use24HourTime = true;
        FirstDayOfWeek = "Monday";
        
        // Clear custom values
        CustomCss = null;
        CustomJavaScript = null;
        CustomHtml = null;
        
        UpdateModificationInfo(modifiedBy);
    }
    
    private void UpdateModificationInfo(string modifiedBy)
    {
        ModifiedAt = DateTime.UtcNow;
        ModifiedBy = modifiedBy;
        Version++;
    }
    
    private static bool IsValidColor(string color)
    {
        // Simple validation for hex colors
        if (string.IsNullOrWhiteSpace(color))
            return false;
            
        return System.Text.RegularExpressions.Regex.IsMatch(
            color, 
            @"^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$|^rgb\(|^rgba\(|^hsl\(|^hsla\("
        );
    }
}