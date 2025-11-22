using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Persistence.Migrations.Tenant
{
    /// <inheritdoc />
    public partial class MoveEntitiesFromMasterToTenantDb : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TenantActivityLogs",
                schema: "tenant",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ActivityType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    EntityType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    EntityId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Action = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    UserEmail = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    UserRole = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    IpAddress = table.Column<string>(type: "nvarchar(45)", maxLength: 45, nullable: true),
                    UserAgent = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    SessionId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    RequestId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    OldData = table.Column<string>(type: "nvarchar(max)", maxLength: 256, nullable: true),
                    NewData = table.Column<string>(type: "nvarchar(max)", maxLength: 256, nullable: true),
                    Changes = table.Column<string>(type: "nvarchar(max)", maxLength: 256, nullable: true),
                    AdditionalData = table.Column<string>(type: "nvarchar(max)", maxLength: 256, nullable: true),
                    IsSuccess = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    ErrorMessage = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    ErrorDetails = table.Column<string>(type: "nvarchar(max)", maxLength: 256, nullable: true),
                    HttpStatusCode = table.Column<int>(type: "int", nullable: true),
                    ActivityAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Duration = table.Column<TimeSpan>(type: "time", nullable: true),
                    Category = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Severity = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    IsSystemGenerated = table.Column<bool>(type: "bit", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TenantActivityLogs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TenantApiKeys",
                schema: "tenant",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    KeyPrefix = table.Column<string>(type: "nvarchar(8)", maxLength: 8, nullable: false),
                    HashedKey = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    EncryptedKey = table.Column<string>(type: "nvarchar(512)", maxLength: 512, nullable: true),
                    KeyType = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Scopes = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AllowedEndpoints = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AllowedMethods = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AllowedIpAddresses = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AllowedDomains = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RateLimitPerMinute = table.Column<int>(type: "int", nullable: true),
                    RateLimitPerHour = table.Column<int>(type: "int", nullable: true),
                    RateLimitPerDay = table.Column<int>(type: "int", nullable: true),
                    UsageCount = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    LastUsedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastUsedIp = table.Column<string>(type: "nvarchar(45)", maxLength: 45, nullable: true),
                    LastUsedUserAgent = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RevokedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RevokedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    RevocationReason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    RequireHttps = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    Environment = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    AssociatedUserId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    AssociatedApplication = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Metadata = table.Column<string>(type: "nvarchar(max)", maxLength: 256, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TenantApiKeys", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TenantNotifications",
                schema: "tenant",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Message = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    Type = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Category = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Priority = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Severity = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    TargetType = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    TargetUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    TargetRole = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    TargetDepartment = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    TargetUserIds = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsGlobal = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    IconName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    IconColor = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    ImageUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ActionUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ActionText = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ActionType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    ActionData = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SendInApp = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    SendEmail = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    SendSms = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    SendPushNotification = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    SendWebhook = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    WebhookUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    EmailTemplateId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    SmsTemplateId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ScheduledAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    SentAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsScheduled = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    IsRecurring = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    RecurrencePattern = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    RecurrenceEndDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    IsRead = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    ReadAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDismissed = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    DismissedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsArchived = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    ArchivedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeliveryAttempts = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    LastDeliveryAttempt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeliveryError = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    RequiresAcknowledgment = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    IsAcknowledged = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    AcknowledgedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    AcknowledgedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    AllowDismiss = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    ShowUntilRead = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    Persistent = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Source = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    SourceEntityType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    SourceEntityId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    SourceEventType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Metadata = table.Column<string>(type: "nvarchar(max)", maxLength: 256, nullable: true),
                    Data = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Tags = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    GroupKey = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    GroupCount = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    Actions = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TenantNotifications", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TenantSecuritySettings",
                schema: "tenant",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TwoFactorRequired = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    TwoFactorOptional = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    TwoFactorMethods = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TwoFactorCodeLength = table.Column<int>(type: "int", nullable: false, defaultValue: 6),
                    TwoFactorCodeExpiryMinutes = table.Column<int>(type: "int", nullable: false, defaultValue: 5),
                    AllowBackupCodes = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    BackupCodesCount = table.Column<int>(type: "int", nullable: false, defaultValue: 10),
                    MinPasswordLength = table.Column<int>(type: "int", nullable: false, defaultValue: 8),
                    MaxPasswordLength = table.Column<int>(type: "int", nullable: false, defaultValue: 128),
                    RequireUppercase = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    RequireLowercase = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    RequireNumbers = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    RequireSpecialCharacters = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    SpecialCharacters = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    PasswordExpiryDays = table.Column<int>(type: "int", nullable: false, defaultValue: 90),
                    PasswordHistoryCount = table.Column<int>(type: "int", nullable: false, defaultValue: 5),
                    PreventCommonPasswords = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    PreventUserInfoInPassword = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    MaxLoginAttempts = table.Column<int>(type: "int", nullable: false, defaultValue: 5),
                    AccountLockoutMinutes = table.Column<int>(type: "int", nullable: false, defaultValue: 30),
                    RequireCaptchaAfterFailedAttempts = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    CaptchaThreshold = table.Column<int>(type: "int", nullable: false, defaultValue: 3),
                    SessionTimeoutMinutes = table.Column<int>(type: "int", nullable: false, defaultValue: 30),
                    InactivityTimeoutMinutes = table.Column<int>(type: "int", nullable: false, defaultValue: 15),
                    SingleSessionPerUser = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    LogoutOnBrowserClose = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    EnableIpWhitelist = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    AllowedIpAddresses = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AllowedIpRanges = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EnableIpBlacklist = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    BlockedIpAddresses = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    BlockedIpRanges = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    BlockVpnAccess = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    BlockTorAccess = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    EnableGeoBlocking = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    AllowedCountries = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    BlockedCountries = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EnableDeviceTracking = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    RequireDeviceApproval = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    MaxDevicesPerUser = table.Column<int>(type: "int", nullable: false, defaultValue: 5),
                    NotifyOnNewDevice = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    DeviceTrustDurationDays = table.Column<int>(type: "int", nullable: false, defaultValue: 30),
                    EnableSecurityHeaders = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    EnableHsts = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    HstsMaxAgeSeconds = table.Column<int>(type: "int", nullable: false, defaultValue: 31536000),
                    EnableCsp = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    CspPolicy = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    EnableCors = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    AllowedOrigins = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AllowCredentials = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    EnableAuditLogging = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    LogSuccessfulLogins = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    LogFailedLogins = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    LogDataAccess = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    LogDataModification = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    LogSecurityEvents = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    AuditLogRetentionDays = table.Column<int>(type: "int", nullable: false, defaultValue: 365),
                    RequireEmailVerification = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    EmailVerificationExpiryHours = table.Column<int>(type: "int", nullable: false, defaultValue: 24),
                    NotifyPasswordChanges = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    NotifyLoginFromNewLocation = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    NotifySecurityChanges = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    EnableApiRateLimiting = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    ApiRateLimitPerMinute = table.Column<int>(type: "int", nullable: false, defaultValue: 60),
                    ApiRateLimitPerHour = table.Column<int>(type: "int", nullable: false, defaultValue: 1000),
                    RequireApiKey = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    RequireHttps = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    ApiKeyExpiryDays = table.Column<int>(type: "int", nullable: false, defaultValue: 365),
                    EnableDataEncryption = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    EncryptionAlgorithm = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    EnableDatabaseEncryption = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    EnableFileEncryption = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    AnonymizePersonalData = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    DataRetentionDays = table.Column<int>(type: "int", nullable: false, defaultValue: 2555),
                    EnableIntrusionDetection = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    EnableAnomalyDetection = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    EnableBruteForceProtection = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    EnableSqlInjectionProtection = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    EnableXssProtection = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    EnableCsrfProtection = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    LastModifiedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastModifiedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    CustomConfiguration = table.Column<string>(type: "nvarchar(max)", maxLength: 256, nullable: true),
                    IsDefault = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    ProfileName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TenantSecuritySettings", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TenantActivityLogs_ActivityAt",
                schema: "tenant",
                table: "TenantActivityLogs",
                column: "ActivityAt",
                descending: new bool[0]);

            migrationBuilder.CreateIndex(
                name: "IX_TenantActivityLogs_ActivityType",
                schema: "tenant",
                table: "TenantActivityLogs",
                column: "ActivityType");

            migrationBuilder.CreateIndex(
                name: "IX_TenantActivityLogs_Category",
                schema: "tenant",
                table: "TenantActivityLogs",
                column: "Category");

            migrationBuilder.CreateIndex(
                name: "IX_TenantActivityLogs_EntityId",
                schema: "tenant",
                table: "TenantActivityLogs",
                column: "EntityId");

            migrationBuilder.CreateIndex(
                name: "IX_TenantActivityLogs_EntityType_EntityId",
                schema: "tenant",
                table: "TenantActivityLogs",
                columns: new[] { "EntityType", "EntityId" });

            migrationBuilder.CreateIndex(
                name: "IX_TenantActivityLogs_IsSuccess",
                schema: "tenant",
                table: "TenantActivityLogs",
                column: "IsSuccess");

            migrationBuilder.CreateIndex(
                name: "IX_TenantActivityLogs_Severity",
                schema: "tenant",
                table: "TenantActivityLogs",
                column: "Severity");

            migrationBuilder.CreateIndex(
                name: "IX_TenantActivityLogs_UserId",
                schema: "tenant",
                table: "TenantActivityLogs",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_TenantActivityLogs_UserId_ActivityAt",
                schema: "tenant",
                table: "TenantActivityLogs",
                columns: new[] { "UserId", "ActivityAt" },
                descending: new[] { false, true });

            migrationBuilder.CreateIndex(
                name: "IX_TenantApiKeys_AssociatedUserId",
                schema: "tenant",
                table: "TenantApiKeys",
                column: "AssociatedUserId");

            migrationBuilder.CreateIndex(
                name: "IX_TenantApiKeys_CreatedAt",
                schema: "tenant",
                table: "TenantApiKeys",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_TenantApiKeys_Environment",
                schema: "tenant",
                table: "TenantApiKeys",
                column: "Environment");

            migrationBuilder.CreateIndex(
                name: "IX_TenantApiKeys_ExpiresAt",
                schema: "tenant",
                table: "TenantApiKeys",
                column: "ExpiresAt");

            migrationBuilder.CreateIndex(
                name: "IX_TenantApiKeys_IsActive",
                schema: "tenant",
                table: "TenantApiKeys",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_TenantApiKeys_IsActive_Status",
                schema: "tenant",
                table: "TenantApiKeys",
                columns: new[] { "IsActive", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_TenantApiKeys_KeyPrefix",
                schema: "tenant",
                table: "TenantApiKeys",
                column: "KeyPrefix");

            migrationBuilder.CreateIndex(
                name: "IX_TenantApiKeys_KeyType",
                schema: "tenant",
                table: "TenantApiKeys",
                column: "KeyType");

            migrationBuilder.CreateIndex(
                name: "IX_TenantApiKeys_Name",
                schema: "tenant",
                table: "TenantApiKeys",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TenantApiKeys_Status",
                schema: "tenant",
                table: "TenantApiKeys",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_TenantNotifications_Category",
                schema: "tenant",
                table: "TenantNotifications",
                column: "Category");

            migrationBuilder.CreateIndex(
                name: "IX_TenantNotifications_CreatedAt",
                schema: "tenant",
                table: "TenantNotifications",
                column: "CreatedAt",
                descending: new bool[0]);

            migrationBuilder.CreateIndex(
                name: "IX_TenantNotifications_ExpiresAt",
                schema: "tenant",
                table: "TenantNotifications",
                column: "ExpiresAt");

            migrationBuilder.CreateIndex(
                name: "IX_TenantNotifications_GroupKey",
                schema: "tenant",
                table: "TenantNotifications",
                column: "GroupKey");

            migrationBuilder.CreateIndex(
                name: "IX_TenantNotifications_IsArchived",
                schema: "tenant",
                table: "TenantNotifications",
                column: "IsArchived");

            migrationBuilder.CreateIndex(
                name: "IX_TenantNotifications_IsRead",
                schema: "tenant",
                table: "TenantNotifications",
                column: "IsRead");

            migrationBuilder.CreateIndex(
                name: "IX_TenantNotifications_Priority",
                schema: "tenant",
                table: "TenantNotifications",
                column: "Priority");

            migrationBuilder.CreateIndex(
                name: "IX_TenantNotifications_ScheduledAt",
                schema: "tenant",
                table: "TenantNotifications",
                column: "ScheduledAt");

            migrationBuilder.CreateIndex(
                name: "IX_TenantNotifications_Status",
                schema: "tenant",
                table: "TenantNotifications",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_TenantNotifications_Status_IsScheduled_ScheduledAt",
                schema: "tenant",
                table: "TenantNotifications",
                columns: new[] { "Status", "IsScheduled", "ScheduledAt" });

            migrationBuilder.CreateIndex(
                name: "IX_TenantNotifications_TargetRole",
                schema: "tenant",
                table: "TenantNotifications",
                column: "TargetRole");

            migrationBuilder.CreateIndex(
                name: "IX_TenantNotifications_TargetUserId",
                schema: "tenant",
                table: "TenantNotifications",
                column: "TargetUserId");

            migrationBuilder.CreateIndex(
                name: "IX_TenantNotifications_TargetUserId_IsRead_IsArchived",
                schema: "tenant",
                table: "TenantNotifications",
                columns: new[] { "TargetUserId", "IsRead", "IsArchived" });

            migrationBuilder.CreateIndex(
                name: "IX_TenantNotifications_Type",
                schema: "tenant",
                table: "TenantNotifications",
                column: "Type");

            migrationBuilder.CreateIndex(
                name: "IX_TenantSecuritySettings_CreatedAt",
                schema: "tenant",
                table: "TenantSecuritySettings",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_TenantSecuritySettings_IsDefault",
                schema: "tenant",
                table: "TenantSecuritySettings",
                column: "IsDefault");

            migrationBuilder.CreateIndex(
                name: "IX_TenantSecuritySettings_ProfileName",
                schema: "tenant",
                table: "TenantSecuritySettings",
                column: "ProfileName",
                unique: true,
                filter: "[ProfileName] IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TenantActivityLogs",
                schema: "tenant");

            migrationBuilder.DropTable(
                name: "TenantApiKeys",
                schema: "tenant");

            migrationBuilder.DropTable(
                name: "TenantNotifications",
                schema: "tenant");

            migrationBuilder.DropTable(
                name: "TenantSecuritySettings",
                schema: "tenant");
        }
    }
}
