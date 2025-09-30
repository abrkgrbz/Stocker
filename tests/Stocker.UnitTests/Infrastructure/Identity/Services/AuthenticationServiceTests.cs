using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.Domain.Master.Entities;
using Stocker.Domain.Master.Enums;
using Stocker.Domain.Master.ValueObjects;
using HashedPassword = Stocker.Domain.Master.ValueObjects.HashedPassword;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Identity.Models;
using Stocker.Identity.Services;
using Stocker.SharedKernel.Interfaces;
using FluentAssertions;
using Xunit;
using Moq;
using MockQueryable.Moq;
using System.Security.Claims;
using IPasswordService = Stocker.Identity.Services.IPasswordService;

namespace Stocker.UnitTests.Infrastructure.Identity.Services;

public class AuthenticationServiceTests
{
    private readonly AuthenticationService _authenticationService;
    private readonly Mock<IMasterDbContext> _masterContextMock;
    private readonly Mock<ITenantDbContextFactory> _tenantDbContextFactoryMock;
    private readonly Mock<IJwtTokenService> _jwtTokenServiceMock;
    private readonly Mock<IPasswordHasher> _passwordHasherMock;
    private readonly Mock<IPasswordService> _passwordServiceMock;
    private readonly Mock<ITenantService> _tenantServiceMock;
    private readonly Mock<ILogger<AuthenticationService>> _loggerMock;

    public AuthenticationServiceTests()
    {
        _masterContextMock = new Mock<IMasterDbContext>();
        _tenantDbContextFactoryMock = new Mock<ITenantDbContextFactory>();
        _jwtTokenServiceMock = new Mock<IJwtTokenService>();
        _passwordHasherMock = new Mock<IPasswordHasher>();
        _passwordServiceMock = new Mock<IPasswordService>();
        _tenantServiceMock = new Mock<ITenantService>();
        _loggerMock = new Mock<ILogger<AuthenticationService>>();

        _authenticationService = new AuthenticationService(
            _masterContextMock.Object,
            _tenantDbContextFactoryMock.Object,
            _jwtTokenServiceMock.Object,
            _passwordHasherMock.Object,
            _passwordServiceMock.Object,
            _tenantServiceMock.Object,
            _loggerMock.Object
        );
    }

    #region LoginAsync Tests

    [Fact]
    public async Task LoginAsync_Should_Return_Failure_When_User_Not_Found()
    {
        // Arrange
        var loginRequest = new LoginRequest
        {
            Username = "nonexistent",
            Password = "password123"
        };

        var emptyUserList = new List<MasterUser>().AsQueryable();
        var mockDbSet = new Mock<DbSet<MasterUser>>();
        SetupDbSet(mockDbSet, emptyUserList);
        _masterContextMock.Setup(x => x.MasterUsers).Returns(mockDbSet.Object);

        // Act
        var result = await _authenticationService.LoginAsync(loginRequest);

        // Assert
        result.Success.Should().BeFalse();
        result.Errors.Should().Contain("Invalid username or password");
    }

    [Fact]
    public async Task LoginAsync_Should_Return_Failure_When_Password_Is_Invalid()
    {
        // Arrange
        var loginRequest = new LoginRequest
        {
            Username = "testuser",
            Password = "wrongpassword"
        };

        var email = Email.Create("test@test.com").Value;
        var phone = PhoneNumber.Create("+90 555 123 4567").Value;

        var masterUser = MasterUser.Create(
            "testuser",
            email,
            "TestPassword123!",
            "Test",
            "User",
            UserType.FirmaYoneticisi,
            phone
        );

        var userList = new List<MasterUser> { masterUser }.AsQueryable();
        var mockDbSet = new Mock<DbSet<MasterUser>>();
        SetupDbSet(mockDbSet, userList);
        _masterContextMock.Setup(x => x.MasterUsers).Returns(mockDbSet.Object);

        _passwordServiceMock.Setup(x => x.VerifyPassword(It.IsAny<HashedPassword>(), It.IsAny<string>()))
            .Returns(false);

        // Act
        var result = await _authenticationService.LoginAsync(loginRequest);

        // Assert
        result.Success.Should().BeFalse();
        result.Errors.Should().Contain("Invalid username or password");
    }

