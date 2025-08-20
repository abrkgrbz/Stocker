using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Persistence.Migrations.Master
{
    /// <inheritdoc />
    public partial class InitialMasterDb : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "master");

            migrationBuilder.CreateTable(
                name: "Invoices",
                schema: "master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SubscriptionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    InvoiceNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    SubtotalAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    SubtotalCurrency = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false),
                    TaxAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    TaxCurrency = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false),
                    TotalAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    TotalCurrency = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false),
                    PaidAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    PaidCurrency = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false),
                    TaxRate = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false),
                    IssueDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DueDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    PaidDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    BillingStreet = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    BillingBuilding = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    BillingFloor = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    BillingApartment = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    BillingCity = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    BillingState = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    BillingCountry = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    BillingPostalCode = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true)
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
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Username = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    PasswordSalt = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    FirstName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    LastName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    PhoneNumber = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    UserType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsEmailVerified = table.Column<bool>(type: "bit", nullable: false),
                    TwoFactorEnabled = table.Column<bool>(type: "bit", nullable: false),
                    TwoFactorSecret = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    LastLoginAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    EmailVerifiedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    PasswordChangedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FailedLoginAttempts = table.Column<int>(type: "int", nullable: false),
                    LockoutEndAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ProfilePictureUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Timezone = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    PreferredLanguage = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    EmailVerificationToken = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    EmailVerificationTokenExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    EmailVerificationTokenCreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    EmailVerificationTokenIsUsed = table.Column<bool>(type: "bit", nullable: true),
                    EmailVerificationTokenUsedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    PasswordResetToken = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    PasswordResetTokenExpiry = table.Column<DateTime>(type: "datetime2", nullable: true)
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
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Type = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    BasePriceAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    BasePriceCurrency = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false),
                    MaxUsers = table.Column<int>(type: "int", nullable: false),
                    MaxStorageGB = table.Column<int>(type: "int", nullable: false),
                    MaxProjects = table.Column<int>(type: "int", nullable: false),
                    MaxApiCallsPerMonth = table.Column<int>(type: "int", nullable: false),
                    ModuleLimits = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsPublic = table.Column<bool>(type: "bit", nullable: false),
                    TrialDays = table.Column<int>(type: "int", nullable: false),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Packages", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Tenants",
                schema: "master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    DatabaseName = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                    ConnectionString = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    LogoUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ContactEmail = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    ContactPhone = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true)
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
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    InvoiceId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    UnitPriceAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    UnitPriceCurrency = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false),
                    LineTotalAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    LineTotalCurrency = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false)
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
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    InvoiceId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Method = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Currency = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false),
                    TransactionId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ProcessedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsRefund = table.Column<bool>(type: "bit", nullable: false),
                    RefundReason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
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
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Token = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DeviceInfo = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    IpAddress = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
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
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IsSuccessful = table.Column<bool>(type: "bit", nullable: false),
                    LoginAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IpAddress = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    UserAgent = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    FailureReason = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true)
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
                name: "UserTenants",
                schema: "master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Role = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    AssignedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsDefault = table.Column<bool>(type: "bit", nullable: false),
                    MasterUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserTenants", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserTenants_MasterUsers_MasterUserId",
                        column: x => x.MasterUserId,
                        principalSchema: "master",
                        principalTable: "MasterUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_UserTenants_MasterUsers_UserId",
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
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PackageId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FeatureCode = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    FeatureName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    IsHighlighted = table.Column<bool>(type: "bit", nullable: false),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false)
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
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PackageId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ModuleCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ModuleName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    IsIncluded = table.Column<bool>(type: "bit", nullable: false),
                    MaxEntities = table.Column<int>(type: "int", nullable: true)
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
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PackageId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SubscriptionNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    BillingCycle = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    PriceAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    PriceCurrency = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CurrentPeriodStart = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CurrentPeriodEnd = table.Column<DateTime>(type: "datetime2", nullable: false),
                    TrialEndDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CancelledAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CancellationReason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    AutoRenew = table.Column<bool>(type: "bit", nullable: false),
                    UserCount = table.Column<int>(type: "int", nullable: false)
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
                name: "TenantDomains",
                schema: "master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DomainName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    IsPrimary = table.Column<bool>(type: "bit", nullable: false),
                    IsVerified = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    VerifiedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
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
                name: "TenantFeatures",
                schema: "master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FeatureCode = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    IsEnabled = table.Column<bool>(type: "bit", nullable: false),
                    EnabledAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Configuration = table.Column<string>(type: "nvarchar(max)", nullable: false)
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
                name: "SubscriptionModules",
                schema: "master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SubscriptionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ModuleCode = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    ModuleName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    MaxEntities = table.Column<int>(type: "int", nullable: true),
                    AddedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
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
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SubscriptionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MetricName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    Value = table.Column<int>(type: "int", nullable: false),
                    RecordedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
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
                filter: "[IsPrimary] = 1");

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
                name: "IX_UserLoginHistories_UserId",
                schema: "master",
                table: "UserLoginHistories",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserTenants_MasterUserId",
                schema: "master",
                table: "UserTenants",
                column: "MasterUserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserTenants_UserId",
                schema: "master",
                table: "UserTenants",
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
                name: "SubscriptionModules",
                schema: "master");

            migrationBuilder.DropTable(
                name: "SubscriptionUsages",
                schema: "master");

            migrationBuilder.DropTable(
                name: "TenantDomains",
                schema: "master");

            migrationBuilder.DropTable(
                name: "TenantFeatures",
                schema: "master");

            migrationBuilder.DropTable(
                name: "UserLoginHistories",
                schema: "master");

            migrationBuilder.DropTable(
                name: "UserTenants",
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
