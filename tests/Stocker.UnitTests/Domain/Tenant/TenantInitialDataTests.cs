using FluentAssertions;
using Stocker.Domain.Tenant.Entities;
using Xunit;

namespace Stocker.UnitTests.Domain.Tenant;

public class TenantInitialDataTests
{
    private const string CompanyName = "Test Company Ltd.";
    private const string ContactEmail = "info@testcompany.com";
    private const string ContactPhone = "+90 555 1234567";
    private const string AdminUserEmail = "admin@testcompany.com";
    private const string AdminUserName = "admin";
    private const string CreatedBy = "system@test.com";
    private const string ProcessedBy = "processor@test.com";

    [Fact]
    public void Create_WithValidData_ShouldCreateInitialData()
    {
        // Act
        var initialData = TenantInitialData.Create(
            CompanyName,
            ContactEmail,
            ContactPhone,
            AdminUserEmail,
            AdminUserName,
            CreatedBy);

        // Assert
        initialData.Should().NotBeNull();
        initialData.Id.Should().NotBeEmpty();
        initialData.CompanyName.Should().Be(CompanyName);
        initialData.ContactEmail.Should().Be(ContactEmail);
        initialData.ContactPhone.Should().Be(ContactPhone);
        initialData.AdminUserEmail.Should().Be(AdminUserEmail);
        initialData.AdminUserName.Should().Be(AdminUserName);
        initialData.CreatedBy.Should().Be(CreatedBy);
        initialData.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        initialData.Status.Should().Be(DataSetStatus.Pending);
        initialData.DataSetType.Should().Be(DataSetType.InitialSetup);
        initialData.ProcessAttempts.Should().Be(0);
        initialData.AdminUserCreated.Should().BeFalse();
        initialData.IsValidated.Should().BeFalse();
        initialData.Use24HourTime.Should().BeFalse();
        initialData.CreateSampleData.Should().BeFalse();
        initialData.ImportExistingData.Should().BeFalse();
        initialData.EnabledModules.Should().BeEmpty();
        initialData.RequestedFeatures.Should().BeEmpty();
        initialData.InitialDepartments.Should().BeEmpty();
        initialData.InitialBranches.Should().BeEmpty();
        initialData.InitialRoles.Should().BeEmpty();
        initialData.InitialAccounts.Should().BeEmpty();
        initialData.InitialTaxRates.Should().BeEmpty();
        initialData.InitialProductCategories.Should().BeEmpty();
        initialData.InitialWarehouses.Should().BeEmpty();
        initialData.ValidationErrors.Should().BeEmpty();
        initialData.ValidationWarnings.Should().BeEmpty();
    }

    [Fact]
    public void Create_WithNullCompanyName_ShouldThrowArgumentException()
    {
        // Act
        var action = () => TenantInitialData.Create(
            null!,
            ContactEmail,
            ContactPhone,
            AdminUserEmail,
            AdminUserName,
            CreatedBy);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Company name cannot be empty.*")
            .WithParameterName("companyName");
    }

    [Fact]
    public void Create_WithEmptyCompanyName_ShouldThrowArgumentException()
    {
        // Act
        var action = () => TenantInitialData.Create(
            "",
            ContactEmail,
            ContactPhone,
            AdminUserEmail,
            AdminUserName,
            CreatedBy);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Company name cannot be empty.*")
            .WithParameterName("companyName");
    }

    [Fact]
    public void Create_WithNullContactEmail_ShouldThrowArgumentException()
    {
        // Act
        var action = () => TenantInitialData.Create(
            CompanyName,
            null!,
            ContactPhone,
            AdminUserEmail,
            AdminUserName,
            CreatedBy);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Contact email cannot be empty.*")
            .WithParameterName("contactEmail");
    }

    [Fact]
    public void Create_WithNullContactPhone_ShouldThrowArgumentException()
    {
        // Act
        var action = () => TenantInitialData.Create(
            CompanyName,
            ContactEmail,
            null!,
            AdminUserEmail,
            AdminUserName,
            CreatedBy);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Contact phone cannot be empty.*")
            .WithParameterName("contactPhone");
    }

    [Fact]
    public void Create_WithNullAdminUserEmail_ShouldThrowArgumentException()
    {
        // Act
        var action = () => TenantInitialData.Create(
            CompanyName,
            ContactEmail,
            ContactPhone,
            null!,
            AdminUserName,
            CreatedBy);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Admin user email cannot be empty.*")
            .WithParameterName("adminUserEmail");
    }

