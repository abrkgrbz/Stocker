using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Stocker.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class InitialPostgreSQL : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "master");

            migrationBuilder.EnsureSchema(
                name: "dbo");

            migrationBuilder.EnsureSchema(
                name: "master");

            migrationBuilder.CreateTable(
                name: "Invoices",
                schema: "master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    SubscriptionId = table.Column<Guid>(type: "uuid", nullable: false),
                    InvoiceNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    SubtotalAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    SubtotalCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    TaxAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    TaxCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    TotalAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    TotalCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    PaidAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    PaidCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    TaxRate = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    IssueDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DueDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    PaidDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Notes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    BillingStreet = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    BillingBuilding = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    BillingFloor = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    BillingApartment = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    BillingCity = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    BillingState = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    BillingCountry = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    BillingPostalCode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Invoices", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "MasterUsers",
                schema: "master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Username = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    PasswordHash = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    PasswordSalt = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    FirstName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    LastName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    PhoneNumber = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    UserType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    IsEmailVerified = table.Column<bool>(type: "boolean", nullable: false),
                    TwoFactorEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    TwoFactorSecret = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    BackupCodes = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastLoginAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    EmailVerifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    PasswordChangedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    FailedLoginAttempts = table.Column<int>(type: "integer", nullable: false),
                    LockoutEndAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TwoFactorFailedAttempts = table.Column<int>(type: "integer", nullable: false),
                    TwoFactorLockoutEndAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ProfilePictureUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Timezone = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    PreferredLanguage = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true),
                    EmailVerificationToken = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    EmailVerificationOtpCode = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true),
                    EmailVerificationTokenExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    EmailVerificationTokenCreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    EmailVerificationTokenIsUsed = table.Column<bool>(type: "boolean", nullable: true),
                    EmailVerificationTokenUsedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    PasswordResetToken = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    PasswordResetTokenExpiry = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MasterUsers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Packages",
                schema: "master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    Type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    BasePriceAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    BasePriceCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    MaxUsers = table.Column<int>(type: "integer", nullable: false),
                    MaxStorageGB = table.Column<int>(type: "integer", nullable: false),
                    MaxProjects = table.Column<int>(type: "integer", nullable: false),
                    MaxApiCallsPerMonth = table.Column<int>(type: "integer", nullable: false),
                    ModuleLimits = table.Column<string>(type: "text", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    IsPublic = table.Column<bool>(type: "boolean", nullable: false),
                    TrialDays = table.Column<int>(type: "integer", nullable: false),
                    DisplayOrder = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Packages", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ScheduledMigrations",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ScheduleId = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    ScheduledTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    MigrationName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    ModuleName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    CreatedBy = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    ExecutedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Error = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    HangfireJobId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ScheduledMigrations", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SecurityAuditLogs",
                schema: "master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Timestamp = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    Event = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: true),
                    Email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    TenantCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    IpAddress = table.Column<string>(type: "character varying(45)", maxLength: 45, nullable: true),
                    UserAgent = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    RequestId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    RiskScore = table.Column<int>(type: "integer", nullable: true),
                    Blocked = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    Metadata = table.Column<string>(type: "text", maxLength: 256, nullable: true),
                    DurationMs = table.Column<int>(type: "integer", nullable: true),
                    GdprCategory = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    RetentionDays = table.Column<int>(type: "integer", nullable: false, defaultValue: 365),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SecurityAuditLogs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SystemSettings",
                schema: "master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Category = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    Key = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    Value = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    Description = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    DataType = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    IsSystem = table.Column<bool>(type: "boolean", nullable: false),
                    IsEncrypted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SystemSettings", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Tenants",
                schema: "master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    DatabaseName = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    ConnectionString = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    LogoUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    ContactEmail = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    ContactPhone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedBy = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    UpdatedBy = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tenants", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "InvoiceItems",
                schema: "master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    InvoiceId = table.Column<Guid>(type: "uuid", nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Quantity = table.Column<int>(type: "integer", nullable: false),
                    UnitPriceAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    UnitPriceCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    LineTotalAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    LineTotalCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InvoiceItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InvoiceItems_Invoices_InvoiceId",
                        column: x => x.InvoiceId,
                        principalSchema: "master",
                        principalTable: "Invoices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Payments",
                schema: "master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    InvoiceId = table.Column<Guid>(type: "uuid", nullable: false),
                    Method = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Amount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    Currency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    TransactionId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Notes = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    ProcessedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsRefund = table.Column<bool>(type: "boolean", nullable: false),
                    RefundReason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Payments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Payments_Invoices_InvoiceId",
                        column: x => x.InvoiceId,
                        principalSchema: "master",
                        principalTable: "Invoices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MasterUserRefreshTokens",
                schema: "master",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Token = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DeviceInfo = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    IpAddress = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MasterUserRefreshTokens", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MasterUserRefreshTokens_MasterUsers_UserId",
                        column: x => x.UserId,
                        principalSchema: "master",
                        principalTable: "MasterUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserLoginHistories",
                schema: "master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    IsSuccessful = table.Column<bool>(type: "boolean", nullable: false),
                    LoginAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IpAddress = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    UserAgent = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    FailureReason = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserLoginHistories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserLoginHistories_MasterUsers_UserId",
                        column: x => x.UserId,
                        principalSchema: "master",
                        principalTable: "MasterUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PackageFeatures",
                schema: "master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PackageId = table.Column<Guid>(type: "uuid", nullable: false),
                    FeatureCode = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    FeatureName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    IsHighlighted = table.Column<bool>(type: "boolean", nullable: false),
                    DisplayOrder = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PackageFeatures", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PackageFeatures_Packages_PackageId",
                        column: x => x.PackageId,
                        principalSchema: "master",
                        principalTable: "Packages",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PackageModules",
                schema: "master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PackageId = table.Column<Guid>(type: "uuid", nullable: false),
                    ModuleCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ModuleName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    IsIncluded = table.Column<bool>(type: "boolean", nullable: false),
                    MaxEntities = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PackageModules", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PackageModules_Packages_PackageId",
                        column: x => x.PackageId,
                        principalSchema: "master",
                        principalTable: "Packages",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Subscriptions",
                schema: "master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    PackageId = table.Column<Guid>(type: "uuid", nullable: false),
                    SubscriptionNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    BillingCycle = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    PriceAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    PriceCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    StartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CurrentPeriodStart = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CurrentPeriodEnd = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    TrialEndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CancelledAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CancellationReason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    AutoRenew = table.Column<bool>(type: "boolean", nullable: false),
                    UserCount = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Subscriptions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Subscriptions_Packages_PackageId",
                        column: x => x.PackageId,
                        principalSchema: "master",
                        principalTable: "Packages",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Subscriptions_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalSchema: "master",
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TenantBackups",
                schema: "master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    BackupName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    BackupType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    SizeInBytes = table.Column<long>(type: "bigint", nullable: false),
                    FilePath = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    StorageLocation = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    DownloadUrl = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    ExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IncludesDatabase = table.Column<bool>(type: "boolean", nullable: false),
                    IncludesFiles = table.Column<bool>(type: "boolean", nullable: false),
                    IncludesConfiguration = table.Column<bool>(type: "boolean", nullable: false),
                    IsCompressed = table.Column<bool>(type: "boolean", nullable: false),
                    IsEncrypted = table.Column<bool>(type: "boolean", nullable: false),
                    EncryptionKey = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    IsRestorable = table.Column<bool>(type: "boolean", nullable: false),
                    LastRestoredAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    RestoreCount = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    RestoreNotes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    ErrorMessage = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    RetryCount = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Tags = table.Column<string>(type: "text", maxLength: 256, nullable: true),
                    Metadata = table.Column<string>(type: "text", maxLength: 256, nullable: true),
                    TenantId1 = table.Column<Guid>(type: "uuid", nullable: true)
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
                    table.ForeignKey(
                        name: "FK_TenantBackups_Tenants_TenantId1",
                        column: x => x.TenantId1,
                        principalSchema: "master",
                        principalTable: "Tenants",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "TenantBillings",
                schema: "master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CompanyName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    TaxNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    TaxOffice = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    AddressLine1 = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    AddressLine2 = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    City = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    State = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    PostalCode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Country = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    InvoiceEmail = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    CCEmail = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    ContactPhone = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    PreferredPaymentMethod = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    BillingCycle = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    BillingDay = table.Column<int>(type: "integer", nullable: false),
                    AutoPaymentEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    PaymentLimit = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    Currency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    BankName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    BankBranch = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    AccountHolder = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    IBAN = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    SwiftCode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    AccountNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    RoutingNumber = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    CardHolderName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    CardNumberMasked = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    CardType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    CardExpiryMonth = table.Column<int>(type: "integer", nullable: true),
                    CardExpiryYear = table.Column<int>(type: "integer", nullable: true),
                    CardToken = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    CardAddedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    PayPalEmail = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    PayPalAccountId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    SendInvoiceByEmail = table.Column<bool>(type: "boolean", nullable: false),
                    SendInvoiceByPost = table.Column<bool>(type: "boolean", nullable: false),
                    ConsolidatedBilling = table.Column<bool>(type: "boolean", nullable: false),
                    PurchaseOrderNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    CostCenter = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    LatePaymentInterestRate = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: true),
                    PaymentTermsDays = table.Column<int>(type: "integer", nullable: true),
                    GracePeriodDays = table.Column<int>(type: "integer", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    IsVerified = table.Column<bool>(type: "boolean", nullable: false),
                    VerifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    VerifiedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    LastPaymentDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastPaymentAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    NextBillingDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TenantBillings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TenantBillings_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalSchema: "master",
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TenantContracts",
                schema: "master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    ContractNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ContractType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    StartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ContractValue = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    Currency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    PaymentTerms = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Terms = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: true),
                    SpecialConditions = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    NoticePeriodDays = table.Column<int>(type: "integer", nullable: false),
                    AutoRenewal = table.Column<bool>(type: "boolean", nullable: false),
                    RenewalPeriodMonths = table.Column<int>(type: "integer", nullable: true),
                    RenewalPriceIncrease = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: true),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    SignedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    SignedBy = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    SignerTitle = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    SignerEmail = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    DocumentUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    DocumentHash = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    RequiresApproval = table.Column<bool>(type: "boolean", nullable: false),
                    ApprovedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ApprovedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    ApprovalNotes = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    TerminationDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TerminationReason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    TerminatedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    EarlyTerminationFee = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    UptimeGuarantee = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: true),
                    ResponseTimeHours = table.Column<int>(type: "integer", nullable: true),
                    ResolutionTimeHours = table.Column<int>(type: "integer", nullable: true),
                    SupportLevel = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    TenantId1 = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TenantContracts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TenantContracts_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalSchema: "master",
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TenantContracts_Tenants_TenantId1",
                        column: x => x.TenantId1,
                        principalSchema: "master",
                        principalTable: "Tenants",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "TenantDomains",
                schema: "master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    DomainName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    IsPrimary = table.Column<bool>(type: "boolean", nullable: false),
                    IsVerified = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    VerifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TenantDomains", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TenantDomains_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalSchema: "master",
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TenantHealthChecks",
                schema: "master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CheckedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    OverallStatus = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    HealthScore = table.Column<int>(type: "integer", nullable: false),
                    IsDatabaseHealthy = table.Column<bool>(type: "boolean", nullable: false),
                    DatabaseResponseTimeMs = table.Column<long>(type: "bigint", nullable: false),
                    DatabaseSizeMb = table.Column<long>(type: "bigint", nullable: false),
                    ActiveConnections = table.Column<int>(type: "integer", nullable: false),
                    IsApiHealthy = table.Column<bool>(type: "boolean", nullable: false),
                    ApiResponseTimeMs = table.Column<long>(type: "bigint", nullable: false),
                    ApiErrorRate = table.Column<int>(type: "integer", nullable: false),
                    ApiRequestsPerMinute = table.Column<int>(type: "integer", nullable: false),
                    IsStorageHealthy = table.Column<bool>(type: "boolean", nullable: false),
                    StorageUsedMb = table.Column<long>(type: "bigint", nullable: false),
                    StorageAvailableMb = table.Column<long>(type: "bigint", nullable: false),
                    StorageUsagePercent = table.Column<int>(type: "integer", nullable: false),
                    IsEmailServiceHealthy = table.Column<bool>(type: "boolean", nullable: false),
                    IsNotificationServiceHealthy = table.Column<bool>(type: "boolean", nullable: false),
                    IsBackgroundJobsHealthy = table.Column<bool>(type: "boolean", nullable: false),
                    IsCacheHealthy = table.Column<bool>(type: "boolean", nullable: false),
                    CpuUsagePercent = table.Column<double>(type: "double precision", precision: 5, scale: 2, nullable: false),
                    MemoryUsagePercent = table.Column<double>(type: "double precision", precision: 5, scale: 2, nullable: false),
                    ActiveUsers = table.Column<int>(type: "integer", nullable: false),
                    ConcurrentSessions = table.Column<int>(type: "integer", nullable: false),
                    FailedLoginAttempts = table.Column<int>(type: "integer", nullable: false),
                    SecurityIncidents = table.Column<int>(type: "integer", nullable: false),
                    LastSecurityScan = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    HasSecurityUpdates = table.Column<bool>(type: "boolean", nullable: false),
                    LastBackupDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsBackupHealthy = table.Column<bool>(type: "boolean", nullable: false),
                    LastBackupSizeMb = table.Column<long>(type: "bigint", nullable: false),
                    Errors = table.Column<string>(type: "text", maxLength: 256, nullable: true),
                    Warnings = table.Column<string>(type: "text", maxLength: 256, nullable: true),
                    ErrorCount = table.Column<int>(type: "integer", nullable: false),
                    WarningCount = table.Column<int>(type: "integer", nullable: false),
                    TenantId1 = table.Column<Guid>(type: "uuid", nullable: true)
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
                    table.ForeignKey(
                        name: "FK_TenantHealthChecks_Tenants_TenantId1",
                        column: x => x.TenantId1,
                        principalSchema: "master",
                        principalTable: "Tenants",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "TenantLimits",
                schema: "master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    MaxUsers = table.Column<int>(type: "integer", nullable: false),
                    CurrentUsers = table.Column<int>(type: "integer", nullable: false),
                    MaxAdminUsers = table.Column<int>(type: "integer", nullable: false),
                    CurrentAdminUsers = table.Column<int>(type: "integer", nullable: false),
                    MaxConcurrentUsers = table.Column<int>(type: "integer", nullable: false),
                    CurrentConcurrentUsers = table.Column<int>(type: "integer", nullable: false),
                    MaxStorageGB = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    CurrentStorageGB = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    MaxDatabaseSizeGB = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    CurrentDatabaseSizeGB = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    MaxFileUploadSizeMB = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    MaxMonthlyTransactions = table.Column<long>(type: "bigint", nullable: false),
                    CurrentMonthlyTransactions = table.Column<long>(type: "bigint", nullable: false),
                    MaxDailyTransactions = table.Column<long>(type: "bigint", nullable: false),
                    CurrentDailyTransactions = table.Column<long>(type: "bigint", nullable: false),
                    MaxTransactionsPerMinute = table.Column<int>(type: "integer", nullable: false),
                    MaxMonthlyApiCalls = table.Column<long>(type: "bigint", nullable: false),
                    CurrentMonthlyApiCalls = table.Column<long>(type: "bigint", nullable: false),
                    MaxDailyApiCalls = table.Column<long>(type: "bigint", nullable: false),
                    CurrentDailyApiCalls = table.Column<long>(type: "bigint", nullable: false),
                    MaxApiCallsPerMinute = table.Column<int>(type: "integer", nullable: false),
                    MaxApiKeys = table.Column<int>(type: "integer", nullable: false),
                    CurrentApiKeys = table.Column<int>(type: "integer", nullable: false),
                    MaxCustomModules = table.Column<int>(type: "integer", nullable: false),
                    CurrentCustomModules = table.Column<int>(type: "integer", nullable: false),
                    MaxCustomReports = table.Column<int>(type: "integer", nullable: false),
                    CurrentCustomReports = table.Column<int>(type: "integer", nullable: false),
                    MaxCustomFields = table.Column<int>(type: "integer", nullable: false),
                    CurrentCustomFields = table.Column<int>(type: "integer", nullable: false),
                    MaxWorkflows = table.Column<int>(type: "integer", nullable: false),
                    CurrentWorkflows = table.Column<int>(type: "integer", nullable: false),
                    MaxMonthlyEmails = table.Column<long>(type: "bigint", nullable: false),
                    CurrentMonthlyEmails = table.Column<long>(type: "bigint", nullable: false),
                    MaxMonthlySMS = table.Column<long>(type: "bigint", nullable: false),
                    CurrentMonthlySMS = table.Column<long>(type: "bigint", nullable: false),
                    MaxEmailTemplates = table.Column<int>(type: "integer", nullable: false),
                    CurrentEmailTemplates = table.Column<int>(type: "integer", nullable: false),
                    MaxIntegrations = table.Column<int>(type: "integer", nullable: false),
                    CurrentIntegrations = table.Column<int>(type: "integer", nullable: false),
                    MaxWebhooks = table.Column<int>(type: "integer", nullable: false),
                    CurrentWebhooks = table.Column<int>(type: "integer", nullable: false),
                    MaxCustomDomains = table.Column<int>(type: "integer", nullable: false),
                    CurrentCustomDomains = table.Column<int>(type: "integer", nullable: false),
                    MaxBackupsPerMonth = table.Column<int>(type: "integer", nullable: false),
                    CurrentBackupsThisMonth = table.Column<int>(type: "integer", nullable: false),
                    MaxExportsPerDay = table.Column<int>(type: "integer", nullable: false),
                    CurrentExportsToday = table.Column<int>(type: "integer", nullable: false),
                    MaxExportSizeGB = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    MaxDatabaseConnections = table.Column<int>(type: "integer", nullable: false),
                    CurrentDatabaseConnections = table.Column<int>(type: "integer", nullable: false),
                    MaxCPUCores = table.Column<int>(type: "integer", nullable: false),
                    MaxMemoryGB = table.Column<int>(type: "integer", nullable: false),
                    DataRetentionDays = table.Column<int>(type: "integer", nullable: false),
                    AuditLogRetentionDays = table.Column<int>(type: "integer", nullable: false),
                    BackupRetentionDays = table.Column<int>(type: "integer", nullable: false),
                    UserLimitAction = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    StorageLimitAction = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    TransactionLimitAction = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ApiLimitAction = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    WarningThresholdPercentage = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    SendWarningNotifications = table.Column<bool>(type: "boolean", nullable: false),
                    LastWarningNotificationSent = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    SendLimitExceededNotifications = table.Column<bool>(type: "boolean", nullable: false),
                    LastLimitExceededNotificationSent = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    LastResetDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    NextResetDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TenantLimits", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TenantLimits_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalSchema: "master",
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TenantRegistrations",
                schema: "master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    RegistrationCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    CompanyName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    CompanyCode = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    TaxNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    TaxOffice = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    ContactPersonName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    ContactPersonSurname = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    ContactEmail = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    ContactPhone = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    CompanyWebsite = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    EmployeeCount = table.Column<int>(type: "integer", nullable: false),
                    Industry = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    AdminEmail = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    AdminUsername = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    AdminFirstName = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    AdminLastName = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    AdminPhone = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    AdminTitle = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    AdminPasswordHash = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    PackageName = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    BillingCycle = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    AddressLine1 = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    AddressLine2 = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    City = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    State = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    PostalCode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Country = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    RegistrationDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ApprovalDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    RejectionDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    RejectionReason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    ApprovedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    RejectedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    SelectedPackageId = table.Column<Guid>(type: "uuid", nullable: true),
                    ReferralCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    PromoCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    EmailVerified = table.Column<bool>(type: "boolean", nullable: false),
                    EmailVerifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    EmailVerificationToken = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    EmailVerificationCode = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    PhoneVerified = table.Column<bool>(type: "boolean", nullable: false),
                    PhoneVerifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    PhoneVerificationCode = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true),
                    TermsAccepted = table.Column<bool>(type: "boolean", nullable: false),
                    TermsAcceptedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TermsVersion = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    PrivacyPolicyAccepted = table.Column<bool>(type: "boolean", nullable: false),
                    PrivacyPolicyAcceptedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    MarketingEmailsAllowed = table.Column<bool>(type: "boolean", nullable: false),
                    MarketingSmsAllowed = table.Column<bool>(type: "boolean", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TenantRegistrations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TenantRegistrations_Packages_SelectedPackageId",
                        column: x => x.SelectedPackageId,
                        principalSchema: "master",
                        principalTable: "Packages",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TenantRegistrations_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalSchema: "master",
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TenantSettings",
                schema: "master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CompanyName = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    Timezone = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    Language = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    DateFormat = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    TimeFormat = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    Currency = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    FiscalYearStart = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    WeekStart = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    PrimaryColor = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    SecondaryColor = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    LogoUrl = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    FaviconUrl = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    CustomFooter = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    CustomCSS = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    HideWatermark = table.Column<bool>(type: "boolean", nullable: false),
                    EmailSettingsJson = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    NotificationSettingsJson = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    SecuritySettingsJson = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    ApiSettingsJson = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    StorageSettingsJson = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    AdvancedSettingsJson = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedBy = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    UpdatedBy = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true)
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
                name: "SubscriptionModules",
                schema: "master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SubscriptionId = table.Column<Guid>(type: "uuid", nullable: false),
                    ModuleCode = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    ModuleName = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    MaxEntities = table.Column<int>(type: "integer", nullable: true),
                    AddedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SubscriptionModules", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SubscriptionModules_Subscriptions_SubscriptionId",
                        column: x => x.SubscriptionId,
                        principalSchema: "master",
                        principalTable: "Subscriptions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SubscriptionUsages",
                schema: "master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SubscriptionId = table.Column<Guid>(type: "uuid", nullable: false),
                    MetricName = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    Value = table.Column<int>(type: "integer", nullable: false),
                    RecordedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SubscriptionUsages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SubscriptionUsages_Subscriptions_SubscriptionId",
                        column: x => x.SubscriptionId,
                        principalSchema: "master",
                        principalTable: "Subscriptions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_InvoiceItems_InvoiceId",
                schema: "master",
                table: "InvoiceItems",
                column: "InvoiceId");

            migrationBuilder.CreateIndex(
                name: "IX_Invoices_InvoiceNumber",
                schema: "master",
                table: "Invoices",
                column: "InvoiceNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Invoices_Status",
                schema: "master",
                table: "Invoices",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Invoices_Status_DueDate",
                schema: "master",
                table: "Invoices",
                columns: new[] { "Status", "DueDate" });

            migrationBuilder.CreateIndex(
                name: "IX_Invoices_TenantId",
                schema: "master",
                table: "Invoices",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_MasterUserRefreshTokens_Token",
                schema: "master",
                table: "MasterUserRefreshTokens",
                column: "Token");

            migrationBuilder.CreateIndex(
                name: "IX_MasterUserRefreshTokens_UserId",
                schema: "master",
                table: "MasterUserRefreshTokens",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_MasterUsers_Email",
                schema: "master",
                table: "MasterUsers",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MasterUsers_IsActive",
                schema: "master",
                table: "MasterUsers",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_MasterUsers_Username",
                schema: "master",
                table: "MasterUsers",
                column: "Username",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MasterUsers_UserType",
                schema: "master",
                table: "MasterUsers",
                column: "UserType");

            migrationBuilder.CreateIndex(
                name: "IX_PackageFeatures_PackageId",
                schema: "master",
                table: "PackageFeatures",
                column: "PackageId");

            migrationBuilder.CreateIndex(
                name: "IX_PackageFeatures_PackageId_FeatureCode",
                schema: "master",
                table: "PackageFeatures",
                columns: new[] { "PackageId", "FeatureCode" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PackageModules_PackageId",
                schema: "master",
                table: "PackageModules",
                column: "PackageId");

            migrationBuilder.CreateIndex(
                name: "IX_PackageModules_PackageId_ModuleCode",
                schema: "master",
                table: "PackageModules",
                columns: new[] { "PackageId", "ModuleCode" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Packages_IsActive",
                schema: "master",
                table: "Packages",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_Packages_IsPublic_DisplayOrder",
                schema: "master",
                table: "Packages",
                columns: new[] { "IsPublic", "DisplayOrder" });

            migrationBuilder.CreateIndex(
                name: "IX_Packages_Type",
                schema: "master",
                table: "Packages",
                column: "Type");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_InvoiceId",
                schema: "master",
                table: "Payments",
                column: "InvoiceId");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_ProcessedAt",
                schema: "master",
                table: "Payments",
                column: "ProcessedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_Status",
                schema: "master",
                table: "Payments",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_ScheduledMigrations_ScheduledTime",
                schema: "dbo",
                table: "ScheduledMigrations",
                column: "ScheduledTime");

            migrationBuilder.CreateIndex(
                name: "IX_ScheduledMigrations_ScheduleId",
                schema: "dbo",
                table: "ScheduledMigrations",
                column: "ScheduleId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ScheduledMigrations_Status",
                schema: "dbo",
                table: "ScheduledMigrations",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_ScheduledMigrations_TenantId",
                schema: "dbo",
                table: "ScheduledMigrations",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_SecurityAuditLogs_Email",
                schema: "master",
                table: "SecurityAuditLogs",
                column: "Email");

            migrationBuilder.CreateIndex(
                name: "IX_SecurityAuditLogs_Email_Timestamp",
                schema: "master",
                table: "SecurityAuditLogs",
                columns: new[] { "Email", "Timestamp" });

            migrationBuilder.CreateIndex(
                name: "IX_SecurityAuditLogs_Event",
                schema: "master",
                table: "SecurityAuditLogs",
                column: "Event");

            migrationBuilder.CreateIndex(
                name: "IX_SecurityAuditLogs_Event_Timestamp",
                schema: "master",
                table: "SecurityAuditLogs",
                columns: new[] { "Event", "Timestamp" });

            migrationBuilder.CreateIndex(
                name: "IX_SecurityAuditLogs_IpAddress",
                schema: "master",
                table: "SecurityAuditLogs",
                column: "IpAddress");

            migrationBuilder.CreateIndex(
                name: "IX_SecurityAuditLogs_IpAddress_Timestamp",
                schema: "master",
                table: "SecurityAuditLogs",
                columns: new[] { "IpAddress", "Timestamp" });

            migrationBuilder.CreateIndex(
                name: "IX_SecurityAuditLogs_RiskScore",
                schema: "master",
                table: "SecurityAuditLogs",
                column: "RiskScore",
                filter: "\"RiskScore\" > 50");

            migrationBuilder.CreateIndex(
                name: "IX_SecurityAuditLogs_TenantCode",
                schema: "master",
                table: "SecurityAuditLogs",
                column: "TenantCode");

            migrationBuilder.CreateIndex(
                name: "IX_SecurityAuditLogs_Timestamp",
                schema: "master",
                table: "SecurityAuditLogs",
                column: "Timestamp",
                descending: new bool[0]);

            migrationBuilder.CreateIndex(
                name: "IX_SecurityAuditLogs_UserId",
                schema: "master",
                table: "SecurityAuditLogs",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_SubscriptionModules_SubscriptionId",
                schema: "master",
                table: "SubscriptionModules",
                column: "SubscriptionId");

            migrationBuilder.CreateIndex(
                name: "IX_Subscriptions_PackageId",
                schema: "master",
                table: "Subscriptions",
                column: "PackageId");

            migrationBuilder.CreateIndex(
                name: "IX_Subscriptions_Status",
                schema: "master",
                table: "Subscriptions",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Subscriptions_Status_CurrentPeriodEnd",
                schema: "master",
                table: "Subscriptions",
                columns: new[] { "Status", "CurrentPeriodEnd" });

            migrationBuilder.CreateIndex(
                name: "IX_Subscriptions_SubscriptionNumber",
                schema: "master",
                table: "Subscriptions",
                column: "SubscriptionNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Subscriptions_TenantId",
                schema: "master",
                table: "Subscriptions",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_SubscriptionUsages_SubscriptionId",
                schema: "master",
                table: "SubscriptionUsages",
                column: "SubscriptionId");

            migrationBuilder.CreateIndex(
                name: "IX_TenantBackups_CreatedAt",
                schema: "master",
                table: "TenantBackups",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_TenantBackups_TenantId",
                schema: "master",
                table: "TenantBackups",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_TenantBackups_TenantId_BackupType",
                schema: "master",
                table: "TenantBackups",
                columns: new[] { "TenantId", "BackupType" });

            migrationBuilder.CreateIndex(
                name: "IX_TenantBackups_TenantId_CreatedAt",
                schema: "master",
                table: "TenantBackups",
                columns: new[] { "TenantId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_TenantBackups_TenantId_Status",
                schema: "master",
                table: "TenantBackups",
                columns: new[] { "TenantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_TenantBackups_TenantId1",
                schema: "master",
                table: "TenantBackups",
                column: "TenantId1");

            migrationBuilder.CreateIndex(
                name: "IX_TenantBillings_IsActive",
                schema: "master",
                table: "TenantBillings",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_TenantBillings_PreferredPaymentMethod",
                schema: "master",
                table: "TenantBillings",
                column: "PreferredPaymentMethod");

            migrationBuilder.CreateIndex(
                name: "IX_TenantBillings_TenantId",
                schema: "master",
                table: "TenantBillings",
                column: "TenantId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TenantContracts_ContractNumber",
                schema: "master",
                table: "TenantContracts",
                column: "ContractNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TenantContracts_EndDate",
                schema: "master",
                table: "TenantContracts",
                column: "EndDate");

            migrationBuilder.CreateIndex(
                name: "IX_TenantContracts_StartDate",
                schema: "master",
                table: "TenantContracts",
                column: "StartDate");

            migrationBuilder.CreateIndex(
                name: "IX_TenantContracts_Status",
                schema: "master",
                table: "TenantContracts",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_TenantContracts_Status_EndDate",
                schema: "master",
                table: "TenantContracts",
                columns: new[] { "Status", "EndDate" });

            migrationBuilder.CreateIndex(
                name: "IX_TenantContracts_TenantId",
                schema: "master",
                table: "TenantContracts",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_TenantContracts_TenantId_Status",
                schema: "master",
                table: "TenantContracts",
                columns: new[] { "TenantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_TenantContracts_TenantId1",
                schema: "master",
                table: "TenantContracts",
                column: "TenantId1",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TenantDomains_DomainName",
                schema: "master",
                table: "TenantDomains",
                column: "DomainName",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TenantDomains_TenantId_Primary",
                schema: "master",
                table: "TenantDomains",
                columns: new[] { "TenantId", "IsPrimary" },
                unique: true,
                filter: "\"IsPrimary\" = TRUE");

            migrationBuilder.CreateIndex(
                name: "IX_TenantHealthChecks_CheckedAt",
                schema: "master",
                table: "TenantHealthChecks",
                column: "CheckedAt");

            migrationBuilder.CreateIndex(
                name: "IX_TenantHealthChecks_TenantId",
                schema: "master",
                table: "TenantHealthChecks",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_TenantHealthChecks_TenantId_CheckedAt",
                schema: "master",
                table: "TenantHealthChecks",
                columns: new[] { "TenantId", "CheckedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_TenantHealthChecks_TenantId1",
                schema: "master",
                table: "TenantHealthChecks",
                column: "TenantId1");

            migrationBuilder.CreateIndex(
                name: "IX_TenantLimits_IsActive",
                schema: "master",
                table: "TenantLimits",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_TenantLimits_LastResetDate",
                schema: "master",
                table: "TenantLimits",
                column: "LastResetDate");

            migrationBuilder.CreateIndex(
                name: "IX_TenantLimits_NextResetDate",
                schema: "master",
                table: "TenantLimits",
                column: "NextResetDate");

            migrationBuilder.CreateIndex(
                name: "IX_TenantLimits_TenantId",
                schema: "master",
                table: "TenantLimits",
                column: "TenantId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TenantRegistrations_AdminEmail",
                schema: "master",
                table: "TenantRegistrations",
                column: "AdminEmail");

            migrationBuilder.CreateIndex(
                name: "IX_TenantRegistrations_RegistrationCode",
                schema: "master",
                table: "TenantRegistrations",
                column: "RegistrationCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TenantRegistrations_RegistrationDate",
                schema: "master",
                table: "TenantRegistrations",
                column: "RegistrationDate");

            migrationBuilder.CreateIndex(
                name: "IX_TenantRegistrations_SelectedPackageId",
                schema: "master",
                table: "TenantRegistrations",
                column: "SelectedPackageId");

            migrationBuilder.CreateIndex(
                name: "IX_TenantRegistrations_Status",
                schema: "master",
                table: "TenantRegistrations",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_TenantRegistrations_Status_RegistrationDate",
                schema: "master",
                table: "TenantRegistrations",
                columns: new[] { "Status", "RegistrationDate" });

            migrationBuilder.CreateIndex(
                name: "IX_TenantRegistrations_TenantId",
                schema: "master",
                table: "TenantRegistrations",
                column: "TenantId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Tenants_Code",
                schema: "master",
                table: "Tenants",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Tenants_ContactEmail",
                schema: "master",
                table: "Tenants",
                column: "ContactEmail");

            migrationBuilder.CreateIndex(
                name: "IX_Tenants_CreatedAt",
                schema: "master",
                table: "Tenants",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Tenants_IsActive",
                schema: "master",
                table: "Tenants",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_TenantSettings_TenantId",
                schema: "master",
                table: "TenantSettings",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_UserLoginHistories_UserId",
                schema: "master",
                table: "UserLoginHistories",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "InvoiceItems",
                schema: "master");

            migrationBuilder.DropTable(
                name: "MasterUserRefreshTokens",
                schema: "master");

            migrationBuilder.DropTable(
                name: "PackageFeatures",
                schema: "master");

            migrationBuilder.DropTable(
                name: "PackageModules",
                schema: "master");

            migrationBuilder.DropTable(
                name: "Payments",
                schema: "master");

            migrationBuilder.DropTable(
                name: "ScheduledMigrations",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "SecurityAuditLogs",
                schema: "master");

            migrationBuilder.DropTable(
                name: "SubscriptionModules",
                schema: "master");

            migrationBuilder.DropTable(
                name: "SubscriptionUsages",
                schema: "master");

            migrationBuilder.DropTable(
                name: "SystemSettings",
                schema: "master");

            migrationBuilder.DropTable(
                name: "TenantBackups",
                schema: "master");

            migrationBuilder.DropTable(
                name: "TenantBillings",
                schema: "master");

            migrationBuilder.DropTable(
                name: "TenantContracts",
                schema: "master");

            migrationBuilder.DropTable(
                name: "TenantDomains",
                schema: "master");

            migrationBuilder.DropTable(
                name: "TenantHealthChecks",
                schema: "master");

            migrationBuilder.DropTable(
                name: "TenantLimits",
                schema: "master");

            migrationBuilder.DropTable(
                name: "TenantRegistrations",
                schema: "master");

            migrationBuilder.DropTable(
                name: "TenantSettings",
                schema: "master");

            migrationBuilder.DropTable(
                name: "UserLoginHistories",
                schema: "master");

            migrationBuilder.DropTable(
                name: "Invoices",
                schema: "master");

            migrationBuilder.DropTable(
                name: "Subscriptions",
                schema: "master");

            migrationBuilder.DropTable(
                name: "MasterUsers",
                schema: "master");

            migrationBuilder.DropTable(
                name: "Packages",
                schema: "master");

            migrationBuilder.DropTable(
                name: "Tenants",
                schema: "master");
        }
    }
}
