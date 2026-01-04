using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Finance.Application.DTOs;
using Stocker.Modules.Finance.Application.Features.FixedAssets.Commands;
using Stocker.Modules.Finance.Domain.Entities;
using Stocker.Modules.Finance.Domain.Repositories;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Finance.Application.Features.FixedAssets.Queries;

#region Get Fixed Assets (Paginated)

/// <summary>
/// Sabit kıymet listesi sorgusu (sayfalı)
/// </summary>
public class GetFixedAssetsQuery : IRequest<Result<PagedResult<FixedAssetSummaryDto>>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public FixedAssetFilterDto? Filter { get; set; }
}

/// <summary>
/// GetFixedAssetsQuery Handler
/// </summary>
public class GetFixedAssetsQueryHandler : IRequestHandler<GetFixedAssetsQuery, Result<PagedResult<FixedAssetSummaryDto>>>
{
    private readonly IFinanceRepository<FixedAsset> _repository;

    public GetFixedAssetsQueryHandler(IFinanceRepository<FixedAsset> repository)
    {
        _repository = repository;
    }

    public async Task<Result<PagedResult<FixedAssetSummaryDto>>> Handle(GetFixedAssetsQuery request, CancellationToken cancellationToken)
    {
        var query = _repository.AsQueryable();

        // Apply filters
        if (request.Filter != null)
        {
            if (!string.IsNullOrEmpty(request.Filter.SearchTerm))
            {
                var searchTerm = request.Filter.SearchTerm.ToLower();
                query = query.Where(x =>
                    x.Code.ToLower().Contains(searchTerm) ||
                    x.Name.ToLower().Contains(searchTerm) ||
                    (x.Barcode != null && x.Barcode.ToLower().Contains(searchTerm)) ||
                    (x.SerialNumber != null && x.SerialNumber.ToLower().Contains(searchTerm)) ||
                    (x.Description != null && x.Description.ToLower().Contains(searchTerm)));
            }

            if (request.Filter.AssetType.HasValue)
            {
                query = query.Where(x => x.AssetType == request.Filter.AssetType.Value);
            }

            if (request.Filter.Category.HasValue)
            {
                query = query.Where(x => x.Category == request.Filter.Category.Value);
            }

            if (request.Filter.Status.HasValue)
            {
                query = query.Where(x => x.Status == request.Filter.Status.Value);
            }

            if (request.Filter.IsActive.HasValue)
            {
                query = query.Where(x => x.IsActive == request.Filter.IsActive.Value);
            }

            if (request.Filter.IsFullyDepreciated.HasValue)
            {
                query = query.Where(x => x.IsFullyDepreciated == request.Filter.IsFullyDepreciated.Value);
            }

            if (request.Filter.LocationId.HasValue)
            {
                query = query.Where(x => x.LocationId == request.Filter.LocationId.Value);
            }

            if (request.Filter.DepartmentId.HasValue)
            {
                query = query.Where(x => x.DepartmentId == request.Filter.DepartmentId.Value);
            }

            if (request.Filter.BranchId.HasValue)
            {
                query = query.Where(x => x.BranchId == request.Filter.BranchId.Value);
            }

            if (request.Filter.CustodianUserId.HasValue)
            {
                query = query.Where(x => x.CustodianUserId == request.Filter.CustodianUserId.Value);
            }

            if (request.Filter.AcquisitionDateFrom.HasValue)
            {
                query = query.Where(x => x.AcquisitionDate >= request.Filter.AcquisitionDateFrom.Value);
            }

            if (request.Filter.AcquisitionDateTo.HasValue)
            {
                query = query.Where(x => x.AcquisitionDate <= request.Filter.AcquisitionDateTo.Value);
            }

            if (request.Filter.InServiceDateFrom.HasValue)
            {
                query = query.Where(x => x.InServiceDate >= request.Filter.InServiceDateFrom.Value);
            }

            if (request.Filter.InServiceDateTo.HasValue)
            {
                query = query.Where(x => x.InServiceDate <= request.Filter.InServiceDateTo.Value);
            }

            if (request.Filter.MinNetBookValue.HasValue)
            {
                query = query.Where(x => x.NetBookValue.Amount >= request.Filter.MinNetBookValue.Value);
            }

            if (request.Filter.MaxNetBookValue.HasValue)
            {
                query = query.Where(x => x.NetBookValue.Amount <= request.Filter.MaxNetBookValue.Value);
            }

            if (request.Filter.SupplierId.HasValue)
            {
                query = query.Where(x => x.SupplierId == request.Filter.SupplierId.Value);
            }
        }

        // Get total count
        var totalCount = await query.CountAsync(cancellationToken);

        // Apply sorting
        var sortBy = request.Filter?.SortBy ?? "Code";
        var sortDesc = request.Filter?.SortDescending ?? false;

        query = sortBy.ToLower() switch
        {
            "name" => sortDesc ? query.OrderByDescending(x => x.Name) : query.OrderBy(x => x.Name),
            "acquisitiondate" => sortDesc ? query.OrderByDescending(x => x.AcquisitionDate) : query.OrderBy(x => x.AcquisitionDate),
            "acquisitioncost" => sortDesc ? query.OrderByDescending(x => x.AcquisitionCost.Amount) : query.OrderBy(x => x.AcquisitionCost.Amount),
            "netbookvalue" => sortDesc ? query.OrderByDescending(x => x.NetBookValue.Amount) : query.OrderBy(x => x.NetBookValue.Amount),
            "status" => sortDesc ? query.OrderByDescending(x => x.Status) : query.OrderBy(x => x.Status),
            "category" => sortDesc ? query.OrderByDescending(x => x.Category) : query.OrderBy(x => x.Category),
            _ => sortDesc ? query.OrderByDescending(x => x.Code) : query.OrderBy(x => x.Code)
        };

        // Apply pagination
        var pageNumber = request.Filter?.PageNumber ?? 1;
        var pageSize = request.Filter?.PageSize ?? 20;
        var assets = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var dtos = assets.Select(MapToSummaryDto).ToList();

        return Result<PagedResult<FixedAssetSummaryDto>>.Success(
            new PagedResult<FixedAssetSummaryDto>(dtos, pageNumber, pageSize, totalCount));
    }