    [Fact]
    public void Create_WithNullAdminUserName_ShouldThrowArgumentException()
    {
        // Act
        var action = () => TenantInitialData.Create(
            CompanyName,
            ContactEmail,
            ContactPhone,
            AdminUserEmail,
            null!,
            CreatedBy);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Admin user name cannot be empty.*")
            .WithParameterName("adminUserName");
    }

    [Fact]
    public void Create_WithNullCreatedBy_ShouldThrowArgumentException()
    {
        // Act
        var action = () => TenantInitialData.Create(
            CompanyName,
            ContactEmail,
            ContactPhone,
            AdminUserEmail,
            AdminUserName,
            null!);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Created by cannot be empty.*")
            .WithParameterName("createdBy");
    }

    [Fact]
    public void SetCompanyDetails_ShouldSetAllCompanyProperties()
    {
        // Arrange
        var initialData = CreateInitialData();
        var companyCode = "TST001";
        var taxNumber = "1234567890";
        var taxOffice = "Istanbul";
        var tradeRegistryNumber = "TR-12345";
        var mersisNumber = "0123456789012345";

        // Act
        initialData.SetCompanyDetails(
            companyCode,
            taxNumber,
            taxOffice,
            tradeRegistryNumber,
            mersisNumber);

        // Assert
        initialData.CompanyCode.Should().Be(companyCode);
        initialData.TaxNumber.Should().Be(taxNumber);
        initialData.TaxOffice.Should().Be(taxOffice);
        initialData.TradeRegistryNumber.Should().Be(tradeRegistryNumber);
        initialData.MersisNumber.Should().Be(mersisNumber);
    }

    [Fact]
    public void SetCompanyDetails_WithNullValues_ShouldAcceptNulls()
    {
        // Arrange
        var initialData = CreateInitialData();

        // Act
        initialData.SetCompanyDetails(null, null, null, null, null);

        // Assert
        initialData.CompanyCode.Should().BeNull();
        initialData.TaxNumber.Should().BeNull();
        initialData.TaxOffice.Should().BeNull();
        initialData.TradeRegistryNumber.Should().BeNull();
        initialData.MersisNumber.Should().BeNull();
    }

    [Fact]
    public void SetContactDetails_ShouldSetFaxAndWebsite()
    {
        // Arrange
        var initialData = CreateInitialData();
        var fax = "+90 555 7654321";
        var website = "https://www.testcompany.com";

        // Act
        initialData.SetContactDetails(fax, website);

        // Assert
        initialData.ContactFax.Should().Be(fax);
        initialData.Website.Should().Be(website);
    }

    [Fact]
    public void SetAddress_ShouldSetAllAddressProperties()
    {
        // Arrange
        var initialData = CreateInitialData();
        var addressLine1 = "123 Main Street";
        var addressLine2 = "Suite 456";
        var city = "Istanbul";
        var state = "Istanbul";
        var country = "Turkey";
        var postalCode = "34000";

        // Act
        initialData.SetAddress(
            addressLine1,
            addressLine2,
            city,
            state,
            country,
            postalCode);

        // Assert
        initialData.AddressLine1.Should().Be(addressLine1);
        initialData.AddressLine2.Should().Be(addressLine2);
        initialData.City.Should().Be(city);
        initialData.State.Should().Be(state);
        initialData.Country.Should().Be(country);
        initialData.PostalCode.Should().Be(postalCode);
    }

    [Fact]
    public void SetBusinessInfo_WithValidData_ShouldSetAllBusinessProperties()
    {
        // Arrange
        var initialData = CreateInitialData();
        var industryType = "Technology";
        var businessType = "Software Development";
        var employeeCount = 50;
        var annualRevenue = 5000000m;
        var currency = "USD";
        var fiscalYearStart = 1;

        // Act
        initialData.SetBusinessInfo(
            industryType,
            businessType,
            employeeCount,
            annualRevenue,
            currency,
            fiscalYearStart);

        // Assert
        initialData.IndustryType.Should().Be(industryType);
        initialData.BusinessType.Should().Be(businessType);
        initialData.EmployeeCount.Should().Be(employeeCount);
        initialData.AnnualRevenue.Should().Be(annualRevenue);
        initialData.Currency.Should().Be(currency);
        initialData.FiscalYearStart.Should().Be(fiscalYearStart);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(13)]
    [InlineData(-1)]
    [InlineData(100)]
    public void SetBusinessInfo_WithInvalidFiscalYearStart_ShouldThrowArgumentException(int invalidMonth)
    {
        // Arrange
        var initialData = CreateInitialData();

        // Act
        var action = () => initialData.SetBusinessInfo(
            "Technology",
            "Software",
            50,
            5000000m,
            "USD",
            invalidMonth);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Fiscal year start must be between 1 and 12.*")
            .WithParameterName("fiscalYearStart");
    }

