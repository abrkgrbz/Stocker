using Xunit;
using FluentAssertions;
using Stocker.Infrastructure.Services;
using System;

namespace Stocker.UnitTests.Infrastructure.Services
{
    public class DateTimeServiceTests
    {
        private readonly DateTimeService _sut;

        public DateTimeServiceTests()
        {
            _sut = new DateTimeService();
        }

        [Fact]
        public void Now_Should_Return_Current_DateTime()
        {
            // Act
            var result = _sut.Now;

            // Assert
            result.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        }

        [Fact]
        public void UtcNow_Should_Return_Current_UtcDateTime()
        {
            // Act
            var result = _sut.UtcNow;

            // Assert
            result.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
            result.Kind.Should().Be(DateTimeKind.Utc);
        }

        [Fact]
        public void NowOffset_Should_Return_Current_DateTimeOffset()
        {
            // Act
            var result = _sut.NowOffset;

            // Assert
            result.Should().BeCloseTo(DateTimeOffset.UtcNow, TimeSpan.FromSeconds(1));
        }

        [Fact]
        public void UtcNowOffset_Should_Return_Current_UtcDateTimeOffset()
        {
            // Act
            var result = _sut.UtcNowOffset;

            // Assert
            result.Should().BeCloseTo(DateTimeOffset.UtcNow, TimeSpan.FromSeconds(1));
            result.Offset.Should().Be(TimeSpan.Zero);
        }

        [Fact]
        public void Today_Should_Return_Current_Date()
        {
            // Arrange
            var expectedDate = DateOnly.FromDateTime(DateTime.UtcNow);

            // Act
            var result = _sut.Today;

            // Assert
            result.Should().Be(expectedDate);
        }

        [Fact]
        public void TimeOfDay_Should_Return_Current_Time()
        {
            // Arrange
            var now = DateTime.UtcNow;
            var expectedTime = TimeOnly.FromDateTime(now);

            // Act
            var result = _sut.TimeOfDay;

            // Assert
            result.Hour.Should().Be(expectedTime.Hour);
            result.Minute.Should().BeCloseTo(expectedTime.Minute, 1); // Allow 1 minute difference
        }

        [Fact]
        public void All_DateTime_Properties_Should_Be_Consistent()
        {
            // Act
            var now = _sut.Now;
            var utcNow = _sut.UtcNow;
            var nowOffset = _sut.NowOffset;
            var utcNowOffset = _sut.UtcNowOffset;
            var today = _sut.Today;
            var timeOfDay = _sut.TimeOfDay;

            // Assert
            now.Should().BeCloseTo(utcNow, TimeSpan.FromSeconds(1));
            nowOffset.UtcDateTime.Should().BeCloseTo(utcNowOffset.UtcDateTime, TimeSpan.FromSeconds(1));
            today.Year.Should().Be(now.Year);
            today.Month.Should().Be(now.Month);
            today.Day.Should().Be(now.Day);
            timeOfDay.Hour.Should().Be(now.Hour);
        }
    }
}