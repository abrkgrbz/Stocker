using MediatR;
using Stocker.Modules.Manufacturing.Application.DTOs;
using Stocker.Modules.Manufacturing.Domain.Entities;
using Stocker.Modules.Manufacturing.Domain.Enums;
using Stocker.Modules.Manufacturing.Interfaces;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.Manufacturing.Application.Features.CostAccounting.Commands;

public record CreateProductionCostRecordCommand(CreateProductionCostRecordRequest Request) : IRequest<ProductionCostRecordDto>;

public class CreateProductionCostRecordCommandHandler : IRequestHandler<CreateProductionCostRecordCommand, ProductionCostRecordDto>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUser;

    public CreateProductionCostRecordCommandHandler(
        IManufacturingUnitOfWork unitOfWork,
        ICurrentUserService currentUser)
    {
        _unitOfWork = unitOfWork;
        _currentUser = currentUser;
    }

    public async Task<ProductionCostRecordDto> Handle(CreateProductionCostRecordCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var userName = _currentUser.UserName;
        var request = command.Request;

        var accountingMethod = Enum.Parse<CostAccountingMethod>(request.AccountingMethod);
        var recordNumber = $"MCR-{DateTime.UtcNow:yyMMdd}-{Guid.NewGuid().ToString()[..4].ToUpper()}";

        var record = new ProductionCostRecord(
            recordNumber,
            accountingMethod,
            request.ProductionOrderId,
            request.ProductId,
            request.Quantity,
            request.Year,
            request.Month);

        record.SetProductInfo(request.ProductCode, request.ProductName, request.Unit);

        if (!string.IsNullOrEmpty(request.CostCenterId))
            record.SetCostCenter(request.CostCenterId);

        if (!string.IsNullOrEmpty(request.Notes))
            record.SetNotes(request.Notes);

        if (!string.IsNullOrEmpty(userName))
            record.SetCreatedBy(userName);

        _unitOfWork.ProductionCostRecords.Add(record);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToDto(record);
    }

    private static ProductionCostRecordDto MapToDto(ProductionCostRecord entity) => new(
        entity.Id,
        entity.RecordNumber,
        entity.AccountingMethod.ToString(),
        entity.ProductionOrderId,
        entity.ProductionOrderNumber,
        entity.ProductId,
        entity.ProductCode,
        entity.ProductName,
        entity.Quantity,
        entity.Unit,
        entity.Year,
        entity.Month,
        entity.PeriodStart,
        entity.PeriodEnd,
        entity.DirectMaterialCost,
        entity.DirectLaborCost,
        entity.ManufacturingOverhead,
        entity.VariableOverhead,
        entity.FixedOverhead,
        entity.TotalProductionCost,
        entity.MaterialVariance,
        entity.LaborVariance,
        entity.OverheadVariance,
        entity.UnitDirectMaterialCost,
        entity.UnitDirectLaborCost,
        entity.UnitOverheadCost,
        entity.UnitTotalCost,
        entity.StandardCost,
        entity.ActualCost,
        entity.CostVariance,
        entity.VariancePercent,
        entity.CostCenterId,
        entity.Notes,
        entity.CreatedBy,
        entity.IsFinalized,
        entity.FinalizedDate,
        entity.FinalizedBy,
        entity.CreatedDate,
        null, null);
}

public record SetDirectCostsCommand(int Id, SetProductionDirectCostsRequest Request) : IRequest;

public class SetDirectCostsCommandHandler : IRequestHandler<SetDirectCostsCommand>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public SetDirectCostsCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(SetDirectCostsCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var record = await _unitOfWork.ProductionCostRecords.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"ID '{command.Id}' olan maliyet kaydı bulunamadı.");

        if (record.TenantId != tenantId)
            throw new UnauthorizedAccessException("Bu kayda erişim yetkiniz yok.");

        record.SetDirectCosts(command.Request.DirectMaterialCost, command.Request.DirectLaborCost);

        _unitOfWork.ProductionCostRecords.Update(record);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}

