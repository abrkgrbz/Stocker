using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Finance.Application.DTOs;
using Stocker.Modules.Finance.Domain.Entities;
using Stocker.Modules.Finance.Domain.Repositories;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;
using Stocker.Domain.Common.ValueObjects;

namespace Stocker.Modules.Finance.Application.Features.FixedAssets.Commands;

#region Create Fixed Asset

/// <summary>
/// Sabit kıymet oluşturma komutu
/// </summary>
public class CreateFixedAssetCommand : IRequest<Result<FixedAssetDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public CreateFixedAssetDto Data { get; set; } = null!;
}

/// <summary>
/// CreateFixedAssetCommand Handler
/// </summary>
public class CreateFixedAssetCommandHandler : IRequestHandler<CreateFixedAssetCommand, Result<FixedAssetDto>>
{
    private readonly IFinanceRepository<FixedAsset> _repository;

    public CreateFixedAssetCommandHandler(IFinanceRepository<FixedAsset> repository)
    {
        _repository = repository;
    }

    public async Task<Result<FixedAssetDto>> Handle(CreateFixedAssetCommand request, CancellationToken cancellationToken)
    {
        // Check if code already exists
        var existingAsset = await _repository.FirstOrDefaultAsync(
            x => x.Code == request.Data.Code, cancellationToken);

        if (existingAsset != null)
        {
            return Result<FixedAssetDto>.Failure(
                Error.Validation("FixedAsset.Code", $"'{request.Data.Code}' kodlu sabit kıymet zaten mevcut"));
        }

        // Create money objects
        var acquisitionCost = Money.Create(request.Data.AcquisitionCost, request.Data.Currency);

        // Create fixed asset entity
        var fixedAsset = new FixedAsset(
            request.Data.Code,
            request.Data.Name,
            request.Data.AssetType,
            request.Data.Category,
            request.Data.AcquisitionDate,
            acquisitionCost,
            request.Data.UsefulLifeYears,
            request.Data.DepreciationMethod);

        // Set optional fields
        if (!string.IsNullOrEmpty(request.Data.Description))
        {
            fixedAsset.SetDescription(request.Data.Description);
        }

        fixedAsset.SetIdentifiers(
            request.Data.Barcode,
            request.Data.SerialNumber,
            request.Data.ModelNumber,
            request.Data.Brand);

        if (!string.IsNullOrEmpty(request.Data.SubCategory))
        {
            fixedAsset.SetSubCategory(request.Data.SubCategory);
        }

        // Set salvage value
        if (request.Data.SalvageValue > 0)
        {
            var salvageValue = Money.Create(request.Data.SalvageValue, request.Data.Currency);
            fixedAsset.SetSalvageValue(salvageValue);
        }

        // Set dates
        if (request.Data.InServiceDate.HasValue)
        {
            fixedAsset.SetInServiceDate(request.Data.InServiceDate.Value);
        }

        if (request.Data.WarrantyEndDate.HasValue)
        {
            fixedAsset.SetWarrantyEndDate(request.Data.WarrantyEndDate.Value);
        }

        // Set depreciation settings
        fixedAsset.SetDepreciationPeriod(request.Data.DepreciationPeriod);
        fixedAsset.SetPartialYearDepreciation(request.Data.IsPartialYearDepreciation);

        if (request.Data.CustomDepreciationRate.HasValue)
        {
            fixedAsset.SetDepreciationMethod(
                request.Data.DepreciationMethod,
                request.Data.UsefulLifeYears,
                request.Data.CustomDepreciationRate);
        }

        // Set location
        fixedAsset.SetLocation(
            request.Data.LocationId,
            request.Data.LocationName,
            request.Data.DepartmentId,
            request.Data.BranchId);

        if (request.Data.CustodianUserId.HasValue && !string.IsNullOrEmpty(request.Data.CustodianName))
        {
            fixedAsset.SetCustodian(request.Data.CustodianUserId.Value, request.Data.CustodianName);
        }

        // Set supplier
        fixedAsset.SetSupplier(
            request.Data.SupplierId,
            request.Data.SupplierName,
            request.Data.InvoiceId,
            request.Data.InvoiceNumber);

        // Set accounting info
        if (request.Data.AssetAccountId.HasValue &&
            request.Data.AccumulatedDepreciationAccountId.HasValue &&
            request.Data.DepreciationExpenseAccountId.HasValue)
        {
            fixedAsset.SetAccountingInfo(
                request.Data.AssetAccountId.Value,
                request.Data.AssetAccountCode ?? string.Empty,
                request.Data.AccumulatedDepreciationAccountId.Value,
                request.Data.AccumulatedDepreciationAccountCode ?? string.Empty,
                request.Data.DepreciationExpenseAccountId.Value);
        }

        if (request.Data.CostCenterId.HasValue)
        {
            fixedAsset.SetCostCenter(request.Data.CostCenterId.Value);
        }

        // Set insurance
        if (request.Data.IsInsured && !string.IsNullOrEmpty(request.Data.InsurancePolicyNumber))
        {
            var insuranceValue = Money.Create(request.Data.InsuranceValue ?? 0, request.Data.Currency);
            fixedAsset.SetInsurance(
                request.Data.InsurancePolicyNumber,
                request.Data.InsuranceCompany ?? string.Empty,
                request.Data.InsuranceEndDate ?? DateTime.MaxValue,
                insuranceValue);
        }

        // Set other fields
        if (!string.IsNullOrEmpty(request.Data.Notes))
        {
            fixedAsset.SetNotes(request.Data.Notes);
        }

        if (!string.IsNullOrEmpty(request.Data.Tags))
        {
            fixedAsset.SetTags(request.Data.Tags);
        }

        if (!string.IsNullOrEmpty(request.Data.ImagePath))
        {
            fixedAsset.SetImagePath(request.Data.ImagePath);
        }

        // Save
        await _repository.AddAsync(fixedAsset, cancellationToken);

        // Map to DTO
        var dto = MapToDto(fixedAsset);
        return Result<FixedAssetDto>.Success(dto);
    }

