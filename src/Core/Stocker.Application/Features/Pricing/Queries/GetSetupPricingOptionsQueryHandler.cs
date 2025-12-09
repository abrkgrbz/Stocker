using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.DTOs.Pricing;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Pricing.Queries;

public class GetSetupPricingOptionsQueryHandler : IRequestHandler<GetSetupPricingOptionsQuery, Result<SetupPricingOptionsDto>>
{
    private readonly IMasterDbContext _context;

    public GetSetupPricingOptionsQueryHandler(IMasterDbContext context)
    {
        _context = context;
    }

    public async Task<Result<SetupPricingOptionsDto>> Handle(
        GetSetupPricingOptionsQuery request,
        CancellationToken cancellationToken)
    {
        try
        {
            // User Tiers
            var userTiers = await _context.UserTiers
                .AsNoTracking()
                .Where(ut => ut.IsActive)
                .OrderBy(ut => ut.DisplayOrder)
                .Select(ut => new UserTierDto
                {
                    Id = ut.Id,
                    Code = ut.Code,
                    Name = ut.Name,
                    Description = ut.Description,
                    MinUsers = ut.MinUsers,
                    MaxUsers = ut.MaxUsers,
                    PricePerUser = ut.PricePerUser.Amount,
                    BasePrice = ut.BasePrice != null ? ut.BasePrice.Amount : null,
                    Currency = ut.PricePerUser.Currency,
                    IsActive = ut.IsActive,
                    DisplayOrder = ut.DisplayOrder
                })
                .ToListAsync(cancellationToken);

            // Storage Plans
            var storagePlans = await _context.StoragePlans
                .AsNoTracking()
                .Where(sp => sp.IsActive)
                .OrderBy(sp => sp.DisplayOrder)
                .Select(sp => new StoragePlanDto
                {
                    Id = sp.Id,
                    Code = sp.Code,
                    Name = sp.Name,
                    Description = sp.Description,
                    StorageGB = sp.StorageGB,
                    MonthlyPrice = sp.MonthlyPrice.Amount,
                    Currency = sp.MonthlyPrice.Currency,
                    IsActive = sp.IsActive,
                    IsDefault = sp.IsDefault,
                    DisplayOrder = sp.DisplayOrder
                })
                .ToListAsync(cancellationToken);

            // Add-ons with features
            var addOns = await _context.AddOns
                .AsNoTracking()
                .Where(a => a.IsActive)
                .Include(a => a.Features)
                .OrderBy(a => a.DisplayOrder)
                .ToListAsync(cancellationToken);

            var addOnDtos = addOns.Select(a => new AddOnDto
            {
                Id = a.Id,
                Code = a.Code,
                Name = a.Name,
                Description = a.Description,
                Icon = a.Icon,
                MonthlyPrice = a.MonthlyPrice.Amount,
                Currency = a.MonthlyPrice.Currency,
                IsActive = a.IsActive,
                DisplayOrder = a.DisplayOrder,
                Category = a.Category,
                Features = a.Features.Select(f => new AddOnFeatureDto
                {
                    FeatureName = f.FeatureName,
                    Description = f.Description
                }).ToList()
            }).ToList();

            // Industries with recommended modules
            var industries = await _context.Industries
                .AsNoTracking()
                .Where(i => i.IsActive)
                .Include(i => i.RecommendedModules)
                .OrderBy(i => i.DisplayOrder)
                .ToListAsync(cancellationToken);

            var industryDtos = industries.Select(i => new IndustryDto
            {
                Id = i.Id,
                Code = i.Code,
                Name = i.Name,
                Description = i.Description,
                Icon = i.Icon,
                IsActive = i.IsActive,
                DisplayOrder = i.DisplayOrder,
                RecommendedModules = i.RecommendedModules.Select(rm => rm.ModuleCode).ToList()
            }).ToList();

            var result = new SetupPricingOptionsDto
            {
                UserTiers = userTiers,
                StoragePlans = storagePlans,
                AddOns = addOnDtos,
                Industries = industryDtos
            };

            return Result<SetupPricingOptionsDto>.Success(result);
        }
        catch (Exception ex)
        {
            return Result<SetupPricingOptionsDto>.Failure(
                new Error("Pricing.GetFailed", $"Fiyatlandırma seçenekleri yüklenirken hata oluştu: {ex.Message}"));
        }
    }
}
