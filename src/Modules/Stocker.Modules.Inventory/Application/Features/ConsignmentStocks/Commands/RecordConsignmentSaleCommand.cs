using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.ConsignmentStocks.Commands;

/// <summary>
/// Command to record a sale from consignment stock
/// </summary>
public class RecordConsignmentSaleCommand : IRequest<Result<ConsignmentStockDto>>
{
    public Guid TenantId { get; set; }
    public int ConsignmentStockId { get; set; }
    public RecordConsignmentSaleDto Data { get; set; } = null!;
}

/// <summary>
/// Validator for RecordConsignmentSaleCommand
/// </summary>
public class RecordConsignmentSaleCommandValidator : AbstractValidator<RecordConsignmentSaleCommand>
{
    public RecordConsignmentSaleCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty().WithMessage("Kiracı kimliği gereklidir");
        RuleFor(x => x.ConsignmentStockId).GreaterThan(0).WithMessage("Geçerli bir konsinye stok seçilmelidir");
        RuleFor(x => x.Data).NotNull().WithMessage("Satış verileri gereklidir");
        RuleFor(x => x.Data.Quantity).GreaterThan(0).WithMessage("Miktar 0'dan büyük olmalıdır");
        RuleFor(x => x.Data.SellingPrice).GreaterThan(0).WithMessage("Satış fiyatı 0'dan büyük olmalıdır");
    }
}

/// <summary>
/// Handler for RecordConsignmentSaleCommand
/// </summary>
public class RecordConsignmentSaleCommandHandler : IRequestHandler<RecordConsignmentSaleCommand, Result<ConsignmentStockDto>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public RecordConsignmentSaleCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<ConsignmentStockDto>> Handle(RecordConsignmentSaleCommand request, CancellationToken cancellationToken)
    {
        var consignment = await _unitOfWork.ConsignmentStocks.GetByIdWithMovementsAsync(request.ConsignmentStockId, cancellationToken);

        if (consignment == null)
        {
            return Result<ConsignmentStockDto>.Failure(
                new Error("ConsignmentStock.NotFound", "Konsinye stok bulunamadı", ErrorType.NotFound));
        }

        if (consignment.TenantId != request.TenantId)
        {
            return Result<ConsignmentStockDto>.Failure(
                new Error("ConsignmentStock.NotFound", "Konsinye stok bulunamadı", ErrorType.NotFound));
        }

        if (consignment.Status != Domain.Entities.ConsignmentStatus.Active)
        {
            return Result<ConsignmentStockDto>.Failure(
                new Error("ConsignmentStock.NotActive", "Sadece aktif konsinye stoklardan satış yapılabilir", ErrorType.Validation));
        }

        if (request.Data.Quantity > consignment.CurrentQuantity)
        {
            return Result<ConsignmentStockDto>.Failure(
                new Error("ConsignmentStock.InsufficientQuantity",
                    $"Yetersiz stok. Mevcut: {consignment.CurrentQuantity}, İstenen: {request.Data.Quantity}",
                    ErrorType.Validation));
        }

        consignment.RecordSale(request.Data.Quantity, request.Data.SellingPrice, request.Data.ReferenceNumber);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = MapToDto(consignment);
        return Result<ConsignmentStockDto>.Success(dto);
    }

    private static ConsignmentStockDto MapToDto(Domain.Entities.ConsignmentStock entity)
    {
        return new ConsignmentStockDto
        {
            Id = entity.Id,
            ConsignmentNumber = entity.ConsignmentNumber,
            SupplierId = entity.SupplierId,
            AgreementDate = entity.AgreementDate,
            AgreementEndDate = entity.AgreementEndDate,
            Status = entity.Status.ToString(),
            ProductId = entity.ProductId,
            WarehouseId = entity.WarehouseId,
            LocationId = entity.LocationId,
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
            CreatedAt = entity.CreatedDate,
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
            }).ToList() ?? new()
        };
    }
}