    internal static FixedAssetDto MapToDto(FixedAsset asset)
    {
        return new FixedAssetDto
        {
            Id = asset.Id,
            Code = asset.Code,
            Name = asset.Name,
            Description = asset.Description,
            Barcode = asset.Barcode,
            SerialNumber = asset.SerialNumber,
            ModelNumber = asset.ModelNumber,
            Brand = asset.Brand,
            AssetType = asset.AssetType,
            AssetTypeName = GetAssetTypeName(asset.AssetType),
            Category = asset.Category,
            CategoryName = GetCategoryName(asset.Category),
            SubCategory = asset.SubCategory,
            AccountGroup = asset.AccountGroup,
            AcquisitionDate = asset.AcquisitionDate,
            InServiceDate = asset.InServiceDate,
            WarrantyEndDate = asset.WarrantyEndDate,
            DisposalDate = asset.DisposalDate,
            AcquisitionCost = asset.AcquisitionCost.Amount,
            CostValue = asset.CostValue.Amount,
            SalvageValue = asset.SalvageValue.Amount,
            DepreciableAmount = asset.DepreciableAmount.Amount,
            AccumulatedDepreciation = asset.AccumulatedDepreciation.Amount,
            NetBookValue = asset.NetBookValue.Amount,
            Currency = asset.Currency,
            RevaluationAmount = asset.RevaluationAmount?.Amount,
            LastRevaluationDate = asset.LastRevaluationDate,
            DepreciationMethod = asset.DepreciationMethod,
            DepreciationMethodName = GetDepreciationMethodName(asset.DepreciationMethod),
            UsefulLifeYears = asset.UsefulLifeYears,
            UsefulLifeMonths = asset.UsefulLifeMonths,
            DepreciationRate = asset.DepreciationRate,
            RemainingUsefulLifeMonths = asset.RemainingUsefulLifeMonths,
            DepreciationStartDate = asset.DepreciationStartDate,
            LastDepreciationDate = asset.LastDepreciationDate,
            IsPartialYearDepreciation = asset.IsPartialYearDepreciation,
            DepreciationPeriod = asset.DepreciationPeriod,
            DepreciationPeriodName = GetDepreciationPeriodName(asset.DepreciationPeriod),
            LocationId = asset.LocationId,
            LocationName = asset.LocationName,
            DepartmentId = asset.DepartmentId,
            BranchId = asset.BranchId,
            CustodianUserId = asset.CustodianUserId,
            CustodianName = asset.CustodianName,
            SupplierId = asset.SupplierId,
            SupplierName = asset.SupplierName,
            InvoiceId = asset.InvoiceId,
            InvoiceNumber = asset.InvoiceNumber,
            AssetAccountId = asset.AssetAccountId,
            AssetAccountCode = asset.AssetAccountCode,
            AccumulatedDepreciationAccountId = asset.AccumulatedDepreciationAccountId,
            AccumulatedDepreciationAccountCode = asset.AccumulatedDepreciationAccountCode,
            DepreciationExpenseAccountId = asset.DepreciationExpenseAccountId,
            CostCenterId = asset.CostCenterId,
            DisposalType = asset.DisposalType,
            DisposalTypeName = asset.DisposalType.HasValue ? GetDisposalTypeName(asset.DisposalType.Value) : null,
            SaleAmount = asset.SaleAmount?.Amount,
            DisposalGainLoss = asset.DisposalGainLoss?.Amount,
            SaleInvoiceId = asset.SaleInvoiceId,
            BuyerId = asset.BuyerId,
            DisposalReason = asset.DisposalReason,
            IsInsured = asset.IsInsured,
            InsurancePolicyNumber = asset.InsurancePolicyNumber,
            InsuranceCompany = asset.InsuranceCompany,
            InsuranceEndDate = asset.InsuranceEndDate,
            InsuranceValue = asset.InsuranceValue?.Amount,
            Status = asset.Status,
            StatusName = GetStatusName(asset.Status),
            IsActive = asset.IsActive,
            IsFullyDepreciated = asset.IsFullyDepreciated,
            Notes = asset.Notes,
            Tags = asset.Tags,
            ImagePath = asset.ImagePath,
            CreatedAt = asset.CreatedDate,
            UpdatedAt = asset.UpdatedDate,
            Depreciations = asset.Depreciations.Select(MapDepreciationToDto).ToList()
        };
    }

