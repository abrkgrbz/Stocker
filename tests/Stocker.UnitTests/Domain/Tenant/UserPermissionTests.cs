using FluentAssertions;
using Stocker.Domain.Tenant.Entities;
using Stocker.Domain.Tenant.Enums;
using Xunit;

namespace Stocker.UnitTests.Domain.Tenant;

public class UserPermissionTests
{
    private readonly Guid _userId = Guid.NewGuid();
    private readonly string _resource = "Product";
    private readonly PermissionType _permissionType = PermissionType.View;
    private readonly Guid _grantedBy = Guid.NewGuid();

    [Fact]
    public void Constructor_WithValidData_ShouldCreateUserPermission()
    {
        // Act
        var permission = new UserPermission(_userId, _resource, _permissionType);

        // Assert
        permission.Should().NotBeNull();
        permission.Id.Should().NotBeEmpty();
        permission.UserId.Should().Be(_userId);
        permission.Resource.Should().Be(_resource);
        permission.PermissionType.Should().Be(_permissionType);
        permission.GrantedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        permission.GrantedBy.Should().BeNull();
    }

    [Fact]
    public void Constructor_WithGrantedBy_ShouldSetGranter()
    {
        // Act
        var permission = new UserPermission(_userId, _resource, _permissionType, _grantedBy);

        // Assert
        permission.GrantedBy.Should().Be(_grantedBy);
    }

    [Fact]
    public void Constructor_WithNullResource_ShouldThrowArgumentNullException()
    {
        // Act
        var action = () => new UserPermission(_userId, null!, _permissionType);

        // Assert
        action.Should().Throw<ArgumentNullException>()
            .WithParameterName("resource");
    }

    [Fact]
    public void Constructor_WithEmptyResource_ShouldCreatePermission()
    {
        // Act
        var permission = new UserPermission(_userId, string.Empty, _permissionType);

        // Assert
        permission.Resource.Should().BeEmpty();
    }

    [Fact]
    public void Constructor_ShouldGenerateUniqueId()
    {
        // Act
        var permission1 = new UserPermission(_userId, _resource, _permissionType);
        var permission2 = new UserPermission(_userId, _resource, _permissionType);

        // Assert
        permission1.Id.Should().NotBe(permission2.Id);
    }

    [Fact]
    public void AllPermissionTypes_ShouldWorkCorrectly()
    {
        // Arrange & Act
        var viewPermission = new UserPermission(_userId, "Product", PermissionType.View);
        var createPermission = new UserPermission(_userId, "Product", PermissionType.Create);
        var editPermission = new UserPermission(_userId, "Product", PermissionType.Edit);
        var deletePermission = new UserPermission(_userId, "Product", PermissionType.Delete);
        var exportPermission = new UserPermission(_userId, "Product", PermissionType.Export);
        var importPermission = new UserPermission(_userId, "Product", PermissionType.Import);
        var approvePermission = new UserPermission(_userId, "Product", PermissionType.Approve);
        var executePermission = new UserPermission(_userId, "Product", PermissionType.Execute);

        // Assert
        viewPermission.PermissionType.Should().Be(PermissionType.View);
        createPermission.PermissionType.Should().Be(PermissionType.Create);
        editPermission.PermissionType.Should().Be(PermissionType.Edit);
        deletePermission.PermissionType.Should().Be(PermissionType.Delete);
        exportPermission.PermissionType.Should().Be(PermissionType.Export);
        importPermission.PermissionType.Should().Be(PermissionType.Import);
        approvePermission.PermissionType.Should().Be(PermissionType.Approve);
        executePermission.PermissionType.Should().Be(PermissionType.Execute);
    }

    [Fact]
    public void MultiplePermissions_SameUserDifferentResources_ShouldBeValid()
    {
        // Act
        var permission1 = new UserPermission(_userId, "Product", _permissionType);
        var permission2 = new UserPermission(_userId, "Customer", _permissionType);
        var permission3 = new UserPermission(_userId, "Order", _permissionType);

        // Assert
        permission1.Resource.Should().Be("Product");
        permission2.Resource.Should().Be("Customer");
        permission3.Resource.Should().Be("Order");
        permission1.UserId.Should().Be(permission2.UserId);
        permission2.UserId.Should().Be(permission3.UserId);
    }

    [Fact]
    public void MultiplePermissions_SameResourceDifferentPermissions_ShouldBeValid()
    {
        // Act
        var viewPermission = new UserPermission(_userId, _resource, PermissionType.View);
        var editPermission = new UserPermission(_userId, _resource, PermissionType.Edit);
        var deletePermission = new UserPermission(_userId, _resource, PermissionType.Delete);

        // Assert
        viewPermission.PermissionType.Should().Be(PermissionType.View);
        editPermission.PermissionType.Should().Be(PermissionType.Edit);
        deletePermission.PermissionType.Should().Be(PermissionType.Delete);
        viewPermission.Resource.Should().Be(editPermission.Resource);
        editPermission.Resource.Should().Be(deletePermission.Resource);
    }

    [Fact]
    public void GrantedAt_ShouldBeSetToUtcNow()
    {
        // Act
        var before = DateTime.UtcNow;
        var permission = new UserPermission(_userId, _resource, _permissionType);
        var after = DateTime.UtcNow;

        // Assert
        permission.GrantedAt.Should().BeOnOrAfter(before);
        permission.GrantedAt.Should().BeOnOrBefore(after);
    }
}