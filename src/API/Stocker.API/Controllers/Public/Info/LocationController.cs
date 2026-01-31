using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Hybrid;
using Stocker.Persistence.Contexts;
using Swashbuckle.AspNetCore.Annotations;

namespace Stocker.API.Controllers.Public;

/// <summary>
/// Geographic location data for cascade dropdowns (Country -> City -> District)
/// Uses HybridCache (L1 Memory + L2 Redis) for optimal performance
/// </summary>
[ApiController]
[Route("api/public/locations")]
[AllowAnonymous]
[SwaggerTag("Public API - Geographic Locations (Countries, Cities, Districts)")]
public class LocationController : ControllerBase
{
    private readonly MasterDbContext _context;
    private readonly HybridCache _cache;
    private readonly ILogger<LocationController> _logger;

    // Cache key patterns
    private const string GeoDataTag = "geo-data";
    private const string CountriesCacheKey = "geo:countries";
    private const string CitiesCacheKeyPattern = "geo:country:{0}:cities";
    private const string DistrictsCacheKeyPattern = "geo:city:{0}:districts";
    private const string RegionsCacheKeyPattern = "geo:country:{0}:regions";
    private const string CityDetailCacheKeyPattern = "geo:city:{0}:detail";
    private const string DistrictDetailCacheKeyPattern = "geo:district:{0}:detail";

    // Cache expiration options for reference data (long-lived)
    private static readonly HybridCacheEntryOptions ReferenceDataCacheOptions = new()
    {
        LocalCacheExpiration = TimeSpan.FromHours(1),  // L1: 1 hour
        Expiration = TimeSpan.FromDays(1)              // L2: 1 day
    };

    public LocationController(
        MasterDbContext context,
        HybridCache cache,
        ILogger<LocationController> logger)
    {
        _context = context;
        _cache = cache;
        _logger = logger;
    }

    /// <summary>
    /// Get all countries (cached with HybridCache)
    /// </summary>
    [HttpGet("countries")]
    [ProducesResponseType(typeof(LocationApiResponse<List<CountryDto>>), 200)]
    public async Task<IActionResult> GetCountries(CancellationToken cancellationToken = default)
    {
        var countries = await _cache.GetOrCreateAsync(
            CountriesCacheKey,
            async ct =>
            {
                _logger.LogInformation("Loading countries from database (cache miss)");

                return await _context.Countries
                    .Where(c => c.IsActive)
                    .OrderBy(c => c.DisplayOrder)
                    .ThenBy(c => c.Name)
                    .Select(c => new CountryDto
                    {
                        Id = c.Id,
                        Name = c.Name,
                        NameEn = c.NameEn,
                        Code = c.Code,
                        Code3 = c.Code3,
                        PhoneCode = c.PhoneCode,
                        CurrencyCode = c.CurrencyCode
                    })
                    .ToListAsync(ct);
            },
            ReferenceDataCacheOptions,
            [GeoDataTag],
            cancellationToken);

        return Ok(new LocationApiResponse<List<CountryDto>>
        {
            Success = true,
            Data = countries,
            Cached = true
        });
    }

    /// <summary>
    /// Get cities by country ID (cached with HybridCache)
    /// </summary>
    [HttpGet("countries/{countryId:guid}/cities")]
    [ProducesResponseType(typeof(LocationApiResponse<List<CityDto>>), 200)]
    public async Task<IActionResult> GetCitiesByCountry(Guid countryId, CancellationToken cancellationToken = default)
    {
        var cacheKey = string.Format(CitiesCacheKeyPattern, countryId);

        var cities = await _cache.GetOrCreateAsync(
            cacheKey,
            async ct =>
            {
                _logger.LogInformation("Loading cities for country {CountryId} from database (cache miss)", countryId);

                return await _context.Cities
                    .Where(c => c.CountryId == countryId && c.IsActive)
                    .OrderBy(c => c.DisplayOrder)
                    .ThenBy(c => c.Name)
                    .Select(c => new CityDto
                    {
                        Id = c.Id,
                        CountryId = c.CountryId,
                        Name = c.Name,
                        PlateCode = c.PlateCode,
                        AreaCode = c.AreaCode,
                        Region = c.Region
                    })
                    .ToListAsync(ct);
            },
            ReferenceDataCacheOptions,
            [GeoDataTag, $"geo:country:{countryId}"],
            cancellationToken);

        return Ok(new LocationApiResponse<List<CityDto>>
        {
            Success = true,
            Data = cities,
            Cached = true
        });
    }

