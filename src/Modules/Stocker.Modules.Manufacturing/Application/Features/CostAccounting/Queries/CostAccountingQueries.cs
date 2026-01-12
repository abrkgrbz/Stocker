using MediatR;
using Stocker.Modules.Manufacturing.Application.DTOs;
using Stocker.Modules.Manufacturing.Domain.Entities;
using Stocker.Modules.Manufacturing.Domain.Enums;
using Stocker.Modules.Manufacturing.Interfaces;

namespace Stocker.Modules.Manufacturing.Application.Features.CostAccounting.Queries;

public record GetProductionCostRecordsQuery(
    int? Year,
    int? Month,
    string? AccountingMethod,
    int? ProductionOrderId,
    int? ProductId,
    string? CostCenterId,
    bool? IsFinalized) : IRequest<IReadOnlyList<ProductionCostRecordListDto>>;

public class GetProductionCostRecordsQueryHandler : IRequestHandler<GetProductionCostRecordsQuery, IReadOnlyList<ProductionCostRecordListDto>>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetProductionCostRecordsQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<ProductionCostRecordListDto>> Handle(GetProductionCostRecordsQuery query, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        IReadOnlyList<ProductionCostRecord> records;

        if (query.Year.HasValue && query.Month.HasValue)
        {
            records = await _unitOfWork.ProductionCostRecords.GetByPeriodAsync(query.Year.Value, query.Month.Value, cancellationToken);
        }
        else if (query.ProductionOrderId.HasValue)
        {
            records = await _unitOfWork.ProductionCostRecords.GetByProductionOrderAsync(query.ProductionOrderId.Value, cancellationToken);
        }
        else if (query.ProductId.HasValue)
        {
            records = await _unitOfWork.ProductionCostRecords.GetByProductAsync(query.ProductId.Value, cancellationToken);
        }
        else if (!string.IsNullOrEmpty(query.CostCenterId))
        {
            records = await _unitOfWork.ProductionCostRecords.GetByCostCenterAsync(query.CostCenterId, cancellationToken);
        }
        else if (!string.IsNullOrEmpty(query.AccountingMethod))
        {
            var method = Enum.Parse<CostAccountingMethod>(query.AccountingMethod);
            records = await _unitOfWork.ProductionCostRecords.GetByAccountingMethodAsync(method, cancellationToken);
        }
        else
        {
            records = await _unitOfWork.ProductionCostRecords.GetAllAsync(cancellationToken);
        }

        var filteredRecords = records.Where(r => r.TenantId == tenantId);

        if (query.IsFinalized.HasValue)
            filteredRecords = filteredRecords.Where(r => r.IsFinalized == query.IsFinalized.Value);

        return filteredRecords.Select(r => new ProductionCostRecordListDto(
            r.Id,
            r.RecordNumber,
            r.AccountingMethod.ToString(),
            r.ProductionOrderNumber,
            r.ProductCode,
            r.ProductName,
            r.Quantity,
            r.Year,
            r.Month,
            r.TotalProductionCost,
            r.UnitTotalCost,
            r.CostVariance,
            r.VariancePercent,
            r.IsFinalized,
            r.CreatedDate)).ToList();
    }
}

public record GetProductionCostRecordByIdQuery(int Id) : IRequest<ProductionCostRecordDto?>;

public class GetProductionCostRecordByIdQueryHandler : IRequestHandler<GetProductionCostRecordByIdQuery, ProductionCostRecordDto?>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetProductionCostRecordByIdQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ProductionCostRecordDto?> Handle(GetProductionCostRecordByIdQuery query, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var record = await _unitOfWork.ProductionCostRecords.GetFullRecordAsync(query.Id, cancellationToken);
        if (record == null || record.TenantId != tenantId)
            return null;

        var allocations = record.CostAllocations?.Select(a => new ProductionCostAllocationDto(
            a.Id,
            a.ProductionCostRecordId,
            a.AccountCode,
            a.AccountName,
            a.Direction.ToString(),
            a.Amount,
            a.AllocationBasis,
            a.AllocationRate,
            a.SourceCostCenter,
            a.TargetCostCenter,
            a.Notes)).ToList();

        var journalEntries = record.JournalEntries?.Select(j => new CostJournalEntryDto(
            j.Id,
            j.ProductionCostRecordId,
            j.EntryDate,
            j.AccountCode,
            j.AccountName,
            j.DebitAmount,
            j.CreditAmount,
            j.Description,
            j.DocumentNumber,
            j.DocumentType,
            j.IsPosted,
            j.PostedDate,
            j.PostedBy)).ToList();

        return new ProductionCostRecordDto(
            record.Id,
            record.RecordNumber,
            record.AccountingMethod.ToString(),
            record.ProductionOrderId,
            record.ProductionOrderNumber,
            record.ProductId,
            record.ProductCode,
            record.ProductName,
            record.Quantity,
            record.Unit,
            record.Year,
            record.Month,
            record.PeriodStart,
            record.PeriodEnd,
            record.DirectMaterialCost,
            record.DirectLaborCost,
            record.ManufacturingOverhead,
            record.VariableOverhead,
            record.FixedOverhead,
            record.TotalProductionCost,
            record.MaterialVariance,
            record.LaborVariance,
            record.OverheadVariance,
            record.UnitDirectMaterialCost,
            record.UnitDirectLaborCost,
            record.UnitOverheadCost,
            record.UnitTotalCost,
            record.StandardCost,
            record.ActualCost,
            record.CostVariance,
            record.VariancePercent,
            record.CostCenterId,
            record.Notes,
            record.CreatedBy,
            record.IsFinalized,
            record.FinalizedDate,
            record.FinalizedBy,
            record.CreatedDate,
            allocations,
            journalEntries);
    }
}

