using FluentAssertions;
using Stocker.Domain.Tenant.Entities;
using System.Reflection;
using Xunit;

namespace Stocker.UnitTests.Domain.Tenant;

public class TenantSetupChecklistTests
{
    private const string CreatedBy = "admin@test.com";
    private const string UpdatedBy = "manager@test.com";

    [Fact]
    public void Create_WithValidData_ShouldCreateChecklist()
    {
        // Act
        var checklist = TenantSetupChecklist.Create(CreatedBy);

        // Assert
        checklist.Should().NotBeNull();
        checklist.Id.Should().NotBeEmpty();
        checklist.Status.Should().Be(ChecklistStatus.NotStarted);
        checklist.CreatedBy.Should().Be(CreatedBy);
        checklist.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        checklist.UpdatedAt.Should().BeNull();
        checklist.UpdatedBy.Should().BeNull();
        checklist.CompletedAt.Should().BeNull();
        
        // All items should be false initially
        checklist.CompanyInfoCompleted.Should().BeFalse();
        checklist.LogoUploaded.Should().BeFalse();
        checklist.AdminUserCreated.Should().BeFalse();
        checklist.DepartmentsCreated.Should().BeFalse();
        checklist.BranchesCreated.Should().BeFalse();
        checklist.RolesConfigured.Should().BeFalse();
        checklist.UsersInvited.Should().BeFalse();
        checklist.ModulesSelected.Should().BeFalse();
        checklist.ModulesConfigured.Should().BeFalse();
        
        // Progress should be zero
        checklist.TotalItems.Should().BeGreaterThan(0);
        checklist.CompletedItems.Should().Be(0);
        checklist.RequiredItems.Should().BeGreaterThan(0);
        checklist.RequiredCompletedItems.Should().Be(0);
        checklist.OverallProgress.Should().Be(0);
        checklist.RequiredProgress.Should().Be(0);
        
        // Lists should be initialized
        checklist.SelectedModulesList.Should().NotBeNull().And.BeEmpty();
        checklist.IntegratedServices.Should().NotBeNull().And.BeEmpty();
        checklist.PendingTasks.Should().NotBeNull().And.BeEmpty();
        checklist.BlockingIssues.Should().NotBeNull().And.BeEmpty();
    }

    [Fact]
    public void Create_WithNullCreatedBy_ShouldThrowArgumentException()
    {
        // Act
        var action = () => TenantSetupChecklist.Create(null!);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Created by cannot be empty.*")
            .WithParameterName("createdBy");
    }

    [Fact]
    public void Create_WithEmptyCreatedBy_ShouldThrowArgumentException()
    {
        // Act
        var action = () => TenantSetupChecklist.Create("");

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Created by cannot be empty.*")
            .WithParameterName("createdBy");
    }

    [Fact]
    public void Create_WithWhitespaceCreatedBy_ShouldThrowArgumentException()
    {
        // Act
        var action = () => TenantSetupChecklist.Create("  ");

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Created by cannot be empty.*")
            .WithParameterName("createdBy");
    }

    [Fact]
    public void CompleteCompanyInfo_ShouldUpdateCompanyInfoAndProgress()
    {
        // Arrange
        var checklist = CreateChecklist();
        var completedBy = "user@test.com";

        // Act
        checklist.CompleteCompanyInfo(completedBy);

        // Assert
        checklist.CompanyInfoCompleted.Should().BeTrue();
        checklist.CompanyInfoCompletedAt.Should().NotBeNull();
        checklist.CompanyInfoCompletedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        checklist.CompanyInfoCompletedBy.Should().Be(completedBy);
        checklist.CompletedItems.Should().Be(1);
        checklist.RequiredCompletedItems.Should().Be(1); // Company info is required
        checklist.OverallProgress.Should().BeGreaterThan(0);
        checklist.RequiredProgress.Should().BeGreaterThan(0);
        checklist.Status.Should().Be(ChecklistStatus.InProgress);
    }

    [Fact]
    public void UploadLogo_ShouldUpdateLogoAndProgress()
    {
        // Arrange
        var checklist = CreateChecklist();
        var uploadedBy = "user@test.com";

        // Act
        checklist.UploadLogo(uploadedBy);

        // Assert
        checklist.LogoUploaded.Should().BeTrue();
        checklist.LogoUploadedAt.Should().NotBeNull();
        checklist.LogoUploadedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        checklist.LogoUploadedBy.Should().Be(uploadedBy);
        checklist.CompletedItems.Should().Be(1);
        checklist.Status.Should().Be(ChecklistStatus.InProgress);
    }

