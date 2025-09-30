using Xunit;
using FluentAssertions;
using Stocker.Application.Common.Exceptions;
using System;

namespace Stocker.UnitTests.Application.Common.Exceptions
{
    public class NotFoundExceptionTests
    {
        [Fact]
        public void NotFoundException_Should_Set_Code_And_Message()
        {
            // Arrange
            var code = "USER_NOT_FOUND";
            var message = "The requested user was not found";

            // Act
            var exception = new NotFoundException(code, message);

            // Assert
            exception.Code.Should().Be(code);
            exception.Message.Should().Be(message);
        }

        [Fact]
        public void NotFoundException_Should_Format_Entity_Message()
        {
            // Arrange
            var entityName = "User";
            var entityKey = Guid.NewGuid();

            // Act
            var exception = new NotFoundException(entityName, entityKey);

            // Assert
            exception.Code.Should().Be(entityName);
            exception.Message.Should().Be($"Entity \"{entityName}\" ({entityKey}) was not found.");
        }

        [Fact]
        public void NotFoundException_Should_Handle_Object_Key_With_String()
        {
            // Arrange
            var entityName = "Product";
            object entityKey = "PROD-123";  // Cast to object to use entity constructor

            // Act
            var exception = new NotFoundException(entityName, entityKey);

            // Assert
            exception.Code.Should().Be(entityName);
            exception.Message.Should().Be($"Entity \"{entityName}\" ({entityKey}) was not found.");
        }

        [Fact]
        public void NotFoundException_Should_Handle_Numeric_Key()
        {
            // Arrange
            var entityName = "Order";
            var entityKey = 12345;

            // Act
            var exception = new NotFoundException(entityName, entityKey);

            // Assert
            exception.Code.Should().Be(entityName);
            exception.Message.Should().Be($"Entity \"{entityName}\" ({entityKey}) was not found.");
        }
    }
}