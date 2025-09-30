using FluentAssertions;
using Stocker.Domain.Tenant.Entities;
using Xunit;

namespace Stocker.UnitTests.Domain.Tenant;

public class TenantApiKeyTests
{
    private const string Name = "Test API Key";
    private const string Description = "API Key for testing";
    private const ApiKeyType KeyType = ApiKeyType.Application;
    private const string CreatedBy = "admin@test.com";

    [Fact]
    public void Create_WithValidData_ShouldCreateApiKeyAndReturnPlainKey()
    {
        // Act
        var (apiKey, plainKey) = TenantApiKey.Create(
            Name,
            Description,
            KeyType,
            CreatedBy);

        // Assert
        apiKey.Should().NotBeNull();
        apiKey.Id.Should().NotBeEmpty();
        apiKey.Name.Should().Be(Name);
        apiKey.Description.Should().Be(Description);
        apiKey.KeyType.Should().Be(KeyType);
        apiKey.CreatedBy.Should().Be(CreatedBy);
        apiKey.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        apiKey.Status.Should().Be(ApiKeyStatus.Active);
        apiKey.IsActive.Should().BeTrue();
        apiKey.RequireHttps.Should().BeTrue();
        apiKey.UsageCount.Should().Be(0);
        apiKey.ExpiresAt.Should().BeNull();
        
        plainKey.Should().NotBeNullOrWhiteSpace();
        plainKey.Should().StartWith("stk_");
        apiKey.KeyPrefix.Should().Be(plainKey.Substring(0, 8));
        apiKey.HashedKey.Should().NotBeNullOrWhiteSpace();
    }

    [Fact]
    public void Create_WithExpirationDate_ShouldSetExpiration()
    {
        // Arrange
        var expirationDate = DateTime.UtcNow.AddDays(30);

        // Act
        var (apiKey, _) = TenantApiKey.Create(
            Name,
            Description,
            KeyType,
            CreatedBy,
            expirationDate);

        // Assert
        apiKey.ExpiresAt.Should().Be(expirationDate);
    }

    [Fact]
    public void Create_WithNullName_ShouldThrowArgumentException()
    {
        // Act
        var action = () => TenantApiKey.Create(
            null!,
            Description,
            KeyType,
            CreatedBy);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("API key name cannot be empty.*")
            .WithParameterName("name");
    }

    [Fact]
    public void Create_WithEmptyName_ShouldThrowArgumentException()
    {
        // Act
        var action = () => TenantApiKey.Create(
            "",
            Description,
            KeyType,
            CreatedBy);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("API key name cannot be empty.*")
            .WithParameterName("name");
    }

    [Fact]
    public void Create_WithNullCreatedBy_ShouldThrowArgumentException()
    {
        // Act
        var action = () => TenantApiKey.Create(
            Name,
            Description,
            KeyType,
            null!);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Created by cannot be empty.*")
            .WithParameterName("createdBy");
    }