    [Fact]
    public void CreateAdminUser_ShouldUpdateAdminUserAndProgress()
    {
        // Arrange
        var checklist = CreateChecklist();
        var createdByUser = "system@test.com";

        // Act
        checklist.CreateAdminUser(createdByUser);

        // Assert
        checklist.AdminUserCreated.Should().BeTrue();
        checklist.AdminUserCreatedAt.Should().NotBeNull();
        checklist.AdminUserCreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        checklist.AdminUserCreatedBy.Should().Be(createdByUser);
        checklist.CompletedItems.Should().Be(1);
        checklist.RequiredCompletedItems.Should().Be(1); // Admin user is required
    }

    [Fact]
    public void CreateDepartments_ShouldUpdateDepartmentsAndProgress()
    {
        // Arrange
        var checklist = CreateChecklist();
        var departmentCount = 5;

        // Act
        checklist.CreateDepartments(departmentCount);

        // Assert
        checklist.DepartmentsCreated.Should().BeTrue();
        checklist.DepartmentCount.Should().Be(departmentCount);
        checklist.DepartmentsCreatedAt.Should().NotBeNull();
        checklist.DepartmentsCreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        checklist.CompletedItems.Should().Be(1);
    }

    [Fact]
    public void CreateBranches_ShouldUpdateBranchesAndProgress()
    {
        // Arrange
        var checklist = CreateChecklist();
        var branchCount = 3;

        // Act
        checklist.CreateBranches(branchCount);

        // Assert
        checklist.BranchesCreated.Should().BeTrue();
        checklist.BranchCount.Should().Be(branchCount);
        checklist.BranchesCreatedAt.Should().NotBeNull();
        checklist.BranchesCreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        checklist.CompletedItems.Should().Be(1);
    }

    [Fact]
    public void ConfigureRoles_ShouldUpdateRolesAndProgress()
    {
        // Arrange
        var checklist = CreateChecklist();
        var roleCount = 8;

        // Act
        checklist.ConfigureRoles(roleCount);

        // Assert
        checklist.RolesConfigured.Should().BeTrue();
        checklist.RoleCount.Should().Be(roleCount);
        checklist.RolesConfiguredAt.Should().NotBeNull();
        checklist.RolesConfiguredAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        checklist.CompletedItems.Should().Be(1);
    }

    [Fact]
    public void InviteUsers_ShouldUpdateUsersAndProgress()
    {
        // Arrange
        var checklist = CreateChecklist();
        var userCount = 25;

        // Act
        checklist.InviteUsers(userCount);

        // Assert
        checklist.UsersInvited.Should().BeTrue();
        checklist.UserCount.Should().Be(userCount);
        checklist.UsersInvitedAt.Should().NotBeNull();
        checklist.UsersInvitedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        checklist.CompletedItems.Should().Be(1);
    }

    [Fact]
    public void SelectModules_ShouldUpdateModulesAndProgress()
    {
        // Arrange
        var checklist = CreateChecklist();
        var modules = new List<string> { "Inventory", "Sales", "Finance", "HR" };

        // Act
        checklist.SelectModules(modules);

        // Assert
        checklist.ModulesSelected.Should().BeTrue();
        checklist.SelectedModulesList.Should().BeEquivalentTo(modules);
        checklist.ModulesSelectedAt.Should().NotBeNull();
        checklist.ModulesSelectedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        checklist.CompletedItems.Should().Be(1);
        checklist.RequiredCompletedItems.Should().Be(1); // Module selection is required
    }

    [Fact]
    public void ConfigureModules_ShouldUpdateModuleConfigAndProgress()
    {
        // Arrange
        var checklist = CreateChecklist();

        // Act
        checklist.ConfigureModules();

        // Assert
        checklist.ModulesConfigured.Should().BeTrue();
        checklist.ModulesConfiguredAt.Should().NotBeNull();
        checklist.ModulesConfiguredAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        checklist.CompletedItems.Should().Be(1);
    }

