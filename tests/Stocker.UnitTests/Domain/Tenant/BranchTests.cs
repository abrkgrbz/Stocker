using FluentAssertions;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Domain.Tenant.Entities;
using Xunit;

namespace Stocker.UnitTests.Domain.Tenant;

public class BranchTests
{
    private readonly Guid _tenantId = Guid.NewGuid();
    private readonly Guid _companyId = Guid.NewGuid();
    private readonly string _name = "Main Branch";
    private readonly string _code = "BR001";
    private readonly Address _address;
    private readonly PhoneNumber _phone;
    private readonly Email _email;

    public BranchTests()
    {
        _address = Address.Create(
            "123 Main St",
            "Test City",
            "Turkey",
            "12345",
            state: "Test State");
        _phone = PhoneNumber.Create("+905551234567").Value!;
        _email = Email.Create("branch@test.com").Value!;
    }

    [Fact]
    public void Constructor_WithValidData_ShouldCreateBranch()
    {
        // Act
        var branch = new Branch(
            _tenantId,
            _companyId,
            _name,
            _address,
            _phone,
            _code,
            _email,
            false);

        // Assert
        branch.Should().NotBeNull();
        branch.TenantId.Should().Be(_tenantId);
        branch.CompanyId.Should().Be(_companyId);
        branch.Name.Should().Be(_name);
        branch.Code.Should().Be(_code);
        branch.Address.Should().Be(_address);
        branch.Phone.Should().Be(_phone);
        branch.Email.Should().Be(_email);
        branch.IsHeadOffice.Should().BeFalse();
        branch.IsActive.Should().BeTrue();
        branch.ManagerId.Should().BeNull();
    }

    [Fact]
    public void Constructor_AsHeadOffice_ShouldSetHeadOfficeFlag()
    {
        // Act
        var branch = new Branch(
            _tenantId,
            _companyId,
            _name,
            _address,
            _phone,
            isHeadOffice: true);

        // Assert
        branch.IsHeadOffice.Should().BeTrue();
    }

    [Fact]
    public void Constructor_WithoutOptionalFields_ShouldCreateBranch()
    {
        // Act
        var branch = new Branch(
            _tenantId,
            _companyId,
            _name,
            _address,
            _phone);

        // Assert
        branch.Code.Should().BeNull();
        branch.Email.Should().BeNull();
        branch.IsHeadOffice.Should().BeFalse();
    }

    [Fact]
    public void Constructor_WithNullName_ShouldThrowArgumentNullException()
    {
        // Act
        var action = () => new Branch(
            _tenantId,
            _companyId,
            null!,
            _address,
            _phone);

        // Assert
        action.Should().Throw<ArgumentNullException>()
            .WithParameterName("name");
    }

    [Fact]
    public void Constructor_WithNullAddress_ShouldThrowArgumentNullException()
    {
        // Act
        var action = () => new Branch(
            _tenantId,
            _companyId,
            _name,
            null!,
            _phone);

        // Assert
        action.Should().Throw<ArgumentNullException>()
            .WithParameterName("address");
    }

    [Fact]
    public void Constructor_WithNullPhone_ShouldThrowArgumentNullException()
    {
        // Act
        var action = () => new Branch(
            _tenantId,
            _companyId,
            _name,
            _address,
            null!);

        // Assert
        action.Should().Throw<ArgumentNullException>()
            .WithParameterName("phone");
    }

    [Fact]
    public void Update_WithValidData_ShouldUpdateBranch()
    {
        // Arrange
        var branch = CreateBranch();
        var newName = "Updated Branch";
        var newCode = "BR002";
        var newAddress = Address.Create(
            "456 New St",
            "New City",
            "Turkey",
            "54321",
            state: "New State");
        var newPhone = PhoneNumber.Create("+905559999999").Value!;
        var newEmail = Email.Create("newbranch@test.com").Value!;

        // Act
        branch.Update(newName, newAddress, newPhone, newCode, newEmail);

        // Assert
        branch.Name.Should().Be(newName);
        branch.Code.Should().Be(newCode);
        branch.Address.Should().Be(newAddress);
        branch.Phone.Should().Be(newPhone);
        branch.Email.Should().Be(newEmail);
    }

