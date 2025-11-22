using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Persistence.Migrations.Master
{
    /// <inheritdoc />
    public partial class AddTenantManagementAndComplianceEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TenantCompliances",
                schema: "Master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    GDPRCompliant = table.Column<bool>(type: "bit", nullable: false),
                    GDPRConsentDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    GDPRConsentVersion = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    KVKKCompliant = table.Column<bool>(type: "bit", nullable: false),
                    KVKKConsentDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    KVKKConsentVersion = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    DataProtectionOfficer = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    DataProtectionOfficerEmail = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    DataProtectionOfficerPhone = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    DataRetentionPolicy = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    DataRetentionDays = table.Column<int>(type: "int", nullable: false),
                    AutoDeleteExpiredData = table.Column<bool>(type: "bit", nullable: false),
                    LastDataPurgeDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    NextDataPurgeDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DataCategories = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    SensitiveDataTypes = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    AllowDataExport = table.Column<bool>(type: "bit", nullable: false),
                    AllowDataDeletion = table.Column<bool>(type: "bit", nullable: false),
                    AllowDataPortability = table.Column<bool>(type: "bit", nullable: false),
                    RequireConsentForMarketing = table.Column<bool>(type: "bit", nullable: false),
                    RequireConsentForAnalytics = table.Column<bool>(type: "bit", nullable: false),
                    RequireConsentForThirdParty = table.Column<bool>(type: "bit", nullable: false),
                    PrivacyPolicyUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    PrivacyPolicyVersion = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    PrivacyPolicyAcceptedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ISO27001Certified = table.Column<bool>(type: "bit", nullable: false),
                    ISO27001ExpiryDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ISO27001CertificateNumber = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    SOC2Compliant = table.Column<bool>(type: "bit", nullable: false),
                    SOC2AuditDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    SOC2ReportUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    PCIDSSCompliant = table.Column<bool>(type: "bit", nullable: false),
                    PCIDSSLevel = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    PCIDSSValidUntil = table.Column<DateTime>(type: "datetime2", nullable: true),
                    HIPAACompliant = table.Column<bool>(type: "bit", nullable: false),
                    HIPAAAssessmentDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    AuditLogEnabled = table.Column<bool>(type: "bit", nullable: false),
                    AuditLogRetentionDays = table.Column<int>(type: "int", nullable: false),
                    DetailedAuditLog = table.Column<bool>(type: "bit", nullable: false),
                    LastAuditDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    NextAuditDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastAuditReport = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    AuditFrequency = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    ExternalAuditor = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    RoleBasedAccessControl = table.Column<bool>(type: "bit", nullable: false),
                    AttributeBasedAccessControl = table.Column<bool>(type: "bit", nullable: false),
                    RequireMFA = table.Column<bool>(type: "bit", nullable: false),
                    PasswordMinLength = table.Column<int>(type: "int", nullable: false),
                    PasswordRequireUppercase = table.Column<bool>(type: "bit", nullable: false),
                    PasswordRequireLowercase = table.Column<bool>(type: "bit", nullable: false),
                    PasswordRequireNumbers = table.Column<bool>(type: "bit", nullable: false),
                    PasswordRequireSpecialChars = table.Column<bool>(type: "bit", nullable: false),
                    PasswordExpiryDays = table.Column<int>(type: "int", nullable: false),
                    PasswordHistoryCount = table.Column<int>(type: "int", nullable: false),
                    MaxLoginAttempts = table.Column<int>(type: "int", nullable: false),
                    AccountLockoutMinutes = table.Column<int>(type: "int", nullable: false),
                    SessionTimeoutMinutes = table.Column<int>(type: "int", nullable: false),
                    DataEncryptionAtRest = table.Column<bool>(type: "bit", nullable: false),
                    DataEncryptionInTransit = table.Column<bool>(type: "bit", nullable: false),
                    EncryptionAlgorithm = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    EncryptionKeyLength = table.Column<int>(type: "int", nullable: false),
                    LastKeyRotationDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    KeyRotationIntervalDays = table.Column<int>(type: "int", nullable: false),
                    AutoBackupEnabled = table.Column<bool>(type: "bit", nullable: false),
                    BackupFrequency = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    BackupRetentionDays = table.Column<int>(type: "int", nullable: false),
                    BackupEncryption = table.Column<bool>(type: "bit", nullable: false),
                    BackupLocation = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    LastBackupDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastBackupTestDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RecoveryTimeObjectiveHours = table.Column<int>(type: "int", nullable: false),
                    RecoveryPointObjectiveHours = table.Column<int>(type: "int", nullable: false),
                    IncidentResponsePlan = table.Column<bool>(type: "bit", nullable: false),
                    IncidentResponseTeam = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    IncidentResponseProcedure = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    IncidentNotificationHours = table.Column<int>(type: "int", nullable: false),
                    LastIncidentDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    TotalIncidents = table.Column<int>(type: "int", nullable: false),
                    UnresolvedIncidents = table.Column<int>(type: "int", nullable: false),
                    VulnerabilityScanning = table.Column<bool>(type: "bit", nullable: false),
                    ScanFrequency = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    LastScanDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    NextScanDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CriticalVulnerabilities = table.Column<int>(type: "int", nullable: false),
                    HighVulnerabilities = table.Column<int>(type: "int", nullable: false),
                    MediumVulnerabilities = table.Column<int>(type: "int", nullable: false),
                    LowVulnerabilities = table.Column<int>(type: "int", nullable: false),
                    PenetrationTesting = table.Column<bool>(type: "bit", nullable: false),
                    LastPenTestDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ThirdPartyVendors = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    VendorRiskAssessment = table.Column<bool>(type: "bit", nullable: false),
                    LastVendorAuditDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DataProcessingAgreements = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    SubProcessors = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ComplianceScore = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false),
                    LastAssessmentDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    NextAssessmentDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    NonComplianceAreas = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    RemediationPlan = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    RemediationDeadline = table.Column<DateTime>(type: "datetime2", nullable: true),
                    PolicyDocumentsUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ComplianceReportsUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CertificatesUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    DocumentsLastUpdated = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TenantCompliances", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TenantCompliances_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalSchema: "master",
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TenantCustomizations",
                schema: "Master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Theme = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    PrimaryColor = table.Column<string>(type: "nvarchar(7)", maxLength: 7, nullable: false),
                    SecondaryColor = table.Column<string>(type: "nvarchar(7)", maxLength: 7, nullable: false),
                    AccentColor = table.Column<string>(type: "nvarchar(7)", maxLength: 7, nullable: false),
                    BackgroundColor = table.Column<string>(type: "nvarchar(7)", maxLength: 7, nullable: false),
                    TextColor = table.Column<string>(type: "nvarchar(7)", maxLength: 7, nullable: false),
                    FontFamily = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    FontSize = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    DarkModeEnabled = table.Column<bool>(type: "bit", nullable: false),
                    HighContrastMode = table.Column<bool>(type: "bit", nullable: false),
                    LogoUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    LogoDarkUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    FaviconUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CompanyName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Tagline = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    FooterText = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CopyrightText = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    LoginBackgroundUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    LoginBackgroundColor = table.Column<string>(type: "nvarchar(7)", maxLength: 7, nullable: true),
                    LoginLogoUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    LoginTitle = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    LoginSubtitle = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    LoginFooterText = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    ShowLoginSocialButtons = table.Column<bool>(type: "bit", nullable: false),
                    ShowLoginRememberMe = table.Column<bool>(type: "bit", nullable: false),
                    ShowLoginForgotPassword = table.Column<bool>(type: "bit", nullable: false),
                    NavigationStyle = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    NavigationPosition = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    SidebarPosition = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    CollapsedSidebarByDefault = table.Column<bool>(type: "bit", nullable: false),
                    ShowBreadcrumbs = table.Column<bool>(type: "bit", nullable: false),
                    ShowSearchBar = table.Column<bool>(type: "bit", nullable: false),
                    ShowNotificationBell = table.Column<bool>(type: "bit", nullable: false),
                    ShowUserMenu = table.Column<bool>(type: "bit", nullable: false),
                    CustomMenuItems = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    DashboardLayout = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    DefaultWidgets = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    ShowWelcomeMessage = table.Column<bool>(type: "bit", nullable: false),
                    WelcomeMessageTemplate = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    ShowGettingStarted = table.Column<bool>(type: "bit", nullable: false),
                    ShowRecentActivity = table.Column<bool>(type: "bit", nullable: false),
                    ShowStatistics = table.Column<bool>(type: "bit", nullable: false),
                    WelcomeEmailTemplate = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    PasswordResetEmailTemplate = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    InvoiceEmailTemplate = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    NotificationEmailTemplate = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    EmailSignature = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    EmailHeaderHtml = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    EmailFooterHtml = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    UseCustomEmailTemplates = table.Column<bool>(type: "bit", nullable: false),
                    ReportHeaderTemplate = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    ReportFooterTemplate = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    InvoiceTemplate = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    QuotationTemplate = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    PurchaseOrderTemplate = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    ShowLogoOnReports = table.Column<bool>(type: "bit", nullable: false),
                    ShowWatermarkOnReports = table.Column<bool>(type: "bit", nullable: false),
                    WatermarkText = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    CustomCSS = table.Column<string>(type: "nvarchar(max)", maxLength: 8000, nullable: true),
                    CustomJavaScript = table.Column<string>(type: "nvarchar(max)", maxLength: 8000, nullable: true),
                    HeadHtml = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    BodyHtml = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    AllowCustomCode = table.Column<bool>(type: "bit", nullable: false),
                    DefaultLanguage = table.Column<string>(type: "nvarchar(5)", maxLength: 5, nullable: false),
                    SupportedLanguages = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    DateFormat = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    TimeFormat = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    NumberFormat = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    CurrencyPosition = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    Use24HourTime = table.Column<bool>(type: "bit", nullable: false),
                    FirstDayOfWeek = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    ShowHelp = table.Column<bool>(type: "bit", nullable: false),
                    ShowTour = table.Column<bool>(type: "bit", nullable: false),
                    ShowTooltips = table.Column<bool>(type: "bit", nullable: false),
                    ShowKeyboardShortcuts = table.Column<bool>(type: "bit", nullable: false),
                    EnableAnimations = table.Column<bool>(type: "bit", nullable: false),
                    EnableSounds = table.Column<bool>(type: "bit", nullable: false),
                    EnableAutoSave = table.Column<bool>(type: "bit", nullable: false),
                    MobileOptimized = table.Column<bool>(type: "bit", nullable: false),
                    MobileLogoUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    MobileTheme = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    ShowMobileApp = table.Column<bool>(type: "bit", nullable: false),
                    IOSAppUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    AndroidAppUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    LastModifiedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastModifiedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Version = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TenantCustomizations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TenantCustomizations_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalSchema: "master",
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TenantDocuments",
                schema: "Master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DocumentName = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    DocumentNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    DocumentType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Category = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    FileUrl = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    FileName = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    FileExtension = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    FileSizeBytes = table.Column<long>(type: "bigint", nullable: false),
                    MimeType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    FileHash = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    Version = table.Column<int>(type: "int", nullable: false),
                    IsLatestVersion = table.Column<bool>(type: "bit", nullable: false),
                    PreviousVersionId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    VersionNotes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    EffectiveDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ExpiryDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    RequiresRenewal = table.Column<bool>(type: "bit", nullable: false),
                    RenewalNoticeDays = table.Column<int>(type: "int", nullable: true),
                    RenewalNotificationDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    RequiresSignature = table.Column<bool>(type: "bit", nullable: false),
                    IsSigned = table.Column<bool>(type: "bit", nullable: false),
                    SignedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    SignedBy = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    SignatureUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    RequiresApproval = table.Column<bool>(type: "bit", nullable: false),
                    IsApproved = table.Column<bool>(type: "bit", nullable: false),
                    ApprovedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ApprovedBy = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    ApprovalNotes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    AccessLevel = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    IsConfidential = table.Column<bool>(type: "bit", nullable: false),
                    IsPublic = table.Column<bool>(type: "bit", nullable: false),
                    AllowedRoles = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    AllowedUsers = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    RequiresNDA = table.Column<bool>(type: "bit", nullable: false),
                    IsLegalDocument = table.Column<bool>(type: "bit", nullable: false),
                    IsComplianceDocument = table.Column<bool>(type: "bit", nullable: false),
                    ComplianceStandard = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    LegalJurisdiction = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    RetentionPolicy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    RetentionUntil = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CanBeDeleted = table.Column<bool>(type: "bit", nullable: false),
                    Tags = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CustomMetadata = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    Keywords = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Language = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    ParentDocumentId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    RelatedDocumentIds = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    ReplacesDocumentId = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    SendExpiryNotification = table.Column<bool>(type: "bit", nullable: false),
                    SendRenewalNotification = table.Column<bool>(type: "bit", nullable: false),
                    NotificationRecipients = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    LastNotificationSent = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ViewCount = table.Column<int>(type: "int", nullable: false),
                    DownloadCount = table.Column<int>(type: "int", nullable: false),
                    LastViewedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastViewedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    LastDownloadedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastDownloadedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    UploadedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UploadedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ModifiedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ModifiedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ModificationReason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TenantDocuments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TenantDocuments_TenantDocuments_ParentDocumentId",
                        column: x => x.ParentDocumentId,
                        principalSchema: "Master",
                        principalTable: "TenantDocuments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TenantDocuments_TenantDocuments_PreviousVersionId",
                        column: x => x.PreviousVersionId,
                        principalSchema: "Master",
                        principalTable: "TenantDocuments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TenantDocuments_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalSchema: "master",
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TenantNotifications",
                schema: "Master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Type = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Channel = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    IsEnabled = table.Column<bool>(type: "bit", nullable: false),
                    Recipients = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    CCRecipients = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    BCCRecipients = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    SendToAllAdmins = table.Column<bool>(type: "bit", nullable: false),
                    SendToOwner = table.Column<bool>(type: "bit", nullable: false),
                    EmailTemplateId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    SMSTemplateId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Subject = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Body = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    UseDefaultTemplate = table.Column<bool>(type: "bit", nullable: false),
                    Schedule = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    CronExpression = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    TimeOfDay = table.Column<TimeSpan>(type: "time", nullable: true),
                    DayOfWeek = table.Column<int>(type: "int", nullable: true),
                    DayOfMonth = table.Column<int>(type: "int", nullable: true),
                    DelayMinutes = table.Column<int>(type: "int", nullable: false),
                    TriggerConditions = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    ThresholdValue = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    ThresholdUnit = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    MaxPerDay = table.Column<int>(type: "int", nullable: false),
                    MaxPerWeek = table.Column<int>(type: "int", nullable: false),
                    MaxPerMonth = table.Column<int>(type: "int", nullable: false),
                    SentToday = table.Column<int>(type: "int", nullable: false),
                    SentThisWeek = table.Column<int>(type: "int", nullable: false),
                    SentThisMonth = table.Column<int>(type: "int", nullable: false),
                    IsPaused = table.Column<bool>(type: "bit", nullable: false),
                    PausedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    PausedReason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    LastSentAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    NextScheduledAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    TotalSentCount = table.Column<int>(type: "int", nullable: false),
                    FailedCount = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TenantNotifications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TenantNotifications_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalSchema: "master",
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TenantCompliances_ComplianceScore",
                schema: "Master",
                table: "TenantCompliances",
                column: "ComplianceScore");

            migrationBuilder.CreateIndex(
                name: "IX_TenantCompliances_GDPRCompliant",
                schema: "Master",
                table: "TenantCompliances",
                column: "GDPRCompliant");

            migrationBuilder.CreateIndex(
                name: "IX_TenantCompliances_ISO27001Certified",
                schema: "Master",
                table: "TenantCompliances",
                column: "ISO27001Certified");

            migrationBuilder.CreateIndex(
                name: "IX_TenantCompliances_KVKKCompliant",
                schema: "Master",
                table: "TenantCompliances",
                column: "KVKKCompliant");

            migrationBuilder.CreateIndex(
                name: "IX_TenantCompliances_Status",
                schema: "Master",
                table: "TenantCompliances",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_TenantCompliances_TenantId",
                schema: "Master",
                table: "TenantCompliances",
                column: "TenantId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TenantCustomizations_IsActive",
                schema: "Master",
                table: "TenantCustomizations",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_TenantCustomizations_TenantId",
                schema: "Master",
                table: "TenantCustomizations",
                column: "TenantId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TenantCustomizations_Version",
                schema: "Master",
                table: "TenantCustomizations",
                column: "Version");

            migrationBuilder.CreateIndex(
                name: "IX_TenantDocuments_Category",
                schema: "Master",
                table: "TenantDocuments",
                column: "Category");

            migrationBuilder.CreateIndex(
                name: "IX_TenantDocuments_DocumentNumber",
                schema: "Master",
                table: "TenantDocuments",
                column: "DocumentNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TenantDocuments_DocumentType",
                schema: "Master",
                table: "TenantDocuments",
                column: "DocumentType");

            migrationBuilder.CreateIndex(
                name: "IX_TenantDocuments_ExpiryDate",
                schema: "Master",
                table: "TenantDocuments",
                column: "ExpiryDate");

            migrationBuilder.CreateIndex(
                name: "IX_TenantDocuments_IsActive",
                schema: "Master",
                table: "TenantDocuments",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_TenantDocuments_IsLatestVersion",
                schema: "Master",
                table: "TenantDocuments",
                column: "IsLatestVersion");

            migrationBuilder.CreateIndex(
                name: "IX_TenantDocuments_ParentDocumentId",
                schema: "Master",
                table: "TenantDocuments",
                column: "ParentDocumentId");

            migrationBuilder.CreateIndex(
                name: "IX_TenantDocuments_PreviousVersionId",
                schema: "Master",
                table: "TenantDocuments",
                column: "PreviousVersionId");

            migrationBuilder.CreateIndex(
                name: "IX_TenantDocuments_Status",
                schema: "Master",
                table: "TenantDocuments",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_TenantDocuments_TenantId",
                schema: "Master",
                table: "TenantDocuments",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_TenantDocuments_TenantId_Category_Status",
                schema: "Master",
                table: "TenantDocuments",
                columns: new[] { "TenantId", "Category", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_TenantDocuments_TenantId_DocumentType_IsActive",
                schema: "Master",
                table: "TenantDocuments",
                columns: new[] { "TenantId", "DocumentType", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_TenantDocuments_TenantId_IsLatestVersion_IsActive",
                schema: "Master",
                table: "TenantDocuments",
                columns: new[] { "TenantId", "IsLatestVersion", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_TenantNotifications_Channel",
                schema: "Master",
                table: "TenantNotifications",
                column: "Channel");

            migrationBuilder.CreateIndex(
                name: "IX_TenantNotifications_IsEnabled",
                schema: "Master",
                table: "TenantNotifications",
                column: "IsEnabled");

            migrationBuilder.CreateIndex(
                name: "IX_TenantNotifications_TenantId",
                schema: "Master",
                table: "TenantNotifications",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_TenantNotifications_TenantId_Type_IsEnabled",
                schema: "Master",
                table: "TenantNotifications",
                columns: new[] { "TenantId", "Type", "IsEnabled" });

            migrationBuilder.CreateIndex(
                name: "IX_TenantNotifications_Type",
                schema: "Master",
                table: "TenantNotifications",
                column: "Type");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TenantCompliances",
                schema: "Master");

            migrationBuilder.DropTable(
                name: "TenantCustomizations",
                schema: "Master");

            migrationBuilder.DropTable(
                name: "TenantDocuments",
                schema: "Master");

            migrationBuilder.DropTable(
                name: "TenantNotifications",
                schema: "Master");
        }
    }
}
