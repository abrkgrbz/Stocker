using MediatR;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.ProductInterests.Commands;

public record CreateProductInterestCommand(
    Guid TenantId,
    int ProductId,
    string ProductName,
    InterestLevel InterestLevel = InterestLevel.Medium,
    InterestSource Source = InterestSource.Direct,
    Guid? CustomerId = null,
    Guid? ContactId = null,
    Guid? LeadId = null,
    Guid? OpportunityId = null,
    string? ProductCategory = null,
    decimal? InterestedQuantity = null,
    string? Unit = null,
    decimal? EstimatedBudget = null,
    string Currency = "TRY",
    decimal? QuotedPrice = null,
    DateTime? ExpectedPurchaseDate = null,
    string? InterestReason = null,
    string? Requirements = null,
    string? Notes = null,
    string? CompetitorProducts = null,
    Guid? CampaignId = null,
    string? PromoCode = null
) : IRequest<Result<Guid>>;
