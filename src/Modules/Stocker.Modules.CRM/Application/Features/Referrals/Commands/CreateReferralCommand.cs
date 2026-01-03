using MediatR;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Referrals.Commands;

public record CreateReferralCommand(
    Guid TenantId,
    string ReferrerName,
    string ReferredName,
    string? ReferralCode = null,
    ReferralType ReferralType = ReferralType.Customer,
    Guid? ReferrerCustomerId = null,
    Guid? ReferrerContactId = null,
    string? ReferrerEmail = null,
    string? ReferrerPhone = null,
    string? ReferredEmail = null,
    string? ReferredPhone = null,
    string? ReferredCompany = null,
    decimal? ReferrerReward = null,
    decimal? ReferredReward = null,
    RewardType? RewardType = null,
    string Currency = "TRY",
    DateTime? ExpiryDate = null,
    Guid? CampaignId = null,
    string? ProgramName = null,
    string? ReferralMessage = null,
    string? InternalNotes = null,
    int? AssignedToUserId = null
) : IRequest<Result<Guid>>;
