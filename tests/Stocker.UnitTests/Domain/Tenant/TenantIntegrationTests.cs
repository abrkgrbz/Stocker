using FluentAssertions;
using Stocker.Domain.Tenant.Entities;
using Xunit;

namespace Stocker.UnitTests.Domain.Tenant;

public class TenantIntegrationTests
{
    private const string Name = "Slack Integration";
    private const string Type = "Slack";
    private const string Configuration = "{\"workspace\":\"testworkspace\",\"channel\":\"general\"}";
    private const string CreatedBy = "admin@test.com";
    private const string Description = "Slack integration for notifications";

    [Fact]
    public void Create_WithValidData_ShouldCreateIntegration()
    {
        // Act
        var integration = TenantIntegration.Create(
            Name,
            Type,
            Configuration,
            CreatedBy,
            Description);

        // Assert
        integration.Should().NotBeNull();
        integration.Id.Should().NotBeEmpty();
        integration.Name.Should().Be(Name);
        integration.Type.Should().Be(Type);
        integration.Configuration.Should().Be(Configuration);
        integration.CreatedBy.Should().Be(CreatedBy);
        integration.Description.Should().Be(Description);
        integration.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        integration.IsActive.Should().BeFalse(); // Requires connection first
        integration.IsConnected.Should().BeFalse();
        integration.LastSyncAt.Should().BeNull();
        integration.LastSyncStatus.Should().BeNull();
        integration.LastError.Should().BeNull();
        integration.WebhookUrl.Should().BeNull();
        integration.ApiKey.Should().BeNull();
        integration.RefreshToken.Should().BeNull();
        integration.TokenExpiresAt.Should().BeNull();
    }

    [Fact]
    public void Create_WithoutDescription_ShouldCreateIntegration()
    {
        // Act
        var integration = TenantIntegration.Create(
            Name,
            Type,
            Configuration,
            CreatedBy);

        // Assert
        integration.Should().NotBeNull();
        integration.Description.Should().BeNull();
    }

    [Fact]
    public void Create_WithNullName_ShouldThrowArgumentException()
    {
        // Act
        var action = () => TenantIntegration.Create(
            null!,
            Type,
            Configuration,
            CreatedBy);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Integration name cannot be empty.*")
            .WithParameterName("name");
    }

    [Fact]
    public void Create_WithEmptyName_ShouldThrowArgumentException()
    {
        // Act
        var action = () => TenantIntegration.Create(
            "",
            Type,
            Configuration,
            CreatedBy);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Integration name cannot be empty.*")
            .WithParameterName("name");
    }

    [Fact]
    public void Create_WithWhitespaceName_ShouldThrowArgumentException()
    {
        // Act
        var action = () => TenantIntegration.Create(
            "  ",
            Type,
            Configuration,
            CreatedBy);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Integration name cannot be empty.*")
            .WithParameterName("name");
    }

    [Fact]
    public void Create_WithNullType_ShouldThrowArgumentException()
    {
        // Act
        var action = () => TenantIntegration.Create(
            Name,
            null!,
            Configuration,
            CreatedBy);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Integration type cannot be empty.*")
            .WithParameterName("type");
    }

    [Fact]
    public void Create_WithEmptyType_ShouldThrowArgumentException()
    {
        // Act
        var action = () => TenantIntegration.Create(
            Name,
            "",
            Configuration,
            CreatedBy);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Integration type cannot be empty.*")
            .WithParameterName("type");
    }

    [Theory]
    [InlineData("Slack")]
    [InlineData("Teams")]
    [InlineData("Zapier")]
    [InlineData("GoogleWorkspace")]
    [InlineData("Discord")]
    [InlineData("Jira")]
    [InlineData("GitHub")]
    [InlineData("Salesforce")]
    public void Create_WithDifferentTypes_ShouldAcceptAllTypes(string integrationType)
    {
        // Act
        var integration = TenantIntegration.Create(
            $"{integrationType} Integration",
            integrationType,
            Configuration,
            CreatedBy);

        // Assert
        integration.Type.Should().Be(integrationType);
    }