    [Fact]
    public async Task LoginAsync_Should_Return_Success_With_Tokens_When_Credentials_Are_Valid()
    {
        // Arrange
        var loginRequest = new LoginRequest
        {
            Username = "testuser",
            Password = "correctpassword"
        };

        var email = Email.Create("test@test.com").Value;
        var phone = PhoneNumber.Create("+90 555 123 4567").Value;

        var masterUser = MasterUser.Create(
            "testuser",
            email,
            "TestPassword123!",
            "Test",
            "User",
            UserType.FirmaYoneticisi,
            phone
        );

        var userList = new List<MasterUser> { masterUser }.AsQueryable();
        var mockDbSet = new Mock<DbSet<MasterUser>>();
        SetupDbSet(mockDbSet, userList);
        _masterContextMock.Setup(x => x.MasterUsers).Returns(mockDbSet.Object);

        _passwordServiceMock.Setup(x => x.VerifyPassword(It.IsAny<HashedPassword>(), It.IsAny<string>()))
            .Returns(true);

        _jwtTokenServiceMock.Setup(x => x.GenerateAccessToken(It.IsAny<List<Claim>>()))
            .Returns("access_token");

        _jwtTokenServiceMock.Setup(x => x.GenerateRefreshToken())
            .Returns("refresh_token");

        _jwtTokenServiceMock.Setup(x => x.GetRefreshTokenExpiration())
            .Returns(DateTime.UtcNow.AddDays(7));

        _masterContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        var result = await _authenticationService.LoginAsync(loginRequest);

        // Assert
        result.Success.Should().BeTrue();
        result.AccessToken.Should().NotBeNullOrEmpty();
        result.RefreshToken.Should().NotBeNullOrEmpty();
        result.User.Should().NotBeNull();
        result.User!.Username.Should().Be("testuser");
    }

    #endregion

    #region RefreshTokenAsync Tests

    [Fact]
    public async Task RefreshTokenAsync_Should_Return_Failure_When_Token_Is_Invalid()
    {
        // Arrange
        var refreshRequest = new RefreshTokenRequest
        {
            AccessToken = "invalid_token",
            RefreshToken = "invalid_refresh"
        };

        _jwtTokenServiceMock.Setup(x => x.ValidateToken(It.IsAny<string>()))
            .Returns((ClaimsPrincipal)null!);

        // Act
        var result = await _authenticationService.RefreshTokenAsync(refreshRequest);

        // Assert
        result.Success.Should().BeFalse();
        result.Errors.Should().Contain("Invalid access token");
    }

