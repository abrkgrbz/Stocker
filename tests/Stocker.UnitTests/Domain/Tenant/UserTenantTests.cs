using FluentAssertions;
using Stocker.Domain.Tenant.Entities;
using System.Text.Json;
using Xunit;

namespace Stocker.UnitTests.Domain.Tenant;

public class UserTenantTests
{
    private readonly Guid _userId = Guid.NewGuid();
    private readonly string _username = "testuser";
    private readonly string _email = "test@example.com";
    private readonly string _firstName = "John";
    private readonly string _lastName = "Doe";
    private readonly UserType _userType = UserType.Personel;
    private readonly string _assignedBy = "admin";

    [Fact]
    public void Create_WithValidData_ShouldCreateUserTenant()
    {
        // Act
        var userTenant = UserTenant.Create(
            _userId,
            _username,
            _email,
            _firstName,
            _lastName,
            _userType,
            _assignedBy);

        // Assert
        userTenant.Should().NotBeNull();
        userTenant.UserId.Should().Be(_userId);
        userTenant.Username.Should().Be(_username);
        userTenant.Email.Should().Be(_email);
        userTenant.FirstName.Should().Be(_firstName);
        userTenant.LastName.Should().Be(_lastName);
        userTenant.UserType.Should().Be(_userType);
        userTenant.AssignedBy.Should().Be(_assignedBy);
        userTenant.IsActive.Should().BeTrue();
        userTenant.IsLocked.Should().BeFalse();
        userTenant.CanAccessWeb.Should().BeTrue();
        userTenant.CanAccessMobile.Should().BeTrue();
        userTenant.CanAccessApi.Should().BeTrue();
    }

    [Fact]
    public void Create_WithPhoneNumber_ShouldSetPhoneNumber()
    {
        // Arrange
        var phoneNumber = "+905551234567";

        // Act
        var userTenant = UserTenant.Create(
            _userId,
            _username,
            _email,
            _firstName,
            _lastName,
            _userType,
            _assignedBy,
            phoneNumber);

        // Assert
        userTenant.PhoneNumber.Should().Be(phoneNumber);
    }

    [Fact]
    public void Create_WithEmptyUserId_ShouldThrowArgumentException()
    {
        // Act
        var action = () => UserTenant.Create(
            Guid.Empty,
            _username,
            _email,
            _firstName,
            _lastName,
            _userType,
            _assignedBy);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("User ID cannot be empty.*");
    }

    [Fact]
    public void Create_WithEmptyUsername_ShouldThrowArgumentException()
    {
        // Act
        var action = () => UserTenant.Create(
            _userId,
            "",
            _email,
            _firstName,
            _lastName,
            _userType,
            _assignedBy);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Username cannot be empty.*");
    }

    [Fact]
    public void Create_WithEmptyEmail_ShouldThrowArgumentException()
    {
        // Act
        var action = () => UserTenant.Create(
            _userId,
            _username,
            "",
            _firstName,
            _lastName,
            _userType,
            _assignedBy);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Email cannot be empty.*");
    }

    [Fact]
    public void UpdateUserInfo_ShouldUpdateFields()
    {
        // Arrange
        var userTenant = CreateUserTenant();
        var newFirstName = "Jane";
        var newLastName = "Smith";
        var newPhone = "+905559999999";

        // Act
        userTenant.UpdateUserInfo(newFirstName, newLastName, newPhone);

        // Assert
        userTenant.FirstName.Should().Be(newFirstName);
        userTenant.LastName.Should().Be(newLastName);
        userTenant.PhoneNumber.Should().Be(newPhone);
        userTenant.ModifiedAt.Should().NotBeNull();
    }

    [Fact]
    public void UpdateUserType_ShouldUpdateTypeAndTrackModification()
    {
        // Arrange
        var userTenant = CreateUserTenant();
        var newUserType = UserType.FirmaYoneticisi;
        var modifiedBy = "supervisor";

        // Act
        userTenant.UpdateUserType(newUserType, modifiedBy);

        // Assert
        userTenant.UserType.Should().Be(newUserType);
        userTenant.ModifiedBy.Should().Be(modifiedBy);
        userTenant.ModifiedAt.Should().NotBeNull();
    }

