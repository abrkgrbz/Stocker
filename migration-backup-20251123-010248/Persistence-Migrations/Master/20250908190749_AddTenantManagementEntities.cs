using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Persistence.Migrations.Master
{
    /// <inheritdoc />
    public partial class AddTenantManagementEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "Master");

            migrationBuilder.CreateTable(
                name: "TenantActivityLogs",
                schema: "Master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ActivityType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ActivityDescription = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    EntityType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    EntityId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    OldValues = table.Column<string>(type: "nvarchar(max)", maxLength: 256, nullable: true),
                    NewValues = table.Column<string>(type: "nvarchar(max)", maxLength: 256, nullable: true),
                    IpAddress = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    UserAgent = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    UserId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    UserName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Severity = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "Info"),
                    AdditionalData = table.Column<string>(type: "nvarchar(max)", maxLength: 256, nullable: true)
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
                });

            migrationBuilder.CreateTable(
                name: "TenantApiKeys",
                schema: "Master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Key = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    LastUsedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    AllowedIpAddresses = table.Column<string>(type: "nvarchar(max)", maxLength: 256, nullable: true),
                    Scopes = table.Column<string>(type: "nvarchar(max)", maxLength: 256, nullable: true),
                    RateLimit = table.Column<int>(type: "int", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false)
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
                });

            migrationBuilder.CreateTable(
                name: "TenantBackups",
                schema: "Master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    BackupName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    BackupType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    SizeInBytes = table.Column<long>(type: "bigint", nullable: false),
                    FilePath = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    StorageLocation = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    DownloadUrl = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    ExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IncludesDatabase = table.Column<bool>(type: "bit", nullable: false),
                    IncludesFiles = table.Column<bool>(type: "bit", nullable: false),
                    IncludesConfiguration = table.Column<bool>(type: "bit", nullable: false),
                    IsCompressed = table.Column<bool>(type: "bit", nullable: false),
                    IsEncrypted = table.Column<bool>(type: "bit", nullable: false),
                    EncryptionKey = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    IsRestorable = table.Column<bool>(type: "bit", nullable: false),
                    LastRestoredAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RestoreCount = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    RestoreNotes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    ErrorMessage = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    RetryCount = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Tags = table.Column<string>(type: "nvarchar(max)", maxLength: 256, nullable: true),
                    Metadata = table.Column<string>(type: "nvarchar(max)", maxLength: 256, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TenantBackups", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TenantBackups_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalSchema: "master",
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TenantHealthChecks",
                schema: "Master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CheckedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    OverallStatus = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    HealthScore = table.Column<int>(type: "int", nullable: false),
                    IsDatabaseHealthy = table.Column<bool>(type: "bit", nullable: false),
                    DatabaseResponseTimeMs = table.Column<long>(type: "bigint", nullable: false),
                    DatabaseSizeMb = table.Column<long>(type: "bigint", nullable: false),
                    ActiveConnections = table.Column<int>(type: "int", nullable: false),
                    IsApiHealthy = table.Column<bool>(type: "bit", nullable: false),
                    ApiResponseTimeMs = table.Column<long>(type: "bigint", nullable: false),
                    ApiErrorRate = table.Column<int>(type: "int", nullable: false),
                    ApiRequestsPerMinute = table.Column<int>(type: "int", nullable: false),
                    IsStorageHealthy = table.Column<bool>(type: "bit", nullable: false),
                    StorageUsedMb = table.Column<long>(type: "bigint", nullable: false),
                    StorageAvailableMb = table.Column<long>(type: "bigint", nullable: false),
                    StorageUsagePercent = table.Column<int>(type: "int", nullable: false),
                    IsEmailServiceHealthy = table.Column<bool>(type: "bit", nullable: false),
                    IsNotificationServiceHealthy = table.Column<bool>(type: "bit", nullable: false),
                    IsBackgroundJobsHealthy = table.Column<bool>(type: "bit", nullable: false),
                    IsCacheHealthy = table.Column<bool>(type: "bit", nullable: false),
                    CpuUsagePercent = table.Column<double>(type: "float(5)", precision: 5, scale: 2, nullable: false),
                    MemoryUsagePercent = table.Column<double>(type: "float(5)", precision: 5, scale: 2, nullable: false),
                    ActiveUsers = table.Column<int>(type: "int", nullable: false),
                    ConcurrentSessions = table.Column<int>(type: "int", nullable: false),
                    FailedLoginAttempts = table.Column<int>(type: "int", nullable: false),
                    SecurityIncidents = table.Column<int>(type: "int", nullable: false),
                    LastSecurityScan = table.Column<DateTime>(type: "datetime2", nullable: true),
                    HasSecurityUpdates = table.Column<bool>(type: "bit", nullable: false),
                    LastBackupDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsBackupHealthy = table.Column<bool>(type: "bit", nullable: false),
                    LastBackupSizeMb = table.Column<long>(type: "bigint", nullable: false),
                    Errors = table.Column<string>(type: "nvarchar(max)", maxLength: 256, nullable: true),
                    Warnings = table.Column<string>(type: "nvarchar(max)", maxLength: 256, nullable: true),
                    ErrorCount = table.Column<int>(type: "int", nullable: false),
                    WarningCount = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TenantHealthChecks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TenantHealthChecks_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalSchema: "master",
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TenantIntegrations",
                schema: "Master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Type = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Configuration = table.Column<string>(type: "nvarchar(max)", maxLength: 256, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsConnected = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    LastSyncAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastSyncStatus = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    LastError = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    WebhookUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ApiKey = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    RefreshToken = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    TokenExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: true)
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
                });

            migrationBuilder.CreateTable(
                name: "TenantSecuritySettings",
                schema: "Master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MinPasswordLength = table.Column<int>(type: "int", nullable: false),
                    RequireUppercase = table.Column<bool>(type: "bit", nullable: false),
                    RequireLowercase = table.Column<bool>(type: "bit", nullable: false),
                    RequireNumbers = table.Column<bool>(type: "bit", nullable: false),
                    RequireSpecialCharacters = table.Column<bool>(type: "bit", nullable: false),
                    PasswordExpirationDays = table.Column<int>(type: "int", nullable: false),
                    PasswordHistoryCount = table.Column<int>(type: "int", nullable: false),
                    EnableAccountLockout = table.Column<bool>(type: "bit", nullable: false),
                    MaxFailedLoginAttempts = table.Column<int>(type: "int", nullable: false),
                    LockoutDurationMinutes = table.Column<int>(type: "int", nullable: false),
                    SessionTimeoutMinutes = table.Column<int>(type: "int", nullable: false),
                    EnableConcurrentSessions = table.Column<bool>(type: "bit", nullable: false),
                    MaxConcurrentSessions = table.Column<int>(type: "int", nullable: false),
                    EnforceTwoFactor = table.Column<bool>(type: "bit", nullable: false),
                    AllowedTwoFactorProviders = table.Column<string>(type: "nvarchar(max)", maxLength: 256, nullable: true),
                    EnableIpWhitelist = table.Column<bool>(type: "bit", nullable: false),
                    WhitelistedIps = table.Column<string>(type: "nvarchar(max)", maxLength: 256, nullable: true),
                    EnableIpBlacklist = table.Column<bool>(type: "bit", nullable: false),
                    BlacklistedIps = table.Column<string>(type: "nvarchar(max)", maxLength: 256, nullable: true),
                    EnableHsts = table.Column<bool>(type: "bit", nullable: false),
                    EnableXFrameOptions = table.Column<bool>(type: "bit", nullable: false),
                    EnableXContentTypeOptions = table.Column<bool>(type: "bit", nullable: false),
                    EnableCsp = table.Column<bool>(type: "bit", nullable: false),
                    CspPolicy = table.Column<string>(type: "nvarchar(max)", maxLength: 256, nullable: true),
                    EnableAuditLog = table.Column<bool>(type: "bit", nullable: false),
                    EnableDataEncryption = table.Column<bool>(type: "bit", nullable: false),
                    EnableSensitiveDataMasking = table.Column<bool>(type: "bit", nullable: false),
                    AuditLogRetentionDays = table.Column<int>(type: "int", nullable: false),
                    EnableApiRateLimiting = table.Column<bool>(type: "bit", nullable: false),
                    ApiRateLimitPerMinute = table.Column<int>(type: "int", nullable: false),
                    RequireApiAuthentication = table.Column<bool>(type: "bit", nullable: false),
                    EnableApiKeyRotation = table.Column<bool>(type: "bit", nullable: false),
                    ApiKeyRotationDays = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true)
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
                });

            migrationBuilder.CreateTable(
                name: "TenantSettings",
                schema: "Master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TimeZone = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    DateFormat = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    TimeFormat = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Currency = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    Language = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    Country = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    CompanyName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    TaxNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Address = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Phone = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Email = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Website = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    EnableTwoFactor = table.Column<bool>(type: "bit", nullable: false),
                    EnableApiAccess = table.Column<bool>(type: "bit", nullable: false),
                    EnableWebhooks = table.Column<bool>(type: "bit", nullable: false),
                    EnableEmailNotifications = table.Column<bool>(type: "bit", nullable: false),
                    EnableSmsNotifications = table.Column<bool>(type: "bit", nullable: false),
                    EnableAutoBackup = table.Column<bool>(type: "bit", nullable: false),
                    MaxUsers = table.Column<int>(type: "int", nullable: false),
                    MaxStorage = table.Column<int>(type: "int", nullable: false),
                    MaxApiCallsPerMonth = table.Column<int>(type: "int", nullable: false),
                    DataRetentionDays = table.Column<int>(type: "int", nullable: false),
                    SessionTimeoutMinutes = table.Column<int>(type: "int", nullable: false),
                    LogoUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    FaviconUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    PrimaryColor = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    SecondaryColor = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    CustomCss = table.Column<string>(type: "nvarchar(max)", maxLength: 256, nullable: true),
                    SmtpHost = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    SmtpPort = table.Column<int>(type: "int", nullable: true),
                    SmtpUsername = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    SmtpPassword = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    SmtpEnableSsl = table.Column<bool>(type: "bit", nullable: false),
                    EmailFromAddress = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    EmailFromName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true)
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
                });

            migrationBuilder.CreateTable(
                name: "TenantWebhooks",
                schema: "Master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Url = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Events = table.Column<string>(type: "nvarchar(max)", maxLength: 256, nullable: false),
                    Headers = table.Column<string>(type: "nvarchar(max)", maxLength: 256, nullable: true),
                    Secret = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    MaxRetries = table.Column<int>(type: "int", nullable: false, defaultValue: 3),
                    TimeoutSeconds = table.Column<int>(type: "int", nullable: false, defaultValue: 30),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    LastTriggeredAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastStatus = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    FailureCount = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    SuccessCount = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false)
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
                });

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
                name: "IX_TenantBackups_CreatedAt",
                schema: "Master",
                table: "TenantBackups",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_TenantBackups_TenantId",
                schema: "Master",
                table: "TenantBackups",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_TenantBackups_TenantId_BackupType",
                schema: "Master",
                table: "TenantBackups",
                columns: new[] { "TenantId", "BackupType" });

            migrationBuilder.CreateIndex(
                name: "IX_TenantBackups_TenantId_CreatedAt",
                schema: "Master",
                table: "TenantBackups",
                columns: new[] { "TenantId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_TenantBackups_TenantId_Status",
                schema: "Master",
                table: "TenantBackups",
                columns: new[] { "TenantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_TenantHealthChecks_CheckedAt",
                schema: "Master",
                table: "TenantHealthChecks",
                column: "CheckedAt");

            migrationBuilder.CreateIndex(
                name: "IX_TenantHealthChecks_TenantId",
                schema: "Master",
                table: "TenantHealthChecks",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_TenantHealthChecks_TenantId_CheckedAt",
                schema: "Master",
                table: "TenantHealthChecks",
                columns: new[] { "TenantId", "CheckedAt" });

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
                name: "IX_TenantSecuritySettings_TenantId",
                schema: "Master",
                table: "TenantSecuritySettings",
                column: "TenantId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TenantSettings_TenantId",
                schema: "Master",
                table: "TenantSettings",
                column: "TenantId",
                unique: true);

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
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TenantActivityLogs",
                schema: "Master");

            migrationBuilder.DropTable(
                name: "TenantApiKeys",
                schema: "Master");

            migrationBuilder.DropTable(
                name: "TenantBackups",
                schema: "Master");

            migrationBuilder.DropTable(
                name: "TenantHealthChecks",
                schema: "Master");

            migrationBuilder.DropTable(
                name: "TenantIntegrations",
                schema: "Master");

            migrationBuilder.DropTable(
                name: "TenantSecuritySettings",
                schema: "Master");

            migrationBuilder.DropTable(
                name: "TenantSettings",
                schema: "Master");

            migrationBuilder.DropTable(
                name: "TenantWebhooks",
                schema: "Master");
        }
    }
}