    [Fact]
    public void SetupChartOfAccounts_ShouldUpdateAccountsAndProgress()
    {
        // Arrange
        var checklist = CreateChecklist();
        var accountCount = 150;

        // Act
        checklist.SetupChartOfAccounts(accountCount);

        // Assert
        checklist.ChartOfAccountsSetup.Should().BeTrue();
        checklist.AccountCount.Should().Be(accountCount);
        checklist.ChartOfAccountsSetupAt.Should().NotBeNull();
        checklist.ChartOfAccountsSetupAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        checklist.CompletedItems.Should().Be(1);
    }

    [Fact]
    public void ConfigureTaxSettings_ShouldUpdateTaxAndProgress()
    {
        // Arrange
        var checklist = CreateChecklist();

        // Act
        checklist.ConfigureTaxSettings();

        // Assert
        checklist.TaxSettingsConfigured.Should().BeTrue();
        checklist.TaxSettingsConfiguredAt.Should().NotBeNull();
        checklist.TaxSettingsConfiguredAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        checklist.CompletedItems.Should().Be(1);
    }

    [Fact]
    public void ConfigureCurrency_ShouldUpdateCurrencyAndProgress()
    {
        // Arrange
        var checklist = CreateChecklist();
        var currency = "USD";

        // Act
        checklist.ConfigureCurrency(currency);

        // Assert
        checklist.CurrencyConfigured.Should().BeTrue();
        checklist.PrimaryCurrency.Should().Be(currency);
        checklist.CurrencyConfiguredAt.Should().NotBeNull();
        checklist.CurrencyConfiguredAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        checklist.CompletedItems.Should().Be(1);
    }

    [Fact]
    public void ConfigureFiscalYear_ShouldUpdateFiscalYearAndProgress()
    {
        // Arrange
        var checklist = CreateChecklist();

        // Act
        checklist.ConfigureFiscalYear();

        // Assert
        checklist.FiscalYearConfigured.Should().BeTrue();
        checklist.FiscalYearConfiguredAt.Should().NotBeNull();
        checklist.FiscalYearConfiguredAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        checklist.CompletedItems.Should().Be(1);
    }

    [Fact]
    public void CreateProductCategories_ShouldUpdateCategoriesAndProgress()
    {
        // Arrange
        var checklist = CreateChecklist();
        var categoryCount = 20;

        // Act
        checklist.CreateProductCategories(categoryCount);

        // Assert
        checklist.ProductCategoriesCreated.Should().BeTrue();
        checklist.ProductCategoryCount.Should().Be(categoryCount);
        checklist.ProductCategoriesCreatedAt.Should().NotBeNull();
        checklist.ProductCategoriesCreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        checklist.CompletedItems.Should().Be(1);
    }

    [Fact]
    public void ImportProducts_ShouldUpdateProductsAndProgress()
    {
        // Arrange
        var checklist = CreateChecklist();
        var productCount = 500;

        // Act
        checklist.ImportProducts(productCount);

        // Assert
        checklist.ProductsImported.Should().BeTrue();
        checklist.ProductCount.Should().Be(productCount);
        checklist.ProductsImportedAt.Should().NotBeNull();
        checklist.ProductsImportedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        checklist.CompletedItems.Should().Be(1);
    }

    [Fact]
    public void ConfigurePricingRules_ShouldUpdatePricingAndProgress()
    {
        // Arrange
        var checklist = CreateChecklist();

        // Act
        checklist.ConfigurePricingRules();

        // Assert
        checklist.PricingRulesConfigured.Should().BeTrue();
        checklist.PricingRulesConfiguredAt.Should().NotBeNull();
        checklist.PricingRulesConfiguredAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        checklist.CompletedItems.Should().Be(1);
    }

    [Fact]
    public void ImportCustomers_ShouldUpdateCustomersAndProgress()
    {
        // Arrange
        var checklist = CreateChecklist();
        var customerCount = 250;

        // Act
        checklist.ImportCustomers(customerCount);

        // Assert
        checklist.CustomersImported.Should().BeTrue();
        checklist.CustomerCount.Should().Be(customerCount);
        checklist.CustomersImportedAt.Should().NotBeNull();
        checklist.CustomersImportedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        checklist.CompletedItems.Should().Be(1);
    }

    [Fact]
    public void ImportVendors_ShouldUpdateVendorsAndProgress()
    {
        // Arrange
        var checklist = CreateChecklist();
        var vendorCount = 50;

        // Act
        checklist.ImportVendors(vendorCount);

        // Assert
        checklist.VendorsImported.Should().BeTrue();
        checklist.VendorCount.Should().Be(vendorCount);
        checklist.VendorsImportedAt.Should().NotBeNull();
        checklist.VendorsImportedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        checklist.CompletedItems.Should().Be(1);
    }

