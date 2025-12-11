using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.InventoryAdjustments.Queries;

/// <summary>
/// Query to get an inventory adjustment by ID
/// </summary>
public class GetInventoryAdjustmentByIdQuery : IRequest<Result<InventoryAdjustmentDto>>
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

/// <summary>
/// Handler for GetInventoryAdjustmentByIdQuery
/// </summary>
public class GetInventoryAdjustmentByIdQueryHandler : IRequestHandler<GetInventoryAdjustmentByIdQuery, Result<InventoryAdjustmentDto>>
{
    private readonly IInventoryAdjustmentRepository _repository;

    public GetInventoryAdjustmentByIdQueryHandler(IInventoryAdjustmentRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<InventoryAdjustmentDto>> Handle(GetInventoryAdjustmentByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await _repository.GetByIdAsync(request.Id, cancellationToken);

        if (entity == null)
        {
            return Result<InventoryAdjustmentDto>.Failure(new Error("InventoryAdjustment.NotFound", $"Inventory adjustment with ID {request.Id} not found", ErrorType.NotFound));
        }

        var dto = new InventoryAdjustmentDto
        {
            Id = entity.Id,
            AdjustmentNumber = entity.AdjustmentNumber,
            AdjustmentDate = entity.AdjustmentDate,
            AdjustmentType = entity.AdjustmentType.ToString(),
            Reason = entity.Reason.ToString(),
            Description = entity.Description,
            WarehouseId = entity.WarehouseId,
            WarehouseName = entity.Warehouse?.Name,
            LocationId = entity.LocationId,
            LocationName = entity.Location?.Name,
            StockCountId = entity.StockCountId,
            ReferenceNumber = entity.ReferenceNumber,
            ReferenceType = entity.ReferenceType,
            TotalCostImpact = entity.TotalCostImpact,
            Currency = entity.Currency,
            Status = entity.Status.ToString(),
            ApprovedBy = entity.ApprovedBy,
            ApprovedDate = entity.ApprovedDate,
            RejectionReason = entity.RejectionReason,
            InternalNotes = entity.InternalNotes,
            AccountingNotes = entity.AccountingNotes,
            Items = entity.Items?.Select(i => new InventoryAdjustmentItemDto
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
            }).ToList() ?? new List<InventoryAdjustmentItemDto>(),
            CreatedAt = entity.CreatedDate,
            UpdatedAt = entity.UpdatedDate
        };

        return Result<InventoryAdjustmentDto>.Success(dto);
    }
}