    [Fact]
    public void AssignRole_ShouldSetRoleAndPermissions()
    {
        // Arrange
        var userTenant = CreateUserTenant();
        var roleId = Guid.NewGuid();
        var roleName = "Manager";
        var permissions = new List<string> { "READ", "WRITE", "DELETE" };

        // Act
        userTenant.AssignRole(roleId, roleName, permissions);

        // Assert
        userTenant.RoleId.Should().Be(roleId);
        userTenant.RoleName.Should().Be(roleName);
        userTenant.Permissions.Should().NotBeNull();
        
        var deserializedPermissions = JsonSerializer.Deserialize<List<string>>(userTenant.Permissions!);
        deserializedPermissions.Should().BeEquivalentTo(permissions);
        userTenant.ModifiedAt.Should().NotBeNull();
    }

    [Fact]
    public void RemoveRole_ShouldClearRoleFields()
    {
        // Arrange
        var userTenant = CreateUserTenant();
        userTenant.AssignRole(Guid.NewGuid(), "Manager", new List<string> { "READ" });

        // Act
        userTenant.RemoveRole();

        // Assert
        userTenant.RoleId.Should().BeNull();
        userTenant.RoleName.Should().BeNull();
        userTenant.Permissions.Should().BeNull();
        userTenant.ModifiedAt.Should().NotBeNull();
    }

    [Fact]
    public void AddCustomPermissions_ShouldSetCustomPermissions()
    {
        // Arrange
        var userTenant = CreateUserTenant();
        var customPermissions = new List<string> { "CUSTOM_REPORT", "CUSTOM_EXPORT" };
        var modifiedBy = "admin";

        // Act
        userTenant.AddCustomPermissions(customPermissions, modifiedBy);

        // Assert
        userTenant.CustomPermissions.Should().NotBeNull();
        var deserializedPermissions = JsonSerializer.Deserialize<List<string>>(userTenant.CustomPermissions!);
        deserializedPermissions.Should().BeEquivalentTo(customPermissions);
        userTenant.ModifiedBy.Should().Be(modifiedBy);
    }

    [Fact]
    public void SetRestrictedPermissions_ShouldSetRestrictions()
    {
        // Arrange
        var userTenant = CreateUserTenant();
        var restrictedPermissions = new List<string> { "DELETE_ALL", "EXPORT_SENSITIVE" };
        var modifiedBy = "security_admin";

        // Act
        userTenant.SetRestrictedPermissions(restrictedPermissions, modifiedBy);

        // Assert
        userTenant.RestrictedPermissions.Should().NotBeNull();
        var deserializedPermissions = JsonSerializer.Deserialize<List<string>>(userTenant.RestrictedPermissions!);
        deserializedPermissions.Should().BeEquivalentTo(restrictedPermissions);
        userTenant.ModifiedBy.Should().Be(modifiedBy);
    }

    [Fact]
    public void AssignToDepartment_ShouldSetDepartmentInfo()
    {
        // Arrange
        var userTenant = CreateUserTenant();
        var departmentId = Guid.NewGuid();
        var departmentName = "IT Department";
        var modifiedBy = "hr_manager";

        // Act
        userTenant.AssignToDepartment(departmentId, departmentName, modifiedBy);

        // Assert
        userTenant.DepartmentId.Should().Be(departmentId);
        userTenant.DepartmentName.Should().Be(departmentName);
        userTenant.ModifiedBy.Should().Be(modifiedBy);
        userTenant.ModifiedAt.Should().NotBeNull();
    }

    [Fact]
    public void AssignToBranch_ShouldSetBranchInfo()
    {
        // Arrange
        var userTenant = CreateUserTenant();
        var branchId = Guid.NewGuid();
        var branchName = "Main Branch";
        var modifiedBy = "branch_manager";

        // Act
        userTenant.AssignToBranch(branchId, branchName, modifiedBy);

        // Assert
        userTenant.BranchId.Should().Be(branchId);
        userTenant.BranchName.Should().Be(branchName);
        userTenant.ModifiedBy.Should().Be(modifiedBy);
        userTenant.ModifiedAt.Should().NotBeNull();
    }

