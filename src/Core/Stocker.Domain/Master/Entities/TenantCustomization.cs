using Stocker.SharedKernel.Primitives;
using System.Text.Json;

namespace Stocker.Domain.Master.Entities;

public sealed class TenantCustomization : Entity
{
    public Guid TenantId { get; private set; }
    
    // Theme Settings
    public string Theme { get; private set; }
    public string PrimaryColor { get; private set; }
    public string SecondaryColor { get; private set; }
    public string AccentColor { get; private set; }
    public string BackgroundColor { get; private set; }
    public string TextColor { get; private set; }
    public string FontFamily { get; private set; }
    public string FontSize { get; private set; }
    public bool DarkModeEnabled { get; private set; }
    public bool HighContrastMode { get; private set; }
    
    // Branding
    public string? LogoUrl { get; private set; }
    public string? LogoDarkUrl { get; private set; }
    public string? FaviconUrl { get; private set; }
    public string? CompanyName { get; private set; }
    public string? Tagline { get; private set; }
    public string? FooterText { get; private set; }
    public string? CopyrightText { get; private set; }
    
    // Login Page Customization
    public string? LoginBackgroundUrl { get; private set; }
    public string? LoginBackgroundColor { get; private set; }
    public string? LoginLogoUrl { get; private set; }
    public string? LoginTitle { get; private set; }
    public string? LoginSubtitle { get; private set; }
    public string? LoginFooterText { get; private set; }
    public bool ShowLoginSocialButtons { get; private set; }
    public bool ShowLoginRememberMe { get; private set; }
    public bool ShowLoginForgotPassword { get; private set; }
    
    // Navigation & Layout
    public string NavigationStyle { get; private set; } // top, side, both
    public string NavigationPosition { get; private set; } // fixed, static
    public string SidebarPosition { get; private set; } // left, right
    public bool CollapsedSidebarByDefault { get; private set; }
    public bool ShowBreadcrumbs { get; private set; }
    public bool ShowSearchBar { get; private set; }
    public bool ShowNotificationBell { get; private set; }
    public bool ShowUserMenu { get; private set; }
    public string? CustomMenuItems { get; private set; } // JSON
    
    // Dashboard Customization
    public string? DashboardLayout { get; private set; } // JSON
    public string? DefaultWidgets { get; private set; } // JSON
    public bool ShowWelcomeMessage { get; private set; }
    public string? WelcomeMessageTemplate { get; private set; }
    public bool ShowGettingStarted { get; private set; }
    public bool ShowRecentActivity { get; private set; }
    public bool ShowStatistics { get; private set; }
    
    // Email Templates
    public string? WelcomeEmailTemplate { get; private set; }
    public string? PasswordResetEmailTemplate { get; private set; }
    public string? InvoiceEmailTemplate { get; private set; }
    public string? NotificationEmailTemplate { get; private set; }
    public string? EmailSignature { get; private set; }
    public string? EmailHeaderHtml { get; private set; }
    public string? EmailFooterHtml { get; private set; }
    public bool UseCustomEmailTemplates { get; private set; }
    
    // Report Templates
    public string? ReportHeaderTemplate { get; private set; }
    public string? ReportFooterTemplate { get; private set; }
    public string? InvoiceTemplate { get; private set; }
    public string? QuotationTemplate { get; private set; }
    public string? PurchaseOrderTemplate { get; private set; }
    public bool ShowLogoOnReports { get; private set; }
    public bool ShowWatermarkOnReports { get; private set; }
    public string? WatermarkText { get; private set; }
    
    // Custom CSS & JavaScript
    public string? CustomCSS { get; private set; }
    public string? CustomJavaScript { get; private set; }
    public string? HeadHtml { get; private set; }
    public string? BodyHtml { get; private set; }
    public bool AllowCustomCode { get; private set; }
    
    // Language & Localization
    public string DefaultLanguage { get; private set; }
    public string? SupportedLanguages { get; private set; } // JSON array
    public string DateFormat { get; private set; }
    public string TimeFormat { get; private set; }
    public string NumberFormat { get; private set; }
    public string CurrencyPosition { get; private set; } // before, after
    public bool Use24HourTime { get; private set; }
    public string FirstDayOfWeek { get; private set; }
    
    // Features Toggle
    public bool ShowHelp { get; private set; }
    public bool ShowTour { get; private set; }
    public bool ShowTooltips { get; private set; }
    public bool ShowKeyboardShortcuts { get; private set; }
    public bool EnableAnimations { get; private set; }
    public bool EnableSounds { get; private set; }
    public bool EnableAutoSave { get; private set; }
    
    // Mobile Settings
    public bool MobileOptimized { get; private set; }
    public string? MobileLogoUrl { get; private set; }
    public string? MobileTheme { get; private set; }
    public bool ShowMobileApp { get; private set; }
    public string? IOSAppUrl { get; private set; }
    public string? AndroidAppUrl { get; private set; }
    
    // Status
    public bool IsActive { get; private set; }
    public DateTime? LastModifiedAt { get; private set; }
    public string? LastModifiedBy { get; private set; }
    public int Version { get; private set; }
    
