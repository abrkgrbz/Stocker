using System;
using System.Linq;
using FluentAssertions;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Domain.Tenant.Entities;
using Xunit;

namespace Stocker.UnitTests.Domain.Tenant;

public class CompanyTests
{
    private readonly Guid _tenantId = Guid.NewGuid();
    private readonly Email _validEmail;
    private readonly PhoneNumber _validPhone;
    private readonly CompanyAddress _validAddress;

    public CompanyTests()
    {
        _validEmail = Email.Create("test@company.com").Value!;
        _validPhone = PhoneNumber.Create("+90 532 123 4567").Value!;
        _validAddress = CompanyAddress.Create(
            "Turkey",
            "Istanbul",
            "Kadikoy",
            "34700",
            "123 Main St"
        ).Value!;
    }

    [Fact]
    public void Create_WithValidData_ShouldCreateCompany()
    {
        // Act
        var company = Company.Create(
            _tenantId,
            "Test Company",
            "TST001",
            "1234567890",
            _validEmail,
            _validAddress,
            _validPhone
        );

        // Assert
        company.Should().NotBeNull();
        company.TenantId.Should().Be(_tenantId);
        company.Name.Should().Be("Test Company");
        company.Code.Should().Be("TST001");
        company.TaxNumber.Should().Be("1234567890");
        company.Email.Should().Be(_validEmail);
        company.Address.Should().Be(_validAddress);
        company.Phone.Should().Be(_validPhone);
        company.Currency.Should().Be("TRY");
        company.IsActive.Should().BeTrue();
        company.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
    }

    [Fact]
    public void Create_WithNullName_ShouldThrowArgumentException()
    {
        // Act & Assert
        var act = () => Company.Create(
            _tenantId,
            null!,
            "TST001",
            "1234567890",
            _validEmail,
            _validAddress
        );

        act.Should().Throw<ArgumentException>()
            .WithMessage("*Company name cannot be empty*");
    }

    [Fact]
    public void Create_WithEmptyName_ShouldThrowArgumentException()
    {
        // Act & Assert
        var act = () => Company.Create(
            _tenantId,
            "",
            "TST001",
            "1234567890",
            _validEmail,
            _validAddress
        );

        act.Should().Throw<ArgumentException>()
            .WithMessage("*Company name cannot be empty*");
    }

    [Fact]
    public void Create_WithWhitespaceName_ShouldThrowArgumentException()
    {
        // Act & Assert
        var act = () => Company.Create(
            _tenantId,
            "   ",
            "TST001",
            "1234567890",
            _validEmail,
            _validAddress
        );

        act.Should().Throw<ArgumentException>()
            .WithMessage("*Company name cannot be empty*");
    }

    [Fact]
    public void Create_WithNullCode_ShouldThrowArgumentException()
    {
        // Act & Assert
        var act = () => Company.Create(
            _tenantId,
            "Test Company",
            null!,
            "1234567890",
            _validEmail,
            _validAddress
        );

        act.Should().Throw<ArgumentException>()
            .WithMessage("*Company code cannot be empty*");
    }

    [Fact]
    public void Create_WithEmptyCode_ShouldThrowArgumentException()
    {
        // Act & Assert
        var act = () => Company.Create(
            _tenantId,
            "Test Company",
            "",
            "1234567890",
            _validEmail,
            _validAddress
        );

        act.Should().Throw<ArgumentException>()
            .WithMessage("*Company code cannot be empty*");
    }

    [Fact]
    public void Create_WithNullTaxNumber_ShouldThrowArgumentException()
    {
        // Act & Assert
        var act = () => Company.Create(
            _tenantId,
            "Test Company",
            "TST001",
            null!,
            _validEmail,
            _validAddress
        );

        act.Should().Throw<ArgumentException>()
            .WithMessage("*Tax number cannot be empty*");
    }

    [Fact]
    public void Create_WithEmptyTaxNumber_ShouldThrowArgumentException()
    {
        // Act & Assert
        var act = () => Company.Create(
            _tenantId,
            "Test Company",
            "TST001",
            "",
            _validEmail,
            _validAddress
        );

        act.Should().Throw<ArgumentException>()
            .WithMessage("*Tax number cannot be empty*");
    }