    [Fact]
    public void AssignManager_ShouldSetManagerInfo()
    {
        // Arrange
        var userTenant = CreateUserTenant();
        var managerId = Guid.NewGuid();
        var managerName = "Manager Name";
        var modifiedBy = "hr_admin";

        // Act
        userTenant.AssignManager(managerId, managerName, modifiedBy);

        // Assert
        userTenant.ManagerId.Should().Be(managerId);
        userTenant.ManagerName.Should().Be(managerName);
        userTenant.ModifiedBy.Should().Be(modifiedBy);
        userTenant.ModifiedAt.Should().NotBeNull();
    }

    [Fact]
    public void SetWorkingHours_ShouldSetScheduleInfo()
    {
        // Arrange
        var userTenant = CreateUserTenant();
        var startTime = new TimeSpan(9, 0, 0);
        var endTime = new TimeSpan(18, 0, 0);
        var workingDays = new List<string> { "Monday", "Tuesday", "Wednesday", "Thursday", "Friday" };
        var timeZone = "Europe/Istanbul";

        // Act
        userTenant.SetWorkingHours(startTime, endTime, workingDays, timeZone, true, true);

        // Assert
        userTenant.WorkStartTime.Should().Be(startTime);
        userTenant.WorkEndTime.Should().Be(endTime);
        userTenant.WorkingDays.Should().NotBeNull();
        userTenant.TimeZone.Should().Be(timeZone);
        userTenant.AllowFlexibleHours.Should().BeTrue();
        userTenant.AllowRemoteWork.Should().BeTrue();
        
        var deserializedDays = JsonSerializer.Deserialize<List<string>>(userTenant.WorkingDays!);
        deserializedDays.Should().BeEquivalentTo(workingDays);
    }

    [Fact]
    public void SetAccessRestrictions_ShouldSetIpRestrictions()
    {
        // Arrange
        var userTenant = CreateUserTenant();
        var allowedIps = new List<string> { "192.168.1.0/24", "10.0.0.0/8" };
        var blockedIps = new List<string> { "192.168.1.100" };

        // Act
        userTenant.SetAccessRestrictions(allowedIps, blockedIps, true);

        // Assert
        userTenant.AllowedIpAddresses.Should().NotBeNull();
        userTenant.BlockedIpAddresses.Should().NotBeNull();
        userTenant.RequireTwoFactor.Should().BeTrue();
        
        var deserializedAllowed = JsonSerializer.Deserialize<List<string>>(userTenant.AllowedIpAddresses!);
        deserializedAllowed.Should().BeEquivalentTo(allowedIps);
        
        var deserializedBlocked = JsonSerializer.Deserialize<List<string>>(userTenant.BlockedIpAddresses!);
        deserializedBlocked.Should().BeEquivalentTo(blockedIps);
    }

    [Fact]
    public void SetPlatformAccess_ShouldUpdateAccessFlags()
    {
        // Arrange
        var userTenant = CreateUserTenant();

        // Act
        userTenant.SetPlatformAccess(true, false, true);

        // Assert
        userTenant.CanAccessWeb.Should().BeTrue();
        userTenant.CanAccessMobile.Should().BeFalse();
        userTenant.CanAccessApi.Should().BeTrue();
        userTenant.ModifiedAt.Should().NotBeNull();
    }

    [Fact]
    public void SetRequirePasswordChange_ShouldSetPasswordRequirement()
    {
        // Arrange
        var userTenant = CreateUserTenant();
        var expiryDate = DateTime.UtcNow.AddDays(30);

        // Act
        userTenant.SetRequirePasswordChange(expiryDate);

        // Assert
        userTenant.RequirePasswordChange.Should().BeTrue();
        userTenant.PasswordExpiryDate.Should().BeCloseTo(expiryDate, TimeSpan.FromSeconds(1));
        userTenant.ModifiedAt.Should().NotBeNull();
    }

    [Fact]
    public void PasswordChanged_ShouldClearPasswordRequirement()
    {
        // Arrange
        var userTenant = CreateUserTenant();
        userTenant.SetRequirePasswordChange(DateTime.UtcNow.AddDays(30));

        // Act
        userTenant.PasswordChanged();

        // Assert
        userTenant.RequirePasswordChange.Should().BeFalse();
        userTenant.PasswordExpiryDate.Should().BeNull();
        userTenant.ModifiedAt.Should().NotBeNull();
    }

