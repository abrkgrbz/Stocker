using Microsoft.AspNetCore.Mvc;
using Stocker.Application.Common.Interfaces;
using Swashbuckle.AspNetCore.Annotations;
using Stocker.Application.Common.Exceptions;

namespace Stocker.API.Controllers.Public;

[Route("api/public/[controller]")]
[ApiController]
[SwaggerTag("Test cache functionality")]
public class CacheTestController : ControllerBase
{
    private readonly ICacheService _cacheService;
    private readonly ILogger<CacheTestController> _logger;

    public CacheTestController(
        ICacheService cacheService,
        ILogger<CacheTestController> logger)
    {
        _cacheService = cacheService;
        _logger = logger;
    }

    [HttpGet("test")]
    [SwaggerOperation(Summary = "Test cache operations")]
    public async Task<IActionResult> TestCache()
    {
        const string testKey = "test:cache:key";
        const string testValue = "Hello from Redis!";

        // Set value in cache
        await _cacheService.SetStringAsync(testKey, testValue, TimeSpan.FromMinutes(5));
        _logger.LogInformation("Value set in cache: {Key} = {Value}", testKey, testValue);

        // Get value from cache
        var cachedValue = await _cacheService.GetStringAsync(testKey);
        _logger.LogInformation("Value retrieved from cache: {Value}", cachedValue);

        // Test object caching
        var testObject = new
        {
            Id = Guid.NewGuid(),
            Name = "Test Object",
            Timestamp = DateTime.UtcNow
        };

        await _cacheService.SetAsync("test:object", testObject, TimeSpan.FromMinutes(5));
        var cachedObject = await _cacheService.GetAsync<dynamic>("test:object");

        // Test GetOrSet
        var getOrSetResult = await _cacheService.GetOrSetAsync(
            "test:getorset",
            async () =>
            {
                await Task.Delay(100); // Simulate work
                return "Generated value";
            },
            TimeSpan.FromMinutes(5));

        // Check if key exists
        var exists = await _cacheService.ExistsAsync(testKey);

        // Clean up
        await _cacheService.RemoveAsync(testKey);
        await _cacheService.RemoveAsync("test:object");
        await _cacheService.RemoveAsync("test:getorset");

        return Ok(new
        {
            success = true,
            message = "Cache test completed successfully",
            results = new
            {
                stringCache = new
                {
                    key = testKey,
                    setValue = testValue,
                    getValue = cachedValue,
                    match = testValue == cachedValue
                },
                objectCache = new
                {
                    setValue = testObject,
                    getValue = cachedObject,
                    match = cachedObject != null
                },
                getOrSet = new
                {
                    result = getOrSetResult
                },
                exists = exists
            }
        });
    }

    [HttpGet("info")]
    [SwaggerOperation(Summary = "Get cache configuration info")]
    public IActionResult GetCacheInfo()
    {
        var cacheType = _cacheService.GetType().Name;
        var isRedis = cacheType.Contains("Redis");

        return Ok(new
        {
            cacheType,
            isRedis,
            implementation = isRedis ? "Redis (Distributed)" : "In-Memory",
            status = "Active"
        });
    }
}