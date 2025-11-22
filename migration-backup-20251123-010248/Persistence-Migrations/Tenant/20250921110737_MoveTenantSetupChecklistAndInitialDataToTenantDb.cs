using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Persistence.Migrations.Tenant
{
    /// <inheritdoc />
    public partial class MoveTenantSetupChecklistAndInitialDataToTenantDb : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TenantInitialData",
                schema: "tenant",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DataSetType = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    CompanyName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    CompanyCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    TaxNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    TaxOffice = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    TradeRegistryNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    MersisNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    ContactEmail = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ContactPhone = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ContactFax = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Website = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    AddressLine1 = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    AddressLine2 = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    City = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    State = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Country = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    PostalCode = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    IndustryType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    BusinessType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    EmployeeCount = table.Column<int>(type: "int", nullable: true),
                    AnnualRevenue = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    Currency = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    FiscalYearStart = table.Column<int>(type: "int", nullable: true),
                    AdminUserEmail = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    AdminUserName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    AdminFirstName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    AdminLastName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    AdminPhone = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    AdminUserCreated = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    DefaultLanguage = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    DefaultTimeZone = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    DefaultDateFormat = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    DefaultNumberFormat = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Use24HourTime = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    EnabledModules = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RequestedFeatures = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreateSampleData = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    ImportExistingData = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    DataImportSource = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    DataImportFormat = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    InitialDepartments = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    InitialBranches = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    InitialRoles = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    InitialAccounts = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    InitialTaxRates = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    InitialProductCategories = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    InitialWarehouses = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ProcessedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ProcessedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ProcessAttempts = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    ProcessingError = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    ProcessingLog = table.Column<string>(type: "nvarchar(max)", maxLength: 256, nullable: true),
                    IsValidated = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    ValidatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ValidationErrors = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ValidationWarnings = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TenantInitialData", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TenantSetupChecklists",
                schema: "tenant",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    CompanyInfoCompleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    CompanyInfoCompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CompanyInfoCompletedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    LogoUploaded = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    LogoUploadedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LogoUploadedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    AdminUserCreated = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    AdminUserCreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    AdminUserCreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    DepartmentsCreated = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    DepartmentCount = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    DepartmentsCreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    BranchesCreated = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    BranchCount = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    BranchesCreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RolesConfigured = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    RoleCount = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    RolesConfiguredAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UsersInvited = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    UserCount = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    UsersInvitedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ModulesSelected = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    SelectedModulesList = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ModulesSelectedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ModulesConfigured = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    ModulesConfiguredAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ChartOfAccountsSetup = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    AccountCount = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    ChartOfAccountsSetupAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    TaxSettingsConfigured = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    TaxSettingsConfiguredAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CurrencyConfigured = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    PrimaryCurrency = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    CurrencyConfiguredAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FiscalYearConfigured = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    FiscalYearConfiguredAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ProductCategoriesCreated = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    ProductCategoryCount = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    ProductCategoriesCreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ProductsImported = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    ProductCount = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    ProductsImportedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    PricingRulesConfigured = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    PricingRulesConfiguredAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CustomersImported = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    CustomerCount = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    CustomersImportedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    VendorsImported = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    VendorCount = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    VendorsImportedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    SecuritySettingsConfigured = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    SecuritySettingsConfiguredAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    PasswordPolicySet = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    PasswordPolicySetAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    TwoFactorEnabled = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    TwoFactorEnabledAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    BackupConfigured = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    BackupConfiguredAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ComplianceConfigured = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    ComplianceConfiguredAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    EmailIntegrationConfigured = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    EmailIntegrationConfiguredAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    PaymentGatewayConfigured = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    PaymentGatewayConfiguredAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    SmsIntegrationConfigured = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    SmsIntegrationConfiguredAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ThirdPartyIntegrationsConfigured = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    IntegratedServices = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ThirdPartyIntegrationsConfiguredAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ThemeCustomized = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    ThemeCustomizedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    EmailTemplatesConfigured = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    EmailTemplatesConfiguredAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ReportTemplatesConfigured = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    ReportTemplatesConfiguredAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DashboardConfigured = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    DashboardConfiguredAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ApprovalWorkflowsConfigured = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    WorkflowCount = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    ApprovalWorkflowsConfiguredAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    NotificationRulesConfigured = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    NotificationRuleCount = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    NotificationRulesConfiguredAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    AutomationRulesConfigured = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    AutomationRuleCount = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    AutomationRulesConfiguredAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    TrainingCompleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    TrainedUserCount = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    TrainingCompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DocumentationReviewed = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    DocumentationReviewedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    SupportContactsAdded = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    SupportContactsAddedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DataMigrationCompleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    DataMigrationCompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    SystemTestingCompleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    SystemTestingCompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UserAcceptanceCompleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    UserAcceptanceCompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    GoLiveApproved = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    GoLiveApprovedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    GoLiveApprovedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    TotalItems = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    CompletedItems = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    RequiredItems = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    RequiredCompletedItems = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    OverallProgress = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false, defaultValue: 0m),
                    RequiredProgress = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false, defaultValue: 0m),
                    Notes = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    PendingTasks = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    BlockingIssues = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TenantSetupChecklists", x => x.Id);
                });

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
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TenantInitialData",
                schema: "tenant");

            migrationBuilder.DropTable(
                name: "TenantSetupChecklists",
                schema: "tenant");
        }
    }
}
