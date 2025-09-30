using Xunit;
using FluentAssertions;
using Stocker.Application.Common.Models;
using System;
using System.Collections.Generic;

namespace Stocker.UnitTests.Application.Common.Models
{
    public class ApiResponseTests
    {
        [Fact]
        public void ApiResponse_Should_Initialize_With_Default_Values()
        {
            // Act
            var response = new ApiResponse();

            // Assert
            response.Success.Should().BeFalse();
            response.Message.Should().Be(string.Empty);
            response.TraceId.Should().BeNull();
            response.Timestamp.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        }

        [Fact]
        public void ApiResponse_Should_Set_Properties_Correctly()
        {
            // Arrange
            var timestamp = DateTime.UtcNow;

            // Act
            var response = new ApiResponse
            {
                Success = true,
                Message = "Test message",
                TraceId = "trace-123",
                Timestamp = timestamp
            };

            // Assert
            response.Success.Should().BeTrue();
            response.Message.Should().Be("Test message");
            response.TraceId.Should().Be("trace-123");
            response.Timestamp.Should().Be(timestamp);
        }

        [Fact]
        public void ApiResponseT_SuccessResponse_Should_Create_Success_Response()
        {
            // Arrange
            var data = new { Id = 1, Name = "Test" };
            var message = "Custom success message";

            // Act
            var response = ApiResponse<object>.SuccessResponse(data, message);

            // Assert
            response.Success.Should().BeTrue();
            response.Message.Should().Be(message);
            response.Data.Should().Be(data);
            response.Timestamp.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        }

        [Fact]
        public void ApiResponseT_SuccessResponse_Should_Use_Default_Message()
        {
            // Arrange
            var data = "test data";

            // Act
            var response = ApiResponse<string>.SuccessResponse(data);

            // Assert
            response.Success.Should().BeTrue();
            response.Message.Should().Be("Operation completed successfully");
            response.Data.Should().Be(data);
        }

        [Fact]
        public void ApiResponseT_FailureResponse_Should_Create_Failure_With_Message()
        {
            // Arrange
            var message = "Operation failed";

            // Act
            var response = ApiResponse<string>.FailureResponse(message);

            // Assert
            response.Success.Should().BeFalse();
            response.Message.Should().Be(message);
            response.Data.Should().BeNull();
        }

        [Fact]
        public void ApiResponseT_FailureResponse_Should_Create_Failure_With_Errors()
        {
            // Arrange
            var errors = new List<string> { "Error 1", "Error 2", "Error 3" };

            // Act
            var response = ApiResponse<object>.FailureResponse(errors);

            // Assert
            response.Success.Should().BeFalse();
            response.Message.Should().Be("Error 1; Error 2; Error 3");
            response.Data.Should().BeNull();
        }

        [Fact]
        public void ApiResponseT_FailureResponse_Should_Handle_Empty_Errors_List()
        {
            // Arrange
            var errors = new List<string>();

            // Act
            var response = ApiResponse<int>.FailureResponse(errors);

            // Assert
            response.Success.Should().BeFalse();
            response.Message.Should().Be(string.Empty);
            response.Data.Should().Be(0);
        }
    }
}