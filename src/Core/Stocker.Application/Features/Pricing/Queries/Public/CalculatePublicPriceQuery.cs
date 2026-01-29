using MediatR;
using Stocker.Application.Common.Interfaces;
using Stocker.Domain.Master.Enums;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Pricing.Queries.Public;

/// <summary>
/// Query to calculate price preview for selected items (Public - No Auth Required)
/// </summary>
public record CalculatePublicPriceQuery : IRequest<Result<CalculatePublicPriceResponse>>
{
    public string? PackageId { get; init; }
    public string? BundleCode { get; init; }
    public List<string>? ModuleCodes { get; init; }
    public List<string>? AddOnCodes { get; init; }
    public int UserCount { get; init; } = 1;
    public string? BillingCycle { get; init; } = "monthly";
}

public record CalculatePublicPriceResponse
{
    public bool Success { get; init; } = true;
    public decimal Subtotal { get; init; }
    public decimal Discount { get; init; }
    public decimal Tax { get; init; }
    public decimal Total { get; init; }
    public string Currency { get; init; } = "TRY";
    public string BillingCycle { get; init; } = "Aylık";
    public decimal BasePackagePrice { get; init; }
    public decimal ModulesPrice { get; init; }
    public decimal BundlePrice { get; init; }
    public decimal AddOnsPrice { get; init; }
    public decimal UserPrice { get; init; }
    public int IncludedUsers { get; init; }
    public int AdditionalUsers { get; init; }
    public decimal PricePerAdditionalUser { get; init; }
    public IReadOnlyList<PriceLineItemDto> LineItems { get; init; } = new List<PriceLineItemDto>();
}

public record PriceLineItemDto
{
    public string Code { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string Type { get; init; } = string.Empty;
    public decimal UnitPrice { get; init; }
    public int Quantity { get; init; }
    public decimal TotalPrice { get; init; }
}
