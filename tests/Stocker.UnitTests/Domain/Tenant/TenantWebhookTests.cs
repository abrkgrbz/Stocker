using FluentAssertions;
using Stocker.Domain.Tenant.Entities;
using System.Text.Json;
using Xunit;

namespace Stocker.UnitTests.Domain.Tenant;

public class TenantWebhookTests
{
    private const string Name = "Order Notification Webhook";
    private const string Url = "https://api.example.com/webhooks/orders";
    private const string CreatedBy = "admin@test.com";
    private const string ModifiedBy = "manager@test.com";
    private const string Description = "Webhook for order notifications";

    [Fact]
    public void Create_WithValidData_ShouldCreateWebhook()
    {
        // Act
        var webhook = TenantWebhook.Create(
            Name,
            Url,
            WebhookEventType.OrderCreated,
            CreatedBy,
            description: Description);

        // Assert
        webhook.Should().NotBeNull();
        webhook.Id.Should().NotBeEmpty();
        webhook.Name.Should().Be(Name);
        webhook.Url.Should().Be(Url);
        webhook.EventType.Should().Be(WebhookEventType.OrderCreated);
        webhook.Description.Should().Be(Description);
        webhook.Secret.Should().NotBeNullOrWhiteSpace();
        webhook.IsActive.Should().BeTrue();
        webhook.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        webhook.CreatedBy.Should().Be(CreatedBy);
        
        // Default configuration
        webhook.HttpMethod.Should().Be("POST");
        webhook.ContentType.Should().Be("application/json");
        webhook.TimeoutSeconds.Should().Be(30);
        webhook.MaxRetries.Should().Be(3);
        webhook.RetryDelaySeconds.Should().Be(60);
        webhook.AuthType.Should().Be(WebhookAuthType.None);
        webhook.IncludePayload.Should().BeTrue();
        webhook.OnlyOnSuccess.Should().BeFalse();
        
        // Statistics should be zero
        webhook.TriggerCount.Should().Be(0);
        webhook.SuccessCount.Should().Be(0);
        webhook.FailureCount.Should().Be(0);
        webhook.AverageResponseTime.Should().Be(0);
    }

    [Fact]
    public void Create_WithCustomSecret_ShouldUseProvidedSecret()
    {
        // Arrange
        var customSecret = "custom-secret-key-12345";

        // Act
        var webhook = TenantWebhook.Create(
            Name,
            Url,
            WebhookEventType.OrderCreated,
            CreatedBy,
            secret: customSecret);

        // Assert
        webhook.Secret.Should().Be(customSecret);
    }

    [Fact]
    public void Create_WithoutSecret_ShouldGenerateSecret()
    {
        // Act
        var webhook = TenantWebhook.Create(
            Name,
            Url,
            WebhookEventType.OrderCreated,
            CreatedBy);

        // Assert
        webhook.Secret.Should().NotBeNullOrWhiteSpace();
        webhook.Secret.Length.Should().BeGreaterThan(20); // Base64 encoded 32 bytes
    }

    [Fact]
    public void Create_WithNullName_ShouldThrowArgumentException()
    {
        // Act
        var action = () => TenantWebhook.Create(
            null!,
            Url,
            WebhookEventType.OrderCreated,
            CreatedBy);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Webhook name is required*")
            .WithParameterName("name");
    }

    [Fact]
    public void Create_WithEmptyName_ShouldThrowArgumentException()
    {
        // Act
        var action = () => TenantWebhook.Create(
            "",
            Url,
            WebhookEventType.OrderCreated,
            CreatedBy);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Webhook name is required*")
            .WithParameterName("name");
    }

    [Fact]
    public void Create_WithNullUrl_ShouldThrowArgumentException()
    {
        // Act
        var action = () => TenantWebhook.Create(
            Name,
            null!,
            WebhookEventType.OrderCreated,
            CreatedBy);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Webhook URL is required*")
            .WithParameterName("url");
    }

    [Fact]
    public void Create_WithInvalidUrl_ShouldThrowArgumentException()
    {
        // Act
        var action = () => TenantWebhook.Create(
            Name,
            "not-a-valid-url",
            WebhookEventType.OrderCreated,
            CreatedBy);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Invalid webhook URL format*")
            .WithParameterName("url");
    }

