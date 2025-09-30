using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Persistence.Migrations.Master
{
    /// <inheritdoc />
    public partial class CleanupMasterDbAfterMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "OnboardingSteps",
                schema: "Master");

            migrationBuilder.DropTable(
                name: "OnboardingTasks",
                schema: "Master");

            migrationBuilder.DropTable(
                name: "TenantActivityLogs",
                schema: "Master");

            migrationBuilder.DropTable(
                name: "TenantApiKeys",
                schema: "Master");

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
                name: "TenantFeatures",
                schema: "master");

            migrationBuilder.DropTable(
                name: "TenantInitialData",
                schema: "Master");

            migrationBuilder.DropTable(
                name: "TenantIntegrations",
                schema: "Master");

            migrationBuilder.DropTable(
                name: "TenantNotifications",
                schema: "Master");

            migrationBuilder.DropTable(
                name: "TenantSecuritySettings",
                schema: "Master");

            migrationBuilder.DropTable(
                name: "TenantSettings",
                schema: "Master");

            migrationBuilder.DropTable(
                name: "TenantSetupChecklists",
                schema: "Master");

            migrationBuilder.DropTable(
                name: "TenantSetupWizards",
                schema: "Master");

            migrationBuilder.DropTable(
                name: "TenantWebhooks",
                schema: "Master");

            migrationBuilder.DropTable(
                name: "UserTenants",
                schema: "master");

            migrationBuilder.DropTable(
                name: "TenantOnboardings",
                schema: "Master");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TenantActivityLogs",
                schema: "Master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ActivityDescription = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    ActivityType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    AdditionalData = table.Column<string>(type: "nvarchar(max)", maxLength: 256, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EntityId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    EntityType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IpAddress = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    NewValues = table.Column<string>(type: "nvarchar(max)", maxLength: 256, nullable: true),
                    OldValues = table.Column<string>(type: "nvarchar(max)", maxLength: 256, nullable: true),
                    Severity = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "Info"),
                    TenantId1 = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UserAgent = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    UserId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    UserName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TenantActivityLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TenantActivityLogs_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalSchema: "master",
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TenantActivityLogs_Tenants_TenantId1",
                        column: x => x.TenantId1,
                        principalSchema: "master",
                        principalTable: "Tenants",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "TenantApiKeys",
                schema: "Master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AllowedIpAddresses = table.Column<string>(type: "nvarchar(max)", maxLength: 256, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    Key = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    LastUsedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    RateLimit = table.Column<int>(type: "int", nullable: true),
                    Scopes = table.Column<string>(type: "nvarchar(max)", maxLength: 256, nullable: true),
                    TenantId1 = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TenantApiKeys", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TenantApiKeys_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalSchema: "master",
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TenantApiKeys_Tenants_TenantId1",
                        column: x => x.TenantId1,
                        principalSchema: "master",
                        principalTable: "Tenants",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "TenantCompliances",
                schema: "Master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AccountLockoutMinutes = table.Column<int>(type: "int", nullable: false),
                    AllowDataDeletion = table.Column<bool>(type: "bit", nullable: false),
                    AllowDataExport = table.Column<bool>(type: "bit", nullable: false),
                    AllowDataPortability = table.Column<bool>(type: "bit", nullable: false),
                    AttributeBasedAccessControl = table.Column<bool>(type: "bit", nullable: false),
                    AuditFrequency = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    AuditLogEnabled = table.Column<bool>(type: "bit", nullable: false),
                    AuditLogRetentionDays = table.Column<int>(type: "int", nullable: false),
                    AutoBackupEnabled = table.Column<bool>(type: "bit", nullable: false),
                    AutoDeleteExpiredData = table.Column<bool>(type: "bit", nullable: false),
                    BackupEncryption = table.Column<bool>(type: "bit", nullable: false),
                    BackupFrequency = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    BackupLocation = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    BackupRetentionDays = table.Column<int>(type: "int", nullable: false),
                    CertificatesUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ComplianceReportsUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ComplianceScore = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    CriticalVulnerabilities = table.Column<int>(type: "int", nullable: false),
                    DataCategories = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    DataEncryptionAtRest = table.Column<bool>(type: "bit", nullable: false),
                    DataEncryptionInTransit = table.Column<bool>(type: "bit", nullable: false),
                    DataProcessingAgreements = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    DataProtectionOfficer = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    DataProtectionOfficerEmail = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    DataProtectionOfficerPhone = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    DataRetentionDays = table.Column<int>(type: "int", nullable: false),
                    DataRetentionPolicy = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    DetailedAuditLog = table.Column<bool>(type: "bit", nullable: false),
                    DocumentsLastUpdated = table.Column<DateTime>(type: "datetime2", nullable: true),
                    EncryptionAlgorithm = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    EncryptionKeyLength = table.Column<int>(type: "int", nullable: false),
                    ExternalAuditor = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    GDPRCompliant = table.Column<bool>(type: "bit", nullable: false),
                    GDPRConsentDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    GDPRConsentVersion = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    HIPAAAssessmentDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    HIPAACompliant = table.Column<bool>(type: "bit", nullable: false),
                    HighVulnerabilities = table.Column<int>(type: "int", nullable: false),
                    ISO27001CertificateNumber = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ISO27001Certified = table.Column<bool>(type: "bit", nullable: false),
                    ISO27001ExpiryDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IncidentNotificationHours = table.Column<int>(type: "int", nullable: false),
                    IncidentResponsePlan = table.Column<bool>(type: "bit", nullable: false),
                    IncidentResponseProcedure = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    IncidentResponseTeam = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    KVKKCompliant = table.Column<bool>(type: "bit", nullable: false),
                    KVKKConsentDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    KVKKConsentVersion = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    KeyRotationIntervalDays = table.Column<int>(type: "int", nullable: false),
                    LastAssessmentDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastAuditDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastAuditReport = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    LastBackupDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastBackupTestDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastDataPurgeDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastIncidentDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastKeyRotationDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastPenTestDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastScanDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastVendorAuditDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LowVulnerabilities = table.Column<int>(type: "int", nullable: false),
                    MaxLoginAttempts = table.Column<int>(type: "int", nullable: false),
                    MediumVulnerabilities = table.Column<int>(type: "int", nullable: false),
                    NextAssessmentDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    NextAuditDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    NextDataPurgeDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    NextScanDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    NonComplianceAreas = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    PCIDSSCompliant = table.Column<bool>(type: "bit", nullable: false),
                    PCIDSSLevel = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    PCIDSSValidUntil = table.Column<DateTime>(type: "datetime2", nullable: true),
                    PasswordExpiryDays = table.Column<int>(type: "int", nullable: false),
                    PasswordHistoryCount = table.Column<int>(type: "int", nullable: false),
                    PasswordMinLength = table.Column<int>(type: "int", nullable: false),
                    PasswordRequireLowercase = table.Column<bool>(type: "bit", nullable: false),
                    PasswordRequireNumbers = table.Column<bool>(type: "bit", nullable: false),
                    PasswordRequireSpecialChars = table.Column<bool>(type: "bit", nullable: false),
                    PasswordRequireUppercase = table.Column<bool>(type: "bit", nullable: false),
                    PenetrationTesting = table.Column<bool>(type: "bit", nullable: false),
                    PolicyDocumentsUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    PrivacyPolicyAcceptedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    PrivacyPolicyUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    PrivacyPolicyVersion = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    RecoveryPointObjectiveHours = table.Column<int>(type: "int", nullable: false),
                    RecoveryTimeObjectiveHours = table.Column<int>(type: "int", nullable: false),
                    RemediationDeadline = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RemediationPlan = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    RequireConsentForAnalytics = table.Column<bool>(type: "bit", nullable: false),
                    RequireConsentForMarketing = table.Column<bool>(type: "bit", nullable: false),
                    RequireConsentForThirdParty = table.Column<bool>(type: "bit", nullable: false),
                    RequireMFA = table.Column<bool>(type: "bit", nullable: false),
                    RoleBasedAccessControl = table.Column<bool>(type: "bit", nullable: false),
                    SOC2AuditDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    SOC2Compliant = table.Column<bool>(type: "bit", nullable: false),
                    SOC2ReportUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ScanFrequency = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    SensitiveDataTypes = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    SessionTimeoutMinutes = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    SubProcessors = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    ThirdPartyVendors = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    TotalIncidents = table.Column<int>(type: "int", nullable: false),
                    UnresolvedIncidents = table.Column<int>(type: "int", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    VendorRiskAssessment = table.Column<bool>(type: "bit", nullable: false),
                    VulnerabilityScanning = table.Column<bool>(type: "bit", nullable: false)
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
                    AccentColor = table.Column<string>(type: "nvarchar(7)", maxLength: 7, nullable: false),
                    AllowCustomCode = table.Column<bool>(type: "bit", nullable: false),
                    AndroidAppUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    BackgroundColor = table.Column<string>(type: "nvarchar(7)", maxLength: 7, nullable: false),
                    BodyHtml = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    CollapsedSidebarByDefault = table.Column<bool>(type: "bit", nullable: false),
                    CompanyName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    CopyrightText = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    CurrencyPosition = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    CustomCSS = table.Column<string>(type: "nvarchar(max)", maxLength: 8000, nullable: true),
                    CustomJavaScript = table.Column<string>(type: "nvarchar(max)", maxLength: 8000, nullable: true),
                    CustomMenuItems = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    DarkModeEnabled = table.Column<bool>(type: "bit", nullable: false),
                    DashboardLayout = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    DateFormat = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    DefaultLanguage = table.Column<string>(type: "nvarchar(5)", maxLength: 5, nullable: false),
                    DefaultWidgets = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    EmailFooterHtml = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    EmailHeaderHtml = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    EmailSignature = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    EnableAnimations = table.Column<bool>(type: "bit", nullable: false),
                    EnableAutoSave = table.Column<bool>(type: "bit", nullable: false),
                    EnableSounds = table.Column<bool>(type: "bit", nullable: false),
                    FaviconUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    FirstDayOfWeek = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    FontFamily = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    FontSize = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    FooterText = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    HeadHtml = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    HighContrastMode = table.Column<bool>(type: "bit", nullable: false),
                    IOSAppUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    InvoiceEmailTemplate = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    InvoiceTemplate = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    LastModifiedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastModifiedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    LoginBackgroundColor = table.Column<string>(type: "nvarchar(7)", maxLength: 7, nullable: true),
                    LoginBackgroundUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    LoginFooterText = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    LoginLogoUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    LoginSubtitle = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    LoginTitle = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    LogoDarkUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    LogoUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    MobileLogoUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    MobileOptimized = table.Column<bool>(type: "bit", nullable: false),
                    MobileTheme = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    NavigationPosition = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    NavigationStyle = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    NotificationEmailTemplate = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    NumberFormat = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    PasswordResetEmailTemplate = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    PrimaryColor = table.Column<string>(type: "nvarchar(7)", maxLength: 7, nullable: false),
                    PurchaseOrderTemplate = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    QuotationTemplate = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    ReportFooterTemplate = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    ReportHeaderTemplate = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    SecondaryColor = table.Column<string>(type: "nvarchar(7)", maxLength: 7, nullable: false),
                    ShowBreadcrumbs = table.Column<bool>(type: "bit", nullable: false),
                    ShowGettingStarted = table.Column<bool>(type: "bit", nullable: false),
                    ShowHelp = table.Column<bool>(type: "bit", nullable: false),
                    ShowKeyboardShortcuts = table.Column<bool>(type: "bit", nullable: false),
                    ShowLoginForgotPassword = table.Column<bool>(type: "bit", nullable: false),
                    ShowLoginRememberMe = table.Column<bool>(type: "bit", nullable: false),
                    ShowLoginSocialButtons = table.Column<bool>(type: "bit", nullable: false),
                    ShowLogoOnReports = table.Column<bool>(type: "bit", nullable: false),
                    ShowMobileApp = table.Column<bool>(type: "bit", nullable: false),
                    ShowNotificationBell = table.Column<bool>(type: "bit", nullable: false),
                    ShowRecentActivity = table.Column<bool>(type: "bit", nullable: false),
                    ShowSearchBar = table.Column<bool>(type: "bit", nullable: false),
                    ShowStatistics = table.Column<bool>(type: "bit", nullable: false),
                    ShowTooltips = table.Column<bool>(type: "bit", nullable: false),
                    ShowTour = table.Column<bool>(type: "bit", nullable: false),
                    ShowUserMenu = table.Column<bool>(type: "bit", nullable: false),
                    ShowWatermarkOnReports = table.Column<bool>(type: "bit", nullable: false),
                    ShowWelcomeMessage = table.Column<bool>(type: "bit", nullable: false),
                    SidebarPosition = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    SupportedLanguages = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Tagline = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    TextColor = table.Column<string>(type: "nvarchar(7)", maxLength: 7, nullable: false),
                    Theme = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    TimeFormat = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Use24HourTime = table.Column<bool>(type: "bit", nullable: false),
                    UseCustomEmailTemplates = table.Column<bool>(type: "bit", nullable: false),
                    Version = table.Column<int>(type: "int", nullable: false),
                    WatermarkText = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    WelcomeEmailTemplate = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    WelcomeMessageTemplate = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true)
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
                    ParentDocumentId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    PreviousVersionId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AccessLevel = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    AllowedRoles = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    AllowedUsers = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    ApprovalNotes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    ApprovedBy = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    ApprovedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CanBeDeleted = table.Column<bool>(type: "bit", nullable: false),
                    Category = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ComplianceStandard = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    CustomMetadata = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    Description = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    DocumentName = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    DocumentNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    DocumentType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    DownloadCount = table.Column<int>(type: "int", nullable: false),
                    EffectiveDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ExpiryDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FileExtension = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    FileHash = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    FileName = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    FileSizeBytes = table.Column<long>(type: "bigint", nullable: false),
                    FileUrl = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsApproved = table.Column<bool>(type: "bit", nullable: false),
                    IsComplianceDocument = table.Column<bool>(type: "bit", nullable: false),
                    IsConfidential = table.Column<bool>(type: "bit", nullable: false),
                    IsLatestVersion = table.Column<bool>(type: "bit", nullable: false),
                    IsLegalDocument = table.Column<bool>(type: "bit", nullable: false),
                    IsPublic = table.Column<bool>(type: "bit", nullable: false),
                    IsSigned = table.Column<bool>(type: "bit", nullable: false),
                    Keywords = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Language = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    LastDownloadedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastDownloadedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    LastNotificationSent = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastViewedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastViewedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    LegalJurisdiction = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    MimeType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ModificationReason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ModifiedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ModifiedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    NotificationRecipients = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    RelatedDocumentIds = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    RenewalNoticeDays = table.Column<int>(type: "int", nullable: true),
                    RenewalNotificationDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ReplacesDocumentId = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    RequiresApproval = table.Column<bool>(type: "bit", nullable: false),
                    RequiresNDA = table.Column<bool>(type: "bit", nullable: false),
                    RequiresRenewal = table.Column<bool>(type: "bit", nullable: false),
                    RequiresSignature = table.Column<bool>(type: "bit", nullable: false),
                    RetentionPolicy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    RetentionUntil = table.Column<DateTime>(type: "datetime2", nullable: true),
                    SendExpiryNotification = table.Column<bool>(type: "bit", nullable: false),
                    SendRenewalNotification = table.Column<bool>(type: "bit", nullable: false),
                    SignatureUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    SignedBy = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    SignedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Tags = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    UploadedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UploadedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Version = table.Column<int>(type: "int", nullable: false),
                    VersionNotes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    ViewCount = table.Column<int>(type: "int", nullable: false)
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
                name: "TenantFeatures",
                schema: "master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Configuration = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    EnabledAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FeatureCode = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    IsEnabled = table.Column<bool>(type: "bit", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TenantFeatures", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TenantFeatures_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalSchema: "master",
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TenantInitialData",
                schema: "Master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AddressLine1 = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    AddressLine2 = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    AdminFirstName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    AdminLastName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    AdminPhone = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    AdminUserCreated = table.Column<bool>(type: "bit", nullable: false),
                    AdminUserEmail = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    AdminUserName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    AnnualRevenue = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    ApprovalWorkflows = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    BranchesCreated = table.Column<bool>(type: "bit", nullable: false),
                    BusinessType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ChartOfAccountsCreated = table.Column<bool>(type: "bit", nullable: false),
                    ChartOfAccountsTemplate = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    City = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    CompanyCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    CompanyName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ContactEmail = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    ContactFax = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    ContactPhone = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Country = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    CreateSampleData = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Currency = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: true),
                    CustomerTemplate = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    DataSetType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    DefaultBranches = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    DefaultCurrency = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false),
                    DefaultDateFormat = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    DefaultDepartments = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    DefaultLanguage = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    DefaultProductCategories = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    DefaultTheme = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    DefaultTimeFormat = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    DefaultTimeZone = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    DepartmentsCreated = table.Column<bool>(type: "bit", nullable: false),
                    EmployeeCount = table.Column<int>(type: "int", nullable: true),
                    FiscalYearStart = table.Column<int>(type: "int", nullable: true),
                    ImportExistingData = table.Column<bool>(type: "bit", nullable: false),
                    ImportedDataSources = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    ImportedRecordsCount = table.Column<int>(type: "int", nullable: true),
                    IndustryType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IntegrationsConfigured = table.Column<bool>(type: "bit", nullable: false),
                    IsProcessed = table.Column<bool>(type: "bit", nullable: false),
                    IsValidated = table.Column<bool>(type: "bit", nullable: false),
                    MersisNumber = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    ModuleConfigurations = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    NotificationRules = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    PostalCode = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    PreferredIntegrations = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    ProcessedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ProcessingAttempts = table.Column<int>(type: "int", nullable: false),
                    ProcessingErrors = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    ProductCategoriesCreated = table.Column<bool>(type: "bit", nullable: false),
                    SelectedModules = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    SetupProgressPercentage = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false),
                    SetupStepsCompleted = table.Column<int>(type: "int", nullable: false),
                    State = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    TaxNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    TaxOffice = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    TemplatesCreated = table.Column<bool>(type: "bit", nullable: false),
                    TotalSetupSteps = table.Column<int>(type: "int", nullable: false),
                    TradeRegistryNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    UseDefaultChartOfAccounts = table.Column<bool>(type: "bit", nullable: false),
                    ValidatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ValidationErrors = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    VendorTemplate = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    Website = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    WorkflowsConfigured = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TenantInitialData", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TenantInitialData_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalSchema: "master",
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TenantIntegrations",
                schema: "Master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ApiKey = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Configuration = table.Column<string>(type: "nvarchar(max)", maxLength: 256, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsConnected = table.Column<bool>(type: "bit", nullable: false),
                    LastError = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    LastSyncAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastSyncStatus = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    RefreshToken = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    TenantId1 = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    TokenExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Type = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    WebhookUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TenantIntegrations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TenantIntegrations_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalSchema: "master",
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TenantIntegrations_Tenants_TenantId1",
                        column: x => x.TenantId1,
                        principalSchema: "master",
                        principalTable: "Tenants",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "TenantNotifications",
                schema: "Master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    BCCRecipients = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    Body = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    CCRecipients = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    Channel = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    CronExpression = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    DayOfMonth = table.Column<int>(type: "int", nullable: true),
                    DayOfWeek = table.Column<int>(type: "int", nullable: true),
                    DelayMinutes = table.Column<int>(type: "int", nullable: false),
                    EmailTemplateId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    FailedCount = table.Column<int>(type: "int", nullable: false),
                    IsEnabled = table.Column<bool>(type: "bit", nullable: false),
                    IsPaused = table.Column<bool>(type: "bit", nullable: false),
                    LastSentAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    MaxPerDay = table.Column<int>(type: "int", nullable: false),
                    MaxPerMonth = table.Column<int>(type: "int", nullable: false),
                    MaxPerWeek = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    NextScheduledAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    PausedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    PausedReason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Recipients = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    SMSTemplateId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Schedule = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    SendToAllAdmins = table.Column<bool>(type: "bit", nullable: false),
                    SendToOwner = table.Column<bool>(type: "bit", nullable: false),
                    SentThisMonth = table.Column<int>(type: "int", nullable: false),
                    SentThisWeek = table.Column<int>(type: "int", nullable: false),
                    SentToday = table.Column<int>(type: "int", nullable: false),
                    Subject = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ThresholdUnit = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    ThresholdValue = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    TimeOfDay = table.Column<TimeSpan>(type: "time", nullable: true),
                    TotalSentCount = table.Column<int>(type: "int", nullable: false),
                    TriggerConditions = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    Type = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    UseDefaultTemplate = table.Column<bool>(type: "bit", nullable: false)
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

            migrationBuilder.CreateTable(
                name: "TenantOnboardings",
                schema: "Master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AssignedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    AssignedToEmail = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    AssignedToName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    AssignedToUserId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Blockers = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ContactPersonEmail = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    ContactPersonName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ContactPersonPhone = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    CurrentStepNumber = table.Column<int>(type: "int", nullable: false),
                    CustomizationRequirements = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    CustomizationStatus = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    DataMigrationCompleted = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DataMigrationStarted = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DataMigrationStatus = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    DocumentationUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    EstimatedCompletionDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FeedbackComments = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    FeedbackReceivedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IntegrationStatus = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    IntegrationSystems = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Issues = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    KickoffMeetingDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    KickoffMeetingNotes = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    NextTrainingDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    OnboardingType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    PreferredContactMethod = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    PreferredContactTime = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Priority = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ProgressPercentage = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false),
                    RecordsMigrated = table.Column<long>(type: "bigint", nullable: true),
                    RequiresCustomization = table.Column<bool>(type: "bit", nullable: false),
                    RequiresDataMigration = table.Column<bool>(type: "bit", nullable: false),
                    RequiresIntegration = table.Column<bool>(type: "bit", nullable: false),
                    SatisfactionScore = table.Column<int>(type: "int", nullable: true),
                    StartedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    TotalDaysExpected = table.Column<int>(type: "int", nullable: false),
                    TotalRecordsToMigrate = table.Column<long>(type: "bigint", nullable: true),
                    TotalTrainingSessions = table.Column<int>(type: "int", nullable: false),
                    TrainingMaterialsUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    TrainingSessionsCompleted = table.Column<int>(type: "int", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    WelcomePackageSent = table.Column<bool>(type: "bit", nullable: false),
                    WelcomePackageSentAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    WelcomePackageUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TenantOnboardings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TenantOnboardings_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalSchema: "master",
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TenantSecuritySettings",
                schema: "Master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AllowedTwoFactorProviders = table.Column<string>(type: "nvarchar(max)", maxLength: 256, nullable: true),
                    ApiKeyRotationDays = table.Column<int>(type: "int", nullable: false),
                    ApiRateLimitPerMinute = table.Column<int>(type: "int", nullable: false),
                    AuditLogRetentionDays = table.Column<int>(type: "int", nullable: false),
                    BlacklistedIps = table.Column<string>(type: "nvarchar(max)", maxLength: 256, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CspPolicy = table.Column<string>(type: "nvarchar(max)", maxLength: 256, nullable: true),
                    EnableAccountLockout = table.Column<bool>(type: "bit", nullable: false),
                    EnableApiKeyRotation = table.Column<bool>(type: "bit", nullable: false),
                    EnableApiRateLimiting = table.Column<bool>(type: "bit", nullable: false),
                    EnableAuditLog = table.Column<bool>(type: "bit", nullable: false),
                    EnableConcurrentSessions = table.Column<bool>(type: "bit", nullable: false),
                    EnableCsp = table.Column<bool>(type: "bit", nullable: false),
                    EnableDataEncryption = table.Column<bool>(type: "bit", nullable: false),
                    EnableHsts = table.Column<bool>(type: "bit", nullable: false),
                    EnableIpBlacklist = table.Column<bool>(type: "bit", nullable: false),
                    EnableIpWhitelist = table.Column<bool>(type: "bit", nullable: false),
                    EnableSensitiveDataMasking = table.Column<bool>(type: "bit", nullable: false),
                    EnableXContentTypeOptions = table.Column<bool>(type: "bit", nullable: false),
                    EnableXFrameOptions = table.Column<bool>(type: "bit", nullable: false),
                    EnforceTwoFactor = table.Column<bool>(type: "bit", nullable: false),
                    LockoutDurationMinutes = table.Column<int>(type: "int", nullable: false),
                    MaxConcurrentSessions = table.Column<int>(type: "int", nullable: false),
                    MaxFailedLoginAttempts = table.Column<int>(type: "int", nullable: false),
                    MinPasswordLength = table.Column<int>(type: "int", nullable: false),
                    PasswordExpirationDays = table.Column<int>(type: "int", nullable: false),
                    PasswordHistoryCount = table.Column<int>(type: "int", nullable: false),
                    RequireApiAuthentication = table.Column<bool>(type: "bit", nullable: false),
                    RequireLowercase = table.Column<bool>(type: "bit", nullable: false),
                    RequireNumbers = table.Column<bool>(type: "bit", nullable: false),
                    RequireSpecialCharacters = table.Column<bool>(type: "bit", nullable: false),
                    RequireUppercase = table.Column<bool>(type: "bit", nullable: false),
                    SessionTimeoutMinutes = table.Column<int>(type: "int", nullable: false),
                    TenantId1 = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    WhitelistedIps = table.Column<string>(type: "nvarchar(max)", maxLength: 256, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TenantSecuritySettings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TenantSecuritySettings_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalSchema: "master",
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TenantSecuritySettings_Tenants_TenantId1",
                        column: x => x.TenantId1,
                        principalSchema: "master",
                        principalTable: "Tenants",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "TenantSettings",
                schema: "Master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Address = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CompanyName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Country = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Currency = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    CustomCss = table.Column<string>(type: "nvarchar(max)", maxLength: 256, nullable: true),
                    DataRetentionDays = table.Column<int>(type: "int", nullable: false),
                    DateFormat = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    EmailFromAddress = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    EmailFromName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    EnableApiAccess = table.Column<bool>(type: "bit", nullable: false),
                    EnableAutoBackup = table.Column<bool>(type: "bit", nullable: false),
                    EnableEmailNotifications = table.Column<bool>(type: "bit", nullable: false),
                    EnableSmsNotifications = table.Column<bool>(type: "bit", nullable: false),
                    EnableTwoFactor = table.Column<bool>(type: "bit", nullable: false),
                    EnableWebhooks = table.Column<bool>(type: "bit", nullable: false),
                    FaviconUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Language = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    LogoUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    MaxApiCallsPerMonth = table.Column<int>(type: "int", nullable: false),
                    MaxStorage = table.Column<int>(type: "int", nullable: false),
                    MaxUsers = table.Column<int>(type: "int", nullable: false),
                    Phone = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    PrimaryColor = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    SecondaryColor = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    SessionTimeoutMinutes = table.Column<int>(type: "int", nullable: false),
                    SmtpEnableSsl = table.Column<bool>(type: "bit", nullable: false),
                    SmtpHost = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    SmtpPassword = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    SmtpPort = table.Column<int>(type: "int", nullable: true),
                    SmtpUsername = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    TaxNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    TenantId1 = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    TimeFormat = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    TimeZone = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Website = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TenantSettings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TenantSettings_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalSchema: "master",
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TenantSettings_Tenants_TenantId1",
                        column: x => x.TenantId1,
                        principalSchema: "master",
                        principalTable: "Tenants",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "TenantSetupChecklists",
                schema: "Master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AccountCount = table.Column<int>(type: "int", nullable: false),
                    AdminUserCreated = table.Column<bool>(type: "bit", nullable: false),
                    AdminUserCreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    AdminUserCreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ApprovalWorkflowsConfigured = table.Column<bool>(type: "bit", nullable: false),
                    ApprovalWorkflowsConfiguredAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    AutomationRuleCount = table.Column<int>(type: "int", nullable: false),
                    AutomationRulesConfigured = table.Column<bool>(type: "bit", nullable: false),
                    AutomationRulesConfiguredAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    BackupConfigured = table.Column<bool>(type: "bit", nullable: false),
                    BackupConfiguredAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    BlockingIssues = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    BranchCount = table.Column<int>(type: "int", nullable: false),
                    BranchesCreated = table.Column<bool>(type: "bit", nullable: false),
                    BranchesCreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ChartOfAccountsSetup = table.Column<bool>(type: "bit", nullable: false),
                    ChartOfAccountsSetupAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CompanyInfoCompleted = table.Column<bool>(type: "bit", nullable: false),
                    CompanyInfoCompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CompanyInfoCompletedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CompletedItems = table.Column<int>(type: "int", nullable: false),
                    ComplianceConfigured = table.Column<bool>(type: "bit", nullable: false),
                    ComplianceConfiguredAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    CurrencyConfigured = table.Column<bool>(type: "bit", nullable: false),
                    CurrencyConfiguredAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CustomerCount = table.Column<int>(type: "int", nullable: false),
                    CustomersImported = table.Column<bool>(type: "bit", nullable: false),
                    CustomersImportedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DashboardConfigured = table.Column<bool>(type: "bit", nullable: false),
                    DashboardConfiguredAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DataMigrationCompleted = table.Column<bool>(type: "bit", nullable: false),
                    DataMigrationCompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DepartmentCount = table.Column<int>(type: "int", nullable: false),
                    DepartmentsCreated = table.Column<bool>(type: "bit", nullable: false),
                    DepartmentsCreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DocumentationReviewed = table.Column<bool>(type: "bit", nullable: false),
                    DocumentationReviewedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    EmailIntegrationConfigured = table.Column<bool>(type: "bit", nullable: false),
                    EmailIntegrationConfiguredAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    EmailTemplatesConfigured = table.Column<bool>(type: "bit", nullable: false),
                    EmailTemplatesConfiguredAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FiscalYearConfigured = table.Column<bool>(type: "bit", nullable: false),
                    FiscalYearConfiguredAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    GoLiveApproved = table.Column<bool>(type: "bit", nullable: false),
                    GoLiveApprovedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    GoLiveApprovedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IntegratedServices = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    LogoUploaded = table.Column<bool>(type: "bit", nullable: false),
                    LogoUploadedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LogoUploadedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ModulesConfigured = table.Column<bool>(type: "bit", nullable: false),
                    ModulesConfiguredAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ModulesSelected = table.Column<bool>(type: "bit", nullable: false),
                    ModulesSelectedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    NotificationRuleCount = table.Column<int>(type: "int", nullable: false),
                    NotificationRulesConfigured = table.Column<bool>(type: "bit", nullable: false),
                    NotificationRulesConfiguredAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    OverallProgress = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false),
                    PasswordPolicySet = table.Column<bool>(type: "bit", nullable: false),
                    PasswordPolicySetAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    PaymentGatewayConfigured = table.Column<bool>(type: "bit", nullable: false),
                    PaymentGatewayConfiguredAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    PendingTasks = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    PricingRulesConfigured = table.Column<bool>(type: "bit", nullable: false),
                    PricingRulesConfiguredAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    PrimaryCurrency = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: true),
                    ProductCategoriesCreated = table.Column<bool>(type: "bit", nullable: false),
                    ProductCategoriesCreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ProductCategoryCount = table.Column<int>(type: "int", nullable: false),
                    ProductCount = table.Column<int>(type: "int", nullable: false),
                    ProductsImported = table.Column<bool>(type: "bit", nullable: false),
                    ProductsImportedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ReportTemplatesConfigured = table.Column<bool>(type: "bit", nullable: false),
                    ReportTemplatesConfiguredAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RequiredCompletedItems = table.Column<int>(type: "int", nullable: false),
                    RequiredItems = table.Column<int>(type: "int", nullable: false),
                    RequiredProgress = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false),
                    RoleCount = table.Column<int>(type: "int", nullable: false),
                    RolesConfigured = table.Column<bool>(type: "bit", nullable: false),
                    RolesConfiguredAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    SecuritySettingsConfigured = table.Column<bool>(type: "bit", nullable: false),
                    SecuritySettingsConfiguredAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    SelectedModulesList = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    SmsIntegrationConfigured = table.Column<bool>(type: "bit", nullable: false),
                    SmsIntegrationConfiguredAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    SupportContactsAdded = table.Column<bool>(type: "bit", nullable: false),
                    SupportContactsAddedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    SystemTestingCompleted = table.Column<bool>(type: "bit", nullable: false),
                    SystemTestingCompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    TaxSettingsConfigured = table.Column<bool>(type: "bit", nullable: false),
                    TaxSettingsConfiguredAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ThemeCustomized = table.Column<bool>(type: "bit", nullable: false),
                    ThemeCustomizedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ThirdPartyIntegrationsConfigured = table.Column<bool>(type: "bit", nullable: false),
                    ThirdPartyIntegrationsConfiguredAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    TotalItems = table.Column<int>(type: "int", nullable: false),
                    TrainedUserCount = table.Column<int>(type: "int", nullable: false),
                    TrainingCompleted = table.Column<bool>(type: "bit", nullable: false),
                    TrainingCompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    TwoFactorEnabled = table.Column<bool>(type: "bit", nullable: false),
                    TwoFactorEnabledAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    UserAcceptanceCompleted = table.Column<bool>(type: "bit", nullable: false),
                    UserAcceptanceCompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UserCount = table.Column<int>(type: "int", nullable: false),
                    UsersInvited = table.Column<bool>(type: "bit", nullable: false),
                    UsersInvitedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    VendorCount = table.Column<int>(type: "int", nullable: false),
                    VendorsImported = table.Column<bool>(type: "bit", nullable: false),
                    VendorsImportedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    WorkflowCount = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TenantSetupChecklists", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TenantSetupChecklists_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalSchema: "master",
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TenantSetupWizards",
                schema: "Master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AssistanceNotes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    AutoSaveEnabled = table.Column<bool>(type: "bit", nullable: false),
                    AverageStepTime = table.Column<long>(type: "bigint", nullable: true),
                    CanSkipCurrentStep = table.Column<bool>(type: "bit", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CompletedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    CompletedSteps = table.Column<int>(type: "int", nullable: false),
                    CompletedStepsData = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    CurrentStep = table.Column<int>(type: "int", nullable: false),
                    CurrentStepCategory = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    CurrentStepDescription = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    CurrentStepName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    DefaultConfiguration = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    ErrorMessages = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    EstimatedCompletionTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    HasErrors = table.Column<bool>(type: "bit", nullable: false),
                    HasWarnings = table.Column<bool>(type: "bit", nullable: false),
                    HelpRequestCount = table.Column<int>(type: "int", nullable: false),
                    IsCurrentStepRequired = table.Column<bool>(type: "bit", nullable: false),
                    LastActivityAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastAutoSaveAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastHelpRequestAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastModifiedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    NeedsAssistance = table.Column<bool>(type: "bit", nullable: false),
                    PendingStepsData = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    ProgressPercentage = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false),
                    SavedConfiguration = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    SkippedStepsData = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    StartedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    StartedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    TotalSteps = table.Column<int>(type: "int", nullable: false),
                    TotalTimeSpent = table.Column<long>(type: "bigint", nullable: true),
                    WarningMessages = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    WizardType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TenantSetupWizards", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TenantSetupWizards_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalSchema: "master",
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TenantWebhooks",
                schema: "Master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Events = table.Column<string>(type: "nvarchar(max)", maxLength: 256, nullable: false),
                    FailureCount = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    Headers = table.Column<string>(type: "nvarchar(max)", maxLength: 256, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    LastStatus = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    LastTriggeredAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    MaxRetries = table.Column<int>(type: "int", nullable: false, defaultValue: 3),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Secret = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    SuccessCount = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    TenantId1 = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    TimeoutSeconds = table.Column<int>(type: "int", nullable: false, defaultValue: 30),
                    Url = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TenantWebhooks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TenantWebhooks_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalSchema: "master",
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TenantWebhooks_Tenants_TenantId1",
                        column: x => x.TenantId1,
                        principalSchema: "master",
                        principalTable: "Tenants",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "UserTenants",
                schema: "master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AssignedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    IsDefault = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserTenants", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserTenants_MasterUsers_UserId",
                        column: x => x.UserId,
                        principalSchema: "master",
                        principalTable: "MasterUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserTenants_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalSchema: "master",
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "OnboardingSteps",
                schema: "Master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CompletedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IsCompleted = table.Column<bool>(type: "bit", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    OnboardingId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    StepName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    StepNumber = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OnboardingSteps", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OnboardingSteps_TenantOnboardings_OnboardingId",
                        column: x => x.OnboardingId,
                        principalSchema: "Master",
                        principalTable: "TenantOnboardings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "OnboardingTasks",
                schema: "Master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CompletedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    DueDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsCompleted = table.Column<bool>(type: "bit", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    OnboardingId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OnboardingTasks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OnboardingTasks_TenantOnboardings_OnboardingId",
                        column: x => x.OnboardingId,
                        principalSchema: "Master",
                        principalTable: "TenantOnboardings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_OnboardingSteps_OnboardingId",
                schema: "Master",
                table: "OnboardingSteps",
                column: "OnboardingId");

            migrationBuilder.CreateIndex(
                name: "IX_OnboardingSteps_OnboardingId_StepNumber",
                schema: "Master",
                table: "OnboardingSteps",
                columns: new[] { "OnboardingId", "StepNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OnboardingTasks_DueDate",
                schema: "Master",
                table: "OnboardingTasks",
                column: "DueDate");

            migrationBuilder.CreateIndex(
                name: "IX_OnboardingTasks_IsCompleted",
                schema: "Master",
                table: "OnboardingTasks",
                column: "IsCompleted");

            migrationBuilder.CreateIndex(
                name: "IX_OnboardingTasks_OnboardingId",
                schema: "Master",
                table: "OnboardingTasks",
                column: "OnboardingId");

            migrationBuilder.CreateIndex(
                name: "IX_TenantActivityLogs_CreatedAt",
                schema: "Master",
                table: "TenantActivityLogs",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_TenantActivityLogs_TenantId",
                schema: "Master",
                table: "TenantActivityLogs",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_TenantActivityLogs_TenantId_ActivityType",
                schema: "Master",
                table: "TenantActivityLogs",
                columns: new[] { "TenantId", "ActivityType" });

            migrationBuilder.CreateIndex(
                name: "IX_TenantActivityLogs_TenantId_CreatedAt",
                schema: "Master",
                table: "TenantActivityLogs",
                columns: new[] { "TenantId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_TenantActivityLogs_TenantId_EntityType_EntityId",
                schema: "Master",
                table: "TenantActivityLogs",
                columns: new[] { "TenantId", "EntityType", "EntityId" });

            migrationBuilder.CreateIndex(
                name: "IX_TenantActivityLogs_TenantId_UserId",
                schema: "Master",
                table: "TenantActivityLogs",
                columns: new[] { "TenantId", "UserId" });

            migrationBuilder.CreateIndex(
                name: "IX_TenantActivityLogs_TenantId1",
                schema: "Master",
                table: "TenantActivityLogs",
                column: "TenantId1");

            migrationBuilder.CreateIndex(
                name: "IX_TenantApiKeys_Key",
                schema: "Master",
                table: "TenantApiKeys",
                column: "Key",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TenantApiKeys_TenantId",
                schema: "Master",
                table: "TenantApiKeys",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_TenantApiKeys_TenantId_IsActive",
                schema: "Master",
                table: "TenantApiKeys",
                columns: new[] { "TenantId", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_TenantApiKeys_TenantId1",
                schema: "Master",
                table: "TenantApiKeys",
                column: "TenantId1");

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
                name: "IX_TenantFeatures_IsEnabled",
                schema: "master",
                table: "TenantFeatures",
                column: "IsEnabled");

            migrationBuilder.CreateIndex(
                name: "IX_TenantFeatures_TenantId_FeatureCode",
                schema: "master",
                table: "TenantFeatures",
                columns: new[] { "TenantId", "FeatureCode" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TenantInitialData_AdminUserEmail",
                schema: "Master",
                table: "TenantInitialData",
                column: "AdminUserEmail");

            migrationBuilder.CreateIndex(
                name: "IX_TenantInitialData_CompanyName",
                schema: "Master",
                table: "TenantInitialData",
                column: "CompanyName");

            migrationBuilder.CreateIndex(
                name: "IX_TenantInitialData_ContactEmail",
                schema: "Master",
                table: "TenantInitialData",
                column: "ContactEmail");

            migrationBuilder.CreateIndex(
                name: "IX_TenantInitialData_DataSetType",
                schema: "Master",
                table: "TenantInitialData",
                column: "DataSetType");

            migrationBuilder.CreateIndex(
                name: "IX_TenantInitialData_IsProcessed",
                schema: "Master",
                table: "TenantInitialData",
                column: "IsProcessed");

            migrationBuilder.CreateIndex(
                name: "IX_TenantInitialData_IsValidated",
                schema: "Master",
                table: "TenantInitialData",
                column: "IsValidated");

            migrationBuilder.CreateIndex(
                name: "IX_TenantInitialData_Status",
                schema: "Master",
                table: "TenantInitialData",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_TenantInitialData_TenantId",
                schema: "Master",
                table: "TenantInitialData",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_TenantInitialData_TenantId_Status",
                schema: "Master",
                table: "TenantInitialData",
                columns: new[] { "TenantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_TenantIntegrations_TenantId",
                schema: "Master",
                table: "TenantIntegrations",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_TenantIntegrations_TenantId_IsActive_IsConnected",
                schema: "Master",
                table: "TenantIntegrations",
                columns: new[] { "TenantId", "IsActive", "IsConnected" });

            migrationBuilder.CreateIndex(
                name: "IX_TenantIntegrations_TenantId_Type",
                schema: "Master",
                table: "TenantIntegrations",
                columns: new[] { "TenantId", "Type" });

            migrationBuilder.CreateIndex(
                name: "IX_TenantIntegrations_TenantId1",
                schema: "Master",
                table: "TenantIntegrations",
                column: "TenantId1");

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

            migrationBuilder.CreateIndex(
                name: "IX_TenantOnboardings_OnboardingType",
                schema: "Master",
                table: "TenantOnboardings",
                column: "OnboardingType");

            migrationBuilder.CreateIndex(
                name: "IX_TenantOnboardings_Priority",
                schema: "Master",
                table: "TenantOnboardings",
                column: "Priority");

            migrationBuilder.CreateIndex(
                name: "IX_TenantOnboardings_Status",
                schema: "Master",
                table: "TenantOnboardings",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_TenantOnboardings_Status_Priority",
                schema: "Master",
                table: "TenantOnboardings",
                columns: new[] { "Status", "Priority" });

            migrationBuilder.CreateIndex(
                name: "IX_TenantOnboardings_TenantId",
                schema: "Master",
                table: "TenantOnboardings",
                column: "TenantId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TenantSecuritySettings_TenantId",
                schema: "Master",
                table: "TenantSecuritySettings",
                column: "TenantId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TenantSecuritySettings_TenantId1",
                schema: "Master",
                table: "TenantSecuritySettings",
                column: "TenantId1",
                unique: true,
                filter: "[TenantId1] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_TenantSettings_TenantId",
                schema: "Master",
                table: "TenantSettings",
                column: "TenantId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TenantSettings_TenantId1",
                schema: "Master",
                table: "TenantSettings",
                column: "TenantId1",
                unique: true,
                filter: "[TenantId1] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_TenantSetupChecklists_GoLiveApproved",
                schema: "Master",
                table: "TenantSetupChecklists",
                column: "GoLiveApproved");

            migrationBuilder.CreateIndex(
                name: "IX_TenantSetupChecklists_OverallProgress",
                schema: "Master",
                table: "TenantSetupChecklists",
                column: "OverallProgress");

            migrationBuilder.CreateIndex(
                name: "IX_TenantSetupChecklists_RequiredProgress",
                schema: "Master",
                table: "TenantSetupChecklists",
                column: "RequiredProgress");

            migrationBuilder.CreateIndex(
                name: "IX_TenantSetupChecklists_Status",
                schema: "Master",
                table: "TenantSetupChecklists",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_TenantSetupChecklists_TenantId",
                schema: "Master",
                table: "TenantSetupChecklists",
                column: "TenantId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TenantSetupWizards_StartedAt",
                schema: "Master",
                table: "TenantSetupWizards",
                column: "StartedAt");

            migrationBuilder.CreateIndex(
                name: "IX_TenantSetupWizards_Status",
                schema: "Master",
                table: "TenantSetupWizards",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_TenantSetupWizards_TenantId",
                schema: "Master",
                table: "TenantSetupWizards",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_TenantSetupWizards_TenantId_WizardType_Status",
                schema: "Master",
                table: "TenantSetupWizards",
                columns: new[] { "TenantId", "WizardType", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_TenantSetupWizards_WizardType",
                schema: "Master",
                table: "TenantSetupWizards",
                column: "WizardType");

            migrationBuilder.CreateIndex(
                name: "IX_TenantWebhooks_TenantId",
                schema: "Master",
                table: "TenantWebhooks",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_TenantWebhooks_TenantId_IsActive",
                schema: "Master",
                table: "TenantWebhooks",
                columns: new[] { "TenantId", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_TenantWebhooks_TenantId_Name",
                schema: "Master",
                table: "TenantWebhooks",
                columns: new[] { "TenantId", "Name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TenantWebhooks_TenantId1",
                schema: "Master",
                table: "TenantWebhooks",
                column: "TenantId1");

            migrationBuilder.CreateIndex(
                name: "IX_UserTenants_IsActive",
                schema: "master",
                table: "UserTenants",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_UserTenants_TenantId",
                schema: "master",
                table: "UserTenants",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_UserTenants_UserId_TenantId",
                schema: "master",
                table: "UserTenants",
                columns: new[] { "UserId", "TenantId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserTenants_UserType",
                schema: "master",
                table: "UserTenants",
                column: "UserType");
        }
    }
}
