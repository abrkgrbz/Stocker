using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Infrastructure.Persistence;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Deals.Queries;

/// <summary>
/// Query to get products for a specific deal
/// </summary>
public class GetDealProductsQuery : IRequest<Result<IEnumerable<DealProductDto>>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public Guid DealId { get; set; }
    public string? Search { get; set; }
    public string? SortBy { get; set; } = "SortOrder";
    public string? SortDirection { get; set; } = "asc";
}

/// <summary>
/// Validator for GetDealProductsQuery
/// </summary>
public class GetDealProductsQueryValidator : AbstractValidator<GetDealProductsQuery>
{
    public GetDealProductsQueryValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.DealId)
            .NotEmpty().WithMessage("Deal ID is required");

        RuleFor(x => x.Search)
            .MaximumLength(500).WithMessage("Search term must not exceed 500 characters");

        RuleFor(x => x.SortBy)
            .Must(BeValidSortField).WithMessage("Invalid sort field")
            .When(x => !string.IsNullOrEmpty(x.SortBy));

        RuleFor(x => x.SortDirection)
            .Must(BeValidSortDirection).WithMessage("Sort direction must be 'asc' or 'desc'")
            .When(x => !string.IsNullOrEmpty(x.SortDirection));
    }

    private bool BeValidSortField(string? sortBy)
    {
        if (string.IsNullOrEmpty(sortBy))
            return true;

        var validFields = new[] { "ProductName", "ProductCode", "Quantity", "UnitPrice", "TotalPrice", "SortOrder" };
        return validFields.Contains(sortBy, StringComparer.OrdinalIgnoreCase);
    }

    private bool BeValidSortDirection(string? sortDirection)
    {
        if (string.IsNullOrEmpty(sortDirection))
            return true;

        return sortDirection.Equals("asc", StringComparison.OrdinalIgnoreCase) ||
               sortDirection.Equals("desc", StringComparison.OrdinalIgnoreCase);
    }
}

public class GetDealProductsQueryHandler : IRequestHandler<GetDealProductsQuery, Result<IEnumerable<DealProductDto>>>
{
    private readonly CRMDbContext _context;

    public GetDealProductsQueryHandler(CRMDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IEnumerable<DealProductDto>>> Handle(GetDealProductsQuery request, CancellationToken cancellationToken)
    {
        var deal = await _context.Deals
            .Include(d => d.Products)
            .FirstOrDefaultAsync(d => d.Id == request.DealId && d.TenantId == request.TenantId, cancellationToken);

        if (deal == null)
            return Result<IEnumerable<DealProductDto>>.Failure(Error.NotFound("Deal.NotFound", $"Deal with ID {request.DealId} not found"));

        var products = deal.Products.AsEnumerable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            products = products.Where(p =>
                p.ProductName.Contains(request.Search, StringComparison.OrdinalIgnoreCase) ||
                (p.ProductCode != null && p.ProductCode.Contains(request.Search, StringComparison.OrdinalIgnoreCase)));
        }

        products = request.SortBy?.ToLowerInvariant() switch
        {
            "productname" => request.SortDirection?.ToLowerInvariant() == "desc"
                ? products.OrderByDescending(p => p.ProductName)
                : products.OrderBy(p => p.ProductName),
            "productcode" => request.SortDirection?.ToLowerInvariant() == "desc"
                ? products.OrderByDescending(p => p.ProductCode)
                : products.OrderBy(p => p.ProductCode),
            "quantity" => request.SortDirection?.ToLowerInvariant() == "desc"
                ? products.OrderByDescending(p => p.Quantity)
                : products.OrderBy(p => p.Quantity),
            "unitprice" => request.SortDirection?.ToLowerInvariant() == "desc"
                ? products.OrderByDescending(p => p.UnitPrice.Amount)
                : products.OrderBy(p => p.UnitPrice.Amount),
            "totalprice" => request.SortDirection?.ToLowerInvariant() == "desc"
                ? products.OrderByDescending(p => p.TotalPrice.Amount)
                : products.OrderBy(p => p.TotalPrice.Amount),
            _ => request.SortDirection?.ToLowerInvariant() == "desc"
                ? products.OrderByDescending(p => p.SortOrder)
                : products.OrderBy(p => p.SortOrder)
        };

        var dtos = products.Select(p => new DealProductDto
        {
            Id = p.Id,
            ProductName = p.ProductName,
            ProductCode = p.ProductCode,
            Description = p.Description,
            Quantity = p.Quantity,
            UnitPrice = p.UnitPrice.Amount,
            Currency = p.UnitPrice.Currency,
            DiscountPercent = p.DiscountPercent,
            DiscountAmount = p.DiscountAmount.Amount,
            TotalPrice = p.TotalPrice.Amount,
            Tax = p.Tax,
            TaxAmount = p.TaxAmount.Amount,
            SortOrder = p.SortOrder,
            IsRecurring = p.IsRecurring,
            RecurringPeriod = p.RecurringPeriod,
            RecurringCycles = p.RecurringCycles
        });

        return Result<IEnumerable<DealProductDto>>.Success(dtos);
    }
}