    [Theory]
    [InlineData("http://example.com/webhook")]
    [InlineData("https://api.example.com/v1/hooks")]
    [InlineData("https://example.com:8080/webhook")]
    [InlineData("https://subdomain.example.com/path/to/webhook")]
    public void Create_WithValidUrls_ShouldAcceptAll(string validUrl)
    {
        // Act
        var webhook = TenantWebhook.Create(
            Name,
            validUrl,
            WebhookEventType.OrderCreated,
            CreatedBy);

        // Assert
        webhook.Url.Should().Be(validUrl);
    }

    [Fact]
    public void Create_WithNullCreatedBy_ShouldThrowArgumentException()
    {
        // Act
        var action = () => TenantWebhook.Create(
            Name,
            Url,
            WebhookEventType.OrderCreated,
            null!);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Creator is required*")
            .WithParameterName("createdBy");
    }

    [Fact]
    public void UpdateConfiguration_WithValidHttpMethod_ShouldUpdate()
    {
        // Arrange
        var webhook = CreateWebhook();

        // Act
        webhook.UpdateConfiguration(
            httpMethod: "PUT",
            modifiedBy: ModifiedBy);

        // Assert
        webhook.HttpMethod.Should().Be("PUT");
        webhook.ModifiedAt.Should().NotBeNull();
        webhook.ModifiedBy.Should().Be(ModifiedBy);
    }

    [Theory]
    [InlineData("GET")]
    [InlineData("POST")]
    [InlineData("PUT")]
    [InlineData("PATCH")]
    [InlineData("DELETE")]
    [InlineData("get")] // Should be case-insensitive
    [InlineData("Post")]
    public void UpdateConfiguration_WithValidHttpMethods_ShouldAcceptAll(string method)
    {
        // Arrange
        var webhook = CreateWebhook();

        // Act
        webhook.UpdateConfiguration(httpMethod: method);

        // Assert
        webhook.HttpMethod.Should().Be(method.ToUpper());
    }

    [Fact]
    public void UpdateConfiguration_WithInvalidHttpMethod_ShouldThrowArgumentException()
    {
        // Arrange
        var webhook = CreateWebhook();

        // Act
        var action = () => webhook.UpdateConfiguration(httpMethod: "INVALID");

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Invalid HTTP method*")
            .WithParameterName("httpMethod");
    }

    [Fact]
    public void UpdateConfiguration_WithValidTimeout_ShouldUpdate()
    {
        // Arrange
        var webhook = CreateWebhook();

        // Act
        webhook.UpdateConfiguration(timeoutSeconds: 120);

        // Assert
        webhook.TimeoutSeconds.Should().Be(120);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(301)]
    [InlineData(-1)]
    public void UpdateConfiguration_WithInvalidTimeout_ShouldThrowArgumentException(int invalidTimeout)
    {
        // Arrange
        var webhook = CreateWebhook();

        // Act
        var action = () => webhook.UpdateConfiguration(timeoutSeconds: invalidTimeout);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Timeout must be between 1 and 300 seconds*")
            .WithParameterName("timeoutSeconds");
    }

    [Theory]
    [InlineData(0)]
    [InlineData(5)]
    [InlineData(10)]
    public void UpdateConfiguration_WithValidMaxRetries_ShouldUpdate(int retries)
    {
        // Arrange
        var webhook = CreateWebhook();

        // Act
        webhook.UpdateConfiguration(maxRetries: retries);

        // Assert
        webhook.MaxRetries.Should().Be(retries);
    }

    [Theory]
    [InlineData(-1)]
    [InlineData(11)]
    [InlineData(100)]
    public void UpdateConfiguration_WithInvalidMaxRetries_ShouldThrowArgumentException(int invalidRetries)
    {
        // Arrange
        var webhook = CreateWebhook();

        // Act
        var action = () => webhook.UpdateConfiguration(maxRetries: invalidRetries);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Max retries must be between 0 and 10*")
            .WithParameterName("maxRetries");
    }

    [Theory]
    [InlineData(1)]
    [InlineData(60)]
    [InlineData(3600)]
    public void UpdateConfiguration_WithValidRetryDelay_ShouldUpdate(int delay)
    {
        // Arrange
        var webhook = CreateWebhook();

        // Act
        webhook.UpdateConfiguration(retryDelaySeconds: delay);

        // Assert
        webhook.RetryDelaySeconds.Should().Be(delay);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(3601)]
    [InlineData(-1)]
    public void UpdateConfiguration_WithInvalidRetryDelay_ShouldThrowArgumentException(int invalidDelay)
    {
        // Arrange
        var webhook = CreateWebhook();

        // Act
        var action = () => webhook.UpdateConfiguration(retryDelaySeconds: invalidDelay);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Retry delay must be between 1 and 3600 seconds*")
            .WithParameterName("retryDelaySeconds");
    }

