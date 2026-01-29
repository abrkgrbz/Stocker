using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.DTOs.Module;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Modules.Queries.CalculateCustomPackagePrice;

public class CalculateCustomPackagePriceQueryHandler
    : IRequestHandler<CalculateCustomPackagePriceQuery, Result<CustomPackagePriceResponseDto>>
{
    private readonly IMasterDbContext _context;

    // İndirim oranları
    private const decimal QuarterlyDiscountPercent = 10m;  // 3 aylık için %10 indirim
    private const decimal SemiAnnualDiscountPercent = 15m; // 6 aylık için %15 indirim
    private const decimal AnnualDiscountPercent = 20m;     // Yıllık için %20 indirim

    public CalculateCustomPackagePriceQueryHandler(IMasterDbContext context)
    {
        _context = context;
    }

    public async Task<Result<CustomPackagePriceResponseDto>> Handle(
        CalculateCustomPackagePriceQuery request,
        CancellationToken cancellationToken)
    {
        try
        {
            // Tüm aktif modülleri getir
            var allModules = await _context.ModuleDefinitions
                .AsNoTracking()
                .Where(m => m.IsActive)
                .Include(m => m.Dependencies)
                .ToListAsync(cancellationToken);

            // Core modülleri her zaman dahil et
            var coreModules = allModules.Where(m => m.IsCore).ToList();
            var selectedCodes = request.SelectedModuleCodes.ToHashSet(StringComparer.OrdinalIgnoreCase);

            // Seçilen modülleri bul
            var selectedModules = allModules
                .Where(m => selectedCodes.Contains(m.Code))
                .ToList();

            // Bağımlılıkları çöz (seçilen modüller için gerekli diğer modüller)
            var requiredDependencies = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            foreach (var module in selectedModules)
            {
                foreach (var dep in module.Dependencies)
                {
                    if (!selectedCodes.Contains(dep.DependentModuleCode))
                    {
                        requiredDependencies.Add(dep.DependentModuleCode);
                    }
                }
            }

            // Bağımlı modülleri de ekle
            var dependencyModules = allModules
                .Where(m => requiredDependencies.Contains(m.Code))
                .ToList();

            // Fiyat dökümünü hesapla
            var breakdown = new List<ModulePriceBreakdownDto>();

            // Core modüller (zorunlu, fiyatsız veya fiyatlı olabilir)
            foreach (var module in coreModules)
            {
                breakdown.Add(new ModulePriceBreakdownDto
                {
                    ModuleCode = module.Code,
                    ModuleName = module.Name,
                    MonthlyPrice = module.MonthlyPrice.Amount,
                    IsCore = true,
                    IsRequired = true
                });
            }

            // Seçilen modüller
            foreach (var module in selectedModules.Where(m => !m.IsCore))
            {
                breakdown.Add(new ModulePriceBreakdownDto
                {
                    ModuleCode = module.Code,
                    ModuleName = module.Name,
                    MonthlyPrice = module.MonthlyPrice.Amount,
                    IsCore = false,
                    IsRequired = false
                });
            }

            // Bağımlılık modülleri (zorunlu ama kullanıcı seçmemiş)
            foreach (var module in dependencyModules.Where(m => !m.IsCore))
            {
                breakdown.Add(new ModulePriceBreakdownDto
                {
                    ModuleCode = module.Code,
                    ModuleName = module.Name,
                    MonthlyPrice = module.MonthlyPrice.Amount,
                    IsCore = false,
                    IsRequired = true
                });
            }

            // Modül fiyatı toplamı
            var modulesTotal = breakdown.Sum(b => b.MonthlyPrice);

            // ==================== USER PRICING ====================
            UserPricingDto? userPricing = null;
            decimal userTotal = 0m;

            if (request.UserCount > 0)
            {
                var userTiers = await _context.UserTiers
                    .AsNoTracking()
                    .Where(ut => ut.IsActive)
                    .OrderBy(ut => ut.DisplayOrder)
                    .ToListAsync(cancellationToken);

                // Kullanıcı sayısına uygun tier'ı bul
                var applicableTier = userTiers.FirstOrDefault(t => t.IsWithinRange(request.UserCount));

                if (applicableTier != null)
                {
                    var tierPrice = applicableTier.CalculatePrice(request.UserCount);
                    userTotal = tierPrice.Amount;

                    userPricing = new UserPricingDto
                    {
                        UserCount = request.UserCount,
                        TierCode = applicableTier.Code,
                        TierName = applicableTier.Name,
                        PricePerUser = applicableTier.PricePerUser.Amount,
                        BasePrice = applicableTier.BasePrice?.Amount ?? 0m,
                        TotalMonthly = userTotal
                    };
                }
            }

            // ==================== STORAGE PRICING ====================
            StoragePricingDto? storagePricing = null;
            decimal storageTotal = 0m;

            if (!string.IsNullOrEmpty(request.StoragePlanCode))
            {
                var storagePlan = await _context.StoragePlans
                    .AsNoTracking()
                    .FirstOrDefaultAsync(sp => sp.Code == request.StoragePlanCode && sp.IsActive, cancellationToken);

                if (storagePlan != null)
                {
                    storageTotal = storagePlan.MonthlyPrice.Amount;
                    storagePricing = new StoragePricingDto
                    {
                        PlanCode = storagePlan.Code,
                        PlanName = storagePlan.Name,
                        StorageGB = storagePlan.StorageGB,
                        MonthlyPrice = storageTotal
                    };
                }
            }
            else
            {
                // Varsayılan ücretsiz plan
                var defaultPlan = await _context.StoragePlans
                    .AsNoTracking()
                    .FirstOrDefaultAsync(sp => sp.IsDefault && sp.IsActive, cancellationToken);

                if (defaultPlan != null)
                {
                    storagePricing = new StoragePricingDto
                    {
                        PlanCode = defaultPlan.Code,
                        PlanName = defaultPlan.Name,
                        StorageGB = defaultPlan.StorageGB,
                        MonthlyPrice = 0m
                    };
                }
            }

            // ==================== ADD-ONS PRICING ====================
            var addOnPricing = new List<DTOs.Module.AddOnPricingDto>();
            decimal addOnsTotal = 0m;

            if (request.SelectedAddOnCodes?.Any() == true)
            {
                var selectedAddOnCodes = request.SelectedAddOnCodes.ToHashSet(StringComparer.OrdinalIgnoreCase);
                var addOns = await _context.AddOns
                    .AsNoTracking()
                    .Where(a => a.IsActive)
                    .ToListAsync(cancellationToken);

                foreach (var addOn in addOns.Where(a => selectedAddOnCodes.Contains(a.Code)))
                {
                    addOnsTotal += addOn.MonthlyPrice.Amount;
                    addOnPricing.Add(new DTOs.Module.AddOnPricingDto
                    {
                        Code = addOn.Code,
                        Name = addOn.Name,
                        MonthlyPrice = addOn.MonthlyPrice.Amount
                    });
                }
            }

            // ==================== TOTAL CALCULATION ====================
            var monthlyTotal = modulesTotal + userTotal + storageTotal + addOnsTotal;

            // Dönemsel fiyatları hesapla (indirimli)
            var quarterlyTotal = monthlyTotal * 3 * (1 - QuarterlyDiscountPercent / 100);
            var semiAnnualTotal = monthlyTotal * 6 * (1 - SemiAnnualDiscountPercent / 100);
            var annualTotal = monthlyTotal * 12 * (1 - AnnualDiscountPercent / 100);

            return Result<CustomPackagePriceResponseDto>.Success(new CustomPackagePriceResponseDto
            {
                MonthlyTotal = monthlyTotal,
                QuarterlyTotal = Math.Round(quarterlyTotal, 2),
                SemiAnnualTotal = Math.Round(semiAnnualTotal, 2),
                AnnualTotal = Math.Round(annualTotal, 2),
                Currency = "TRY",
                Breakdown = breakdown,
                QuarterlyDiscount = QuarterlyDiscountPercent,
                SemiAnnualDiscount = SemiAnnualDiscountPercent,
                AnnualDiscount = AnnualDiscountPercent,
                UserPricing = userPricing,
                StoragePricing = storagePricing,
                AddOns = addOnPricing
            });
        }
        catch (Exception ex)
        {
            return Result<CustomPackagePriceResponseDto>.Failure(
                new Error("Modules.PriceCalculationFailed", $"Fiyat hesaplanırken hata oluştu: {ex.Message}"));
        }
    }
}