    private static FixedAssetSummaryDto MapToSummaryDto(FixedAsset asset)
    {
        return new FixedAssetSummaryDto
        {
            Id = asset.Id,
            Code = asset.Code,
            Name = asset.Name,
            AssetType = asset.AssetType,
            AssetTypeName = GetAssetTypeName(asset.AssetType),
            Category = asset.Category,
            CategoryName = GetCategoryName(asset.Category),
            AcquisitionDate = asset.AcquisitionDate,
            AcquisitionCost = asset.AcquisitionCost.Amount,
            NetBookValue = asset.NetBookValue.Amount,
            Currency = asset.Currency,
            Status = asset.Status,
            StatusName = GetStatusName(asset.Status),
            IsActive = asset.IsActive,
            IsFullyDepreciated = asset.IsFullyDepreciated,
            LocationName = asset.LocationName,
            CustodianName = asset.CustodianName,
            RemainingUsefulLifeMonths = asset.RemainingUsefulLifeMonths
        };
    }

    private static string GetAssetTypeName(FixedAssetType type) => type switch
    {
        FixedAssetType.Tangible => "Maddi Duran Varlık",
        FixedAssetType.Intangible => "Maddi Olmayan Duran Varlık",
        _ => type.ToString()
    };

    private static string GetCategoryName(FixedAssetCategory category) => category switch
    {
        FixedAssetCategory.Land => "Arazi ve Arsalar",
        FixedAssetCategory.LandImprovements => "Yeraltı ve Yerüstü Düzenleri",
        FixedAssetCategory.Buildings => "Binalar",
        FixedAssetCategory.MachineryEquipment => "Tesis, Makine ve Cihazlar",
        FixedAssetCategory.Vehicles => "Taşıtlar",
        FixedAssetCategory.Fixtures => "Demirbaşlar",
        FixedAssetCategory.OtherTangible => "Diğer Maddi Duran Varlıklar",
        FixedAssetCategory.Leasehold => "Özel Maliyetler",
        FixedAssetCategory.IntangibleRights => "Haklar",
        FixedAssetCategory.Patents => "Patent",
        FixedAssetCategory.Goodwill => "Şerefiye",
        FixedAssetCategory.OrganizationCosts => "Kuruluş ve Örgütlenme Giderleri",
        FixedAssetCategory.RnD => "Araştırma ve Geliştirme Giderleri",
        FixedAssetCategory.Software => "Yazılımlar",
        FixedAssetCategory.OtherIntangible => "Diğer Maddi Olmayan Duran Varlıklar",
        _ => category.ToString()
    };