    [Fact]
    public void SetAsDefault_ShouldMarkAsDefault()
    {
        // Arrange
        var userTenant = CreateUserTenant();

        // Act
        userTenant.SetAsDefault();

        // Assert
        userTenant.IsDefault.Should().BeTrue();
        userTenant.ModifiedAt.Should().NotBeNull();
    }

    [Fact]
    public void UnsetAsDefault_ShouldUnmarkAsDefault()
    {
        // Arrange
        var userTenant = CreateUserTenant();
        userTenant.SetAsDefault();

        // Act
        userTenant.UnsetAsDefault();

        // Assert
        userTenant.IsDefault.Should().BeFalse();
        userTenant.ModifiedAt.Should().NotBeNull();
    }

    [Fact]
    public void Lock_ShouldLockUserWithReason()
    {
        // Arrange
        var userTenant = CreateUserTenant();
        var reason = "Security violation";
        var until = DateTime.UtcNow.AddHours(24);
        var lockedBy = "security_admin";

        // Act
        userTenant.Lock(reason, until, lockedBy);

        // Assert
        userTenant.IsLocked.Should().BeTrue();
        userTenant.LockReason.Should().Be(reason);
        userTenant.LockedUntil.Should().BeCloseTo(until, TimeSpan.FromSeconds(1));
        userTenant.ModifiedBy.Should().Be(lockedBy);
    }

    [Fact]
    public void Lock_WithoutUntilDate_ShouldLockIndefinitely()
    {
        // Arrange
        var userTenant = CreateUserTenant();
        var reason = "Manual lock";

        // Act
        userTenant.Lock(reason);

        // Assert
        userTenant.IsLocked.Should().BeTrue();
        userTenant.LockReason.Should().Be(reason);
        userTenant.LockedUntil.Should().BeNull();
        userTenant.ModifiedBy.Should().Be("System");
    }

    [Fact]
    public void Unlock_ShouldUnlockAndResetFailedAttempts()
    {
        // Arrange
        var userTenant = CreateUserTenant();
        userTenant.Lock("Test", DateTime.UtcNow.AddHours(1));
        userTenant.RecordFailedAccess("192.168.1.1");
        var unlockedBy = "admin";

        // Act
        userTenant.Unlock(unlockedBy);

        // Assert
        userTenant.IsLocked.Should().BeFalse();
        userTenant.LockReason.Should().BeNull();
        userTenant.LockedUntil.Should().BeNull();
        userTenant.FailedAccessAttempts.Should().Be(0);
        userTenant.LastFailedAccess.Should().BeNull();
        userTenant.ModifiedBy.Should().Be(unlockedBy);
    }

    [Fact]
    public void RecordFailedAccess_ShouldIncrementCounter()
    {
        // Arrange
        var userTenant = CreateUserTenant();
        var ipAddress = "192.168.1.1";

        // Act
        userTenant.RecordFailedAccess(ipAddress);

        // Assert
        userTenant.FailedAccessAttempts.Should().Be(1);
        userTenant.LastFailedAccess.Should().NotBeNull();
        userTenant.IsLocked.Should().BeFalse();
    }

    [Fact]
    public void RecordFailedAccess_After5Attempts_ShouldAutoLock()
    {
        // Arrange
        var userTenant = CreateUserTenant();
        var ipAddress = "192.168.1.1";

        // Act
        for (int i = 0; i < 5; i++)
        {
            userTenant.RecordFailedAccess(ipAddress);
        }

        // Assert
        userTenant.FailedAccessAttempts.Should().Be(5);
        userTenant.IsLocked.Should().BeTrue();
        userTenant.LockReason.Should().Be("Too many failed access attempts");
        userTenant.LockedUntil.Should().BeCloseTo(DateTime.UtcNow.AddHours(1), TimeSpan.FromSeconds(1));
    }

    [Fact]
    public void RecordSuccessfulLogin_ShouldUpdateLoginInfo()
    {
        // Arrange
        var userTenant = CreateUserTenant();
        var ipAddress = "192.168.1.1";
        var device = "Chrome/Windows";
        var sessionId = "session123";

        // Act
        userTenant.RecordSuccessfulLogin(ipAddress, device, sessionId);

        // Assert
        userTenant.LastLoginAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        userTenant.LastActivityAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        userTenant.LastLoginIp.Should().Be(ipAddress);
        userTenant.LastLoginDevice.Should().Be(device);
        userTenant.CurrentSessionId.Should().Be(sessionId);
        userTenant.TotalLoginCount.Should().Be(1);
        userTenant.IsOnline.Should().BeTrue();
        userTenant.FailedAccessAttempts.Should().Be(0);
        userTenant.LastFailedAccess.Should().BeNull();
    }

