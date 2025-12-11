using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.ConsignmentStocks.Queries;

/// <summary>
/// Query to get all consignment stocks
/// </summary>
public class GetConsignmentStocksQuery : IRequest<Result<List<ConsignmentStockDto>>>
{
    public Guid TenantId { get; set; }
    public int? SupplierId { get; set; }
    public int? ProductId { get; set; }
    public int? WarehouseId { get; set; }
    public string? Status { get; set; }
}

/// <summary>
/// Handler for GetConsignmentStocksQuery
/// </summary>
public class GetConsignmentStocksQueryHandler : IRequestHandler<GetConsignmentStocksQuery, Result<List<ConsignmentStockDto>>>
{
    private readonly IConsignmentStockRepository _repository;

    public GetConsignmentStocksQueryHandler(IConsignmentStockRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<List<ConsignmentStockDto>>> Handle(GetConsignmentStocksQuery request, CancellationToken cancellationToken)
    {
        IReadOnlyList<ConsignmentStock> entities;

        if (request.SupplierId.HasValue)
        {
            entities = await _repository.GetBySupplierAsync(request.SupplierId.Value, cancellationToken);
        }
        else if (request.ProductId.HasValue)
        {
            entities = await _repository.GetByProductAsync(request.ProductId.Value, cancellationToken);
        }
        else if (request.WarehouseId.HasValue)
        {
            entities = await _repository.GetByWarehouseAsync(request.WarehouseId.Value, cancellationToken);
        }
        else if (!string.IsNullOrEmpty(request.Status))
        {
            var status = Enum.Parse<ConsignmentStatus>(request.Status);
            entities = await _repository.GetByStatusAsync(status, cancellationToken);
        }
        else
        {
            entities = await _repository.GetActiveAsync(cancellationToken);
        }

        var dtos = entities.Select(e => new ConsignmentStockDto
        {
            Id = e.Id,
            ConsignmentNumber = e.ConsignmentNumber,
            SupplierId = e.SupplierId,
            SupplierName = e.Supplier?.Name,
            AgreementDate = e.AgreementDate,
            AgreementEndDate = e.AgreementEndDate,
            Status = e.Status.ToString(),
            ProductId = e.ProductId,
            ProductName = e.Product?.Name,
            WarehouseId = e.WarehouseId,
            WarehouseName = e.Warehouse?.Name,
            LocationId = e.LocationId,
            LocationName = e.Location?.Name,
            LotNumber = e.LotNumber,
            InitialQuantity = e.InitialQuantity,
            CurrentQuantity = e.CurrentQuantity,
            SoldQuantity = e.SoldQuantity,
            ReturnedQuantity = e.ReturnedQuantity,
            DamagedQuantity = e.DamagedQuantity,
            Unit = e.Unit,
            UnitCost = e.UnitCost,
            SellingPrice = e.SellingPrice,
            Currency = e.Currency,
            CommissionRate = e.CommissionRate,
            LastReconciliationDate = e.LastReconciliationDate,
            ReconciliationPeriodDays = e.ReconciliationPeriodDays,
            NextReconciliationDate = e.NextReconciliationDate,
            TotalSalesAmount = e.TotalSalesAmount,
            PaidAmount = e.PaidAmount,
            OutstandingAmount = e.OutstandingAmount,
            MaxConsignmentDays = e.MaxConsignmentDays,
            ExpiryDate = e.ExpiryDate,
            ReceivedDate = e.ReceivedDate,
            AgreementNotes = e.AgreementNotes,
            CreatedAt = e.CreatedDate,
            UpdatedAt = e.UpdatedDate
        }).ToList();

        return Result<List<ConsignmentStockDto>>.Success(dtos);
    }
}