    [Fact]
    public void Create_WithOptionalParameters_ShouldSetValues()
    {
        // Arrange
        var fax = PhoneNumber.Create("+90 212 123 4567").Value!;
        var foundedDate = DateTime.UtcNow.AddYears(-10);

        // Act
        var company = Company.Create(
            _tenantId,
            "Test Company",
            "TST001",
            "1234567890",
            _validEmail,
            _validAddress,
            _validPhone,
            fax,
            "TC",
            "12345678901",
            "Technology",
            100,
            "Istanbul Tax Office",
            "TR123456",
            "https://www.test.com",
            foundedDate
        );

        // Assert
        company.Fax.Should().Be(fax);
        company.IdentityType.Should().Be("TC");
        company.IdentityNumber.Should().Be("12345678901");
        company.Sector.Should().Be("Technology");
        company.EmployeeCount.Should().Be(100);
        company.TaxOffice.Should().Be("Istanbul Tax Office");
        company.TradeRegisterNumber.Should().Be("TR123456");
        company.Website.Should().Be("https://www.test.com");
        company.FoundedDate.Should().BeCloseTo(foundedDate, TimeSpan.FromSeconds(1));
    }

    [Fact]
    public void Create_WithoutPhone_ShouldUseDefaultPhone()
    {
        // Act
        var company = Company.Create(
            _tenantId,
            "Test Company",
            "TST001",
            "1234567890",
            _validEmail,
            _validAddress
        );

        // Assert
        company.Phone.Should().NotBeNull();
        company.Phone.Value.Should().Be("+900000000000");
    }

    [Fact]
    public void Update_WithValidData_ShouldUpdateCompany()
    {
        // Arrange
        var company = Company.Create(
            _tenantId,
            "Test Company",
            "TST001",
            "1234567890",
            _validEmail,
            _validAddress
        );

        var newEmail = Email.Create("new@company.com").Value!;
        var newPhone = PhoneNumber.Create("+90 555 123 4567").Value!;
        var newAddress = CompanyAddress.Create(
            "Turkey",
            "Ankara",
            "Cankaya",
            "06100",
            "456 New St"
        ).Value!;

        // Act
        company.Update(
            "Updated Company",
            newEmail,
            newPhone,
            newAddress,
            "Legal Name Ltd",
            "9876543210",
            "TR987654"
        );

        // Assert
        company.Name.Should().Be("Updated Company");
        company.Email.Should().Be(newEmail);
        company.Phone.Should().Be(newPhone);
        company.Address.Should().Be(newAddress);
        company.LegalName.Should().Be("Legal Name Ltd");
        company.TaxNumber.Should().Be("9876543210");
        company.TradeRegisterNumber.Should().Be("TR987654");
        company.UpdatedAt.Should().NotBeNull();
        company.UpdatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
    }

    [Fact]
    public void Update_WithEmptyName_ShouldThrowArgumentException()
    {
        // Arrange
        var company = Company.Create(
            _tenantId,
            "Test Company",
            "TST001",
            "1234567890",
            _validEmail,
            _validAddress
        );

        // Act & Assert
        var act = () => company.Update(
            "",
            _validEmail,
            _validPhone,
            _validAddress
        );

        act.Should().Throw<ArgumentException>()
            .WithMessage("*Company name cannot be empty*");
    }