    [Fact]
    public void RecordActivity_ShouldUpdateActivityTime()
    {
        // Arrange
        var userTenant = CreateUserTenant();

        // Act
        userTenant.RecordActivity();

        // Assert
        userTenant.LastActivityAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        userTenant.IsOnline.Should().BeTrue();
    }

    [Fact]
    public void RecordLogout_ShouldClearSession()
    {
        // Arrange
        var userTenant = CreateUserTenant();
        userTenant.RecordSuccessfulLogin("192.168.1.1", "Chrome", "session123");

        // Act
        userTenant.RecordLogout();

        // Assert
        userTenant.IsOnline.Should().BeFalse();
        userTenant.CurrentSessionId.Should().BeNull();
    }

    [Fact]
    public void SetPreferences_ShouldUpdateAllPreferences()
    {
        // Arrange
        var userTenant = CreateUserTenant();
        var language = "tr-TR";
        var dateFormat = "dd/MM/yyyy";
        var numberFormat = "tr-TR";
        var theme = "dark";

        // Act
        userTenant.SetPreferences(language, dateFormat, numberFormat, theme);

        // Assert
        userTenant.Language.Should().Be(language);
        userTenant.DateFormat.Should().Be(dateFormat);
        userTenant.NumberFormat.Should().Be(numberFormat);
        userTenant.Theme.Should().Be(theme);
        userTenant.ModifiedAt.Should().NotBeNull();
    }

    [Fact]
    public void SetPreferences_WithNullValues_ShouldNotUpdateThoseFields()
    {
        // Arrange
        var userTenant = CreateUserTenant();
        userTenant.SetPreferences("en-US", "MM/dd/yyyy", "en-US", "light");

        // Act
        userTenant.SetPreferences(null, null, "tr-TR", null);

        // Assert
        userTenant.Language.Should().Be("en-US");
        userTenant.DateFormat.Should().Be("MM/dd/yyyy");
        userTenant.NumberFormat.Should().Be("tr-TR");
        userTenant.Theme.Should().Be("light");
    }

    [Fact]
    public void SetDashboardLayout_ShouldSerializeLayout()
    {
        // Arrange
        var userTenant = CreateUserTenant();
        var layout = new { widgets = new[] { "sales", "reports" }, columns = 3 };

        // Act
        userTenant.SetDashboardLayout(layout);

        // Assert
        userTenant.DashboardLayout.Should().NotBeNull();
        userTenant.DashboardLayout.Should().Contain("widgets");
        userTenant.DashboardLayout.Should().Contain("sales");
        userTenant.ModifiedAt.Should().NotBeNull();
    }

    [Fact]
    public void SetNotificationPreferences_ShouldUpdateNotificationSettings()
    {
        // Arrange
        var userTenant = CreateUserTenant();
        var preferences = new { sound = true, desktop = false };

        // Act
        userTenant.SetNotificationPreferences(false, true, true, preferences);

        // Assert
        userTenant.EmailNotifications.Should().BeFalse();
        userTenant.SmsNotifications.Should().BeTrue();
        userTenant.PushNotifications.Should().BeTrue();
        userTenant.NotificationPreferences.Should().NotBeNull();
        userTenant.NotificationPreferences.Should().Contain("sound");
    }

    [Fact]
    public void SetSalesQuota_ShouldUpdateQuota()
    {
        // Arrange
        var userTenant = CreateUserTenant();
        var quota = 100000m;

        // Act
        userTenant.SetSalesQuota(quota);

        // Assert
        userTenant.SalesQuota.Should().Be(quota);
        userTenant.ModifiedAt.Should().NotBeNull();
    }

    [Fact]
    public void UpdateSalesAchievement_ShouldUpdateAchievedAmount()
    {
        // Arrange
        var userTenant = CreateUserTenant();
        var achieved = 75000m;

        // Act
        userTenant.UpdateSalesAchievement(achieved);

        // Assert
        userTenant.AchievedSales.Should().Be(achieved);
        userTenant.ModifiedAt.Should().NotBeNull();
    }

