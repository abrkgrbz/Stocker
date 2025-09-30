using FluentAssertions;
using Stocker.Domain.Tenant.Entities;
using Xunit;

namespace Stocker.UnitTests.Domain.Tenant;

public class TenantCustomizationTests
{
    private const string CreatedBy = "admin@test.com";
    private const string ModifiedBy = "manager@test.com";

    [Fact]
    public void Create_WithValidData_ShouldCreateCustomization()
    {
        // Act
        var customization = TenantCustomization.Create(CreatedBy);

        // Assert
        customization.Should().NotBeNull();
        customization.Id.Should().NotBeEmpty();
        customization.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        customization.CreatedBy.Should().Be(CreatedBy);
        customization.ModifiedAt.Should().BeNull();
        customization.ModifiedBy.Should().BeNull();
        customization.Version.Should().Be(1);
        
        // Verify default values
        customization.SidebarPosition.Should().Be("left");
        customization.HeaderStyle.Should().Be("fixed");
        customization.FooterStyle.Should().Be("static");
        customization.LayoutMode.Should().Be("fluid");
        customization.MenuStyle.Should().Be("vertical");
        customization.ShowBreadcrumb.Should().BeTrue();
        customization.ShowFooter.Should().BeTrue();
        customization.ThemeMode.Should().Be("light");
        customization.ThemePreset.Should().Be("default");
        customization.DefaultLanguage.Should().Be("tr-TR");
        customization.DefaultCurrency.Should().Be("TRY");
        customization.DefaultTimezone.Should().Be("Europe/Istanbul");
        customization.DateFormat.Should().Be("dd/MM/yyyy");
        customization.TimeFormat.Should().Be("HH:mm");
        customization.Use24HourTime.Should().BeTrue();
        customization.FirstDayOfWeek.Should().Be("Monday");
        customization.EnableDarkMode.Should().BeTrue();
        customization.EnableMultiLanguage.Should().BeTrue();
        customization.EnableNotifications.Should().BeTrue();
        customization.EnableChat.Should().BeFalse();
        customization.EnableSearch.Should().BeTrue();
        customization.EnableHelp.Should().BeTrue();
        customization.EnableProfile.Should().BeTrue();
        customization.EnableSettings.Should().BeTrue();
        customization.ShowLoginSocialButtons.Should().BeFalse();
        customization.ShowLoginRememberMe.Should().BeTrue();
        customization.ShowLoginForgotPassword.Should().BeTrue();
        customization.ShowDashboardStats.Should().BeTrue();
        customization.ShowDashboardCharts.Should().BeTrue();
        customization.ShowDashboardActivities.Should().BeTrue();
        customization.ShowDashboardNotifications.Should().BeTrue();
        customization.ShowReportPageNumbers.Should().BeTrue();
        customization.ShowReportGeneratedDate.Should().BeTrue();
    }

    [Fact]
    public void Create_WithNullCreatedBy_ShouldThrowArgumentException()
    {
        // Act
        var action = () => TenantCustomization.Create(null!);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Creator is required*")
            .WithParameterName("createdBy");
    }

    [Fact]
    public void Create_WithEmptyCreatedBy_ShouldThrowArgumentException()
    {
        // Act
        var action = () => TenantCustomization.Create("");

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Creator is required*")
            .WithParameterName("createdBy");
    }

    [Fact]
    public void Create_WithWhitespaceCreatedBy_ShouldThrowArgumentException()
    {
        // Act
        var action = () => TenantCustomization.Create("  ");

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Creator is required*")
            .WithParameterName("createdBy");
    }

    [Fact]
    public void UpdateBranding_ShouldUpdateAllBrandingProperties()
    {
        // Arrange
        var customization = CreateCustomization();
        var logoUrl = "https://example.com/logo.png";
        var logoDarkUrl = "https://example.com/logo-dark.png";
        var faviconUrl = "https://example.com/favicon.ico";
        var companyName = "Test Company";
        var brandName = "Test Brand";
        var slogan = "Quality First";

        // Act
        customization.UpdateBranding(
            logoUrl,
            logoDarkUrl,
            faviconUrl,
            companyName,
            brandName,
            slogan,
            ModifiedBy);

        // Assert
        customization.LogoUrl.Should().Be(logoUrl);
        customization.LogoDarkUrl.Should().Be(logoDarkUrl);
        customization.FaviconUrl.Should().Be(faviconUrl);
        customization.CompanyName.Should().Be(companyName);
        customization.BrandName.Should().Be(brandName);
        customization.Slogan.Should().Be(slogan);
        customization.ModifiedAt.Should().NotBeNull();
        customization.ModifiedBy.Should().Be(ModifiedBy);
        customization.Version.Should().Be(2);
    }