    [Theory]
    [InlineData(1)]
    [InlineData(6)]
    [InlineData(12)]
    public void SetBusinessInfo_WithValidFiscalYearStart_ShouldAccept(int validMonth)
    {
        // Arrange
        var initialData = CreateInitialData();

        // Act
        initialData.SetBusinessInfo(
            "Technology",
            "Software",
            50,
            5000000m,
            "USD",
            validMonth);

        // Assert
        initialData.FiscalYearStart.Should().Be(validMonth);
    }

    [Fact]
    public void SetBusinessInfo_WithNullFiscalYearStart_ShouldAcceptNull()
    {
        // Arrange
        var initialData = CreateInitialData();

        // Act
        initialData.SetBusinessInfo(
            "Technology",
            "Software",
            50,
            5000000m,
            "USD",
            null);

        // Assert
        initialData.FiscalYearStart.Should().BeNull();
    }

    [Fact]
    public void SetAdminUserDetails_ShouldSetAdminUserProperties()
    {
        // Arrange
        var initialData = CreateInitialData();
        var firstName = "John";
        var lastName = "Doe";
        var phone = "+90 555 9876543";

        // Act
        initialData.SetAdminUserDetails(firstName, lastName, phone);

        // Assert
        initialData.AdminFirstName.Should().Be(firstName);
        initialData.AdminLastName.Should().Be(lastName);
        initialData.AdminPhone.Should().Be(phone);
    }

    [Fact]
    public void MarkAdminUserCreated_ShouldSetAdminUserCreatedToTrue()
    {
        // Arrange
        var initialData = CreateInitialData();

        // Act
        initialData.MarkAdminUserCreated();

        // Assert
        initialData.AdminUserCreated.Should().BeTrue();
    }

    [Fact]
    public void SetDefaultSettings_ShouldSetAllDefaultSettings()
    {
        // Arrange
        var initialData = CreateInitialData();
        var language = "en-US";
        var timeZone = "America/New_York";
        var dateFormat = "MM/dd/yyyy";
        var numberFormat = "#,###.##";
        var use24HourTime = true;

        // Act
        initialData.SetDefaultSettings(
            language,
            timeZone,
            dateFormat,
            numberFormat,
            use24HourTime);

        // Assert
        initialData.DefaultLanguage.Should().Be(language);
        initialData.DefaultTimeZone.Should().Be(timeZone);
        initialData.DefaultDateFormat.Should().Be(dateFormat);
        initialData.DefaultNumberFormat.Should().Be(numberFormat);
        initialData.Use24HourTime.Should().Be(use24HourTime);
    }

    [Fact]
    public void SetEnabledModules_WithModules_ShouldSetModules()
    {
        // Arrange
        var initialData = CreateInitialData();
        var modules = new List<string> { "Sales", "Inventory", "Accounting", "HR" };

        // Act
        initialData.SetEnabledModules(modules);

        // Assert
        initialData.EnabledModules.Should().HaveCount(4);
        initialData.EnabledModules.Should().Contain("Sales");
        initialData.EnabledModules.Should().Contain("Inventory");
        initialData.EnabledModules.Should().Contain("Accounting");
        initialData.EnabledModules.Should().Contain("HR");
    }

    [Fact]
    public void SetEnabledModules_WithNull_ShouldSetEmptyList()
    {
        // Arrange
        var initialData = CreateInitialData();

        // Act
        initialData.SetEnabledModules(null!);

        // Assert
        initialData.EnabledModules.Should().NotBeNull();
        initialData.EnabledModules.Should().BeEmpty();
    }

    [Fact]
    public void SetRequestedFeatures_WithFeatures_ShouldSetFeatures()
    {
        // Arrange
        var initialData = CreateInitialData();
        var features = new List<string> { "MultiCurrency", "AdvancedReporting", "APIAccess" };

        // Act
        initialData.SetRequestedFeatures(features);

        // Assert
        initialData.RequestedFeatures.Should().HaveCount(3);
        initialData.RequestedFeatures.Should().Contain("MultiCurrency");
        initialData.RequestedFeatures.Should().Contain("AdvancedReporting");
        initialData.RequestedFeatures.Should().Contain("APIAccess");
    }