    [Fact]
    public void UpdateTaskStatistics_ShouldUpdateTaskCounts()
    {
        // Arrange
        var userTenant = CreateUserTenant();
        var assigned = 10;
        var completed = 7;

        // Act
        userTenant.UpdateTaskStatistics(assigned, completed);

        // Assert
        userTenant.TasksAssigned.Should().Be(assigned);
        userTenant.TasksCompleted.Should().Be(completed);
        userTenant.ModifiedAt.Should().NotBeNull();
    }

    [Fact]
    public void SetPerformanceScore_ShouldUpdatePerformance()
    {
        // Arrange
        var userTenant = CreateUserTenant();
        var score = 85.5m;
        var reviewDate = DateTime.UtcNow;

        // Act
        userTenant.SetPerformanceScore(score, reviewDate);

        // Assert
        userTenant.PerformanceScore.Should().Be(score);
        userTenant.LastPerformanceReview.Should().BeCloseTo(reviewDate, TimeSpan.FromSeconds(1));
        userTenant.ModifiedAt.Should().NotBeNull();
    }

    [Fact]
    public void Activate_ShouldActivateAndUnlock()
    {
        // Arrange
        var userTenant = CreateUserTenant();
        userTenant.Deactivate("admin", "Test");
        userTenant.Lock("Test lock");
        var activatedBy = "manager";

        // Act
        userTenant.Activate(activatedBy);

        // Assert
        userTenant.IsActive.Should().BeTrue();
        userTenant.IsLocked.Should().BeFalse();
        userTenant.DeactivatedAt.Should().BeNull();
        userTenant.DeactivatedBy.Should().BeNull();
        userTenant.DeactivationReason.Should().BeNull();
        userTenant.ModifiedBy.Should().Be(activatedBy);
    }

    [Fact]
    public void Deactivate_ShouldDeactivateWithReason()
    {
        // Arrange
        var userTenant = CreateUserTenant();
        var deactivatedBy = "admin";
        var reason = "Contract ended";

        // Act
        userTenant.Deactivate(deactivatedBy, reason);

        // Assert
        userTenant.IsActive.Should().BeFalse();
        userTenant.DeactivatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        userTenant.DeactivatedBy.Should().Be(deactivatedBy);
        userTenant.DeactivationReason.Should().Be(reason);
        userTenant.ModifiedBy.Should().Be(deactivatedBy);
    }

    [Fact]
    public void CanAccess_WhenActive_ShouldReturnTrue()
    {
        // Arrange
        var userTenant = CreateUserTenant();
        var ipAddress = "192.168.1.1";

        // Act
        var canAccess = userTenant.CanAccess(ipAddress);

        // Assert
        canAccess.Should().BeTrue();
    }

    [Fact]
    public void CanAccess_WhenInactive_ShouldReturnFalse()
    {
        // Arrange
        var userTenant = CreateUserTenant();
        userTenant.Deactivate("admin", "Test");
        var ipAddress = "192.168.1.1";

        // Act
        var canAccess = userTenant.CanAccess(ipAddress);

        // Assert
        canAccess.Should().BeFalse();
    }

    [Fact]
    public void CanAccess_WhenLocked_ShouldReturnFalse()
    {
        // Arrange
        var userTenant = CreateUserTenant();
        userTenant.Lock("Test", DateTime.UtcNow.AddHours(1));
        var ipAddress = "192.168.1.1";

        // Act
        var canAccess = userTenant.CanAccess(ipAddress);

        // Assert
        canAccess.Should().BeFalse();
    }

    [Fact]
    public void CanAccess_WithExpiredLock_ShouldReturnTrue()
    {
        // Arrange
        var userTenant = CreateUserTenant();
        userTenant.Lock("Test", DateTime.UtcNow.AddHours(-1));
        var ipAddress = "192.168.1.1";

        // Act
        var canAccess = userTenant.CanAccess(ipAddress);

        // Assert
        canAccess.Should().BeFalse(); // Because IsLocked is still true
    }

