using Xunit;
using FluentAssertions;
using Stocker.Application.Common.Exceptions;

namespace Stocker.UnitTests.Application.Common.Exceptions
{
    public class ForbiddenAccessExceptionTests
    {
        [Fact]
        public void ForbiddenAccessException_Should_Set_Code_And_Message()
        {
            // Arrange
            var code = "CUSTOM_FORBIDDEN";
            var message = "You don't have permission to access this resource";

            // Act
            var exception = new ForbiddenAccessException(code, message);

            // Assert
            exception.Code.Should().Be(code);
            exception.Message.Should().Be(message);
        }

        [Fact]
        public void ForbiddenAccessException_Should_Use_Default_Code_And_Message()
        {
            // Act
            var exception = new ForbiddenAccessException();

            // Assert
            exception.Code.Should().Be("Forbidden");
            exception.Message.Should().Be("Access is forbidden.");
        }

        [Fact]
        public void ForbiddenAccessException_Should_Use_Default_Code_With_Custom_Message()
        {
            // Arrange
            var message = "Custom forbidden message";

            // Act
            var exception = new ForbiddenAccessException(message);

            // Assert
            exception.Code.Should().Be("Forbidden");
            exception.Message.Should().Be(message);
        }

    }
}