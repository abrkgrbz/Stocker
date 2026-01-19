using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.InventoryAdjustments.Queries;

/// <summary>
/// Query to get all inventory adjustments
/// </summary>
public class GetInventoryAdjustmentsQuery : IRequest<Result<List<InventoryAdjustmentDto>>>
{
    public Guid TenantId { get; set; }
    public int? WarehouseId { get; set; }
    public string? Status { get; set; }
    public string? AdjustmentType { get; set; }
    public string? Reason { get; set; }
}

/// <summary>
/// Handler for GetInventoryAdjustmentsQuery
/// </summary>
public class GetInventoryAdjustmentsQueryHandler : IRequestHandler<GetInventoryAdjustmentsQuery, Result<List<InventoryAdjustmentDto>>>
{
    private readonly IInventoryAdjustmentRepository _repository;

    public GetInventoryAdjustmentsQueryHandler(IInventoryAdjustmentRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<List<InventoryAdjustmentDto>>> Handle(GetInventoryAdjustmentsQuery request, CancellationToken cancellationToken)
    {
        IReadOnlyList<InventoryAdjustment> entities;

        if (request.WarehouseId.HasValue)
        {
            entities = await _repository.GetByWarehouseAsync(request.WarehouseId.Value, cancellationToken);
        }
        else if (!string.IsNullOrEmpty(request.Status))
        {
            var status = Enum.Parse<AdjustmentStatus>(request.Status);
            entities = await _repository.GetByStatusAsync(status, cancellationToken);
        }
        else if (!string.IsNullOrEmpty(request.AdjustmentType))
        {
            var adjustmentType = Enum.Parse<AdjustmentType>(request.AdjustmentType);
            entities = await _repository.GetByTypeAsync(adjustmentType, cancellationToken);
        }
        else
        {
            entities = await _repository.GetAllAsync(cancellationToken);
        }

        var dtos = entities.Select(e => new InventoryAdjustmentDto
        {
            Id = e.Id,
            AdjustmentNumber = e.AdjustmentNumber,
            AdjustmentDate = e.AdjustmentDate,
            AdjustmentType = e.AdjustmentType.ToString(),
            Reason = e.Reason.ToString(),
            Description = e.Description,
            WarehouseId = e.WarehouseId,
            WarehouseName = e.Warehouse?.Name,
            LocationId = e.LocationId,
            LocationName = e.Location?.Name,
            StockCountId = e.StockCountId,
            ReferenceNumber = e.ReferenceNumber,
            ReferenceType = e.ReferenceType,
            TotalCostImpact = e.TotalCostImpact,
            Currency = e.Currency,
            Status = e.Status.ToString(),
            ApprovedBy = e.ApprovedBy,
            ApprovedDate = e.ApprovedDate,
            RejectionReason = e.RejectionReason,
            InternalNotes = e.InternalNotes,
            AccountingNotes = e.AccountingNotes,
            Items = e.Items.Select(i => new InventoryAdjustmentItemDto
            {
                Id = i.Id,
                ProductId = i.ProductId,
                ProductName = i.Product?.Name,
                SystemQuantity = i.SystemQuantity,
                ActualQuantity = i.ActualQuantity,
                VarianceQuantity = i.VarianceQuantity,
                UnitCost = i.UnitCost,
                CostImpact = i.CostImpact,
                LotNumber = i.LotNumber,
                SerialNumber = i.SerialNumber,
                ExpiryDate = i.ExpiryDate,
                ReasonCode = i.ReasonCode,
                Notes = i.Notes
            }).ToList(),
            CreatedAt = e.CreatedDate,
            UpdatedAt = e.UpdatedDate
        }).ToList();

        return Result<List<InventoryAdjustmentDto>>.Success(dtos);
    }
}