    [Fact]
    public void EnableSampleData_ShouldSetCreateSampleDataToTrue()
    {
        // Arrange
        var initialData = CreateInitialData();

        // Act
        initialData.EnableSampleData();

        // Assert
        initialData.CreateSampleData.Should().BeTrue();
    }

    [Fact]
    public void SetupDataImport_ShouldSetImportProperties()
    {
        // Arrange
        var initialData = CreateInitialData();
        var source = "Excel File";
        var format = "XLSX";

        // Act
        initialData.SetupDataImport(source, format);

        // Assert
        initialData.ImportExistingData.Should().BeTrue();
        initialData.DataImportSource.Should().Be(source);
        initialData.DataImportFormat.Should().Be(format);
    }

    [Fact]
    public void AddInitialDepartment_ShouldAddDepartment()
    {
        // Arrange
        var initialData = CreateInitialData();

        // Act
        initialData.AddInitialDepartment("IT", "Information Technology", "IT Department");
        initialData.AddInitialDepartment("HR", "Human Resources");
        initialData.AddInitialDepartment("FIN", "Finance", "Finance and Accounting");

        // Assert
        initialData.InitialDepartments.Should().HaveCount(3);
        
        var itDept = initialData.InitialDepartments[0];
        itDept.Code.Should().Be("IT");
        itDept.Name.Should().Be("Information Technology");
        itDept.Description.Should().Be("IT Department");
        
        var hrDept = initialData.InitialDepartments[1];
        hrDept.Code.Should().Be("HR");
        hrDept.Name.Should().Be("Human Resources");
        hrDept.Description.Should().BeNull();
    }

    [Fact]
    public void AddInitialBranch_ShouldAddBranch()
    {
        // Arrange
        var initialData = CreateInitialData();

        // Act
        initialData.AddInitialBranch("HQ", "Headquarters", "123 Main St, Istanbul");
        initialData.AddInitialBranch("BR1", "Branch 1");
        initialData.AddInitialBranch("BR2", "Branch 2", "456 Second St, Ankara");

        // Assert
        initialData.InitialBranches.Should().HaveCount(3);
        
        var hq = initialData.InitialBranches[0];
        hq.Code.Should().Be("HQ");
        hq.Name.Should().Be("Headquarters");
        hq.Address.Should().Be("123 Main St, Istanbul");
        
        var br1 = initialData.InitialBranches[1];
        br1.Code.Should().Be("BR1");
        br1.Name.Should().Be("Branch 1");
        br1.Address.Should().BeNull();
    }

    [Fact]
    public void AddInitialRole_ShouldAddRole()
    {
        // Arrange
        var initialData = CreateInitialData();
        var adminPermissions = new List<string> { "users.manage", "settings.manage", "reports.view" };
        var userPermissions = new List<string> { "reports.view" };

        // Act
        initialData.AddInitialRole("ADMIN", "Administrator", adminPermissions);
        initialData.AddInitialRole("USER", "Standard User", userPermissions);

        // Assert
        initialData.InitialRoles.Should().HaveCount(2);
        
        var adminRole = initialData.InitialRoles[0];
        adminRole.Code.Should().Be("ADMIN");
        adminRole.Name.Should().Be("Administrator");
        adminRole.Permissions.Should().HaveCount(3);
        adminRole.Permissions.Should().Contain("users.manage");
        adminRole.Permissions.Should().Contain("settings.manage");
        adminRole.Permissions.Should().Contain("reports.view");
    }

    [Fact]
    public void AddInitialAccount_ShouldAddAccount()
    {
        // Arrange
        var initialData = CreateInitialData();

        // Act
        initialData.AddInitialAccount("1000", "Assets", "Asset");
        initialData.AddInitialAccount("1100", "Current Assets", "Asset", "1000");
        initialData.AddInitialAccount("1110", "Cash", "Asset", "1100");

        // Assert
        initialData.InitialAccounts.Should().HaveCount(3);
        
        var assets = initialData.InitialAccounts[0];
        assets.Code.Should().Be("1000");
        assets.Name.Should().Be("Assets");
        assets.AccountType.Should().Be("Asset");
        assets.ParentCode.Should().BeNull();
        
        var currentAssets = initialData.InitialAccounts[1];
        currentAssets.Code.Should().Be("1100");
        currentAssets.Name.Should().Be("Current Assets");
        currentAssets.AccountType.Should().Be("Asset");
        currentAssets.ParentCode.Should().Be("1000");
    }

