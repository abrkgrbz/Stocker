using FluentAssertions;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Domain.Tenant.Entities;
using Xunit;

namespace Stocker.UnitTests.Domain.Tenant;

public class CompanyTests
{
    private readonly Guid _tenantId = Guid.NewGuid();
    private readonly string _name = "Test Company";
    private readonly string _code = "COMP001";
    private readonly string _taxNumber = "1234567890";
    private readonly Email _email;
    private readonly PhoneNumber _phone;
    private readonly CompanyAddress _address;

    public CompanyTests()
    {
        _email = Email.Create("company@test.com").Value!;
        _phone = PhoneNumber.Create("+905551234567").Value!;
        _address = CompanyAddress.Create(
            "Turkey",
            "Istanbul",
            "Kadikoy",
            "34700",
            "123 Main Street").Value!;
    }

    [Fact]
    public void Create_WithValidData_ShouldCreateCompany()
    {
        // Act
        var company = Company.Create(
            _tenantId,
            _name,
            _code,
            _taxNumber,
            _email,
            _address,
            _phone);

        // Assert
        company.Should().NotBeNull();
        company.TenantId.Should().Be(_tenantId);
        company.Name.Should().Be(_name);
        company.Code.Should().Be(_code);
        company.TaxNumber.Should().Be(_taxNumber);
        company.Email.Should().Be(_email);
        company.Phone.Should().Be(_phone);
        company.Address.Should().Be(_address);
        company.Currency.Should().Be("TRY");
        company.IsActive.Should().BeTrue();
        company.Departments.Should().BeEmpty();
        company.Branches.Should().BeEmpty();
    }

    [Fact]
    public void Create_WithEmptyName_ShouldThrowArgumentException()
    {
        // Act
        var action = () => Company.Create(
            _tenantId,
            "",
            _code,
            _taxNumber,
            _email,
            _address);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Company name cannot be empty.*");
    }

    [Fact]
    public void Create_WithEmptyCode_ShouldThrowArgumentException()
    {
        // Act
        var action = () => Company.Create(
            _tenantId,
            _name,
            "",
            _taxNumber,
            _email,
            _address);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Company code cannot be empty.*");
    }

    [Fact]
    public void Create_WithEmptyTaxNumber_ShouldThrowArgumentException()
    {
        // Act
        var action = () => Company.Create(
            _tenantId,
            _name,
            _code,
            "",
            _email,
            _address);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Tax number cannot be empty.*");
    }

    [Fact]
    public void Create_WithOptionalParameters_ShouldSetCorrectly()
    {
        // Arrange
        var fax = PhoneNumber.Create("+905559876543").Value!;
        var identityType = "TC";
        var identityNumber = "12345678901";
        var sector = "Technology";
        var employeeCount = 100;
        var taxOffice = "Test Tax Office";
        var tradeRegisterNumber = "TRN123";
        var website = "https://test.com";
        var foundedDate = DateTime.UtcNow.AddYears(-10);

        // Act
        var company = Company.Create(
            _tenantId,
            _name,
            _code,
            _taxNumber,
            _email,
            _address,
            _phone,
            fax,
            identityType,
            identityNumber,
            sector,
            employeeCount,
            taxOffice,
            tradeRegisterNumber,
            website,
            foundedDate);

        // Assert
        company.Fax.Should().Be(fax);
        company.IdentityType.Should().Be(identityType);
        company.IdentityNumber.Should().Be(identityNumber);
        company.Sector.Should().Be(sector);
        company.EmployeeCount.Should().Be(employeeCount);
        company.TaxOffice.Should().Be(taxOffice);
        company.TradeRegisterNumber.Should().Be(tradeRegisterNumber);
        company.Website.Should().Be(website);
        company.FoundedDate.Should().BeCloseTo(foundedDate, TimeSpan.FromSeconds(1));
    }

