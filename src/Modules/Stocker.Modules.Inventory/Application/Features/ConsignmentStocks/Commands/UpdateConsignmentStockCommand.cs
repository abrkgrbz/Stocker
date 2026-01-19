using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.ConsignmentStocks.Commands;

/// <summary>
/// Command to update an existing consignment stock
/// </summary>
public class UpdateConsignmentStockCommand : IRequest<Result<ConsignmentStockDto>>
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public UpdateConsignmentStockDto Data { get; set; } = null!;
}

/// <summary>
/// Validator for UpdateConsignmentStockCommand
/// </summary>
public class UpdateConsignmentStockCommandValidator : AbstractValidator<UpdateConsignmentStockCommand>
{
    public UpdateConsignmentStockCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty().WithMessage("Kiracı kimliği gereklidir");
        RuleFor(x => x.Id).GreaterThan(0).WithMessage("Geçerli bir konsinye stok ID'si gereklidir");
        RuleFor(x => x.Data).NotNull().WithMessage("Konsinye stok verileri gereklidir");
    }
}

/// <summary>
/// Handler for UpdateConsignmentStockCommand
/// </summary>
public class UpdateConsignmentStockCommandHandler : IRequestHandler<UpdateConsignmentStockCommand, Result<ConsignmentStockDto>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public UpdateConsignmentStockCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<ConsignmentStockDto>> Handle(UpdateConsignmentStockCommand request, CancellationToken cancellationToken)
    {
        var entity = await _unitOfWork.ConsignmentStocks.GetByIdAsync(request.Id, cancellationToken);
        if (entity == null)
        {
            return Result<ConsignmentStockDto>.Failure(new Error("ConsignmentStock.NotFound", $"Konsinye stok kaydı bulunamadı (ID: {request.Id})", ErrorType.NotFound));
        }

        var data = request.Data;

        entity.SetLocation(data.LocationId);
        entity.SetSellingPrice(data.SellingPrice);
        entity.SetCommissionRate(data.CommissionRate);
        entity.SetMaxConsignmentDays(data.MaxConsignmentDays);
        if (data.ReconciliationPeriodDays.HasValue)
            entity.SetReconciliationPeriod(data.ReconciliationPeriodDays.Value);
        entity.SetAgreementEndDate(data.AgreementEndDate);
        entity.SetAgreementNotes(data.AgreementNotes);
        entity.SetInternalNotes(data.InternalNotes);

        await _unitOfWork.ConsignmentStocks.UpdateAsync(entity, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = new ConsignmentStockDto
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
            InternalNotes = entity.InternalNotes,
            CreatedAt = entity.CreatedDate,
            UpdatedAt = entity.UpdatedDate
        };

        return Result<ConsignmentStockDto>.Success(dto);
    }
}