    [Fact]
    public void Connect_WithApiKey_ShouldConnectAndActivate()
    {
        // Arrange
        var integration = CreateIntegration();
        var apiKey = "sk-test-123456789";

        // Act
        integration.Connect(apiKey: apiKey);

        // Assert
        integration.IsConnected.Should().BeTrue();
        integration.IsActive.Should().BeTrue();
        integration.ApiKey.Should().Be(apiKey);
        integration.RefreshToken.Should().BeNull();
        integration.TokenExpiresAt.Should().BeNull();
        integration.LastSyncStatus.Should().Be("Connected");
        integration.LastSyncAt.Should().NotBeNull();
        integration.LastSyncAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
    }

    [Fact]
    public void Connect_WithRefreshToken_ShouldConnectWithToken()
    {
        // Arrange
        var integration = CreateIntegration();
        var refreshToken = "refresh-token-abc123";
        var expiresAt = DateTime.UtcNow.AddHours(1);

        // Act
        integration.Connect(
            apiKey: null,
            refreshToken: refreshToken,
            tokenExpiresAt: expiresAt);

        // Assert
        integration.IsConnected.Should().BeTrue();
        integration.IsActive.Should().BeTrue();
        integration.ApiKey.Should().BeNull();
        integration.RefreshToken.Should().Be(refreshToken);
        integration.TokenExpiresAt.Should().Be(expiresAt);
    }

    [Fact]
    public void Connect_WithFullCredentials_ShouldConnectWithAllInfo()
    {
        // Arrange
        var integration = CreateIntegration();
        var apiKey = "api-key-123";
        var refreshToken = "refresh-token-456";
        var expiresAt = DateTime.UtcNow.AddDays(30);

        // Act
        integration.Connect(
            apiKey: apiKey,
            refreshToken: refreshToken,
            tokenExpiresAt: expiresAt);

        // Assert
        integration.IsConnected.Should().BeTrue();
        integration.IsActive.Should().BeTrue();
        integration.ApiKey.Should().Be(apiKey);
        integration.RefreshToken.Should().Be(refreshToken);
        integration.TokenExpiresAt.Should().Be(expiresAt);
        integration.LastSyncStatus.Should().Be("Connected");
        integration.LastSyncAt.Should().NotBeNull();
    }

    [Fact]
    public void Connect_WithoutCredentials_ShouldStillConnect()
    {
        // Arrange
        var integration = CreateIntegration();

        // Act
        integration.Connect();

        // Assert
        integration.IsConnected.Should().BeTrue();
        integration.IsActive.Should().BeTrue();
        integration.ApiKey.Should().BeNull();
        integration.RefreshToken.Should().BeNull();
        integration.TokenExpiresAt.Should().BeNull();
    }

    [Fact]
    public void Disconnect_WhenConnected_ShouldDisconnectAndDeactivate()
    {
        // Arrange
        var integration = CreateIntegration();
        integration.Connect(
            apiKey: "test-key",
            refreshToken: "test-token",
            tokenExpiresAt: DateTime.UtcNow.AddDays(1));

        // Act
        integration.Disconnect();

        // Assert
        integration.IsConnected.Should().BeFalse();
        integration.IsActive.Should().BeFalse();
        integration.ApiKey.Should().BeNull();
        integration.RefreshToken.Should().BeNull();
        integration.TokenExpiresAt.Should().BeNull();
        integration.LastSyncStatus.Should().Be("Disconnected");
    }

    [Fact]
    public void Disconnect_WhenNotConnected_ShouldStillDisconnect()
    {
        // Arrange
        var integration = CreateIntegration();

        // Act
        integration.Disconnect();

        // Assert
        integration.IsConnected.Should().BeFalse();
        integration.IsActive.Should().BeFalse();
        integration.LastSyncStatus.Should().Be("Disconnected");
    }