    [Fact]
    public void UpdateConfiguration_WithHeaders_ShouldUpdate()
    {
        // Arrange
        var webhook = CreateWebhook();
        var headers = JsonSerializer.Serialize(new Dictionary<string, string>
        {
            ["X-Custom-Header"] = "value1",
            ["X-Another-Header"] = "value2"
        });

        // Act
        webhook.UpdateConfiguration(headers: headers);

        // Assert
        webhook.Headers.Should().Be(headers);
    }

    [Fact]
    public void UpdateConfiguration_WithContentType_ShouldUpdate()
    {
        // Arrange
        var webhook = CreateWebhook();
        var contentType = "application/xml";

        // Act
        webhook.UpdateConfiguration(contentType: contentType);

        // Assert
        webhook.ContentType.Should().Be(contentType);
    }

    [Fact]
    public void SetAuthentication_WithBearerAuth_ShouldConfigureCorrectly()
    {
        // Arrange
        var webhook = CreateWebhook();
        var token = "bearer-token-12345";

        // Act
        webhook.SetAuthentication(
            WebhookAuthType.Bearer,
            authToken: token,
            modifiedBy: ModifiedBy);

        // Assert
        webhook.AuthType.Should().Be(WebhookAuthType.Bearer);
        webhook.AuthToken.Should().Be(token);
        webhook.AuthHeaderName.Should().Be("Authorization");
        webhook.BasicAuthUsername.Should().BeNull();
        webhook.BasicAuthPassword.Should().BeNull();
        webhook.ModifiedBy.Should().Be(ModifiedBy);
    }

    [Fact]
    public void SetAuthentication_WithBearerAuthMissingToken_ShouldThrowArgumentException()
    {
        // Arrange
        var webhook = CreateWebhook();

        // Act
        var action = () => webhook.SetAuthentication(
            WebhookAuthType.Bearer,
            authToken: null);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Auth token is required for Bearer authentication*");
    }

    [Fact]
    public void SetAuthentication_WithApiKey_ShouldConfigureCorrectly()
    {
        // Arrange
        var webhook = CreateWebhook();
        var apiKey = "api-key-xyz789";
        var headerName = "X-API-Key";

        // Act
        webhook.SetAuthentication(
            WebhookAuthType.ApiKey,
            authToken: apiKey,
            authHeaderName: headerName);

        // Assert
        webhook.AuthType.Should().Be(WebhookAuthType.ApiKey);
        webhook.AuthToken.Should().Be(apiKey);
        webhook.AuthHeaderName.Should().Be(headerName);
        webhook.BasicAuthUsername.Should().BeNull();
        webhook.BasicAuthPassword.Should().BeNull();
    }

    [Fact]
    public void SetAuthentication_WithApiKeyMissingParameters_ShouldThrowArgumentException()
    {
        // Arrange
        var webhook = CreateWebhook();

        // Act
        var action = () => webhook.SetAuthentication(
            WebhookAuthType.ApiKey,
            authToken: "key",
            authHeaderName: null);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("API key and header name are required for API key authentication*");
    }

    [Fact]
    public void SetAuthentication_WithBasicAuth_ShouldConfigureCorrectly()
    {
        // Arrange
        var webhook = CreateWebhook();
        var username = "user123";
        var password = "pass456";

        // Act
        webhook.SetAuthentication(
            WebhookAuthType.Basic,
            basicAuthUsername: username,
            basicAuthPassword: password);

        // Assert
        webhook.AuthType.Should().Be(WebhookAuthType.Basic);
        webhook.BasicAuthUsername.Should().Be(username);
        webhook.BasicAuthPassword.Should().Be(password);
        webhook.AuthHeaderName.Should().Be("Authorization");
        webhook.AuthToken.Should().BeNull();
    }

    [Fact]
    public void SetAuthentication_WithBasicAuthMissingCredentials_ShouldThrowArgumentException()
    {
        // Arrange
        var webhook = CreateWebhook();

        // Act
        var action = () => webhook.SetAuthentication(
            WebhookAuthType.Basic,
            basicAuthUsername: "user",
            basicAuthPassword: null);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Username and password are required for Basic authentication*");
    }

