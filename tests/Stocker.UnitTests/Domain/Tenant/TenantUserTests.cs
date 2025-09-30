using FluentAssertions;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Domain.Tenant.Entities;
using Stocker.Domain.Tenant.Enums;
using Xunit;

namespace Stocker.UnitTests.Domain.Tenant;

public class TenantUserTests
{
    private readonly Guid _tenantId = Guid.NewGuid();
    private readonly Guid _masterUserId = Guid.NewGuid();
    private readonly string _username = "john.doe";
    private readonly Email _email = Email.Create("john.doe@example.com").Value!;
    private readonly string _firstName = "John";
    private readonly string _lastName = "Doe";
    private readonly PhoneNumber _phone = PhoneNumber.Create("+1234567890").Value!;
    private readonly PhoneNumber _mobile = PhoneNumber.Create("+9876543210").Value!;

    [Fact]
    public void Create_WithValidData_ShouldCreateTenantUser()
    {
        // Act
        var user = TenantUser.Create(
            _tenantId,
            _masterUserId,
            _username,
            _email,
            _firstName,
            _lastName);

        // Assert
        user.Should().NotBeNull();
        user.TenantId.Should().Be(_tenantId);
        user.MasterUserId.Should().Be(_masterUserId);
        user.Username.Should().Be(_username);
        user.Email.Should().Be(_email);
        user.FirstName.Should().Be(_firstName);
        user.LastName.Should().Be(_lastName);
        user.Status.Should().Be(TenantUserStatus.Active);
        user.UserRoles.Should().BeEmpty();
        user.UserPermissions.Should().BeEmpty();
        user.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        user.UpdatedAt.Should().BeNull();
    }

    [Fact]
    public void Create_WithFullData_ShouldCreateCompleteUser()
    {
        // Arrange
        var employeeCode = "EMP001";
        var title = "Senior Developer";
        var departmentId = Guid.NewGuid();
        var branchId = Guid.NewGuid();
        var hireDate = DateTime.UtcNow.AddYears(-2);

        // Act
        var user = TenantUser.Create(
            _tenantId,
            _masterUserId,
            _username,
            _email,
            _firstName,
            _lastName,
            employeeCode,
            _phone,
            _mobile,
            title,
            departmentId,
            branchId,
            hireDate);

        // Assert
        user.EmployeeCode.Should().Be(employeeCode);
        user.Phone.Should().Be(_phone);
        user.Mobile.Should().Be(_mobile);
        user.Title.Should().Be(title);
        user.DepartmentId.Should().Be(departmentId);
        user.BranchId.Should().Be(branchId);
        user.HireDate.Should().Be(hireDate);
    }

    [Fact]
    public void Create_WithEmptyUsername_ShouldThrowArgumentException()
    {
        // Act
        var action = () => TenantUser.Create(
            _tenantId,
            _masterUserId,
            "",
            _email,
            _firstName,
            _lastName);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Username cannot be empty.*");
    }

    [Fact]
    public void Create_WithEmptyFirstName_ShouldThrowArgumentException()
    {
        // Act
        var action = () => TenantUser.Create(
            _tenantId,
            _masterUserId,
            _username,
            _email,
            "",
            _lastName);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("First name cannot be empty.*");
    }

    [Fact]
    public void Create_WithEmptyLastName_ShouldThrowArgumentException()
    {
        // Act
        var action = () => TenantUser.Create(
            _tenantId,
            _masterUserId,
            _username,
            _email,
            _firstName,
            "");

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Last name cannot be empty.*");
    }

