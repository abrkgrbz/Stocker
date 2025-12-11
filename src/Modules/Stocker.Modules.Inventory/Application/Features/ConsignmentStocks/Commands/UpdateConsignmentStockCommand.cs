using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
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
        RuleFor(x => x.TenantId).NotEmpty();
        RuleFor(x => x.Id).GreaterThan(0);
        RuleFor(x => x.Data).NotNull();
        RuleFor(x => x.Data.LotNumber).MaximumLength(50);
    }
}

/// <summary>
/// Handler for UpdateConsignmentStockCommand
/// </summary>
public class UpdateConsignmentStockCommandHandler : IRequestHandler<UpdateConsignmentStockCommand, Result<ConsignmentStockDto>>
{
    private readonly IConsignmentStockRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateConsignmentStockCommandHandler(IConsignmentStockRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<ConsignmentStockDto>> Handle(UpdateConsignmentStockCommand request, CancellationToken cancellationToken)
    {
        var entity = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (entity == null)
        {
            return Result<ConsignmentStockDto>.Failure(new Error("ConsignmentStock.NotFound", $"Consignment stock with ID {request.Id} not found", ErrorType.NotFound));
        }

        var data = request.Data;

        entity.SetLocation(data.LocationId);
        entity.SetLotNumber(data.LotNumber);
        entity.SetSellingPrice(data.SellingPrice);
        entity.SetCommissionRate(data.CommissionRate);
        entity.SetMaxConsignmentDays(data.MaxConsignmentDays);
        entity.SetReconciliationPeriod(data.ReconciliationPeriodDays);
        entity.SetAgreementEndDate(data.AgreementEndDate);
        entity.SetAgreementNotes(data.AgreementNotes);
        entity.SetInternalNotes(data.InternalNotes);

        await _repository.UpdateAsync(entity, cancellationToken);
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