    [Fact]
    public void AddInitialTaxRate_ShouldAddTaxRate()
    {
        // Arrange
        var initialData = CreateInitialData();

        // Act
        initialData.AddInitialTaxRate("VAT18", "VAT 18%", 18m, "VAT");
        initialData.AddInitialTaxRate("VAT8", "VAT 8%", 8m, "VAT");
        initialData.AddInitialTaxRate("WHT20", "Withholding Tax 20%", 20m);

        // Assert
        initialData.InitialTaxRates.Should().HaveCount(3);
        
        var vat18 = initialData.InitialTaxRates[0];
        vat18.Code.Should().Be("VAT18");
        vat18.Name.Should().Be("VAT 18%");
        vat18.Rate.Should().Be(18m);
        vat18.TaxType.Should().Be("VAT");
        
        var wht20 = initialData.InitialTaxRates[2];
        wht20.TaxType.Should().BeNull();
    }

    [Fact]
    public void AddInitialProductCategory_ShouldAddProductCategory()
    {
        // Arrange
        var initialData = CreateInitialData();

        // Act
        initialData.AddInitialProductCategory("ELEC", "Electronics");
        initialData.AddInitialProductCategory("COMP", "Computers", "ELEC");
        initialData.AddInitialProductCategory("LAPTOP", "Laptops", "COMP");

        // Assert
        initialData.InitialProductCategories.Should().HaveCount(3);
        
        var electronics = initialData.InitialProductCategories[0];
        electronics.Code.Should().Be("ELEC");
        electronics.Name.Should().Be("Electronics");
        electronics.ParentCode.Should().BeNull();
        
        var computers = initialData.InitialProductCategories[1];
        computers.ParentCode.Should().Be("ELEC");
    }

    [Fact]
    public void AddInitialWarehouse_ShouldAddWarehouse()
    {
        // Arrange
        var initialData = CreateInitialData();

        // Act
        initialData.AddInitialWarehouse("WH01", "Main Warehouse", "Industrial Zone, Istanbul");
        initialData.AddInitialWarehouse("WH02", "Secondary Warehouse");
        initialData.AddInitialWarehouse("WH03", "Distribution Center", "Logistics Park, Ankara");

        // Assert
        initialData.InitialWarehouses.Should().HaveCount(3);
        
        var mainWarehouse = initialData.InitialWarehouses[0];
        mainWarehouse.Code.Should().Be("WH01");
        mainWarehouse.Name.Should().Be("Main Warehouse");
        mainWarehouse.Address.Should().Be("Industrial Zone, Istanbul");
        
        var secondaryWarehouse = initialData.InitialWarehouses[1];
        secondaryWarehouse.Address.Should().BeNull();
    }

    [Fact]
    public void Validate_WithValidData_ShouldSetIsValidatedTrue()
    {
        // Arrange
        var initialData = CreateInitialData();

        // Act
        initialData.Validate();

        // Assert
        initialData.IsValidated.Should().BeTrue();
        initialData.ValidatedAt.Should().NotBeNull();
        initialData.ValidatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        initialData.ValidationErrors.Should().BeEmpty();
    }

    [Fact]
    public void Validate_WithInvalidContactEmail_ShouldAddValidationError()
    {
        // Arrange
        var initialData = TenantInitialData.Create(
            CompanyName,
            "invalid-email",
            ContactPhone,
            AdminUserEmail,
            AdminUserName,
            CreatedBy);

        // Act
        initialData.Validate();

        // Assert
        initialData.IsValidated.Should().BeTrue();
        initialData.ValidationErrors.Should().HaveCount(1);
        initialData.ValidationErrors.Should().Contain("Contact email is not valid.");
    }

    [Fact]
    public void Validate_WithInvalidAdminEmail_ShouldAddValidationError()
    {
        // Arrange
        var initialData = TenantInitialData.Create(
            CompanyName,
            ContactEmail,
            ContactPhone,
            "not-an-email",
            AdminUserName,
            CreatedBy);

        // Act
        initialData.Validate();

        // Assert
        initialData.IsValidated.Should().BeTrue();
        initialData.ValidationErrors.Should().HaveCount(1);
        initialData.ValidationErrors.Should().Contain("Admin user email is not valid.");
    }

    [Fact]
    public void Validate_WithMissingOptionalData_ShouldAddValidationWarnings()
    {
        // Arrange
        var initialData = CreateInitialData();

        // Act
        initialData.Validate();

        // Assert
        initialData.IsValidated.Should().BeTrue();
        initialData.ValidationWarnings.Should().HaveCount(4);
        initialData.ValidationWarnings.Should().Contain("Tax number is not provided.");
        initialData.ValidationWarnings.Should().Contain("No modules are enabled.");
        initialData.ValidationWarnings.Should().Contain("No initial departments defined.");
        initialData.ValidationWarnings.Should().Contain("No initial roles defined.");
    }

