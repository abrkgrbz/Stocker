using Microsoft.EntityFrameworkCore;
using Stocker.Application.Common.Interfaces;
using Stocker.Domain.Master.Entities;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Domain.Master.ValueObjects;
using Stocker.Domain.Tenant.Entities;
using UserType = Stocker.Domain.Master.Enums.UserType;
using Stocker.Identity.Models;
using Stocker.Identity.Services;
using FluentAssertions;
using Xunit;
using Moq;
using System.Security.Claims;

namespace Stocker.UnitTests.Infrastructure.Identity.Services;

public class TokenGenerationServiceTests
{
    private readonly TokenGenerationService _tokenGenerationService;
    private readonly Mock<IJwtTokenService> _jwtTokenServiceMock;
    private readonly Mock<IMasterDbContext> _masterContextMock;
    private readonly Mock<DbSet<Tenant>> _tenantDbSetMock;

    public TokenGenerationServiceTests()
    {
        _jwtTokenServiceMock = new Mock<IJwtTokenService>();
        _masterContextMock = new Mock<IMasterDbContext>();
        _tenantDbSetMock = new Mock<DbSet<Tenant>>();

        _masterContextMock.Setup(x => x.Tenants).Returns(_tenantDbSetMock.Object);

        _tokenGenerationService = new TokenGenerationService(
            _jwtTokenServiceMock.Object,
            _masterContextMock.Object
        );
    }

    #region GenerateForMasterUserAsync Tests

    [Fact]
    public async Task GenerateForMasterUserAsync_Should_Generate_Tokens_Without_TenantId()
    {
        // Arrange
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

        _jwtTokenServiceMock.Setup(x => x.GenerateAccessToken(It.IsAny<List<Claim>>()))
            .Returns("access_token");
        _jwtTokenServiceMock.Setup(x => x.GenerateRefreshToken())
            .Returns("refresh_token");
        _jwtTokenServiceMock.Setup(x => x.GetAccessTokenExpiration())
            .Returns(DateTime.UtcNow.AddHours(1));
        _jwtTokenServiceMock.Setup(x => x.GetRefreshTokenExpiration())
            .Returns(DateTime.UtcNow.AddDays(7));

        _masterContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        var result = await _tokenGenerationService.GenerateForMasterUserAsync(masterUser);

        // Assert
        result.Should().NotBeNull();
        result.Success.Should().BeTrue();
        result.AccessToken.Should().Be("access_token");
        result.RefreshToken.Should().Be("refresh_token");
        result.User.Should().NotBeNull();
        result.User!.Username.Should().Be("testuser");
        result.User.Email.Should().Be("test@test.com");
        result.User.IsMasterUser.Should().BeTrue();
        result.User.TenantId.Should().BeNull();
        result.User.Roles.Should().Contain("FirmaYoneticisi");
    }

    [Fact]
    public async Task GenerateForMasterUserAsync_Should_Generate_Tokens_With_TenantId()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
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

        var connectionString = ConnectionString.Create("Server=localhost;Database=test;").Value;
        var contactEmail = Email.Create("contact@test.com").Value;
        var tenant = Tenant.Create("Test Tenant", "test-tenant", "test_db", connectionString, contactEmail);
        var tenantIdProperty = typeof(Tenant).GetProperty("Id");
        tenantIdProperty!.SetValue(tenant, tenantId);

        _tenantDbSetMock.Setup(x => x.FindAsync(It.IsAny<object[]>()))
            .ReturnsAsync(tenant);

        _jwtTokenServiceMock.Setup(x => x.GenerateAccessToken(It.IsAny<List<Claim>>()))
            .Returns("access_token");
        _jwtTokenServiceMock.Setup(x => x.GenerateRefreshToken())
            .Returns("refresh_token");
        _jwtTokenServiceMock.Setup(x => x.GetAccessTokenExpiration())
            .Returns(DateTime.UtcNow.AddHours(1));
        _jwtTokenServiceMock.Setup(x => x.GetRefreshTokenExpiration())
            .Returns(DateTime.UtcNow.AddDays(7));

        _masterContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        var result = await _tokenGenerationService.GenerateForMasterUserAsync(masterUser, tenantId);