    internal static DepreciationDto MapDepreciationToDto(FixedAssetDepreciation depreciation)
    {
        return new DepreciationDto
        {
            Id = depreciation.Id,
            FixedAssetId = depreciation.FixedAssetId,
            FixedAssetCode = depreciation.FixedAsset?.Code ?? string.Empty,
            FixedAssetName = depreciation.FixedAsset?.Name ?? string.Empty,
            Period = depreciation.Period,
            PeriodStart = depreciation.PeriodStart,
            PeriodEnd = depreciation.PeriodEnd,
            DepreciationAmount = depreciation.DepreciationAmount.Amount,
            AccumulatedDepreciation = depreciation.AccumulatedDepreciation.Amount,
            NetBookValue = depreciation.NetBookValue.Amount,
            Currency = depreciation.DepreciationAmount.Currency,
            JournalEntryId = depreciation.JournalEntryId,
            IsPosted = depreciation.IsPosted,
            CalculationDate = depreciation.CalculationDate
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

    private static string GetDepreciationPeriodName(DepreciationPeriod period) => period switch
    {
        DepreciationPeriod.Monthly => "Aylık",
        DepreciationPeriod.Quarterly => "Üç Aylık",
        DepreciationPeriod.Annually => "Yıllık",
        _ => period.ToString()
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

    private static string GetDisposalTypeName(DisposalType type) => type switch
    {
        DisposalType.Sale => "Satış",
        DisposalType.Scrap => "Hurda",
        DisposalType.Donation => "Bağış",
        DisposalType.Transfer => "Transfer",
        DisposalType.LostStolen => "Kayıp/Çalıntı",
        DisposalType.InsuranceClaim => "Sigorta Hasarı",
        _ => type.ToString()
    };
}

#endregion

#region Update Fixed Asset

/// <summary>
/// Sabit kıymet güncelleme komutu
/// </summary>
public class UpdateFixedAssetCommand : IRequest<Result<FixedAssetDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public UpdateFixedAssetDto Data { get; set; } = null!;
}

/// <summary>
/// UpdateFixedAssetCommand Handler
/// </summary>
public class UpdateFixedAssetCommandHandler : IRequestHandler<UpdateFixedAssetCommand, Result<FixedAssetDto>>
{
    private readonly IFinanceRepository<FixedAsset> _repository;

    public UpdateFixedAssetCommandHandler(IFinanceRepository<FixedAsset> repository)
    {
        _repository = repository;
    }

    public async Task<Result<FixedAssetDto>> Handle(UpdateFixedAssetCommand request, CancellationToken cancellationToken)
    {
        var fixedAsset = await _repository.AsQueryable()
            .Include(x => x.Depreciations)
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

        if (fixedAsset == null)
        {
            return Result<FixedAssetDto>.Failure(
                Error.NotFound("FixedAsset", $"ID {request.Id} ile sabit kıymet bulunamadı"));
        }

        if (fixedAsset.Status == FixedAssetStatus.Disposed)
        {
            return Result<FixedAssetDto>.Failure(
                Error.Validation("FixedAsset.Status", "Elden çıkarılmış sabit kıymetler güncellenemez"));
        }

        // Update basic info
        if (!string.IsNullOrEmpty(request.Data.Description))
        {
            fixedAsset.SetDescription(request.Data.Description);
        }

        fixedAsset.SetIdentifiers(
            request.Data.Barcode ?? fixedAsset.Barcode,
            request.Data.SerialNumber ?? fixedAsset.SerialNumber,
            request.Data.ModelNumber ?? fixedAsset.ModelNumber,
            request.Data.Brand ?? fixedAsset.Brand);

        if (!string.IsNullOrEmpty(request.Data.SubCategory))
        {
            fixedAsset.SetSubCategory(request.Data.SubCategory);
        }

        // Update dates
        if (request.Data.InServiceDate.HasValue)
        {
            fixedAsset.SetInServiceDate(request.Data.InServiceDate.Value);
        }

        if (request.Data.WarrantyEndDate.HasValue)
        {
            fixedAsset.SetWarrantyEndDate(request.Data.WarrantyEndDate.Value);
        }

        // Update salvage value
        if (request.Data.SalvageValue.HasValue)
        {
            var salvageValue = Money.Create(request.Data.SalvageValue.Value, fixedAsset.Currency);
            fixedAsset.SetSalvageValue(salvageValue);
        }

        // Update depreciation settings
        if (request.Data.DepreciationMethod.HasValue || request.Data.UsefulLifeYears.HasValue)
        {
            fixedAsset.SetDepreciationMethod(
                request.Data.DepreciationMethod ?? fixedAsset.DepreciationMethod,
                request.Data.UsefulLifeYears ?? fixedAsset.UsefulLifeYears,
                request.Data.CustomDepreciationRate);
        }

        if (request.Data.DepreciationPeriod.HasValue)
        {
            fixedAsset.SetDepreciationPeriod(request.Data.DepreciationPeriod.Value);
        }

        if (request.Data.IsPartialYearDepreciation.HasValue)
        {
            fixedAsset.SetPartialYearDepreciation(request.Data.IsPartialYearDepreciation.Value);
        }

        // Update location
        if (request.Data.LocationId.HasValue || !string.IsNullOrEmpty(request.Data.LocationName) ||
            request.Data.DepartmentId.HasValue || request.Data.BranchId.HasValue)
        {
            fixedAsset.SetLocation(
                request.Data.LocationId ?? fixedAsset.LocationId,
                request.Data.LocationName ?? fixedAsset.LocationName,
                request.Data.DepartmentId ?? fixedAsset.DepartmentId,
                request.Data.BranchId ?? fixedAsset.BranchId);
        }

        if (request.Data.CustodianUserId.HasValue && !string.IsNullOrEmpty(request.Data.CustodianName))
        {
            fixedAsset.SetCustodian(request.Data.CustodianUserId.Value, request.Data.CustodianName);
        }

        // Update supplier
        if (request.Data.SupplierId.HasValue || !string.IsNullOrEmpty(request.Data.SupplierName))
        {
            fixedAsset.SetSupplier(
                request.Data.SupplierId ?? fixedAsset.SupplierId,
                request.Data.SupplierName ?? fixedAsset.SupplierName,
                request.Data.InvoiceId ?? fixedAsset.InvoiceId,
                request.Data.InvoiceNumber ?? fixedAsset.InvoiceNumber);
        }

        // Update accounting info
        if (request.Data.AssetAccountId.HasValue &&
            request.Data.AccumulatedDepreciationAccountId.HasValue &&
            request.Data.DepreciationExpenseAccountId.HasValue)
        {
            fixedAsset.SetAccountingInfo(
                request.Data.AssetAccountId.Value,
                request.Data.AssetAccountCode ?? string.Empty,
                request.Data.AccumulatedDepreciationAccountId.Value,
                request.Data.AccumulatedDepreciationAccountCode ?? string.Empty,
                request.Data.DepreciationExpenseAccountId.Value);
        }

        if (request.Data.CostCenterId.HasValue)
        {
            fixedAsset.SetCostCenter(request.Data.CostCenterId.Value);
        }

        // Update insurance
        if (request.Data.IsInsured.HasValue && request.Data.IsInsured.Value &&
            !string.IsNullOrEmpty(request.Data.InsurancePolicyNumber))
        {
            var insuranceValue = Money.Create(request.Data.InsuranceValue ?? 0, fixedAsset.Currency);
            fixedAsset.SetInsurance(
                request.Data.InsurancePolicyNumber,
                request.Data.InsuranceCompany ?? string.Empty,
                request.Data.InsuranceEndDate ?? DateTime.MaxValue,
                insuranceValue);
        }

        // Update other fields
        if (request.Data.Notes != null)
        {
            fixedAsset.SetNotes(request.Data.Notes);
        }

        if (request.Data.Tags != null)
        {
            fixedAsset.SetTags(request.Data.Tags);
        }

        if (request.Data.ImagePath != null)
        {
            fixedAsset.SetImagePath(request.Data.ImagePath);
        }

        _repository.Update(fixedAsset);

        var dto = CreateFixedAssetCommandHandler.MapToDto(fixedAsset);
        return Result<FixedAssetDto>.Success(dto);
    }
}

#endregion

#region Delete Fixed Asset

/// <summary>
/// Sabit kıymet silme komutu
/// </summary>
public class DeleteFixedAssetCommand : IRequest<Result<bool>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

/// <summary>
/// DeleteFixedAssetCommand Handler
/// </summary>
public class DeleteFixedAssetCommandHandler : IRequestHandler<DeleteFixedAssetCommand, Result<bool>>
{
    private readonly IFinanceRepository<FixedAsset> _repository;

    public DeleteFixedAssetCommandHandler(IFinanceRepository<FixedAsset> repository)
    {
        _repository = repository;
    }

    public async Task<Result<bool>> Handle(DeleteFixedAssetCommand request, CancellationToken cancellationToken)
    {
        var fixedAsset = await _repository.AsQueryable()
            .Include(x => x.Depreciations)
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

        if (fixedAsset == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("FixedAsset", $"ID {request.Id} ile sabit kıymet bulunamadı"));
        }

        if (fixedAsset.Depreciations.Any(d => d.IsPosted))
        {
            return Result<bool>.Failure(
                Error.Validation("FixedAsset.Depreciations", "Muhasebeye aktarılmış amortisman kaydı bulunan sabit kıymetler silinemez"));
        }

        if (fixedAsset.Status == FixedAssetStatus.InService && fixedAsset.AccumulatedDepreciation.Amount > 0)
        {
            return Result<bool>.Failure(
                Error.Validation("FixedAsset.Status", "Amortismanı başlamış kullanımdaki sabit kıymetler silinemez. Önce elden çıkarma işlemi yapın."));
        }

        _repository.Remove(fixedAsset);

        return Result<bool>.Success(true);
    }
}

#endregion

#region Calculate Depreciation

/// <summary>
/// Amortisman hesaplama komutu
/// </summary>
public class CalculateDepreciationCommand : IRequest<Result<DepreciationDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int FixedAssetId { get; set; }
    public CalculateDepreciationDto Data { get; set; } = null!;
}