    [Fact]
    public void Validate_WithCompleteData_ShouldHaveNoWarnings()
    {
        // Arrange
        var initialData = CreateInitialData();
        initialData.SetCompanyDetails("TST001", "1234567890", "Istanbul", "TR-12345", "0123456789012345");
        initialData.SetEnabledModules(new List<string> { "Sales" });
        initialData.AddInitialDepartment("IT", "Information Technology");
        initialData.AddInitialRole("ADMIN", "Administrator", new List<string> { "all" });

        // Act
        initialData.Validate();

        // Assert
        initialData.IsValidated.Should().BeTrue();
        initialData.ValidationErrors.Should().BeEmpty();
        initialData.ValidationWarnings.Should().BeEmpty();
    }

    [Fact]
    public void MarkAsProcessing_ShouldUpdateStatusAndIncrementAttempts()
    {
        // Arrange
        var initialData = CreateInitialData();
        var initialAttempts = initialData.ProcessAttempts;

        // Act
        initialData.MarkAsProcessing();

        // Assert
        initialData.Status.Should().Be(DataSetStatus.Processing);
        initialData.ProcessAttempts.Should().Be(initialAttempts + 1);
    }

    [Fact]
    public void MarkAsProcessing_MultipleTimes_ShouldIncrementAttemptsEachTime()
    {
        // Arrange
        var initialData = CreateInitialData();

        // Act
        initialData.MarkAsProcessing();
        initialData.MarkAsProcessing();
        initialData.MarkAsProcessing();

        // Assert
        initialData.ProcessAttempts.Should().Be(3);
    }

    [Fact]
    public void MarkAsProcessed_ShouldUpdateStatusAndSetProcessedInfo()
    {
        // Arrange
        var initialData = CreateInitialData();

        // Act
        initialData.MarkAsProcessed(ProcessedBy);

        // Assert
        initialData.Status.Should().Be(DataSetStatus.Processed);
        initialData.ProcessedAt.Should().NotBeNull();
        initialData.ProcessedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        initialData.ProcessedBy.Should().Be(ProcessedBy);
        initialData.ProcessingError.Should().BeNull();
    }

    [Fact]
    public void MarkAsFailed_ShouldUpdateStatusAndSetError()
    {
        // Arrange
        var initialData = CreateInitialData();
        var errorMessage = "Failed to create admin user: duplicate email";

        // Act
        initialData.MarkAsFailed(errorMessage);

        // Assert
        initialData.Status.Should().Be(DataSetStatus.Failed);
        initialData.ProcessingError.Should().Be(errorMessage);
    }

    [Fact]
    public void MarkAsPartiallyProcessed_ShouldUpdateStatusAndSetProcessedInfo()
    {
        // Arrange
        var initialData = CreateInitialData();
        var warning = "Some departments could not be created";

        // Act
        initialData.MarkAsPartiallyProcessed(ProcessedBy, warning);

        // Assert
        initialData.Status.Should().Be(DataSetStatus.PartiallyProcessed);
        initialData.ProcessedAt.Should().NotBeNull();
        initialData.ProcessedBy.Should().Be(ProcessedBy);
        initialData.ValidationWarnings.Should().Contain(warning);
    }

    [Fact]
    public void MarkAsPartiallyProcessed_WithoutWarning_ShouldNotAddWarning()
    {
        // Arrange
        var initialData = CreateInitialData();

        // Act
        initialData.MarkAsPartiallyProcessed(ProcessedBy);

        // Assert
        initialData.Status.Should().Be(DataSetStatus.PartiallyProcessed);
        initialData.ValidationWarnings.Should().BeEmpty();
    }

    [Fact]
    public void AddProcessingLog_FirstMessage_ShouldCreateLog()
    {
        // Arrange
        var initialData = CreateInitialData();
        var message = "Starting processing";

        // Act
        initialData.AddProcessingLog(message);

        // Assert
        initialData.ProcessingLog.Should().NotBeNull();
        initialData.ProcessingLog.Should().Contain(message);
        initialData.ProcessingLog.Should().MatchRegex(@"\[\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\]");
    }