    [Fact]
    public void UpdateBranding_WithNullValues_ShouldClearBrandingProperties()
    {
        // Arrange
        var customization = CreateCustomization();
        customization.UpdateBranding(
            "old-logo.png",
            "old-logo-dark.png",
            "old-favicon.ico",
            "Old Company",
            "Old Brand",
            "Old Slogan",
            ModifiedBy);

        // Act
        customization.UpdateBranding(
            null,
            null,
            null,
            null,
            null,
            null,
            ModifiedBy);

        // Assert
        customization.LogoUrl.Should().BeNull();
        customization.LogoDarkUrl.Should().BeNull();
        customization.FaviconUrl.Should().BeNull();
        customization.CompanyName.Should().BeNull();
        customization.BrandName.Should().BeNull();
        customization.Slogan.Should().BeNull();
        customization.Version.Should().Be(3);
    }

    [Fact]
    public void UpdateColors_WithValidColors_ShouldUpdateAllColorProperties()
    {
        // Arrange
        var customization = CreateCustomization();
        var primaryColor = "#FF5733";
        var secondaryColor = "#33FF57";
        var accentColor = "#3357FF";
        var successColor = "#00FF00";
        var warningColor = "#FFA500";
        var errorColor = "#FF0000";
        var infoColor = "#00BFFF";
        var backgroundColor = "#FFFFFF";
        var textColor = "#000000";
        var borderColor = "#CCCCCC";

        // Act
        customization.UpdateColors(
            primaryColor,
            secondaryColor,
            accentColor,
            successColor,
            warningColor,
            errorColor,
            infoColor,
            backgroundColor,
            textColor,
            borderColor,
            ModifiedBy);

        // Assert
        customization.PrimaryColor.Should().Be(primaryColor);
        customization.SecondaryColor.Should().Be(secondaryColor);
        customization.AccentColor.Should().Be(accentColor);
        customization.SuccessColor.Should().Be(successColor);
        customization.WarningColor.Should().Be(warningColor);
        customization.ErrorColor.Should().Be(errorColor);
        customization.InfoColor.Should().Be(infoColor);
        customization.BackgroundColor.Should().Be(backgroundColor);
        customization.TextColor.Should().Be(textColor);
        customization.BorderColor.Should().Be(borderColor);
        customization.ModifiedBy.Should().Be(ModifiedBy);
        customization.Version.Should().Be(2);
    }

    [Theory]
    [InlineData("#FFF")]
    [InlineData("#FFFFFF")]
    [InlineData("rgb(255, 255, 255)")]
    [InlineData("rgba(255, 255, 255, 0.5)")]
    [InlineData("hsl(0, 100%, 50%)")]
    [InlineData("hsla(0, 100%, 50%, 0.5)")]
    public void UpdateColors_WithValidColorFormats_ShouldAcceptAllFormats(string colorFormat)
    {
        // Arrange
        var customization = CreateCustomization();

        // Act
        customization.UpdateColors(
            colorFormat,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            ModifiedBy);

        // Assert
        customization.PrimaryColor.Should().Be(colorFormat);
    }

    [Theory]
    [InlineData("invalid")]
    [InlineData("#GGG")]
    [InlineData("#GGGGGG")]
    [InlineData("notacolor")]
    [InlineData("123456")]
    public void UpdateColors_WithInvalidPrimaryColor_ShouldThrowArgumentException(string invalidColor)
    {
        // Arrange
        var customization = CreateCustomization();

        // Act
        var action = () => customization.UpdateColors(
            invalidColor,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            ModifiedBy);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Invalid primary color format*")
            .WithParameterName("primaryColor");
    }