    [Fact]
    public async Task RefreshTokenAsync_Should_Return_Failure_When_Refresh_Token_Not_Found()
    {
        // Arrange
        var refreshRequest = new RefreshTokenRequest
        {
            AccessToken = "valid_access_token",
            RefreshToken = "nonexistent_refresh_token"
        };

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, Guid.NewGuid().ToString()),
            new Claim(ClaimTypes.Name, "testuser")
        };
        var principal = new ClaimsPrincipal(new ClaimsIdentity(claims));

        _jwtTokenServiceMock.Setup(x => x.ValidateToken(It.IsAny<string>()))
            .Returns(principal);

        var emptyUserList = new List<MasterUser>().AsQueryable();
        var mockDbSet = new Mock<DbSet<MasterUser>>();
        SetupDbSet(mockDbSet, emptyUserList);
        _masterContextMock.Setup(x => x.MasterUsers).Returns(mockDbSet.Object);

        // Act
        var result = await _authenticationService.RefreshTokenAsync(refreshRequest);

        // Assert
        result.Success.Should().BeFalse();
        result.Errors.Should().Contain("Invalid access token");
    }

    #endregion

    #region RegisterMasterUserAsync Tests

    [Fact]
    public async Task RegisterMasterUserAsync_Should_Return_Failure_When_Username_Already_Exists()
    {
        // Arrange
        var registerRequest = new RegisterRequest
        {
            Username = "existinguser",
            Email = "new@test.com",
            Password = "Password123!",
            FirstName = "New",
            LastName = "User"
        };

        var existingUser = MasterUser.Create(
            "existinguser",
            Email.Create("existing@test.com").Value,
            "Password123!",
            "Existing",
            "User",
            UserType.FirmaYoneticisi,
            null
        );

        var userList = new List<MasterUser> { existingUser }.AsQueryable();
        var mockDbSet = new Mock<DbSet<MasterUser>>();
        SetupDbSet(mockDbSet, userList);
        _masterContextMock.Setup(x => x.MasterUsers).Returns(mockDbSet.Object);

        // Act
        var result = await _authenticationService.RegisterMasterUserAsync(registerRequest);

        // Assert
        result.Success.Should().BeFalse();
        result.Errors.Should().Contain(error => error.Contains("Username") || error.Contains("already exists"));
    }

    [Fact]
    public async Task RegisterMasterUserAsync_Should_Return_Success_When_Registration_Is_Valid()
    {
        // Arrange
        var registerRequest = new RegisterRequest
        {
            Username = "newuser",
            Email = "new@test.com",
            Password = "Password123!",
            FirstName = "New",
            LastName = "User",
            PhoneNumber = "+90 555 999 8877"
        };

        var emptyUserList = new List<MasterUser>().AsQueryable();
        var mockDbSet = new Mock<DbSet<MasterUser>>();
        SetupDbSet(mockDbSet, emptyUserList);
        _masterContextMock.Setup(x => x.MasterUsers).Returns(mockDbSet.Object);

        _passwordHasherMock.Setup(x => x.HashPassword(It.IsAny<string>()))
            .Returns("hashed_password");

        _masterContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        _jwtTokenServiceMock.Setup(x => x.GenerateAccessToken(It.IsAny<List<Claim>>()))
            .Returns("access_token");

        _jwtTokenServiceMock.Setup(x => x.GenerateRefreshToken())
            .Returns("refresh_token");

        _jwtTokenServiceMock.Setup(x => x.GetRefreshTokenExpiration())
            .Returns(DateTime.UtcNow.AddDays(7));

        // Act
        var result = await _authenticationService.RegisterMasterUserAsync(registerRequest);

        // Assert
        result.Success.Should().BeTrue();
        result.AccessToken.Should().NotBeNullOrEmpty();
        result.User.Should().NotBeNull();
        result.User!.Username.Should().Be("newuser");
        result.User.Email.Should().Be("new@test.com");
    }

    #endregion

    #region ChangePasswordAsync Tests

    [Fact]
    public async Task ChangePasswordAsync_Should_Return_False_When_User_Not_Found()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var changeRequest = new ChangePasswordRequest
        {
            CurrentPassword = "oldpassword",
            NewPassword = "newpassword"
        };

        var emptyUserList = new List<MasterUser>().AsQueryable();
        var mockDbSet = new Mock<DbSet<MasterUser>>();
        SetupDbSet(mockDbSet, emptyUserList);
        _masterContextMock.Setup(x => x.MasterUsers).Returns(mockDbSet.Object);

        // Act
        var result = await _authenticationService.ChangePasswordAsync(userId, changeRequest);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task ChangePasswordAsync_Should_Return_False_When_Current_Password_Is_Invalid()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var changeRequest = new ChangePasswordRequest
        {
            CurrentPassword = "wrongpassword",
            NewPassword = "newpassword"
        };

        var masterUser = MasterUser.Create(
            "testuser",
            Email.Create("test@test.com").Value,
            "TestPassword123!",
            "Test",
            "User",
            UserType.FirmaYoneticisi,
            null
        );

        // Use reflection to set the Id since it's protected
        var idProperty = typeof(MasterUser).BaseType!.GetProperty("Id");
        idProperty!.SetValue(masterUser, userId);

        var userList = new List<MasterUser> { masterUser }.AsQueryable();
        var mockDbSet = new Mock<DbSet<MasterUser>>();
        SetupDbSet(mockDbSet, userList);
        _masterContextMock.Setup(x => x.MasterUsers).Returns(mockDbSet.Object);

        _passwordServiceMock.Setup(x => x.VerifyPassword(It.IsAny<HashedPassword>(), It.IsAny<string>()))
            .Returns(false);

        // Act
        var result = await _authenticationService.ChangePasswordAsync(userId, changeRequest);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task ChangePasswordAsync_Should_Return_True_When_Password_Change_Is_Valid()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var changeRequest = new ChangePasswordRequest
        {
            CurrentPassword = "correctpassword",
            NewPassword = "newpassword123"
        };

        var masterUser = MasterUser.Create(
            "testuser",
            Email.Create("test@test.com").Value,
            "TestPassword123!",
            "Test",
            "User",
            UserType.FirmaYoneticisi,
            null
        );

        // Use reflection to set the Id
        var idProperty = typeof(MasterUser).BaseType!.GetProperty("Id");
        idProperty!.SetValue(masterUser, userId);

        var userList = new List<MasterUser> { masterUser }.AsQueryable();
        var mockDbSet = new Mock<DbSet<MasterUser>>();
        SetupDbSet(mockDbSet, userList);
        _masterContextMock.Setup(x => x.MasterUsers).Returns(mockDbSet.Object);

        _passwordServiceMock.Setup(x => x.VerifyPassword(It.IsAny<HashedPassword>(), It.IsAny<string>()))
            .Returns(true);

        _passwordHasherMock.Setup(x => x.HashPassword(It.IsAny<string>()))
            .Returns("new_hashed_password");

        _masterContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        var result = await _authenticationService.ChangePasswordAsync(userId, changeRequest);

        // Assert
        result.Should().BeTrue();
    }

    #endregion

    #region RevokeRefreshTokenAsync Tests

    [Fact]
    public async Task RevokeRefreshTokenAsync_Should_Return_False_When_User_Not_Found()
    {
        // Arrange
        var userId = Guid.NewGuid();

        var emptyUserList = new List<MasterUser>().AsQueryable();
        var mockDbSet = new Mock<DbSet<MasterUser>>();
        SetupDbSet(mockDbSet, emptyUserList);
        _masterContextMock.Setup(x => x.MasterUsers).Returns(mockDbSet.Object);

        // Act
        var result = await _authenticationService.RevokeRefreshTokenAsync(userId);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task RevokeRefreshTokenAsync_Should_Return_True_When_Tokens_Are_Revoked()
    {
        // Arrange
        var userId = Guid.NewGuid();

        var masterUser = MasterUser.Create(
            "testuser",
            Email.Create("test@test.com").Value,
            "TestPassword123!",
            "Test",
            "User",
            UserType.FirmaYoneticisi,
            null
        );

        // Use reflection to set the Id
        var idProperty = typeof(MasterUser).BaseType!.GetProperty("Id");
        idProperty!.SetValue(masterUser, userId);

        // Add a refresh token
        masterUser.SetRefreshToken("refresh_token", DateTime.UtcNow.AddDays(7));

        var userList = new List<MasterUser> { masterUser }.AsQueryable();
        var mockDbSet = new Mock<DbSet<MasterUser>>();
        SetupDbSet(mockDbSet, userList);
        _masterContextMock.Setup(x => x.MasterUsers).Returns(mockDbSet.Object);

        _masterContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        var result = await _authenticationService.RevokeRefreshTokenAsync(userId);

        // Assert
        result.Should().BeTrue();
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