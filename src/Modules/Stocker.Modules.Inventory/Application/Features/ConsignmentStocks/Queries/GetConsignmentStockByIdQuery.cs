using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.ConsignmentStocks.Queries;

/// <summary>
/// Query to get a consignment stock by ID
/// </summary>
public class GetConsignmentStockByIdQuery : IRequest<Result<ConsignmentStockDto>>
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

/// <summary>
/// Handler for GetConsignmentStockByIdQuery
/// </summary>
public class GetConsignmentStockByIdQueryHandler : IRequestHandler<GetConsignmentStockByIdQuery, Result<ConsignmentStockDto>>
{
    private readonly IConsignmentStockRepository _repository;

    public GetConsignmentStockByIdQueryHandler(IConsignmentStockRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<ConsignmentStockDto>> Handle(GetConsignmentStockByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await _repository.GetByIdAsync(request.Id, cancellationToken);

        if (entity == null)
        {
            return Result<ConsignmentStockDto>.Failure(new Error("ConsignmentStock.NotFound", $"Konsinye stok kaydı bulunamadı (ID: {request.Id})", ErrorType.NotFound));
        }

        var dto = new ConsignmentStockDto
        {
            Id = entity.Id,
            ConsignmentNumber = entity.ConsignmentNumber,
            SupplierId = entity.SupplierId,
            SupplierName = entity.Supplier?.Name,
            AgreementDate = entity.AgreementDate,
            AgreementEndDate = entity.AgreementEndDate,
            Status = entity.Status.ToString(),
            ProductId = entity.ProductId,
            ProductName = entity.Product?.Name,
            WarehouseId = entity.WarehouseId,
            WarehouseName = entity.Warehouse?.Name,
            LocationId = entity.LocationId,
            LocationName = entity.Location?.Name,
            LotNumber = entity.LotNumber,
            InitialQuantity = entity.InitialQuantity,
            CurrentQuantity = entity.CurrentQuantity,
            SoldQuantity = entity.SoldQuantity,
            ReturnedQuantity = entity.ReturnedQuantity,
            DamagedQuantity = entity.DamagedQuantity,
            Unit = entity.Unit,
            UnitCost = entity.UnitCost,
            SellingPrice = entity.SellingPrice,
            Currency = entity.Currency,
            CommissionRate = entity.CommissionRate,
            LastReconciliationDate = entity.LastReconciliationDate,
            ReconciliationPeriodDays = entity.ReconciliationPeriodDays,
            NextReconciliationDate = entity.NextReconciliationDate,
            TotalSalesAmount = entity.TotalSalesAmount,
            PaidAmount = entity.PaidAmount,
            OutstandingAmount = entity.OutstandingAmount,
            MaxConsignmentDays = entity.MaxConsignmentDays,
            ExpiryDate = entity.ExpiryDate,
            ReceivedDate = entity.ReceivedDate,
            AgreementNotes = entity.AgreementNotes,
            InternalNotes = entity.InternalNotes,
            Movements = entity.Movements?.Select(m => new ConsignmentStockMovementDto
            {
                Id = m.Id,
                MovementType = m.MovementType.ToString(),
                Quantity = m.Quantity,
                UnitPrice = m.UnitPrice,
                TotalAmount = m.TotalAmount,
                MovementDate = m.MovementDate,
                ReferenceNumber = m.ReferenceNumber,
                Notes = m.Notes
            }).ToList(),
            CreatedAt = entity.CreatedDate,
            UpdatedAt = entity.UpdatedDate
        };

        return Result<ConsignmentStockDto>.Success(dto);
    }
}
