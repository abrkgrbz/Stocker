using Xunit;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Moq;
using Stocker.Infrastructure.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;

namespace Stocker.UnitTests.Infrastructure.Services
{
    public class CurrentUserServiceTests
    {
        private readonly Mock<IHttpContextAccessor> _httpContextAccessorMock;
        private readonly CurrentUserService _sut;

        public CurrentUserServiceTests()
        {
            _httpContextAccessorMock = new Mock<IHttpContextAccessor>();
            _sut = new CurrentUserService(_httpContextAccessorMock.Object);
        }

        [Fact]
        public void UserId_Should_Return_Null_When_No_HttpContext()
        {
            // Arrange
            _httpContextAccessorMock.Setup(x => x.HttpContext).Returns((HttpContext)null);

            // Act
            var result = _sut.UserId;

            // Assert
            result.Should().BeNull();
        }

        [Fact]
        public void UserId_Should_Return_UserId_From_NameIdentifier_Claim()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, userId.ToString())
            };
            SetupHttpContext(claims);

            // Act
            var result = _sut.UserId;

            // Assert
            result.Should().Be(userId);
        }

        [Fact]
        public void UserId_Should_Return_UserId_From_Sub_Claim_When_NameIdentifier_Missing()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var claims = new List<Claim>
            {
                new Claim("sub", userId.ToString())
            };
            SetupHttpContext(claims);

            // Act
            var result = _sut.UserId;

            // Assert
            result.Should().Be(userId);
        }

        [Fact]
        public void UserId_Should_Return_UserId_From_UserId_Claim_When_Others_Missing()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var claims = new List<Claim>
            {
                new Claim("UserId", userId.ToString())
            };
            SetupHttpContext(claims);

            // Act
            var result = _sut.UserId;

            // Assert
            result.Should().Be(userId);
        }

        [Fact]
        public void UserName_Should_Return_Name_From_Claim()
        {
            // Arrange
            var userName = "testuser";
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, userName)
            };
            SetupHttpContext(claims);

            // Act
            var result = _sut.UserName;

            // Assert
            result.Should().Be(userName);
        }

        [Fact]
        public void Email_Should_Return_Email_From_Claim()
        {
            // Arrange
            var email = "test@example.com";
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Email, email)
            };
            SetupHttpContext(claims);

            // Act
            var result = _sut.Email;

            // Assert
            result.Should().Be(email);
        }

        [Fact]
        public void TenantId_Should_Return_TenantId_From_Claim()
        {
            // Arrange
            var tenantId = Guid.NewGuid();
            var claims = new List<Claim>
            {
                new Claim("TenantId", tenantId.ToString())
            };
            SetupHttpContext(claims);

            // Act
            var result = _sut.TenantId;

            // Assert
            result.Should().Be(tenantId);
        }

        [Fact]
        public void TenantId_Should_Return_TenantId_From_Tenant_Id_Claim()
        {
            // Arrange
            var tenantId = Guid.NewGuid();
            var claims = new List<Claim>
            {
                new Claim("tenant_id", tenantId.ToString())
            };
            SetupHttpContext(claims);

            // Act
            var result = _sut.TenantId;

            // Assert
            result.Should().Be(tenantId);
        }

        [Fact]
        public void IsAuthenticated_Should_Return_True_When_User_Is_Authenticated()
        {
            // Arrange
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, "testuser")
            };
            SetupHttpContext(claims, isAuthenticated: true);

            // Act
            var result = _sut.IsAuthenticated;

            // Assert
            result.Should().BeTrue();
        }

        [Fact]
        public void IsAuthenticated_Should_Return_False_When_User_Is_Not_Authenticated()
        {
            // Arrange
            SetupHttpContext(new List<Claim>(), isAuthenticated: false);

            // Act
            var result = _sut.IsAuthenticated;

            // Assert
            result.Should().BeFalse();
        }

        [Fact]
        public void IsSuperAdmin_Should_Return_True_When_IsSuperAdmin_Claim_Is_True()
        {
            // Arrange
            var claims = new List<Claim>
            {
                new Claim("IsSuperAdmin", "true")
            };
            SetupHttpContext(claims);

            // Act
            var result = _sut.IsSuperAdmin;

            // Assert
            result.Should().BeTrue();
        }

        [Fact]
        public void IsSuperAdmin_Should_Return_True_When_User_Has_SystemAdmin_Role()
        {
            // Arrange
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Role, "SystemAdmin")
            };
            SetupHttpContext(claims);

            // Act
            var result = _sut.IsSuperAdmin;

            // Assert
            result.Should().BeTrue();
        }

        [Fact]
        public void IsSuperAdmin_Should_Return_False_When_No_Admin_Claims()
        {
            // Arrange
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, "regularuser")
            };
            SetupHttpContext(claims);

            // Act
            var result = _sut.IsSuperAdmin;

            // Assert
            result.Should().BeFalse();
        }

        [Fact]
        public void Role_Should_Return_Role_From_Claim()
        {
            // Arrange
            var role = "Administrator";
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Role, role)
            };
            SetupHttpContext(claims);

            // Act
            var result = _sut.Role;

            // Assert
            result.Should().Be(role);
        }

        [Fact]
        public void Permissions_Should_Return_All_Permission_Claims()
        {
            // Arrange
            var permissions = new[] { "read", "write", "delete" };
            var claims = new List<Claim>();
            foreach (var permission in permissions)
            {
                claims.Add(new Claim("permission", permission));
            }
            SetupHttpContext(claims);

            // Act
            var result = _sut.Permissions;

            // Assert
            result.Should().BeEquivalentTo(permissions);
        }

        [Fact]
        public void Permissions_Should_Return_Empty_When_No_Permission_Claims()
        {
            // Arrange
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, "user")
            };
            SetupHttpContext(claims);

            // Act
            var result = _sut.Permissions;

            // Assert
            result.Should().BeEmpty();
        }

        [Fact]
        public void IsMasterAdmin_Should_Return_Same_As_IsSuperAdmin()
        {
            // Arrange
            var claims = new List<Claim>
            {
                new Claim("IsSuperAdmin", "true")
            };
            SetupHttpContext(claims);

            // Act
            var isMasterAdmin = _sut.IsMasterAdmin;
            var isSuperAdmin = _sut.IsSuperAdmin;

            // Assert
            isMasterAdmin.Should().Be(isSuperAdmin);
        }

        [Fact]
        public void Roles_Should_Return_All_Role_Claims()
        {
            // Arrange
            var roles = new[] { "Admin", "User", "Manager" };
            var claims = new List<Claim>();
            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }
            SetupHttpContext(claims);

            // Act
            var result = _sut.Roles;

            // Assert
            result.Should().BeEquivalentTo(roles);
        }

        [Fact]
        public void Claims_Should_Return_All_Claims_As_Dictionary()
        {
            // Arrange
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, "testuser"),
                new Claim(ClaimTypes.Email, "test@example.com"),
                new Claim("CustomClaim", "CustomValue")
            };
            SetupHttpContext(claims);

            // Act
            var result = _sut.Claims;

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(3);
            result[ClaimTypes.Name].Should().Be("testuser");
            result[ClaimTypes.Email].Should().Be("test@example.com");
            result["CustomClaim"].Should().Be("CustomValue");
        }

        private void SetupHttpContext(List<Claim> claims, bool isAuthenticated = true)
        {
            var identity = new ClaimsIdentity(claims, isAuthenticated ? "Bearer" : null);
            var claimsPrincipal = new ClaimsPrincipal(identity);

            var context = new DefaultHttpContext
            {
                User = claimsPrincipal
            };

            _httpContextAccessorMock.Setup(x => x.HttpContext).Returns(context);
        }
    }
}