public record SetOverheadCostsCommand(int Id, SetOverheadCostsRequest Request) : IRequest;

public class SetOverheadCostsCommandHandler : IRequestHandler<SetOverheadCostsCommand>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public SetOverheadCostsCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(SetOverheadCostsCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var record = await _unitOfWork.ProductionCostRecords.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"ID '{command.Id}' olan maliyet kaydı bulunamadı.");

        if (record.TenantId != tenantId)
            throw new UnauthorizedAccessException("Bu kayda erişim yetkiniz yok.");

        record.SetOverheadCosts(command.Request.VariableOverhead, command.Request.FixedOverhead);

        _unitOfWork.ProductionCostRecords.Update(record);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}

public record SetVariancesCommand(int Id, SetVariancesRequest Request) : IRequest;

public class SetVariancesCommandHandler : IRequestHandler<SetVariancesCommand>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public SetVariancesCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(SetVariancesCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var record = await _unitOfWork.ProductionCostRecords.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"ID '{command.Id}' olan maliyet kaydı bulunamadı.");

        if (record.TenantId != tenantId)
            throw new UnauthorizedAccessException("Bu kayda erişim yetkiniz yok.");

        record.SetVariances(
            command.Request.MaterialVariance,
            command.Request.LaborVariance,
            command.Request.OverheadVariance);

        _unitOfWork.ProductionCostRecords.Update(record);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}

public record FinalizeCostRecordCommand(int Id) : IRequest;

public class FinalizeCostRecordCommandHandler : IRequestHandler<FinalizeCostRecordCommand>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUser;

    public FinalizeCostRecordCommandHandler(
        IManufacturingUnitOfWork unitOfWork,
        ICurrentUserService currentUser)
    {
        _unitOfWork = unitOfWork;
        _currentUser = currentUser;
    }

    public async Task Handle(FinalizeCostRecordCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var userName = _currentUser.UserName ?? throw new UnauthorizedAccessException("Kullanıcı bilgisi bulunamadı.");

        var record = await _unitOfWork.ProductionCostRecords.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"ID '{command.Id}' olan maliyet kaydı bulunamadı.");

        if (record.TenantId != tenantId)
            throw new UnauthorizedAccessException("Bu kayda erişim yetkiniz yok.");

        record.Finalize(userName);

        _unitOfWork.ProductionCostRecords.Update(record);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}

public record AddCostAllocationCommand(int RecordId, AddCostAllocationRequest Request) : IRequest<ProductionCostAllocationDto>;

public class AddCostAllocationCommandHandler : IRequestHandler<AddCostAllocationCommand, ProductionCostAllocationDto>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public AddCostAllocationCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ProductionCostAllocationDto> Handle(AddCostAllocationCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var record = await _unitOfWork.ProductionCostRecords.GetWithAllocationsAsync(command.RecordId, cancellationToken)
            ?? throw new KeyNotFoundException($"ID '{command.RecordId}' olan maliyet kaydı bulunamadı.");

        if (record.TenantId != tenantId)
            throw new UnauthorizedAccessException("Bu kayda erişim yetkiniz yok.");

        var direction = Enum.Parse<CostAllocationDirection>(command.Request.Direction);
        var allocation = record.AddCostAllocation(
            command.Request.AccountCode,
            command.Request.AccountName,
            direction,
            command.Request.Amount);

        if (!string.IsNullOrEmpty(command.Request.AllocationBasis))
            allocation.SetAllocationDetails(command.Request.AllocationBasis, command.Request.AllocationRate);

        if (!string.IsNullOrEmpty(command.Request.SourceCostCenter) || !string.IsNullOrEmpty(command.Request.TargetCostCenter))
            allocation.SetCostCenters(command.Request.SourceCostCenter, command.Request.TargetCostCenter);

        if (!string.IsNullOrEmpty(command.Request.Notes))
            allocation.SetNotes(command.Request.Notes);

        _unitOfWork.ProductionCostRecords.Update(record);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new ProductionCostAllocationDto(
            allocation.Id,
            allocation.ProductionCostRecordId,
            allocation.AccountCode,
            allocation.AccountName,
            allocation.Direction.ToString(),
            allocation.Amount,
            allocation.AllocationBasis,
            allocation.AllocationRate,
            allocation.SourceCostCenter,
            allocation.TargetCostCenter,
            allocation.Notes);
    }
}