public record GetCostSummaryQuery(int Year, int? Month) : IRequest<CostSummaryDto>;

public class GetCostSummaryQueryHandler : IRequestHandler<GetCostSummaryQuery, CostSummaryDto>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetCostSummaryQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<CostSummaryDto> Handle(GetCostSummaryQuery query, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        IReadOnlyList<ProductionCostRecord> records;

        if (query.Month.HasValue)
        {
            records = await _unitOfWork.ProductionCostRecords.GetByPeriodAsync(query.Year, query.Month.Value, cancellationToken);
        }
        else
        {
            var startDate = new DateTime(query.Year, 1, 1);
            var endDate = new DateTime(query.Year, 12, 31);
            records = await _unitOfWork.ProductionCostRecords.GetByDateRangeAsync(startDate, endDate, cancellationToken);
        }

        var tenantRecords = records.Where(r => r.TenantId == tenantId).ToList();

        return new CostSummaryDto(
            query.Year,
            query.Month ?? 0,
            tenantRecords.Sum(r => r.DirectMaterialCost),
            tenantRecords.Sum(r => r.DirectLaborCost),
            tenantRecords.Sum(r => r.ManufacturingOverhead),
            tenantRecords.Sum(r => r.TotalProductionCost),
            tenantRecords.Sum(r => r.MaterialVariance),
            tenantRecords.Sum(r => r.LaborVariance),
            tenantRecords.Sum(r => r.OverheadVariance),
            tenantRecords.Sum(r => r.CostVariance),
            tenantRecords.Count);
    }
}

public record GetCostCentersQuery(string? Type, bool? ActiveOnly) : IRequest<IReadOnlyList<CostCenterListDto>>;

public class GetCostCentersQueryHandler : IRequestHandler<GetCostCentersQuery, IReadOnlyList<CostCenterListDto>>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetCostCentersQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<CostCenterListDto>> Handle(GetCostCentersQuery query, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        IReadOnlyList<CostCenter> costCenters;

        if (!string.IsNullOrEmpty(query.Type))
        {
            var type = Enum.Parse<CostCenterType>(query.Type);
            costCenters = await _unitOfWork.CostCenters.GetByTypeAsync(type, cancellationToken);
        }
        else if (query.ActiveOnly == true)
        {
            costCenters = await _unitOfWork.CostCenters.GetActiveAsync(cancellationToken);
        }
        else
        {
            costCenters = await _unitOfWork.CostCenters.GetAllAsync(cancellationToken);
        }

        return costCenters
            .Where(c => c.TenantId == tenantId)
            .Select(c => new CostCenterListDto(
                c.Id,
                c.Code,
                c.Name,
                c.Type.ToString(),
                c.ResponsiblePerson,
                c.BudgetAmount,
                c.ActualAmount,
                c.VarianceAmount,
                c.IsActive)).ToList();
    }
}

public record GetCostCenterByIdQuery(int Id) : IRequest<CostCenterDto?>;

public class GetCostCenterByIdQueryHandler : IRequestHandler<GetCostCenterByIdQuery, CostCenterDto?>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetCostCenterByIdQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<CostCenterDto?> Handle(GetCostCenterByIdQuery query, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var costCenter = await _unitOfWork.CostCenters.GetWithChildrenAsync(query.Id, cancellationToken);
        if (costCenter == null || costCenter.TenantId != tenantId)
            return null;

        var children = costCenter.ChildCostCenters?.Select(c => new CostCenterDto(
            c.Id,
            c.Code,
            c.Name,
            c.Description,
            c.Type.ToString(),
            c.ParentCostCenterId,
            null,
            c.ResponsiblePerson,
            c.WorkCenterId,
            null,
            c.BudgetAmount,
            c.ActualAmount,
            c.VarianceAmount,
            c.IsActive,
            c.CreatedDate,
            null)).ToList();

        return new CostCenterDto(
            costCenter.Id,
            costCenter.Code,
            costCenter.Name,
            costCenter.Description,
            costCenter.Type.ToString(),
            costCenter.ParentCostCenterId,
            costCenter.ParentCostCenter?.Name,
            costCenter.ResponsiblePerson,
            costCenter.WorkCenterId,
            costCenter.WorkCenter?.Name,
            costCenter.BudgetAmount,
            costCenter.ActualAmount,
            costCenter.VarianceAmount,
            costCenter.IsActive,
            costCenter.CreatedDate,
            children);
    }
}

