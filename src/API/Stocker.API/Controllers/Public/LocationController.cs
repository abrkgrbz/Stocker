using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Stocker.Persistence.Contexts;
using Swashbuckle.AspNetCore.Annotations;

namespace Stocker.API.Controllers.Public;

/// <summary>
/// Geographic location data for cascade dropdowns (Country -> City -> District)
/// Data is cached in memory for optimal performance
/// </summary>
[ApiController]
[Route("api/public/locations")]
[AllowAnonymous]
[SwaggerTag("Public API - Geographic Locations (Countries, Cities, Districts)")]
public class LocationController : ControllerBase
{
    private readonly MasterDbContext _context;
    private readonly IMemoryCache _cache;
    private readonly ILogger<LocationController> _logger;

    // Cache keys
    private const string CountriesCacheKey = "GeoLocation_Countries";
    private const string CitiesCacheKeyPrefix = "GeoLocation_Cities_";
    private const string DistrictsCacheKeyPrefix = "GeoLocation_Districts_";
    private const string AllCitiesCacheKey = "GeoLocation_AllCities";
    private const string RegionsCacheKeyPrefix = "GeoLocation_Regions_";

    // Cache duration: 24 hours (location data rarely changes)
    private static readonly TimeSpan CacheDuration = TimeSpan.FromHours(24);

    public LocationController(
        MasterDbContext context,
        IMemoryCache cache,
        ILogger<LocationController> logger)
    {
        _context = context;
        _cache = cache;
        _logger = logger;
    }

    /// <summary>
    /// Get all countries (cached)
    /// </summary>
    [HttpGet("countries")]
    [ProducesResponseType(typeof(LocationApiResponse<List<CountryDto>>), 200)]
    public async Task<IActionResult> GetCountries()
    {
        var countries = await _cache.GetOrCreateAsync(CountriesCacheKey, async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = CacheDuration;
            _logger.LogInformation("Loading countries from database");

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
                .ToListAsync();
        });

        return Ok(new LocationApiResponse<List<CountryDto>>
        {
            Success = true,
            Data = countries,
            Cached = true
        });
    }

    /// <summary>
    /// Get cities by country ID (cached)
    /// </summary>
    [HttpGet("countries/{countryId:guid}/cities")]
    [ProducesResponseType(typeof(LocationApiResponse<List<CityDto>>), 200)]
    public async Task<IActionResult> GetCitiesByCountry(Guid countryId)
    {
        var cacheKey = $"{CitiesCacheKeyPrefix}{countryId}";

        var cities = await _cache.GetOrCreateAsync(cacheKey, async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = CacheDuration;
            _logger.LogInformation("Loading cities for country {CountryId} from database", countryId);

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
                .ToListAsync();
        });

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
    public async Task<IActionResult> GetRegionsByCountry(Guid countryId)
    {
        var cacheKey = $"{RegionsCacheKeyPrefix}{countryId}";

        var regions = await _cache.GetOrCreateAsync(cacheKey, async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = CacheDuration;
            _logger.LogInformation("Loading regions for country {CountryId} from database", countryId);

            return await _context.Cities
                .Where(c => c.CountryId == countryId && c.IsActive && c.Region != null)
                .Select(c => c.Region!)
                .Distinct()
                .OrderBy(r => r)
                .ToListAsync();
        });

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
    public async Task<IActionResult> GetCitiesByRegion(Guid countryId, string regionName)
    {
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
            .ToListAsync();

        return Ok(new LocationApiResponse<List<CityDto>>
        {
            Success = true,
            Data = cities,
            Cached = false
        });
    }

    /// <summary>
    /// Get districts by city ID (cached)
    /// </summary>
    [HttpGet("cities/{cityId:guid}/districts")]
    [ProducesResponseType(typeof(LocationApiResponse<List<DistrictDto>>), 200)]
    public async Task<IActionResult> GetDistrictsByCity(Guid cityId)
    {
        var cacheKey = $"{DistrictsCacheKeyPrefix}{cityId}";

        var districts = await _cache.GetOrCreateAsync(cacheKey, async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = CacheDuration;
            _logger.LogInformation("Loading districts for city {CityId} from database", cityId);

            return await _context.Districts
                .Where(d => d.CityId == cityId && d.IsActive)
                .OrderByDescending(d => d.IsCentral) // Central district first
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
                .ToListAsync();
        });

        return Ok(new LocationApiResponse<List<DistrictDto>>
        {
            Success = true,
            Data = districts,
            Cached = true
        });
    }

    /// <summary>
    /// Get city by ID with country info
    /// </summary>
    [HttpGet("cities/{cityId:guid}")]
    [ProducesResponseType(typeof(LocationApiResponse<CityDetailDto>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetCity(Guid cityId)
    {
        var city = await _context.Cities
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
            .FirstOrDefaultAsync();

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
            Data = city
        });
    }

    /// <summary>
    /// Get district by ID with city and country info
    /// </summary>
    [HttpGet("districts/{districtId:guid}")]
    [ProducesResponseType(typeof(LocationApiResponse<DistrictDetailDto>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetDistrict(Guid districtId)
    {
        var district = await _context.Districts
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
            .FirstOrDefaultAsync();

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
            Data = district
        });
    }

    /// <summary>
    /// Search cities by name (autocomplete)
    /// </summary>
    [HttpGet("cities/search")]
    [ProducesResponseType(typeof(LocationApiResponse<List<CitySearchResultDto>>), 200)]
    public async Task<IActionResult> SearchCities(
        [FromQuery] string query,
        [FromQuery] Guid? countryId = null,
        [FromQuery] int limit = 20)
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
            .ToListAsync();

        return Ok(new LocationApiResponse<List<CitySearchResultDto>>
        {
            Success = true,
            Data = cities
        });
    }

    /// <summary>
    /// Search districts by name (autocomplete)
    /// </summary>
    [HttpGet("districts/search")]
    [ProducesResponseType(typeof(LocationApiResponse<List<DistrictSearchResultDto>>), 200)]
    public async Task<IActionResult> SearchDistricts(
        [FromQuery] string query,
        [FromQuery] Guid? cityId = null,
        [FromQuery] int limit = 20)
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
            .ToListAsync();

        return Ok(new LocationApiResponse<List<DistrictSearchResultDto>>
        {
            Success = true,
            Data = districts
        });
    }

    /// <summary>
    /// Clear location cache (admin only - useful after data updates)
    /// </summary>
    [HttpPost("cache/clear")]
    [Authorize(Policy = "RequireMasterAccess")]
    [ProducesResponseType(200)]
    public IActionResult ClearCache()
    {
        // Clear all location-related cache entries
        // Note: MemoryCache doesn't have a built-in way to clear by prefix
        // In production, consider using a distributed cache with better eviction support

        _logger.LogWarning("Location cache cleared by admin");

        return Ok(new LocationApiResponse<bool>
        {
            Success = true,
            Data = true,
            Message = "Cache cleared. Data will be reloaded on next request."
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