    private static string GetStatusName(FixedAssetStatus status) => status switch
    {
        FixedAssetStatus.Acquired => "Alındı",
        FixedAssetStatus.InService => "Kullanımda",
        FixedAssetStatus.UnderMaintenance => "Bakımda",
        FixedAssetStatus.OutOfService => "Kullanım Dışı",
        FixedAssetStatus.Disposed => "Elden Çıkarıldı",
        FixedAssetStatus.Lost => "Kayıp",
        _ => status.ToString()
    };
}

#endregion

#region Get Fixed Asset By Id

/// <summary>
/// ID ile sabit kıymet sorgusu
/// </summary>
public class GetFixedAssetByIdQuery : IRequest<Result<FixedAssetDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

/// <summary>
/// GetFixedAssetByIdQuery Handler
/// </summary>
public class GetFixedAssetByIdQueryHandler : IRequestHandler<GetFixedAssetByIdQuery, Result<FixedAssetDto>>
{
    private readonly IFinanceRepository<FixedAsset> _repository;

    public GetFixedAssetByIdQueryHandler(IFinanceRepository<FixedAsset> repository)
    {
        _repository = repository;
    }

    public async Task<Result<FixedAssetDto>> Handle(GetFixedAssetByIdQuery request, CancellationToken cancellationToken)
    {
        var fixedAsset = await _repository.AsQueryable()
            .Include(x => x.Depreciations.OrderByDescending(d => d.PeriodEnd))
            .Include(x => x.AssetAccount)
            .Include(x => x.AccumulatedDepreciationAccount)
            .Include(x => x.DepreciationExpenseAccount)
            .Include(x => x.Supplier)
            .Include(x => x.CostCenter)
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

        if (fixedAsset == null)
        {
            return Result<FixedAssetDto>.Failure(
                Error.NotFound("FixedAsset", $"ID {request.Id} ile sabit kıymet bulunamadı"));
        }

        var dto = CreateFixedAssetCommandHandler.MapToDto(fixedAsset);
        return Result<FixedAssetDto>.Success(dto);
    }
}

#endregion

#region Get Fixed Assets By Category

/// <summary>
/// Kategoriye göre sabit kıymet sorgusu
/// </summary>
public class GetFixedAssetsByCategoryQuery : IRequest<Result<List<FixedAssetSummaryDto>>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public FixedAssetCategory Category { get; set; }
    public bool? IsActive { get; set; }
    public bool IncludeDisposed { get; set; } = false;
}

/// <summary>
/// GetFixedAssetsByCategoryQuery Handler
/// </summary>
public class GetFixedAssetsByCategoryQueryHandler : IRequestHandler<GetFixedAssetsByCategoryQuery, Result<List<FixedAssetSummaryDto>>>
{
    private readonly IFinanceRepository<FixedAsset> _repository;

    public GetFixedAssetsByCategoryQueryHandler(IFinanceRepository<FixedAsset> repository)
    {
        _repository = repository;
    }

