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

            // Toplam aylık fiyat
            var monthlyTotal = breakdown.Sum(b => b.MonthlyPrice);

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
                AnnualDiscount = AnnualDiscountPercent
            });
        }
        catch (Exception ex)
        {
            return Result<CustomPackagePriceResponseDto>.Failure(
                new Error("Modules.PriceCalculationFailed", $"Fiyat hesaplanırken hata oluştu: {ex.Message}"));
        }
    }
}
