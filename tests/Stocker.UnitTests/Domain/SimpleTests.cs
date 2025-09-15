using FluentAssertions;
using Xunit;

namespace Stocker.UnitTests.Domain;

public class SimpleTests
{
    [Fact]
    public void SimpleTest_Should_Pass()
    {
        // Arrange
        var value = 1 + 1;

        // Act & Assert
        value.Should().Be(2);
    }

    [Theory]
    [InlineData(1, 2, 3)]
    [InlineData(5, 5, 10)]
    [InlineData(-1, 1, 0)]
    public void Addition_Should_ReturnCorrectResult(int a, int b, int expected)
    {
        // Act
        var result = a + b;

        // Assert
        result.Should().Be(expected);
    }
}