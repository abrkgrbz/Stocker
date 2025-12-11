using MediatR;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Infrastructure.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.LoyaltyPrograms.Queries;

public class GetLoyaltyProgramByIdQueryHandler : IRequestHandler<GetLoyaltyProgramByIdQuery, Result<LoyaltyProgramDto?>>
{
    private readonly ILoyaltyProgramRepository _repository;

    public GetLoyaltyProgramByIdQueryHandler(ILoyaltyProgramRepository repository)
    {
        _repository = repository;
    }

    public async System.Threading.Tasks.Task<Result<LoyaltyProgramDto?>> Handle(GetLoyaltyProgramByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await _repository.GetByIdAsync(request.Id, cancellationToken);

        if (entity == null)
        {
            return Result<LoyaltyProgramDto?>.Failure(new Error("LoyaltyProgram.NotFound", "Loyalty program not found", ErrorType.NotFound));
        }

        var dto = new LoyaltyProgramDto
        {
            Id = entity.Id,
            TenantId = entity.TenantId,
            Name = entity.Name,
            Code = entity.Code,
            Description = entity.Description,
            IsActive = entity.IsActive,
            ProgramType = entity.ProgramType,
            StartDate = entity.StartDate,
            EndDate = entity.EndDate,
            PointsPerSpend = entity.PointsPerSpend,
            SpendUnit = entity.SpendUnit,
            Currency = entity.Currency,
            MinimumSpendForPoints = entity.MinimumSpendForPoints,
            MaxPointsPerTransaction = entity.MaxPointsPerTransaction,
            PointValue = entity.PointValue,
            MinimumRedemptionPoints = entity.MinimumRedemptionPoints,
            MaxRedemptionPercentage = entity.MaxRedemptionPercentage,
            PointsValidityMonths = entity.PointsValidityMonths,
            ResetPointsYearly = entity.ResetPointsYearly,
            BirthdayBonusPoints = entity.BirthdayBonusPoints,
            SignUpBonusPoints = entity.SignUpBonusPoints,
            ReferralBonusPoints = entity.ReferralBonusPoints,
            ReviewBonusPoints = entity.ReviewBonusPoints,
            TermsAndConditions = entity.TermsAndConditions,
            PrivacyPolicy = entity.PrivacyPolicy,
            Tiers = entity.Tiers.Select(t => new LoyaltyTierDto
            {
                Id = t.Id,
                LoyaltyProgramId = t.LoyaltyProgramId,
                Name = t.Name,
                Order = t.Order,
                MinimumPoints = t.MinimumPoints,
                DiscountPercentage = t.DiscountPercentage,
                BonusPointsMultiplier = t.BonusPointsMultiplier,
                Benefits = t.Benefits,
                IconUrl = t.IconUrl,
                Color = t.Color,
                IsActive = t.IsActive
            }).ToList(),
            Rewards = entity.Rewards.Select(r => new LoyaltyRewardDto
            {
                Id = r.Id,
                LoyaltyProgramId = r.LoyaltyProgramId,
                Name = r.Name,
                Description = r.Description,
                PointsCost = r.PointsCost,
                RewardType = (DTOs.RewardType)(int)r.RewardType,
                DiscountValue = r.DiscountValue,
                DiscountPercentage = r.DiscountPercentage,
                ProductId = r.ProductId,
                ProductName = r.ProductName,
                StockQuantity = r.StockQuantity,
                ValidFrom = r.ValidFrom,
                ValidUntil = r.ValidUntil,
                ImageUrl = r.ImageUrl,
                Terms = r.Terms,
                IsActive = r.IsActive,
                RedemptionCount = r.RedemptionCount
            }).ToList()
        };

        return Result<LoyaltyProgramDto?>.Success(dto);
    }
}
