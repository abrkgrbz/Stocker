using MediatR;
using Stocker.SharedKernel.Results;
using Stocker.Modules.CRM.Domain.Entities;

namespace Stocker.Modules.CRM.Application.Features.LoyaltyPrograms.Commands;

public record UpdateLoyaltyProgramCommand(
    Guid Id,
    Guid TenantId,
    string? Name = null,
    string? Code = null,
    string? Description = null,
    DateTime? StartDate = null,
    DateTime? EndDate = null,
    decimal? PointsPerSpend = null,
    decimal? SpendUnit = null,
    decimal? MinimumSpendForPoints = null,
    int? MaxPointsPerTransaction = null,
    decimal? PointValue = null,
    int? MinimumRedemptionPoints = null,
    decimal? MaxRedemptionPercentage = null,
    int? PointsValidityMonths = null,
    bool? ResetPointsYearly = null,
    int? BirthdayBonusPoints = null,
    int? SignUpBonusPoints = null,
    int? ReferralBonusPoints = null,
    int? ReviewBonusPoints = null,
    LoyaltyProgramType? ProgramType = null,
    bool? IsActive = null
) : IRequest<Result<bool>>;
