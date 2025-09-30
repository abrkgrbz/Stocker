using Xunit;
using FluentAssertions;
using Stocker.Application.DTOs.Auth;
using System;

namespace Stocker.UnitTests.Application.DTOs.Auth
{
    public class AuthTokenDtoTests
    {
        [Fact]
        public void AuthTokenDto_Should_Initialize_With_Default_Values()
        {
            // Act
            var dto = new AuthTokenDto();

            // Assert
            dto.AccessToken.Should().Be(string.Empty);
            dto.RefreshToken.Should().Be(string.Empty);
            dto.TokenType.Should().Be("Bearer");
            dto.ExpiresAt.Should().Be(default(DateTime));
        }

        [Fact]
        public void AuthTokenDto_Should_Set_Properties_Correctly()
        {
            // Arrange
            var accessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
            var refreshToken = "refresh_token_value";
            var expiresAt = DateTime.UtcNow.AddHours(1);
            var tokenType = "Bearer";

            // Act
            var dto = new AuthTokenDto
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                ExpiresAt = expiresAt,
                TokenType = tokenType
            };

            // Assert
            dto.AccessToken.Should().Be(accessToken);
            dto.RefreshToken.Should().Be(refreshToken);
            dto.ExpiresAt.Should().Be(expiresAt);
            dto.TokenType.Should().Be(tokenType);
        }

        [Fact]
        public void AuthTokenDto_Should_Handle_Empty_Tokens()
        {
            // Act
            var dto = new AuthTokenDto
            {
                AccessToken = "",
                RefreshToken = ""
            };

            // Assert
            dto.AccessToken.Should().BeEmpty();
            dto.RefreshToken.Should().BeEmpty();
        }

        [Fact]
        public void AuthTokenDto_Should_Handle_Null_Assignment()
        {
            // Act
            var dto = new AuthTokenDto
            {
                AccessToken = null,
                RefreshToken = null,
                TokenType = null
            };

            // Assert
            dto.AccessToken.Should().BeNull();
            dto.RefreshToken.Should().BeNull();
            dto.TokenType.Should().BeNull();
        }
    }
}