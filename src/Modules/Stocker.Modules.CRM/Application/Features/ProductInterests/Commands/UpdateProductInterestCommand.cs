using MediatR;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.ProductInterests.Commands;

public record UpdateProductInterestCommand(
    Guid Id,
    Guid TenantId,
    InterestLevel? InterestLevel = null,
    InterestStatus? Status = null,
    InterestSource? Source = null,
    string? ProductCategory = null,
    decimal? InterestedQuantity = null,
    string? Unit = null,
    decimal? EstimatedBudget = null,
    string? Currency = null,
    decimal? QuotedPrice = null,
    DateTime? ExpectedPurchaseDate = null,
    string? InterestReason = null,
    string? Requirements = null,
    string? Notes = null,
    string? CompetitorProducts = null,
    string? PromoCode = null,
    decimal? PurchaseProbability = null
) : IRequest<Result<bool>>;