    /// <summary>
    /// Get unique regions for a country (for region-based filtering)
    /// </summary>
    [HttpGet("countries/{countryId:guid}/regions")]
    [ProducesResponseType(typeof(LocationApiResponse<List<string>>), 200)]
    public async Task<IActionResult> GetRegionsByCountry(Guid countryId, CancellationToken cancellationToken = default)
    {
        var cacheKey = string.Format(RegionsCacheKeyPattern, countryId);

        var regions = await _cache.GetOrCreateAsync(
            cacheKey,
            async ct =>
            {
                _logger.LogInformation("Loading regions for country {CountryId} from database (cache miss)", countryId);

                return await _context.Cities
                    .Where(c => c.CountryId == countryId && c.IsActive && c.Region != null)
                    .Select(c => c.Region!)
                    .Distinct()
                    .OrderBy(r => r)
                    .ToListAsync(ct);
            },
            ReferenceDataCacheOptions,
            [GeoDataTag, $"geo:country:{countryId}"],
            cancellationToken);

        return Ok(new LocationApiResponse<List<string>>
        {
            Success = true,
            Data = regions,
            Cached = true
        });
    }

    /// <summary>
    /// Get cities by region name (for region-based filtering)
    /// </summary>
    [HttpGet("countries/{countryId:guid}/regions/{regionName}/cities")]
    [ProducesResponseType(typeof(LocationApiResponse<List<CityDto>>), 200)]
    public async Task<IActionResult> GetCitiesByRegion(Guid countryId, string regionName, CancellationToken cancellationToken = default)
    {
        // Region-based query is not cached as it's less frequently used
        var cities = await _context.Cities
            .Where(c => c.CountryId == countryId && c.IsActive && c.Region == regionName)
            .OrderBy(c => c.DisplayOrder)
            .ThenBy(c => c.Name)
            .Select(c => new CityDto
            {
                Id = c.Id,
                CountryId = c.CountryId,
                Name = c.Name,
                PlateCode = c.PlateCode,
                AreaCode = c.AreaCode,
                Region = c.Region
            })
            .ToListAsync(cancellationToken);

        return Ok(new LocationApiResponse<List<CityDto>>
        {
            Success = true,
            Data = cities,
            Cached = false
        });
    }

    /// <summary>
    /// Get districts by city ID (cached with HybridCache)
    /// </summary>
    [HttpGet("cities/{cityId:guid}/districts")]
    [ProducesResponseType(typeof(LocationApiResponse<List<DistrictDto>>), 200)]
    public async Task<IActionResult> GetDistrictsByCity(Guid cityId, CancellationToken cancellationToken = default)
    {
        var cacheKey = string.Format(DistrictsCacheKeyPattern, cityId);

        var districts = await _cache.GetOrCreateAsync(
            cacheKey,
            async ct =>
            {
                _logger.LogInformation("Loading districts for city {CityId} from database (cache miss)", cityId);

                return await _context.Districts
                    .Where(d => d.CityId == cityId && d.IsActive)
                    .OrderByDescending(d => d.IsCentral)
                    .ThenBy(d => d.DisplayOrder)
                    .ThenBy(d => d.Name)
                    .Select(d => new DistrictDto
                    {
                        Id = d.Id,
                        CityId = d.CityId,
                        Name = d.Name,
                        PostalCode = d.PostalCode,
                        IsCentral = d.IsCentral
                    })
                    .ToListAsync(ct);
            },
            ReferenceDataCacheOptions,
            [GeoDataTag, $"geo:city:{cityId}"],
            cancellationToken);

        return Ok(new LocationApiResponse<List<DistrictDto>>
        {
            Success = true,
            Data = districts,
            Cached = true
        });
    }