    public async Task<Result<List<FixedAssetSummaryDto>>> Handle(GetFixedAssetsByCategoryQuery request, CancellationToken cancellationToken)
    {
        var query = _repository.AsQueryable()
            .Where(x => x.Category == request.Category);

        if (request.IsActive.HasValue)
        {
            query = query.Where(x => x.IsActive == request.IsActive.Value);
        }

        if (!request.IncludeDisposed)
        {
            query = query.Where(x => x.Status != FixedAssetStatus.Disposed);
        }

        var assets = await query
            .OrderBy(x => x.Code)
            .ToListAsync(cancellationToken);

        var dtos = assets.Select(asset => new FixedAssetSummaryDto
        {
            Id = asset.Id,
            Code = asset.Code,
            Name = asset.Name,
            AssetType = asset.AssetType,
            AssetTypeName = GetAssetTypeName(asset.AssetType),
            Category = asset.Category,
            CategoryName = GetCategoryName(asset.Category),
            AcquisitionDate = asset.AcquisitionDate,
            AcquisitionCost = asset.AcquisitionCost.Amount,
            NetBookValue = asset.NetBookValue.Amount,
            Currency = asset.Currency,
            Status = asset.Status,
            StatusName = GetStatusName(asset.Status),
            IsActive = asset.IsActive,
            IsFullyDepreciated = asset.IsFullyDepreciated,
            LocationName = asset.LocationName,
            CustodianName = asset.CustodianName,
            RemainingUsefulLifeMonths = asset.RemainingUsefulLifeMonths
        }).ToList();

        return Result<List<FixedAssetSummaryDto>>.Success(dtos);
    }

    private static string GetAssetTypeName(FixedAssetType type) => type switch
    {
        FixedAssetType.Tangible => "Maddi Duran Varlık",
        FixedAssetType.Intangible => "Maddi Olmayan Duran Varlık",
        _ => type.ToString()
    };

    private static string GetCategoryName(FixedAssetCategory category) => category switch
    {
        FixedAssetCategory.Land => "Arazi ve Arsalar",
        FixedAssetCategory.LandImprovements => "Yeraltı ve Yerüstü Düzenleri",
        FixedAssetCategory.Buildings => "Binalar",
        FixedAssetCategory.MachineryEquipment => "Tesis, Makine ve Cihazlar",
        FixedAssetCategory.Vehicles => "Taşıtlar",
        FixedAssetCategory.Fixtures => "Demirbaşlar",
        FixedAssetCategory.OtherTangible => "Diğer Maddi Duran Varlıklar",
        FixedAssetCategory.Leasehold => "Özel Maliyetler",
        FixedAssetCategory.IntangibleRights => "Haklar",
        FixedAssetCategory.Patents => "Patent",
        FixedAssetCategory.Goodwill => "Şerefiye",
        FixedAssetCategory.OrganizationCosts => "Kuruluş ve Örgütlenme Giderleri",
        FixedAssetCategory.RnD => "Araştırma ve Geliştirme Giderleri",
        FixedAssetCategory.Software => "Yazılımlar",
        FixedAssetCategory.OtherIntangible => "Diğer Maddi Olmayan Duran Varlıklar",
        _ => category.ToString()
    };

    private static string GetStatusName(FixedAssetStatus status) => status switch
    {
        FixedAssetStatus.Acquired => "Alındı",
        FixedAssetStatus.InService => "Kullanımda",
        FixedAssetStatus.UnderMaintenance => "Bakımda",
        FixedAssetStatus.OutOfService => "Kullanım Dışı",
        FixedAssetStatus.Disposed => "Elden Çıkarıldı",
        FixedAssetStatus.Lost => "Kayıp",
        _ => status.ToString()
    };
}

#endregion

#region Get Depreciation Schedule

/// <summary>
/// Amortisman tablosu sorgusu
/// </summary>
public class GetDepreciationScheduleQuery : IRequest<Result<DepreciationScheduleDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int FixedAssetId { get; set; }
}

/// <summary>
/// GetDepreciationScheduleQuery Handler
/// </summary>
public class GetDepreciationScheduleQueryHandler : IRequestHandler<GetDepreciationScheduleQuery, Result<DepreciationScheduleDto>>
{
    private readonly IFinanceRepository<FixedAsset> _repository;

    public GetDepreciationScheduleQueryHandler(IFinanceRepository<FixedAsset> repository)
    {
        _repository = repository;
    }