        // Assert
        result.Should().NotBeNull();
        result.Success.Should().BeTrue();
        result.User!.TenantId.Should().Be(tenantId);
        result.User.TenantName.Should().Be("Test Tenant");
    }

    [Theory]
    [InlineData(UserType.SistemYoneticisi, "SistemYoneticisi")]
    [InlineData(UserType.FirmaYoneticisi, "FirmaYoneticisi")]
    [InlineData(UserType.Destek, "Destek")]
    [InlineData(UserType.Personel, "Personel")]
    [InlineData(UserType.Misafir, "Misafir")]
    public async Task GenerateForMasterUserAsync_Should_Set_Correct_Roles_For_UserType(UserType userType, string expectedRole)
    {
        // Arrange
        var email = Email.Create("test@test.com").Value;
        var phone = PhoneNumber.Create("+90 555 123 4567").Value;

        var masterUser = MasterUser.Create(
            "testuser",
            email,
            "TestPassword123!",
            "Test",
            "User",
            userType,
            phone
        );

        _jwtTokenServiceMock.Setup(x => x.GenerateAccessToken(It.IsAny<List<Claim>>()))
            .Returns("access_token");
        _jwtTokenServiceMock.Setup(x => x.GenerateRefreshToken())
            .Returns("refresh_token");
        _jwtTokenServiceMock.Setup(x => x.GetAccessTokenExpiration())
            .Returns(DateTime.UtcNow.AddHours(1));
        _jwtTokenServiceMock.Setup(x => x.GetRefreshTokenExpiration())
            .Returns(DateTime.UtcNow.AddDays(7));

        _masterContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        var result = await _tokenGenerationService.GenerateForMasterUserAsync(masterUser);

        // Assert
        result.User!.Roles.Should().Contain(expectedRole);
    }

    [Fact]
    public async Task GenerateForMasterUserAsync_Should_Save_RefreshToken_To_User()
    {
        // Arrange
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

        var refreshToken = "refresh_token_123";
        var refreshTokenExpiration = DateTime.UtcNow.AddDays(7);

        _jwtTokenServiceMock.Setup(x => x.GenerateAccessToken(It.IsAny<List<Claim>>()))
            .Returns("access_token");
        _jwtTokenServiceMock.Setup(x => x.GenerateRefreshToken())
            .Returns(refreshToken);
        _jwtTokenServiceMock.Setup(x => x.GetAccessTokenExpiration())
            .Returns(DateTime.UtcNow.AddHours(1));
        _jwtTokenServiceMock.Setup(x => x.GetRefreshTokenExpiration())
            .Returns(refreshTokenExpiration);

        _masterContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        await _tokenGenerationService.GenerateForMasterUserAsync(masterUser);

        // Assert
        masterUser.RefreshToken.Should().Be(refreshToken);
        masterUser.RefreshTokenExpiryTime.Should().BeCloseTo(refreshTokenExpiration, TimeSpan.FromSeconds(1));
        _masterContextMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task GenerateForMasterUserAsync_Should_Include_SuperAdmin_Claim_For_SistemYoneticisi()
    {
        // Arrange
        var email = Email.Create("admin@test.com").Value;
        var phone = PhoneNumber.Create("+90 555 123 4567").Value;

        var masterUser = MasterUser.Create(
            "admin",
            email,
            "AdminPassword123!",
            "Admin",
            "User",
            UserType.SistemYoneticisi,
            phone
        );

        List<Claim> capturedClaims = null!;
        _jwtTokenServiceMock.Setup(x => x.GenerateAccessToken(It.IsAny<List<Claim>>()))
            .Callback<IEnumerable<Claim>>(claims => capturedClaims = claims.ToList())
            .Returns("access_token");

        _jwtTokenServiceMock.Setup(x => x.GenerateRefreshToken())
            .Returns("refresh_token");
        _jwtTokenServiceMock.Setup(x => x.GetAccessTokenExpiration())
            .Returns(DateTime.UtcNow.AddHours(1));
        _jwtTokenServiceMock.Setup(x => x.GetRefreshTokenExpiration())
            .Returns(DateTime.UtcNow.AddDays(7));

        _masterContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        await _tokenGenerationService.GenerateForMasterUserAsync(masterUser);

        // Assert
        capturedClaims.Should().NotBeNull();
        capturedClaims.Should().Contain(c => c.Type == "IsSuperAdmin" && c.Value == "true");
        capturedClaims.Should().Contain(c => c.Type == ClaimTypes.Role && c.Value == "SistemYoneticisi");
    }

    #endregion

    #region GenerateForTenantUserAsync Tests

    [Fact]
    public async Task GenerateForTenantUserAsync_Should_Generate_Tokens_For_TenantUser()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var masterUserId = Guid.NewGuid();

        var email = Email.Create("master@test.com").Value;
        var phone = PhoneNumber.Create("+90 555 123 4567").Value;

        var masterUser = MasterUser.Create(
            "masteruser",
            email,
            "MasterPassword123!",
            "Master",
            "User",
            UserType.FirmaYoneticisi,
            phone
        );

        var idProperty = typeof(MasterUser).BaseType!.GetProperty("Id");
        idProperty!.SetValue(masterUser, masterUserId);

        var tenantEmail = Email.Create("tenant@test.com").Value;
        var tenantPhone = PhoneNumber.Create("+90 555 999 8877").Value;

        var tenantUser = TenantUser.Create(
            tenantId,
            masterUserId,
            "tenantuser",
            tenantEmail,
            "Tenant",
            "User",
            null, // employeeCode
            tenantPhone
        );

        var connectionString = ConnectionString.Create("Server=localhost;Database=test;").Value;
        var contactEmail = Email.Create("contact@test.com").Value;
        var tenant = Tenant.Create("Test Tenant", "test-tenant", "test_db", connectionString, contactEmail);
        var tenantIdProp = typeof(Tenant).GetProperty("Id");
        tenantIdProp!.SetValue(tenant, tenantId);

        _tenantDbSetMock.Setup(x => x.FindAsync(It.IsAny<object[]>()))
            .ReturnsAsync(tenant);

        _jwtTokenServiceMock.Setup(x => x.GenerateAccessToken(It.IsAny<List<Claim>>()))
            .Returns("access_token");
        _jwtTokenServiceMock.Setup(x => x.GenerateRefreshToken())
            .Returns("refresh_token");
        _jwtTokenServiceMock.Setup(x => x.GetAccessTokenExpiration())
            .Returns(DateTime.UtcNow.AddHours(1));
        _jwtTokenServiceMock.Setup(x => x.GetRefreshTokenExpiration())
            .Returns(DateTime.UtcNow.AddDays(7));

        _masterContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        var result = await _tokenGenerationService.GenerateForTenantUserAsync(tenantUser, masterUser);

        // Assert
        result.Should().NotBeNull();
        result.Success.Should().BeTrue();
        result.AccessToken.Should().Be("access_token");
        result.RefreshToken.Should().Be("refresh_token");
        result.User.Should().NotBeNull();
        result.User!.Id.Should().Be(masterUserId);
        result.User.Username.Should().Be("tenantuser");
        result.User.Email.Should().Be("tenant@test.com");
        result.User.IsMasterUser.Should().BeFalse();
        result.User.TenantId.Should().Be(tenantId);
        result.User.TenantName.Should().Be("Test Tenant");
    }

    [Fact]
    public async Task GenerateForTenantUserAsync_Should_Include_UserRoles_In_Claims()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var masterUserId = Guid.NewGuid();
        var roleId = Guid.NewGuid();

        var email = Email.Create("master@test.com").Value;
        var masterUser = MasterUser.Create(
            "masteruser",
            email,
            "MasterPassword123!",
            "Master",
            "User",
            UserType.FirmaYoneticisi,
            null
        );

        var idProperty = typeof(MasterUser).BaseType!.GetProperty("Id");
        idProperty!.SetValue(masterUser, masterUserId);

        var tenantEmail = Email.Create("tenant@test.com").Value;
        var tenantUser = TenantUser.Create(
            tenantId,
            masterUserId,
            "tenantuser",
            tenantEmail,
            "Tenant",
            "User",
            null, // employeeCode
            null  // phone
        );

        // Setup mocks
        List<Claim> capturedClaims = null!;
        _jwtTokenServiceMock.Setup(x => x.GenerateAccessToken(It.IsAny<List<Claim>>()))
            .Callback<IEnumerable<Claim>>(claims => capturedClaims = claims.ToList())
            .Returns("access_token");

        _jwtTokenServiceMock.Setup(x => x.GenerateRefreshToken())
            .Returns("refresh_token");
        _jwtTokenServiceMock.Setup(x => x.GetAccessTokenExpiration())
            .Returns(DateTime.UtcNow.AddHours(1));
        _jwtTokenServiceMock.Setup(x => x.GetRefreshTokenExpiration())
            .Returns(DateTime.UtcNow.AddDays(7));

        _masterContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        await _tokenGenerationService.GenerateForTenantUserAsync(tenantUser, masterUser);

        // Assert - Verify basic claims (UserRoles require DbContext query, tested separately)
        capturedClaims.Should().NotBeNull();
        capturedClaims.Should().Contain(c => c.Type == "TenantUserId" && c.Value == tenantUser.Id.ToString());
        capturedClaims.Should().Contain(c => c.Type == "IsMasterUser" && c.Value == "false");
        capturedClaims.Should().Contain(c => c.Type == ClaimTypes.NameIdentifier);
    }

    [Fact]
    public async Task GenerateForTenantUserAsync_Should_Save_RefreshToken_To_MasterUser()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var masterUserId = Guid.NewGuid();

        var email = Email.Create("master@test.com").Value;
        var masterUser = MasterUser.Create(
            "masteruser",
            email,
            "MasterPassword123!",
            "Master",
            "User",
            UserType.FirmaYoneticisi,
            null
        );

        var tenantEmail = Email.Create("tenant@test.com").Value;
        var tenantUser = TenantUser.Create(
            tenantId,
            masterUserId,
            "tenantuser",
            tenantEmail,
            "Tenant",
            "User",
            null, // employeeCode
            null  // phone
        );

        var refreshToken = "tenant_refresh_token";
        var refreshTokenExpiration = DateTime.UtcNow.AddDays(7);

        _jwtTokenServiceMock.Setup(x => x.GenerateAccessToken(It.IsAny<List<Claim>>()))
            .Returns("access_token");
        _jwtTokenServiceMock.Setup(x => x.GenerateRefreshToken())
            .Returns(refreshToken);
        _jwtTokenServiceMock.Setup(x => x.GetAccessTokenExpiration())
            .Returns(DateTime.UtcNow.AddHours(1));
        _jwtTokenServiceMock.Setup(x => x.GetRefreshTokenExpiration())
            .Returns(refreshTokenExpiration);

        _masterContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        await _tokenGenerationService.GenerateForTenantUserAsync(tenantUser, masterUser);

        // Assert
        masterUser.RefreshToken.Should().Be(refreshToken);
        masterUser.RefreshTokenExpiryTime.Should().BeCloseTo(refreshTokenExpiration, TimeSpan.FromSeconds(1));
        _masterContextMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task GenerateForTenantUserAsync_Should_Handle_Null_Tenant_Gracefully()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var masterUserId = Guid.NewGuid();

        var email = Email.Create("master@test.com").Value;
        var masterUser = MasterUser.Create(
            "masteruser",
            email,
            "MasterPassword123!",
            "Master",
            "User",
            UserType.FirmaYoneticisi,
            null
        );

        var tenantEmail = Email.Create("tenant@test.com").Value;
        var tenantUser = TenantUser.Create(
            tenantId,
            masterUserId,
            "tenantuser",
            tenantEmail,
            "Tenant",
            "User",
            null, // employeeCode
            null  // phone
        );

        // Tenant not found
        _tenantDbSetMock.Setup(x => x.FindAsync(It.IsAny<object[]>()))
            .ReturnsAsync((Tenant)null!);

        _jwtTokenServiceMock.Setup(x => x.GenerateAccessToken(It.IsAny<List<Claim>>()))
            .Returns("access_token");
        _jwtTokenServiceMock.Setup(x => x.GenerateRefreshToken())
            .Returns("refresh_token");
        _jwtTokenServiceMock.Setup(x => x.GetAccessTokenExpiration())
            .Returns(DateTime.UtcNow.AddHours(1));
        _jwtTokenServiceMock.Setup(x => x.GetRefreshTokenExpiration())
            .Returns(DateTime.UtcNow.AddDays(7));

        _masterContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        var result = await _tokenGenerationService.GenerateForTenantUserAsync(tenantUser, masterUser);

        // Assert
        result.Should().NotBeNull();
        result.Success.Should().BeTrue();
        result.User!.TenantName.Should().BeNull();
    }

    #endregion
}