/// <summary>
/// CalculateDepreciationCommand Handler
/// </summary>
public class CalculateDepreciationCommandHandler : IRequestHandler<CalculateDepreciationCommand, Result<DepreciationDto>>
{
    private readonly IFinanceRepository<FixedAsset> _repository;
    private readonly IFinanceRepository<FixedAssetDepreciation> _depreciationRepository;

    public CalculateDepreciationCommandHandler(
        IFinanceRepository<FixedAsset> repository,
        IFinanceRepository<FixedAssetDepreciation> depreciationRepository)
    {
        _repository = repository;
        _depreciationRepository = depreciationRepository;
    }

    public async Task<Result<DepreciationDto>> Handle(CalculateDepreciationCommand request, CancellationToken cancellationToken)
    {
        var fixedAsset = await _repository.AsQueryable()
            .Include(x => x.Depreciations)
            .FirstOrDefaultAsync(x => x.Id == request.FixedAssetId, cancellationToken);

        if (fixedAsset == null)
        {
            return Result<DepreciationDto>.Failure(
                Error.NotFound("FixedAsset", $"ID {request.FixedAssetId} ile sabit kıymet bulunamadı"));
        }

        if (fixedAsset.IsFullyDepreciated)
        {
            return Result<DepreciationDto>.Failure(
                Error.Validation("FixedAsset.Depreciation", "Bu sabit kıymet tamamen amortize edilmiş"));
        }

        if (fixedAsset.Status == FixedAssetStatus.Disposed)
        {
            return Result<DepreciationDto>.Failure(
                Error.Validation("FixedAsset.Status", "Elden çıkarılmış sabit kıymetler için amortisman hesaplanamaz"));
        }

        if (!fixedAsset.InServiceDate.HasValue)
        {
            return Result<DepreciationDto>.Failure(
                Error.Validation("FixedAsset.InServiceDate", "Kullanıma alma tarihi belirlenmemiş sabit kıymetler için amortisman hesaplanamaz"));
        }

        // Calculate depreciation amount
        var depreciationAmount = fixedAsset.CalculateDepreciation(request.Data.AsOfDate);

        if (depreciationAmount.Amount <= 0)
        {
            return Result<DepreciationDto>.Failure(
                Error.Validation("FixedAsset.Depreciation", "Hesaplanan amortisman tutarı sıfır veya negatif"));
        }

        // Determine period
        var periodStart = fixedAsset.LastDepreciationDate?.AddDays(1) ?? fixedAsset.DepreciationStartDate ?? fixedAsset.InServiceDate.Value;
        var periodEnd = request.Data.AsOfDate;
        var period = fixedAsset.DepreciationPeriod switch
        {
            DepreciationPeriod.Monthly => periodEnd.ToString("yyyy-MM"),
            DepreciationPeriod.Quarterly => $"{periodEnd.Year}-Q{(periodEnd.Month - 1) / 3 + 1}",
            DepreciationPeriod.Annually => periodEnd.Year.ToString(),
            _ => periodEnd.ToString("yyyy-MM")
        };

        // Check if period already exists
        var existingDepreciation = fixedAsset.Depreciations.FirstOrDefault(d => d.Period == period);
        if (existingDepreciation != null)
        {
            return Result<DepreciationDto>.Failure(
                Error.Validation("FixedAsset.Depreciation", $"'{period}' dönemi için amortisman kaydı zaten mevcut"));
        }

        // Calculate new accumulated and net book value
        var newAccumulatedDepreciation = Money.Create(
            fixedAsset.AccumulatedDepreciation.Amount + depreciationAmount.Amount,
            fixedAsset.Currency);
        var newNetBookValue = Money.Create(
            fixedAsset.CostValue.Amount - newAccumulatedDepreciation.Amount,
            fixedAsset.Currency);

        // Create depreciation record
        var depreciation = new FixedAssetDepreciation(
            fixedAsset.Id,
            period,
            periodStart,
            periodEnd,
            depreciationAmount,
            newAccumulatedDepreciation,
            newNetBookValue);

        // Apply if requested
        if (request.Data.ApplyDepreciation)
        {
            fixedAsset.ApplyDepreciation(depreciationAmount, request.Data.AsOfDate);
            await _depreciationRepository.AddAsync(depreciation, cancellationToken);
        }

        var dto = new DepreciationDto
        {
            Id = depreciation.Id,
            FixedAssetId = fixedAsset.Id,
            FixedAssetCode = fixedAsset.Code,
            FixedAssetName = fixedAsset.Name,
            Period = period,
            PeriodStart = periodStart,
            PeriodEnd = periodEnd,
            DepreciationAmount = depreciationAmount.Amount,
            AccumulatedDepreciation = newAccumulatedDepreciation.Amount,
            NetBookValue = newNetBookValue.Amount,
            Currency = fixedAsset.Currency,
            JournalEntryId = null,
            IsPosted = false,
            CalculationDate = DateTime.UtcNow
        };

        return Result<DepreciationDto>.Success(dto);
    }
}