    public async Task<Result<DepreciationScheduleDto>> Handle(GetDepreciationScheduleQuery request, CancellationToken cancellationToken)
    {
        var fixedAsset = await _repository.AsQueryable()
            .Include(x => x.Depreciations.OrderBy(d => d.PeriodStart))
            .FirstOrDefaultAsync(x => x.Id == request.FixedAssetId, cancellationToken);

        if (fixedAsset == null)
        {
            return Result<DepreciationScheduleDto>.Failure(
                Error.NotFound("FixedAsset", $"ID {request.FixedAssetId} ile sabit kıymet bulunamadı"));
        }

        var startDate = fixedAsset.DepreciationStartDate ?? fixedAsset.InServiceDate ?? fixedAsset.AcquisitionDate;

        var schedule = new DepreciationScheduleDto
        {
            FixedAssetId = fixedAsset.Id,
            FixedAssetCode = fixedAsset.Code,
            FixedAssetName = fixedAsset.Name,
            AcquisitionCost = fixedAsset.AcquisitionCost.Amount,
            SalvageValue = fixedAsset.SalvageValue.Amount,
            DepreciableAmount = fixedAsset.DepreciableAmount.Amount,
            DepreciationMethod = fixedAsset.DepreciationMethod,
            DepreciationMethodName = GetDepreciationMethodName(fixedAsset.DepreciationMethod),
            UsefulLifeYears = fixedAsset.UsefulLifeYears,
            DepreciationRate = fixedAsset.DepreciationRate,
            DepreciationStartDate = startDate,
            Currency = fixedAsset.Currency,
            Rows = new List<DepreciationScheduleRowDto>()
        };

        // Build schedule rows based on depreciation period
        var periods = fixedAsset.DepreciationPeriod switch
        {
            DepreciationPeriod.Monthly => fixedAsset.UsefulLifeMonths,
            DepreciationPeriod.Quarterly => fixedAsset.UsefulLifeMonths / 3,
            DepreciationPeriod.Annually => fixedAsset.UsefulLifeYears,
            _ => fixedAsset.UsefulLifeMonths
        };

        var annualDepreciation = fixedAsset.DepreciableAmount.Amount / fixedAsset.UsefulLifeYears;
        var periodDepreciation = fixedAsset.DepreciationPeriod switch
        {
            DepreciationPeriod.Monthly => annualDepreciation / 12,
            DepreciationPeriod.Quarterly => annualDepreciation / 4,
            DepreciationPeriod.Annually => annualDepreciation,
            _ => annualDepreciation / 12
        };

        var openingValue = fixedAsset.CostValue.Amount;
        var accumulatedDepreciation = 0m;
        var actualDepreciations = fixedAsset.Depreciations.ToDictionary(d => d.Period);

        for (int i = 1; i <= periods; i++)
        {
            var periodStart = fixedAsset.DepreciationPeriod switch
            {
                DepreciationPeriod.Monthly => startDate.AddMonths(i - 1),
                DepreciationPeriod.Quarterly => startDate.AddMonths((i - 1) * 3),
                DepreciationPeriod.Annually => startDate.AddYears(i - 1),
                _ => startDate.AddMonths(i - 1)
            };

            var periodEnd = fixedAsset.DepreciationPeriod switch
            {
                DepreciationPeriod.Monthly => periodStart.AddMonths(1).AddDays(-1),
                DepreciationPeriod.Quarterly => periodStart.AddMonths(3).AddDays(-1),
                DepreciationPeriod.Annually => periodStart.AddYears(1).AddDays(-1),
                _ => periodStart.AddMonths(1).AddDays(-1)
            };

            var periodName = fixedAsset.DepreciationPeriod switch
            {
                DepreciationPeriod.Monthly => periodStart.ToString("yyyy-MM"),
                DepreciationPeriod.Quarterly => $"{periodStart.Year}-Q{(periodStart.Month - 1) / 3 + 1}",
                DepreciationPeriod.Annually => periodStart.Year.ToString(),
                _ => periodStart.ToString("yyyy-MM")
            };

            // Check if this is an actual (recorded) depreciation
            var isActual = actualDepreciations.ContainsKey(periodName);
            var actualAmount = isActual ? actualDepreciations[periodName].DepreciationAmount.Amount : periodDepreciation;

            // Ensure we don't go below salvage value
            var remainingDepreciable = openingValue - accumulatedDepreciation - fixedAsset.SalvageValue.Amount;
            var depreciationAmount = Math.Min(actualAmount, remainingDepreciable);
            if (depreciationAmount < 0) depreciationAmount = 0;

            accumulatedDepreciation += depreciationAmount;
            var closingValue = openingValue - accumulatedDepreciation;

            schedule.Rows.Add(new DepreciationScheduleRowDto
            {
                Period = i,
                PeriodName = periodName,
                PeriodStart = periodStart,
                PeriodEnd = periodEnd,
                OpeningValue = openingValue - accumulatedDepreciation + depreciationAmount,
                DepreciationAmount = depreciationAmount,
                AccumulatedDepreciation = accumulatedDepreciation,
                ClosingValue = closingValue,
                IsActual = isActual
            });

            if (closingValue <= fixedAsset.SalvageValue.Amount)
            {
                break;
            }
        }

        return Result<DepreciationScheduleDto>.Success(schedule);
    }

