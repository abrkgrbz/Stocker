using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Persistence.Migrations.TenantDb
{
    /// <inheritdoc />
    public partial class InitialPostgreSQL : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "tenant");

            migrationBuilder.CreateTable(
                name: "AuditLogs",
                schema: "tenant",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    EntityName = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    EntityId = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    Action = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    OldValues = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    NewValues = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    Changes = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    UserId = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    UserName = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    UserEmail = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    IpAddress = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    UserAgent = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    Timestamp = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AdditionalData = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AuditLogs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Companies",
                schema: "tenant",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Code = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    LegalName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    IdentityType = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    IdentityNumber = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    TaxNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    TaxOffice = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    TradeRegisterNumber = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Email = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    Phone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Fax = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    AddressCountry = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    AddressCity = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    AddressDistrict = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    AddressPostalCode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    AddressLine = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Website = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    LogoUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Sector = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    EmployeeCount = table.Column<int>(type: "integer", nullable: true),
                    FoundedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Currency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    Timezone = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Companies", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Customers",
                schema: "tenant",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Phone = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Street = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Building = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Floor = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true),
                    Apartment = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    City = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    State = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Country = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    PostalCode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    TaxNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    TaxOffice = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    CreditLimit = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    CurrentBalance = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Customers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Invoices",
                schema: "tenant",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    InvoiceNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    CustomerId = table.Column<Guid>(type: "uuid", nullable: false),
                    InvoiceDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DueDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    SubTotalAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    SubTotalCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    TaxAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    TaxCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    DiscountAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    DiscountCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    TotalAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    TotalCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    Notes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    Terms = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    PaidDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    PaymentMethod = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    PaymentReference = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Invoices", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PasswordHistories",
                schema: "tenant",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    PasswordHash = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    Salt = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    PasswordStrength = table.Column<int>(type: "integer", nullable: false),
                    MeetsComplexityRequirements = table.Column<bool>(type: "boolean", nullable: false),
                    Length = table.Column<int>(type: "integer", nullable: false),
                    HasUppercase = table.Column<bool>(type: "boolean", nullable: false),
                    HasLowercase = table.Column<bool>(type: "boolean", nullable: false),
                    HasNumbers = table.Column<bool>(type: "boolean", nullable: false),
                    HasSpecialCharacters = table.Column<bool>(type: "boolean", nullable: false),
                    HasSequentialCharacters = table.Column<bool>(type: "boolean", nullable: false),
                    HasRepeatingCharacters = table.Column<bool>(type: "boolean", nullable: false),
                    ChangedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ChangedBy = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    ChangeReason = table.Column<int>(type: "integer", nullable: false),
                    ChangeReasonDetails = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    ChangedFromIP = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    ChangedFromDevice = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    ChangedFromLocation = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    ExpirationDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    WasExpired = table.Column<bool>(type: "boolean", nullable: false),
                    DaysUsed = table.Column<int>(type: "integer", nullable: false),
                    WasCompromised = table.Column<bool>(type: "boolean", nullable: false),
                    CompromisedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CompromiseReason = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    ForcedChange = table.Column<bool>(type: "boolean", nullable: false),
                    LastValidatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    FailedAttemptCount = table.Column<int>(type: "integer", nullable: false),
                    LastFailedAttemptAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PasswordHistories", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Products",
                schema: "tenant",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    Code = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Barcode = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Price = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    Currency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    CostPrice = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    CostCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: true),
                    StockQuantity = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    MinimumStockLevel = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    ReorderLevel = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    Unit = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    VatRate = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CategoryId = table.Column<Guid>(type: "uuid", nullable: true),
                    SupplierId = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Products", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Roles",
                schema: "tenant",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    IsSystemRole = table.Column<bool>(type: "boolean", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Roles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SetupWizards",
                schema: "tenant",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    WizardType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    TotalSteps = table.Column<int>(type: "integer", nullable: false),
                    CompletedSteps = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    CurrentStepIndex = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    ProgressPercentage = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false, defaultValue: 0m),
                    StartedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastActivityAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    StartedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    CompletedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    LastModifiedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SetupWizards", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TenantActivityLogs",
                schema: "tenant",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ActivityType = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    EntityType = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    EntityId = table.Column<Guid>(type: "uuid", nullable: true),
                    Action = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    UserEmail = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    UserRole = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    IpAddress = table.Column<string>(type: "character varying(45)", maxLength: 45, nullable: true),
                    UserAgent = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    SessionId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    RequestId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    OldData = table.Column<string>(type: "text", maxLength: 256, nullable: true),
                    NewData = table.Column<string>(type: "text", maxLength: 256, nullable: true),
                    Changes = table.Column<string>(type: "text", maxLength: 256, nullable: true),
                    AdditionalData = table.Column<string>(type: "text", maxLength: 256, nullable: true),
                    IsSuccess = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    ErrorMessage = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    ErrorDetails = table.Column<string>(type: "text", maxLength: 256, nullable: true),
                    HttpStatusCode = table.Column<int>(type: "integer", nullable: true),
                    ActivityAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Duration = table.Column<TimeSpan>(type: "interval", nullable: true),
                    Category = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Severity = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    IsSystemGenerated = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false)
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
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    KeyPrefix = table.Column<string>(type: "character varying(8)", maxLength: 8, nullable: false),
                    HashedKey = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    EncryptedKey = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: true),
                    KeyType = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Scopes = table.Column<string>(type: "text", nullable: false),
                    AllowedEndpoints = table.Column<string>(type: "text", nullable: false),
                    AllowedMethods = table.Column<string>(type: "text", nullable: false),
                    AllowedIpAddresses = table.Column<string>(type: "text", nullable: true),
                    AllowedDomains = table.Column<string>(type: "text", nullable: true),
                    RateLimitPerMinute = table.Column<int>(type: "integer", nullable: true),
                    RateLimitPerHour = table.Column<int>(type: "integer", nullable: true),
                    RateLimitPerDay = table.Column<int>(type: "integer", nullable: true),
                    UsageCount = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    LastUsedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastUsedIp = table.Column<string>(type: "character varying(45)", maxLength: 45, nullable: true),
                    LastUsedUserAgent = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    RevokedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    RevokedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    RevocationReason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    RequireHttps = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    Environment = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    AssociatedUserId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    AssociatedApplication = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Metadata = table.Column<string>(type: "text", maxLength: 256, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TenantApiKeys", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TenantCompliances",
                schema: "tenant",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    Standard = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    Version = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    Description = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    CertificationDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ExpirationDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CertificationNumber = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    CertifyingBody = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    AuditorName = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    AuditorCompany = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    Requirements = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    ImplementedControls = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    PendingControls = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    TotalRequirements = table.Column<int>(type: "integer", nullable: false),
                    CompletedRequirements = table.Column<int>(type: "integer", nullable: false),
                    ComplianceScore = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    RiskLevel = table.Column<int>(type: "integer", nullable: false),
                    RiskAssessment = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    MitigationPlan = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    LastRiskAssessment = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    NextRiskAssessment = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastAuditDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    NextAuditDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastAuditType = table.Column<int>(type: "integer", nullable: true),
                    LastAuditResult = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    LastAuditFindings = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    CorrectiveActions = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    HasOpenFindings = table.Column<bool>(type: "boolean", nullable: false),
                    OpenFindingsCount = table.Column<int>(type: "integer", nullable: false),
                    PolicyDocumentUrl = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    EvidenceDocumentUrl = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    CertificateUrl = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    AuditReportUrl = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    RelatedDocuments = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    NotifyOnExpiration = table.Column<bool>(type: "boolean", nullable: false),
                    DaysBeforeExpirationNotify = table.Column<int>(type: "integer", nullable: false),
                    NotifyOnAudit = table.Column<bool>(type: "boolean", nullable: false),
                    DaysBeforeAuditNotify = table.Column<int>(type: "integer", nullable: false),
                    NotificationEmails = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    LastNotificationSent = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ApplicableRegions = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    LegalJurisdiction = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    DataResidencyRequirements = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    RequiresDataLocalization = table.Column<bool>(type: "boolean", nullable: false),
                    ComplianceCost = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    AnnualMaintenanceCost = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    AssignedTeam = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    ResponsiblePerson = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    ResponsibleEmail = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    IsMandatory = table.Column<bool>(type: "boolean", nullable: false),
                    SuspendedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    SuspensionReason = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    ActivatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    ModifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ModifiedBy = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    ReviewedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ReviewedBy = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true)
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
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    LogoUrl = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    LogoDarkUrl = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    FaviconUrl = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    CompanyName = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    BrandName = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    Slogan = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    PrimaryColor = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    SecondaryColor = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    AccentColor = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    SuccessColor = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    WarningColor = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    ErrorColor = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    InfoColor = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    BackgroundColor = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    TextColor = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    BorderColor = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    PrimaryFont = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    SecondaryFont = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    FontSizeBase = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    LineHeight = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    HeaderFont = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    MonospaceFont = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    SidebarPosition = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    SidebarCollapsed = table.Column<bool>(type: "boolean", nullable: false),
                    HeaderStyle = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    FooterStyle = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    LayoutMode = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    MenuStyle = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    ShowBreadcrumb = table.Column<bool>(type: "boolean", nullable: false),
                    ShowFooter = table.Column<bool>(type: "boolean", nullable: false),
                    ThemeMode = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    ThemePreset = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    CustomCss = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    CustomJavaScript = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    CustomHtml = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    LoginBackgroundUrl = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    LoginBackgroundColor = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    LoginLogoUrl = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    LoginTitle = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    LoginSubtitle = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    LoginFooterText = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    ShowLoginSocialButtons = table.Column<bool>(type: "boolean", nullable: false),
                    ShowLoginRememberMe = table.Column<bool>(type: "boolean", nullable: false),
                    ShowLoginForgotPassword = table.Column<bool>(type: "boolean", nullable: false),
                    EmailHeaderHtml = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    EmailFooterHtml = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    EmailLogoUrl = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    EmailPrimaryColor = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    EmailFromName = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    EmailReplyTo = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    EmailSignature = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    DashboardLayout = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    DefaultWidgets = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    ShowDashboardStats = table.Column<bool>(type: "boolean", nullable: false),
                    ShowDashboardCharts = table.Column<bool>(type: "boolean", nullable: false),
                    ShowDashboardActivities = table.Column<bool>(type: "boolean", nullable: false),
                    ShowDashboardNotifications = table.Column<bool>(type: "boolean", nullable: false),
                    DashboardWelcomeMessage = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    ReportHeaderTemplate = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    ReportFooterTemplate = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    ReportLogoUrl = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    ReportWatermarkUrl = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    ShowReportPageNumbers = table.Column<bool>(type: "boolean", nullable: false),
                    ShowReportGeneratedDate = table.Column<bool>(type: "boolean", nullable: false),
                    InvoiceTemplate = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    InvoiceLogoUrl = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    InvoiceHeaderText = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    InvoiceFooterText = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    InvoiceTermsAndConditions = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    InvoicePaymentInstructions = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    DefaultLanguage = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    DefaultCurrency = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    DefaultTimezone = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    DateFormat = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    TimeFormat = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    NumberFormat = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    Use24HourTime = table.Column<bool>(type: "boolean", nullable: false),
                    FirstDayOfWeek = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    EnableDarkMode = table.Column<bool>(type: "boolean", nullable: false),
                    EnableMultiLanguage = table.Column<bool>(type: "boolean", nullable: false),
                    EnableNotifications = table.Column<bool>(type: "boolean", nullable: false),
                    EnableChat = table.Column<bool>(type: "boolean", nullable: false),
                    EnableSearch = table.Column<bool>(type: "boolean", nullable: false),
                    EnableHelp = table.Column<bool>(type: "boolean", nullable: false),
                    EnableProfile = table.Column<bool>(type: "boolean", nullable: false),
                    EnableSettings = table.Column<bool>(type: "boolean", nullable: false),
                    CustomMenuItems = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    CustomShortcuts = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    CustomActions = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    MetaTitle = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    MetaDescription = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    MetaKeywords = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    OpenGraphImage = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    TwitterCard = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    CustomDomain = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    GoogleAnalyticsId = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    FacebookPixelId = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    IntercomAppId = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    HotjarId = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    CustomTrackingScripts = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    ModifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ModifiedBy = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    Version = table.Column<int>(type: "integer", nullable: false)
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
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    DocumentName = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    DocumentNumber = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    DocumentType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Category = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    FileUrl = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    FileName = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    FileExtension = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    FileSizeBytes = table.Column<long>(type: "bigint", nullable: false),
                    MimeType = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    FileHash = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: true),
                    Version = table.Column<int>(type: "integer", nullable: false, defaultValue: 1),
                    IsLatestVersion = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    PreviousVersionId = table.Column<Guid>(type: "uuid", nullable: true),
                    VersionNotes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    EffectiveDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ExpiryDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    RequiresRenewal = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    RenewalNoticeDays = table.Column<int>(type: "integer", nullable: true),
                    RenewalNotificationDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    RequiresSignature = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    IsSigned = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    SignedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    SignedBy = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    SignatureUrl = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    RequiresApproval = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    IsApproved = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    ApprovedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ApprovedBy = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    ApprovalNotes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    AccessLevel = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    IsConfidential = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    IsPublic = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    AllowedRoles = table.Column<string>(type: "text", maxLength: 256, nullable: true),
                    AllowedUsers = table.Column<string>(type: "text", maxLength: 256, nullable: true),
                    RequiresNDA = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    IsLegalDocument = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    IsComplianceDocument = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    ComplianceStandard = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    LegalJurisdiction = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    RetentionPolicy = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    RetentionUntil = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CanBeDeleted = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    Tags = table.Column<string>(type: "text", maxLength: 256, nullable: true),
                    CustomMetadata = table.Column<string>(type: "text", maxLength: 256, nullable: true),
                    Keywords = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    Language = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true),
                    ParentDocumentId = table.Column<Guid>(type: "uuid", nullable: true),
                    RelatedDocumentIds = table.Column<string>(type: "text", maxLength: 256, nullable: true),
                    ReplacesDocumentId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    SendExpiryNotification = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    SendRenewalNotification = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    NotificationRecipients = table.Column<string>(type: "text", maxLength: 256, nullable: true),
                    LastNotificationSent = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ViewCount = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    DownloadCount = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    LastViewedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastViewedBy = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    LastDownloadedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastDownloadedBy = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    UploadedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UploadedBy = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    ModifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ModifiedBy = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    ModificationReason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true)
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
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FeatureKey = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    Name = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    Description = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    Category = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    Module = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    Icon = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    DisplayOrder = table.Column<int>(type: "integer", nullable: false),
                    IsCore = table.Column<bool>(type: "boolean", nullable: false),
                    IsBeta = table.Column<bool>(type: "boolean", nullable: false),
                    IsNew = table.Column<bool>(type: "boolean", nullable: false),
                    IsEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    RequiresSubscription = table.Column<bool>(type: "boolean", nullable: false),
                    RequiredPlan = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    RequiredRole = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    RequiredPermission = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    MinimumUserCount = table.Column<int>(type: "integer", nullable: true),
                    MaximumUserCount = table.Column<int>(type: "integer", nullable: true),
                    Configuration = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    DefaultSettings = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    CurrentSettings = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    Metadata = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    HasUsageLimit = table.Column<bool>(type: "boolean", nullable: false),
                    UsageLimit = table.Column<int>(type: "integer", nullable: true),
                    CurrentUsage = table.Column<int>(type: "integer", nullable: false),
                    UsagePeriod = table.Column<int>(type: "integer", nullable: true),
                    UsageResetDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastUsedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsTrialAvailable = table.Column<bool>(type: "boolean", nullable: false),
                    TrialDays = table.Column<int>(type: "integer", nullable: true),
                    TrialStartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TrialEndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsInTrial = table.Column<bool>(type: "boolean", nullable: false),
                    TrialUsed = table.Column<bool>(type: "boolean", nullable: false),
                    IsPaid = table.Column<bool>(type: "boolean", nullable: false),
                    BasePrice = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    PricingModel = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    PricePerUnit = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    Currency = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    BillingCycle = table.Column<int>(type: "integer", nullable: true),
                    RequiredFeatures = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    ConflictingFeatures = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    IncludedFeatures = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    ActivatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ActivatedBy = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    DeactivatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeactivatedBy = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    DeactivationReason = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    HasExpiration = table.Column<bool>(type: "boolean", nullable: false),
                    ExpirationDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    AutoRenew = table.Column<bool>(type: "boolean", nullable: false),
                    RenewalNoticeDays = table.Column<int>(type: "integer", nullable: true),
                    LastRenewalDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    NextRenewalDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ActivationCount = table.Column<int>(type: "integer", nullable: false),
                    DeactivationCount = table.Column<int>(type: "integer", nullable: false),
                    TotalUsageCount = table.Column<int>(type: "integer", nullable: false),
                    AverageUsagePerDay = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    PeakUsage = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    PeakUsageDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    SendActivationNotification = table.Column<bool>(type: "boolean", nullable: false),
                    SendExpirationNotification = table.Column<bool>(type: "boolean", nullable: false),
                    SendUsageLimitNotification = table.Column<bool>(type: "boolean", nullable: false),
                    NotificationEmails = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    LastNotificationSent = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    ModifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ModifiedBy = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    Version = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TenantFeatures", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TenantInitialData",
                schema: "tenant",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    DataSetType = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    CompanyName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    CompanyCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    TaxNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    TaxOffice = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    TradeRegistryNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    MersisNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    ContactEmail = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    ContactPhone = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ContactFax = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Website = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    AddressLine1 = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    AddressLine2 = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    City = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    State = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Country = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    PostalCode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    IndustryType = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    BusinessType = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    EmployeeCount = table.Column<int>(type: "integer", nullable: true),
                    AnnualRevenue = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    Currency = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true),
                    FiscalYearStart = table.Column<int>(type: "integer", nullable: true),
                    AdminUserEmail = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    AdminUserName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    AdminFirstName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    AdminLastName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    AdminPhone = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    AdminUserCreated = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    DefaultLanguage = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true),
                    DefaultTimeZone = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    DefaultDateFormat = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    DefaultNumberFormat = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Use24HourTime = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    EnabledModules = table.Column<string>(type: "text", nullable: false),
                    RequestedFeatures = table.Column<string>(type: "text", nullable: false),
                    CreateSampleData = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    ImportExistingData = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    DataImportSource = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    DataImportFormat = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    InitialDepartments = table.Column<string>(type: "text", nullable: false),
                    InitialBranches = table.Column<string>(type: "text", nullable: false),
                    InitialRoles = table.Column<string>(type: "text", nullable: false),
                    InitialAccounts = table.Column<string>(type: "text", nullable: false),
                    InitialTaxRates = table.Column<string>(type: "text", nullable: false),
                    InitialProductCategories = table.Column<string>(type: "text", nullable: false),
                    InitialWarehouses = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    ProcessedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ProcessedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    ProcessAttempts = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    ProcessingError = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    ProcessingLog = table.Column<string>(type: "text", maxLength: 256, nullable: true),
                    IsValidated = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    ValidatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ValidationErrors = table.Column<string>(type: "text", nullable: false),
                    ValidationWarnings = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TenantInitialData", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TenantIntegrations",
                schema: "tenant",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    Configuration = table.Column<string>(type: "text", maxLength: 256, nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    IsConnected = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastSyncAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastSyncStatus = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    LastError = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    CreatedBy = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    WebhookUrl = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    ApiKey = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    RefreshToken = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    TokenExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TenantIntegrations", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TenantModules",
                schema: "tenant",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ModuleName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    ModuleCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    IsEnabled = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    EnabledDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DisabledDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Configuration = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    UserLimit = table.Column<int>(type: "integer", nullable: true, defaultValue: 0),
                    StorageLimit = table.Column<int>(type: "integer", nullable: true, defaultValue: 0),
                    RecordLimit = table.Column<int>(type: "integer", nullable: true, defaultValue: 0),
                    ExpiryDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsTrial = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TenantModules", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TenantNotifications",
                schema: "tenant",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Message = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    Description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    Type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Category = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Priority = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Severity = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    TargetType = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    TargetUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    TargetRole = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    TargetDepartment = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    TargetUserIds = table.Column<string>(type: "text", nullable: true),
                    IsGlobal = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    IconName = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    IconColor = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    ImageUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    ActionUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    ActionText = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    ActionType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    ActionData = table.Column<string>(type: "text", nullable: true),
                    SendInApp = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    SendEmail = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    SendSms = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    SendPushNotification = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    SendWebhook = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    WebhookUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    EmailTemplateId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    SmsTemplateId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ScheduledAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    SentAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsScheduled = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    IsRecurring = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    RecurrencePattern = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    RecurrenceEndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    IsRead = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    ReadAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsDismissed = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    DismissedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsArchived = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    ArchivedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeliveryAttempts = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    LastDeliveryAttempt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeliveryError = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    RequiresAcknowledgment = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    IsAcknowledged = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    AcknowledgedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    AcknowledgedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    AllowDismiss = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    ShowUntilRead = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    Persistent = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    CreatedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Source = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    SourceEntityType = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    SourceEntityId = table.Column<Guid>(type: "uuid", nullable: true),
                    SourceEventType = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Metadata = table.Column<string>(type: "text", maxLength: 256, nullable: true),
                    Data = table.Column<string>(type: "text", nullable: true),
                    Tags = table.Column<string>(type: "text", nullable: true),
                    GroupKey = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    GroupCount = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    Actions = table.Column<string>(type: "jsonb", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TenantNotifications", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TenantOnboardings",
                schema: "tenant",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    Description = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    TargetUserId = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    TargetUserEmail = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    TargetUserName = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    TargetRole = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    TargetDepartment = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    TotalSteps = table.Column<int>(type: "integer", nullable: false),
                    CompletedSteps = table.Column<int>(type: "integer", nullable: false),
                    SkippedSteps = table.Column<int>(type: "integer", nullable: false),
                    ProgressPercentage = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    EstimatedDuration = table.Column<TimeSpan>(type: "interval", nullable: false),
                    ActualDuration = table.Column<TimeSpan>(type: "interval", nullable: false),
                    StartedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DueDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastActivityAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    PausedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ResumedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsRequired = table.Column<bool>(type: "boolean", nullable: false),
                    AllowSkip = table.Column<bool>(type: "boolean", nullable: false),
                    SendReminders = table.Column<bool>(type: "boolean", nullable: false),
                    ReminderFrequencyDays = table.Column<int>(type: "integer", nullable: false),
                    RequireManagerApproval = table.Column<bool>(type: "boolean", nullable: false),
                    ManagerId = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    ManagerEmail = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    CompletionCertificateUrl = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    CompletionScore = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    CompletionFeedback = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    SatisfactionRating = table.Column<int>(type: "integer", nullable: true),
                    LoginCount = table.Column<int>(type: "integer", nullable: false),
                    FirstLoginAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastLoginAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    HelpRequestCount = table.Column<int>(type: "integer", nullable: false),
                    MostVisitedSection = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    DeviceInfo = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    ModifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ModifiedBy = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TenantOnboardings", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TenantSecuritySettings",
                schema: "tenant",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TwoFactorRequired = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    TwoFactorOptional = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    TwoFactorMethods = table.Column<string>(type: "text", nullable: false),
                    TwoFactorCodeLength = table.Column<int>(type: "integer", nullable: false, defaultValue: 6),
                    TwoFactorCodeExpiryMinutes = table.Column<int>(type: "integer", nullable: false, defaultValue: 5),
                    AllowBackupCodes = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    BackupCodesCount = table.Column<int>(type: "integer", nullable: false, defaultValue: 10),
                    MinPasswordLength = table.Column<int>(type: "integer", nullable: false, defaultValue: 8),
                    MaxPasswordLength = table.Column<int>(type: "integer", nullable: false, defaultValue: 128),
                    RequireUppercase = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    RequireLowercase = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    RequireNumbers = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    RequireSpecialCharacters = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    SpecialCharacters = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    PasswordExpiryDays = table.Column<int>(type: "integer", nullable: false, defaultValue: 90),
                    PasswordHistoryCount = table.Column<int>(type: "integer", nullable: false, defaultValue: 5),
                    PreventCommonPasswords = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    PreventUserInfoInPassword = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    MaxLoginAttempts = table.Column<int>(type: "integer", nullable: false, defaultValue: 5),
                    AccountLockoutMinutes = table.Column<int>(type: "integer", nullable: false, defaultValue: 30),
                    RequireCaptchaAfterFailedAttempts = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CaptchaThreshold = table.Column<int>(type: "integer", nullable: false, defaultValue: 3),
                    SessionTimeoutMinutes = table.Column<int>(type: "integer", nullable: false, defaultValue: 30),
                    InactivityTimeoutMinutes = table.Column<int>(type: "integer", nullable: false, defaultValue: 15),
                    SingleSessionPerUser = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    LogoutOnBrowserClose = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    EnableIpWhitelist = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    AllowedIpAddresses = table.Column<string>(type: "text", nullable: true),
                    AllowedIpRanges = table.Column<string>(type: "text", nullable: true),
                    EnableIpBlacklist = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    BlockedIpAddresses = table.Column<string>(type: "text", nullable: true),
                    BlockedIpRanges = table.Column<string>(type: "text", nullable: true),
                    BlockVpnAccess = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    BlockTorAccess = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    EnableGeoBlocking = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    AllowedCountries = table.Column<string>(type: "text", nullable: true),
                    BlockedCountries = table.Column<string>(type: "text", nullable: true),
                    EnableDeviceTracking = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    RequireDeviceApproval = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    MaxDevicesPerUser = table.Column<int>(type: "integer", nullable: false, defaultValue: 5),
                    NotifyOnNewDevice = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    DeviceTrustDurationDays = table.Column<int>(type: "integer", nullable: false, defaultValue: 30),
                    EnableSecurityHeaders = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    EnableHsts = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    HstsMaxAgeSeconds = table.Column<int>(type: "integer", nullable: false, defaultValue: 31536000),
                    EnableCsp = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    CspPolicy = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    EnableCors = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    AllowedOrigins = table.Column<string>(type: "text", nullable: true),
                    AllowCredentials = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    EnableAuditLogging = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    LogSuccessfulLogins = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    LogFailedLogins = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    LogDataAccess = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    LogDataModification = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    LogSecurityEvents = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    AuditLogRetentionDays = table.Column<int>(type: "integer", nullable: false, defaultValue: 365),
                    RequireEmailVerification = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    EmailVerificationExpiryHours = table.Column<int>(type: "integer", nullable: false, defaultValue: 24),
                    NotifyPasswordChanges = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    NotifyLoginFromNewLocation = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    NotifySecurityChanges = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    EnableApiRateLimiting = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    ApiRateLimitPerMinute = table.Column<int>(type: "integer", nullable: false, defaultValue: 60),
                    ApiRateLimitPerHour = table.Column<int>(type: "integer", nullable: false, defaultValue: 1000),
                    RequireApiKey = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    RequireHttps = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    ApiKeyExpiryDays = table.Column<int>(type: "integer", nullable: false, defaultValue: 365),
                    EnableDataEncryption = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    EncryptionAlgorithm = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    EnableDatabaseEncryption = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    EnableFileEncryption = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    AnonymizePersonalData = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    DataRetentionDays = table.Column<int>(type: "integer", nullable: false, defaultValue: 2555),
                    EnableIntrusionDetection = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    EnableAnomalyDetection = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    EnableBruteForceProtection = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    EnableSqlInjectionProtection = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    EnableXssProtection = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    EnableCsrfProtection = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastModifiedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    CustomConfiguration = table.Column<string>(type: "text", maxLength: 256, nullable: true),
                    IsDefault = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    ProfileName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TenantSecuritySettings", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TenantSettings",
                schema: "tenant",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SettingKey = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    SettingValue = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Category = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    DataType = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    IsSystemSetting = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    IsEncrypted = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    IsPublic = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TenantSettings", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TenantSetupChecklists",
                schema: "tenant",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    CompanyInfoCompleted = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    CompanyInfoCompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CompanyInfoCompletedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    LogoUploaded = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    LogoUploadedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LogoUploadedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    AdminUserCreated = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    AdminUserCreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    AdminUserCreatedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    DepartmentsCreated = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    DepartmentCount = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    DepartmentsCreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    BranchesCreated = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    BranchCount = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    BranchesCreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    RolesConfigured = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    RoleCount = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    RolesConfiguredAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UsersInvited = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    UserCount = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    UsersInvitedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ModulesSelected = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    SelectedModulesList = table.Column<string>(type: "text", nullable: false),
                    ModulesSelectedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ModulesConfigured = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    ModulesConfiguredAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ChartOfAccountsSetup = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    AccountCount = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    ChartOfAccountsSetupAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TaxSettingsConfigured = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    TaxSettingsConfiguredAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CurrencyConfigured = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    PrimaryCurrency = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true),
                    CurrencyConfiguredAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    FiscalYearConfigured = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    FiscalYearConfiguredAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ProductCategoriesCreated = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    ProductCategoryCount = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    ProductCategoriesCreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ProductsImported = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    ProductCount = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    ProductsImportedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    PricingRulesConfigured = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    PricingRulesConfiguredAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CustomersImported = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    CustomerCount = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    CustomersImportedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    VendorsImported = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    VendorCount = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    VendorsImportedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    SecuritySettingsConfigured = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    SecuritySettingsConfiguredAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    PasswordPolicySet = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    PasswordPolicySetAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TwoFactorEnabled = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    TwoFactorEnabledAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    BackupConfigured = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    BackupConfiguredAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ComplianceConfigured = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    ComplianceConfiguredAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    EmailIntegrationConfigured = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    EmailIntegrationConfiguredAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    PaymentGatewayConfigured = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    PaymentGatewayConfiguredAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    SmsIntegrationConfigured = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    SmsIntegrationConfiguredAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ThirdPartyIntegrationsConfigured = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    IntegratedServices = table.Column<string>(type: "text", nullable: true),
                    ThirdPartyIntegrationsConfiguredAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ThemeCustomized = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    ThemeCustomizedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    EmailTemplatesConfigured = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    EmailTemplatesConfiguredAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ReportTemplatesConfigured = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    ReportTemplatesConfiguredAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DashboardConfigured = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    DashboardConfiguredAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ApprovalWorkflowsConfigured = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    WorkflowCount = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    ApprovalWorkflowsConfiguredAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    NotificationRulesConfigured = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    NotificationRuleCount = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    NotificationRulesConfiguredAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    AutomationRulesConfigured = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    AutomationRuleCount = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    AutomationRulesConfiguredAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TrainingCompleted = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    TrainedUserCount = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    TrainingCompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DocumentationReviewed = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    DocumentationReviewedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    SupportContactsAdded = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    SupportContactsAddedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DataMigrationCompleted = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    DataMigrationCompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    SystemTestingCompleted = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    SystemTestingCompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UserAcceptanceCompleted = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    UserAcceptanceCompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    GoLiveApproved = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    GoLiveApprovedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    GoLiveApprovedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    TotalItems = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    CompletedItems = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    RequiredItems = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    RequiredCompletedItems = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    OverallProgress = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false, defaultValue: 0m),
                    RequiredProgress = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false, defaultValue: 0m),
                    Notes = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: true),
                    PendingTasks = table.Column<string>(type: "text", nullable: true),
                    BlockingIssues = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TenantSetupChecklists", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TenantWebhooks",
                schema: "tenant",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    Url = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    Secret = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    EventType = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    Description = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    HttpMethod = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    ContentType = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    Headers = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    TimeoutSeconds = table.Column<int>(type: "integer", nullable: false),
                    MaxRetries = table.Column<int>(type: "integer", nullable: false),
                    RetryDelaySeconds = table.Column<int>(type: "integer", nullable: false),
                    AuthType = table.Column<int>(type: "integer", nullable: false),
                    AuthToken = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    AuthHeaderName = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    BasicAuthUsername = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    BasicAuthPassword = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    EventFilters = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    PayloadTemplate = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    OnlyOnSuccess = table.Column<bool>(type: "boolean", nullable: false),
                    IncludePayload = table.Column<bool>(type: "boolean", nullable: false),
                    RateLimitPerMinute = table.Column<int>(type: "integer", nullable: true),
                    LastTriggeredAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TriggerCount = table.Column<int>(type: "integer", nullable: false),
                    SuccessCount = table.Column<int>(type: "integer", nullable: false),
                    FailureCount = table.Column<int>(type: "integer", nullable: false),
                    LastSuccessAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastFailureAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastError = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    AverageResponseTime = table.Column<double>(type: "double precision", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    ModifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ModifiedBy = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    DeactivatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeactivatedBy = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TenantWebhooks", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Branches",
                schema: "tenant",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CompanyId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    AddressStreet = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    AddressBuilding = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    AddressFloor = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    AddressApartment = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    AddressCity = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    AddressState = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    AddressCountry = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    AddressPostalCode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    Phone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Email = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    IsHeadOffice = table.Column<bool>(type: "boolean", nullable: false),
                    ManagerId = table.Column<Guid>(type: "uuid", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Branches", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Branches_Companies_CompanyId",
                        column: x => x.CompanyId,
                        principalSchema: "tenant",
                        principalTable: "Companies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Departments",
                schema: "tenant",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CompanyId = table.Column<Guid>(type: "uuid", nullable: true),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    ParentDepartmentId = table.Column<Guid>(type: "uuid", nullable: true),
                    ManagerId = table.Column<Guid>(type: "uuid", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Departments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Departments_Companies_CompanyId",
                        column: x => x.CompanyId,
                        principalSchema: "tenant",
                        principalTable: "Companies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Departments_Departments_ParentDepartmentId",
                        column: x => x.ParentDepartmentId,
                        principalSchema: "tenant",
                        principalTable: "Departments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "InvoiceItems",
                schema: "tenant",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    InvoiceId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Quantity = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    UnitPriceAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    UnitPriceCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    TotalPriceAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    TotalPriceCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    DiscountPercentage = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: true),
                    DiscountAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    DiscountCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: true),
                    TaxRate = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: true),
                    TaxAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    TaxCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InvoiceItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InvoiceItems_Invoices_InvoiceId",
                        column: x => x.InvoiceId,
                        principalSchema: "tenant",
                        principalTable: "Invoices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Payments",
                schema: "tenant",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    PaymentNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    InvoiceId = table.Column<Guid>(type: "uuid", nullable: false),
                    CustomerId = table.Column<Guid>(type: "uuid", nullable: false),
                    PaymentDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Amount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    Currency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    PaymentMethod = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    ReferenceNumber = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    TransactionId = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Notes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    BankName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    CheckNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    ClearanceDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CardLastFourDigits = table.Column<string>(type: "character varying(4)", maxLength: 4, nullable: true),
                    CardType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Payments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Payments_Invoices_InvoiceId",
                        column: x => x.InvoiceId,
                        principalSchema: "tenant",
                        principalTable: "Invoices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "RolePermissions",
                schema: "tenant",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    RoleId = table.Column<Guid>(type: "uuid", nullable: false),
                    Resource = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    PermissionType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RolePermissions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RolePermissions_Roles_RoleId",
                        column: x => x.RoleId,
                        principalSchema: "tenant",
                        principalTable: "Roles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SetupWizardSteps",
                schema: "tenant",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    WizardId = table.Column<Guid>(type: "uuid", nullable: false),
                    StepOrder = table.Column<int>(type: "integer", nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Category = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    IsRequired = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    CanSkip = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    StepData = table.Column<string>(type: "text", maxLength: 256, nullable: true),
                    ValidationErrors = table.Column<string>(type: "text", maxLength: 256, nullable: true),
                    StartedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Duration = table.Column<TimeSpan>(type: "interval", nullable: true),
                    StartedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    CompletedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    IsSkipped = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    SkipReason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    SkippedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    SkippedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SetupWizardSteps", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SetupWizardSteps_SetupWizards_WizardId",
                        column: x => x.WizardId,
                        principalSchema: "tenant",
                        principalTable: "SetupWizards",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "OnboardingSteps",
                schema: "tenant",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    OnboardingId = table.Column<Guid>(type: "uuid", nullable: false),
                    Order = table.Column<int>(type: "integer", nullable: false),
                    Title = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    Description = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    IsRequired = table.Column<bool>(type: "boolean", nullable: false),
                    AllowSkip = table.Column<bool>(type: "boolean", nullable: false),
                    ContentUrl = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    ContentHtml = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    VideoUrl = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    DocumentUrl = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    FormData = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    ActionUrl = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    EstimatedDurationMinutes = table.Column<int>(type: "integer", nullable: false),
                    ActualDurationMinutes = table.Column<int>(type: "integer", nullable: false),
                    StartedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    SkippedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    SkipReason = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    ValidationRules = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    RequiresVerification = table.Column<bool>(type: "boolean", nullable: false),
                    IsVerified = table.Column<bool>(type: "boolean", nullable: false),
                    VerifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    VerifiedBy = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    UserResponse = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    UserFeedback = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    UserRating = table.Column<int>(type: "integer", nullable: true),
                    CompletedBy = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    SkippedBy = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true)
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
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    OnboardingId = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    Description = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    Priority = table.Column<int>(type: "integer", nullable: false),
                    AssignedTo = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    AssignedBy = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    AssignedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DueDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    StartedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Notes = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    CompletionNotes = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    Attachments = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true)
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

            migrationBuilder.CreateTable(
                name: "TenantUsers",
                schema: "tenant",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    MasterUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Username = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    PasswordHash = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    Email = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    FirstName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    LastName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    EmployeeCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Phone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    Mobile = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    Title = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    DepartmentId = table.Column<Guid>(type: "uuid", nullable: true),
                    BranchId = table.Column<Guid>(type: "uuid", nullable: true),
                    ManagerId = table.Column<Guid>(type: "uuid", nullable: true),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    HireDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TerminationDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ProfilePictureUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastLoginAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TenantUsers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TenantUsers_Branches_BranchId",
                        column: x => x.BranchId,
                        principalSchema: "tenant",
                        principalTable: "Branches",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_TenantUsers_Departments_DepartmentId",
                        column: x => x.DepartmentId,
                        principalSchema: "tenant",
                        principalTable: "Departments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_TenantUsers_TenantUsers_ManagerId",
                        column: x => x.ManagerId,
                        principalSchema: "tenant",
                        principalTable: "TenantUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "UserTenants",
                schema: "tenant",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Username = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    FirstName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    LastName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    PhoneNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    UserType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    RoleId = table.Column<Guid>(type: "uuid", nullable: true),
                    RoleName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Permissions = table.Column<string>(type: "text", maxLength: 256, nullable: true),
                    CustomPermissions = table.Column<string>(type: "text", maxLength: 256, nullable: true),
                    RestrictedPermissions = table.Column<string>(type: "text", maxLength: 256, nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    IsDefault = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    IsLocked = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    LockedUntil = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LockReason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    FailedAccessAttempts = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    LastFailedAccess = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DepartmentId = table.Column<Guid>(type: "uuid", nullable: true),
                    DepartmentName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    BranchId = table.Column<Guid>(type: "uuid", nullable: true),
                    BranchName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    ManagerId = table.Column<Guid>(type: "uuid", nullable: true),
                    ManagerName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    WorkStartTime = table.Column<TimeSpan>(type: "interval", nullable: true),
                    WorkEndTime = table.Column<TimeSpan>(type: "interval", nullable: true),
                    WorkingDays = table.Column<string>(type: "text", maxLength: 256, nullable: true),
                    TimeZone = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    AllowFlexibleHours = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    AllowRemoteWork = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    AllowedIpAddresses = table.Column<string>(type: "text", maxLength: 256, nullable: true),
                    BlockedIpAddresses = table.Column<string>(type: "text", maxLength: 256, nullable: true),
                    RequireTwoFactor = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    RequirePasswordChange = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    PasswordExpiryDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CanAccessApi = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CanAccessMobile = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CanAccessWeb = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CurrentSessionId = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    LastLoginAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastActivityAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastLoginIp = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    LastLoginDevice = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    TotalLoginCount = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    IsOnline = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    Language = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true),
                    DateFormat = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    NumberFormat = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Theme = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    DashboardLayout = table.Column<string>(type: "text", maxLength: 256, nullable: true),
                    NotificationPreferences = table.Column<string>(type: "text", maxLength: 256, nullable: true),
                    EmailNotifications = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    SmsNotifications = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    PushNotifications = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    AssignedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AssignedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    ModifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ModifiedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    DeactivatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeactivatedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    DeactivationReason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    SalesQuota = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    AchievedSales = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    TasksAssigned = table.Column<int>(type: "integer", nullable: true),
                    TasksCompleted = table.Column<int>(type: "integer", nullable: true),
                    PerformanceScore = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: true),
                    LastPerformanceReview = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
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
                name: "UserPermissions",
                schema: "tenant",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Resource = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    PermissionType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    GrantedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    GrantedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserPermissions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserPermissions_TenantUsers_UserId",
                        column: x => x.UserId,
                        principalSchema: "tenant",
                        principalTable: "TenantUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserRoles",
                schema: "tenant",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    RoleId = table.Column<Guid>(type: "uuid", nullable: false),
                    AssignedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AssignedBy = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserRoles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserRoles_Roles_RoleId",
                        column: x => x.RoleId,
                        principalSchema: "tenant",
                        principalTable: "Roles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_UserRoles_TenantUsers_UserId",
                        column: x => x.UserId,
                        principalSchema: "tenant",
                        principalTable: "TenantUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Branches_CompanyId",
                schema: "tenant",
                table: "Branches",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_Branches_CompanyId_Code",
                schema: "tenant",
                table: "Branches",
                columns: new[] { "CompanyId", "Code" },
                unique: true,
                filter: "\"Code\" IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Branches_CompanyId_HeadOffice",
                schema: "tenant",
                table: "Branches",
                columns: new[] { "CompanyId", "IsHeadOffice" },
                unique: true,
                filter: "\"IsHeadOffice\" = TRUE");

            migrationBuilder.CreateIndex(
                name: "IX_Branches_IsActive",
                schema: "tenant",
                table: "Branches",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_Branches_TenantId",
                schema: "tenant",
                table: "Branches",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Companies_IsActive",
                schema: "tenant",
                table: "Companies",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_Companies_TaxNumber",
                schema: "tenant",
                table: "Companies",
                column: "TaxNumber");

            migrationBuilder.CreateIndex(
                name: "IX_Companies_TenantId",
                schema: "tenant",
                table: "Companies",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Customers_TenantId",
                schema: "tenant",
                table: "Customers",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Customers_TenantId_Name",
                schema: "tenant",
                table: "Customers",
                columns: new[] { "TenantId", "Name" });

            migrationBuilder.CreateIndex(
                name: "IX_Departments_CompanyId",
                schema: "tenant",
                table: "Departments",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_Departments_CompanyId_Code",
                schema: "tenant",
                table: "Departments",
                columns: new[] { "CompanyId", "Code" },
                unique: true,
                filter: "\"Code\" IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Departments_IsActive",
                schema: "tenant",
                table: "Departments",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_Departments_ParentDepartmentId",
                schema: "tenant",
                table: "Departments",
                column: "ParentDepartmentId");

            migrationBuilder.CreateIndex(
                name: "IX_Departments_TenantId",
                schema: "tenant",
                table: "Departments",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_InvoiceItems_InvoiceId",
                schema: "tenant",
                table: "InvoiceItems",
                column: "InvoiceId");

            migrationBuilder.CreateIndex(
                name: "IX_InvoiceItems_ProductId",
                schema: "tenant",
                table: "InvoiceItems",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_InvoiceItems_TenantId",
                schema: "tenant",
                table: "InvoiceItems",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Invoices_CustomerId",
                schema: "tenant",
                table: "Invoices",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_Invoices_DueDate",
                schema: "tenant",
                table: "Invoices",
                column: "DueDate");

            migrationBuilder.CreateIndex(
                name: "IX_Invoices_InvoiceNumber",
                schema: "tenant",
                table: "Invoices",
                column: "InvoiceNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Invoices_Status",
                schema: "tenant",
                table: "Invoices",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Invoices_TenantId",
                schema: "tenant",
                table: "Invoices",
                column: "TenantId");

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
                name: "IX_Payments_CustomerId",
                schema: "tenant",
                table: "Payments",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_InvoiceId",
                schema: "tenant",
                table: "Payments",
                column: "InvoiceId");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_PaymentDate",
                schema: "tenant",
                table: "Payments",
                column: "PaymentDate");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_PaymentNumber",
                schema: "tenant",
                table: "Payments",
                column: "PaymentNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Payments_ReferenceNumber",
                schema: "tenant",
                table: "Payments",
                column: "ReferenceNumber");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_Status",
                schema: "tenant",
                table: "Payments",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_TenantId",
                schema: "tenant",
                table: "Payments",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Products_TenantId",
                schema: "tenant",
                table: "Products",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Products_TenantId_Code",
                schema: "tenant",
                table: "Products",
                columns: new[] { "TenantId", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Products_TenantId_Name",
                schema: "tenant",
                table: "Products",
                columns: new[] { "TenantId", "Name" });

            migrationBuilder.CreateIndex(
                name: "IX_RolePermissions_RoleId",
                schema: "tenant",
                table: "RolePermissions",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "IX_RolePermissions_RoleId_Resource_PermissionType",
                schema: "tenant",
                table: "RolePermissions",
                columns: new[] { "RoleId", "Resource", "PermissionType" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Roles_IsActive",
                schema: "tenant",
                table: "Roles",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_Roles_IsSystemRole",
                schema: "tenant",
                table: "Roles",
                column: "IsSystemRole");

            migrationBuilder.CreateIndex(
                name: "IX_Roles_Name",
                schema: "tenant",
                table: "Roles",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SetupWizards_Status",
                schema: "tenant",
                table: "SetupWizards",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_SetupWizards_WizardType",
                schema: "tenant",
                table: "SetupWizards",
                column: "WizardType");

            migrationBuilder.CreateIndex(
                name: "IX_SetupWizards_WizardType_Status",
                schema: "tenant",
                table: "SetupWizards",
                columns: new[] { "WizardType", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_SetupWizardSteps_Name",
                schema: "tenant",
                table: "SetupWizardSteps",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_SetupWizardSteps_Status",
                schema: "tenant",
                table: "SetupWizardSteps",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_SetupWizardSteps_WizardId",
                schema: "tenant",
                table: "SetupWizardSteps",
                column: "WizardId");

            migrationBuilder.CreateIndex(
                name: "IX_SetupWizardSteps_WizardId_StepOrder",
                schema: "tenant",
                table: "SetupWizardSteps",
                columns: new[] { "WizardId", "StepOrder" },
                unique: true);

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
                name: "IX_TenantInitialData_AdminUserEmail",
                schema: "tenant",
                table: "TenantInitialData",
                column: "AdminUserEmail");

            migrationBuilder.CreateIndex(
                name: "IX_TenantInitialData_CompanyName",
                schema: "tenant",
                table: "TenantInitialData",
                column: "CompanyName");

            migrationBuilder.CreateIndex(
                name: "IX_TenantInitialData_CreatedAt",
                schema: "tenant",
                table: "TenantInitialData",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_TenantInitialData_ProcessedAt",
                schema: "tenant",
                table: "TenantInitialData",
                column: "ProcessedAt");

            migrationBuilder.CreateIndex(
                name: "IX_TenantInitialData_Status",
                schema: "tenant",
                table: "TenantInitialData",
                column: "Status");

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
                name: "IX_TenantModules_ExpiryDate",
                schema: "tenant",
                table: "TenantModules",
                column: "ExpiryDate");

            migrationBuilder.CreateIndex(
                name: "IX_TenantModules_TenantId_IsEnabled",
                schema: "tenant",
                table: "TenantModules",
                columns: new[] { "TenantId", "IsEnabled" });

            migrationBuilder.CreateIndex(
                name: "IX_TenantModules_TenantId_ModuleCode",
                schema: "tenant",
                table: "TenantModules",
                columns: new[] { "TenantId", "ModuleCode" },
                unique: true);

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
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TenantSettings_IsSystemSetting",
                schema: "tenant",
                table: "TenantSettings",
                column: "IsSystemSetting");

            migrationBuilder.CreateIndex(
                name: "IX_TenantSettings_TenantId_Category",
                schema: "tenant",
                table: "TenantSettings",
                columns: new[] { "TenantId", "Category" });

            migrationBuilder.CreateIndex(
                name: "IX_TenantSettings_TenantId_SettingKey",
                schema: "tenant",
                table: "TenantSettings",
                columns: new[] { "TenantId", "SettingKey" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TenantSetupChecklists_CreatedAt",
                schema: "tenant",
                table: "TenantSetupChecklists",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_TenantSetupChecklists_OverallProgress",
                schema: "tenant",
                table: "TenantSetupChecklists",
                column: "OverallProgress");

            migrationBuilder.CreateIndex(
                name: "IX_TenantSetupChecklists_RequiredProgress",
                schema: "tenant",
                table: "TenantSetupChecklists",
                column: "RequiredProgress");

            migrationBuilder.CreateIndex(
                name: "IX_TenantSetupChecklists_Status",
                schema: "tenant",
                table: "TenantSetupChecklists",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_TenantUsers_BranchId",
                schema: "tenant",
                table: "TenantUsers",
                column: "BranchId");

            migrationBuilder.CreateIndex(
                name: "IX_TenantUsers_DepartmentId",
                schema: "tenant",
                table: "TenantUsers",
                column: "DepartmentId");

            migrationBuilder.CreateIndex(
                name: "IX_TenantUsers_Email",
                schema: "tenant",
                table: "TenantUsers",
                column: "Email");

            migrationBuilder.CreateIndex(
                name: "IX_TenantUsers_ManagerId",
                schema: "tenant",
                table: "TenantUsers",
                column: "ManagerId");

            migrationBuilder.CreateIndex(
                name: "IX_TenantUsers_MasterUserId",
                schema: "tenant",
                table: "TenantUsers",
                column: "MasterUserId");

            migrationBuilder.CreateIndex(
                name: "IX_TenantUsers_Status",
                schema: "tenant",
                table: "TenantUsers",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_TenantUsers_TenantId",
                schema: "tenant",
                table: "TenantUsers",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_TenantUsers_TenantId_EmployeeCode",
                schema: "tenant",
                table: "TenantUsers",
                columns: new[] { "TenantId", "EmployeeCode" },
                unique: true,
                filter: "\"EmployeeCode\" IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_TenantUsers_TenantId_Username",
                schema: "tenant",
                table: "TenantUsers",
                columns: new[] { "TenantId", "Username" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserPermissions_UserId",
                schema: "tenant",
                table: "UserPermissions",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserPermissions_UserId_Resource_PermissionType",
                schema: "tenant",
                table: "UserPermissions",
                columns: new[] { "UserId", "Resource", "PermissionType" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserRoles_RoleId",
                schema: "tenant",
                table: "UserRoles",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "IX_UserRoles_UserId",
                schema: "tenant",
                table: "UserRoles",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserRoles_UserId_RoleId",
                schema: "tenant",
                table: "UserRoles",
                columns: new[] { "UserId", "RoleId" },
                unique: true);

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
                name: "AuditLogs",
                schema: "tenant");

            migrationBuilder.DropTable(
                name: "Customers",
                schema: "tenant");

            migrationBuilder.DropTable(
                name: "InvoiceItems",
                schema: "tenant");

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
                name: "Payments",
                schema: "tenant");

            migrationBuilder.DropTable(
                name: "Products",
                schema: "tenant");

            migrationBuilder.DropTable(
                name: "RolePermissions",
                schema: "tenant");

            migrationBuilder.DropTable(
                name: "SetupWizardSteps",
                schema: "tenant");

            migrationBuilder.DropTable(
                name: "TenantActivityLogs",
                schema: "tenant");

            migrationBuilder.DropTable(
                name: "TenantApiKeys",
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
                name: "TenantInitialData",
                schema: "tenant");

            migrationBuilder.DropTable(
                name: "TenantIntegrations",
                schema: "tenant");

            migrationBuilder.DropTable(
                name: "TenantModules",
                schema: "tenant");

            migrationBuilder.DropTable(
                name: "TenantNotifications",
                schema: "tenant");

            migrationBuilder.DropTable(
                name: "TenantSecuritySettings",
                schema: "tenant");

            migrationBuilder.DropTable(
                name: "TenantSettings",
                schema: "tenant");

            migrationBuilder.DropTable(
                name: "TenantSetupChecklists",
                schema: "tenant");

            migrationBuilder.DropTable(
                name: "TenantWebhooks",
                schema: "tenant");

            migrationBuilder.DropTable(
                name: "UserPermissions",
                schema: "tenant");

            migrationBuilder.DropTable(
                name: "UserRoles",
                schema: "tenant");

            migrationBuilder.DropTable(
                name: "UserTenants",
                schema: "tenant");

            migrationBuilder.DropTable(
                name: "TenantOnboardings",
                schema: "tenant");

            migrationBuilder.DropTable(
                name: "Invoices",
                schema: "tenant");

            migrationBuilder.DropTable(
                name: "SetupWizards",
                schema: "tenant");

            migrationBuilder.DropTable(
                name: "TenantUsers",
                schema: "tenant");

            migrationBuilder.DropTable(
                name: "Roles",
                schema: "tenant");

            migrationBuilder.DropTable(
                name: "Branches",
                schema: "tenant");

            migrationBuilder.DropTable(
                name: "Departments",
                schema: "tenant");

            migrationBuilder.DropTable(
                name: "Companies",
                schema: "tenant");
        }
    }
}
