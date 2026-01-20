using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Application.Features.LotBatches.Queries;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.LotBatches.Commands;

public class UpdateLotBatchDto
{
    public int? SupplierId { get; set; }
    public string? SupplierLotNumber { get; set; }
    public DateTime? ManufacturedDate { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public string? CertificateNumber { get; set; }
    public string? Notes { get; set; }
}

public class UpdateLotBatchCommand : IRequest<Result<LotBatchDto>>
{
    public Guid TenantId { get; set; }
    public int LotBatchId { get; set; }
    public UpdateLotBatchDto Data { get; set; } = null!;
}

public class UpdateLotBatchCommandValidator : AbstractValidator<UpdateLotBatchCommand>
{
    public UpdateLotBatchCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty();
        RuleFor(x => x.LotBatchId).GreaterThan(0);
        RuleFor(x => x.Data).NotNull();
    }
}

public class UpdateLotBatchCommandHandler : IRequestHandler<UpdateLotBatchCommand, Result<LotBatchDto>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public UpdateLotBatchCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<LotBatchDto>> Handle(UpdateLotBatchCommand request, CancellationToken cancellationToken)
    {
        var lotBatch = await _unitOfWork.LotBatches.GetByIdAsync(request.LotBatchId, cancellationToken);

        if (lotBatch == null || lotBatch.TenantId != request.TenantId)
        {
            return Result<LotBatchDto>.Failure(new Error("LotBatch.NotFound", $"Lot batch with ID {request.LotBatchId} not found", ErrorType.NotFound));
        }

        var data = request.Data;

        lotBatch.SetSupplierInfo(data.SupplierId, data.SupplierLotNumber);
        lotBatch.SetDates(data.ManufacturedDate, data.ExpiryDate);
        lotBatch.SetCertificate(data.CertificateNumber);
        lotBatch.SetNotes(data.Notes);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var product = await _unitOfWork.Products.GetByIdAsync(lotBatch.ProductId, cancellationToken);

        return Result<LotBatchDto>.Success(new LotBatchDto
        {
            Id = lotBatch.Id,
            LotNumber = lotBatch.LotNumber,
            ProductId = lotBatch.ProductId,
            ProductCode = product?.Code ?? string.Empty,
            ProductName = product?.Name ?? string.Empty,
            Status = lotBatch.Status,
            ManufacturedDate = lotBatch.ManufacturedDate,
            ExpiryDate = lotBatch.ExpiryDate,
            InitialQuantity = lotBatch.InitialQuantity,
            CurrentQuantity = lotBatch.CurrentQuantity,
            ReservedQuantity = lotBatch.ReservedQuantity,
            AvailableQuantity = lotBatch.AvailableQuantity,
            SupplierId = lotBatch.SupplierId,
            SupplierLotNumber = lotBatch.SupplierLotNumber,
            CertificateNumber = lotBatch.CertificateNumber,
            Notes = lotBatch.Notes,
            IsQuarantined = lotBatch.IsQuarantined,
            IsExpired = lotBatch.IsExpired(),
            DaysUntilExpiry = lotBatch.GetDaysUntilExpiry(),
            CreatedAt = lotBatch.CreatedDate
        });
    }
}