    [Fact]
    public void ConfigureSecuritySettings_ShouldUpdateSecurityAndProgress()
    {
        // Arrange
        var checklist = CreateChecklist();

        // Act
        checklist.ConfigureSecuritySettings();

        // Assert
        checklist.SecuritySettingsConfigured.Should().BeTrue();
        checklist.SecuritySettingsConfiguredAt.Should().NotBeNull();
        checklist.SecuritySettingsConfiguredAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        checklist.CompletedItems.Should().Be(1);
        checklist.RequiredCompletedItems.Should().Be(1); // Security is required
    }

    [Fact]
    public void SetPasswordPolicy_ShouldUpdatePasswordPolicyAndProgress()
    {
        // Arrange
        var checklist = CreateChecklist();

        // Act
        checklist.SetPasswordPolicy();

        // Assert
        checklist.PasswordPolicySet.Should().BeTrue();
        checklist.PasswordPolicySetAt.Should().NotBeNull();
        checklist.PasswordPolicySetAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        checklist.CompletedItems.Should().Be(1);
        checklist.RequiredCompletedItems.Should().Be(1); // Password policy is required
    }

    [Fact]
    public void EnableTwoFactor_ShouldUpdateTwoFactorAndProgress()
    {
        // Arrange
        var checklist = CreateChecklist();

        // Act
        checklist.EnableTwoFactor();

        // Assert
        checklist.TwoFactorEnabled.Should().BeTrue();
        checklist.TwoFactorEnabledAt.Should().NotBeNull();
        checklist.TwoFactorEnabledAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        checklist.CompletedItems.Should().Be(1);
    }

    [Fact]
    public void ConfigureBackup_ShouldUpdateBackupAndProgress()
    {
        // Arrange
        var checklist = CreateChecklist();

        // Act
        checklist.ConfigureBackup();

        // Assert
        checklist.BackupConfigured.Should().BeTrue();
        checklist.BackupConfiguredAt.Should().NotBeNull();
        checklist.BackupConfiguredAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        checklist.CompletedItems.Should().Be(1);
    }

    [Fact]
    public void ConfigureCompliance_ShouldUpdateComplianceAndProgress()
    {
        // Arrange
        var checklist = CreateChecklist();

        // Act
        checklist.ConfigureCompliance();

        // Assert
        checklist.ComplianceConfigured.Should().BeTrue();
        checklist.ComplianceConfiguredAt.Should().NotBeNull();
        checklist.ComplianceConfiguredAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        checklist.CompletedItems.Should().Be(1);
    }

    [Fact]
    public void ApproveGoLive_ShouldCompleteChecklist()
    {
        // Arrange
        var checklist = CreateChecklist();
        var approvedBy = "ceo@test.com";

        // Act
        checklist.ApproveGoLive(approvedBy);

        // Assert
        checklist.GoLiveApproved.Should().BeTrue();
        checklist.GoLiveApprovedAt.Should().NotBeNull();
        checklist.GoLiveApprovedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        checklist.GoLiveApprovedBy.Should().Be(approvedBy);
        checklist.Status.Should().Be(ChecklistStatus.Completed);
        checklist.CompletedAt.Should().NotBeNull();
        checklist.CompletedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
    }

    [Fact]
    public void UpdateNotes_ShouldUpdateNotes()
    {
        // Arrange
        var checklist = CreateChecklist();
        var notes = "Additional configuration needed for finance module.";

        // Act
        checklist.UpdateNotes(notes);

        // Assert
        checklist.Notes.Should().Be(notes);
        checklist.UpdatedAt.Should().NotBeNull();
        checklist.UpdatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
    }

