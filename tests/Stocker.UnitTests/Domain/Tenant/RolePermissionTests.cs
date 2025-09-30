using FluentAssertions;
using Stocker.Domain.Tenant.Entities;
using Stocker.Domain.Tenant.Enums;
using Xunit;

namespace Stocker.UnitTests.Domain.Tenant;

public class RolePermissionTests
{
    private readonly Guid _roleId = Guid.NewGuid();
    private readonly string _resource = "Product";
    private readonly PermissionType _permissionType = PermissionType.View;

    [Fact]
    public void Constructor_WithValidData_ShouldCreateRolePermission()
    {
        // Act
        var permission = new RolePermission(_roleId, _resource, _permissionType);

        // Assert
        permission.Should().NotBeNull();
        permission.Id.Should().NotBeEmpty();
        permission.RoleId.Should().Be(_roleId);
        permission.Resource.Should().Be(_resource);
        permission.PermissionType.Should().Be(_permissionType);
        permission.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
    }

    [Fact]
    public void Constructor_WithNullResource_ShouldThrowArgumentNullException()
    {
        // Act
        var action = () => new RolePermission(_roleId, null!, _permissionType);

        // Assert
        action.Should().Throw<ArgumentNullException>()
            .WithParameterName("resource");
    }

    [Fact]
    public void Constructor_WithEmptyResource_ShouldCreatePermission()
    {
        // Act
        var permission = new RolePermission(_roleId, string.Empty, _permissionType);

        // Assert
        permission.Resource.Should().BeEmpty();
    }

    [Fact]
    public void Constructor_ShouldGenerateUniqueId()
    {
        // Act
        var permission1 = new RolePermission(_roleId, _resource, _permissionType);
        var permission2 = new RolePermission(_roleId, _resource, _permissionType);

        // Assert
        permission1.Id.Should().NotBe(permission2.Id);
    }

    [Fact]
    public void AllPermissionTypes_ShouldWorkCorrectly()
    {
        // Arrange & Act
        var permissions = new[]
        {
            new RolePermission(_roleId, "Product", PermissionType.View),
            new RolePermission(_roleId, "Product", PermissionType.Create),
            new RolePermission(_roleId, "Product", PermissionType.Edit),
            new RolePermission(_roleId, "Product", PermissionType.Delete),
            new RolePermission(_roleId, "Product", PermissionType.Export),
            new RolePermission(_roleId, "Product", PermissionType.Import),
            new RolePermission(_roleId, "Product", PermissionType.Approve),
            new RolePermission(_roleId, "Product", PermissionType.Execute)
        };

        // Assert
        permissions[0].PermissionType.Should().Be(PermissionType.View);
        permissions[1].PermissionType.Should().Be(PermissionType.Create);
        permissions[2].PermissionType.Should().Be(PermissionType.Edit);
        permissions[3].PermissionType.Should().Be(PermissionType.Delete);
        permissions[4].PermissionType.Should().Be(PermissionType.Export);
        permissions[5].PermissionType.Should().Be(PermissionType.Import);
        permissions[6].PermissionType.Should().Be(PermissionType.Approve);
        permissions[7].PermissionType.Should().Be(PermissionType.Execute);
    }

    [Fact]
    public void MultiplePermissions_SameRoleDifferentResources_ShouldBeValid()
    {
        // Act
        var permission1 = new RolePermission(_roleId, "Product", _permissionType);
        var permission2 = new RolePermission(_roleId, "Customer", _permissionType);
        var permission3 = new RolePermission(_roleId, "Order", _permissionType);

        // Assert
        permission1.RoleId.Should().Be(_roleId);
        permission2.RoleId.Should().Be(_roleId);
        permission3.RoleId.Should().Be(_roleId);
        permission1.Resource.Should().NotBe(permission2.Resource);
        permission2.Resource.Should().NotBe(permission3.Resource);
    }

    [Fact]
    public void MultiplePermissions_SameResourceDifferentTypes_ShouldBeValid()
    {
        // Act
        var viewPermission = new RolePermission(_roleId, _resource, PermissionType.View);
        var editPermission = new RolePermission(_roleId, _resource, PermissionType.Edit);
        var deletePermission = new RolePermission(_roleId, _resource, PermissionType.Delete);

        // Assert
        viewPermission.Resource.Should().Be(_resource);
        editPermission.Resource.Should().Be(_resource);
        deletePermission.Resource.Should().Be(_resource);
        viewPermission.PermissionType.Should().NotBe(editPermission.PermissionType);
        editPermission.PermissionType.Should().NotBe(deletePermission.PermissionType);
    }

    [Fact]
    public void CreatedAt_ShouldBeSetToUtcNow()
    {
        // Act
        var before = DateTime.UtcNow;
        var permission = new RolePermission(_roleId, _resource, _permissionType);
        var after = DateTime.UtcNow;

        // Assert
        permission.CreatedAt.Should().BeOnOrAfter(before);
        permission.CreatedAt.Should().BeOnOrBefore(after);
    }

    [Fact]
    public void RolePermission_WithEmptyRoleId_ShouldStillCreate()
    {
        // Act
        var permission = new RolePermission(Guid.Empty, _resource, _permissionType);

        // Assert
        permission.RoleId.Should().Be(Guid.Empty);
        permission.Resource.Should().Be(_resource);
    }
}