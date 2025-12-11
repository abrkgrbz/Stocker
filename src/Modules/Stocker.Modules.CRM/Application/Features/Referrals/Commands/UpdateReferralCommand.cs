using MediatR;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Referrals.Commands;

public record UpdateReferralCommand(
    Guid Id,
    Guid TenantId,
    ReferralStatus? Status = null,
    ReferralType? ReferralType = null,
    string? ReferrerEmail = null,
    string? ReferrerPhone = null,
    string? ReferredEmail = null,
    string? ReferredPhone = null,
    string? ReferredCompany = null,
    decimal? ReferrerReward = null,
    decimal? ReferredReward = null,
    RewardType? RewardType = null,
    string? Currency = null,
    DateTime? ExpiryDate = null,
    string? ReferralMessage = null,
    string? InternalNotes = null,
    int? AssignedToUserId = null,
    decimal? ConversionValue = null,
    decimal? TotalSalesAmount = null
) : IRequest<Result<bool>>;
