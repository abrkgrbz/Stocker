using FluentAssertions;
using Stocker.Domain.Tenant.Entities;
using Xunit;

namespace Stocker.UnitTests.Domain.Tenant;

public class DepartmentTests
{
    private readonly Guid _tenantId = Guid.NewGuid();
    private readonly Guid _companyId = Guid.NewGuid();
    private readonly string _name = "IT Department";
    private readonly string _code = "IT";
    private readonly string _description = "Information Technology Department";

    [Fact]
    public void Constructor_WithValidData_ShouldCreateDepartment()
    {
        // Act
        var department = new Department(
            _tenantId,
            _companyId,
            _name,
            _code,
            _description);

        // Assert
        department.Should().NotBeNull();
        department.TenantId.Should().Be(_tenantId);
        department.CompanyId.Should().Be(_companyId);
        department.Name.Should().Be(_name);
        department.Code.Should().Be(_code);
        department.Description.Should().Be(_description);
        department.ParentDepartmentId.Should().BeNull();
        department.ManagerId.Should().BeNull();
        department.IsActive.Should().BeTrue();
    }

    [Fact]
    public void Constructor_WithParentDepartment_ShouldSetParentId()
    {
        // Arrange
        var parentDepartmentId = Guid.NewGuid();

        // Act
        var department = new Department(
            _tenantId,
            _companyId,
            _name,
            _code,
            _description,
            parentDepartmentId);

        // Assert
        department.ParentDepartmentId.Should().Be(parentDepartmentId);
    }

    [Fact]
    public void Constructor_WithMinimalData_ShouldCreateDepartment()
    {
        // Act
        var department = new Department(
            _tenantId,
            _companyId,
            _name);

        // Assert
        department.Code.Should().BeNull();
        department.Description.Should().BeNull();
        department.ParentDepartmentId.Should().BeNull();
    }

    [Fact]
    public void Constructor_WithNullName_ShouldThrowArgumentNullException()
    {
        // Act
        var action = () => new Department(
            _tenantId,
            _companyId,
            null!);

        // Assert
        action.Should().Throw<ArgumentNullException>()
            .WithParameterName("name");
    }

    [Fact]
    public void Update_WithValidData_ShouldUpdateDepartment()
    {
        // Arrange
        var department = CreateDepartment();
        var newName = "Updated Department";
        var newCode = "UPDATED";
        var newDescription = "Updated description";

        // Act
        department.Update(newName, newCode, newDescription);

        // Assert
        department.Name.Should().Be(newName);
        department.Code.Should().Be(newCode);
        department.Description.Should().Be(newDescription);
    }

    [Fact]
    public void Update_WithEmptyName_ShouldThrowArgumentException()
    {
        // Arrange
        var department = CreateDepartment();

        // Act
        var action = () => department.Update("", "CODE", "Description");

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Department name cannot be empty.*");
    }

    [Fact]
    public void AssignManager_ShouldSetManagerId()
    {
        // Arrange
        var department = CreateDepartment();
        var managerId = Guid.NewGuid();

        // Act
        department.AssignManager(managerId);

        // Assert
        department.ManagerId.Should().Be(managerId);
    }

    [Fact]
    public void RemoveManager_ShouldClearManagerId()
    {
        // Arrange
        var department = CreateDepartment();
        var managerId = Guid.NewGuid();
        department.AssignManager(managerId);

        // Act
        department.RemoveManager();

        // Assert
        department.ManagerId.Should().BeNull();
    }

    [Fact]
    public void Activate_DeactivatedDepartment_ShouldActivate()
    {
        // Arrange
        var department = CreateDepartment();
        department.Deactivate();

        // Act
        department.Activate();

        // Assert
        department.IsActive.Should().BeTrue();
    }

    [Fact]
    public void Deactivate_ActiveDepartment_ShouldDeactivate()
    {
        // Arrange
        var department = CreateDepartment();

        // Act
        department.Deactivate();

        // Assert
        department.IsActive.Should().BeFalse();
    }

    [Fact]
    public void CompleteWorkflow_ShouldWorkCorrectly()
    {
        // Arrange
        var parentDeptId = Guid.NewGuid();

        // Act & Assert - Create department with parent
        var department = new Department(
            _tenantId,
            _companyId,
            _name,
            _code,
            _description,
            parentDeptId);

        department.ParentDepartmentId.Should().Be(parentDeptId);

        // Assign manager
        var managerId = Guid.NewGuid();
        department.AssignManager(managerId);
        department.ManagerId.Should().Be(managerId);

        // Update department info
        department.Update("HR Department", "HR", "Human Resources");
        department.Name.Should().Be("HR Department");
        department.Code.Should().Be("HR");

        // Deactivate and reactivate
        department.Deactivate();
        department.IsActive.Should().BeFalse();

        department.Activate();
        department.IsActive.Should().BeTrue();

        // Remove manager
        department.RemoveManager();
        department.ManagerId.Should().BeNull();
    }

    private Department CreateDepartment()
    {
        return new Department(
            _tenantId,
            _companyId,
            _name,
            _code,
            _description);
    }
}