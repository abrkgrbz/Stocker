using Microsoft.EntityFrameworkCore;
using Stocker.Application.DTOs.Tenant.Users;
using Stocker.Domain.Tenant.Entities;
using Stocker.Domain.Master.Entities;
using Stocker.Domain.Tenant.Enums;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Persistence.Contexts;
using Stocker.Persistence.Repositories;
using FluentAssertions;
using Xunit;
using Moq;
using MockQueryable.Moq;
using System.Linq.Expressions;
using UserType = Stocker.Domain.Master.Enums.UserType;

namespace Stocker.UnitTests.Infrastructure.Persistence.Repositories;

// TODO: Refactor to use In-Memory Database instead of Mocking DbContext
// Issue: TenantDbContext properties are not virtual, cannot be mocked
[Trait("Category", "Skipped")]
public class UserRepositoryTests
{
    private readonly UserRepository _repository;
    private readonly Mock<TenantDbContext> _tenantContextMock;
    private readonly Mock<MasterDbContext> _masterContextMock;

    // DbSet mocks for TenantDbContext
    private readonly Mock<DbSet<TenantUser>> _tenantUsersDbSetMock;
    private readonly Mock<DbSet<Role>> _rolesDbSetMock;
    private readonly Mock<DbSet<UserRole>> _userRolesDbSetMock;
    private readonly Mock<DbSet<UserPermission>> _userPermissionsDbSetMock;
    private readonly Mock<DbSet<Department>> _departmentsDbSetMock;
    private readonly Mock<DbSet<Branch>> _branchesDbSetMock;
    private readonly Mock<DbSet<RolePermission>> _rolePermissionsDbSetMock;

    // DbSet mocks for MasterDbContext
    private readonly Mock<DbSet<MasterUser>> _masterUsersDbSetMock;
    private readonly Mock<DbSet<Tenant>> _tenantsDbSetMock;

    public UserRepositoryTests()
    {
        // Create DbContext mocks
        _tenantContextMock = new Mock<TenantDbContext>(new DbContextOptions<TenantDbContext>());
        _masterContextMock = new Mock<MasterDbContext>(new DbContextOptions<MasterDbContext>());

        // Create DbSet mocks
        _tenantUsersDbSetMock = new Mock<DbSet<TenantUser>>();
        _rolesDbSetMock = new Mock<DbSet<Role>>();
        _userRolesDbSetMock = new Mock<DbSet<UserRole>>();
        _userPermissionsDbSetMock = new Mock<DbSet<UserPermission>>();
        _departmentsDbSetMock = new Mock<DbSet<Department>>();
        _branchesDbSetMock = new Mock<DbSet<Branch>>();
        _rolePermissionsDbSetMock = new Mock<DbSet<RolePermission>>();
        _masterUsersDbSetMock = new Mock<DbSet<MasterUser>>();
        _tenantsDbSetMock = new Mock<DbSet<Tenant>>();

        // Setup context properties
        _tenantContextMock.Setup(x => x.TenantUsers).Returns(_tenantUsersDbSetMock.Object);
        _tenantContextMock.Setup(x => x.Roles).Returns(_rolesDbSetMock.Object);
        _tenantContextMock.Setup(x => x.UserRoles).Returns(_userRolesDbSetMock.Object);
        _tenantContextMock.Setup(x => x.UserPermissions).Returns(_userPermissionsDbSetMock.Object);
        _tenantContextMock.Setup(x => x.Departments).Returns(_departmentsDbSetMock.Object);
        _tenantContextMock.Setup(x => x.Branches).Returns(_branchesDbSetMock.Object);
        _tenantContextMock.Setup(x => x.RolePermissions).Returns(_rolePermissionsDbSetMock.Object);

        _masterContextMock.Setup(x => x.MasterUsers).Returns(_masterUsersDbSetMock.Object);
        _masterContextMock.Setup(x => x.Tenants).Returns(_tenantsDbSetMock.Object);

        _repository = new UserRepository(_tenantContextMock.Object, _masterContextMock.Object);
    }

    #region GetTenantUsersAsync Tests

    [Fact]
    public async Task GetTenantUsersAsync_Should_Return_Paginated_Users()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var userId1 = Guid.NewGuid();
        var userId2 = Guid.NewGuid();

        var email1 = Email.Create("user1@test.com").Value;
        var email2 = Email.Create("user2@test.com").Value;

        var user1 = TenantUser.Create(tenantId, Guid.NewGuid(), "user1", email1, "First1", "Last1");
        var user2 = TenantUser.Create(tenantId, Guid.NewGuid(), "user2", email2, "First2", "Last2");

        // Use reflection to set Ids
        typeof(TenantUser).GetProperty("Id")!.SetValue(user1, userId1);
        typeof(TenantUser).GetProperty("Id")!.SetValue(user2, userId2);