    // Audit
    public DateTime CreatedAt { get; private set; }
    public string CreatedBy { get; private set; }
    public DateTime? UpdatedAt { get; private set; }
    public string? UpdatedBy { get; private set; }
    
    // Navigation
    public Tenant Tenant { get; private set; }
    
    private TenantCustomization() { } // EF Constructor
    
    private TenantCustomization(Guid tenantId, string createdBy)
    {
        Id = Guid.NewGuid();
        TenantId = tenantId;
        
        // Set defaults
        Theme = "default";
        PrimaryColor = "#667eea";
        SecondaryColor = "#764ba2";
        AccentColor = "#f093fb";
        BackgroundColor = "#ffffff";
        TextColor = "#333333";
        FontFamily = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
        FontSize = "14px";
        DarkModeEnabled = false;
        HighContrastMode = false;
        
        NavigationStyle = "side";
        NavigationPosition = "fixed";
        SidebarPosition = "left";
        CollapsedSidebarByDefault = false;
        ShowBreadcrumbs = true;
        ShowSearchBar = true;
        ShowNotificationBell = true;
        ShowUserMenu = true;
        
        ShowWelcomeMessage = true;
        ShowGettingStarted = true;
        ShowRecentActivity = true;
        ShowStatistics = true;
        
        UseCustomEmailTemplates = false;
        ShowLogoOnReports = true;
        ShowWatermarkOnReports = false;
        AllowCustomCode = false;
        
        DefaultLanguage = "tr";
        DateFormat = "DD/MM/YYYY";
        TimeFormat = "HH:mm";
        NumberFormat = "1.234,56";
        CurrencyPosition = "after";
        Use24HourTime = true;
        FirstDayOfWeek = "Monday";
        
        ShowHelp = true;
        ShowTour = true;
        ShowTooltips = true;
        ShowKeyboardShortcuts = true;
        EnableAnimations = true;
        EnableSounds = false;
        EnableAutoSave = true;
        
        MobileOptimized = true;
        ShowMobileApp = false;
        
        IsActive = true;
        Version = 1;
        CreatedAt = DateTime.UtcNow;
        CreatedBy = createdBy;
    }
    
    public static TenantCustomization Create(Guid tenantId, string createdBy)
    {
        if (tenantId == Guid.Empty)
            throw new ArgumentException("Tenant ID cannot be empty.", nameof(tenantId));
            
        return new TenantCustomization(tenantId, createdBy);
    }
    
    public void UpdateTheme(
        string theme,
        string primaryColor,
        string secondaryColor,
        string accentColor,
        string backgroundColor,
        string textColor,
        string fontFamily,
        string fontSize,
        bool darkModeEnabled,
        bool highContrastMode)
    {
        Theme = theme;
        PrimaryColor = primaryColor;
        SecondaryColor = secondaryColor;
        AccentColor = accentColor;
        BackgroundColor = backgroundColor;
        TextColor = textColor;
        FontFamily = fontFamily;
        FontSize = fontSize;
        DarkModeEnabled = darkModeEnabled;
        HighContrastMode = highContrastMode;
        
        IncrementVersion();
    }
    
    public void UpdateBranding(
        string? logoUrl,
        string? logoDarkUrl,
        string? faviconUrl,
        string? companyName,
        string? tagline,
        string? footerText,
        string? copyrightText)
    {
        LogoUrl = logoUrl;
        LogoDarkUrl = logoDarkUrl;
        FaviconUrl = faviconUrl;
        CompanyName = companyName;
        Tagline = tagline;
        FooterText = footerText;
        CopyrightText = copyrightText;
        
        IncrementVersion();
    }
    
    public void UpdateLoginPage(
        string? backgroundUrl,
        string? backgroundColor,
        string? logoUrl,
        string? title,
        string? subtitle,
        string? footerText,
        bool showSocialButtons,
        bool showRememberMe,
        bool showForgotPassword)
    {
        LoginBackgroundUrl = backgroundUrl;
        LoginBackgroundColor = backgroundColor;
        LoginLogoUrl = logoUrl;
        LoginTitle = title;
        LoginSubtitle = subtitle;
        LoginFooterText = footerText;
        ShowLoginSocialButtons = showSocialButtons;
        ShowLoginRememberMe = showRememberMe;
        ShowLoginForgotPassword = showForgotPassword;
        
        IncrementVersion();
    }
    
    public void UpdateNavigation(
        string navigationStyle,
        string navigationPosition,
        string sidebarPosition,
        bool collapsedByDefault,
        bool showBreadcrumbs,
        bool showSearchBar,
        bool showNotificationBell,
        bool showUserMenu,
        object? customMenuItems = null)
    {
        NavigationStyle = navigationStyle;
        NavigationPosition = navigationPosition;
        SidebarPosition = sidebarPosition;
        CollapsedSidebarByDefault = collapsedByDefault;
        ShowBreadcrumbs = showBreadcrumbs;
        ShowSearchBar = showSearchBar;
        ShowNotificationBell = showNotificationBell;
        ShowUserMenu = showUserMenu;
        CustomMenuItems = customMenuItems != null ? JsonSerializer.Serialize(customMenuItems) : null;
        
