using Xunit;
using FluentAssertions;
using Stocker.Application.Common.Exceptions;

namespace Stocker.UnitTests.Application.Common.Exceptions
{
    public class UnauthorizedExceptionTests
    {
        [Fact]
        public void UnauthorizedException_Should_Set_Code_And_Message()
        {
            // Arrange
            var code = "CUSTOM_UNAUTHORIZED";
            var message = "You must be authenticated to access this resource";

            // Act
            var exception = new UnauthorizedException(code, message);

            // Assert
            exception.Code.Should().Be(code);
            exception.Message.Should().Be(message);
        }

        [Fact]
        public void UnauthorizedException_Should_Use_Default_Code_And_Message()
        {
            // Act
            var exception = new UnauthorizedException();

            // Assert
            exception.Code.Should().Be("Unauthorized");
            exception.Message.Should().Be("Unauthorized access.");
        }

        [Fact]
        public void UnauthorizedException_Should_Use_Default_Code_With_Custom_Message()
        {
            // Arrange
            var message = "Custom unauthorized message";

            // Act
            var exception = new UnauthorizedException(message);

            // Assert
            exception.Code.Should().Be("Unauthorized");
            exception.Message.Should().Be(message);
        }

        [Fact]
        public void UnauthorizedException_Should_Handle_Empty_Values()
        {
            // Act
            var exception = new UnauthorizedException(string.Empty, string.Empty);

            // Assert
            exception.Code.Should().BeEmpty();
            exception.Message.Should().BeEmpty();
        }
    }
}