    [Fact]
    public void UpdateTypography_ShouldUpdateAllTypographyProperties()
    {
        // Arrange
        var customization = CreateCustomization();
        var primaryFont = "Roboto";
        var secondaryFont = "Open Sans";
        var fontSizeBase = "16px";
        var lineHeight = "1.5";
        var headerFont = "Montserrat";
        var monospaceFont = "Courier New";

        // Act
        customization.UpdateTypography(
            primaryFont,
            secondaryFont,
            fontSizeBase,
            lineHeight,
            headerFont,
            monospaceFont,
            ModifiedBy);

        // Assert
        customization.PrimaryFont.Should().Be(primaryFont);
        customization.SecondaryFont.Should().Be(secondaryFont);
        customization.FontSizeBase.Should().Be(fontSizeBase);
        customization.LineHeight.Should().Be(lineHeight);
        customization.HeaderFont.Should().Be(headerFont);
        customization.MonospaceFont.Should().Be(monospaceFont);
        customization.ModifiedBy.Should().Be(ModifiedBy);
        customization.Version.Should().Be(2);
    }

    [Fact]
    public void UpdateLayout_ShouldUpdateAllLayoutProperties()
    {
        // Arrange
        var customization = CreateCustomization();
        var sidebarPosition = "right";
        var sidebarCollapsed = true;
        var headerStyle = "static";
        var footerStyle = "fixed";
        var layoutMode = "boxed";
        var menuStyle = "horizontal";
        var showBreadcrumb = false;
        var showFooter = false;

        // Act
        customization.UpdateLayout(
            sidebarPosition,
            sidebarCollapsed,
            headerStyle,
            footerStyle,
            layoutMode,
            menuStyle,
            showBreadcrumb,
            showFooter,
            ModifiedBy);

        // Assert
        customization.SidebarPosition.Should().Be(sidebarPosition);
        customization.SidebarCollapsed.Should().Be(sidebarCollapsed);
        customization.HeaderStyle.Should().Be(headerStyle);
        customization.FooterStyle.Should().Be(footerStyle);
        customization.LayoutMode.Should().Be(layoutMode);
        customization.MenuStyle.Should().Be(menuStyle);
        customization.ShowBreadcrumb.Should().Be(showBreadcrumb);
        customization.ShowFooter.Should().Be(showFooter);
        customization.ModifiedBy.Should().Be(ModifiedBy);
        customization.Version.Should().Be(2);
    }

    [Fact]
    public void UpdateTheme_ShouldUpdateAllThemeProperties()
    {
        // Arrange
        var customization = CreateCustomization();
        var themeMode = "dark";
        var themePreset = "custom";
        var customCss = ".custom { color: red; }";
        var customJavaScript = "console.log('Custom JS');";
        var customHtml = "<div>Custom HTML</div>";

        // Act
        customization.UpdateTheme(
            themeMode,
            themePreset,
            customCss,
            customJavaScript,
            customHtml,
            ModifiedBy);

        // Assert
        customization.ThemeMode.Should().Be(themeMode);
        customization.ThemePreset.Should().Be(themePreset);
        customization.CustomCss.Should().Be(customCss);
        customization.CustomJavaScript.Should().Be(customJavaScript);
        customization.CustomHtml.Should().Be(customHtml);
        customization.ModifiedBy.Should().Be(ModifiedBy);
        customization.Version.Should().Be(2);
    }

