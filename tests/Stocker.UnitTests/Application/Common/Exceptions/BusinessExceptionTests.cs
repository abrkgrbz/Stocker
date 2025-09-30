using Xunit;
using FluentAssertions;
using Stocker.Application.Common.Exceptions;
using System;

namespace Stocker.UnitTests.Application.Common.Exceptions
{
    public class BusinessExceptionTests
    {
        [Fact]
        public void BusinessException_Should_Set_Code_And_Message()
        {
            // Arrange
            var code = "BUSINESS_ERROR";
            var message = "Business logic error occurred";

            // Act
            var exception = new BusinessException(code, message);

            // Assert
            exception.Code.Should().Be(code);
            exception.Message.Should().Be(message);
            exception.InnerException.Should().BeNull();
        }

        [Fact]
        public void BusinessException_Should_Set_Code_Message_And_InnerException()
        {
            // Arrange
            var code = "BUSINESS_ERROR";
            var message = "Business logic error occurred";
            var innerException = new InvalidOperationException("Inner error");

            // Act
            var exception = new BusinessException(code, message, innerException);

            // Assert
            exception.Code.Should().Be(code);
            exception.Message.Should().Be(message);
            exception.InnerException.Should().Be(innerException);
        }

        [Fact]
        public void BusinessException_Should_Handle_Empty_Code()
        {
            // Arrange
            var code = string.Empty;
            var message = "Error message";

            // Act
            var exception = new BusinessException(code, message);

            // Assert
            exception.Code.Should().BeEmpty();
            exception.Message.Should().Be(message);
        }

        [Fact]
        public void BusinessException_Should_Handle_Null_Code()
        {
            // Arrange
            string code = null;
            var message = "Error message";

            // Act
            var exception = new BusinessException(code, message);

            // Assert
            exception.Code.Should().BeNull();
            exception.Message.Should().Be(message);
        }
    }
}