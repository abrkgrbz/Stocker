using Xunit;
using FluentAssertions;
using Stocker.Application.DTOs.Dashboard;
using System;

namespace Stocker.UnitTests.Application.DTOs.Dashboard
{
    public class TopTenantDtoTests
    {
        [Fact]
        public void TopTenantDto_Should_Initialize_With_Default_Values()
        {
            // Act
            var dto = new TopTenantDto();

            // Assert
            dto.TenantId.Should().Be(Guid.Empty);
            dto.TenantName.Should().Be(string.Empty);
            dto.TotalRevenue.Should().Be(0);
            dto.UserCount.Should().Be(0);
            dto.PackageName.Should().Be(string.Empty);
            dto.JoinedDate.Should().Be(default(DateTime));
        }

        [Fact]
        public void TopTenantDto_Should_Set_Properties_Correctly()
        {
            // Arrange
            var tenantId = Guid.NewGuid();
            var tenantName = "Acme Corporation";
            var totalRevenue = 150000.50m;
            var userCount = 25;
            var packageName = "Enterprise";
            var joinedDate = DateTime.UtcNow.AddMonths(-6);

            // Act
            var dto = new TopTenantDto
            {
                TenantId = tenantId,
                TenantName = tenantName,
                TotalRevenue = totalRevenue,
                UserCount = userCount,
                PackageName = packageName,
                JoinedDate = joinedDate
            };

            // Assert
            dto.TenantId.Should().Be(tenantId);
            dto.TenantName.Should().Be(tenantName);
            dto.TotalRevenue.Should().Be(totalRevenue);
            dto.UserCount.Should().Be(userCount);
            dto.PackageName.Should().Be(packageName);
            dto.JoinedDate.Should().Be(joinedDate);
        }

        [Fact]
        public void TopTenantDto_Should_Handle_Large_Values()
        {
            // Act
            var dto = new TopTenantDto
            {
                TotalRevenue = decimal.MaxValue,
                UserCount = int.MaxValue
            };

            // Assert
            dto.TotalRevenue.Should().Be(decimal.MaxValue);
            dto.UserCount.Should().Be(int.MaxValue);
        }

        [Fact]
        public void TopTenantDto_Should_Handle_Negative_Values()
        {
            // Act
            var dto = new TopTenantDto
            {
                TotalRevenue = -1000m,
                UserCount = -5
            };

            // Assert
            dto.TotalRevenue.Should().Be(-1000m);
            dto.UserCount.Should().Be(-5);
        }
    }
}