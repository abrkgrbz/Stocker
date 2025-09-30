using Xunit;
using FluentAssertions;
using Stocker.Application.Common.Models;
using Stocker.SharedKernel.Results;
using System.Collections.Generic;

namespace Stocker.UnitTests.Application.Common.Models
{
    public class ErrorResponseTests
    {
        [Fact]
        public void ErrorResponse_Should_Initialize_With_Default_Values()
        {
            // Act
            var response = new ErrorResponse();

            // Assert
            response.Success.Should().BeFalse();
            response.Message.Should().Be(string.Empty);
            response.ErrorCode.Should().Be(string.Empty);
            response.ErrorType.Should().Be(ErrorType.None); // Default enum value is 0 (None)
            response.Errors.Should().BeNull();
            response.TraceId.Should().BeNull();
        }

        [Fact]
        public void Create_With_Error_Should_Create_Response_From_Error()
        {
            // Arrange
            var error = new Error("TEST_ERROR", "Test error occurred", ErrorType.Failure);
            var traceId = "trace-123";

            // Act
            var response = ErrorResponse.Create(error, traceId);

            // Assert
            response.Success.Should().BeFalse();
            response.Message.Should().Be("Test error occurred");
            response.ErrorCode.Should().Be("TEST_ERROR");
            response.ErrorType.Should().Be(ErrorType.Failure);
            response.TraceId.Should().Be(traceId);
            response.Errors.Should().BeNull();
        }

        [Fact]
        public void Create_With_Error_Should_Work_Without_TraceId()
        {
            // Arrange
            var error = new Error("ERROR_CODE", "Error message", ErrorType.Conflict);

            // Act
            var response = ErrorResponse.Create(error);

            // Assert
            response.Success.Should().BeFalse();
            response.Message.Should().Be("Error message");
            response.ErrorCode.Should().Be("ERROR_CODE");
            response.ErrorType.Should().Be(ErrorType.Conflict);
            response.TraceId.Should().BeNull();
        }

        [Fact]
        public void Create_With_Parameters_Should_Create_Response()
        {
            // Arrange
            var code = "CUSTOM_ERROR";
            var message = "Custom error message";
            var type = ErrorType.NotFound;
            var traceId = "trace-456";

            // Act
            var response = ErrorResponse.Create(code, message, type, traceId);

            // Assert
            response.Success.Should().BeFalse();
            response.Message.Should().Be(message);
            response.ErrorCode.Should().Be(code);
            response.ErrorType.Should().Be(type);
            response.TraceId.Should().Be(traceId);
            response.Errors.Should().BeNull();
        }

        [Fact]
        public void Create_With_Parameters_Should_Use_Default_ErrorType()
        {
            // Arrange
            var code = "DEFAULT_TYPE";
            var message = "Default type error";

            // Act
            var response = ErrorResponse.Create(code, message);

            // Assert
            response.ErrorType.Should().Be(ErrorType.Failure);
        }

        [Fact]
        public void ValidationError_Should_Create_Validation_Error_Response()
        {
            // Arrange
            var errors = new Dictionary<string, string[]>
            {
                { "Email", new[] { "Email is required", "Email is invalid" } },
                { "Name", new[] { "Name is too long" } }
            };
            var traceId = "trace-789";

            // Act
            var response = ErrorResponse.ValidationError(errors, traceId);

            // Assert
            response.Success.Should().BeFalse();
            response.Message.Should().Be("One or more validation errors occurred.");
            response.ErrorCode.Should().Be("ValidationError");
            response.ErrorType.Should().Be(ErrorType.Validation);
            response.Errors.Should().BeEquivalentTo(errors);
            response.TraceId.Should().Be(traceId);
        }

        [Fact]
        public void ValidationError_Should_Work_Without_TraceId()
        {
            // Arrange
            var errors = new Dictionary<string, string[]>
            {
                { "Field1", new[] { "Error 1" } }
            };

            // Act
            var response = ErrorResponse.ValidationError(errors);

            // Assert
            response.TraceId.Should().BeNull();
            response.Errors.Should().BeEquivalentTo(errors);
        }

        [Fact]
        public void ValidationError_Should_Handle_Empty_Errors_Dictionary()
        {
            // Arrange
            var errors = new Dictionary<string, string[]>();

            // Act
            var response = ErrorResponse.ValidationError(errors);

            // Assert
            response.Errors.Should().BeEmpty();
            response.Message.Should().Be("One or more validation errors occurred.");
        }
    }
}