    [Fact]
    public void Update_WithValidData_ShouldUpdateCompany()
    {
        // Arrange
        var company = CreateCompany();
        var newName = "Updated Company";
        var newEmail = Email.Create("updated@test.com").Value!;
        var newPhone = PhoneNumber.Create("+905559999999").Value!;
        var newAddress = CompanyAddress.Create(
            "Turkey",
            "Ankara",
            "Çankaya",
            "06500",
            "456 New Street").Value!;

        // Act
        company.Update(
            newName,
            newEmail,
            newPhone,
            newAddress);

        // Assert
        company.Name.Should().Be(newName);
        company.Email.Should().Be(newEmail);
        company.Phone.Should().Be(newPhone);
        company.Address.Should().Be(newAddress);
        company.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public void UpdateLogo_ShouldUpdateLogoUrl()
    {
        // Arrange
        var company = CreateCompany();
        var logoUrl = "https://test.com/logo.png";

        // Act
        company.UpdateLogo(logoUrl);

        // Assert
        company.LogoUrl.Should().Be(logoUrl);
        company.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public void Activate_DeactivatedCompany_ShouldActivate()
    {
        // Arrange
        var company = CreateCompany();
        company.Deactivate();

        // Act
        company.Activate();

        // Assert
        company.IsActive.Should().BeTrue();
        company.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public void Deactivate_ActiveCompany_ShouldDeactivate()
    {
        // Arrange
        var company = CreateCompany();

        // Act
        company.Deactivate();

        // Assert
        company.IsActive.Should().BeFalse();
        company.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public void AddDepartment_WithValidData_ShouldAddDepartment()
    {
        // Arrange
        var company = CreateCompany();
        var departmentName = "IT Department";
        var departmentCode = "IT";
        var description = "Information Technology";

        // Act
        var department = company.AddDepartment(departmentName, departmentCode, description);

        // Assert
        department.Should().NotBeNull();
        department.Name.Should().Be(departmentName);
        department.Code.Should().Be(departmentCode);
        department.Description.Should().Be(description);
        company.Departments.Should().HaveCount(1);
        company.Departments.Should().Contain(department);
    }

    [Fact]
    public void AddDepartment_WithDuplicateName_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var company = CreateCompany();
        var departmentName = "IT Department";
        company.AddDepartment(departmentName);

        // Act
        var action = () => company.AddDepartment(departmentName);

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage($"Department '{departmentName}' already exists.");
    }

    [Fact]
    public void AddDepartment_WithDuplicateCode_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var company = CreateCompany();
        var code = "IT";
        company.AddDepartment("IT Department", code);

        // Act
        var action = () => company.AddDepartment("Another Department", code);

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage($"Department code '{code}' already exists.");
    }

    [Fact]
    public void AddDepartment_WithParentDepartment_ShouldCreateHierarchy()
    {
        // Arrange
        var company = CreateCompany();
        var parentDepartment = company.AddDepartment("Parent Department");

        // Act
        var childDepartment = company.AddDepartment("Child Department", parentDepartmentId: parentDepartment.Id);

        // Assert
        childDepartment.ParentDepartmentId.Should().Be(parentDepartment.Id);
        company.Departments.Should().HaveCount(2);
    }

    [Fact]
    public void RemoveDepartment_ExistingDepartment_ShouldRemove()
    {
        // Arrange
        var company = CreateCompany();
        var department = company.AddDepartment("IT Department");

        // Act
        company.RemoveDepartment(department.Id);

        // Assert
        company.Departments.Should().BeEmpty();
    }

    [Fact]
    public void RemoveDepartment_NonExistentDepartment_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var company = CreateCompany();
        var nonExistentId = Guid.NewGuid();

        // Act
        var action = () => company.RemoveDepartment(nonExistentId);

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage($"Department with ID '{nonExistentId}' not found.");
    }

    [Fact]
    public void RemoveDepartment_WithChildDepartments_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var company = CreateCompany();
        var parentDepartment = company.AddDepartment("Parent Department");
        company.AddDepartment("Child Department", parentDepartmentId: parentDepartment.Id);

        // Act
        var action = () => company.RemoveDepartment(parentDepartment.Id);

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Cannot remove department with child departments.");
    }

    [Fact]
    public void AddBranch_WithValidData_ShouldAddBranch()
    {
        // Arrange
        var company = CreateCompany();
        var branchName = "Main Branch";
        var branchAddress = Address.Create("Branch St", "Branch City", "Turkey", "11111", state: "State");
        var branchPhone = PhoneNumber.Create("+905557777777").Value!;

        // Act
        var branch = company.AddBranch(branchName, branchAddress, branchPhone);

        // Assert
        branch.Should().NotBeNull();
        branch.Name.Should().Be(branchName);
        branch.Address.Should().Be(branchAddress);
        branch.Phone.Should().Be(branchPhone);
        company.Branches.Should().HaveCount(1);
        company.Branches.Should().Contain(branch);
    }

    [Fact]
    public void AddBranch_AsHeadOffice_ShouldSetHeadOfficeFlag()
    {
        // Arrange
        var company = CreateCompany();
        var branchAddress = Address.Create("HQ St", "HQ City", "Turkey", "11111", state: "State");
        var branchPhone = PhoneNumber.Create("+905557777777").Value!;

        // Act
        var branch = company.AddBranch("Head Office", branchAddress, branchPhone, isHeadOffice: true);

        // Assert
        branch.IsHeadOffice.Should().BeTrue();
    }

    [Fact]
    public void AddBranch_SecondHeadOffice_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var company = CreateCompany();
        var branchAddress = Address.Create("HQ St", "HQ City", "Turkey", "11111", state: "State");
        var branchPhone = PhoneNumber.Create("+905557777777").Value!;
        company.AddBranch("First HQ", branchAddress, branchPhone, isHeadOffice: true);

        // Act
        var action = () => company.AddBranch("Second HQ", branchAddress, branchPhone, isHeadOffice: true);

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Company already has a head office.");
    }

    [Fact]
    public void AddBranch_WithDuplicateName_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var company = CreateCompany();
        var branchName = "Main Branch";
        var branchAddress = Address.Create("Branch St", "Branch City", "Turkey", "11111", state: "State");
        var branchPhone = PhoneNumber.Create("+905557777777").Value!;
        company.AddBranch(branchName, branchAddress, branchPhone);

        // Act
        var action = () => company.AddBranch(branchName, branchAddress, branchPhone);

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage($"Branch '{branchName}' already exists.");
    }

    [Fact]
    public void RemoveBranch_ExistingBranch_ShouldRemove()
    {
        // Arrange
        var company = CreateCompany();
        var branchAddress = Address.Create("Branch St", "Branch City", "Turkey", "11111", state: "State");
        var branchPhone = PhoneNumber.Create("+905557777777").Value!;
        var branch = company.AddBranch("Branch", branchAddress, branchPhone);

        // Act
        company.RemoveBranch(branch.Id);

        // Assert
        company.Branches.Should().BeEmpty();
    }

    [Fact]
    public void RemoveBranch_HeadOffice_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var company = CreateCompany();
        var branchAddress = Address.Create("HQ St", "HQ City", "Turkey", "11111", state: "State");
        var branchPhone = PhoneNumber.Create("+905557777777").Value!;
        var headOffice = company.AddBranch("Head Office", branchAddress, branchPhone, isHeadOffice: true);

        // Act
        var action = () => company.RemoveBranch(headOffice.Id);

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Cannot remove head office branch.");
    }

    private Company CreateCompany()
    {
        return Company.Create(
            _tenantId,
            _name,
            _code,
            _taxNumber,
            _email,
            _address,
            _phone);
    }
}