    [Fact]
    public void UpdateLogo_ShouldUpdateLogoUrl()
    {
        // Arrange
        var company = Company.Create(
            _tenantId,
            "Test Company",
            "TST001",
            "1234567890",
            _validEmail,
            _validAddress
        );

        // Act
        company.UpdateLogo("https://cdn.example.com/logo.png");

        // Assert
        company.LogoUrl.Should().Be("https://cdn.example.com/logo.png");
        company.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public void UpdateLogo_WithNull_ShouldClearLogoUrl()
    {
        // Arrange
        var company = Company.Create(
            _tenantId,
            "Test Company",
            "TST001",
            "1234567890",
            _validEmail,
            _validAddress
        );
        company.UpdateLogo("https://cdn.example.com/old-logo.png");

        // Act
        company.UpdateLogo(null);

        // Assert
        company.LogoUrl.Should().BeNull();
        company.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public void Activate_ShouldSetIsActiveToTrue()
    {
        // Arrange
        var company = Company.Create(
            _tenantId,
            "Test Company",
            "TST001",
            "1234567890",
            _validEmail,
            _validAddress
        );
        company.Deactivate();

        // Act
        company.Activate();

        // Assert
        company.IsActive.Should().BeTrue();
        company.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public void Deactivate_ShouldSetIsActiveToFalse()
    {
        // Arrange
        var company = Company.Create(
            _tenantId,
            "Test Company",
            "TST001",
            "1234567890",
            _validEmail,
            _validAddress
        );

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
        var company = Company.Create(
            _tenantId,
            "Test Company",
            "TST001",
            "1234567890",
            _validEmail,
            _validAddress
        );

        // Act
        var department = company.AddDepartment("IT Department", "IT001", "Technology department");

        // Assert
        department.Should().NotBeNull();
        department.Name.Should().Be("IT Department");
        department.Code.Should().Be("IT001");
        department.Description.Should().Be("Technology department");
        company.Departments.Should().HaveCount(1);
        company.Departments.Should().Contain(department);
        company.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public void AddDepartment_WithDuplicateName_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var company = Company.Create(
            _tenantId,
            "Test Company",
            "TST001",
            "1234567890",
            _validEmail,
            _validAddress
        );
        company.AddDepartment("IT Department");

        // Act & Assert
        var act = () => company.AddDepartment("IT Department");

        act.Should().Throw<InvalidOperationException>()
            .WithMessage("*Department 'IT Department' already exists*");
    }

    [Fact]
    public void AddDepartment_WithDuplicateCode_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var company = Company.Create(
            _tenantId,
            "Test Company",
            "TST001",
            "1234567890",
            _validEmail,
            _validAddress
        );
        company.AddDepartment("IT Department", "IT001");

        // Act & Assert
        var act = () => company.AddDepartment("HR Department", "IT001");

        act.Should().Throw<InvalidOperationException>()
            .WithMessage("*Department code 'IT001' already exists*");
    }

    [Fact]
    public void RemoveDepartment_ExistingDepartment_ShouldRemoveDepartment()
    {
        // Arrange
        var company = Company.Create(
            _tenantId,
            "Test Company",
            "TST001",
            "1234567890",
            _validEmail,
            _validAddress
        );
        var department = company.AddDepartment("IT Department");

        // Act
        company.RemoveDepartment(department.Id);

        // Assert
        company.Departments.Should().BeEmpty();
        company.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public void RemoveDepartment_NonExistingDepartment_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var company = Company.Create(
            _tenantId,
            "Test Company",
            "TST001",
            "1234567890",
            _validEmail,
            _validAddress
        );

        // Act & Assert
        var act = () => company.RemoveDepartment(Guid.NewGuid());

        act.Should().Throw<InvalidOperationException>()
            .WithMessage("*Department with ID*not found*");
    }

    [Fact]
    public void RemoveDepartment_WithChildDepartments_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var company = Company.Create(
            _tenantId,
            "Test Company",
            "TST001",
            "1234567890",
            _validEmail,
            _validAddress
        );
        var parentDept = company.AddDepartment("IT Department");
        company.AddDepartment("Software Team", parentDepartmentId: parentDept.Id);

        // Act & Assert
        var act = () => company.RemoveDepartment(parentDept.Id);

        act.Should().Throw<InvalidOperationException>()
            .WithMessage("*Cannot remove department with child departments*");
    }

    [Fact]
    public void AddBranch_WithValidData_ShouldAddBranch()
    {
        // Arrange
        var company = Company.Create(
            _tenantId,
            "Test Company",
            "TST001",
            "1234567890",
            _validEmail,
            _validAddress
        );

        var branchAddress = Address.Create(
            "Branch Street",
            "Ankara",
            "Turkey",
            "06100"
        );

        var branchPhone = PhoneNumber.Create("+90 312 123 4567").Value!;

        // Act
        var branch = company.AddBranch(
            "Ankara Branch",
            branchAddress,
            branchPhone,
            "BR001"
        );

        // Assert
        branch.Should().NotBeNull();
        branch.Name.Should().Be("Ankara Branch");
        branch.Code.Should().Be("BR001");
        company.Branches.Should().HaveCount(1);
        company.Branches.Should().Contain(branch);
        company.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public void AddBranch_WithDuplicateName_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var company = Company.Create(
            _tenantId,
            "Test Company",
            "TST001",
            "1234567890",
            _validEmail,
            _validAddress
        );

        var branchAddress = Address.Create(
            "Branch Street",
            "Ankara",
            "Turkey",
            "06100"
        );

        var branchPhone = PhoneNumber.Create("+90 312 123 4567").Value!;

        company.AddBranch("Ankara Branch", branchAddress, branchPhone);

        // Act & Assert
        var act = () => company.AddBranch("Ankara Branch", branchAddress, branchPhone);

        act.Should().Throw<InvalidOperationException>()
            .WithMessage("*Branch 'Ankara Branch' already exists*");
    }

    [Fact]
    public void AddBranch_AsHeadOffice_WhenNoHeadOfficeExists_ShouldSucceed()
    {
        // Arrange
        var company = Company.Create(
            _tenantId,
            "Test Company",
            "TST001",
            "1234567890",
            _validEmail,
            _validAddress
        );

        var branchAddress = Address.Create(
            "HQ Street",
            "Istanbul",
            "Turkey",
            "34100"
        );

        var branchPhone = PhoneNumber.Create("+90 212 123 4567").Value!;

        // Act
        var branch = company.AddBranch(
            "Head Office",
            branchAddress,
            branchPhone,
            isHeadOffice: true
        );

        // Assert
        branch.IsHeadOffice.Should().BeTrue();
    }

    [Fact]
    public void AddBranch_AsHeadOffice_WhenHeadOfficeExists_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var company = Company.Create(
            _tenantId,
            "Test Company",
            "TST001",
            "1234567890",
            _validEmail,
            _validAddress
        );

        var branchAddress = Address.Create(
            "HQ Street",
            "Istanbul",
            "Turkey",
            "34100"
        );

        var branchPhone = PhoneNumber.Create("+90 212 123 4567").Value!;

        company.AddBranch("Head Office", branchAddress, branchPhone, isHeadOffice: true);

        // Act & Assert
        var act = () => company.AddBranch("Another HQ", branchAddress, branchPhone, isHeadOffice: true);

        act.Should().Throw<InvalidOperationException>()
            .WithMessage("*Company already has a head office*");
    }