    [Fact]
    public void AddProcessingLog_MultipleMessages_ShouldAppendToLog()
    {
        // Arrange
        var initialData = CreateInitialData();

        // Act
        initialData.AddProcessingLog("Step 1: Validating data");
        initialData.AddProcessingLog("Step 2: Creating admin user");
        initialData.AddProcessingLog("Step 3: Setting up departments");

        // Assert
        initialData.ProcessingLog.Should().Contain("Step 1: Validating data");
        initialData.ProcessingLog.Should().Contain("Step 2: Creating admin user");
        initialData.ProcessingLog.Should().Contain("Step 3: Setting up departments");
        
        // Should have timestamps for each entry
        var timestampMatches = System.Text.RegularExpressions.Regex.Matches(
            initialData.ProcessingLog, 
            @"\[\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\]");
        timestampMatches.Should().HaveCount(3);
    }

    [Theory]
    [InlineData(DataSetType.InitialSetup)]
    [InlineData(DataSetType.Import)]
    [InlineData(DataSetType.Migration)]
    [InlineData(DataSetType.SampleData)]
    [InlineData(DataSetType.Template)]
    public void DataSetType_Enum_ShouldHaveAllExpectedValues(DataSetType dataSetType)
    {
        // Assert
        Enum.IsDefined(typeof(DataSetType), dataSetType).Should().BeTrue();
    }

    [Theory]
    [InlineData(DataSetStatus.Pending)]
    [InlineData(DataSetStatus.Validated)]
    [InlineData(DataSetStatus.Processing)]
    [InlineData(DataSetStatus.Processed)]
    [InlineData(DataSetStatus.PartiallyProcessed)]
    [InlineData(DataSetStatus.Failed)]
    [InlineData(DataSetStatus.Cancelled)]
    public void DataSetStatus_Enum_ShouldHaveAllExpectedValues(DataSetStatus status)
    {
        // Assert
        Enum.IsDefined(typeof(DataSetStatus), status).Should().BeTrue();
    }

    [Fact]
    public void CompleteInitialDataWorkflow_ShouldWorkCorrectly()
    {
        // Arrange
        var initialData = TenantInitialData.Create(
            "Acme Corporation",
            "info@acme.com",
            "+1-555-123-4567",
            "admin@acme.com",
            "acme_admin",
            CreatedBy);
        
        // Act & Assert - Initial state
        initialData.Status.Should().Be(DataSetStatus.Pending);
        initialData.ProcessAttempts.Should().Be(0);
        
        // Set company details
        initialData.SetCompanyDetails(
            "ACME001",
            "12-3456789",
            "New York Tax Office",
            "NY-789456",
            null);
        
        // Set contact and address
        initialData.SetContactDetails("+1-555-765-4321", "https://www.acme.com");
        initialData.SetAddress(
            "123 Business Ave",
            "Suite 500",
            "New York",
            "NY",
            "USA",
            "10001");
        
        // Set business info
        initialData.SetBusinessInfo(
            "Technology",
            "B2B Software",
            150,
            25000000m,
            "USD",
            1); // January fiscal year
        
        // Set admin user details
        initialData.SetAdminUserDetails("John", "Smith", "+1-555-999-8888");
        
        // Set default settings
        initialData.SetDefaultSettings(
            "en-US",
            "America/New_York",
            "MM/dd/yyyy",
            "#,###.##",
            false);
        
        // Enable modules and features
        initialData.SetEnabledModules(new List<string> 
        { 
            "Sales", 
            "Inventory", 
            "Accounting", 
            "CRM", 
            "HR" 
        });
        
        initialData.SetRequestedFeatures(new List<string> 
        { 
            "MultiCurrency", 
            "AdvancedReporting", 
            "APIAccess", 
            "MobileApp" 
        });
        
        // Add initial data
        initialData.AddInitialDepartment("SALES", "Sales Department", "Sales and Marketing");
        initialData.AddInitialDepartment("IT", "Information Technology", "IT and Support");
        initialData.AddInitialDepartment("HR", "Human Resources", "HR and Administration");
        
        initialData.AddInitialBranch("NY-HQ", "New York Headquarters", "123 Business Ave, NY");
        initialData.AddInitialBranch("LA-BR", "Los Angeles Branch", "456 West Coast Blvd, LA");
        
        initialData.AddInitialRole("ADMIN", "Administrator", new List<string> 
        { 
            "all.manage", 
            "settings.configure", 
            "users.manage" 
        });
        initialData.AddInitialRole("MANAGER", "Manager", new List<string> 
        { 
            "reports.view", 
            "employees.manage", 
            "budget.approve" 
        });
        
        initialData.AddInitialAccount("1000", "Assets", "Asset");
        initialData.AddInitialAccount("2000", "Liabilities", "Liability");
        initialData.AddInitialAccount("3000", "Equity", "Equity");
        
        initialData.AddInitialTaxRate("FED", "Federal Tax", 21m, "Income");
        initialData.AddInitialTaxRate("NY-STATE", "NY State Tax", 6.5m, "State");
        
        initialData.AddInitialProductCategory("SOFT", "Software");
        initialData.AddInitialProductCategory("SERV", "Services");
        
        initialData.AddInitialWarehouse("NY-WH", "New York Warehouse", "789 Storage Dr, NY");
        
        // Enable sample data
        initialData.EnableSampleData();
        
        // Validate
        initialData.Validate();
        initialData.IsValidated.Should().BeTrue();
        initialData.ValidationErrors.Should().BeEmpty();
        initialData.ValidationWarnings.Should().BeEmpty();
        
        // Start processing
        initialData.AddProcessingLog("Starting initial data processing");
        initialData.MarkAsProcessing();
        initialData.Status.Should().Be(DataSetStatus.Processing);
        initialData.ProcessAttempts.Should().Be(1);
        
        // Process steps
        initialData.AddProcessingLog("Creating admin user");
        initialData.MarkAdminUserCreated();
        initialData.AdminUserCreated.Should().BeTrue();
        
        initialData.AddProcessingLog("Setting up departments");
        initialData.AddProcessingLog("Setting up branches");
        initialData.AddProcessingLog("Configuring roles");
        initialData.AddProcessingLog("Initializing chart of accounts");
        initialData.AddProcessingLog("Setting up tax rates");
        initialData.AddProcessingLog("Creating product categories");
        initialData.AddProcessingLog("Setting up warehouses");
        initialData.AddProcessingLog("Generating sample data");
        
        // Complete processing
        initialData.MarkAsProcessed(ProcessedBy);
        initialData.Status.Should().Be(DataSetStatus.Processed);
        initialData.ProcessedBy.Should().Be(ProcessedBy);
        initialData.ProcessedAt.Should().NotBeNull();
        
        // Verify final state
        initialData.EnabledModules.Should().HaveCount(5);
        initialData.RequestedFeatures.Should().HaveCount(4);
        initialData.InitialDepartments.Should().HaveCount(3);
        initialData.InitialBranches.Should().HaveCount(2);
        initialData.InitialRoles.Should().HaveCount(2);
        initialData.InitialAccounts.Should().HaveCount(3);
        initialData.InitialTaxRates.Should().HaveCount(2);
        initialData.InitialProductCategories.Should().HaveCount(2);
        initialData.InitialWarehouses.Should().HaveCount(1);
        initialData.CreateSampleData.Should().BeTrue();
    }