    [Fact]
    public void UpdateLoginPage_ShouldUpdateAllLoginPageProperties()
    {
        // Arrange
        var customization = CreateCustomization();
        var loginBackgroundUrl = "https://example.com/bg.jpg";
        var loginBackgroundColor = "#F0F0F0";
        var loginLogoUrl = "https://example.com/login-logo.png";
        var loginTitle = "Welcome Back";
        var loginSubtitle = "Sign in to continue";
        var loginFooterText = "© 2024 Test Company";
        var showLoginSocialButtons = true;
        var showLoginRememberMe = false;
        var showLoginForgotPassword = false;

        // Act
        customization.UpdateLoginPage(
            loginBackgroundUrl,
            loginBackgroundColor,
            loginLogoUrl,
            loginTitle,
            loginSubtitle,
            loginFooterText,
            showLoginSocialButtons,
            showLoginRememberMe,
            showLoginForgotPassword,
            ModifiedBy);

        // Assert
        customization.LoginBackgroundUrl.Should().Be(loginBackgroundUrl);
        customization.LoginBackgroundColor.Should().Be(loginBackgroundColor);
        customization.LoginLogoUrl.Should().Be(loginLogoUrl);
        customization.LoginTitle.Should().Be(loginTitle);
        customization.LoginSubtitle.Should().Be(loginSubtitle);
        customization.LoginFooterText.Should().Be(loginFooterText);
        customization.ShowLoginSocialButtons.Should().Be(showLoginSocialButtons);
        customization.ShowLoginRememberMe.Should().Be(showLoginRememberMe);
        customization.ShowLoginForgotPassword.Should().Be(showLoginForgotPassword);
        customization.ModifiedBy.Should().Be(ModifiedBy);
        customization.Version.Should().Be(2);
    }

    [Fact]
    public void UpdateEmailTemplates_ShouldUpdateAllEmailTemplateProperties()
    {
        // Arrange
        var customization = CreateCustomization();
        var emailHeaderHtml = "<div>Email Header</div>";
        var emailFooterHtml = "<div>Email Footer</div>";
        var emailLogoUrl = "https://example.com/email-logo.png";
        var emailPrimaryColor = "#007BFF";
        var emailFromName = "Test Company";
        var emailReplyTo = "noreply@test.com";
        var emailSignature = "Best regards,\nThe Team";

        // Act
        customization.UpdateEmailTemplates(
            emailHeaderHtml,
            emailFooterHtml,
            emailLogoUrl,
            emailPrimaryColor,
            emailFromName,
            emailReplyTo,
            emailSignature,
            ModifiedBy);

        // Assert
        customization.EmailHeaderHtml.Should().Be(emailHeaderHtml);
        customization.EmailFooterHtml.Should().Be(emailFooterHtml);
        customization.EmailLogoUrl.Should().Be(emailLogoUrl);
        customization.EmailPrimaryColor.Should().Be(emailPrimaryColor);
        customization.EmailFromName.Should().Be(emailFromName);
        customization.EmailReplyTo.Should().Be(emailReplyTo);
        customization.EmailSignature.Should().Be(emailSignature);
        customization.ModifiedBy.Should().Be(ModifiedBy);
        customization.Version.Should().Be(2);
    }

    [Fact]
    public void UpdateDashboard_ShouldUpdateAllDashboardProperties()
    {
        // Arrange
        var customization = CreateCustomization();
        var dashboardLayout = "[{\"widget\":\"stats\",\"position\":\"top\"}]";
        var defaultWidgets = "[\"widget1\",\"widget2\",\"widget3\"]";
        var showDashboardStats = false;
        var showDashboardCharts = false;
        var showDashboardActivities = false;
        var showDashboardNotifications = false;
        var dashboardWelcomeMessage = "Welcome to your dashboard!";

        // Act
        customization.UpdateDashboard(
            dashboardLayout,
            defaultWidgets,
            showDashboardStats,
            showDashboardCharts,
            showDashboardActivities,
            showDashboardNotifications,
            dashboardWelcomeMessage,
            ModifiedBy);

        // Assert
        customization.DashboardLayout.Should().Be(dashboardLayout);
        customization.DefaultWidgets.Should().Be(defaultWidgets);
        customization.ShowDashboardStats.Should().Be(showDashboardStats);
        customization.ShowDashboardCharts.Should().Be(showDashboardCharts);
        customization.ShowDashboardActivities.Should().Be(showDashboardActivities);
        customization.ShowDashboardNotifications.Should().Be(showDashboardNotifications);
        customization.DashboardWelcomeMessage.Should().Be(dashboardWelcomeMessage);
        customization.ModifiedBy.Should().Be(ModifiedBy);
        customization.Version.Should().Be(2);
    }

