using Microsoft.AspNetCore.Mvc;
using Stocker.Application.Common.Attributes;
using Stocker.Application.Common.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Stocker.API.Controllers.V2;

/// <summary>
/// Test controller for Phase 2 caching features
/// </summary>
[ApiController]
[ApiVersion("2.0")]
[ApiVersion("2.1")]
[Route("api/v{version:apiVersion}/[controller]")]
public class CachingTestController : ControllerBase
{
    private static readonly List<Product> _products = GenerateProducts();

    /// <summary>
    /// Test ETag support
    /// </summary>
    [HttpGet("etag")]
    [ProducesResponseType(200)]
    [ProducesResponseType(304)]
    public IActionResult TestETag()
    {
        var data = new
        {
            Message = "This response supports ETags",
            Timestamp = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss"),
            Data = _products.Take(5)
        };

        // ETag will be automatically added by ETagMiddleware
        return Ok(ApiResponse<object>.CreateSuccess(data));
    }

    /// <summary>
    /// Test Cache-Control headers
    /// </summary>
    [HttpGet("cache-control/{cacheType}")]
    [ProducesResponseType(200)]
    public IActionResult TestCacheControl(string cacheType)
    {
        var response = ApiResponse<object>.CreateSuccess(new
        {
            CacheType = cacheType,
            ServerTime = DateTime.UtcNow
        });

        // Set different cache control headers based on type
        switch (cacheType.ToLower())
        {
            case "public":
                Response.Headers["Cache-Control"] = "public, max-age=3600";
                break;
            case "private":
                Response.Headers["Cache-Control"] = "private, max-age=60";
                break;
            case "nocache":
                Response.Headers["Cache-Control"] = "no-cache, no-store, must-revalidate";
                break;
            default:
                Response.Headers["Cache-Control"] = "private, max-age=300, must-revalidate";
                break;
        }

        return Ok(response);
    }

    /// <summary>
    /// Test output caching with attribute
    /// </summary>
    [HttpGet("output-cache")]
    [OutputCache(Duration = 60, VaryByQueryParams = new[] { "category", "sort" })]
    [ProducesResponseType(200)]
    public IActionResult TestOutputCache([FromQuery] string? category, [FromQuery] string? sort)
    {
        // This response will be cached for 60 seconds
        var products = _products.AsQueryable();

        if (!string.IsNullOrEmpty(category))
        {
            products = products.Where(p => p.Category == category);
        }

        if (!string.IsNullOrEmpty(sort))
        {
            products = sort.ToLower() == "desc"
                ? products.OrderByDescending(p => p.Price)
                : products.OrderBy(p => p.Price);
        }

        return Ok(ApiResponse<object>.CreateSuccess(new
        {
            Category = category ?? "all",
            Sort = sort ?? "asc",
            Count = products.Count(),
            Items = products.Take(10),
            CachedAt = DateTime.UtcNow
        }));
    }

