using Xunit;
using FluentAssertions;
using Stocker.Application.DTOs.Dashboard;
using System.Collections.Generic;

namespace Stocker.UnitTests.Application.DTOs.Dashboard
{
    public class DashboardStatisticsDtoTests
    {
        [Fact]
        public void DashboardStatisticsDto_Should_Initialize_With_Default_Values()
        {
            // Act
            var dto = new DashboardStatisticsDto();

            // Assert
            dto.TotalTenants.Should().Be(0);
            dto.ActiveTenants.Should().Be(0);
            dto.TotalUsers.Should().Be(0);
            dto.ActiveSubscriptions.Should().Be(0);
            dto.TrialSubscriptions.Should().Be(0);
            dto.MonthlyRevenue.Should().Be(0m);
            dto.YearlyRevenue.Should().Be(0m);
            dto.PendingInvoices.Should().Be(0);
            dto.OverdueInvoices.Should().Be(0);
            dto.RecentActivity.Should().NotBeNull();
            dto.RecentActivity.Should().BeEmpty();
        }

        [Fact]
        public void DashboardStatisticsDto_Should_Set_All_Properties_Correctly()
        {
            // Arrange
            var activities = new List<ActivityDto>
            {
                new ActivityDto { Description = "Activity 1" },
                new ActivityDto { Description = "Activity 2" }
            };

            // Act
            var dto = new DashboardStatisticsDto
            {
                TotalTenants = 100,
                ActiveTenants = 85,
                TotalUsers = 500,
                ActiveSubscriptions = 80,
                TrialSubscriptions = 20,
                MonthlyRevenue = 15000.50m,
                YearlyRevenue = 180000.00m,
                PendingInvoices = 10,
                OverdueInvoices = 3,
                RecentActivity = activities
            };

            // Assert
            dto.TotalTenants.Should().Be(100);
            dto.ActiveTenants.Should().Be(85);
            dto.TotalUsers.Should().Be(500);
            dto.ActiveSubscriptions.Should().Be(80);
            dto.TrialSubscriptions.Should().Be(20);
            dto.MonthlyRevenue.Should().Be(15000.50m);
            dto.YearlyRevenue.Should().Be(180000.00m);
            dto.PendingInvoices.Should().Be(10);
            dto.OverdueInvoices.Should().Be(3);
            dto.RecentActivity.Should().HaveCount(2);
            dto.RecentActivity.Should().BeEquivalentTo(activities);
        }

        [Fact]
        public void DashboardStatisticsDto_Should_Handle_Negative_Values()
        {
            // Act
            var dto = new DashboardStatisticsDto
            {
                TotalTenants = -1,
                MonthlyRevenue = -1000m
            };

            // Assert
            dto.TotalTenants.Should().Be(-1);
            dto.MonthlyRevenue.Should().Be(-1000m);
        }

        [Fact]
        public void DashboardStatisticsDto_Should_Allow_Adding_Activities()
        {
            // Arrange
            var dto = new DashboardStatisticsDto();

            // Act
            dto.RecentActivity.Add(new ActivityDto { Description = "New Activity" });
            dto.RecentActivity.Add(new ActivityDto { Description = "Another Activity" });

            // Assert
            dto.RecentActivity.Should().HaveCount(2);
            dto.RecentActivity[0].Description.Should().Be("New Activity");
            dto.RecentActivity[1].Description.Should().Be("Another Activity");
        }

        [Fact]
        public void DashboardStatisticsDto_Should_Calculate_Inactive_Tenants()
        {
            // Arrange
            var dto = new DashboardStatisticsDto
            {
                TotalTenants = 100,
                ActiveTenants = 75
            };

            // Act
            var inactiveTenants = dto.TotalTenants - dto.ActiveTenants;

            // Assert
            inactiveTenants.Should().Be(25);
        }
    }
}