using MediatR;
using Stocker.SharedKernel.Results;
using Stocker.Modules.CRM.Domain.Entities;

namespace Stocker.Modules.CRM.Application.Features.LoyaltyPrograms.Commands;

public record CreateLoyaltyProgramCommand(
    Guid TenantId,
    string Name,
    string Code,
    LoyaltyProgramType ProgramType = LoyaltyProgramType.PointsBased,
    string? Description = null,
    DateTime? StartDate = null,
    DateTime? EndDate = null,
    decimal PointsPerSpend = 1,
    decimal SpendUnit = 1,
    string Currency = "TRY",
    decimal? MinimumSpendForPoints = null,
    int? MaxPointsPerTransaction = null,
    decimal PointValue = 0.01m,
    int MinimumRedemptionPoints = 100,
    decimal? MaxRedemptionPercentage = null,
    int? PointsValidityMonths = null,
    bool ResetPointsYearly = false,
    int? BirthdayBonusPoints = null,
    int? SignUpBonusPoints = null,
    int? ReferralBonusPoints = null,
    int? ReviewBonusPoints = null,
    bool IsActive = true
) : IRequest<Result<Guid>>;