    [Fact]
    public void UpdateLocalization_ShouldUpdateAllLocalizationProperties()
    {
        // Arrange
        var customization = CreateCustomization();
        var defaultLanguage = "en-US";
        var defaultCurrency = "USD";
        var defaultTimezone = "America/New_York";
        var dateFormat = "MM/dd/yyyy";
        var timeFormat = "h:mm a";
        var numberFormat = "#,###.##";
        var use24HourTime = false;
        var firstDayOfWeek = "Sunday";

        // Act
        customization.UpdateLocalization(
            defaultLanguage,
            defaultCurrency,
            defaultTimezone,
            dateFormat,
            timeFormat,
            numberFormat,
            use24HourTime,
            firstDayOfWeek,
            ModifiedBy);

        // Assert
        customization.DefaultLanguage.Should().Be(defaultLanguage);
        customization.DefaultCurrency.Should().Be(defaultCurrency);
        customization.DefaultTimezone.Should().Be(defaultTimezone);
        customization.DateFormat.Should().Be(dateFormat);
        customization.TimeFormat.Should().Be(timeFormat);
        customization.NumberFormat.Should().Be(numberFormat);
        customization.Use24HourTime.Should().Be(use24HourTime);
        customization.FirstDayOfWeek.Should().Be(firstDayOfWeek);
        customization.ModifiedBy.Should().Be(ModifiedBy);
        customization.Version.Should().Be(2);
    }

    [Fact]
    public void UpdateFeatureToggles_ShouldUpdateAllFeatureToggleProperties()
    {
        // Arrange
        var customization = CreateCustomization();
        var enableDarkMode = false;
        var enableMultiLanguage = false;
        var enableNotifications = false;
        var enableChat = true;
        var enableSearch = false;
        var enableHelp = false;
        var enableProfile = false;
        var enableSettings = false;

        // Act
        customization.UpdateFeatureToggles(
            enableDarkMode,
            enableMultiLanguage,
            enableNotifications,
            enableChat,
            enableSearch,
            enableHelp,
            enableProfile,
            enableSettings,
            ModifiedBy);

        // Assert
        customization.EnableDarkMode.Should().Be(enableDarkMode);
        customization.EnableMultiLanguage.Should().Be(enableMultiLanguage);
        customization.EnableNotifications.Should().Be(enableNotifications);
        customization.EnableChat.Should().Be(enableChat);
        customization.EnableSearch.Should().Be(enableSearch);
        customization.EnableHelp.Should().Be(enableHelp);
        customization.EnableProfile.Should().Be(enableProfile);
        customization.EnableSettings.Should().Be(enableSettings);
        customization.ModifiedBy.Should().Be(ModifiedBy);
        customization.Version.Should().Be(2);
    }

    [Fact]
    public void UpdateTracking_ShouldUpdateAllTrackingProperties()
    {
        // Arrange
        var customization = CreateCustomization();
        var googleAnalyticsId = "GA-123456789";
        var facebookPixelId = "FB-987654321";
        var intercomAppId = "IC-ABC123";
        var hotjarId = "HJ-XYZ789";
        var customTrackingScripts = "<script>custom tracking</script>";

        // Act
        customization.UpdateTracking(
            googleAnalyticsId,
            facebookPixelId,
            intercomAppId,
            hotjarId,
            customTrackingScripts,
            ModifiedBy);

        // Assert
        customization.GoogleAnalyticsId.Should().Be(googleAnalyticsId);
        customization.FacebookPixelId.Should().Be(facebookPixelId);
        customization.IntercomAppId.Should().Be(intercomAppId);
        customization.HotjarId.Should().Be(hotjarId);
        customization.CustomTrackingScripts.Should().Be(customTrackingScripts);
        customization.ModifiedBy.Should().Be(ModifiedBy);
        customization.Version.Should().Be(2);
    }

