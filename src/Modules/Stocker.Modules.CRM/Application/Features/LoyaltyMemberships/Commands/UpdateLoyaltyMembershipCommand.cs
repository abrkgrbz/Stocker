using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.LoyaltyMemberships.Commands;

public record UpdateLoyaltyMembershipCommand(
    Guid Id,
    Guid TenantId,
    Guid? CurrentTierId = null,
    int? PointsToEarn = null,
    int? PointsToRedeem = null,
    int? PointsToAdjust = null,
    int? PointsToExpire = null,
    string? TransactionDescription = null,
    DateTime? PointsExpiryDate = null,
    bool? IsActive = null
) : IRequest<Result<bool>>;
