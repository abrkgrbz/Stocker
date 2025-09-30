using Xunit;
using FluentAssertions;
using Stocker.Application.Common.Exceptions;
using FluentValidation.Results;
using System.Collections.Generic;

namespace Stocker.UnitTests.Application.Common.Exceptions
{
    public class ValidationExceptionTests
    {
        [Fact]
        public void ValidationException_Should_Initialize_With_Default_Message()
        {
            // Act
            var exception = new ValidationException();

            // Assert
            exception.Message.Should().Be("One or more validation failures have occurred.");
            exception.Errors.Should().NotBeNull();
            exception.Errors.Should().BeEmpty();
        }

        [Fact]
        public void ValidationException_Should_Group_Errors_By_Property()
        {
            // Arrange
            var failures = new List<ValidationFailure>
            {
                new ValidationFailure("Email", "Email is required"),
                new ValidationFailure("Email", "Email is invalid"),
                new ValidationFailure("Name", "Name is required")
            };

            // Act
            var exception = new ValidationException(failures);

            // Assert
            exception.Errors.Should().HaveCount(2);
            exception.Errors["Email"].Should().HaveCount(2);
            exception.Errors["Email"].Should().Contain("Email is required");
            exception.Errors["Email"].Should().Contain("Email is invalid");
            exception.Errors["Name"].Should().HaveCount(1);
            exception.Errors["Name"].Should().Contain("Name is required");
        }

        [Fact]
        public void ValidationException_Should_Handle_Single_Error()
        {
            // Arrange
            var propertyName = "Username";
            var errorMessage = "Username must be unique";

            // Act
            var exception = new ValidationException(propertyName, errorMessage);

            // Assert
            exception.Errors.Should().HaveCount(1);
            exception.Errors[propertyName].Should().HaveCount(1);
            exception.Errors[propertyName].Should().Contain(errorMessage);
        }

        [Fact]
        public void ValidationException_Should_Handle_Null_Property_Name()
        {
            // Arrange
            var failures = new List<ValidationFailure>
            {
                new ValidationFailure(null, "General error"),
                new ValidationFailure(null, "Another general error")
            };

            // Act
            var exception = new ValidationException(failures);

            // Assert
            exception.Errors.Should().HaveCount(1);
            exception.Errors[string.Empty].Should().HaveCount(2);
            exception.Errors[string.Empty].Should().Contain("General error");
            exception.Errors[string.Empty].Should().Contain("Another general error");
        }

        [Fact]
        public void ValidationException_Should_Handle_Empty_Failures()
        {
            // Arrange
            var failures = new List<ValidationFailure>();

            // Act
            var exception = new ValidationException(failures);

            // Assert
            exception.Errors.Should().BeEmpty();
            exception.Message.Should().Be("One or more validation failures have occurred.");
        }
    }
}