    [Fact]
    public void UpdateConfiguration_ShouldUpdateConfiguration()
    {
        // Arrange
        var integration = CreateIntegration();
        var newConfiguration = "{\"workspace\":\"newworkspace\",\"channel\":\"notifications\"}";

        // Act
        integration.UpdateConfiguration(newConfiguration);

        // Assert
        integration.Configuration.Should().Be(newConfiguration);
    }

    [Fact]
    public void UpdateTokens_ShouldUpdateAllTokenInfo()
    {
        // Arrange
        var integration = CreateIntegration();
        integration.Connect(); // Connect first
        var newApiKey = "new-api-key";
        var newRefreshToken = "new-refresh-token";
        var newExpiresAt = DateTime.UtcNow.AddDays(7);

        // Act
        integration.UpdateTokens(newApiKey, newRefreshToken, newExpiresAt);

        // Assert
        integration.ApiKey.Should().Be(newApiKey);
        integration.RefreshToken.Should().Be(newRefreshToken);
        integration.TokenExpiresAt.Should().Be(newExpiresAt);
    }

    [Fact]
    public void UpdateTokens_WithNullValues_ShouldClearTokens()
    {
        // Arrange
        var integration = CreateIntegration();
        integration.Connect(
            apiKey: "old-key",
            refreshToken: "old-token",
            tokenExpiresAt: DateTime.UtcNow.AddDays(1));

        // Act
        integration.UpdateTokens(null, null, null);

        // Assert
        integration.ApiKey.Should().BeNull();
        integration.RefreshToken.Should().BeNull();
        integration.TokenExpiresAt.Should().BeNull();
    }

    [Fact]
    public void RecordSync_WithSuccess_ShouldRecordSuccessfulSync()
    {
        // Arrange
        var integration = CreateIntegration();
        integration.Connect();

        // Act
        integration.RecordSync(true);

        // Assert
        integration.LastSyncAt.Should().NotBeNull();
        integration.LastSyncAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        integration.LastSyncStatus.Should().Be("Success");
        integration.LastError.Should().BeNull();
    }

    [Fact]
    public void RecordSync_WithFailure_ShouldRecordFailedSync()
    {
        // Arrange
        var integration = CreateIntegration();
        integration.Connect();
        var errorMessage = "Connection timeout";

        // Act
        integration.RecordSync(false, errorMessage);

        // Assert
        integration.LastSyncAt.Should().NotBeNull();
        integration.LastSyncAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        integration.LastSyncStatus.Should().Be("Failed");
        integration.LastError.Should().Be(errorMessage);
        integration.IsConnected.Should().BeTrue(); // Should remain connected for non-auth errors
        integration.IsActive.Should().BeTrue();
    }

    [Fact]
    public void RecordSync_WithAuthenticationFailure_ShouldAutoDisconnect()
    {
        // Arrange
        var integration = CreateIntegration();
        integration.Connect();
        var authError = "Authentication failed: Invalid API key";

        // Act
        integration.RecordSync(false, authError);

        // Assert
        integration.LastSyncStatus.Should().Be("Failed");
        integration.LastError.Should().Be(authError);
        integration.IsConnected.Should().BeFalse(); // Auto-disconnected due to auth error
        integration.IsActive.Should().BeFalse();
    }

    [Theory]
    [InlineData("Authentication error")]
    [InlineData("Invalid authentication")]
    [InlineData("Authentication token expired")]
    [InlineData("AUTHENTICATION FAILED")]
    public void RecordSync_WithVariousAuthErrors_ShouldAutoDisconnect(string authError)
    {
        // Arrange
        var integration = CreateIntegration();
        integration.Connect();

        // Act
        integration.RecordSync(false, authError);

        // Assert
        integration.IsConnected.Should().BeFalse();
        integration.IsActive.Should().BeFalse();
    }

