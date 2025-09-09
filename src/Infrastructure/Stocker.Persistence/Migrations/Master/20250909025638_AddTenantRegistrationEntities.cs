using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Persistence.Migrations.Master
{
    /// <inheritdoc />
    public partial class AddTenantRegistrationEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "TenantId1",
                schema: "Master",
                table: "TenantWebhooks",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId1",
                schema: "Master",
                table: "TenantSettings",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId1",
                schema: "Master",
                table: "TenantSecuritySettings",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId1",
                schema: "Master",
                table: "TenantIntegrations",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId1",
                schema: "Master",
                table: "TenantHealthChecks",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId1",
                schema: "Master",
                table: "TenantBackups",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId1",
                schema: "Master",
                table: "TenantApiKeys",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId1",
                schema: "Master",
                table: "TenantActivityLogs",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "TenantBillings",
                schema: "Master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CompanyName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    TaxNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    TaxOffice = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    AddressLine1 = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    AddressLine2 = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    City = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    State = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    PostalCode = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Country = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    InvoiceEmail = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    CCEmail = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    ContactPhone = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    PreferredPaymentMethod = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    BillingCycle = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    BillingDay = table.Column<int>(type: "int", nullable: false),
                    AutoPaymentEnabled = table.Column<bool>(type: "bit", nullable: false),
                    PaymentLimit = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    Currency = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false),
                    BankName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    BankBranch = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    AccountHolder = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    IBAN = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    SwiftCode = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    AccountNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    RoutingNumber = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    CardHolderName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    CardNumberMasked = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    CardType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    CardExpiryMonth = table.Column<int>(type: "int", nullable: true),
                    CardExpiryYear = table.Column<int>(type: "int", nullable: true),
                    CardToken = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    CardAddedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    PayPalEmail = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    PayPalAccountId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    SendInvoiceByEmail = table.Column<bool>(type: "bit", nullable: false),
                    SendInvoiceByPost = table.Column<bool>(type: "bit", nullable: false),
                    ConsolidatedBilling = table.Column<bool>(type: "bit", nullable: false),
                    PurchaseOrderNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    CostCenter = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    LatePaymentInterestRate = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: true),
                    PaymentTermsDays = table.Column<int>(type: "int", nullable: true),
                    GracePeriodDays = table.Column<int>(type: "int", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsVerified = table.Column<bool>(type: "bit", nullable: false),
                    VerifiedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    VerifiedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    LastPaymentDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastPaymentAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    NextBillingDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true)
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
                schema: "Master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ContractNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ContractType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ContractValue = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Currency = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false),
                    PaymentTerms = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Terms = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    SpecialConditions = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    NoticePeriodDays = table.Column<int>(type: "int", nullable: false),
                    AutoRenewal = table.Column<bool>(type: "bit", nullable: false),
                    RenewalPeriodMonths = table.Column<int>(type: "int", nullable: true),
                    RenewalPriceIncrease = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    SignedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    SignedBy = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    SignerTitle = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    SignerEmail = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    DocumentUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    DocumentHash = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    RequiresApproval = table.Column<bool>(type: "bit", nullable: false),
                    ApprovedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ApprovedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ApprovalNotes = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    TerminationDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    TerminationReason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    TerminatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    EarlyTerminationFee = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    UptimeGuarantee = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: true),
                    ResponseTimeHours = table.Column<int>(type: "int", nullable: true),
                    ResolutionTimeHours = table.Column<int>(type: "int", nullable: true),
                    SupportLevel = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    TenantId1 = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
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
                name: "TenantLimits",
                schema: "Master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MaxUsers = table.Column<int>(type: "int", nullable: false),
                    CurrentUsers = table.Column<int>(type: "int", nullable: false),
                    MaxAdminUsers = table.Column<int>(type: "int", nullable: false),
                    CurrentAdminUsers = table.Column<int>(type: "int", nullable: false),
                    MaxConcurrentUsers = table.Column<int>(type: "int", nullable: false),
                    CurrentConcurrentUsers = table.Column<int>(type: "int", nullable: false),
                    MaxStorageGB = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    CurrentStorageGB = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    MaxDatabaseSizeGB = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    CurrentDatabaseSizeGB = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    MaxFileUploadSizeMB = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    MaxMonthlyTransactions = table.Column<long>(type: "bigint", nullable: false),
                    CurrentMonthlyTransactions = table.Column<long>(type: "bigint", nullable: false),
                    MaxDailyTransactions = table.Column<long>(type: "bigint", nullable: false),
                    CurrentDailyTransactions = table.Column<long>(type: "bigint", nullable: false),
                    MaxTransactionsPerMinute = table.Column<int>(type: "int", nullable: false),
                    MaxMonthlyApiCalls = table.Column<long>(type: "bigint", nullable: false),
                    CurrentMonthlyApiCalls = table.Column<long>(type: "bigint", nullable: false),
                    MaxDailyApiCalls = table.Column<long>(type: "bigint", nullable: false),
                    CurrentDailyApiCalls = table.Column<long>(type: "bigint", nullable: false),
                    MaxApiCallsPerMinute = table.Column<int>(type: "int", nullable: false),
                    MaxApiKeys = table.Column<int>(type: "int", nullable: false),
                    CurrentApiKeys = table.Column<int>(type: "int", nullable: false),
                    MaxCustomModules = table.Column<int>(type: "int", nullable: false),
                    CurrentCustomModules = table.Column<int>(type: "int", nullable: false),
                    MaxCustomReports = table.Column<int>(type: "int", nullable: false),
                    CurrentCustomReports = table.Column<int>(type: "int", nullable: false),
                    MaxCustomFields = table.Column<int>(type: "int", nullable: false),
                    CurrentCustomFields = table.Column<int>(type: "int", nullable: false),
                    MaxWorkflows = table.Column<int>(type: "int", nullable: false),
                    CurrentWorkflows = table.Column<int>(type: "int", nullable: false),
                    MaxMonthlyEmails = table.Column<long>(type: "bigint", nullable: false),
                    CurrentMonthlyEmails = table.Column<long>(type: "bigint", nullable: false),
                    MaxMonthlySMS = table.Column<long>(type: "bigint", nullable: false),
                    CurrentMonthlySMS = table.Column<long>(type: "bigint", nullable: false),
                    MaxEmailTemplates = table.Column<int>(type: "int", nullable: false),
                    CurrentEmailTemplates = table.Column<int>(type: "int", nullable: false),
                    MaxIntegrations = table.Column<int>(type: "int", nullable: false),
                    CurrentIntegrations = table.Column<int>(type: "int", nullable: false),
                    MaxWebhooks = table.Column<int>(type: "int", nullable: false),
                    CurrentWebhooks = table.Column<int>(type: "int", nullable: false),
                    MaxCustomDomains = table.Column<int>(type: "int", nullable: false),
                    CurrentCustomDomains = table.Column<int>(type: "int", nullable: false),
                    MaxBackupsPerMonth = table.Column<int>(type: "int", nullable: false),
                    CurrentBackupsThisMonth = table.Column<int>(type: "int", nullable: false),
                    MaxExportsPerDay = table.Column<int>(type: "int", nullable: false),
                    CurrentExportsToday = table.Column<int>(type: "int", nullable: false),
                    MaxExportSizeGB = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    MaxDatabaseConnections = table.Column<int>(type: "int", nullable: false),
                    CurrentDatabaseConnections = table.Column<int>(type: "int", nullable: false),
                    MaxCPUCores = table.Column<int>(type: "int", nullable: false),
                    MaxMemoryGB = table.Column<int>(type: "int", nullable: false),
                    DataRetentionDays = table.Column<int>(type: "int", nullable: false),
                    AuditLogRetentionDays = table.Column<int>(type: "int", nullable: false),
                    BackupRetentionDays = table.Column<int>(type: "int", nullable: false),
                    UserLimitAction = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    StorageLimitAction = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    TransactionLimitAction = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ApiLimitAction = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    WarningThresholdPercentage = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false),
                    SendWarningNotifications = table.Column<bool>(type: "bit", nullable: false),
                    LastWarningNotificationSent = table.Column<DateTime>(type: "datetime2", nullable: true),
                    SendLimitExceededNotifications = table.Column<bool>(type: "bit", nullable: false),
                    LastLimitExceededNotificationSent = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    LastResetDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    NextResetDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true)
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
                name: "TenantOnboardings",
                schema: "Master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    OnboardingType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    CurrentStepNumber = table.Column<int>(type: "int", nullable: false),
                    ProgressPercentage = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false),
                    StartedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    EstimatedCompletionDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    TotalDaysExpected = table.Column<int>(type: "int", nullable: false),
                    AssignedToUserId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    AssignedToName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    AssignedToEmail = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    AssignedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ContactPersonName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ContactPersonEmail = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    ContactPersonPhone = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    PreferredContactMethod = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    PreferredContactTime = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    KickoffMeetingDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    KickoffMeetingNotes = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    TrainingSessionsCompleted = table.Column<int>(type: "int", nullable: false),
                    TotalTrainingSessions = table.Column<int>(type: "int", nullable: false),
                    NextTrainingDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RequiresDataMigration = table.Column<bool>(type: "bit", nullable: false),
                    DataMigrationStatus = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    DataMigrationStarted = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DataMigrationCompleted = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RecordsMigrated = table.Column<long>(type: "bigint", nullable: true),
                    TotalRecordsToMigrate = table.Column<long>(type: "bigint", nullable: true),
                    RequiresCustomization = table.Column<bool>(type: "bit", nullable: false),
                    CustomizationRequirements = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    CustomizationStatus = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    RequiresIntegration = table.Column<bool>(type: "bit", nullable: false),
                    IntegrationSystems = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    IntegrationStatus = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    WelcomePackageUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    WelcomePackageSent = table.Column<bool>(type: "bit", nullable: false),
                    WelcomePackageSentAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DocumentationUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    TrainingMaterialsUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    SatisfactionScore = table.Column<int>(type: "int", nullable: true),
                    FeedbackComments = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    FeedbackReceivedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    Issues = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    Blockers = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    Priority = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true)
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
                name: "TenantRegistrations",
                schema: "Master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RegistrationCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    CompanyName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    TaxNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    TaxOffice = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ContactPersonName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ContactPersonSurname = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ContactEmail = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    ContactPhone = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    CompanyWebsite = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    EmployeeCount = table.Column<int>(type: "int", nullable: false),
                    Industry = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    AddressLine1 = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    AddressLine2 = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    City = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    State = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    PostalCode = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Country = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    RegistrationDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ApprovalDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RejectionDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RejectionReason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ApprovedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    RejectedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    SelectedPackageId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ReferralCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    PromoCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    EmailVerified = table.Column<bool>(type: "bit", nullable: false),
                    EmailVerifiedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    EmailVerificationToken = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    PhoneVerified = table.Column<bool>(type: "bit", nullable: false),
                    PhoneVerifiedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    PhoneVerificationCode = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    TermsAccepted = table.Column<bool>(type: "bit", nullable: false),
                    TermsAcceptedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    TermsVersion = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    PrivacyPolicyAccepted = table.Column<bool>(type: "bit", nullable: false),
                    PrivacyPolicyAcceptedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    MarketingEmailsAllowed = table.Column<bool>(type: "bit", nullable: false),
                    MarketingSmsAllowed = table.Column<bool>(type: "bit", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
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
                name: "OnboardingSteps",
                schema: "Master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    OnboardingId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    StepName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    StepNumber = table.Column<int>(type: "int", nullable: false),
                    IsCompleted = table.Column<bool>(type: "bit", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CompletedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true)
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
                    OnboardingId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    DueDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsCompleted = table.Column<bool>(type: "bit", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CompletedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true)
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
                name: "IX_TenantWebhooks_TenantId1",
                schema: "Master",
                table: "TenantWebhooks",
                column: "TenantId1");

            migrationBuilder.CreateIndex(
                name: "IX_TenantSettings_TenantId1",
                schema: "Master",
                table: "TenantSettings",
                column: "TenantId1",
                unique: true,
                filter: "[TenantId1] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_TenantSecuritySettings_TenantId1",
                schema: "Master",
                table: "TenantSecuritySettings",
                column: "TenantId1",
                unique: true,
                filter: "[TenantId1] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_TenantIntegrations_TenantId1",
                schema: "Master",
                table: "TenantIntegrations",
                column: "TenantId1");

            migrationBuilder.CreateIndex(
                name: "IX_TenantHealthChecks_TenantId1",
                schema: "Master",
                table: "TenantHealthChecks",
                column: "TenantId1");

            migrationBuilder.CreateIndex(
                name: "IX_TenantBackups_TenantId1",
                schema: "Master",
                table: "TenantBackups",
                column: "TenantId1");

            migrationBuilder.CreateIndex(
                name: "IX_TenantApiKeys_TenantId1",
                schema: "Master",
                table: "TenantApiKeys",
                column: "TenantId1");

            migrationBuilder.CreateIndex(
                name: "IX_TenantActivityLogs_TenantId1",
                schema: "Master",
                table: "TenantActivityLogs",
                column: "TenantId1");

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
                name: "IX_TenantBillings_IsActive",
                schema: "Master",
                table: "TenantBillings",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_TenantBillings_PreferredPaymentMethod",
                schema: "Master",
                table: "TenantBillings",
                column: "PreferredPaymentMethod");

            migrationBuilder.CreateIndex(
                name: "IX_TenantBillings_TenantId",
                schema: "Master",
                table: "TenantBillings",
                column: "TenantId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TenantContracts_ContractNumber",
                schema: "Master",
                table: "TenantContracts",
                column: "ContractNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TenantContracts_EndDate",
                schema: "Master",
                table: "TenantContracts",
                column: "EndDate");

            migrationBuilder.CreateIndex(
                name: "IX_TenantContracts_StartDate",
                schema: "Master",
                table: "TenantContracts",
                column: "StartDate");

            migrationBuilder.CreateIndex(
                name: "IX_TenantContracts_Status",
                schema: "Master",
                table: "TenantContracts",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_TenantContracts_Status_EndDate",
                schema: "Master",
                table: "TenantContracts",
                columns: new[] { "Status", "EndDate" });

            migrationBuilder.CreateIndex(
                name: "IX_TenantContracts_TenantId",
                schema: "Master",
                table: "TenantContracts",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_TenantContracts_TenantId_Status",
                schema: "Master",
                table: "TenantContracts",
                columns: new[] { "TenantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_TenantContracts_TenantId1",
                schema: "Master",
                table: "TenantContracts",
                column: "TenantId1",
                unique: true,
                filter: "[TenantId1] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_TenantLimits_IsActive",
                schema: "Master",
                table: "TenantLimits",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_TenantLimits_LastResetDate",
                schema: "Master",
                table: "TenantLimits",
                column: "LastResetDate");

            migrationBuilder.CreateIndex(
                name: "IX_TenantLimits_NextResetDate",
                schema: "Master",
                table: "TenantLimits",
                column: "NextResetDate");

            migrationBuilder.CreateIndex(
                name: "IX_TenantLimits_TenantId",
                schema: "Master",
                table: "TenantLimits",
                column: "TenantId",
                unique: true);

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
                name: "IX_TenantRegistrations_RegistrationCode",
                schema: "Master",
                table: "TenantRegistrations",
                column: "RegistrationCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TenantRegistrations_RegistrationDate",
                schema: "Master",
                table: "TenantRegistrations",
                column: "RegistrationDate");

            migrationBuilder.CreateIndex(
                name: "IX_TenantRegistrations_SelectedPackageId",
                schema: "Master",
                table: "TenantRegistrations",
                column: "SelectedPackageId");

            migrationBuilder.CreateIndex(
                name: "IX_TenantRegistrations_Status",
                schema: "Master",
                table: "TenantRegistrations",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_TenantRegistrations_Status_RegistrationDate",
                schema: "Master",
                table: "TenantRegistrations",
                columns: new[] { "Status", "RegistrationDate" });

            migrationBuilder.CreateIndex(
                name: "IX_TenantRegistrations_TenantId",
                schema: "Master",
                table: "TenantRegistrations",
                column: "TenantId",
                unique: true,
                filter: "[TenantId] IS NOT NULL");

            migrationBuilder.AddForeignKey(
                name: "FK_TenantActivityLogs_Tenants_TenantId1",
                schema: "Master",
                table: "TenantActivityLogs",
                column: "TenantId1",
                principalSchema: "master",
                principalTable: "Tenants",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_TenantApiKeys_Tenants_TenantId1",
                schema: "Master",
                table: "TenantApiKeys",
                column: "TenantId1",
                principalSchema: "master",
                principalTable: "Tenants",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_TenantBackups_Tenants_TenantId1",
                schema: "Master",
                table: "TenantBackups",
                column: "TenantId1",
                principalSchema: "master",
                principalTable: "Tenants",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_TenantHealthChecks_Tenants_TenantId1",
                schema: "Master",
                table: "TenantHealthChecks",
                column: "TenantId1",
                principalSchema: "master",
                principalTable: "Tenants",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_TenantIntegrations_Tenants_TenantId1",
                schema: "Master",
                table: "TenantIntegrations",
                column: "TenantId1",
                principalSchema: "master",
                principalTable: "Tenants",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_TenantSecuritySettings_Tenants_TenantId1",
                schema: "Master",
                table: "TenantSecuritySettings",
                column: "TenantId1",
                principalSchema: "master",
                principalTable: "Tenants",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_TenantSettings_Tenants_TenantId1",
                schema: "Master",
                table: "TenantSettings",
                column: "TenantId1",
                principalSchema: "master",
                principalTable: "Tenants",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_TenantWebhooks_Tenants_TenantId1",
                schema: "Master",
                table: "TenantWebhooks",
                column: "TenantId1",
                principalSchema: "master",
                principalTable: "Tenants",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TenantActivityLogs_Tenants_TenantId1",
                schema: "Master",
                table: "TenantActivityLogs");

            migrationBuilder.DropForeignKey(
                name: "FK_TenantApiKeys_Tenants_TenantId1",
                schema: "Master",
                table: "TenantApiKeys");

            migrationBuilder.DropForeignKey(
                name: "FK_TenantBackups_Tenants_TenantId1",
                schema: "Master",
                table: "TenantBackups");

            migrationBuilder.DropForeignKey(
                name: "FK_TenantHealthChecks_Tenants_TenantId1",
                schema: "Master",
                table: "TenantHealthChecks");

            migrationBuilder.DropForeignKey(
                name: "FK_TenantIntegrations_Tenants_TenantId1",
                schema: "Master",
                table: "TenantIntegrations");

            migrationBuilder.DropForeignKey(
                name: "FK_TenantSecuritySettings_Tenants_TenantId1",
                schema: "Master",
                table: "TenantSecuritySettings");

            migrationBuilder.DropForeignKey(
                name: "FK_TenantSettings_Tenants_TenantId1",
                schema: "Master",
                table: "TenantSettings");

            migrationBuilder.DropForeignKey(
                name: "FK_TenantWebhooks_Tenants_TenantId1",
                schema: "Master",
                table: "TenantWebhooks");

            migrationBuilder.DropTable(
                name: "OnboardingSteps",
                schema: "Master");

            migrationBuilder.DropTable(
                name: "OnboardingTasks",
                schema: "Master");

            migrationBuilder.DropTable(
                name: "TenantBillings",
                schema: "Master");

            migrationBuilder.DropTable(
                name: "TenantContracts",
                schema: "Master");

            migrationBuilder.DropTable(
                name: "TenantLimits",
                schema: "Master");

            migrationBuilder.DropTable(
                name: "TenantRegistrations",
                schema: "Master");

            migrationBuilder.DropTable(
                name: "TenantOnboardings",
                schema: "Master");

            migrationBuilder.DropIndex(
                name: "IX_TenantWebhooks_TenantId1",
                schema: "Master",
                table: "TenantWebhooks");

            migrationBuilder.DropIndex(
                name: "IX_TenantSettings_TenantId1",
                schema: "Master",
                table: "TenantSettings");

            migrationBuilder.DropIndex(
                name: "IX_TenantSecuritySettings_TenantId1",
                schema: "Master",
                table: "TenantSecuritySettings");

            migrationBuilder.DropIndex(
                name: "IX_TenantIntegrations_TenantId1",
                schema: "Master",
                table: "TenantIntegrations");

            migrationBuilder.DropIndex(
                name: "IX_TenantHealthChecks_TenantId1",
                schema: "Master",
                table: "TenantHealthChecks");

            migrationBuilder.DropIndex(
                name: "IX_TenantBackups_TenantId1",
                schema: "Master",
                table: "TenantBackups");

            migrationBuilder.DropIndex(
                name: "IX_TenantApiKeys_TenantId1",
                schema: "Master",
                table: "TenantApiKeys");

            migrationBuilder.DropIndex(
                name: "IX_TenantActivityLogs_TenantId1",
                schema: "Master",
                table: "TenantActivityLogs");

            migrationBuilder.DropColumn(
                name: "TenantId1",
                schema: "Master",
                table: "TenantWebhooks");

            migrationBuilder.DropColumn(
                name: "TenantId1",
                schema: "Master",
                table: "TenantSettings");

            migrationBuilder.DropColumn(
                name: "TenantId1",
                schema: "Master",
                table: "TenantSecuritySettings");

            migrationBuilder.DropColumn(
                name: "TenantId1",
                schema: "Master",
                table: "TenantIntegrations");

            migrationBuilder.DropColumn(
                name: "TenantId1",
                schema: "Master",
                table: "TenantHealthChecks");

            migrationBuilder.DropColumn(
                name: "TenantId1",
                schema: "Master",
                table: "TenantBackups");

            migrationBuilder.DropColumn(
                name: "TenantId1",
                schema: "Master",
                table: "TenantApiKeys");

            migrationBuilder.DropColumn(
                name: "TenantId1",
                schema: "Master",
                table: "TenantActivityLogs");
        }
    }
}