    [Fact]
    public void ResetToDefaults_ShouldResetAllCustomizationsToDefaultValues()
    {
        // Arrange
        var customization = CreateCustomization();
        
        // First, set custom values
        customization.UpdateTheme(
            "dark",
            "custom",
            ".custom { color: blue; }",
            "console.log('test');",
            "<div>test</div>",
            ModifiedBy);
        
        customization.UpdateLayout(
            "right",
            true,
            "hidden",
            "hidden",
            "boxed",
            "horizontal",
            false,
            false,
            ModifiedBy);

        // Act
        customization.ResetToDefaults(ModifiedBy);

        // Assert
        customization.ThemeMode.Should().Be("light");
        customization.ThemePreset.Should().Be("default");
        customization.LayoutMode.Should().Be("fluid");
        customization.MenuStyle.Should().Be("vertical");
        customization.SidebarPosition.Should().Be("left");
        customization.HeaderStyle.Should().Be("fixed");
        customization.FooterStyle.Should().Be("static");
        customization.ShowBreadcrumb.Should().BeTrue();
        customization.ShowFooter.Should().BeTrue();
        customization.DefaultLanguage.Should().Be("tr-TR");
        customization.DefaultCurrency.Should().Be("TRY");
        customization.DefaultTimezone.Should().Be("Europe/Istanbul");
        customization.DateFormat.Should().Be("dd/MM/yyyy");
        customization.TimeFormat.Should().Be("HH:mm");
        customization.Use24HourTime.Should().BeTrue();
        customization.FirstDayOfWeek.Should().Be("Monday");
        customization.CustomCss.Should().BeNull();
        customization.CustomJavaScript.Should().BeNull();
        customization.CustomHtml.Should().BeNull();
        customization.ModifiedBy.Should().Be(ModifiedBy);
        customization.Version.Should().Be(4); // 1 (initial) + 1 (theme) + 1 (layout) + 1 (reset)
    }

    [Fact]
    public void VersionIncrement_WithMultipleUpdates_ShouldIncrementCorrectly()
    {
        // Arrange
        var customization = CreateCustomization();
        
        // Act & Assert
        customization.Version.Should().Be(1);
        
        customization.UpdateBranding(null, null, null, null, null, null, ModifiedBy);
        customization.Version.Should().Be(2);
        
        customization.UpdateColors("#000000", null, null, null, null, null, null, null, null, null, ModifiedBy);
        customization.Version.Should().Be(3);
        
        customization.UpdateTypography(null, null, null, null, null, null, ModifiedBy);
        customization.Version.Should().Be(4);
        
        customization.UpdateLayout(null, false, null, null, null, null, true, true, ModifiedBy);
        customization.Version.Should().Be(5);
        
        customization.UpdateTheme(null, null, null, null, null, ModifiedBy);
        customization.Version.Should().Be(6);
        
        customization.UpdateLoginPage(null, null, null, null, null, null, false, true, true, ModifiedBy);
        customization.Version.Should().Be(7);
        
        customization.UpdateEmailTemplates(null, null, null, null, null, null, null, ModifiedBy);
        customization.Version.Should().Be(8);
        
        customization.UpdateDashboard(null, null, true, true, true, true, null, ModifiedBy);
        customization.Version.Should().Be(9);
        
        customization.UpdateLocalization(null, null, null, null, null, null, true, null, ModifiedBy);
        customization.Version.Should().Be(10);
        
        customization.UpdateFeatureToggles(true, true, true, false, true, true, true, true, ModifiedBy);
        customization.Version.Should().Be(11);
        
        customization.UpdateTracking(null, null, null, null, null, ModifiedBy);
        customization.Version.Should().Be(12);
        
        customization.ResetToDefaults(ModifiedBy);
        customization.Version.Should().Be(13);
    }