public record GetStandardCostCardsQuery(int? ProductId, int? Year, bool? CurrentOnly) : IRequest<IReadOnlyList<StandardCostCardListDto>>;

public class GetStandardCostCardsQueryHandler : IRequestHandler<GetStandardCostCardsQuery, IReadOnlyList<StandardCostCardListDto>>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetStandardCostCardsQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<StandardCostCardListDto>> Handle(GetStandardCostCardsQuery query, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        IReadOnlyList<StandardCostCard> cards;

        if (query.ProductId.HasValue)
        {
            cards = await _unitOfWork.StandardCostCards.GetByProductAsync(query.ProductId.Value, cancellationToken);
        }
        else if (query.Year.HasValue)
        {
            cards = await _unitOfWork.StandardCostCards.GetByYearAsync(query.Year.Value, cancellationToken);
        }
        else if (query.CurrentOnly == true)
        {
            cards = await _unitOfWork.StandardCostCards.GetCurrentCardsAsync(cancellationToken);
        }
        else
        {
            cards = await _unitOfWork.StandardCostCards.GetAllAsync(cancellationToken);
        }

        return cards
            .Where(c => c.TenantId == tenantId)
            .Select(c => new StandardCostCardListDto(
                c.Id,
                c.ProductCode,
                c.ProductName,
                c.Year,
                c.Version,
                c.IsCurrent,
                c.StandardTotalCost,
                c.EffectiveDate,
                c.ApprovedDate.HasValue)).ToList();
    }
}

public record GetStandardCostCardByIdQuery(int Id) : IRequest<StandardCostCardDto?>;

public class GetStandardCostCardByIdQueryHandler : IRequestHandler<GetStandardCostCardByIdQuery, StandardCostCardDto?>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetStandardCostCardByIdQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<StandardCostCardDto?> Handle(GetStandardCostCardByIdQuery query, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var card = await _unitOfWork.StandardCostCards.GetByIdAsync(query.Id, cancellationToken);
        if (card == null || card.TenantId != tenantId)
            return null;

        return new StandardCostCardDto(
            card.Id,
            card.ProductId,
            card.ProductCode,
            card.ProductName,
            card.Year,
            card.Version,
            card.IsCurrent,
            card.StandardMaterialCost,
            card.StandardLaborCost,
            card.StandardOverheadCost,
            card.StandardTotalCost,
            card.StandardMaterialQuantity,
            card.StandardLaborHours,
            card.StandardMachineHours,
            card.MaterialUnitPrice,
            card.LaborHourlyRate,
            card.OverheadRate,
            card.EffectiveDate,
            card.ExpiryDate,
            card.Notes,
            card.CreatedBy,
            card.ApprovedBy,
            card.ApprovedDate,
            card.CreatedDate);
    }
}

public record GetCurrentStandardCostByProductQuery(int ProductId) : IRequest<StandardCostCardDto?>;

public class GetCurrentStandardCostByProductQueryHandler : IRequestHandler<GetCurrentStandardCostByProductQuery, StandardCostCardDto?>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetCurrentStandardCostByProductQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<StandardCostCardDto?> Handle(GetCurrentStandardCostByProductQuery query, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var card = await _unitOfWork.StandardCostCards.GetCurrentByProductAsync(query.ProductId, cancellationToken);
        if (card == null || card.TenantId != tenantId)
            return null;

        return new StandardCostCardDto(
            card.Id,
            card.ProductId,
            card.ProductCode,
            card.ProductName,
            card.Year,
            card.Version,
            card.IsCurrent,
            card.StandardMaterialCost,
            card.StandardLaborCost,
            card.StandardOverheadCost,
            card.StandardTotalCost,
            card.StandardMaterialQuantity,
            card.StandardLaborHours,
            card.StandardMachineHours,
            card.MaterialUnitPrice,
            card.LaborHourlyRate,
            card.OverheadRate,
            card.EffectiveDate,
            card.ExpiryDate,
            card.Notes,
            card.CreatedBy,
            card.ApprovedBy,
            card.ApprovedDate,
            card.CreatedDate);
    }
}