    [Fact]
    public void SetAuthentication_WithNone_ShouldClearAllAuth()
    {
        // Arrange
        var webhook = CreateWebhook();
        // First set some auth
        webhook.SetAuthentication(
            WebhookAuthType.Bearer,
            authToken: "token");

        // Act
        webhook.SetAuthentication(WebhookAuthType.None);

        // Assert
        webhook.AuthType.Should().Be(WebhookAuthType.None);
        webhook.AuthToken.Should().BeNull();
        webhook.AuthHeaderName.Should().BeNull();
        webhook.BasicAuthUsername.Should().BeNull();
        webhook.BasicAuthPassword.Should().BeNull();
    }

    [Fact]
    public void SetFilters_ShouldUpdateAllFilterSettings()
    {
        // Arrange
        var webhook = CreateWebhook();
        var filters = JsonSerializer.Serialize(new { status = "completed", amount_gt = 100 });
        var template = "{ \"order_id\": \"{{id}}\", \"amount\": \"{{amount}}\" }";

        // Act
        webhook.SetFilters(
            eventFilters: filters,
            payloadTemplate: template,
            onlyOnSuccess: true,
            includePayload: false,
            modifiedBy: ModifiedBy);

        // Assert
        webhook.EventFilters.Should().Be(filters);
        webhook.PayloadTemplate.Should().Be(template);
        webhook.OnlyOnSuccess.Should().BeTrue();
        webhook.IncludePayload.Should().BeFalse();
        webhook.ModifiedBy.Should().Be(ModifiedBy);
    }

    [Fact]
    public void SetRateLimit_WithValidLimit_ShouldUpdate()
    {
        // Arrange
        var webhook = CreateWebhook();
        var rateLimit = 100;

        // Act
        webhook.SetRateLimit(rateLimit, ModifiedBy);

        // Assert
        webhook.RateLimitPerMinute.Should().Be(rateLimit);
        webhook.ModifiedBy.Should().Be(ModifiedBy);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(1001)]
    [InlineData(-1)]
    public void SetRateLimit_WithInvalidLimit_ShouldThrowArgumentException(int invalidLimit)
    {
        // Arrange
        var webhook = CreateWebhook();

        // Act
        var action = () => webhook.SetRateLimit(invalidLimit, ModifiedBy);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Rate limit must be between 1 and 1000 per minute*")
            .WithParameterName("rateLimitPerMinute");
    }

    [Fact]
    public void SetRateLimit_WithNull_ShouldClearLimit()
    {
        // Arrange
        var webhook = CreateWebhook();
        webhook.SetRateLimit(100, ModifiedBy);

        // Act
        webhook.SetRateLimit(null, ModifiedBy);

        // Assert
        webhook.RateLimitPerMinute.Should().BeNull();
    }

    [Fact]
    public void RecordTrigger_ShouldUpdateTriggerInfo()
    {
        // Arrange
        var webhook = CreateWebhook();
        var initialCount = webhook.TriggerCount;

        // Act
        webhook.RecordTrigger();

        // Assert
        webhook.LastTriggeredAt.Should().NotBeNull();
        webhook.LastTriggeredAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        webhook.TriggerCount.Should().Be(initialCount + 1);
    }

    [Fact]
    public void RecordSuccess_ShouldUpdateSuccessStatistics()
    {
        // Arrange
        var webhook = CreateWebhook();
        var responseTime = 250.5;

        // Act
        webhook.RecordSuccess(responseTime);

        // Assert
        webhook.SuccessCount.Should().Be(1);
        webhook.LastSuccessAt.Should().NotBeNull();
        webhook.LastSuccessAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        webhook.LastError.Should().BeNull();
        webhook.AverageResponseTime.Should().Be(responseTime);
    }

    [Fact]
    public void RecordSuccess_MultipleTimes_ShouldCalculateAverageResponseTime()
    {
        // Arrange
        var webhook = CreateWebhook();

        // Act
        webhook.RecordSuccess(100);
        webhook.RecordSuccess(200);
        webhook.RecordSuccess(300);

        // Assert
        webhook.SuccessCount.Should().Be(3);
        webhook.AverageResponseTime.Should().Be(200); // (100 + 200 + 300) / 3
    }

    [Fact]
    public void RecordFailure_ShouldUpdateFailureStatistics()
    {
        // Arrange
        var webhook = CreateWebhook();
        var error = "Connection timeout";

        // Act
        webhook.RecordFailure(error);

        // Assert
        webhook.FailureCount.Should().Be(1);
        webhook.LastFailureAt.Should().NotBeNull();
        webhook.LastFailureAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        webhook.LastError.Should().Be(error);
    }