    [Fact]
    public void CompleteCustomizationWorkflow_ShouldWorkCorrectly()
    {
        // Arrange
        var customization = TenantCustomization.Create(CreatedBy);
        
        // Act & Assert - Initial state
        customization.Version.Should().Be(1);
        customization.ThemeMode.Should().Be("light");
        
        // Set company branding
        customization.UpdateBranding(
            "https://example.com/logo.png",
            "https://example.com/logo-dark.png",
            "https://example.com/favicon.ico",
            "Acme Corporation",
            "ACME",
            "Innovation at its finest",
            ModifiedBy);
        customization.CompanyName.Should().Be("Acme Corporation");
        customization.Version.Should().Be(2);
        
        // Set brand colors
        customization.UpdateColors(
            "#1E88E5", // Primary blue
            "#FFA726", // Secondary orange
            "#7B1FA2", // Accent purple
            "#4CAF50", // Success green
            "#FF9800", // Warning orange
            "#F44336", // Error red
            "#2196F3", // Info blue
            "#FAFAFA", // Background
            "#212121", // Text
            "#E0E0E0", // Border
            ModifiedBy);
        customization.PrimaryColor.Should().Be("#1E88E5");
        customization.Version.Should().Be(3);
        
        // Configure layout
        customization.UpdateLayout(
            "left",
            false,
            "fixed",
            "static",
            "fluid",
            "vertical",
            true,
            true,
            ModifiedBy);
        customization.MenuStyle.Should().Be("vertical");
        customization.Version.Should().Be(4);
        
        // Enable dark mode theme
        customization.UpdateTheme(
            "dark",
            "modern",
            ".custom-header { background: var(--primary-color); }",
            null,
            null,
            ModifiedBy);
        customization.ThemeMode.Should().Be("dark");
        customization.ThemePreset.Should().Be("modern");
        customization.Version.Should().Be(5);
        
        // Configure login page
        customization.UpdateLoginPage(
            "https://example.com/login-bg.jpg",
            "#1E88E5",
            "https://example.com/login-logo.png",
            "Welcome to ACME Portal",
            "Sign in to access your account",
            "© 2024 Acme Corporation. All rights reserved.",
            false,
            true,
            true,
            ModifiedBy);
        customization.LoginTitle.Should().Be("Welcome to ACME Portal");
        customization.Version.Should().Be(6);
        
        // Set localization for US market
        customization.UpdateLocalization(
            "en-US",
            "USD",
            "America/New_York",
            "MM/dd/yyyy",
            "h:mm a",
            "#,###.##",
            false,
            "Sunday",
            ModifiedBy);
        customization.DefaultLanguage.Should().Be("en-US");
        customization.DefaultCurrency.Should().Be("USD");
        customization.Version.Should().Be(7);
        
        // Enable analytics
        customization.UpdateTracking(
            "GA-123456789",
            null,
            null,
            null,
            null,
            ModifiedBy);
        customization.GoogleAnalyticsId.Should().Be("GA-123456789");
        customization.Version.Should().Be(8);
    }

    [Fact]
    public void UpdateWithLongStrings_ShouldAcceptLongValues()
    {
        // Arrange
        var customization = CreateCustomization();
        var longCss = new string('a', 10000) + " { color: red; }";
        var longJs = "console.log('" + new string('b', 10000) + "');";
        var longHtml = "<div>" + new string('c', 10000) + "</div>";
        var longCompanyName = new string('d', 500);
        var longSlogan = new string('e', 1000);

        // Act
        customization.UpdateTheme(
            "light",
            "default",
            longCss,
            longJs,
            longHtml,
            ModifiedBy);
        
        customization.UpdateBranding(
            null,
            null,
            null,
            longCompanyName,
            null,
            longSlogan,
            ModifiedBy);

        // Assert
        customization.CustomCss.Should().Be(longCss);
        customization.CustomJavaScript.Should().Be(longJs);
        customization.CustomHtml.Should().Be(longHtml);
        customization.CompanyName.Should().Be(longCompanyName);
        customization.Slogan.Should().Be(longSlogan);
    }

    [Fact]
    public void UpdateWithJsonStrings_ShouldAcceptJsonValues()
    {
        // Arrange
        var customization = CreateCustomization();
        var dashboardLayout = @"{
            ""widgets"": [
                {""id"": ""stats"", ""position"": ""top"", ""width"": 12},
                {""id"": ""chart"", ""position"": ""middle"", ""width"": 6},
                {""id"": ""activities"", ""position"": ""bottom"", ""width"": 6}
            ]
        }";
        var defaultWidgets = "[\"stats\",\"chart\",\"activities\",\"notifications\"]";
        var customMenuItems = "[{\"label\":\"Custom Page\",\"url\":\"/custom\",\"icon\":\"star\"}]";

        // Act
        customization.UpdateDashboard(
            dashboardLayout,
            defaultWidgets,
            true,
            true,
            true,
            true,
            "Welcome!",
            ModifiedBy);

        // Assert
        customization.DashboardLayout.Should().Be(dashboardLayout);
        customization.DefaultWidgets.Should().Be(defaultWidgets);
    }

    private TenantCustomization CreateCustomization()
    {
        return TenantCustomization.Create(CreatedBy);
    }
}