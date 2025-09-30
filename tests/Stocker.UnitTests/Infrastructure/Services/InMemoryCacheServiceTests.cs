using FluentAssertions;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Moq;
using Stocker.Application.DTOs;
using Stocker.Infrastructure.Services;
using Xunit;

namespace Stocker.UnitTests.Infrastructure.Services;

public class InMemoryCacheServiceTests
{
    private readonly IMemoryCache _memoryCache;
    private readonly Mock<ILogger<InMemoryCacheService>> _loggerMock;
    private readonly InMemoryCacheService _cacheService;

    public InMemoryCacheServiceTests()
    {
        _memoryCache = new MemoryCache(new MemoryCacheOptions());
        _loggerMock = new Mock<ILogger<InMemoryCacheService>>();
        _cacheService = new InMemoryCacheService(_memoryCache, _loggerMock.Object);
    }

    [Fact]
    public async Task GetAsync_WithNonExistentKey_ShouldReturnNull()
    {
        // Arrange
        var key = "non-existent-key";

        // Act
        var result = await _cacheService.GetAsync<string>(key);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task SetAsync_AndGetAsync_ShouldReturnCachedValue()
    {
        // Arrange
        var key = "test-key";
        var value = "test-value";

        // Act
        await _cacheService.SetAsync(key, value);
        var result = await _cacheService.GetAsync<string>(key);

        // Assert
        result.Should().Be(value);
    }

    [Fact]
    public async Task SetAsync_WithExpiry_ShouldSetWithExpiration()
    {
        // Arrange
        var key = "expiring-key";
        var value = "expiring-value";
        var expiry = TimeSpan.FromMilliseconds(100); // Very short expiry for testing

        // Act
        await _cacheService.SetAsync(key, value, expiry);
        var resultBeforeExpiry = await _cacheService.GetAsync<string>(key);
        
        await Task.Delay(150); // Wait for expiry
        var resultAfterExpiry = await _cacheService.GetAsync<string>(key);

        // Assert
        resultBeforeExpiry.Should().Be(value);
        resultAfterExpiry.Should().BeNull();
    }

    [Fact]
    public async Task RemoveAsync_ShouldRemoveCachedItem()
    {
        // Arrange
        var key = "key-to-remove";
        var value = "value-to-remove";
        await _cacheService.SetAsync(key, value);

        // Act
        await _cacheService.RemoveAsync(key);
        var result = await _cacheService.GetAsync<string>(key);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task ExistsAsync_WithExistingKey_ShouldReturnTrue()
    {
        // Arrange
        var key = "existing-key";
        var value = "existing-value";
        await _cacheService.SetAsync(key, value);

        // Act
        var exists = await _cacheService.ExistsAsync(key);

        // Assert
        exists.Should().BeTrue();
    }

    [Fact]
    public async Task ExistsAsync_WithNonExistentKey_ShouldReturnFalse()
    {
        // Arrange
        var key = "non-existent-key";

        // Act
        var exists = await _cacheService.ExistsAsync(key);

        // Assert
        exists.Should().BeFalse();
    }

    [Fact]
    public async Task GetOrSetAsync_WithNonCachedValue_ShouldCallFactoryAndCache()
    {
        // Arrange
        var key = "factory-key";
        var expectedValue = "factory-value";
        var factoryCalled = false;
        Func<Task<string>> factory = async () =>
        {
            factoryCalled = true;
            await Task.Delay(1); // Simulate async operation
            return expectedValue;
        };

        // Act
        var result = await _cacheService.GetOrSetAsync(key, factory);
        var cachedResult = await _cacheService.GetAsync<string>(key);

        // Assert
        result.Should().Be(expectedValue);
        cachedResult.Should().Be(expectedValue);
        factoryCalled.Should().BeTrue();
    }

    [Fact]
    public async Task GetOrSetAsync_WithCachedValue_ShouldNotCallFactory()
    {
        // Arrange
        var key = "cached-factory-key";
        var cachedValue = "cached-value";
        await _cacheService.SetAsync(key, cachedValue);
        
        var factoryCalled = false;
        Func<Task<string>> factory = async () =>
        {
            factoryCalled = true;
            await Task.Delay(1);
            return "new-value";
        };

        // Act
        var result = await _cacheService.GetOrSetAsync(key, factory);

        // Assert
        result.Should().Be(cachedValue);
        factoryCalled.Should().BeFalse();
    }

    [Fact]
    public async Task SetStringAsync_AndGetStringAsync_ShouldWork()
    {
        // Arrange
        var key = "string-key";
        var value = "string-value";

        // Act
        await _cacheService.SetStringAsync(key, value);
        var result = await _cacheService.GetStringAsync(key);

        // Assert
        result.Should().Be(value);
    }

    [Fact]
    public async Task GetAsync_WithTenantId_ShouldUseTenantSpecificKey()
    {
        // Arrange
        var key = "setting-key";
        var tenantId = Guid.NewGuid();
        var value = "tenant-specific-value";

        // Act
        await _cacheService.SetAsync(key, tenantId, value);
        var result = await _cacheService.GetAsync<string>(key, tenantId);
        
        // Try to get with different tenant ID
        var differentTenantId = Guid.NewGuid();
        var differentResult = await _cacheService.GetAsync<string>(key, differentTenantId);

        // Assert
        result.Should().Be(value);
        differentResult.Should().BeNull();
    }

    [Fact]
    public async Task SetAsync_WithTenantId_ShouldCacheWithTenantSpecificKey()
    {
        // Arrange
        var key = "tenant-setting";
        var tenantId1 = Guid.NewGuid();
        var tenantId2 = Guid.NewGuid();
        var value1 = "value-for-tenant-1";
        var value2 = "value-for-tenant-2";

        // Act
        await _cacheService.SetAsync(key, tenantId1, value1);
        await _cacheService.SetAsync(key, tenantId2, value2);
        
        var result1 = await _cacheService.GetAsync<string>(key, tenantId1);
        var result2 = await _cacheService.GetAsync<string>(key, tenantId2);

        // Assert
        result1.Should().Be(value1);
        result2.Should().Be(value2);
    }

    [Fact]
    public async Task RemoveAsync_WithTenantId_ShouldRemoveTenantSpecificItem()
    {
        // Arrange
        var key = "tenant-key-to-remove";
        var tenantId = Guid.NewGuid();
        var value = "tenant-value";
        await _cacheService.SetAsync(key, tenantId, value);

        // Act
        await _cacheService.RemoveAsync(key, tenantId);
        var result = await _cacheService.GetAsync<string>(key, tenantId);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetSettingsAsync_WithNonCachedSettings_ShouldReturnNull()
    {
        // Arrange
        var tenantId = Guid.NewGuid();

        // Act
        var result = await _cacheService.GetSettingsAsync(tenantId);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task SetSettingsAsync_AndGetSettingsAsync_ShouldWork()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var settings = new List<SettingDto>
        {
            new() { Key = "setting1", Value = "value1", Category = "General" },
            new() { Key = "setting2", Value = "value2", Category = "General" }
        };

        // Act
        await _cacheService.SetSettingsAsync(tenantId, settings);
        var result = await _cacheService.GetSettingsAsync(tenantId);

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(2);
        result![0].Key.Should().Be("setting1");
        result[1].Key.Should().Be("setting2");
    }

    [Fact]
    public async Task SetSettingsAsync_WithCategory_ShouldCacheByCategory()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var generalSettings = new List<SettingDto>
        {
            new() { Key = "general1", Value = "value1", Category = "General" }
        };
        var securitySettings = new List<SettingDto>
        {
            new() { Key = "security1", Value = "value2", Category = "Security" }
        };

        // Act
        await _cacheService.SetSettingsAsync(tenantId, generalSettings, "General");
        await _cacheService.SetSettingsAsync(tenantId, securitySettings, "Security");
        
        var generalResult = await _cacheService.GetSettingsAsync(tenantId, "General");
        var securityResult = await _cacheService.GetSettingsAsync(tenantId, "Security");

        // Assert
        generalResult.Should().HaveCount(1);
        generalResult![0].Key.Should().Be("general1");
        
        securityResult.Should().HaveCount(1);
        securityResult![0].Key.Should().Be("security1");
    }

    [Fact]
    public async Task InvalidateSettingAsync_ShouldRemoveSpecificSetting()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var settingKey = "specific-setting";
        await _cacheService.SetAsync(settingKey, tenantId, "setting-value");

        // Act
        await _cacheService.InvalidateSettingAsync(tenantId, settingKey);
        var result = await _cacheService.GetAsync<string>(settingKey, tenantId);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task RefreshAsync_WithExistingKey_ShouldRefreshExpiry()
    {
        // Arrange
        var key = "refresh-key";
        var value = "refresh-value";
        await _cacheService.SetAsync(key, value);

        // Act
        await _cacheService.RefreshAsync(key);
        var result = await _cacheService.GetAsync<string>(key);

        // Assert
        result.Should().Be(value);
    }

    [Fact]
    public async Task RefreshAsync_WithNonExistentKey_ShouldNotThrow()
    {
        // Arrange
        var key = "non-existent-refresh-key";

        // Act
        var act = async () => await _cacheService.RefreshAsync(key);

        // Assert
        await act.Should().NotThrowAsync();
    }

    [Fact]
    public async Task RemoveByPatternAsync_ShouldLogWarning()
    {
        // Arrange
        var pattern = "pattern:*";

        // Act
        await _cacheService.RemoveByPatternAsync(pattern);

        // Assert
        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Warning,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains("Pattern-based removal not supported")),
                null,
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    [Fact]
    public async Task RemoveAllForTenantAsync_ShouldLogWarning()
    {
        // Arrange
        var tenantId = Guid.NewGuid();

        // Act
        await _cacheService.RemoveAllForTenantAsync(tenantId);

        // Assert
        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Warning,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains("Pattern-based removal not supported")),
                null,
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }
}