    private static string GetDepreciationMethodName(DepreciationMethod method) => method switch
    {
        DepreciationMethod.StraightLine => "Normal Amortisman",
        DepreciationMethod.DecliningBalance => "Azalan Bakiyeler",
        DepreciationMethod.DoubleDecliningBalance => "Çift Azalan Bakiyeler",
        DepreciationMethod.SumOfYearsDigits => "Yılların Toplamı",
        DepreciationMethod.UnitsOfProduction => "Üretim Birimi",
        DepreciationMethod.None => "Amortisman Yok",
        _ => method.ToString()
    };
}

#endregion

#region Get Depreciations By Asset

/// <summary>
/// Sabit kıymete ait amortisman kayıtları sorgusu
/// </summary>
public class GetDepreciationsByAssetQuery : IRequest<Result<List<DepreciationDto>>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int FixedAssetId { get; set; }
}

/// <summary>
/// GetDepreciationsByAssetQuery Handler
/// </summary>
public class GetDepreciationsByAssetQueryHandler : IRequestHandler<GetDepreciationsByAssetQuery, Result<List<DepreciationDto>>>
{
    private readonly IFinanceRepository<FixedAsset> _repository;

    public GetDepreciationsByAssetQueryHandler(IFinanceRepository<FixedAsset> repository)
    {
        _repository = repository;
    }

    public async Task<Result<List<DepreciationDto>>> Handle(GetDepreciationsByAssetQuery request, CancellationToken cancellationToken)
    {
        var fixedAsset = await _repository.AsQueryable()
            .Include(x => x.Depreciations.OrderByDescending(d => d.PeriodEnd))
            .FirstOrDefaultAsync(x => x.Id == request.FixedAssetId, cancellationToken);

        if (fixedAsset == null)
        {
            return Result<List<DepreciationDto>>.Failure(
                Error.NotFound("FixedAsset", $"ID {request.FixedAssetId} ile sabit kıymet bulunamadı"));
        }

        var dtos = fixedAsset.Depreciations.Select(d => new DepreciationDto
        {
            Id = d.Id,
            FixedAssetId = d.FixedAssetId,
            FixedAssetCode = fixedAsset.Code,
            FixedAssetName = fixedAsset.Name,
            Period = d.Period,
            PeriodStart = d.PeriodStart,
            PeriodEnd = d.PeriodEnd,
            DepreciationAmount = d.DepreciationAmount.Amount,
            AccumulatedDepreciation = d.AccumulatedDepreciation.Amount,
            NetBookValue = d.NetBookValue.Amount,
            Currency = d.DepreciationAmount.Currency,
            JournalEntryId = d.JournalEntryId,
            IsPosted = d.IsPosted,
            CalculationDate = d.CalculationDate
        }).ToList();

        return Result<List<DepreciationDto>>.Success(dtos);
    }
}

#endregion

#region Get Assets For Depreciation

/// <summary>
/// Amortisman hesaplanacak sabit kıymetler sorgusu
/// </summary>
public class GetAssetsForDepreciationQuery : IRequest<Result<List<FixedAssetSummaryDto>>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public DateTime AsOfDate { get; set; }
    public FixedAssetCategory? Category { get; set; }
}

