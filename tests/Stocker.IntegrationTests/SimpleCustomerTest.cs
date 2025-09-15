using System.Net;
using FluentAssertions;
using Xunit;
using Stocker.TestUtilities;

namespace Stocker.IntegrationTests;

public class SimpleCustomerTest : SimpleIntegrationTestBase
{
    private readonly Guid _tenantId = Guid.NewGuid();
    
    [Fact]
    public async Task GetAll_ShouldReturnEmptyList_WhenNoCustomers()
    {
        // Arrange
        AuthenticateAsAdmin();
        
        // Act
        var response = await Client.GetAsync($"/api/tenants/{_tenantId}/customers");
        
        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }
    
    [Fact]
    public async Task Health_Check_Should_Return_OK()
    {
        // Act
        var response = await Client.GetAsync("/health");
        
        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }
}