    [Fact]
    public void Update_WithEmptyName_ShouldThrowArgumentException()
    {
        // Arrange
        var branch = CreateBranch();

        // Act
        var action = () => branch.Update("", _address, _phone);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Branch name cannot be empty.*");
    }

    [Fact]
    public void Update_WithNullAddress_ShouldThrowArgumentNullException()
    {
        // Arrange
        var branch = CreateBranch();

        // Act
        var action = () => branch.Update("New Name", null!, _phone);

        // Assert
        action.Should().Throw<ArgumentNullException>()
            .WithParameterName("address");
    }

    [Fact]
    public void Update_WithNullPhone_ShouldThrowArgumentNullException()
    {
        // Arrange
        var branch = CreateBranch();

        // Act
        var action = () => branch.Update("New Name", _address, null!);

        // Assert
        action.Should().Throw<ArgumentNullException>()
            .WithParameterName("phone");
    }

    [Fact]
    public void SetAsHeadOffice_ShouldSetHeadOfficeFlag()
    {
        // Arrange
        var branch = CreateBranch();

        // Act
        branch.SetAsHeadOffice();

        // Assert
        branch.IsHeadOffice.Should().BeTrue();
    }

    [Fact]
    public void UnsetAsHeadOffice_ShouldRemoveHeadOfficeFlag()
    {
        // Arrange
        var branch = new Branch(
            _tenantId,
            _companyId,
            _name,
            _address,
            _phone,
            isHeadOffice: true);

        // Act
        branch.UnsetAsHeadOffice();

        // Assert
        branch.IsHeadOffice.Should().BeFalse();
    }

    [Fact]
    public void AssignManager_ShouldSetManagerId()
    {
        // Arrange
        var branch = CreateBranch();
        var managerId = Guid.NewGuid();

        // Act
        branch.AssignManager(managerId);

        // Assert
        branch.ManagerId.Should().Be(managerId);
    }

    [Fact]
    public void RemoveManager_ShouldClearManagerId()
    {
        // Arrange
        var branch = CreateBranch();
        var managerId = Guid.NewGuid();
        branch.AssignManager(managerId);

        // Act
        branch.RemoveManager();

        // Assert
        branch.ManagerId.Should().BeNull();
    }

    [Fact]
    public void Activate_DeactivatedBranch_ShouldActivate()
    {
        // Arrange
        var branch = CreateBranch();
        branch.Deactivate();

        // Act
        branch.Activate();

        // Assert
        branch.IsActive.Should().BeTrue();
    }

    [Fact]
    public void Deactivate_ActiveBranch_ShouldDeactivate()
    {
        // Arrange
        var branch = CreateBranch();

        // Act
        branch.Deactivate();

        // Assert
        branch.IsActive.Should().BeFalse();
    }

    [Fact]
    public void CompleteWorkflow_ShouldWorkCorrectly()
    {
        // Arrange & Act
        var branch = new Branch(
            _tenantId,
            _companyId,
            _name,
            _address,
            _phone,
            _code,
            _email,
            false);

        // Set as head office
        branch.SetAsHeadOffice();
        branch.IsHeadOffice.Should().BeTrue();

        // Assign manager
        var managerId = Guid.NewGuid();
        branch.AssignManager(managerId);
        branch.ManagerId.Should().Be(managerId);

        // Update branch info
        var newName = "Head Office Branch";
        branch.Update(newName, _address, _phone, "HQ001", _email);
        branch.Name.Should().Be(newName);
        branch.Code.Should().Be("HQ001");

        // Deactivate and reactivate
        branch.Deactivate();
        branch.IsActive.Should().BeFalse();
        
        branch.Activate();
        branch.IsActive.Should().BeTrue();

        // Remove manager
        branch.RemoveManager();
        branch.ManagerId.Should().BeNull();

        // Unset as head office
        branch.UnsetAsHeadOffice();
        branch.IsHeadOffice.Should().BeFalse();
    }

    private Branch CreateBranch()
    {
        return new Branch(
            _tenantId,
            _companyId,
            _name,
            _address,
            _phone,
            _code,
            _email,
            false);
    }
}