#endregion

#region Dispose Fixed Asset

/// <summary>
/// Sabit kıymet elden çıkarma komutu (Satış/Hurda)
/// </summary>
public class DisposeFixedAssetCommand : IRequest<Result<FixedAssetDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public DisposeFixedAssetDto Data { get; set; } = null!;
}

/// <summary>
/// DisposeFixedAssetCommand Handler
/// </summary>
public class DisposeFixedAssetCommandHandler : IRequestHandler<DisposeFixedAssetCommand, Result<FixedAssetDto>>
{
    private readonly IFinanceRepository<FixedAsset> _repository;

    public DisposeFixedAssetCommandHandler(IFinanceRepository<FixedAsset> repository)
    {
        _repository = repository;
    }

    public async Task<Result<FixedAssetDto>> Handle(DisposeFixedAssetCommand request, CancellationToken cancellationToken)
    {
        var fixedAsset = await _repository.AsQueryable()
            .Include(x => x.Depreciations)
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

        if (fixedAsset == null)
        {
            return Result<FixedAssetDto>.Failure(
                Error.NotFound("FixedAsset", $"ID {request.Id} ile sabit kıymet bulunamadı"));
        }

        if (fixedAsset.Status == FixedAssetStatus.Disposed)
        {
            return Result<FixedAssetDto>.Failure(
                Error.Validation("FixedAsset.Status", "Bu sabit kıymet zaten elden çıkarılmış"));
        }

        try
        {
            Money? saleAmount = null;
            if (request.Data.SaleAmount.HasValue && request.Data.SaleAmount.Value > 0)
            {
                saleAmount = Money.Create(request.Data.SaleAmount.Value, fixedAsset.Currency);
            }

            switch (request.Data.DisposalType)
            {
                case DisposalType.Sale:
                    if (saleAmount == null || saleAmount.Amount <= 0)
                    {
                        return Result<FixedAssetDto>.Failure(
                            Error.Validation("FixedAsset.SaleAmount", "Satış işlemi için satış tutarı gereklidir"));
                    }
                    fixedAsset.Sell(
                        request.Data.DisposalDate,
                        saleAmount,
                        request.Data.BuyerId,
                        request.Data.SaleInvoiceId);
                    break;

                case DisposalType.Scrap:
                    fixedAsset.Scrap(
                        request.Data.DisposalDate,
                        request.Data.DisposalReason ?? "Hurda olarak çıkarıldı");
                    break;

                case DisposalType.Transfer:
                    fixedAsset.Transfer(
                        request.Data.DisposalDate,
                        request.Data.BuyerId,
                        request.Data.DisposalReason ?? "Transfer edildi");
                    break;

                default:
                    fixedAsset.Dispose(
                        request.Data.DisposalType,
                        request.Data.DisposalDate,
                        saleAmount,
                        request.Data.DisposalReason);
                    break;
            }
        }
        catch (InvalidOperationException ex)
        {
            return Result<FixedAssetDto>.Failure(
                Error.Validation("FixedAsset.Dispose", ex.Message));
        }

        _repository.Update(fixedAsset);

        var dto = CreateFixedAssetCommandHandler.MapToDto(fixedAsset);
        return Result<FixedAssetDto>.Success(dto);
    }
}

