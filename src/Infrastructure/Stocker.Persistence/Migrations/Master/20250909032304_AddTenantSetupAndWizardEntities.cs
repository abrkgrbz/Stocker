using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stocker.Persistence.Migrations.Master
{
    /// <inheritdoc />
    public partial class AddTenantSetupAndWizardEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TenantInitialData",
                schema: "Master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DataSetType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    CompanyName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    CompanyCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    TaxNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    TaxOffice = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    TradeRegistryNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    MersisNumber = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    ContactEmail = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    ContactPhone = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ContactFax = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Website = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
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
                    Currency = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: true),
                    FiscalYearStart = table.Column<int>(type: "int", nullable: true),
                    AdminUserEmail = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    AdminUserName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    AdminFirstName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    AdminLastName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    AdminPhone = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    AdminUserCreated = table.Column<bool>(type: "bit", nullable: false),
                    DefaultLanguage = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    DefaultTimeZone = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    DefaultDateFormat = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    DefaultTimeFormat = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    DefaultCurrency = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false),
                    DefaultTheme = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    SelectedModules = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    ModuleConfigurations = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    CreateSampleData = table.Column<bool>(type: "bit", nullable: false),
                    ImportExistingData = table.Column<bool>(type: "bit", nullable: false),
                    ImportedDataSources = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    ImportedRecordsCount = table.Column<int>(type: "int", nullable: true),
                    DefaultDepartments = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    DefaultBranches = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    DepartmentsCreated = table.Column<bool>(type: "bit", nullable: false),
                    BranchesCreated = table.Column<bool>(type: "bit", nullable: false),
                    UseDefaultChartOfAccounts = table.Column<bool>(type: "bit", nullable: false),
                    ChartOfAccountsTemplate = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ChartOfAccountsCreated = table.Column<bool>(type: "bit", nullable: false),
                    DefaultProductCategories = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    ProductCategoriesCreated = table.Column<bool>(type: "bit", nullable: false),
                    CustomerTemplate = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    VendorTemplate = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    TemplatesCreated = table.Column<bool>(type: "bit", nullable: false),
                    ApprovalWorkflows = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    NotificationRules = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    WorkflowsConfigured = table.Column<bool>(type: "bit", nullable: false),
                    PreferredIntegrations = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    IntegrationsConfigured = table.Column<bool>(type: "bit", nullable: false),
                    SetupStepsCompleted = table.Column<int>(type: "int", nullable: false),
                    TotalSetupSteps = table.Column<int>(type: "int", nullable: false),
                    SetupProgressPercentage = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false),
                    IsValidated = table.Column<bool>(type: "bit", nullable: false),
                    ValidatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ValidationErrors = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    IsProcessed = table.Column<bool>(type: "bit", nullable: false),
                    ProcessedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ProcessingErrors = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    ProcessingAttempts = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true)
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
                name: "TenantSetupChecklists",
                schema: "Master",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    CompanyInfoCompleted = table.Column<bool>(type: "bit", nullable: false),
                    CompanyInfoCompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CompanyInfoCompletedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    LogoUploaded = table.Column<bool>(type: "bit", nullable: false),
                    LogoUploadedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LogoUploadedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    AdminUserCreated = table.Column<bool>(type: "bit", nullable: false),
                    AdminUserCreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    AdminUserCreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    DepartmentsCreated = table.Column<bool>(type: "bit", nullable: false),
                    DepartmentCount = table.Column<int>(type: "int", nullable: false),
                    DepartmentsCreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    BranchesCreated = table.Column<bool>(type: "bit", nullable: false),
                    BranchCount = table.Column<int>(type: "int", nullable: false),
                    BranchesCreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RolesConfigured = table.Column<bool>(type: "bit", nullable: false),
                    RoleCount = table.Column<int>(type: "int", nullable: false),
                    RolesConfiguredAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UsersInvited = table.Column<bool>(type: "bit", nullable: false),
                    UserCount = table.Column<int>(type: "int", nullable: false),
                    UsersInvitedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ModulesSelected = table.Column<bool>(type: "bit", nullable: false),
                    SelectedModulesList = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    ModulesSelectedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ModulesConfigured = table.Column<bool>(type: "bit", nullable: false),
                    ModulesConfiguredAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ChartOfAccountsSetup = table.Column<bool>(type: "bit", nullable: false),
                    AccountCount = table.Column<int>(type: "int", nullable: false),
                    ChartOfAccountsSetupAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    TaxSettingsConfigured = table.Column<bool>(type: "bit", nullable: false),
                    TaxSettingsConfiguredAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CurrencyConfigured = table.Column<bool>(type: "bit", nullable: false),
                    PrimaryCurrency = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: true),
                    CurrencyConfiguredAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FiscalYearConfigured = table.Column<bool>(type: "bit", nullable: false),
                    FiscalYearConfiguredAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ProductCategoriesCreated = table.Column<bool>(type: "bit", nullable: false),
                    ProductCategoryCount = table.Column<int>(type: "int", nullable: false),
                    ProductCategoriesCreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ProductsImported = table.Column<bool>(type: "bit", nullable: false),
                    ProductCount = table.Column<int>(type: "int", nullable: false),
                    ProductsImportedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    PricingRulesConfigured = table.Column<bool>(type: "bit", nullable: false),
                    PricingRulesConfiguredAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CustomersImported = table.Column<bool>(type: "bit", nullable: false),
                    CustomerCount = table.Column<int>(type: "int", nullable: false),
                    CustomersImportedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    VendorsImported = table.Column<bool>(type: "bit", nullable: false),
                    VendorCount = table.Column<int>(type: "int", nullable: false),
                    VendorsImportedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    SecuritySettingsConfigured = table.Column<bool>(type: "bit", nullable: false),
                    SecuritySettingsConfiguredAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    PasswordPolicySet = table.Column<bool>(type: "bit", nullable: false),
                    PasswordPolicySetAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    TwoFactorEnabled = table.Column<bool>(type: "bit", nullable: false),
                    TwoFactorEnabledAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    BackupConfigured = table.Column<bool>(type: "bit", nullable: false),
                    BackupConfiguredAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ComplianceConfigured = table.Column<bool>(type: "bit", nullable: false),
                    ComplianceConfiguredAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    EmailIntegrationConfigured = table.Column<bool>(type: "bit", nullable: false),
                    EmailIntegrationConfiguredAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    PaymentGatewayConfigured = table.Column<bool>(type: "bit", nullable: false),
                    PaymentGatewayConfiguredAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    SmsIntegrationConfigured = table.Column<bool>(type: "bit", nullable: false),
                    SmsIntegrationConfiguredAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ThirdPartyIntegrationsConfigured = table.Column<bool>(type: "bit", nullable: false),
                    IntegratedServices = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    ThirdPartyIntegrationsConfiguredAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ThemeCustomized = table.Column<bool>(type: "bit", nullable: false),
                    ThemeCustomizedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    EmailTemplatesConfigured = table.Column<bool>(type: "bit", nullable: false),
                    EmailTemplatesConfiguredAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ReportTemplatesConfigured = table.Column<bool>(type: "bit", nullable: false),
                    ReportTemplatesConfiguredAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DashboardConfigured = table.Column<bool>(type: "bit", nullable: false),
                    DashboardConfiguredAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ApprovalWorkflowsConfigured = table.Column<bool>(type: "bit", nullable: false),
                    WorkflowCount = table.Column<int>(type: "int", nullable: false),
                    ApprovalWorkflowsConfiguredAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    NotificationRulesConfigured = table.Column<bool>(type: "bit", nullable: false),
                    NotificationRuleCount = table.Column<int>(type: "int", nullable: false),
                    NotificationRulesConfiguredAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    AutomationRulesConfigured = table.Column<bool>(type: "bit", nullable: false),
                    AutomationRuleCount = table.Column<int>(type: "int", nullable: false),
                    AutomationRulesConfiguredAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    TrainingCompleted = table.Column<bool>(type: "bit", nullable: false),
                    TrainedUserCount = table.Column<int>(type: "int", nullable: false),
                    TrainingCompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DocumentationReviewed = table.Column<bool>(type: "bit", nullable: false),
                    DocumentationReviewedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    SupportContactsAdded = table.Column<bool>(type: "bit", nullable: false),
                    SupportContactsAddedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DataMigrationCompleted = table.Column<bool>(type: "bit", nullable: false),
                    DataMigrationCompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    SystemTestingCompleted = table.Column<bool>(type: "bit", nullable: false),
                    SystemTestingCompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UserAcceptanceCompleted = table.Column<bool>(type: "bit", nullable: false),
                    UserAcceptanceCompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    GoLiveApproved = table.Column<bool>(type: "bit", nullable: false),
                    GoLiveApprovedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    GoLiveApprovedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    TotalItems = table.Column<int>(type: "int", nullable: false),
                    CompletedItems = table.Column<int>(type: "int", nullable: false),
                    RequiredItems = table.Column<int>(type: "int", nullable: false),
                    RequiredCompletedItems = table.Column<int>(type: "int", nullable: false),
                    OverallProgress = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false),
                    RequiredProgress = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    PendingTasks = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    BlockingIssues = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
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
                    WizardType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    TotalSteps = table.Column<int>(type: "int", nullable: false),
                    CompletedSteps = table.Column<int>(type: "int", nullable: false),
                    CurrentStep = table.Column<int>(type: "int", nullable: false),
                    ProgressPercentage = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false),
                    CurrentStepName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    CurrentStepDescription = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    CurrentStepCategory = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    IsCurrentStepRequired = table.Column<bool>(type: "bit", nullable: false),
                    CanSkipCurrentStep = table.Column<bool>(type: "bit", nullable: false),
                    CompletedStepsData = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    SkippedStepsData = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    PendingStepsData = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    StartedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastActivityAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    EstimatedCompletionTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    TotalTimeSpent = table.Column<long>(type: "bigint", nullable: true),
                    AverageStepTime = table.Column<long>(type: "bigint", nullable: true),
                    StartedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    CompletedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    LastModifiedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    NeedsAssistance = table.Column<bool>(type: "bit", nullable: false),
                    AssistanceNotes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    HelpRequestCount = table.Column<int>(type: "int", nullable: false),
                    LastHelpRequestAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    HasErrors = table.Column<bool>(type: "bit", nullable: false),
                    ErrorMessages = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    HasWarnings = table.Column<bool>(type: "bit", nullable: false),
                    WarningMessages = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    SavedConfiguration = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    DefaultConfiguration = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    AutoSaveEnabled = table.Column<bool>(type: "bit", nullable: false),
                    LastAutoSaveAt = table.Column<DateTime>(type: "datetime2", nullable: true)
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
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TenantInitialData",
                schema: "Master");

            migrationBuilder.DropTable(
                name: "TenantSetupChecklists",
                schema: "Master");

            migrationBuilder.DropTable(
                name: "TenantSetupWizards",
                schema: "Master");
        }
    }
}