/// <summary>
/// GetAssetsForDepreciationQuery Handler
/// </summary>
public class GetAssetsForDepreciationQueryHandler : IRequestHandler<GetAssetsForDepreciationQuery, Result<List<FixedAssetSummaryDto>>>
{
    private readonly IFinanceRepository<FixedAsset> _repository;

    public GetAssetsForDepreciationQueryHandler(IFinanceRepository<FixedAsset> repository)
    {
        _repository = repository;
    }

    public async Task<Result<List<FixedAssetSummaryDto>>> Handle(GetAssetsForDepreciationQuery request, CancellationToken cancellationToken)
    {
        var query = _repository.AsQueryable()
            .Where(x => x.IsActive &&
                       !x.IsFullyDepreciated &&
                       x.Status == FixedAssetStatus.InService &&
                       x.InServiceDate.HasValue &&
                       x.DepreciationMethod != DepreciationMethod.None);

        if (request.Category.HasValue)
        {
            query = query.Where(x => x.Category == request.Category.Value);
        }

        // Filter assets that haven't been depreciated for the current period
        var period = request.AsOfDate.ToString("yyyy-MM");
        query = query.Where(x => !x.Depreciations.Any(d => d.Period == period));

        var assets = await query
            .OrderBy(x => x.Code)
            .ToListAsync(cancellationToken);

        var dtos = assets.Select(asset => new FixedAssetSummaryDto
        {
            Id = asset.Id,
            Code = asset.Code,
            Name = asset.Name,
            AssetType = asset.AssetType,
            AssetTypeName = GetAssetTypeName(asset.AssetType),
            Category = asset.Category,
            CategoryName = GetCategoryName(asset.Category),
            AcquisitionDate = asset.AcquisitionDate,
            AcquisitionCost = asset.AcquisitionCost.Amount,
            NetBookValue = asset.NetBookValue.Amount,
            Currency = asset.Currency,
            Status = asset.Status,
            StatusName = GetStatusName(asset.Status),
            IsActive = asset.IsActive,
            IsFullyDepreciated = asset.IsFullyDepreciated,
            LocationName = asset.LocationName,
            CustodianName = asset.CustodianName,
            RemainingUsefulLifeMonths = asset.RemainingUsefulLifeMonths
        }).ToList();

        return Result<List<FixedAssetSummaryDto>>.Success(dtos);
    }

    private static string GetAssetTypeName(FixedAssetType type) => type switch
    {
        FixedAssetType.Tangible => "Maddi Duran Varlık",
        FixedAssetType.Intangible => "Maddi Olmayan Duran Varlık",
        _ => type.ToString()
    };

    private static string GetCategoryName(FixedAssetCategory category) => category switch
    {
        FixedAssetCategory.Land => "Arazi ve Arsalar",
        FixedAssetCategory.LandImprovements => "Yeraltı ve Yerüstü Düzenleri",
        FixedAssetCategory.Buildings => "Binalar",
        FixedAssetCategory.MachineryEquipment => "Tesis, Makine ve Cihazlar",
        FixedAssetCategory.Vehicles => "Taşıtlar",
        FixedAssetCategory.Fixtures => "Demirbaşlar",
        FixedAssetCategory.OtherTangible => "Diğer Maddi Duran Varlıklar",
        FixedAssetCategory.Leasehold => "Özel Maliyetler",
        FixedAssetCategory.IntangibleRights => "Haklar",
        FixedAssetCategory.Patents => "Patent",
        FixedAssetCategory.Goodwill => "Şerefiye",
        FixedAssetCategory.OrganizationCosts => "Kuruluş ve Örgütlenme Giderleri",
        FixedAssetCategory.RnD => "Araştırma ve Geliştirme Giderleri",
        FixedAssetCategory.Software => "Yazılımlar",
        FixedAssetCategory.OtherIntangible => "Diğer Maddi Olmayan Duran Varlıklar",
        _ => category.ToString()
    };

    private static string GetStatusName(FixedAssetStatus status) => status switch
    {
        FixedAssetStatus.Acquired => "Alındı",
        FixedAssetStatus.InService => "Kullanımda",
        FixedAssetStatus.UnderMaintenance => "Bakımda",
        FixedAssetStatus.OutOfService => "Kullanım Dışı",
        FixedAssetStatus.Disposed => "Elden Çıkarıldı",
        FixedAssetStatus.Lost => "Kayıp",
        _ => status.ToString()
    };
}

