using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Opportunities.Queries;

/// <summary>
/// Query to get products for a specific opportunity
/// </summary>
public class GetOpportunityProductsQuery : IRequest<Result<IEnumerable<OpportunityProductDto>>>
{
    public Guid OpportunityId { get; set; }
    public string? Search { get; set; }
    public string? SortBy { get; set; } = "SortOrder";
    public string? SortDirection { get; set; } = "asc";
}

/// <summary>
/// Validator for GetOpportunityProductsQuery
/// </summary>
public class GetOpportunityProductsQueryValidator : AbstractValidator<GetOpportunityProductsQuery>
{
    public GetOpportunityProductsQueryValidator()
    {
        RuleFor(x => x.OpportunityId)
            .NotEmpty().WithMessage("Opportunity ID is required");

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

        var validFields = new[] { "ProductName", "ProductCode", "Quantity", "UnitPrice", "TotalPrice", "SortOrder", "CreatedAt" };
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

/// <summary>
/// Uses ICRMUnitOfWork for consistent data access
/// </summary>
public class GetOpportunityProductsQueryHandler : IRequestHandler<GetOpportunityProductsQuery, Result<IEnumerable<OpportunityProductDto>>>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public GetOpportunityProductsQueryHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<IEnumerable<OpportunityProductDto>>> Handle(GetOpportunityProductsQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var opportunity = await _unitOfWork.ReadRepository<Domain.Entities.Opportunity>().AsQueryable()
            .Include(o => o.Products)
            .FirstOrDefaultAsync(o => o.Id == request.OpportunityId && o.TenantId == tenantId, cancellationToken);

        if (opportunity == null)
            return Result<IEnumerable<OpportunityProductDto>>.Failure(Error.NotFound("Opportunity.NotFound", $"Opportunity with ID {request.OpportunityId} not found"));

        var products = opportunity.Products.AsEnumerable();

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
            "sortorder" => request.SortDirection?.ToLowerInvariant() == "desc"
                ? products.OrderByDescending(p => p.SortOrder)
                : products.OrderBy(p => p.SortOrder),
            _ => request.SortDirection?.ToLowerInvariant() == "desc"
                ? products.OrderByDescending(p => p.SortOrder)
                : products.OrderBy(p => p.SortOrder)
        };

        var dtos = products.Select(p => new OpportunityProductDto
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
            SortOrder = p.SortOrder
        });

        return Result<IEnumerable<OpportunityProductDto>>.Success(dtos);
    }
}