public record AddJournalEntryCommand(int RecordId, AddJournalEntryRequest Request) : IRequest<CostJournalEntryDto>;

public class AddJournalEntryCommandHandler : IRequestHandler<AddJournalEntryCommand, CostJournalEntryDto>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public AddJournalEntryCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<CostJournalEntryDto> Handle(AddJournalEntryCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var record = await _unitOfWork.ProductionCostRecords.GetWithJournalEntriesAsync(command.RecordId, cancellationToken)
            ?? throw new KeyNotFoundException($"ID '{command.RecordId}' olan maliyet kaydı bulunamadı.");

        if (record.TenantId != tenantId)
            throw new UnauthorizedAccessException("Bu kayda erişim yetkiniz yok.");

        var entry = record.AddJournalEntry(
            command.Request.AccountCode,
            command.Request.AccountName,
            command.Request.DebitAmount,
            command.Request.CreditAmount);

        if (!string.IsNullOrEmpty(command.Request.Description))
            entry.SetDescription(command.Request.Description);

        if (!string.IsNullOrEmpty(command.Request.DocumentNumber))
            entry.SetDocument(command.Request.DocumentNumber, command.Request.DocumentType ?? "");

        _unitOfWork.ProductionCostRecords.Update(record);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new CostJournalEntryDto(
            entry.Id,
            entry.ProductionCostRecordId,
            entry.EntryDate,
            entry.AccountCode,
            entry.AccountName,
            entry.DebitAmount,
            entry.CreditAmount,
            entry.Description,
            entry.DocumentNumber,
            entry.DocumentType,
            entry.IsPosted,
            entry.PostedDate,
            entry.PostedBy);
    }
}

public record PostJournalEntryCommand(int RecordId, int EntryId) : IRequest;

public class PostJournalEntryCommandHandler : IRequestHandler<PostJournalEntryCommand>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUser;

    public PostJournalEntryCommandHandler(
        IManufacturingUnitOfWork unitOfWork,
        ICurrentUserService currentUser)
    {
        _unitOfWork = unitOfWork;
        _currentUser = currentUser;
    }

    public async Task Handle(PostJournalEntryCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var userName = _currentUser.UserName ?? throw new UnauthorizedAccessException("Kullanıcı bilgisi bulunamadı.");

        var record = await _unitOfWork.ProductionCostRecords.GetWithJournalEntriesAsync(command.RecordId, cancellationToken)
            ?? throw new KeyNotFoundException($"ID '{command.RecordId}' olan maliyet kaydı bulunamadı.");

        if (record.TenantId != tenantId)
            throw new UnauthorizedAccessException("Bu kayda erişim yetkiniz yok.");

        var entry = record.JournalEntries.FirstOrDefault(e => e.Id == command.EntryId)
            ?? throw new KeyNotFoundException($"ID '{command.EntryId}' olan yevmiye kaydı bulunamadı.");

        entry.Post(userName);

        _unitOfWork.ProductionCostRecords.Update(record);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}

public record DeleteCostRecordCommand(int Id) : IRequest;

public class DeleteCostRecordCommandHandler : IRequestHandler<DeleteCostRecordCommand>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public DeleteCostRecordCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(DeleteCostRecordCommand command, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var record = await _unitOfWork.ProductionCostRecords.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"ID '{command.Id}' olan maliyet kaydı bulunamadı.");

        if (record.TenantId != tenantId)
            throw new UnauthorizedAccessException("Bu kaydı silme yetkiniz yok.");

        if (record.IsFinalized)
            throw new InvalidOperationException("Kesinleştirilmiş maliyet kaydı silinemez.");

        _unitOfWork.ProductionCostRecords.Delete(record);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