#endregion

#region Get Fixed Assets Summary By Category

/// <summary>
/// Kategoriye göre sabit kıymet özet raporu sorgusu
/// </summary>
public class GetFixedAssetsSummaryByCategoryQuery : IRequest<Result<List<FixedAssetCategorySummaryDto>>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public bool IncludeDisposed { get; set; } = false;
}

/// <summary>
/// Kategori bazında özet DTO
/// </summary>
public class FixedAssetCategorySummaryDto
{
    public FixedAssetCategory Category { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string AccountGroup { get; set; } = string.Empty;
    public int Count { get; set; }
    public decimal TotalAcquisitionCost { get; set; }
    public decimal TotalAccumulatedDepreciation { get; set; }
    public decimal TotalNetBookValue { get; set; }
    public string Currency { get; set; } = "TRY";
}

/// <summary>
/// GetFixedAssetsSummaryByCategoryQuery Handler
/// </summary>
public class GetFixedAssetsSummaryByCategoryQueryHandler : IRequestHandler<GetFixedAssetsSummaryByCategoryQuery, Result<List<FixedAssetCategorySummaryDto>>>
{
    private readonly IFinanceRepository<FixedAsset> _repository;

    public GetFixedAssetsSummaryByCategoryQueryHandler(IFinanceRepository<FixedAsset> repository)
    {
        _repository = repository;
    }

    public async Task<Result<List<FixedAssetCategorySummaryDto>>> Handle(GetFixedAssetsSummaryByCategoryQuery request, CancellationToken cancellationToken)
    {
        var query = _repository.AsQueryable();

        if (!request.IncludeDisposed)
        {
            query = query.Where(x => x.Status != FixedAssetStatus.Disposed);
        }

        var summaries = await query
            .GroupBy(x => new { x.Category, x.AccountGroup, x.Currency })
            .Select(g => new FixedAssetCategorySummaryDto
            {
                Category = g.Key.Category,
                CategoryName = string.Empty, // Will be set after query
                AccountGroup = g.Key.AccountGroup,
                Count = g.Count(),
                TotalAcquisitionCost = g.Sum(x => x.AcquisitionCost.Amount),
                TotalAccumulatedDepreciation = g.Sum(x => x.AccumulatedDepreciation.Amount),
                TotalNetBookValue = g.Sum(x => x.NetBookValue.Amount),
                Currency = g.Key.Currency
            })
            .OrderBy(x => x.AccountGroup)
            .ToListAsync(cancellationToken);

        // Set category names
        foreach (var summary in summaries)
        {
            summary.CategoryName = GetCategoryName(summary.Category);
        }

        return Result<List<FixedAssetCategorySummaryDto>>.Success(summaries);
    }

    private static string GetCategoryName(FixedAssetCategory category) => category switch
    {
        FixedAssetCategory.Land => "Arazi ve Arsalar",
        FixedAssetCategory.LandImprovements => "Yeraltı ve Yerüstü Düzenleri",
        FixedAssetCategory.Buildings => "Binalar",
        FixedAssetCategory.MachineryEquipment => "Tesis, Makine ve Cihazlar",
        FixedAssetCategory.Vehicles => "Taşıtlar",
        FixedAssetCategory.Fixtures => "Demirbaşlar",
        FixedAssetCategory.OtherTangible => "Diğer Maddi Duran Varlıklar",
        FixedAssetCategory.Leasehold => "Özel Maliyetler",
        FixedAssetCategory.IntangibleRights => "Haklar",
        FixedAssetCategory.Patents => "Patent",
        FixedAssetCategory.Goodwill => "Şerefiye",
        FixedAssetCategory.OrganizationCosts => "Kuruluş ve Örgütlenme Giderleri",
        FixedAssetCategory.RnD => "Araştırma ve Geliştirme Giderleri",
        FixedAssetCategory.Software => "Yazılımlar",
        FixedAssetCategory.OtherIntangible => "Diğer Maddi Olmayan Duran Varlıklar",
        _ => category.ToString()
    };
}

#endregion