    /// <summary>
    /// Test advanced pagination
    /// </summary>
    [HttpGet("advanced-pagination")]
    [ProducesResponseType(200)]
    public IActionResult TestAdvancedPagination(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? sortBy = "name",
        [FromQuery] string? sortOrder = "asc",
        [FromQuery] string? filter = null)
    {
        var query = _products.AsQueryable();

        // Apply filter
        if (!string.IsNullOrEmpty(filter))
        {
            query = query.Where(p => p.Name.Contains(filter, StringComparison.OrdinalIgnoreCase));
        }

        var totalItems = query.Count();

        // Apply sorting
        query = sortBy?.ToLower() switch
        {
            "price" => sortOrder == "desc" ? query.OrderByDescending(p => p.Price) : query.OrderBy(p => p.Price),
            "category" => sortOrder == "desc" ? query.OrderByDescending(p => p.Category) : query.OrderBy(p => p.Category),
            _ => sortOrder == "desc" ? query.OrderByDescending(p => p.Name) : query.OrderBy(p => p.Name)
        };

        // Apply pagination
        var items = query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        var baseUrl = $"{Request.Scheme}://{Request.Host}{Request.Path}";
        var response = new ApiResponse<List<Product>>
        {
            Success = true,
            Data = items,
            Pagination = new AdvancedPaginationMetadata
            {
                CurrentPage = page,
                PageSize = pageSize,
                TotalItems = totalItems,
                TotalPages = (int)Math.Ceiling(totalItems / (double)pageSize),
                HasNext = page < (int)Math.Ceiling(totalItems / (double)pageSize),
                HasPrevious = page > 1,
                Sort = new SortInfo
                {
                    SortBy = sortBy ?? "name",
                    SortOrder = sortOrder ?? "asc",
                    AvailableSortFields = new[] { "name", "price", "category" }
                },
                Filters = string.IsNullOrEmpty(filter) ? new() : new List<FilterInfo>
                {
                    new FilterInfo
                    {
                        Field = "name",
                        Operator = "contains",
                        Value = filter
                    }
                },
                Links = new PaginationLinks
                {
                    Current = $"{baseUrl}?page={page}&pageSize={pageSize}",
                    First = $"{baseUrl}?page=1&pageSize={pageSize}",
                    Last = $"{baseUrl}?page={(int)Math.Ceiling(totalItems / (double)pageSize)}&pageSize={pageSize}",
                    Next = page < (int)Math.Ceiling(totalItems / (double)pageSize)
                        ? $"{baseUrl}?page={page + 1}&pageSize={pageSize}"
                        : null,
                    Previous = page > 1
                        ? $"{baseUrl}?page={page - 1}&pageSize={pageSize}"
                        : null
                },
                Statistics = new ResultStatistics
                {
                    QueryTime = 15, // Mock value
                    UnfilteredCount = _products.Count,
                    FilteredCount = totalItems,
                    IsCached = false
                }
            }
        };

        return Ok(response);
    }

    /// <summary>
    /// Test bulk operations
    /// </summary>
    [HttpPost("bulk")]
    [MapToApiVersion("2.0")]
    [MapToApiVersion("2.1")]
    [ProducesResponseType(200)]
    public async Task<IActionResult> TestBulkOperation([FromBody] BulkOperationRequest<ProductDto> request)
    {
        var response = new BulkOperationResponse<ProductDto>
        {
            TotalItems = request.Items.Count,
            Status = BulkOperationStatus.Success
        };

        var startTime = DateTime.UtcNow;

        // Simulate bulk processing
        foreach (var item in request.Items)
        {
            var result = new BulkOperationResult<ProductDto>
            {
                Index = request.Items.IndexOf(item),
                Item = item,
                Id = Guid.NewGuid().ToString(),
                Success = true,
                StatusCode = 200
            };

            // Simulate some failures
            if (item.Price < 0)
            {
                result.Success = false;
                result.ErrorMessage = "Price cannot be negative";
                result.ErrorCode = "INVALID_PRICE";
                result.StatusCode = 400;
                response.FailedItems.Add(result);
                response.FailureCount++;
            }
            else
            {
                response.SuccessfulItems.Add(result);
                response.SuccessCount++;
            }

            // Simulate processing delay
            await Task.Delay(10);
        }

        response.ElapsedTime = DateTime.UtcNow - startTime;

        // Determine overall status
        if (response.FailureCount == 0)
        {
            response.Status = BulkOperationStatus.Success;
        }
        else if (response.SuccessCount > 0)
        {
            response.Status = BulkOperationStatus.PartialSuccess;
        }
        else
        {
            response.Status = BulkOperationStatus.Failed;
        }

        return Ok(ApiResponse<BulkOperationResponse<ProductDto>>.CreateSuccess(response));
    }

    private static List<Product> GenerateProducts()
    {
        var categories = new[] { "Electronics", "Books", "Clothing", "Food", "Toys" };
        var products = new List<Product>();

        for (int i = 1; i <= 100; i++)
        {
            products.Add(new Product
            {
                Id = i,
                Name = $"Product {i}",
                Price = Random.Shared.Next(10, 1000),
                Category = categories[Random.Shared.Next(categories.Length)],
                InStock = Random.Shared.Next(0, 100) > 20
            });
        }

        return products;
    }

    private class Product
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string Category { get; set; } = string.Empty;
        public bool InStock { get; set; }
    }

    public class ProductDto
    {
        public string Name { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string Category { get; set; } = string.Empty;
    }
}