#endregion

#region Add To Cost

/// <summary>
/// Maliyete ekleme komutu
/// </summary>
public class AddToCostCommand : IRequest<Result<FixedAssetDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public AddToCostDto Data { get; set; } = null!;
}

/// <summary>
/// AddToCostCommand Handler
/// </summary>
public class AddToCostCommandHandler : IRequestHandler<AddToCostCommand, Result<FixedAssetDto>>
{
    private readonly IFinanceRepository<FixedAsset> _repository;

    public AddToCostCommandHandler(IFinanceRepository<FixedAsset> repository)
    {
        _repository = repository;
    }

    public async Task<Result<FixedAssetDto>> Handle(AddToCostCommand request, CancellationToken cancellationToken)
    {
        var fixedAsset = await _repository.AsQueryable()
            .Include(x => x.Depreciations)
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

        if (fixedAsset == null)
        {
            return Result<FixedAssetDto>.Failure(
                Error.NotFound("FixedAsset", $"ID {request.Id} ile sabit kıymet bulunamadı"));
        }

        if (fixedAsset.Status == FixedAssetStatus.Disposed)
        {
            return Result<FixedAssetDto>.Failure(
                Error.Validation("FixedAsset.Status", "Elden çıkarılmış sabit kıymetlere maliyet eklenemez"));
        }

        try
        {
            var amount = Money.Create(request.Data.Amount, fixedAsset.Currency);
            fixedAsset.AddToCost(amount, request.Data.Description);
        }
        catch (InvalidOperationException ex)
        {
            return Result<FixedAssetDto>.Failure(
                Error.Validation("FixedAsset.AddToCost", ex.Message));
        }

        _repository.Update(fixedAsset);

        var dto = CreateFixedAssetCommandHandler.MapToDto(fixedAsset);
        return Result<FixedAssetDto>.Success(dto);
    }
}

