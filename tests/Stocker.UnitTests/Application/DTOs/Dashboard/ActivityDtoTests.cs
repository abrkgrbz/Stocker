using Xunit;
using FluentAssertions;
using Stocker.Application.DTOs.Dashboard;
using System;

namespace Stocker.UnitTests.Application.DTOs.Dashboard
{
    public class ActivityDtoTests
    {
        [Fact]
        public void ActivityDto_Should_Initialize_With_Default_Values()
        {
            // Act
            var dto = new ActivityDto();

            // Assert
            dto.Timestamp.Should().Be(default(DateTime));
            dto.Type.Should().Be(string.Empty);
            dto.Description.Should().Be(string.Empty);
            dto.EntityId.Should().BeNull();
            dto.EntityName.Should().BeNull();
            dto.UserId.Should().BeNull();
            dto.UserName.Should().BeNull();
        }

        [Fact]
        public void ActivityDto_Should_Set_Properties_Correctly()
        {
            // Arrange
            var timestamp = DateTime.UtcNow;
            var type = "CREATE";
            var description = "New tenant created";
            var entityId = "tenant-123";
            var entityName = "Tenant";
            var userId = "user-456";
            var userName = "admin@example.com";

            // Act
            var dto = new ActivityDto
            {
                Timestamp = timestamp,
                Type = type,
                Description = description,
                EntityId = entityId,
                EntityName = entityName,
                UserId = userId,
                UserName = userName
            };

            // Assert
            dto.Timestamp.Should().Be(timestamp);
            dto.Type.Should().Be(type);
            dto.Description.Should().Be(description);
            dto.EntityId.Should().Be(entityId);
            dto.EntityName.Should().Be(entityName);
            dto.UserId.Should().Be(userId);
            dto.UserName.Should().Be(userName);
        }

        [Fact]
        public void ActivityDto_Should_Handle_Nullable_Properties()
        {
            // Act
            var dto = new ActivityDto
            {
                Timestamp = DateTime.UtcNow,
                Type = "SYSTEM",
                Description = "System maintenance",
                EntityId = null,
                EntityName = null,
                UserId = null,
                UserName = null
            };

            // Assert
            dto.EntityId.Should().BeNull();
            dto.EntityName.Should().BeNull();
            dto.UserId.Should().BeNull();
            dto.UserName.Should().BeNull();
        }
    }
}