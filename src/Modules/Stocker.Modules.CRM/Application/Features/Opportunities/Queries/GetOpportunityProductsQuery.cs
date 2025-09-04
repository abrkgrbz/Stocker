using FluentValidation;
using MediatR;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Opportunities.Queries;

/// <summary>
/// Query to get products for a specific opportunity
/// </summary>
public class GetOpportunityProductsQuery : IRequest<Result<IEnumerable<OpportunityProductDto>>>, ITenantRequest
{
    public Guid TenantId { get; set; }
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
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

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