        IncrementVersion();
    }
    
    public void UpdateDashboard(
        object? dashboardLayout,
        object? defaultWidgets,
        bool showWelcomeMessage,
        string? welcomeMessageTemplate,
        bool showGettingStarted,
        bool showRecentActivity,
        bool showStatistics)
    {
        DashboardLayout = dashboardLayout != null ? JsonSerializer.Serialize(dashboardLayout) : null;
        DefaultWidgets = defaultWidgets != null ? JsonSerializer.Serialize(defaultWidgets) : null;
        ShowWelcomeMessage = showWelcomeMessage;
        WelcomeMessageTemplate = welcomeMessageTemplate;
        ShowGettingStarted = showGettingStarted;
        ShowRecentActivity = showRecentActivity;
        ShowStatistics = showStatistics;
        
        IncrementVersion();
    }
    
    public void UpdateEmailTemplates(
        string? welcomeTemplate,
        string? passwordResetTemplate,
        string? invoiceTemplate,
        string? notificationTemplate,
        string? signature,
        string? headerHtml,
        string? footerHtml,
        bool useCustomTemplates)
    {
        WelcomeEmailTemplate = welcomeTemplate;
        PasswordResetEmailTemplate = passwordResetTemplate;
        InvoiceEmailTemplate = invoiceTemplate;
        NotificationEmailTemplate = notificationTemplate;
        EmailSignature = signature;
        EmailHeaderHtml = headerHtml;
        EmailFooterHtml = footerHtml;
        UseCustomEmailTemplates = useCustomTemplates;
        
        IncrementVersion();
    }
    
    public void UpdateReportTemplates(
        string? headerTemplate,
        string? footerTemplate,
        string? invoiceTemplate,
        string? quotationTemplate,
        string? purchaseOrderTemplate,
        bool showLogo,
        bool showWatermark,
        string? watermarkText)
    {
        ReportHeaderTemplate = headerTemplate;
        ReportFooterTemplate = footerTemplate;
        InvoiceTemplate = invoiceTemplate;
        QuotationTemplate = quotationTemplate;
        PurchaseOrderTemplate = purchaseOrderTemplate;
        ShowLogoOnReports = showLogo;
        ShowWatermarkOnReports = showWatermark;
        WatermarkText = watermarkText;
        
        IncrementVersion();
    }
    
    public void UpdateCustomCode(
        string? customCSS,
        string? customJavaScript,
        string? headHtml,
        string? bodyHtml,
        bool allowCustomCode)
    {
        CustomCSS = customCSS;
        CustomJavaScript = customJavaScript;
        HeadHtml = headHtml;
        BodyHtml = bodyHtml;
        AllowCustomCode = allowCustomCode;
        
        IncrementVersion();
    }
    
    public void UpdateLocalization(
        string defaultLanguage,
        List<string>? supportedLanguages,
        string dateFormat,
        string timeFormat,
        string numberFormat,
        string currencyPosition,
        bool use24HourTime,
        string firstDayOfWeek)
    {
        DefaultLanguage = defaultLanguage;
        SupportedLanguages = supportedLanguages != null ? JsonSerializer.Serialize(supportedLanguages) : null;
        DateFormat = dateFormat;
        TimeFormat = timeFormat;
        NumberFormat = numberFormat;
        CurrencyPosition = currencyPosition;
        Use24HourTime = use24HourTime;
        FirstDayOfWeek = firstDayOfWeek;
        
        IncrementVersion();
    }
    
    public void UpdateFeatures(
        bool showHelp,
        bool showTour,
        bool showTooltips,
        bool showKeyboardShortcuts,
        bool enableAnimations,
        bool enableSounds,
        bool enableAutoSave)
    {
        ShowHelp = showHelp;
        ShowTour = showTour;
        ShowTooltips = showTooltips;
        ShowKeyboardShortcuts = showKeyboardShortcuts;
        EnableAnimations = enableAnimations;
        EnableSounds = enableSounds;
        EnableAutoSave = enableAutoSave;
        
        IncrementVersion();
    }
    
    public void UpdateMobileSettings(
        bool mobileOptimized,
        string? mobileLogoUrl,
        string? mobileTheme,
        bool showMobileApp,
        string? iosAppUrl,
        string? androidAppUrl)
    {
        MobileOptimized = mobileOptimized;
        MobileLogoUrl = mobileLogoUrl;
        MobileTheme = mobileTheme;
        ShowMobileApp = showMobileApp;
        IOSAppUrl = iosAppUrl;
        AndroidAppUrl = androidAppUrl;
        
        IncrementVersion();
    }
    
    public void Activate()
    {
        IsActive = true;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void Deactivate()
    {
        IsActive = false;
        UpdatedAt = DateTime.UtcNow;
    }
    
    private void IncrementVersion()
    {
        Version++;
        LastModifiedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }
}