    [Theory]
    [InlineData("Network error")]
    [InlineData("Timeout")]
    [InlineData("Server unavailable")]
    [InlineData("Rate limit exceeded")]
    public void RecordSync_WithNonAuthErrors_ShouldStayConnected(string error)
    {
        // Arrange
        var integration = CreateIntegration();
        integration.Connect();

        // Act
        integration.RecordSync(false, error);

        // Assert
        integration.IsConnected.Should().BeTrue(); // Should remain connected
        integration.IsActive.Should().BeTrue();
        integration.LastError.Should().Be(error);
    }

    [Fact]
    public void RecordSync_MultipleTimes_ShouldUpdateEachTime()
    {
        // Arrange
        var integration = CreateIntegration();
        integration.Connect();

        // Act & Assert
        integration.RecordSync(true);
        var firstSyncTime = integration.LastSyncAt;
        integration.LastSyncStatus.Should().Be("Success");
        integration.LastError.Should().BeNull();

        System.Threading.Thread.Sleep(10); // Small delay to ensure time difference

        integration.RecordSync(false, "Network error");
        var secondSyncTime = integration.LastSyncAt;
        integration.LastSyncStatus.Should().Be("Failed");
        integration.LastError.Should().Be("Network error");

        System.Threading.Thread.Sleep(10);

        integration.RecordSync(true);
        var thirdSyncTime = integration.LastSyncAt;
        integration.LastSyncStatus.Should().Be("Success");
        integration.LastError.Should().BeNull(); // Cleared after success

        // Verify times are different
        secondSyncTime.Should().BeAfter(firstSyncTime!.Value);
        thirdSyncTime.Should().BeAfter(secondSyncTime!.Value);
    }

    [Fact]
    public void Activate_WhenConnected_ShouldActivate()
    {
        // Arrange
        var integration = CreateIntegration();
        integration.Connect();
        integration.Deactivate(); // Deactivate first

        // Act
        integration.Activate();

        // Assert
        integration.IsActive.Should().BeTrue();
    }

    [Fact]
    public void Activate_WhenNotConnected_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var integration = CreateIntegration();