    [Fact]
    public void FailedProcessingWorkflow_ShouldWorkCorrectly()
    {
        // Arrange
        var initialData = CreateInitialData();
        
        // Act - First attempt
        initialData.MarkAsProcessing();
        initialData.AddProcessingLog("Attempting to create admin user");
        initialData.MarkAsFailed("Database connection failed");
        
        // Assert - First attempt
        initialData.Status.Should().Be(DataSetStatus.Failed);
        initialData.ProcessAttempts.Should().Be(1);
        initialData.ProcessingError.Should().Be("Database connection failed");
        
        // Act - Second attempt
        initialData.MarkAsProcessing();
        initialData.AddProcessingLog("Retrying admin user creation");
        initialData.MarkAsFailed("Admin email already exists");
        
        // Assert - Second attempt
        initialData.Status.Should().Be(DataSetStatus.Failed);
        initialData.ProcessAttempts.Should().Be(2);
        initialData.ProcessingError.Should().Be("Admin email already exists");
        
        // Act - Third attempt with partial success
        initialData.MarkAsProcessing();
        initialData.AddProcessingLog("Creating admin user with alternative email");
        initialData.MarkAdminUserCreated();
        initialData.AddProcessingLog("Setting up departments");
        initialData.MarkAsPartiallyProcessed(ProcessedBy, "Some features could not be enabled");
        
        // Assert - Partial success
        initialData.Status.Should().Be(DataSetStatus.PartiallyProcessed);
        initialData.ProcessAttempts.Should().Be(3);
        initialData.AdminUserCreated.Should().BeTrue();
        initialData.ValidationWarnings.Should().Contain("Some features could not be enabled");
    }

    private TenantInitialData CreateInitialData()
    {
        return TenantInitialData.Create(
            CompanyName,
            ContactEmail,
            ContactPhone,
            AdminUserEmail,
            AdminUserName,
            CreatedBy);
    }
}