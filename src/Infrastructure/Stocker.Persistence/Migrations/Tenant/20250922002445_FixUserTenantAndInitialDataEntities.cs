using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Persistence.Migrations.Tenant
{
    /// <inheritdoc />
    public partial class FixUserTenantAndInitialDataEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Roles_TenantId",
                schema: "tenant",
                table: "Roles");

            migrationBuilder.DropIndex(
                name: "IX_Roles_TenantId_Name",
                schema: "tenant",
                table: "Roles");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "tenant",
                table: "Roles");

            migrationBuilder.CreateTable(
                name: "PasswordHistories",
                schema: "tenant",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    Salt = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    PasswordStrength = table.Column<int>(type: "int", nullable: false),
                    MeetsComplexityRequirements = table.Column<bool>(type: "bit", nullable: false),
                    Length = table.Column<int>(type: "int", nullable: false),
                    HasUppercase = table.Column<bool>(type: "bit", nullable: false),
                    HasLowercase = table.Column<bool>(type: "bit", nullable: false),
                    HasNumbers = table.Column<bool>(type: "bit", nullable: false),
                    HasSpecialCharacters = table.Column<bool>(type: "bit", nullable: false),
                    HasSequentialCharacters = table.Column<bool>(type: "bit", nullable: false),
                    HasRepeatingCharacters = table.Column<bool>(type: "bit", nullable: false),
                    ChangedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ChangedBy = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    ChangeReason = table.Column<int>(type: "int", nullable: false),
                    ChangeReasonDetails = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    ChangedFromIP = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    ChangedFromDevice = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    ChangedFromLocation = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    ExpirationDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    WasExpired = table.Column<bool>(type: "bit", nullable: false),
                    DaysUsed = table.Column<int>(type: "int", nullable: false),
                    WasCompromised = table.Column<bool>(type: "bit", nullable: false),
                    CompromisedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CompromiseReason = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    ForcedChange = table.Column<bool>(type: "bit", nullable: false),
                    LastValidatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FailedAttemptCount = table.Column<int>(type: "int", nullable: false),
                    LastFailedAttemptAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PasswordHistories", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TenantCompliances",
                schema: "tenant",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Type = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    Standard = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    Version = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    CertificationDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ExpirationDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CertificationNumber = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    CertifyingBody = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    AuditorName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    AuditorCompany = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    Requirements = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    ImplementedControls = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    PendingControls = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    TotalRequirements = table.Column<int>(type: "int", nullable: false),
                    CompletedRequirements = table.Column<int>(type: "int", nullable: false),
                    ComplianceScore = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    RiskLevel = table.Column<int>(type: "int", nullable: false),
                    RiskAssessment = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    MitigationPlan = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    LastRiskAssessment = table.Column<DateTime>(type: "datetime2", nullable: true),
                    NextRiskAssessment = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastAuditDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    NextAuditDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastAuditType = table.Column<int>(type: "int", nullable: true),
                    LastAuditResult = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    LastAuditFindings = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    CorrectiveActions = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    HasOpenFindings = table.Column<bool>(type: "bit", nullable: false),
                    OpenFindingsCount = table.Column<int>(type: "int", nullable: false),
                    PolicyDocumentUrl = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    EvidenceDocumentUrl = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    CertificateUrl = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    AuditReportUrl = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    RelatedDocuments = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    NotifyOnExpiration = table.Column<bool>(type: "bit", nullable: false),
                    DaysBeforeExpirationNotify = table.Column<int>(type: "int", nullable: false),
                    NotifyOnAudit = table.Column<bool>(type: "bit", nullable: false),
                    DaysBeforeAuditNotify = table.Column<int>(type: "int", nullable: false),
                    NotificationEmails = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    LastNotificationSent = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ApplicableRegions = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    LegalJurisdiction = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    DataResidencyRequirements = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    RequiresDataLocalization = table.Column<bool>(type: "bit", nullable: false),
                    ComplianceCost = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    AnnualMaintenanceCost = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    AssignedTeam = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    ResponsiblePerson = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    ResponsibleEmail = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsMandatory = table.Column<bool>(type: "bit", nullable: false),
                    SuspendedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    SuspensionReason = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    ActivatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    ModifiedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ModifiedBy = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    ReviewedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ReviewedBy = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TenantCompliances", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TenantCustomizations",
                schema: "tenant",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LogoUrl = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    LogoDarkUrl = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    FaviconUrl = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    CompanyName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    BrandName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    Slogan = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    PrimaryColor = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    SecondaryColor = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    AccentColor = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    SuccessColor = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    WarningColor = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    ErrorColor = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    InfoColor = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    BackgroundColor = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    TextColor = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    BorderColor = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    PrimaryFont = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    SecondaryFont = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    FontSizeBase = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    LineHeight = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    HeaderFont = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    MonospaceFont = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    SidebarPosition = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    SidebarCollapsed = table.Column<bool>(type: "bit", nullable: false),
                    HeaderStyle = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    FooterStyle = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    LayoutMode = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    MenuStyle = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    ShowBreadcrumb = table.Column<bool>(type: "bit", nullable: false),
                    ShowFooter = table.Column<bool>(type: "bit", nullable: false),
                    ThemeMode = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    ThemePreset = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    CustomCss = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    CustomJavaScript = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    CustomHtml = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    LoginBackgroundUrl = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    LoginBackgroundColor = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    LoginLogoUrl = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    LoginTitle = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    LoginSubtitle = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    LoginFooterText = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    ShowLoginSocialButtons = table.Column<bool>(type: "bit", nullable: false),
                    ShowLoginRememberMe = table.Column<bool>(type: "bit", nullable: false),
                    ShowLoginForgotPassword = table.Column<bool>(type: "bit", nullable: false),
                    EmailHeaderHtml = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    EmailFooterHtml = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    EmailLogoUrl = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    EmailPrimaryColor = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    EmailFromName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    EmailReplyTo = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    EmailSignature = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    DashboardLayout = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    DefaultWidgets = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    ShowDashboardStats = table.Column<bool>(type: "bit", nullable: false),
                    ShowDashboardCharts = table.Column<bool>(type: "bit", nullable: false),
                    ShowDashboardActivities = table.Column<bool>(type: "bit", nullable: false),
                    ShowDashboardNotifications = table.Column<bool>(type: "bit", nullable: false),
                    DashboardWelcomeMessage = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    ReportHeaderTemplate = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    ReportFooterTemplate = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    ReportLogoUrl = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    ReportWatermarkUrl = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    ShowReportPageNumbers = table.Column<bool>(type: "bit", nullable: false),
                    ShowReportGeneratedDate = table.Column<bool>(type: "bit", nullable: false),
                    InvoiceTemplate = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    InvoiceLogoUrl = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    InvoiceHeaderText = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    InvoiceFooterText = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    InvoiceTermsAndConditions = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    InvoicePaymentInstructions = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    DefaultLanguage = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    DefaultCurrency = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    DefaultTimezone = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    DateFormat = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    TimeFormat = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    NumberFormat = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    Use24HourTime = table.Column<bool>(type: "bit", nullable: false),
                    FirstDayOfWeek = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    EnableDarkMode = table.Column<bool>(type: "bit", nullable: false),
                    EnableMultiLanguage = table.Column<bool>(type: "bit", nullable: false),
                    EnableNotifications = table.Column<bool>(type: "bit", nullable: false),
                    EnableChat = table.Column<bool>(type: "bit", nullable: false),
                    EnableSearch = table.Column<bool>(type: "bit", nullable: false),
                    EnableHelp = table.Column<bool>(type: "bit", nullable: false),
                    EnableProfile = table.Column<bool>(type: "bit", nullable: false),
                    EnableSettings = table.Column<bool>(type: "bit", nullable: false),
                    CustomMenuItems = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    CustomShortcuts = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    CustomActions = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    MetaTitle = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    MetaDescription = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    MetaKeywords = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    OpenGraphImage = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    TwitterCard = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    CustomDomain = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    GoogleAnalyticsId = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    FacebookPixelId = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    IntercomAppId = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    HotjarId = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    CustomTrackingScripts = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    ModifiedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ModifiedBy = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    Version = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TenantCustomizations", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TenantDocuments",
                schema: "tenant",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DocumentName = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    DocumentNumber = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    DocumentType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Category = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    FileUrl = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    FileName = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    FileExtension = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    FileSizeBytes = table.Column<long>(type: "bigint", nullable: false),
                    MimeType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    FileHash = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: true),
                    Version = table.Column<int>(type: "int", nullable: false, defaultValue: 1),
                    IsLatestVersion = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    PreviousVersionId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    VersionNotes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    EffectiveDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ExpiryDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    RequiresRenewal = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    RenewalNoticeDays = table.Column<int>(type: "int", nullable: true),
                    RenewalNotificationDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    RequiresSignature = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    IsSigned = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    SignedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    SignedBy = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    SignatureUrl = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    RequiresApproval = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    IsApproved = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    ApprovedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ApprovedBy = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    ApprovalNotes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    AccessLevel = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    IsConfidential = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    IsPublic = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    AllowedRoles = table.Column<string>(type: "nvarchar(max)", maxLength: 256, nullable: true),
                    AllowedUsers = table.Column<string>(type: "nvarchar(max)", maxLength: 256, nullable: true),
                    RequiresNDA = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    IsLegalDocument = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    IsComplianceDocument = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    ComplianceStandard = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    LegalJurisdiction = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    RetentionPolicy = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    RetentionUntil = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CanBeDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    Tags = table.Column<string>(type: "nvarchar(max)", maxLength: 256, nullable: true),
                    CustomMetadata = table.Column<string>(type: "nvarchar(max)", maxLength: 256, nullable: true),
                    Keywords = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Language = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    ParentDocumentId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    RelatedDocumentIds = table.Column<string>(type: "nvarchar(max)", maxLength: 256, nullable: true),
                    ReplacesDocumentId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    SendExpiryNotification = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    SendRenewalNotification = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    NotificationRecipients = table.Column<string>(type: "nvarchar(max)", maxLength: 256, nullable: true),
                    LastNotificationSent = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ViewCount = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    DownloadCount = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    LastViewedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastViewedBy = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    LastDownloadedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastDownloadedBy = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    UploadedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UploadedBy = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ModifiedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ModifiedBy = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    ModificationReason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TenantDocuments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TenantDocuments_TenantDocuments_ParentDocumentId",
                        column: x => x.ParentDocumentId,
                        principalSchema: "tenant",
                        principalTable: "TenantDocuments",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_TenantDocuments_TenantDocuments_PreviousVersionId",
                        column: x => x.PreviousVersionId,
                        principalSchema: "tenant",
                        principalTable: "TenantDocuments",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "TenantFeatures",
                schema: "tenant",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FeatureKey = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    Type = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    Category = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    Module = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    Icon = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false),
                    IsCore = table.Column<bool>(type: "bit", nullable: false),
                    IsBeta = table.Column<bool>(type: "bit", nullable: false),
                    IsNew = table.Column<bool>(type: "bit", nullable: false),
                    IsEnabled = table.Column<bool>(type: "bit", nullable: false),
                    RequiresSubscription = table.Column<bool>(type: "bit", nullable: false),
                    RequiredPlan = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    RequiredRole = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    RequiredPermission = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    MinimumUserCount = table.Column<int>(type: "int", nullable: true),
                    MaximumUserCount = table.Column<int>(type: "int", nullable: true),
                    Configuration = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    DefaultSettings = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    CurrentSettings = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    Metadata = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    HasUsageLimit = table.Column<bool>(type: "bit", nullable: false),
                    UsageLimit = table.Column<int>(type: "int", nullable: true),
                    CurrentUsage = table.Column<int>(type: "int", nullable: false),
                    UsagePeriod = table.Column<int>(type: "int", nullable: true),
                    UsageResetDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastUsedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsTrialAvailable = table.Column<bool>(type: "bit", nullable: false),
                    TrialDays = table.Column<int>(type: "int", nullable: true),
                    TrialStartDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    TrialEndDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsInTrial = table.Column<bool>(type: "bit", nullable: false),
                    TrialUsed = table.Column<bool>(type: "bit", nullable: false),
                    IsPaid = table.Column<bool>(type: "bit", nullable: false),
                    BasePrice = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    PricingModel = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    PricePerUnit = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    Currency = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    BillingCycle = table.Column<int>(type: "int", nullable: true),
                    RequiredFeatures = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    ConflictingFeatures = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    IncludedFeatures = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    ActivatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ActivatedBy = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    DeactivatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeactivatedBy = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    DeactivationReason = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    HasExpiration = table.Column<bool>(type: "bit", nullable: false),
                    ExpirationDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    AutoRenew = table.Column<bool>(type: "bit", nullable: false),
                    RenewalNoticeDays = table.Column<int>(type: "int", nullable: true),
                    LastRenewalDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    NextRenewalDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ActivationCount = table.Column<int>(type: "int", nullable: false),
                    DeactivationCount = table.Column<int>(type: "int", nullable: false),
                    TotalUsageCount = table.Column<int>(type: "int", nullable: false),
                    AverageUsagePerDay = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    PeakUsage = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    PeakUsageDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    SendActivationNotification = table.Column<bool>(type: "bit", nullable: false),
                    SendExpirationNotification = table.Column<bool>(type: "bit", nullable: false),
                    SendUsageLimitNotification = table.Column<bool>(type: "bit", nullable: false),
                    NotificationEmails = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    LastNotificationSent = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    ModifiedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ModifiedBy = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    Version = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TenantFeatures", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TenantIntegrations",
                schema: "tenant",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Type = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Configuration = table.Column<string>(type: "nvarchar(max)", maxLength: 256, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    IsConnected = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    LastSyncAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastSyncStatus = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    LastError = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    WebhookUrl = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    ApiKey = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    RefreshToken = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    TokenExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TenantIntegrations", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TenantOnboardings",
                schema: "tenant",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    Type = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    TargetUserId = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    TargetUserEmail = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    TargetUserName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    TargetRole = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    TargetDepartment = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    TotalSteps = table.Column<int>(type: "int", nullable: false),
                    CompletedSteps = table.Column<int>(type: "int", nullable: false),
                    SkippedSteps = table.Column<int>(type: "int", nullable: false),
                    ProgressPercentage = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    EstimatedDuration = table.Column<TimeSpan>(type: "time", nullable: false),
                    ActualDuration = table.Column<TimeSpan>(type: "time", nullable: false),
                    StartedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DueDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastActivityAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    PausedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ResumedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsRequired = table.Column<bool>(type: "bit", nullable: false),
                    AllowSkip = table.Column<bool>(type: "bit", nullable: false),
                    SendReminders = table.Column<bool>(type: "bit", nullable: false),
                    ReminderFrequencyDays = table.Column<int>(type: "int", nullable: false),
                    RequireManagerApproval = table.Column<bool>(type: "bit", nullable: false),
                    ManagerId = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    ManagerEmail = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    CompletionCertificateUrl = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    CompletionScore = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    CompletionFeedback = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    SatisfactionRating = table.Column<int>(type: "int", nullable: true),
                    LoginCount = table.Column<int>(type: "int", nullable: false),
                    FirstLoginAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastLoginAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    HelpRequestCount = table.Column<int>(type: "int", nullable: false),
                    MostVisitedSection = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    DeviceInfo = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    ModifiedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ModifiedBy = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TenantOnboardings", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TenantWebhooks",
                schema: "tenant",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    Url = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    Secret = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    EventType = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    HttpMethod = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    ContentType = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    Headers = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    TimeoutSeconds = table.Column<int>(type: "int", nullable: false),
                    MaxRetries = table.Column<int>(type: "int", nullable: false),
                    RetryDelaySeconds = table.Column<int>(type: "int", nullable: false),
                    AuthType = table.Column<int>(type: "int", nullable: false),
                    AuthToken = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    AuthHeaderName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    BasicAuthUsername = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    BasicAuthPassword = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    EventFilters = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    PayloadTemplate = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    OnlyOnSuccess = table.Column<bool>(type: "bit", nullable: false),
                    IncludePayload = table.Column<bool>(type: "bit", nullable: false),
                    RateLimitPerMinute = table.Column<int>(type: "int", nullable: true),
                    LastTriggeredAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    TriggerCount = table.Column<int>(type: "int", nullable: false),
                    SuccessCount = table.Column<int>(type: "int", nullable: false),
                    FailureCount = table.Column<int>(type: "int", nullable: false),
                    LastSuccessAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastFailureAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastError = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    AverageResponseTime = table.Column<double>(type: "float", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    ModifiedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ModifiedBy = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    DeactivatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeactivatedBy = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TenantWebhooks", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "UserTenants",
                schema: "tenant",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Username = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    FirstName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    LastName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    PhoneNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    UserType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    RoleId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    RoleName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Permissions = table.Column<string>(type: "nvarchar(max)", maxLength: 256, nullable: true),
                    CustomPermissions = table.Column<string>(type: "nvarchar(max)", maxLength: 256, nullable: true),
                    RestrictedPermissions = table.Column<string>(type: "nvarchar(max)", maxLength: 256, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    IsDefault = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    IsLocked = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    LockedUntil = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LockReason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    FailedAccessAttempts = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    LastFailedAccess = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DepartmentId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DepartmentName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    BranchId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    BranchName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    ManagerId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ManagerName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    WorkStartTime = table.Column<TimeSpan>(type: "time", nullable: true),
                    WorkEndTime = table.Column<TimeSpan>(type: "time", nullable: true),
                    WorkingDays = table.Column<string>(type: "nvarchar(max)", maxLength: 256, nullable: true),
                    TimeZone = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    AllowFlexibleHours = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    AllowRemoteWork = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    AllowedIpAddresses = table.Column<string>(type: "nvarchar(max)", maxLength: 256, nullable: true),
                    BlockedIpAddresses = table.Column<string>(type: "nvarchar(max)", maxLength: 256, nullable: true),
                    RequireTwoFactor = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    RequirePasswordChange = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    PasswordExpiryDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CanAccessApi = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    CanAccessMobile = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    CanAccessWeb = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    CurrentSessionId = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    LastLoginAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastActivityAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastLoginIp = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    LastLoginDevice = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    TotalLoginCount = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    IsOnline = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    Language = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    DateFormat = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    NumberFormat = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Theme = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    DashboardLayout = table.Column<string>(type: "nvarchar(max)", maxLength: 256, nullable: true),
                    NotificationPreferences = table.Column<string>(type: "nvarchar(max)", maxLength: 256, nullable: true),
                    EmailNotifications = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    SmsNotifications = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    PushNotifications = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    AssignedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AssignedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ModifiedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ModifiedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    DeactivatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeactivatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    DeactivationReason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    SalesQuota = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    AchievedSales = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    TasksAssigned = table.Column<int>(type: "int", nullable: true),
                    TasksCompleted = table.Column<int>(type: "int", nullable: true),
                    PerformanceScore = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: true),
                    LastPerformanceReview = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserTenants", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserTenants_Branches_BranchId",
                        column: x => x.BranchId,
                        principalSchema: "tenant",
                        principalTable: "Branches",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_UserTenants_Departments_DepartmentId",
                        column: x => x.DepartmentId,
                        principalSchema: "tenant",
                        principalTable: "Departments",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_UserTenants_Roles_RoleId",
                        column: x => x.RoleId,
                        principalSchema: "tenant",
                        principalTable: "Roles",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "OnboardingSteps",
                schema: "tenant",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    OnboardingId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Order = table.Column<int>(type: "int", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    Type = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    IsRequired = table.Column<bool>(type: "bit", nullable: false),
                    ContentUrl = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    ContentHtml = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    VideoUrl = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    DocumentUrl = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    FormData = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    ActionUrl = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    EstimatedDurationMinutes = table.Column<int>(type: "int", nullable: false),
                    ActualDurationMinutes = table.Column<int>(type: "int", nullable: false),
                    StartedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    SkippedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    SkipReason = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    ValidationRules = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    RequiresVerification = table.Column<bool>(type: "bit", nullable: false),
                    IsVerified = table.Column<bool>(type: "bit", nullable: false),
                    VerifiedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    VerifiedBy = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    UserResponse = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    UserFeedback = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    UserRating = table.Column<int>(type: "int", nullable: true),
                    CompletedBy = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    SkippedBy = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OnboardingSteps", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OnboardingSteps_TenantOnboardings_OnboardingId",
                        column: x => x.OnboardingId,
                        principalSchema: "tenant",
                        principalTable: "TenantOnboardings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "OnboardingTasks",
                schema: "tenant",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    OnboardingId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false),
                    Priority = table.Column<int>(type: "int", nullable: false),
                    AssignedTo = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    AssignedBy = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    AssignedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DueDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    StartedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    CompletionNotes = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    Attachments = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OnboardingTasks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OnboardingTasks_TenantOnboardings_OnboardingId",
                        column: x => x.OnboardingId,
                        principalSchema: "tenant",
                        principalTable: "TenantOnboardings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Roles_Name",
                schema: "tenant",
                table: "Roles",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OnboardingSteps_OnboardingId",
                schema: "tenant",
                table: "OnboardingSteps",
                column: "OnboardingId");

            migrationBuilder.CreateIndex(
                name: "IX_OnboardingTasks_OnboardingId",
                schema: "tenant",
                table: "OnboardingTasks",
                column: "OnboardingId");

            migrationBuilder.CreateIndex(
                name: "IX_TenantDocuments_Category",
                schema: "tenant",
                table: "TenantDocuments",
                column: "Category");

            migrationBuilder.CreateIndex(
                name: "IX_TenantDocuments_DocumentNumber",
                schema: "tenant",
                table: "TenantDocuments",
                column: "DocumentNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TenantDocuments_DocumentType",
                schema: "tenant",
                table: "TenantDocuments",
                column: "DocumentType");

            migrationBuilder.CreateIndex(
                name: "IX_TenantDocuments_ExpiryDate",
                schema: "tenant",
                table: "TenantDocuments",
                column: "ExpiryDate");

            migrationBuilder.CreateIndex(
                name: "IX_TenantDocuments_IsActive",
                schema: "tenant",
                table: "TenantDocuments",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_TenantDocuments_ParentDocumentId",
                schema: "tenant",
                table: "TenantDocuments",
                column: "ParentDocumentId");

            migrationBuilder.CreateIndex(
                name: "IX_TenantDocuments_PreviousVersionId",
                schema: "tenant",
                table: "TenantDocuments",
                column: "PreviousVersionId");

            migrationBuilder.CreateIndex(
                name: "IX_TenantDocuments_Status",
                schema: "tenant",
                table: "TenantDocuments",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_TenantDocuments_UploadedAt",
                schema: "tenant",
                table: "TenantDocuments",
                column: "UploadedAt");

            migrationBuilder.CreateIndex(
                name: "IX_TenantIntegrations_IsActive",
                schema: "tenant",
                table: "TenantIntegrations",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_TenantIntegrations_IsConnected",
                schema: "tenant",
                table: "TenantIntegrations",
                column: "IsConnected");

            migrationBuilder.CreateIndex(
                name: "IX_TenantIntegrations_Name",
                schema: "tenant",
                table: "TenantIntegrations",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_TenantIntegrations_Type",
                schema: "tenant",
                table: "TenantIntegrations",
                column: "Type");

            migrationBuilder.CreateIndex(
                name: "IX_UserTenants_BranchId",
                schema: "tenant",
                table: "UserTenants",
                column: "BranchId");

            migrationBuilder.CreateIndex(
                name: "IX_UserTenants_DepartmentId",
                schema: "tenant",
                table: "UserTenants",
                column: "DepartmentId");

            migrationBuilder.CreateIndex(
                name: "IX_UserTenants_Email",
                schema: "tenant",
                table: "UserTenants",
                column: "Email");

            migrationBuilder.CreateIndex(
                name: "IX_UserTenants_IsActive",
                schema: "tenant",
                table: "UserTenants",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_UserTenants_RoleId",
                schema: "tenant",
                table: "UserTenants",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "IX_UserTenants_UserId",
                schema: "tenant",
                table: "UserTenants",
                column: "UserId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserTenants_Username",
                schema: "tenant",
                table: "UserTenants",
                column: "Username");

            migrationBuilder.CreateIndex(
                name: "IX_UserTenants_UserType",
                schema: "tenant",
                table: "UserTenants",
                column: "UserType");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "OnboardingSteps",
                schema: "tenant");

            migrationBuilder.DropTable(
                name: "OnboardingTasks",
                schema: "tenant");

            migrationBuilder.DropTable(
                name: "PasswordHistories",
                schema: "tenant");

            migrationBuilder.DropTable(
                name: "TenantCompliances",
                schema: "tenant");

            migrationBuilder.DropTable(
                name: "TenantCustomizations",
                schema: "tenant");

            migrationBuilder.DropTable(
                name: "TenantDocuments",
                schema: "tenant");

            migrationBuilder.DropTable(
                name: "TenantFeatures",
                schema: "tenant");

            migrationBuilder.DropTable(
                name: "TenantIntegrations",
                schema: "tenant");

            migrationBuilder.DropTable(
                name: "TenantWebhooks",
                schema: "tenant");

            migrationBuilder.DropTable(
                name: "UserTenants",
                schema: "tenant");

            migrationBuilder.DropTable(
                name: "TenantOnboardings",
                schema: "tenant");

            migrationBuilder.DropIndex(
                name: "IX_Roles_Name",
                schema: "tenant",
                table: "Roles");

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "tenant",
                table: "Roles",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_Roles_TenantId",
                schema: "tenant",
                table: "Roles",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Roles_TenantId_Name",
                schema: "tenant",
                table: "Roles",
                columns: new[] { "TenantId", "Name" },
                unique: true);
        }
    }
}