#endregion

#region Revaluation

/// <summary>
/// Yeniden değerleme komutu
/// </summary>
public class RevalueFixedAssetCommand : IRequest<Result<FixedAssetDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public RevaluationDto Data { get; set; } = null!;
}

/// <summary>
/// RevalueFixedAssetCommand Handler
/// </summary>
public class RevalueFixedAssetCommandHandler : IRequestHandler<RevalueFixedAssetCommand, Result<FixedAssetDto>>
{
    private readonly IFinanceRepository<FixedAsset> _repository;

    public RevalueFixedAssetCommandHandler(IFinanceRepository<FixedAsset> repository)
    {
        _repository = repository;
    }

    public async Task<Result<FixedAssetDto>> Handle(RevalueFixedAssetCommand request, CancellationToken cancellationToken)
    {
        var fixedAsset = await _repository.AsQueryable()
            .Include(x => x.Depreciations)
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

        if (fixedAsset == null)
        {
            return Result<FixedAssetDto>.Failure(
                Error.NotFound("FixedAsset", $"ID {request.Id} ile sabit kıymet bulunamadı"));
        }

        if (fixedAsset.Status == FixedAssetStatus.Disposed)
        {
            return Result<FixedAssetDto>.Failure(
                Error.Validation("FixedAsset.Status", "Elden çıkarılmış sabit kıymetler yeniden değerlenemez"));
        }

        try
        {
            var newValue = Money.Create(request.Data.NewValue, fixedAsset.Currency);
            fixedAsset.Revalue(newValue, request.Data.Reason);
        }
        catch (InvalidOperationException ex)
        {
            return Result<FixedAssetDto>.Failure(
                Error.Validation("FixedAsset.Revalue", ex.Message));
        }

        _repository.Update(fixedAsset);

        var dto = CreateFixedAssetCommandHandler.MapToDto(fixedAsset);
        return Result<FixedAssetDto>.Success(dto);
    }
}