    [Fact]
    public void AddPendingTask_ShouldAddTaskToList()
    {
        // Arrange
        var checklist = CreateChecklist();
        var task1 = "Configure email templates";
        var task2 = "Import historical data";

        // Act
        checklist.AddPendingTask(task1);
        checklist.AddPendingTask(task2);

        // Assert
        checklist.PendingTasks.Should().NotBeNull();
        checklist.PendingTasks.Should().HaveCount(2);
        checklist.PendingTasks.Should().Contain(task1);
        checklist.PendingTasks.Should().Contain(task2);
        checklist.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public void AddBlockingIssue_ShouldAddIssueToList()
    {
        // Arrange
        var checklist = CreateChecklist();
        var issue1 = "Database connection timeout";
        var issue2 = "Missing API credentials";

        // Act
        checklist.AddBlockingIssue(issue1);
        checklist.AddBlockingIssue(issue2);

        // Assert
        checklist.BlockingIssues.Should().NotBeNull();
        checklist.BlockingIssues.Should().HaveCount(2);
        checklist.BlockingIssues.Should().Contain(issue1);
        checklist.BlockingIssues.Should().Contain(issue2);
        checklist.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public void UpdateModifiedBy_ShouldUpdateModificationInfo()
    {
        // Arrange
        var checklist = CreateChecklist();
        var modifiedBy = "user@test.com";

        // Act
        checklist.UpdateModifiedBy(modifiedBy);

        // Assert
        checklist.UpdatedBy.Should().Be(modifiedBy);
        checklist.UpdatedAt.Should().NotBeNull();
        checklist.UpdatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
    }

    [Fact]
    public void CompleteAllRequiredItems_ShouldUpdateStatusToRequiredCompleted()
    {
        // Arrange
        var checklist = CreateChecklist();

        // Act - Complete all required items
        checklist.CompleteCompanyInfo("user@test.com");
        checklist.CreateAdminUser("system@test.com");
        checklist.SelectModules(new List<string> { "Core", "Finance" });
        checklist.ConfigureSecuritySettings();
        checklist.SetPasswordPolicy();

        // Assert
        checklist.RequiredCompletedItems.Should().Be(5);
        checklist.RequiredProgress.Should().Be(100);
        checklist.Status.Should().Be(ChecklistStatus.RequiredCompleted);
    }

    [Fact]
    public void CompletePartialRequiredItems_ShouldUpdateStatusToInProgress()
    {
        // Arrange
        var checklist = CreateChecklist();

        // Act - Complete some but not all required items
        checklist.CompleteCompanyInfo("user@test.com");
        checklist.CreateAdminUser("system@test.com");

        // Assert
        checklist.RequiredCompletedItems.Should().Be(2);
        checklist.RequiredProgress.Should().BeLessThan(100);
        checklist.Status.Should().Be(ChecklistStatus.InProgress);
    }

    [Fact]
    public void CompleteNonRequiredItems_ShouldUpdateOverallProgressOnly()
    {
        // Arrange
        var checklist = CreateChecklist();

        // Act - Complete non-required items
        checklist.UploadLogo("user@test.com");
        checklist.CreateDepartments(5);
        checklist.CreateBranches(3);

        // Assert
        checklist.CompletedItems.Should().Be(3);
        checklist.RequiredCompletedItems.Should().Be(0);
        checklist.OverallProgress.Should().BeGreaterThan(0);
        checklist.RequiredProgress.Should().Be(0);
        checklist.Status.Should().Be(ChecklistStatus.InProgress);
    }

    [Fact]
    public void CompleteChecklistWorkflow_ShouldWorkCorrectly()
    {
        // Arrange
        var checklist = TenantSetupChecklist.Create(CreatedBy);

        // Act & Assert - Initial state
        checklist.Status.Should().Be(ChecklistStatus.NotStarted);
        checklist.CompletedItems.Should().Be(0);

        // Complete basic setup
        checklist.CompleteCompanyInfo("admin@company.com");
        checklist.UploadLogo("designer@company.com");
        checklist.CreateAdminUser("system");
        checklist.Status.Should().Be(ChecklistStatus.InProgress);

        // Complete organization setup
        checklist.CreateDepartments(8);
        checklist.CreateBranches(3);
        checklist.ConfigureRoles(12);
        checklist.InviteUsers(45);

        // Complete modules
        checklist.SelectModules(new List<string> { "Inventory", "Sales", "Finance", "HR", "CRM" });
        checklist.ConfigureModules();

        // Complete financial setup
        checklist.SetupChartOfAccounts(200);
        checklist.ConfigureTaxSettings();
        checklist.ConfigureCurrency("USD");
        checklist.ConfigureFiscalYear();

        // Complete products
        checklist.CreateProductCategories(25);
        checklist.ImportProducts(1500);
        checklist.ConfigurePricingRules();

        // Complete customers/vendors
        checklist.ImportCustomers(500);
        checklist.ImportVendors(100);

        // Complete security (all required)
        checklist.ConfigureSecuritySettings();
        checklist.SetPasswordPolicy();
        checklist.EnableTwoFactor();
        checklist.ConfigureBackup();
        checklist.ConfigureCompliance();

        // At this point, all required items should be completed
        checklist.RequiredCompletedItems.Should().Be(5);
        checklist.RequiredProgress.Should().Be(100);
        checklist.Status.Should().Be(ChecklistStatus.RequiredCompleted);

        // Add some notes and tasks
        checklist.UpdateNotes("System ready for go-live after final review");
        checklist.AddPendingTask("Schedule training sessions");
        checklist.AddPendingTask("Prepare go-live announcement");

        // Final approval
        checklist.ApproveGoLive("ceo@company.com");

        // Final state
        checklist.Status.Should().Be(ChecklistStatus.Completed);
        checklist.GoLiveApproved.Should().BeTrue();
        checklist.GoLiveApprovedBy.Should().Be("ceo@company.com");
        checklist.CompletedAt.Should().NotBeNull();
        checklist.CompletedItems.Should().BeGreaterThan(15);
        checklist.OverallProgress.Should().BeGreaterThan(50);
    }

    [Fact]
    public void ProgressCalculation_ShouldBeAccurate()
    {
        // Arrange
        var checklist = CreateChecklist();
        
        // Get actual count of boolean properties
        var booleanProperties = typeof(TenantSetupChecklist)
            .GetProperties(BindingFlags.Public | BindingFlags.Instance)
            .Where(p => p.PropertyType == typeof(bool) && 
                       !p.Name.Contains("Required") &&
                       p.Name != "IsActive")
            .ToList();

        // Act - Complete a known number of items
        checklist.CompleteCompanyInfo("user");
        checklist.UploadLogo("user");
        checklist.CreateAdminUser("user");
        checklist.CreateDepartments(5);
        checklist.CreateBranches(3);

        // Assert
        checklist.TotalItems.Should().Be(booleanProperties.Count);
        checklist.CompletedItems.Should().Be(5);
        var expectedProgress = (5m / booleanProperties.Count) * 100;
        checklist.OverallProgress.Should().BeApproximately(expectedProgress, 0.01m);
    }

    [Fact]
    public void MultipleStatusTransitions_ShouldWorkCorrectly()
    {
        // Arrange
        var checklist = CreateChecklist();

        // Act & Assert - NotStarted
        checklist.Status.Should().Be(ChecklistStatus.NotStarted);

        // Transition to InProgress
        checklist.UploadLogo("user");
        checklist.Status.Should().Be(ChecklistStatus.InProgress);

        // Complete all required items - transition to RequiredCompleted
        checklist.CompleteCompanyInfo("user");
        checklist.CreateAdminUser("user");
        checklist.SelectModules(new List<string> { "Core" });
        checklist.ConfigureSecuritySettings();
        checklist.SetPasswordPolicy();
        checklist.Status.Should().Be(ChecklistStatus.RequiredCompleted);

        // Approve go-live - transition to Completed
        checklist.ApproveGoLive("manager");
        checklist.Status.Should().Be(ChecklistStatus.Completed);
    }

    [Theory]
    [InlineData(0, 0)]
    [InlineData(1, 20)]
    [InlineData(2, 40)]
    [InlineData(3, 60)]
    [InlineData(4, 80)]
    [InlineData(5, 100)]
    public void RequiredProgress_ShouldCalculateCorrectly(int completedRequiredItems, decimal expectedProgress)
    {
        // Arrange
        var checklist = CreateChecklist();
        var actions = new Action<TenantSetupChecklist>[]
        {
            c => c.CompleteCompanyInfo("user"),
            c => c.CreateAdminUser("user"),
            c => c.SelectModules(new List<string> { "Core" }),
            c => c.ConfigureSecuritySettings(),
            c => c.SetPasswordPolicy()
        };

        // Act
        for (int i = 0; i < completedRequiredItems; i++)
        {
            actions[i](checklist);
        }

        // Assert
        checklist.RequiredCompletedItems.Should().Be(completedRequiredItems);
        checklist.RequiredProgress.Should().Be(expectedProgress);
    }

    private TenantSetupChecklist CreateChecklist()
    {
        return TenantSetupChecklist.Create(CreatedBy);
    }
}