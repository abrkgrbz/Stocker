using System.Net;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.Hosting;
using Xunit;
using Xunit.Abstractions;
using Stocker.TestUtilities;

namespace Stocker.IntegrationTests;

public class BasicTest : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly ITestOutputHelper _output;

    public BasicTest(WebApplicationFactory<Program> factory, ITestOutputHelper output)
    {
        _factory = factory;
        _output = output;
    }

    [Fact]
    public async Task Should_Return_200_For_Health_Check()
    {
        // Arrange
        var client = _factory.WithWebHostBuilder(builder =>
        {
            builder.UseEnvironment("Testing");
            builder.UseStartup<TestStartup>();
        }).CreateClient();

        // Act
        var response = await client.GetAsync("/health");
        
        // Log response details
        _output.WriteLine($"Status: {response.StatusCode}");
        var content = await response.Content.ReadAsStringAsync();
        _output.WriteLine($"Content: {content}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }
}