using FluentAssertions;
using Stocker.Domain.Tenant.Entities;
using Xunit;

namespace Stocker.UnitTests.Domain.Tenant;

public class UserRoleTests
{
    private readonly Guid _userId = Guid.NewGuid();
    private readonly Guid _roleId = Guid.NewGuid();
    private readonly Guid _assignedBy = Guid.NewGuid();

    [Fact]
    public void Constructor_WithValidData_ShouldCreateUserRole()
    {
        // Act
        var userRole = new UserRole(_userId, _roleId);

        // Assert
        userRole.Should().NotBeNull();
        userRole.Id.Should().NotBeEmpty();
        userRole.UserId.Should().Be(_userId);
        userRole.RoleId.Should().Be(_roleId);
        userRole.AssignedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        userRole.AssignedBy.Should().BeNull();
    }

    [Fact]
    public void Constructor_WithAssignedBy_ShouldSetAssigner()
    {
        // Act
        var userRole = new UserRole(_userId, _roleId, _assignedBy);

        // Assert
        userRole.AssignedBy.Should().Be(_assignedBy);
    }

    [Fact]
    public void Constructor_ShouldGenerateUniqueId()
    {
        // Act
        var userRole1 = new UserRole(_userId, _roleId);
        var userRole2 = new UserRole(_userId, _roleId);

        // Assert
        userRole1.Id.Should().NotBe(userRole2.Id);
    }

    [Fact]
    public void AssignedAt_ShouldBeSetToUtcNow()
    {
        // Act
        var before = DateTime.UtcNow;
        var userRole = new UserRole(_userId, _roleId);
        var after = DateTime.UtcNow;

        // Assert
        userRole.AssignedAt.Should().BeOnOrAfter(before);
        userRole.AssignedAt.Should().BeOnOrBefore(after);
    }

    [Fact]
    public void MultipleUserRoles_SameUserDifferentRoles_ShouldBeValid()
    {
        // Arrange
        var roleId1 = Guid.NewGuid();
        var roleId2 = Guid.NewGuid();

        // Act
        var userRole1 = new UserRole(_userId, roleId1);
        var userRole2 = new UserRole(_userId, roleId2);

        // Assert
        userRole1.UserId.Should().Be(userRole2.UserId);
        userRole1.RoleId.Should().NotBe(userRole2.RoleId);
    }

    [Fact]
    public void MultipleUserRoles_DifferentUsersSameRole_ShouldBeValid()
    {
        // Arrange
        var userId1 = Guid.NewGuid();
        var userId2 = Guid.NewGuid();

        // Act
        var userRole1 = new UserRole(userId1, _roleId);
        var userRole2 = new UserRole(userId2, _roleId);

        // Assert
        userRole1.RoleId.Should().Be(userRole2.RoleId);
        userRole1.UserId.Should().NotBe(userRole2.UserId);
    }

    [Fact]
    public void UserRole_WithEmptyUserId_ShouldStillCreate()
    {
        // Act
        var userRole = new UserRole(Guid.Empty, _roleId);

        // Assert
        userRole.UserId.Should().Be(Guid.Empty);
        userRole.RoleId.Should().Be(_roleId);
    }

    [Fact]
    public void UserRole_WithEmptyRoleId_ShouldStillCreate()
    {
        // Act
        var userRole = new UserRole(_userId, Guid.Empty);

        // Assert
        userRole.UserId.Should().Be(_userId);
        userRole.RoleId.Should().Be(Guid.Empty);
    }
}