        // Act
        var action = () => integration.Activate();

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Cannot activate a disconnected integration.");
    }

    [Fact]
    public void Activate_AfterDisconnect_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var integration = CreateIntegration();
        integration.Connect();
        integration.Disconnect();

        // Act
        var action = () => integration.Activate();

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Cannot activate a disconnected integration.");
    }

    [Fact]
    public void Deactivate_ShouldDeactivate()
    {
        // Arrange
        var integration = CreateIntegration();
        integration.Connect();

        // Act
        integration.Deactivate();

        // Assert
        integration.IsActive.Should().BeFalse();
        integration.IsConnected.Should().BeTrue(); // Should remain connected
    }

    [Fact]
    public void Deactivate_WhenNotActive_ShouldStillDeactivate()
    {
        // Arrange
        var integration = CreateIntegration();

        // Act
        integration.Deactivate();

        // Assert
        integration.IsActive.Should().BeFalse();
    }

    [Fact]
    public void IsTokenExpired_WithExpiredToken_ShouldReturnTrue()
    {
        // Arrange
        var integration = CreateIntegration();
        var expiredDate = DateTime.UtcNow.AddMinutes(-1);
        integration.Connect(
            refreshToken: "token",
            tokenExpiresAt: expiredDate);

        // Act
        var result = integration.IsTokenExpired();

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void IsTokenExpired_WithValidToken_ShouldReturnFalse()
    {
        // Arrange
        var integration = CreateIntegration();
        var futureDate = DateTime.UtcNow.AddHours(1);
        integration.Connect(
            refreshToken: "token",
            tokenExpiresAt: futureDate);

        // Act
        var result = integration.IsTokenExpired();

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public void IsTokenExpired_WithNoToken_ShouldReturnFalse()
    {
        // Arrange
        var integration = CreateIntegration();
        integration.Connect();

        // Act
        var result = integration.IsTokenExpired();

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public void CompleteIntegrationLifecycle_ShouldWorkCorrectly()
    {
        // Arrange
        var integration = TenantIntegration.Create(
            "Microsoft Teams",
            "Teams",
            "{\"tenant\":\"contoso\",\"channel\":\"general\"}",
            CreatedBy,
            "Teams integration for collaboration");

        // Act & Assert - Initial state
        integration.IsConnected.Should().BeFalse();
        integration.IsActive.Should().BeFalse();

        // Connect with OAuth
        var refreshToken = "refresh-abc123";
        var apiKey = "api-key-xyz789";
        var tokenExpiry = DateTime.UtcNow.AddDays(30);
        integration.Connect(apiKey, refreshToken, tokenExpiry);
        integration.IsConnected.Should().BeTrue();
        integration.IsActive.Should().BeTrue();

        // Perform successful sync
        integration.RecordSync(true);
        integration.LastSyncStatus.Should().Be("Success");

        // Update configuration
        integration.UpdateConfiguration("{\"tenant\":\"contoso\",\"channel\":\"development\"}");

        // Perform another sync
        integration.RecordSync(true);

        // Token refresh needed - update tokens
        var newToken = "new-refresh-token";
        var newExpiry = DateTime.UtcNow.AddDays(30);
        integration.UpdateTokens(apiKey, newToken, newExpiry);
        integration.RefreshToken.Should().Be(newToken);

        // Sync fails with network error
        integration.RecordSync(false, "Network timeout");
        integration.IsConnected.Should().BeTrue(); // Still connected
        integration.LastError.Should().Be("Network timeout");

        // Sync succeeds again
        integration.RecordSync(true);
        integration.LastError.Should().BeNull(); // Error cleared

        // Deactivate temporarily
        integration.Deactivate();
        integration.IsActive.Should().BeFalse();
        integration.IsConnected.Should().BeTrue(); // Still connected

        // Reactivate
        integration.Activate();
        integration.IsActive.Should().BeTrue();

        // Authentication failure occurs
        integration.RecordSync(false, "Authentication failed: Token revoked");
        integration.IsConnected.Should().BeFalse(); // Auto-disconnected
        integration.IsActive.Should().BeFalse();

        // Reconnect with new credentials
        integration.Connect("new-api-key", "new-refresh", DateTime.UtcNow.AddDays(60));
        integration.IsConnected.Should().BeTrue();
        integration.IsActive.Should().BeTrue();

        // Manually disconnect
        integration.Disconnect();
        integration.IsConnected.Should().BeFalse();
        integration.IsActive.Should().BeFalse();
        integration.ApiKey.Should().BeNull();
        integration.RefreshToken.Should().BeNull();
    }

    [Fact]
    public void TokenRefreshWorkflow_ShouldWorkCorrectly()
    {
        // Arrange
        var integration = CreateIntegration();
        var initialToken = "initial-token";
        var initialExpiry = DateTime.UtcNow.AddHours(1);

        // Act - Connect with initial token
        integration.Connect(
            refreshToken: initialToken,
            tokenExpiresAt: initialExpiry);

        // Assert - Initial state
        integration.RefreshToken.Should().Be(initialToken);
        integration.TokenExpiresAt.Should().Be(initialExpiry);
        integration.IsTokenExpired().Should().BeFalse();

        // Act - Token about to expire, refresh it
        var refreshedToken = "refreshed-token";
        var newExpiry = DateTime.UtcNow.AddHours(2);
        integration.UpdateTokens(null, refreshedToken, newExpiry);

        // Assert - Updated token
        integration.RefreshToken.Should().Be(refreshedToken);
        integration.TokenExpiresAt.Should().Be(newExpiry);
        integration.IsTokenExpired().Should().BeFalse();
    }

    private TenantIntegration CreateIntegration()
    {
        return TenantIntegration.Create(
            Name,
            Type,
            Configuration,
            CreatedBy,
            Description);
    }
}