    [Fact]
    public void VerifyApiKey_WithCorrectKey_ShouldReturnTrue()
    {
        // Arrange
        var (apiKey, plainKey) = TenantApiKey.Create(
            Name,
            Description,
            KeyType,
            CreatedBy);

        // Act
        var result = apiKey.VerifyApiKey(plainKey);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void VerifyApiKey_WithIncorrectKey_ShouldReturnFalse()
    {
        // Arrange
        var (apiKey, _) = TenantApiKey.Create(
            Name,
            Description,
            KeyType,
            CreatedBy);

        // Act
        var result = apiKey.VerifyApiKey("stk_wrong_key_12345");

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public void VerifyApiKey_WithNullKey_ShouldReturnFalse()
    {
        // Arrange
        var (apiKey, _) = TenantApiKey.Create(
            Name,
            Description,
            KeyType,
            CreatedBy);

        // Act
        var result = apiKey.VerifyApiKey(null);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public void VerifyApiKey_WithEmptyKey_ShouldReturnFalse()
    {
        // Arrange
        var (apiKey, _) = TenantApiKey.Create(
            Name,
            Description,
            KeyType,
            CreatedBy);

        // Act
        var result = apiKey.VerifyApiKey("");

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public void SetScopes_ShouldUpdateScopes()
    {
        // Arrange
        var (apiKey, _) = CreateApiKey();
        var scopes = new List<string> { "read", "write", "delete" };

        // Act
        apiKey.SetScopes(scopes);

        // Assert
        apiKey.Scopes.Should().BeEquivalentTo(scopes);
    }

    [Fact]
    public void SetScopes_WithNullList_ShouldSetEmptyList()
    {
        // Arrange
        var (apiKey, _) = CreateApiKey();

        // Act
        apiKey.SetScopes(null);

        // Assert
        apiKey.Scopes.Should().BeEmpty();
    }

    [Fact]
    public void AddScope_WithNewScope_ShouldAddScope()
    {
        // Arrange
        var (apiKey, _) = CreateApiKey();
        apiKey.SetScopes(new List<string> { "read" });

        // Act
        apiKey.AddScope("write");

        // Assert
        apiKey.Scopes.Should().HaveCount(2);
        apiKey.Scopes.Should().Contain("read");
        apiKey.Scopes.Should().Contain("write");
    }

    [Fact]
    public void AddScope_WithExistingScope_ShouldNotDuplicate()
    {
        // Arrange
        var (apiKey, _) = CreateApiKey();
        apiKey.SetScopes(new List<string> { "read" });

        // Act
        apiKey.AddScope("read");

        // Assert
        apiKey.Scopes.Should().HaveCount(1);
        apiKey.Scopes.Should().Contain("read");
    }

    [Fact]
    public void AddScope_WithNullOrEmpty_ShouldNotAdd()
    {
        // Arrange
        var (apiKey, _) = CreateApiKey();

        // Act
        apiKey.AddScope(null);
        apiKey.AddScope("");
        apiKey.AddScope("  ");

        // Assert
        apiKey.Scopes.Should().BeEmpty();
    }

    [Fact]
    public void RemoveScope_WithExistingScope_ShouldRemove()
    {
        // Arrange
        var (apiKey, _) = CreateApiKey();
        apiKey.SetScopes(new List<string> { "read", "write", "delete" });

        // Act
        apiKey.RemoveScope("write");

        // Assert
        apiKey.Scopes.Should().HaveCount(2);
        apiKey.Scopes.Should().NotContain("write");
        apiKey.Scopes.Should().Contain("read");
        apiKey.Scopes.Should().Contain("delete");
    }

    [Fact]
    public void SetAllowedEndpoints_ShouldUpdateEndpoints()
    {
        // Arrange
        var (apiKey, _) = CreateApiKey();
        var endpoints = new List<string> { "/api/users", "/api/products" };

        // Act
        apiKey.SetAllowedEndpoints(endpoints);

        // Assert
        apiKey.AllowedEndpoints.Should().BeEquivalentTo(endpoints);
    }

    [Fact]
    public void SetAllowedMethods_ShouldUpdateMethods()
    {
        // Arrange
        var (apiKey, _) = CreateApiKey();
        var methods = new List<string> { "GET", "POST" };

        // Act
        apiKey.SetAllowedMethods(methods);

        // Assert
        apiKey.AllowedMethods.Should().BeEquivalentTo(methods);
    }

    [Fact]
    public void SetIpWhitelist_ShouldUpdateAllowedIps()
    {
        // Arrange
        var (apiKey, _) = CreateApiKey();
        var ips = new List<string> { "192.168.1.1", "10.0.0.1" };

        // Act
        apiKey.SetIpWhitelist(ips);

        // Assert
        apiKey.AllowedIpAddresses.Should().BeEquivalentTo(ips);
    }

    [Fact]
    public void SetDomainWhitelist_ShouldUpdateAllowedDomains()
    {
        // Arrange
        var (apiKey, _) = CreateApiKey();
        var domains = new List<string> { "example.com", "app.example.com" };

        // Act
        apiKey.SetDomainWhitelist(domains);

        // Assert
        apiKey.AllowedDomains.Should().BeEquivalentTo(domains);
    }

    [Fact]
    public void SetRateLimits_ShouldUpdateLimits()
    {
        // Arrange
        var (apiKey, _) = CreateApiKey();

        // Act
        apiKey.SetRateLimits(10, 500, 5000);

        // Assert
        apiKey.RateLimitPerMinute.Should().Be(10);
        apiKey.RateLimitPerHour.Should().Be(500);
        apiKey.RateLimitPerDay.Should().Be(5000);
    }

    [Fact]
    public void SetRateLimits_WithNulls_ShouldSetNulls()
    {
        // Arrange
        var (apiKey, _) = CreateApiKey();
        apiKey.SetRateLimits(10, 500, 5000);

        // Act
        apiKey.SetRateLimits(null, null, null);

        // Assert
        apiKey.RateLimitPerMinute.Should().BeNull();
        apiKey.RateLimitPerHour.Should().BeNull();
        apiKey.RateLimitPerDay.Should().BeNull();
    }

    [Fact]
    public void SetEnvironment_ShouldUpdateEnvironment()
    {
        // Arrange
        var (apiKey, _) = CreateApiKey();

        // Act
        apiKey.SetEnvironment("production");

        // Assert
        apiKey.Environment.Should().Be("production");
    }

    [Fact]
    public void AssociateWithUser_ShouldSetUserId()
    {
        // Arrange
        var (apiKey, _) = CreateApiKey();
        var userId = "user123";

        // Act
        apiKey.AssociateWithUser(userId);

        // Assert
        apiKey.AssociatedUserId.Should().Be(userId);
    }

    [Fact]
    public void AssociateWithApplication_ShouldSetApplication()
    {
        // Arrange
        var (apiKey, _) = CreateApiKey();
        var application = "MobileApp";

        // Act
        apiKey.AssociateWithApplication(application);

        // Assert
        apiKey.AssociatedApplication.Should().Be(application);
    }

    [Fact]
    public void SetMetadata_ShouldUpdateMetadata()
    {
        // Arrange
        var (apiKey, _) = CreateApiKey();
        var metadata = "{\"client\":\"TestClient\",\"version\":\"1.0\"}";

        // Act
        apiKey.SetMetadata(metadata);

        // Assert
        apiKey.Metadata.Should().Be(metadata);
    }

    [Fact]
    public void RecordUsage_ShouldIncrementCountAndUpdateDetails()
    {
        // Arrange
        var (apiKey, _) = CreateApiKey();
        var ipAddress = "192.168.1.100";
        var userAgent = "Mozilla/5.0";

        // Act
        apiKey.RecordUsage(ipAddress, userAgent);

        // Assert
        apiKey.UsageCount.Should().Be(1);
        apiKey.LastUsedAt.Should().NotBeNull();
        apiKey.LastUsedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        apiKey.LastUsedIp.Should().Be(ipAddress);
        apiKey.LastUsedUserAgent.Should().Be(userAgent);
    }

    [Fact]
    public void RecordUsage_MultipleTimes_ShouldIncrementCount()
    {
        // Arrange
        var (apiKey, _) = CreateApiKey();

        // Act
        apiKey.RecordUsage("192.168.1.1", "Agent1");
        apiKey.RecordUsage("192.168.1.2", "Agent2");
        apiKey.RecordUsage("192.168.1.3", "Agent3");

        // Assert
        apiKey.UsageCount.Should().Be(3);
        apiKey.LastUsedIp.Should().Be("192.168.1.3");
        apiKey.LastUsedUserAgent.Should().Be("Agent3");
    }

    [Fact]
    public void Activate_WhenNotRevoked_ShouldActivate()
    {
        // Arrange
        var (apiKey, _) = CreateApiKey();
        apiKey.Suspend("Testing");

        // Act
        apiKey.Activate();

        // Assert
        apiKey.Status.Should().Be(ApiKeyStatus.Active);
        apiKey.IsActive.Should().BeTrue();
    }

    [Fact]
    public void Activate_WhenRevoked_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var (apiKey, _) = CreateApiKey();
        apiKey.Revoke("admin", "Security breach");

        // Act
        var action = () => apiKey.Activate();

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Cannot activate a revoked API key.");
    }

    [Fact]
    public void Suspend_ShouldSuspendKey()
    {
        // Arrange
        var (apiKey, _) = CreateApiKey();
        var reason = "Suspicious activity detected";

        // Act
        apiKey.Suspend(reason);

        // Assert
        apiKey.Status.Should().Be(ApiKeyStatus.Suspended);
        apiKey.IsActive.Should().BeFalse();
        apiKey.Metadata.Should().Contain("suspensionReason");
    }

    [Fact]
    public void Revoke_WhenNotRevoked_ShouldRevokeKey()
    {
        // Arrange
        var (apiKey, _) = CreateApiKey();
        var revokedBy = "security@test.com";
        var reason = "Compromised key";

        // Act
        apiKey.Revoke(revokedBy, reason);

        // Assert
        apiKey.Status.Should().Be(ApiKeyStatus.Revoked);
        apiKey.IsActive.Should().BeFalse();
        apiKey.RevokedAt.Should().NotBeNull();
        apiKey.RevokedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        apiKey.RevokedBy.Should().Be(revokedBy);
        apiKey.RevocationReason.Should().Be(reason);
    }

    [Fact]
    public void Revoke_WhenAlreadyRevoked_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var (apiKey, _) = CreateApiKey();
        apiKey.Revoke("admin", "First revocation");

        // Act
        var action = () => apiKey.Revoke("admin", "Second revocation");

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("API key is already revoked.");
    }

    [Fact]
    public void Expire_ShouldExpireKey()
    {
        // Arrange
        var (apiKey, _) = CreateApiKey();

        // Act
        apiKey.Expire();

        // Assert
        apiKey.Status.Should().Be(ApiKeyStatus.Expired);
        apiKey.IsActive.Should().BeFalse();
    }

    [Fact]
    public void IsExpired_WithFutureExpiration_ShouldReturnFalse()
    {
        // Arrange
        var (apiKey, _) = TenantApiKey.Create(
            Name,
            Description,
            KeyType,
            CreatedBy,
            DateTime.UtcNow.AddDays(30));

        // Act
        var result = apiKey.IsExpired();

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public void IsExpired_WithPastExpiration_ShouldReturnTrue()
    {
        // Arrange
        var (apiKey, _) = TenantApiKey.Create(
            Name,
            Description,
            KeyType,
            CreatedBy,
            DateTime.UtcNow.AddDays(-1));

        // Act
        var result = apiKey.IsExpired();

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void IsExpired_WithNoExpiration_ShouldReturnFalse()
    {
        // Arrange
        var (apiKey, _) = CreateApiKey();

        // Act
        var result = apiKey.IsExpired();

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public void IsValidForIp_WithNoRestrictions_ShouldReturnTrue()
    {
        // Arrange
        var (apiKey, _) = CreateApiKey();

        // Act
        var result = apiKey.IsValidForIp("192.168.1.100");

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void IsValidForIp_WithAllowedIp_ShouldReturnTrue()
    {
        // Arrange
        var (apiKey, _) = CreateApiKey();
        apiKey.SetIpWhitelist(new List<string> { "192.168.1.100", "10.0.0.1" });

        // Act
        var result = apiKey.IsValidForIp("192.168.1.100");

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void IsValidForIp_WithNotAllowedIp_ShouldReturnFalse()
    {
        // Arrange
        var (apiKey, _) = CreateApiKey();
        apiKey.SetIpWhitelist(new List<string> { "192.168.1.100", "10.0.0.1" });

        // Act
        var result = apiKey.IsValidForIp("192.168.1.200");

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public void IsValidForDomain_WithNoRestrictions_ShouldReturnTrue()
    {
        // Arrange
        var (apiKey, _) = CreateApiKey();

        // Act
        var result = apiKey.IsValidForDomain("example.com");

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void IsValidForDomain_WithAllowedDomain_ShouldReturnTrue()
    {
        // Arrange
        var (apiKey, _) = CreateApiKey();
        apiKey.SetDomainWhitelist(new List<string> { "example.com", "app.example.com" });

        // Act
        var result = apiKey.IsValidForDomain("example.com");

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void IsValidForDomain_WithNotAllowedDomain_ShouldReturnFalse()
    {
        // Arrange
        var (apiKey, _) = CreateApiKey();
        apiKey.SetDomainWhitelist(new List<string> { "example.com", "app.example.com" });

        // Act
        var result = apiKey.IsValidForDomain("other.com");

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public void HasScope_WithExistingScope_ShouldReturnTrue()
    {
        // Arrange
        var (apiKey, _) = CreateApiKey();
        apiKey.SetScopes(new List<string> { "read", "write", "delete" });

        // Act
        var result = apiKey.HasScope("write");

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void HasScope_WithWildcardScope_ShouldReturnTrueForAny()
    {
        // Arrange
        var (apiKey, _) = CreateApiKey();
        apiKey.SetScopes(new List<string> { "*" });

        // Act
        var result = apiKey.HasScope("any.scope");

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void HasScope_WithNonExistentScope_ShouldReturnFalse()
    {
        // Arrange
        var (apiKey, _) = CreateApiKey();
        apiKey.SetScopes(new List<string> { "read", "write" });

        // Act
        var result = apiKey.HasScope("delete");

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public void CanAccessEndpoint_WithNoRestrictions_ShouldReturnTrue()
    {
        // Arrange
        var (apiKey, _) = CreateApiKey();

        // Act
        var result = apiKey.CanAccessEndpoint("/api/users", "GET");

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void CanAccessEndpoint_WithAllowedEndpointAndMethod_ShouldReturnTrue()
    {
        // Arrange
        var (apiKey, _) = CreateApiKey();
        apiKey.SetAllowedEndpoints(new List<string> { "/api/users", "/api/products" });
        apiKey.SetAllowedMethods(new List<string> { "GET", "POST" });

        // Act
        var result = apiKey.CanAccessEndpoint("/api/users", "GET");

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void CanAccessEndpoint_WithWildcardEndpoint_ShouldReturnTrue()
    {
        // Arrange
        var (apiKey, _) = CreateApiKey();
        apiKey.SetAllowedEndpoints(new List<string> { "*" });
        apiKey.SetAllowedMethods(new List<string> { "GET" });

        // Act
        var result = apiKey.CanAccessEndpoint("/api/any", "GET");

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void CanAccessEndpoint_WithWildcardMethod_ShouldReturnTrue()
    {
        // Arrange
        var (apiKey, _) = CreateApiKey();
        apiKey.SetAllowedEndpoints(new List<string> { "/api/users" });
        apiKey.SetAllowedMethods(new List<string> { "*" });

        // Act
        var result = apiKey.CanAccessEndpoint("/api/users", "DELETE");

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void CanAccessEndpoint_WithNotAllowedEndpoint_ShouldReturnFalse()
    {
        // Arrange
        var (apiKey, _) = CreateApiKey();
        apiKey.SetAllowedEndpoints(new List<string> { "/api/users" });

        // Act
        var result = apiKey.CanAccessEndpoint("/api/products", "GET");

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public void CanAccessEndpoint_WithNotAllowedMethod_ShouldReturnFalse()
    {
        // Arrange
        var (apiKey, _) = CreateApiKey();
        apiKey.SetAllowedMethods(new List<string> { "GET", "POST" });

        // Act
        var result = apiKey.CanAccessEndpoint("/api/users", "DELETE");

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public void CanAccessEndpoint_WithCaseInsensitiveMethod_ShouldWork()
    {
        // Arrange
        var (apiKey, _) = CreateApiKey();
        apiKey.SetAllowedMethods(new List<string> { "GET", "POST" });

        // Act
        var result = apiKey.CanAccessEndpoint("/api/users", "get");

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void CompleteApiKeyLifecycle_ShouldWorkCorrectly()
    {
        // Arrange & Act
        var (apiKey, plainKey) = TenantApiKey.Create(
            "Production API Key",
            "Main production API key for mobile app",
            ApiKeyType.Application,
            "admin@company.com",
            DateTime.UtcNow.AddYears(1));

        // Configure the API key
        apiKey.SetEnvironment("production");
        apiKey.AssociateWithApplication("MobileApp v2.0");
        apiKey.AssociateWithUser("app-service-account");
        
        // Set permissions
        apiKey.SetScopes(new List<string> { "users.read", "products.read", "orders.write" });
        apiKey.SetAllowedEndpoints(new List<string> { "/api/users", "/api/products", "/api/orders" });
        apiKey.SetAllowedMethods(new List<string> { "GET", "POST", "PUT" });
        
        // Set security restrictions
        apiKey.SetIpWhitelist(new List<string> { "52.10.98.123", "52.10.98.124" });
        apiKey.SetDomainWhitelist(new List<string> { "api.company.com", "*.company.com" });
        apiKey.SetRateLimits(100, 5000, 50000);
        
        // Set metadata
        apiKey.SetMetadata("{\"version\":\"2.0\",\"team\":\"mobile\"}");

        // Verify the key works
        apiKey.VerifyApiKey(plainKey).Should().BeTrue();
        
        // Record some usage
        apiKey.RecordUsage("52.10.98.123", "MobileApp/2.0");
        apiKey.RecordUsage("52.10.98.124", "MobileApp/2.0");
        
        // Check access permissions
        apiKey.CanAccessEndpoint("/api/users", "GET").Should().BeTrue();
        apiKey.CanAccessEndpoint("/api/orders", "POST").Should().BeTrue();
        apiKey.CanAccessEndpoint("/api/admin", "DELETE").Should().BeFalse();
        
        apiKey.HasScope("users.read").Should().BeTrue();
        apiKey.HasScope("admin.write").Should().BeFalse();
        
        apiKey.IsValidForIp("52.10.98.123").Should().BeTrue();
        apiKey.IsValidForIp("192.168.1.1").Should().BeFalse();
        
        apiKey.IsValidForDomain("api.company.com").Should().BeTrue();
        apiKey.IsValidForDomain("hacker.com").Should().BeFalse();
        
        // Suspend temporarily
        apiKey.Suspend("Rate limit exceeded");
        apiKey.Status.Should().Be(ApiKeyStatus.Suspended);
        apiKey.IsActive.Should().BeFalse();
        
        // Reactivate
        apiKey.Activate();
        apiKey.Status.Should().Be(ApiKeyStatus.Active);
        apiKey.IsActive.Should().BeTrue();
        
        // Eventually revoke
        apiKey.Revoke("security@company.com", "Key rotation policy");
        apiKey.Status.Should().Be(ApiKeyStatus.Revoked);
        apiKey.IsActive.Should().BeFalse();
        apiKey.RevokedBy.Should().Be("security@company.com");
        apiKey.RevocationReason.Should().Be("Key rotation policy");
        
        // Verify statistics
        apiKey.UsageCount.Should().Be(2);
        apiKey.LastUsedIp.Should().Be("52.10.98.124");
        apiKey.IsExpired().Should().BeFalse();
    }

    [Theory]
    [InlineData(ApiKeyType.Personal)]
    [InlineData(ApiKeyType.Application)]
    [InlineData(ApiKeyType.Integration)]
    [InlineData(ApiKeyType.Webhook)]
    [InlineData(ApiKeyType.Admin)]
    [InlineData(ApiKeyType.ReadOnly)]
    [InlineData(ApiKeyType.WriteOnly)]
    [InlineData(ApiKeyType.Testing)]
    public void Create_WithDifferentKeyTypes_ShouldAcceptAll(ApiKeyType keyType)
    {
        // Act
        var (apiKey, _) = TenantApiKey.Create(
            Name,
            Description,
            keyType,
            CreatedBy);

        // Assert
        apiKey.KeyType.Should().Be(keyType);
    }

    private (TenantApiKey, string) CreateApiKey()
    {
        return TenantApiKey.Create(
            Name,
            Description,
            KeyType,
            CreatedBy);
    }
}