    [Fact]
    public void RemoveBranch_ExistingBranch_ShouldRemoveBranch()
    {
        // Arrange
        var company = Company.Create(
            _tenantId,
            "Test Company",
            "TST001",
            "1234567890",
            _validEmail,
            _validAddress
        );

        var branchAddress = Address.Create(
            "Branch Street",
            "Ankara",
            "Turkey",
            "06100"
        );

        var branchPhone = PhoneNumber.Create("+90 312 123 4567").Value!;

        var branch = company.AddBranch("Ankara Branch", branchAddress, branchPhone);

        // Act
        company.RemoveBranch(branch.Id);

        // Assert
        company.Branches.Should().BeEmpty();
        company.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public void RemoveBranch_HeadOffice_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var company = Company.Create(
            _tenantId,
            "Test Company",
            "TST001",
            "1234567890",
            _validEmail,
            _validAddress
        );

        var branchAddress = Address.Create(
            "HQ Street",
            "Istanbul",
            "Turkey",
            "34100"
        );

        var branchPhone = PhoneNumber.Create("+90 212 123 4567").Value!;

        var headOffice = company.AddBranch("Head Office", branchAddress, branchPhone, isHeadOffice: true);

        // Act & Assert
        var act = () => company.RemoveBranch(headOffice.Id);

        act.Should().Throw<InvalidOperationException>()
            .WithMessage("*Cannot remove head office branch*");
    }

    [Fact]
    public void RemoveBranch_NonExistingBranch_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var company = Company.Create(
            _tenantId,
            "Test Company",
            "TST001",
            "1234567890",
            _validEmail,
            _validAddress
        );

        // Act & Assert
        var act = () => company.RemoveBranch(Guid.NewGuid());

        act.Should().Throw<InvalidOperationException>()
            .WithMessage("*Branch with ID*not found*");
    }
}