        var users = new List<TenantUser> { user1, user2 }.AsQueryable();

        SetupDbSet(_tenantUsersDbSetMock, users);
        SetupDbSet(_userRolesDbSetMock, new List<UserRole>().AsQueryable());
        SetupDbSet(_departmentsDbSetMock, new List<Department>().AsQueryable());
        SetupDbSet(_branchesDbSetMock, new List<Branch>().AsQueryable());

        // Act
        var result = await _repository.GetTenantUsersAsync(tenantId, 1, 10);

        // Assert
        result.Should().NotBeNull();
        result.Items.Should().HaveCount(2);
        result.TotalItems.Should().Be(2);
        result.Page.Should().Be(1);
        result.PageSize.Should().Be(10);
        result.TotalPages.Should().Be(1);
    }

    [Fact]
    public async Task GetTenantUsersAsync_Should_Filter_By_SearchTerm()
    {
        // Arrange
        var tenantId = Guid.NewGuid();

        var email1 = Email.Create("john@test.com").Value;
        var email2 = Email.Create("jane@test.com").Value;

        var user1 = TenantUser.Create(tenantId, Guid.NewGuid(), "john", email1, "John", "Doe");
        var user2 = TenantUser.Create(tenantId, Guid.NewGuid(), "jane", email2, "Jane", "Smith");

        var users = new List<TenantUser> { user1, user2 }.AsQueryable();

        SetupDbSet(_tenantUsersDbSetMock, users);
        SetupDbSet(_userRolesDbSetMock, new List<UserRole>().AsQueryable());
        SetupDbSet(_departmentsDbSetMock, new List<Department>().AsQueryable());
        SetupDbSet(_branchesDbSetMock, new List<Branch>().AsQueryable());

        // Act
        var result = await _repository.GetTenantUsersAsync(tenantId, 1, 10, "John");

        // Assert
        result.Should().NotBeNull();
        result.Items.Should().HaveCount(1);
        result.Items[0].Username.Should().Be("john");
    }

    [Fact]
    public async Task GetTenantUsersAsync_Should_Include_Role_Information()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var roleId = Guid.NewGuid();

        var email = Email.Create("user@test.com").Value;
        var user = TenantUser.Create(tenantId, Guid.NewGuid(), "user", email, "First", "Last");
        typeof(TenantUser).GetProperty("Id")!.SetValue(user, userId);

        var role = Role.Create("Admin", "Administrator role");
        typeof(Role).GetProperty("Id")!.SetValue(role, roleId);

        var userRole = new UserRole(userId, roleId);

        var users = new List<TenantUser> { user }.AsQueryable();
        var roles = new List<Role> { role }.AsQueryable();
        var userRoles = new List<UserRole> { userRole }.AsQueryable();

        SetupDbSet(_tenantUsersDbSetMock, users);
        SetupDbSet(_rolesDbSetMock, roles);
        SetupDbSet(_userRolesDbSetMock, userRoles);
        SetupDbSet(_departmentsDbSetMock, new List<Department>().AsQueryable());
        SetupDbSet(_branchesDbSetMock, new List<Branch>().AsQueryable());

        // Act
        var result = await _repository.GetTenantUsersAsync(tenantId, 1, 10);

        // Assert
        result.Should().NotBeNull();
        result.Items.Should().HaveCount(1);
        result.Items[0].Role.Should().Be("Admin");
    }

    #endregion

    #region GetTenantUserByIdAsync Tests

    [Fact]
    public async Task GetTenantUserByIdAsync_Should_Return_User_Detail()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        var email = Email.Create("user@test.com").Value;
        var phone = PhoneNumber.Create("+90 555 123 4567").Value;
        var user = TenantUser.Create(tenantId, Guid.NewGuid(), "user", email, "First", "Last", null, phone);
        typeof(TenantUser).GetProperty("Id")!.SetValue(user, userId);
        typeof(TenantUser).GetProperty("Title")!.SetValue(user, "Developer");

        var users = new List<TenantUser> { user }.AsQueryable();

        SetupDbSet(_tenantUsersDbSetMock, users);
        SetupDbSet(_userRolesDbSetMock, new List<UserRole>().AsQueryable());
        SetupDbSet(_userPermissionsDbSetMock, new List<UserPermission>().AsQueryable());
        SetupDbSet(_departmentsDbSetMock, new List<Department>().AsQueryable());
        SetupDbSet(_branchesDbSetMock, new List<Branch>().AsQueryable());
        SetupDbSet(_rolePermissionsDbSetMock, new List<RolePermission>().AsQueryable());

        // Act
        var result = await _repository.GetTenantUserByIdAsync(tenantId, userId);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(userId);
        result.Username.Should().Be("user");
        result.Email.Should().Be("user@test.com");
        result.FirstName.Should().Be("First");
        result.LastName.Should().Be("Last");
        result.PhoneNumber.Should().Be("+90 555 123 4567");
        result.Title.Should().Be("Developer");
    }

    [Fact]
    public async Task GetTenantUserByIdAsync_Should_Return_Null_When_User_Not_Found()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        var users = new List<TenantUser>().AsQueryable();
        SetupDbSet(_tenantUsersDbSetMock, users);

        // Act
        var result = await _repository.GetTenantUserByIdAsync(tenantId, userId);

        // Assert
        result.Should().BeNull();
    }

    #endregion

    #region CreateTenantUserAsync Tests

    [Fact]
    public async Task CreateTenantUserAsync_Should_Add_User_To_Database()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var email = Email.Create("newuser@test.com").Value;
        var user = TenantUser.Create(tenantId, Guid.NewGuid(), "newuser", email, "New", "User");

        _tenantContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        var result = await _repository.CreateTenantUserAsync(user);

        // Assert
        result.Should().NotBeNull();
        result.Should().BeSameAs(user);
        _tenantUsersDbSetMock.Verify(x => x.Add(It.Is<TenantUser>(u => u == user)), Times.Once);
        _tenantContextMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    #endregion

    #region UpdateTenantUserAsync Tests

    [Fact]
    public async Task UpdateTenantUserAsync_Should_Update_Existing_User()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        var email = Email.Create("user@test.com").Value;
        var existingUser = TenantUser.Create(tenantId, Guid.NewGuid(), "user", email, "First", "Last");
        typeof(TenantUser).GetProperty("Id")!.SetValue(existingUser, userId);

        var updatedEmail = Email.Create("updated@test.com").Value;
        var updatedUser = TenantUser.Create(tenantId, Guid.NewGuid(), "updateduser", updatedEmail, "UpdatedFirst", "UpdatedLast");

        var users = new List<TenantUser> { existingUser }.AsQueryable();
        SetupDbSet(_tenantUsersDbSetMock, users);

        _tenantContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        var result = await _repository.UpdateTenantUserAsync(tenantId, userId, updatedUser);

        // Assert
        result.Should().NotBeNull();
        result!.FirstName.Should().Be("UpdatedFirst");
        result.LastName.Should().Be("UpdatedLast");
        _tenantContextMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task UpdateTenantUserAsync_Should_Return_Null_When_User_Not_Found()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        var email = Email.Create("updated@test.com").Value;
        var updatedUser = TenantUser.Create(tenantId, Guid.NewGuid(), "updateduser", email, "UpdatedFirst", "UpdatedLast");

        var users = new List<TenantUser>().AsQueryable();
        SetupDbSet(_tenantUsersDbSetMock, users);

        // Act
        var result = await _repository.UpdateTenantUserAsync(tenantId, userId, updatedUser);

        // Assert
        result.Should().BeNull();
        _tenantContextMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    #endregion

    #region DeleteTenantUserAsync Tests

    [Fact]
    public async Task DeleteTenantUserAsync_Should_Deactivate_User()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        var email = Email.Create("user@test.com").Value;
        var user = TenantUser.Create(tenantId, Guid.NewGuid(), "user", email, "First", "Last");
        typeof(TenantUser).GetProperty("Id")!.SetValue(user, userId);
        user.Activate(); // Make sure user is active first

        var users = new List<TenantUser> { user }.AsQueryable();
        SetupDbSet(_tenantUsersDbSetMock, users);

        _tenantContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        var result = await _repository.DeleteTenantUserAsync(tenantId, userId);

        // Assert
        result.Should().BeTrue();
        user.Status.Should().Be(TenantUserStatus.Inactive);
        _tenantContextMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task DeleteTenantUserAsync_Should_Return_False_When_User_Not_Found()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        var users = new List<TenantUser>().AsQueryable();
        SetupDbSet(_tenantUsersDbSetMock, users);

        // Act
        var result = await _repository.DeleteTenantUserAsync(tenantId, userId);

        // Assert
        result.Should().BeFalse();
        _tenantContextMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    #endregion

    #region ToggleUserStatusAsync Tests

    [Fact]
    public async Task ToggleUserStatusAsync_Should_Activate_Inactive_User()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        var email = Email.Create("user@test.com").Value;
        var user = TenantUser.Create(tenantId, Guid.NewGuid(), "user", email, "First", "Last");
        typeof(TenantUser).GetProperty("Id")!.SetValue(user, userId);
        user.Deactivate(); // Make user inactive

        var users = new List<TenantUser> { user }.AsQueryable();
        SetupDbSet(_tenantUsersDbSetMock, users);

        _tenantContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        var result = await _repository.ToggleUserStatusAsync(tenantId, userId);

        // Assert
        result.Should().BeTrue();
        user.Status.Should().Be(TenantUserStatus.Active);
        _tenantContextMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task ToggleUserStatusAsync_Should_Deactivate_Active_User()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        var email = Email.Create("user@test.com").Value;
        var user = TenantUser.Create(tenantId, Guid.NewGuid(), "user", email, "First", "Last");
        typeof(TenantUser).GetProperty("Id")!.SetValue(user, userId);
        user.Activate(); // Make user active

        var users = new List<TenantUser> { user }.AsQueryable();
        SetupDbSet(_tenantUsersDbSetMock, users);

        _tenantContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        var result = await _repository.ToggleUserStatusAsync(tenantId, userId);

        // Assert
        result.Should().BeTrue();
        user.Status.Should().Be(TenantUserStatus.Inactive);
        _tenantContextMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    #endregion

    #region GetRolesAsync Tests

    [Fact]
    public async Task GetRolesAsync_Should_Return_All_Roles()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var roleId1 = Guid.NewGuid();
        var roleId2 = Guid.NewGuid();

        var role1 = Role.Create("Admin", "Administrator role");
        var role2 = Role.Create("User", "Regular user role");

        typeof(Role).GetProperty("Id")!.SetValue(role1, roleId1);
        typeof(Role).GetProperty("Id")!.SetValue(role2, roleId2);

        var roles = new List<Role> { role1, role2 }.AsQueryable();
        var rolePermissions = new List<RolePermission>().AsQueryable();

        SetupDbSet(_rolesDbSetMock, roles);
        SetupDbSet(_rolePermissionsDbSetMock, rolePermissions);

        // Act
        var result = await _repository.GetRolesAsync(tenantId);

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(2);
        result[0].Name.Should().Be("Admin");
        result[1].Name.Should().Be("User");
    }

    #endregion

    #region AssignRoleAsync Tests

    [Fact]
    public async Task AssignRoleAsync_Should_Assign_Role_To_User()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var roleId = Guid.NewGuid();

        var email = Email.Create("user@test.com").Value;
        var user = TenantUser.Create(tenantId, Guid.NewGuid(), "user", email, "First", "Last");
        typeof(TenantUser).GetProperty("Id")!.SetValue(user, userId);

        var role = Role.Create("Admin", "Administrator role");
        typeof(Role).GetProperty("Id")!.SetValue(role, roleId);

        var users = new List<TenantUser> { user }.AsQueryable();
        var roles = new List<Role> { role }.AsQueryable();
        var existingUserRoles = new List<UserRole>().AsQueryable();

        SetupDbSet(_tenantUsersDbSetMock, users);
        SetupDbSet(_rolesDbSetMock, roles);
        SetupDbSet(_userRolesDbSetMock, existingUserRoles);

        _tenantContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        var result = await _repository.AssignRoleAsync(tenantId, userId, roleId);

        // Assert
        result.Should().BeTrue();
        _userRolesDbSetMock.Verify(x => x.Add(It.IsAny<UserRole>()), Times.Once);
        _tenantContextMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task AssignRoleAsync_Should_Return_False_When_User_Not_Found()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var roleId = Guid.NewGuid();

        var users = new List<TenantUser>().AsQueryable();
        SetupDbSet(_tenantUsersDbSetMock, users);

        // Act
        var result = await _repository.AssignRoleAsync(tenantId, userId, roleId);

        // Assert
        result.Should().BeFalse();
        _tenantContextMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    #endregion

    #region Helper Methods

    private static void SetupDbSet<T>(Mock<DbSet<T>> mockDbSet, IQueryable<T> data) where T : class
    {
        // MockQueryable.Moq kütüphanesi kullanarak DbSet mock'u setup et
        var mock = data.BuildMockDbSet();
        var queryable = mock.Object.AsQueryable();

        mockDbSet.As<IQueryable<T>>().Setup(m => m.Provider).Returns(queryable.Provider);
        mockDbSet.As<IQueryable<T>>().Setup(m => m.Expression).Returns(queryable.Expression);
        mockDbSet.As<IQueryable<T>>().Setup(m => m.ElementType).Returns(queryable.ElementType);
        mockDbSet.As<IQueryable<T>>().Setup(m => m.GetEnumerator()).Returns(() => queryable.GetEnumerator());

        mockDbSet.As<IAsyncEnumerable<T>>()
            .Setup(m => m.GetAsyncEnumerator(It.IsAny<CancellationToken>()))
            .Returns((CancellationToken ct) => mock.Object.AsAsyncEnumerable().GetAsyncEnumerator(ct));
    }

    #endregion
}