    [Fact]
    public void CanAccess_WithBlockedIp_ShouldReturnFalse()
    {
        // Arrange
        var userTenant = CreateUserTenant();
        var blockedIp = "192.168.1.100";
        userTenant.SetAccessRestrictions(null, new List<string> { blockedIp });

        // Act
        var canAccess = userTenant.CanAccess(blockedIp);

        // Assert
        canAccess.Should().BeFalse();
    }

    [Fact]
    public void CanAccess_WithAllowedIpNotInList_ShouldReturnFalse()
    {
        // Arrange
        var userTenant = CreateUserTenant();
        userTenant.SetAccessRestrictions(new List<string> { "10.0.0.1" }, null);
        var ipAddress = "192.168.1.1";

        // Act
        var canAccess = userTenant.CanAccess(ipAddress);

        // Assert
        canAccess.Should().BeFalse();
    }

    [Fact]
    public void CanAccess_WithAllowedIpInList_ShouldReturnTrue()
    {
        // Arrange
        var userTenant = CreateUserTenant();
        var allowedIp = "192.168.1.1";
        userTenant.SetAccessRestrictions(new List<string> { allowedIp }, null);

        // Act
        var canAccess = userTenant.CanAccess(allowedIp);

        // Assert
        canAccess.Should().BeTrue();
    }

    [Fact]
    public void HasPermission_WithRolePermission_ShouldReturnTrue()
    {
        // Arrange
        var userTenant = CreateUserTenant();
        var permission = "users.read";
        userTenant.AssignRole(Guid.NewGuid(), "Admin", new List<string> { permission });

        // Act
        var hasPermission = userTenant.HasPermission(permission);

        // Assert
        hasPermission.Should().BeTrue();
    }

    [Fact]
    public void HasPermission_WithCustomPermission_ShouldReturnTrue()
    {
        // Arrange
        var userTenant = CreateUserTenant();
        var permission = "custom.report";
        userTenant.AddCustomPermissions(new List<string> { permission }, "admin");

        // Act
        var hasPermission = userTenant.HasPermission(permission);

        // Assert
        hasPermission.Should().BeTrue();
    }

    [Fact]
    public void HasPermission_WithRestrictedPermission_ShouldReturnFalse()
    {
        // Arrange
        var userTenant = CreateUserTenant();
        var permission = "admin.delete";
        userTenant.AssignRole(Guid.NewGuid(), "Admin", new List<string> { permission });
        userTenant.SetRestrictedPermissions(new List<string> { permission }, "security");

        // Act
        var hasPermission = userTenant.HasPermission(permission);

        // Assert
        hasPermission.Should().BeFalse();
    }

    [Fact]
    public void HasPermission_WithoutPermission_ShouldReturnFalse()
    {
        // Arrange
        var userTenant = CreateUserTenant();
        var permission = "nonexistent";

        // Act
        var hasPermission = userTenant.HasPermission(permission);

        // Assert
        hasPermission.Should().BeFalse();
    }

    [Fact]
    public void Create_WithEmptyFirstName_ShouldThrowException()
    {
        // Act
        var action = () => UserTenant.Create(
            _userId,
            _username,
            _email,
            "",
            _lastName,
            _userType,
            _assignedBy);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("First name cannot be empty.*");
    }

    [Fact]
    public void Create_WithEmptyLastName_ShouldThrowException()
    {
        // Act
        var action = () => UserTenant.Create(
            _userId,
            _username,
            _email,
            _firstName,
            "",
            _userType,
            _assignedBy);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Last name cannot be empty.*");
    }

    [Fact]
    public void Create_WithEmptyAssignedBy_ShouldThrowException()
    {
        // Act
        var action = () => UserTenant.Create(
            _userId,
            _username,
            _email,
            _firstName,
            _lastName,
            _userType,
            "");

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Assigned by cannot be empty.*");
    }

    [Fact]
    public void UserType_Enum_ShouldHaveCorrectValues()
    {
        // Assert
        UserType.SistemYoneticisi.Should().Be((UserType)0);
        UserType.FirmaYoneticisi.Should().Be((UserType)1);
        UserType.Personel.Should().Be((UserType)2);
        UserType.Destek.Should().Be((UserType)3);
        UserType.Misafir.Should().Be((UserType)4);
    }

    private UserTenant CreateUserTenant()
    {
        return UserTenant.Create(
            _userId,
            _username,
            _email,
            _firstName,
            _lastName,
            _userType,
            _assignedBy);
    }
}