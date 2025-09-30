using FluentAssertions;
using Stocker.Domain.Tenant.Entities;
using Stocker.Domain.Tenant.Enums;
using Xunit;

namespace Stocker.UnitTests.Domain.Tenant;

public class RoleTests
{
    private readonly string _name = "Administrator";
    private readonly string _description = "System administrator with full access";

    [Fact]
    public void Create_WithValidData_ShouldCreateRole()
    {
        // Act
        var role = Role.Create(_name, _description);

        // Assert
        role.Should().NotBeNull();
        role.Name.Should().Be(_name);
        role.Description.Should().Be(_description);
        role.IsSystemRole.Should().BeFalse();
        role.IsActive.Should().BeTrue();
        role.Permissions.Should().BeEmpty();
    }

    [Fact]
    public void Create_AsSystemRole_ShouldSetSystemRoleFlag()
    {
        // Act
        var role = Role.Create(_name, _description, isSystemRole: true);

        // Assert
        role.IsSystemRole.Should().BeTrue();
    }

    [Fact]
    public void Create_WithMinimalData_ShouldCreateRole()
    {
        // Act
        var role = Role.Create(_name);

        // Assert
        role.Name.Should().Be(_name);
        role.Description.Should().BeNull();
        role.IsSystemRole.Should().BeFalse();
    }

    [Fact]
    public void Create_WithEmptyName_ShouldThrowArgumentException()
    {
        // Act
        var action = () => Role.Create("");

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Role name cannot be empty.*");
    }

    [Fact]
    public void Update_RegularRole_ShouldUpdate()
    {
        // Arrange
        var role = Role.Create(_name, _description);
        var newName = "Manager";
        var newDescription = "Manager role with limited access";

        // Act
        role.Update(newName, newDescription);

        // Assert
        role.Name.Should().Be(newName);
        role.Description.Should().Be(newDescription);
        role.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public void Update_SystemRole_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var role = Role.Create(_name, _description, isSystemRole: true);

        // Act
        var action = () => role.Update("New Name", "New Description");

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("System roles cannot be updated.");
    }

    [Fact]
    public void Update_WithEmptyName_ShouldThrowArgumentException()
    {
        // Arrange
        var role = Role.Create(_name);

        // Act
        var action = () => role.Update("", "Description");

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Role name cannot be empty.*");
    }

    [Fact]
    public void Activate_DeactivatedRole_ShouldActivate()
    {
        // Arrange
        var role = Role.Create(_name);
        role.Deactivate();

        // Act
        role.Activate();

        // Assert
        role.IsActive.Should().BeTrue();
        role.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public void Deactivate_RegularRole_ShouldDeactivate()
    {
        // Arrange
        var role = Role.Create(_name);

        // Act
        role.Deactivate();

        // Assert
        role.IsActive.Should().BeFalse();
        role.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public void Deactivate_SystemRole_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var role = Role.Create(_name, isSystemRole: true);

        // Act
        var action = () => role.Deactivate();

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("System roles cannot be deactivated.");
    }

    [Fact]
    public void AddPermission_WithValidData_ShouldAddPermission()
    {
        // Arrange
        var role = Role.Create(_name);
        var resource = "Product";
        var permissionType = PermissionType.View;

        // Act
        role.AddPermission(resource, permissionType);

        // Assert
        role.Permissions.Should().HaveCount(1);
        var permission = role.Permissions.First();
        permission.Resource.Should().Be(resource);
        permission.PermissionType.Should().Be(permissionType);
        role.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public void AddPermission_MultiplePermissions_ShouldAddAll()
    {
        // Arrange
        var role = Role.Create(_name);

        // Act
        role.AddPermission("Product", PermissionType.View);
        role.AddPermission("Product", PermissionType.Edit);
        role.AddPermission("Customer", PermissionType.View);
        role.AddPermission("Customer", PermissionType.Delete);

        // Assert
        role.Permissions.Should().HaveCount(4);
    }

    [Fact]
    public void AddPermission_WithEmptyResource_ShouldThrowArgumentException()
    {
        // Arrange
        var role = Role.Create(_name);

        // Act
        var action = () => role.AddPermission("", PermissionType.View);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Resource cannot be empty.*");
    }

    [Fact]
    public void AddPermission_DuplicatePermission_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var role = Role.Create(_name);
        var resource = "Product";
        var permissionType = PermissionType.View;
        role.AddPermission(resource, permissionType);

        // Act
        var action = () => role.AddPermission(resource, permissionType);

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage($"Role already has '{permissionType}' permission for '{resource}'.");
    }

    [Fact]
    public void RemovePermission_ExistingPermission_ShouldRemove()
    {
        // Arrange
        var role = Role.Create(_name);
        var resource = "Product";
        var permissionType = PermissionType.View;
        role.AddPermission(resource, permissionType);

        // Act
        role.RemovePermission(resource, permissionType);

        // Assert
        role.Permissions.Should().BeEmpty();
        role.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public void RemovePermission_NonExistingPermission_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var role = Role.Create(_name);

        // Act
        var action = () => role.RemovePermission("Product", PermissionType.View);

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Role does not have 'View' permission for 'Product'.");
    }

    [Fact]
    public void ClearPermissions_RegularRole_ShouldClearAll()
    {
        // Arrange
        var role = Role.Create(_name);
        role.AddPermission("Product", PermissionType.View);
        role.AddPermission("Customer", PermissionType.Edit);

        // Act
        role.ClearPermissions();

        // Assert
        role.Permissions.Should().BeEmpty();
        role.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public void ClearPermissions_SystemRole_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var role = Role.Create(_name, isSystemRole: true);
        role.AddPermission("Product", PermissionType.View);

        // Act
        var action = () => role.ClearPermissions();

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Cannot clear permissions from system roles.");
    }

    [Fact]
    public void HasPermission_ExistingPermission_ShouldReturnTrue()
    {
        // Arrange
        var role = Role.Create(_name);
        var resource = "Product";
        var permissionType = PermissionType.View;
        role.AddPermission(resource, permissionType);

        // Act
        var result = role.HasPermission(resource, permissionType);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void HasPermission_NonExistingPermission_ShouldReturnFalse()
    {
        // Arrange
        var role = Role.Create(_name);

        // Act
        var result = role.HasPermission("Product", PermissionType.View);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public void CreatedDate_ShouldReturnCreatedAt()
    {
        // Arrange & Act
        var role = Role.Create(_name);

        // Assert
        role.CreatedDate.Should().Be(role.CreatedAt);
    }

    [Fact]
    public void CompleteWorkflow_ShouldWorkCorrectly()
    {
        // Arrange & Act
        var role = Role.Create("Manager", "Manager role");

        // Add various permissions
        role.AddPermission("Product", PermissionType.View);
        role.AddPermission("Product", PermissionType.Edit);
        role.AddPermission("Customer", PermissionType.View);

        // Check permissions
        role.HasPermission("Product", PermissionType.View).Should().BeTrue();
        role.HasPermission("Product", PermissionType.Edit).Should().BeTrue();
        role.HasPermission("Product", PermissionType.Delete).Should().BeFalse();

        // Remove a permission
        role.RemovePermission("Product", PermissionType.Edit);
        role.HasPermission("Product", PermissionType.Edit).Should().BeFalse();

        // Update role
        role.Update("Senior Manager", "Senior manager role with more privileges");
        role.Name.Should().Be("Senior Manager");

        // Deactivate and reactivate
        role.Deactivate();
        role.IsActive.Should().BeFalse();

        role.Activate();
        role.IsActive.Should().BeTrue();
    }
}