    [Fact]
    public void RecordFailure_AfterSuccess_ShouldPreserveSuccessInfo()
    {
        // Arrange
        var webhook = CreateWebhook();
        webhook.RecordSuccess(100);
        var successTime = webhook.LastSuccessAt;

        // Act
        webhook.RecordFailure("Error occurred");

        // Assert
        webhook.LastSuccessAt.Should().Be(successTime);
        webhook.SuccessCount.Should().Be(1);
        webhook.FailureCount.Should().Be(1);
        webhook.LastError.Should().Be("Error occurred");
    }

    [Fact]
    public void Activate_WhenInactive_ShouldActivate()
    {
        // Arrange
        var webhook = CreateWebhook();
        webhook.Deactivate("admin");

        // Act
        webhook.Activate(ModifiedBy);

        // Assert
        webhook.IsActive.Should().BeTrue();
        webhook.DeactivatedAt.Should().BeNull();
        webhook.DeactivatedBy.Should().BeNull();
        webhook.ModifiedBy.Should().Be(ModifiedBy);
    }

    [Fact]
    public void Activate_WhenAlreadyActive_ShouldNotChange()
    {
        // Arrange
        var webhook = CreateWebhook();
        var originalModifiedAt = webhook.ModifiedAt;

        // Act
        webhook.Activate(ModifiedBy);

        // Assert
        webhook.IsActive.Should().BeTrue();
        webhook.ModifiedAt.Should().Be(originalModifiedAt); // Should not update if already active
    }

    [Fact]
    public void Deactivate_WhenActive_ShouldDeactivate()
    {
        // Arrange
        var webhook = CreateWebhook();

        // Act
        webhook.Deactivate(ModifiedBy);

        // Assert
        webhook.IsActive.Should().BeFalse();
        webhook.DeactivatedAt.Should().NotBeNull();
        webhook.DeactivatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        webhook.DeactivatedBy.Should().Be(ModifiedBy);
        webhook.ModifiedBy.Should().Be(ModifiedBy);
    }

    [Fact]
    public void Deactivate_WhenAlreadyInactive_ShouldNotChange()
    {
        // Arrange
        var webhook = CreateWebhook();
        webhook.Deactivate("admin");
        var originalDeactivatedAt = webhook.DeactivatedAt;

        // Act
        webhook.Deactivate(ModifiedBy);

        // Assert
        webhook.IsActive.Should().BeFalse();
        webhook.DeactivatedAt.Should().Be(originalDeactivatedAt); // Should not update if already inactive
    }

    [Fact]
    public void UpdateUrl_WithValidUrl_ShouldUpdate()
    {
        // Arrange
        var webhook = CreateWebhook();
        var newUrl = "https://new-api.example.com/webhooks";

        // Act
        webhook.UpdateUrl(newUrl, ModifiedBy);

        // Assert
        webhook.Url.Should().Be(newUrl);
        webhook.ModifiedBy.Should().Be(ModifiedBy);
        webhook.ModifiedAt.Should().NotBeNull();
    }

    [Fact]
    public void UpdateUrl_WithInvalidUrl_ShouldThrowArgumentException()
    {
        // Arrange
        var webhook = CreateWebhook();

        // Act
        var action = () => webhook.UpdateUrl("invalid-url", ModifiedBy);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Invalid webhook URL format*")
            .WithParameterName("url");
    }

    [Fact]
    public void UpdateUrl_WithNullUrl_ShouldThrowArgumentException()
    {
        // Arrange
        var webhook = CreateWebhook();

        // Act
        var action = () => webhook.UpdateUrl(null!, ModifiedBy);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Webhook URL is required*")
            .WithParameterName("url");
    }

    [Fact]
    public void RegenerateSecret_ShouldCreateNewSecret()
    {
        // Arrange
        var webhook = CreateWebhook();
        var originalSecret = webhook.Secret;

        // Act
        webhook.RegenerateSecret(ModifiedBy);

        // Assert
        webhook.Secret.Should().NotBe(originalSecret);
        webhook.Secret.Should().NotBeNullOrWhiteSpace();
        webhook.ModifiedBy.Should().Be(ModifiedBy);
        webhook.ModifiedAt.Should().NotBeNull();
    }