#endregion

#region Change Status

/// <summary>
/// Durum değiştirme komutu
/// </summary>
public class ChangeFixedAssetStatusCommand : IRequest<Result<FixedAssetDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public FixedAssetStatus NewStatus { get; set; }
}

/// <summary>
/// ChangeFixedAssetStatusCommand Handler
/// </summary>
public class ChangeFixedAssetStatusCommandHandler : IRequestHandler<ChangeFixedAssetStatusCommand, Result<FixedAssetDto>>
{
    private readonly IFinanceRepository<FixedAsset> _repository;

    public ChangeFixedAssetStatusCommandHandler(IFinanceRepository<FixedAsset> repository)
    {
        _repository = repository;
    }

    public async Task<Result<FixedAssetDto>> Handle(ChangeFixedAssetStatusCommand request, CancellationToken cancellationToken)
    {
        var fixedAsset = await _repository.AsQueryable()
            .Include(x => x.Depreciations)
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

        if (fixedAsset == null)
        {
            return Result<FixedAssetDto>.Failure(
                Error.NotFound("FixedAsset", $"ID {request.Id} ile sabit kıymet bulunamadı"));
        }

        if (fixedAsset.Status == FixedAssetStatus.Disposed && request.NewStatus != FixedAssetStatus.Disposed)
        {
            return Result<FixedAssetDto>.Failure(
                Error.Validation("FixedAsset.Status", "Elden çıkarılmış sabit kıymetlerin durumu değiştirilemez"));
        }

        switch (request.NewStatus)
        {
            case FixedAssetStatus.InService:
                if (fixedAsset.Status == FixedAssetStatus.UnderMaintenance)
                {
                    fixedAsset.ReturnFromMaintenance();
                }
                else
                {
                    fixedAsset.SetStatus(FixedAssetStatus.InService);
                }
                break;

            case FixedAssetStatus.UnderMaintenance:
                fixedAsset.MarkUnderMaintenance();
                break;

            default:
                fixedAsset.SetStatus(request.NewStatus);
                break;
        }

        _repository.Update(fixedAsset);

        var dto = CreateFixedAssetCommandHandler.MapToDto(fixedAsset);
        return Result<FixedAssetDto>.Success(dto);
    }
}

#endregion