    [Fact]
    public void UpdateProfile_ShouldUpdateBasicInfo()
    {
        // Arrange
        var user = CreateUser();
        var newFirstName = "Jonathan";
        var newLastName = "Smith";
        var newTitle = "Team Lead";

        // Act
        user.UpdateProfile(newFirstName, newLastName, _phone, _mobile, newTitle);

        // Assert
        user.FirstName.Should().Be(newFirstName);
        user.LastName.Should().Be(newLastName);
        user.Phone.Should().Be(_phone);
        user.Mobile.Should().Be(_mobile);
        user.Title.Should().Be(newTitle);
        user.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public void UpdateEmployeeInfo_ShouldUpdateWorkDetails()
    {
        // Arrange
        var user = CreateUser();
        var employeeCode = "EMP123";
        var departmentId = Guid.NewGuid();
        var branchId = Guid.NewGuid();
        var managerId = Guid.NewGuid();

        // Act
        user.UpdateEmployeeInfo(employeeCode, departmentId, branchId, managerId);

        // Assert
        user.EmployeeCode.Should().Be(employeeCode);
        user.DepartmentId.Should().Be(departmentId);
        user.BranchId.Should().Be(branchId);
        user.ManagerId.Should().Be(managerId);
        user.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public void UpdateProfilePicture_ShouldSetPictureUrl()
    {
        // Arrange
        var user = CreateUser();
        var pictureUrl = "https://example.com/profile.jpg";

        // Act
        user.UpdateProfilePicture(pictureUrl);

        // Assert
        user.ProfilePictureUrl.Should().Be(pictureUrl);
        user.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public void UpdateProfilePicture_WithNull_ShouldClearPicture()
    {
        // Arrange
        var user = CreateUser();
        user.UpdateProfilePicture("https://example.com/profile.jpg");

        // Act
        user.UpdateProfilePicture(null);

        // Assert
        user.ProfilePictureUrl.Should().BeNull();
    }

    [Fact]
    public void Activate_InactiveUser_ShouldActivate()
    {
        // Arrange
        var user = CreateUser();
        user.Deactivate();

        // Act
        user.Activate();

        // Assert
        user.Status.Should().Be(TenantUserStatus.Active);
        user.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public void Activate_TerminatedUser_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var user = CreateUser();
        user.Terminate(DateTime.UtcNow);

        // Act
        var action = () => user.Activate();

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Cannot activate terminated users.");
    }

    [Fact]
    public void Deactivate_ActiveUser_ShouldDeactivate()
    {
        // Arrange
        var user = CreateUser();

        // Act
        user.Deactivate();

        // Assert
        user.Status.Should().Be(TenantUserStatus.Inactive);
        user.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public void Suspend_ActiveUser_ShouldSuspend()
    {
        // Arrange
        var user = CreateUser();
        var reason = "Security violation";

        // Act
        user.Suspend(reason);

        // Assert
        user.Status.Should().Be(TenantUserStatus.Suspended);
        user.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public void Suspend_TerminatedUser_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var user = CreateUser();
        user.Terminate(DateTime.UtcNow);

        // Act
        var action = () => user.Suspend("Any reason");

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Cannot suspend terminated users.");
    }

    [Fact]
    public void SetOnLeave_ActiveUser_ShouldSetOnLeave()
    {
        // Arrange
        var user = CreateUser();

        // Act
        user.SetOnLeave();

        // Assert
        user.Status.Should().Be(TenantUserStatus.OnLeave);
        user.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public void SetOnLeave_TerminatedUser_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var user = CreateUser();
        user.Terminate(DateTime.UtcNow);

        // Act
        var action = () => user.SetOnLeave();

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Cannot set terminated users on leave.");
    }

    [Fact]
    public void Terminate_ActiveUser_ShouldTerminate()
    {
        // Arrange
        var user = CreateUser();
        var roleId = Guid.NewGuid();
        user.AssignRole(roleId);
        user.GrantPermission("Product", PermissionType.View);
        var terminationDate = DateTime.UtcNow;

        // Act
        user.Terminate(terminationDate);

        // Assert
        user.Status.Should().Be(TenantUserStatus.Terminated);
        user.TerminationDate.Should().Be(terminationDate);
        user.UserRoles.Should().BeEmpty();
        user.UserPermissions.Should().BeEmpty();
        user.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public void RecordLogin_ShouldUpdateLastLoginTime()
    {
        // Arrange
        var user = CreateUser();

        // Act
        user.RecordLogin();

        // Assert
        user.LastLoginAt.Should().NotBeNull();
        user.LastLoginAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
    }

    [Fact]
    public void AssignRole_NewRole_ShouldAddRole()
    {
        // Arrange
        var user = CreateUser();
        var roleId = Guid.NewGuid();

        // Act
        user.AssignRole(roleId);

        // Assert
        user.UserRoles.Should().HaveCount(1);
        user.HasRole(roleId).Should().BeTrue();
        user.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public void AssignRole_DuplicateRole_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var user = CreateUser();
        var roleId = Guid.NewGuid();
        user.AssignRole(roleId);

        // Act
        var action = () => user.AssignRole(roleId);

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage($"User already has role '{roleId}'.");
    }

    [Fact]
    public void RemoveRole_ExistingRole_ShouldRemoveRole()
    {
        // Arrange
        var user = CreateUser();
        var roleId = Guid.NewGuid();
        user.AssignRole(roleId);

        // Act
        user.RemoveRole(roleId);

        // Assert
        user.UserRoles.Should().BeEmpty();
        user.HasRole(roleId).Should().BeFalse();
        user.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public void RemoveRole_NonExistingRole_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var user = CreateUser();
        var roleId = Guid.NewGuid();

        // Act
        var action = () => user.RemoveRole(roleId);

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage($"User does not have role '{roleId}'.");
    }

    [Fact]
    public void GrantPermission_NewPermission_ShouldAddPermission()
    {
        // Arrange
        var user = CreateUser();
        var resource = "Product";
        var permissionType = PermissionType.View;

        // Act
        user.GrantPermission(resource, permissionType);

        // Assert
        user.UserPermissions.Should().HaveCount(1);
        user.HasPermission(resource, permissionType).Should().BeTrue();
        user.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public void GrantPermission_DuplicatePermission_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var user = CreateUser();
        var resource = "Product";
        var permissionType = PermissionType.View;
        user.GrantPermission(resource, permissionType);

        // Act
        var action = () => user.GrantPermission(resource, permissionType);

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage($"User already has '{permissionType}' permission for '{resource}'.");
    }

    [Fact]
    public void RevokePermission_ExistingPermission_ShouldRemovePermission()
    {
        // Arrange
        var user = CreateUser();
        var resource = "Product";
        var permissionType = PermissionType.View;
        user.GrantPermission(resource, permissionType);

        // Act
        user.RevokePermission(resource, permissionType);

        // Assert
        user.UserPermissions.Should().BeEmpty();
        user.HasPermission(resource, permissionType).Should().BeFalse();
        user.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public void RevokePermission_NonExistingPermission_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var user = CreateUser();
        var resource = "Product";
        var permissionType = PermissionType.View;

        // Act
        var action = () => user.RevokePermission(resource, permissionType);

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage($"User does not have '{permissionType}' permission for '{resource}'.");
    }

    [Fact]
    public void GetFullName_ShouldReturnCombinedName()
    {
        // Arrange
        var user = CreateUser();

        // Act
        var fullName = user.GetFullName();

        // Assert
        fullName.Should().Be($"{_firstName} {_lastName}");
    }

    [Fact]
    public void IsActive_ActiveUser_ShouldReturnTrue()
    {
        // Arrange
        var user = CreateUser();

        // Act
        var isActive = user.IsActive();

        // Assert
        isActive.Should().BeTrue();
    }

    [Fact]
    public void IsActive_InactiveUser_ShouldReturnFalse()
    {
        // Arrange
        var user = CreateUser();
        user.Deactivate();

        // Act
        var isActive = user.IsActive();

        // Assert
        isActive.Should().BeFalse();
    }

    [Fact]
    public void CompleteUserLifecycle_ShouldWorkCorrectly()
    {
        // Arrange & Act
        var user = TenantUser.Create(
            _tenantId,
            _masterUserId,
            _username,
            _email,
            _firstName,
            _lastName,
            "EMP001",
            _phone,
            _mobile,
            "Junior Developer",
            Guid.NewGuid(),
            Guid.NewGuid(),
            DateTime.UtcNow.AddYears(-1));

        // Verify initial state
        user.Status.Should().Be(TenantUserStatus.Active);
        user.IsActive().Should().BeTrue();

        // Update profile
        user.UpdateProfile("Jonathan", "Doe", null, _mobile, "Senior Developer");
        user.FirstName.Should().Be("Jonathan");
        user.Title.Should().Be("Senior Developer");

        // Assign roles and permissions
        var roleId1 = Guid.NewGuid();
        var roleId2 = Guid.NewGuid();
        user.AssignRole(roleId1);
        user.AssignRole(roleId2);
        user.GrantPermission("Product", PermissionType.View);
        user.GrantPermission("Product", PermissionType.Edit);
        user.GrantPermission("Customer", PermissionType.View);

        user.UserRoles.Should().HaveCount(2);
        user.UserPermissions.Should().HaveCount(3);

        // Remove some permissions
        user.RevokePermission("Product", PermissionType.Edit);
        user.UserPermissions.Should().HaveCount(2);

        // Record login
        user.RecordLogin();
        user.LastLoginAt.Should().NotBeNull();

        // Suspend user
        user.Suspend("Policy violation");
        user.Status.Should().Be(TenantUserStatus.Suspended);

        // Activate again
        user.Activate();
        user.Status.Should().Be(TenantUserStatus.Active);

        // Set on leave
        user.SetOnLeave();
        user.Status.Should().Be(TenantUserStatus.OnLeave);

        // Back from leave
        user.Activate();
        user.Status.Should().Be(TenantUserStatus.Active);

        // Finally terminate
        var terminationDate = DateTime.UtcNow.AddDays(30);
        user.Terminate(terminationDate);
        user.Status.Should().Be(TenantUserStatus.Terminated);
        user.TerminationDate.Should().Be(terminationDate);
        user.UserRoles.Should().BeEmpty();
        user.UserPermissions.Should().BeEmpty();
    }

    [Fact]
    public void MultiplePermissions_DifferentResources_ShouldWork()
    {
        // Arrange
        var user = CreateUser();

        // Act
        user.GrantPermission("Product", PermissionType.View);
        user.GrantPermission("Product", PermissionType.Edit);
        user.GrantPermission("Product", PermissionType.Delete);
        user.GrantPermission("Customer", PermissionType.View);
        user.GrantPermission("Customer", PermissionType.Create);
        user.GrantPermission("Order", PermissionType.Approve);

        // Assert
        user.UserPermissions.Should().HaveCount(6);
        user.HasPermission("Product", PermissionType.View).Should().BeTrue();
        user.HasPermission("Product", PermissionType.Edit).Should().BeTrue();
        user.HasPermission("Product", PermissionType.Delete).Should().BeTrue();
        user.HasPermission("Customer", PermissionType.View).Should().BeTrue();
        user.HasPermission("Customer", PermissionType.Create).Should().BeTrue();
        user.HasPermission("Order", PermissionType.Approve).Should().BeTrue();
        user.HasPermission("Order", PermissionType.Delete).Should().BeFalse();
    }

    private TenantUser CreateUser()
    {
        return TenantUser.Create(
            _tenantId,
            _masterUserId,
            _username,
            _email,
            _firstName,
            _lastName);
    }
}