    [Fact]
    public void IsRateLimited_WithNoRateLimit_ShouldReturnFalse()
    {
        // Arrange
        var webhook = CreateWebhook();

        // Act
        var result = webhook.IsRateLimited();

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public void IsRateLimited_WithNoRecentTriggers_ShouldReturnFalse()
    {
        // Arrange
        var webhook = CreateWebhook();
        webhook.SetRateLimit(10, ModifiedBy);

        // Act
        var result = webhook.IsRateLimited();

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public void IsRateLimited_WithRecentTriggersExceedingLimit_ShouldReturnTrue()
    {
        // Arrange
        var webhook = CreateWebhook();
        webhook.SetRateLimit(2, ModifiedBy);
        
        // Simulate reaching the rate limit
        webhook.RecordTrigger();
        webhook.RecordTrigger();

        // Act
        var result = webhook.IsRateLimited();

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void CompleteWebhookLifecycle_ShouldWorkCorrectly()
    {
        // Arrange & Act
        var webhook = TenantWebhook.Create(
            "Payment Webhook",
            "https://api.payment.com/webhooks",
            WebhookEventType.PaymentReceived,
            CreatedBy,
            description: "Webhook for payment notifications");

        // Initial configuration
        webhook.UpdateConfiguration(
            httpMethod: "POST",
            contentType: "application/json",
            timeoutSeconds: 60,
            maxRetries: 5,
            retryDelaySeconds: 30,
            modifiedBy: "config@test.com");

        // Set authentication
        webhook.SetAuthentication(
            WebhookAuthType.Bearer,
            authToken: "secret-token-xyz",
            modifiedBy: "security@test.com");

        // Set filters
        var filters = JsonSerializer.Serialize(new { amount_gt = 100, currency = "USD" });
        webhook.SetFilters(
            eventFilters: filters,
            payloadTemplate: null,
            onlyOnSuccess: false,
            includePayload: true,
            modifiedBy: "admin@test.com");

        // Set rate limit
        webhook.SetRateLimit(60, "admin@test.com");

        // Simulate webhook triggers
        webhook.RecordTrigger();
        webhook.RecordSuccess(150.5);
        
        webhook.RecordTrigger();
        webhook.RecordSuccess(200.3);
        
        webhook.RecordTrigger();
        webhook.RecordFailure("Timeout error");
        
        webhook.RecordTrigger();
        webhook.RecordSuccess(175.8);

        // Assert final state
        webhook.TriggerCount.Should().Be(4);
        webhook.SuccessCount.Should().Be(3);
        webhook.FailureCount.Should().Be(1);
        webhook.AverageResponseTime.Should().BeApproximately(175.53, 0.01); // (150.5 + 200.3 + 175.8) / 3
        webhook.LastError.Should().BeNull(); // Cleared after last success
        webhook.LastSuccessAt.Should().NotBeNull();
        webhook.LastFailureAt.Should().NotBeNull();

        // Deactivate webhook
        webhook.Deactivate("admin@test.com");
        webhook.IsActive.Should().BeFalse();
        webhook.DeactivatedBy.Should().Be("admin@test.com");

        // Reactivate
        webhook.Activate("admin@test.com");
        webhook.IsActive.Should().BeTrue();
        webhook.DeactivatedAt.Should().BeNull();

        // Update URL
        webhook.UpdateUrl("https://new-api.payment.com/v2/webhooks", "admin@test.com");
        webhook.Url.Should().Be("https://new-api.payment.com/v2/webhooks");

        // Regenerate secret
        var oldSecret = webhook.Secret;
        webhook.RegenerateSecret("security@test.com");
        webhook.Secret.Should().NotBe(oldSecret);
    }

    [Theory]
    [InlineData(WebhookEventType.All)]
    [InlineData(WebhookEventType.UserCreated)]
    [InlineData(WebhookEventType.OrderCreated)]
    [InlineData(WebhookEventType.PaymentReceived)]
    [InlineData(WebhookEventType.InventoryLow)]
    [InlineData(WebhookEventType.Custom)]
    public void Create_WithDifferentEventTypes_ShouldAcceptAll(WebhookEventType eventType)
    {
        // Act
        var webhook = TenantWebhook.Create(
            Name,
            Url,
            eventType,
            CreatedBy);

        // Assert
        webhook.EventType.Should().Be(eventType);
    }

    private TenantWebhook CreateWebhook()
    {
        return TenantWebhook.Create(
            Name,
            Url,
            WebhookEventType.OrderCreated,
            CreatedBy,
            description: Description);
    }
}