    /// <summary>
    /// Get city by ID with country info (cached)
    /// </summary>
    [HttpGet("cities/{cityId:guid}")]
    [ProducesResponseType(typeof(LocationApiResponse<CityDetailDto>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetCity(Guid cityId, CancellationToken cancellationToken = default)
    {
        var cacheKey = string.Format(CityDetailCacheKeyPattern, cityId);

        var city = await _cache.GetOrCreateAsync(
            cacheKey,
            async ct =>
            {
                return await _context.Cities
                    .Where(c => c.Id == cityId && c.IsActive)
                    .Select(c => new CityDetailDto
                    {
                        Id = c.Id,
                        CountryId = c.CountryId,
                        CountryName = c.Country.Name,
                        CountryCode = c.Country.Code,
                        Name = c.Name,
                        PlateCode = c.PlateCode,
                        AreaCode = c.AreaCode,
                        Region = c.Region
                    })
                    .FirstOrDefaultAsync(ct);
            },
            ReferenceDataCacheOptions,
            [GeoDataTag],
            cancellationToken);

        if (city == null)
        {
            return NotFound(new LocationApiResponse<CityDetailDto>
            {
                Success = false,
                Message = "City not found"
            });
        }

        return Ok(new LocationApiResponse<CityDetailDto>
        {
            Success = true,
            Data = city,
            Cached = true
        });
    }

    /// <summary>
    /// Get district by ID with city and country info (cached)
    /// </summary>
    [HttpGet("districts/{districtId:guid}")]
    [ProducesResponseType(typeof(LocationApiResponse<DistrictDetailDto>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetDistrict(Guid districtId, CancellationToken cancellationToken = default)
    {
        var cacheKey = string.Format(DistrictDetailCacheKeyPattern, districtId);

        var district = await _cache.GetOrCreateAsync(
            cacheKey,
            async ct =>
            {
                return await _context.Districts
                    .Where(d => d.Id == districtId && d.IsActive)
                    .Select(d => new DistrictDetailDto
                    {
                        Id = d.Id,
                        CityId = d.CityId,
                        CityName = d.City.Name,
                        CityPlateCode = d.City.PlateCode,
                        CountryId = d.City.CountryId,
                        CountryName = d.City.Country.Name,
                        CountryCode = d.City.Country.Code,
                        Name = d.Name,
                        PostalCode = d.PostalCode,
                        IsCentral = d.IsCentral,
                        Region = d.City.Region
                    })
                    .FirstOrDefaultAsync(ct);
            },
            ReferenceDataCacheOptions,
            [GeoDataTag],
            cancellationToken);

        if (district == null)
        {
            return NotFound(new LocationApiResponse<DistrictDetailDto>
            {
                Success = false,
                Message = "District not found"
            });
        }

        return Ok(new LocationApiResponse<DistrictDetailDto>
        {
            Success = true,
            Data = district,
            Cached = true
        });
    }

    /// <summary>
    /// Search cities by name (autocomplete - not cached due to dynamic query)
    /// </summary>
    [HttpGet("cities/search")]
    [ProducesResponseType(typeof(LocationApiResponse<List<CitySearchResultDto>>), 200)]
    public async Task<IActionResult> SearchCities(
        [FromQuery] string query,
        [FromQuery] Guid? countryId = null,
        [FromQuery] int limit = 20,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(query) || query.Length < 2)
        {
            return Ok(new LocationApiResponse<List<CitySearchResultDto>>
            {
                Success = true,
                Data = new List<CitySearchResultDto>()
            });
        }

        var normalizedQuery = query.ToLowerInvariant().Trim();

        var citiesQuery = _context.Cities
            .Where(c => c.IsActive && c.Name.ToLower().Contains(normalizedQuery));

        if (countryId.HasValue)
        {
            citiesQuery = citiesQuery.Where(c => c.CountryId == countryId.Value);
        }

        var cities = await citiesQuery
            .OrderBy(c => c.Name)
            .Take(limit)
            .Select(c => new CitySearchResultDto
            {
                Id = c.Id,
                Name = c.Name,
                PlateCode = c.PlateCode,
                Region = c.Region,
                CountryId = c.CountryId,
                CountryName = c.Country.Name,
                CountryCode = c.Country.Code
            })
            .ToListAsync(cancellationToken);

        return Ok(new LocationApiResponse<List<CitySearchResultDto>>
        {
            Success = true,
            Data = cities,
            Cached = false
        });
    }

    /// <summary>
    /// Search districts by name (autocomplete - not cached due to dynamic query)
    /// </summary>
    [HttpGet("districts/search")]
    [ProducesResponseType(typeof(LocationApiResponse<List<DistrictSearchResultDto>>), 200)]
    public async Task<IActionResult> SearchDistricts(
        [FromQuery] string query,
        [FromQuery] Guid? cityId = null,
        [FromQuery] int limit = 20,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(query) || query.Length < 2)
        {
            return Ok(new LocationApiResponse<List<DistrictSearchResultDto>>
            {
                Success = true,
                Data = new List<DistrictSearchResultDto>()
            });
        }

        var normalizedQuery = query.ToLowerInvariant().Trim();

        var districtsQuery = _context.Districts
            .Where(d => d.IsActive && d.Name.ToLower().Contains(normalizedQuery));

        if (cityId.HasValue)
        {
            districtsQuery = districtsQuery.Where(d => d.CityId == cityId.Value);
        }

        var districts = await districtsQuery
            .OrderBy(d => d.Name)
            .Take(limit)
            .Select(d => new DistrictSearchResultDto
            {
                Id = d.Id,
                Name = d.Name,
                PostalCode = d.PostalCode,
                IsCentral = d.IsCentral,
                CityId = d.CityId,
                CityName = d.City.Name,
                CityPlateCode = d.City.PlateCode,
                CountryId = d.City.CountryId,
                CountryName = d.City.Country.Name
            })
            .ToListAsync(cancellationToken);

        return Ok(new LocationApiResponse<List<DistrictSearchResultDto>>
        {
            Success = true,
            Data = districts,
            Cached = false
        });
    }

    /// <summary>
    /// Clear all location cache by tag (admin only)
    /// Uses HybridCache RemoveByTagAsync for efficient cache invalidation
    /// </summary>
    [HttpPost("cache/clear")]
    [Authorize(Policy = "RequireMasterAccess")]
    [ProducesResponseType(typeof(LocationApiResponse<CacheInvalidationResult>), 200)]
    [SwaggerOperation(
        Summary = "Clear location cache",
        Description = "Invalidates all geo-location cache entries using tag-based eviction. Requires Master Access.")]
    public async Task<IActionResult> ClearCache(CancellationToken cancellationToken = default)
    {
        _logger.LogWarning("Location cache invalidation requested by admin");

        try
        {
            // Remove all entries tagged with "geo-data"
            await _cache.RemoveByTagAsync(GeoDataTag, cancellationToken);

            _logger.LogInformation("Location cache cleared successfully using tag: {Tag}", GeoDataTag);

            return Ok(new LocationApiResponse<CacheInvalidationResult>
            {
                Success = true,
                Data = new CacheInvalidationResult
                {
                    Tag = GeoDataTag,
                    InvalidatedAt = DateTime.UtcNow,
                    Message = "All geo-location cache entries have been invalidated. Data will be reloaded on next request."
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to clear location cache");

            return StatusCode(500, new LocationApiResponse<CacheInvalidationResult>
            {
                Success = false,
                Message = $"Failed to clear cache: {ex.Message}"
            });
        }
    }

    /// <summary>
    /// Clear cache for a specific country (admin only)
    /// </summary>
    [HttpPost("cache/clear/country/{countryId:guid}")]
    [Authorize(Policy = "RequireMasterAccess")]
    [ProducesResponseType(typeof(LocationApiResponse<CacheInvalidationResult>), 200)]
    public async Task<IActionResult> ClearCountryCache(Guid countryId, CancellationToken cancellationToken = default)
    {
        _logger.LogWarning("Country cache invalidation requested for {CountryId}", countryId);

        var countryTag = $"geo:country:{countryId}";
        await _cache.RemoveByTagAsync(countryTag, cancellationToken);

        return Ok(new LocationApiResponse<CacheInvalidationResult>
        {
            Success = true,
            Data = new CacheInvalidationResult
            {
                Tag = countryTag,
                InvalidatedAt = DateTime.UtcNow,
                Message = $"Cache entries for country {countryId} have been invalidated."
            }
        });
    }

    /// <summary>
    /// Clear cache for a specific city (admin only)
    /// </summary>
    [HttpPost("cache/clear/city/{cityId:guid}")]
    [Authorize(Policy = "RequireMasterAccess")]
    [ProducesResponseType(typeof(LocationApiResponse<CacheInvalidationResult>), 200)]
    public async Task<IActionResult> ClearCityCache(Guid cityId, CancellationToken cancellationToken = default)
    {
        _logger.LogWarning("City cache invalidation requested for {CityId}", cityId);

        var cityTag = $"geo:city:{cityId}";
        await _cache.RemoveByTagAsync(cityTag, cancellationToken);

        return Ok(new LocationApiResponse<CacheInvalidationResult>
        {
            Success = true,
            Data = new CacheInvalidationResult
            {
                Tag = cityTag,
                InvalidatedAt = DateTime.UtcNow,
                Message = $"Cache entries for city {cityId} have been invalidated."
            }
        });
    }
}

#region DTOs

public class LocationApiResponse<T>
{
    public bool Success { get; set; }
    public T? Data { get; set; }
    public string? Message { get; set; }
    public bool Cached { get; set; }
}

public class CacheInvalidationResult
{
    public string Tag { get; set; } = string.Empty;
    public DateTime InvalidatedAt { get; set; }
    public string Message { get; set; } = string.Empty;
}

public class CountryDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string NameEn { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string Code3 { get; set; } = string.Empty;
    public string PhoneCode { get; set; } = string.Empty;
    public string CurrencyCode { get; set; } = string.Empty;
}

public class CityDto
{
    public Guid Id { get; set; }
    public Guid CountryId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string PlateCode { get; set; } = string.Empty;
    public string? AreaCode { get; set; }
    public string? Region { get; set; }
}

public class CityDetailDto : CityDto
{
    public string CountryName { get; set; } = string.Empty;
    public string CountryCode { get; set; } = string.Empty;
}

public class CitySearchResultDto : CityDto
{
    public string CountryName { get; set; } = string.Empty;
    public string CountryCode { get; set; } = string.Empty;
}

public class DistrictDto
{
    public Guid Id { get; set; }
    public Guid CityId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? PostalCode { get; set; }
    public bool IsCentral { get; set; }
}

public class DistrictDetailDto : DistrictDto
{
    public string CityName { get; set; } = string.Empty;
    public string CityPlateCode { get; set; } = string.Empty;
    public Guid CountryId { get; set; }
    public string CountryName { get; set; } = string.Empty;
    public string CountryCode { get; set; } = string.Empty;
    public string? Region { get; set; }
}

public class DistrictSearchResultDto : DistrictDto
{
    public string CityName { get; set; } = string.Empty;
    public string CityPlateCode { get; set; } = string.Empty;
    public Guid CountryId { get; set; }
    public string CountryName { get; set; } = string.Empty;
}

#endregion
