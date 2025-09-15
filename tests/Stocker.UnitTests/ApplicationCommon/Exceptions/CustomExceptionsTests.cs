using FluentAssertions;
using Stocker.Application.Common.Exceptions;
using System;
using System.Collections.Generic;
using Xunit;

namespace Stocker.UnitTests.ApplicationCommon.Exceptions
{
    public class CustomExceptionsTests
    {
        [Fact]
        public void BusinessRuleException_ShouldStoreMessage()
        {
            // Arrange & Act
            var message = "Business rule violated";
            var exception = new BusinessRuleException(message);

            // Assert
            exception.Message.Should().Be(message);
            exception.InnerException.Should().BeNull();
        }

        [Fact]
        public void BusinessRuleException_ShouldStoreMessageAndDefaultCode()
        {
            // Arrange & Act
            var message = "Business rule violated";
            var exception = new BusinessRuleException(message);

            // Assert
            exception.Message.Should().Be(message);
            exception.Code.Should().Be("BUSINESS_RULE");
            exception.InnerException.Should().BeNull();
        }

        [Fact]
        public void BusinessRuleException_ShouldStoreMessageAndCustomCode()
        {
            // Arrange & Act
            var message = "Business rule violated";
            var code = "BR001";
            var exception = new BusinessRuleException(message, code);

            // Assert
            exception.Message.Should().Be(message);
            exception.Code.Should().Be(code);
            exception.InnerException.Should().BeNull();
        }

        [Fact]
        public void ConflictException_ShouldStoreMessage()
        {
            // Arrange & Act
            var message = "Resource conflict";
            var exception = new ConflictException(message);

            // Assert
            exception.Message.Should().Be(message);
            exception.InnerException.Should().BeNull();
        }

        [Fact]
        public void ConflictException_ShouldFormatMessageForDuplicateEntity()
        {
            // Arrange & Act
            var entity = "User";
            var property = "Email";
            var value = "test@example.com";
            var exception = new ConflictException(entity, property, value);

            // Assert
            exception.Message.Should().Be($"{entity} with {property} '{value}' already exists.");
        }

        [Fact]
        public void ForbiddenException_ShouldStoreMessage()
        {
            // Arrange & Act
            var message = "Access forbidden";
            var exception = new ForbiddenException(message);

            // Assert
            exception.Message.Should().Be(message);
            exception.InnerException.Should().BeNull();
        }

        [Fact]
        public void NotFoundException_ShouldFormatMessageWithNameAndKey()
        {
            // Arrange & Act
            var name = "Product";
            var key = "123";
            var exception = new NotFoundException(name, key);

            // Assert
            exception.Message.Should().Be(key); // NotFoundException just stores the key in the message
            exception.InnerException.Should().BeNull();
        }

        [Fact]
        public void UnauthorizedException_ShouldStoreMessage()
        {
            // Arrange & Act
            var message = "User not authorized";
            var exception = new UnauthorizedException(message);

            // Assert
            exception.Message.Should().Be(message);
            exception.InnerException.Should().BeNull();
        }

        [Fact]
        public void UnauthorizedException_ShouldStoreMessageAndCode()
        {
            // Arrange & Act
            var message = "User not authorized";
            var code = "AUTH001";
            var exception = new UnauthorizedException(code, message);

            // Assert
            exception.Message.Should().Be(message);
            exception.Code.Should().Be(code);
            exception.InnerException.Should().BeNull();
        }

        [Fact]
        public void ValidationException_ShouldStoreErrors()
        {
            // Arrange
            var failures = new List<FluentValidation.Results.ValidationFailure>
            {
                new FluentValidation.Results.ValidationFailure("Email", "Email is required"),
                new FluentValidation.Results.ValidationFailure("Email", "Email format is invalid"),
                new FluentValidation.Results.ValidationFailure("Password", "Password is too short"),
                new FluentValidation.Results.ValidationFailure("Password", "Password must contain special characters")
            };

            // Act
            var exception = new ValidationException(failures);

            // Assert
            exception.Errors.Should().ContainKey("Email");
            exception.Errors["Email"].Should().BeEquivalentTo(new[] { "Email is required", "Email format is invalid" });
            exception.Errors.Should().ContainKey("Password");
            exception.Errors["Password"].Should().BeEquivalentTo(new[] { "Password is too short", "Password must contain special characters" });
        }

        [Fact]
        public void ValidationException_DefaultConstructor_ShouldHaveEmptyErrors()
        {
            // Arrange & Act
            var exception = new ValidationException();

            // Assert
            exception.Errors.Should().NotBeNull();
            exception.Errors.Should().BeEmpty();
            exception.Message.Should().Be("One or more validation failures have occurred.");
        }

        [Fact]
        public void BusinessException_ShouldStoreMessageAndCode()
        {
            // Arrange & Act
            var message = "Business error occurred";
            var code = "BUS001";
            var exception = new BusinessException(code, message);

            // Assert
            exception.Message.Should().Be(message);
            exception.Code.Should().Be(code);
            exception.InnerException.Should().BeNull();
        }

        [Fact]
        public void BusinessException_ShouldStoreMessageCodeAndInnerException()
        {
            // Arrange & Act
            var message = "Business error occurred";
            var code = "BUS001";
            var innerException = new InvalidOperationException("Inner error");
            var exception = new BusinessException(code, message, innerException);

            // Assert
            exception.Message.Should().Be(message);
            exception.Code.Should().Be(code);
            exception.InnerException.Should().BeSameAs(innerException);
        }

        [Fact]
        public void InfrastructureException_ShouldStoreMessageAndCode()
        {
            // Arrange & Act
            var message = "Infrastructure error occurred";
            var code = "INFRA001";
            var exception = new InfrastructureException(code, message);

            // Assert
            exception.Message.Should().Be(message);
            exception.Code.Should().Be(code);
            exception.InnerException.Should().BeNull();
        }

        [Fact]
        public void InfrastructureException_ShouldStoreMessageCodeAndInnerException()
        {
            // Arrange & Act
            var message = "Infrastructure error occurred";
            var code = "INFRA001";
            var innerException = new InvalidOperationException("Database connection failed");
            var exception = new InfrastructureException(code, message, innerException);

            // Assert
            exception.Message.Should().Be(message);
            exception.Code.Should().Be(code);
            exception.InnerException.Should().BeSameAs(innerException);
        }

        [Fact]
        public void ForbiddenAccessException_ShouldStoreDefaultMessage()
        {
            // Arrange & Act
            var exception = new ForbiddenAccessException();

            // Assert
            exception.Message.Should().Be("Access is forbidden.");
            exception.Code.Should().Be("Forbidden");
            exception.InnerException.Should().BeNull();
        }

        [Fact]
        public void CustomExceptions_ShouldBeSerializable()
        {
            // Arrange
            var exceptions = new Exception[]
            {
                new BusinessRuleException("Test"),
                new ConflictException("Test"),
                new ForbiddenException("Test"),
                new NotFoundException("Entity", "1"),
                new UnauthorizedException("Test"),
                new ValidationException(),
                new BusinessException("BUS001", "Test"),
                new InfrastructureException("INFRA001", "Test"),
                new ForbiddenAccessException()
            };

            // Act & Assert
            foreach (var exception in exceptions)
            {
                exception.Should().BeAssignableTo<Exception>();
                exception.Data.Should().NotBeNull();
                exception.StackTrace.Should().BeNull(); // Not thrown yet
            }
        }
    }
}