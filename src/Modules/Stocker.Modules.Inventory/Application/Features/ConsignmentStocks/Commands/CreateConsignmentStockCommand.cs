using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.ConsignmentStocks.Commands;

/// <summary>
/// Command to create a new consignment stock
/// </summary>
public class CreateConsignmentStockCommand : IRequest<Result<ConsignmentStockDto>>
{
    public Guid TenantId { get; set; }
    public CreateConsignmentStockDto Data { get; set; } = null!;
}

/// <summary>
/// Validator for CreateConsignmentStockCommand
/// </summary>
public class CreateConsignmentStockCommandValidator : AbstractValidator<CreateConsignmentStockCommand>
{
    public CreateConsignmentStockCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty().WithMessage("Kiracı kimliği gereklidir");
        RuleFor(x => x.Data).NotNull().WithMessage("Konsinye stok verileri gereklidir");
        RuleFor(x => x.Data.SupplierId).GreaterThan(0).WithMessage("Geçerli bir tedarikçi seçilmelidir");
        RuleFor(x => x.Data.ProductId).GreaterThan(0).WithMessage("Geçerli bir ürün seçilmelidir");
        RuleFor(x => x.Data.WarehouseId).GreaterThan(0).WithMessage("Geçerli bir depo seçilmelidir");
        RuleFor(x => x.Data.InitialQuantity).GreaterThan(0).WithMessage("Başlangıç miktarı 0'dan büyük olmalıdır");
        RuleFor(x => x.Data.Unit).NotEmpty().WithMessage("Birim gereklidir").MaximumLength(20).WithMessage("Birim en fazla 20 karakter olabilir");
        RuleFor(x => x.Data.UnitCost).GreaterThan(0).WithMessage("Birim maliyet 0'dan büyük olmalıdır");
        RuleFor(x => x.Data.Currency).NotEmpty().WithMessage("Para birimi gereklidir").MaximumLength(3).WithMessage("Para birimi en fazla 3 karakter olabilir");
        RuleFor(x => x.Data.LotNumber).MaximumLength(50).WithMessage("Lot numarası en fazla 50 karakter olabilir");
    }
}

/// <summary>
/// Handler for CreateConsignmentStockCommand
/// </summary>
public class CreateConsignmentStockCommandHandler : IRequestHandler<CreateConsignmentStockCommand, Result<ConsignmentStockDto>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public CreateConsignmentStockCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<ConsignmentStockDto>> Handle(CreateConsignmentStockCommand request, CancellationToken cancellationToken)
    {
        var data = request.Data;

        // Generate consignment number
        var consignmentNumber = $"CON-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..6].ToUpper()}";

        // Check if consignment number already exists
        var existingConsignment = await _unitOfWork.ConsignmentStocks.GetByNumberAsync(consignmentNumber, cancellationToken);
        if (existingConsignment != null)
        {
            return Result<ConsignmentStockDto>.Failure(new Error("ConsignmentStock.DuplicateNumber", $"'{consignmentNumber}' numaralı konsinye kaydı zaten mevcut", ErrorType.Conflict));
        }

        var entity = new ConsignmentStock(
            consignmentNumber,
            data.SupplierId,
            data.ProductId,
            data.WarehouseId,
            data.InitialQuantity,
            data.Unit,
            data.UnitCost);

        entity.SetLocation(data.LocationId);
        entity.SetLotNumber(data.LotNumber);
        entity.SetSellingPrice(data.SellingPrice);
        entity.SetCommissionRate(data.CommissionRate);
        entity.SetMaxConsignmentDays(data.MaxConsignmentDays);
        entity.SetReconciliationPeriod(data.ReconciliationPeriodDays);
        entity.SetAgreementEndDate(data.AgreementEndDate);
        entity.SetAgreementNotes(data.AgreementNotes);

        entity.SetTenantId(request.TenantId);
        await _unitOfWork.ConsignmentStocks.AddAsync(entity, cancellationToken);
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
            CreatedAt = entity.CreatedDate
        };

        return Result<ConsignmentStockDto>.Success(dto);
    }
}
