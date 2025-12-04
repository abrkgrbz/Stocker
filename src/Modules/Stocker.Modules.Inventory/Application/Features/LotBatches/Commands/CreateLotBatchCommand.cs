using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Application.Features.LotBatches.Queries;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.LotBatches.Commands;

public class CreateLotBatchDto
{
    public string LotNumber { get; set; } = string.Empty;
    public int ProductId { get; set; }
    public decimal InitialQuantity { get; set; }
    public int? SupplierId { get; set; }
    public string? SupplierLotNumber { get; set; }
    public DateTime? ManufacturedDate { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public string? CertificateNumber { get; set; }
    public string? Notes { get; set; }
}

public class CreateLotBatchCommand : IRequest<Result<LotBatchDto>>
{
    public int TenantId { get; set; }
    public CreateLotBatchDto Data { get; set; } = null!;
}

public class CreateLotBatchCommandValidator : AbstractValidator<CreateLotBatchCommand>
{
    public CreateLotBatchCommandValidator()
    {
        RuleFor(x => x.TenantId).GreaterThan(0);
        RuleFor(x => x.Data).NotNull();
        RuleFor(x => x.Data.LotNumber).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Data.ProductId).GreaterThan(0);
        RuleFor(x => x.Data.InitialQuantity).GreaterThan(0);
    }
}

public class CreateLotBatchCommandHandler : IRequestHandler<CreateLotBatchCommand, Result<LotBatchDto>>
{
    private readonly ILotBatchRepository _lotBatchRepository;
    private readonly IProductRepository _productRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateLotBatchCommandHandler(ILotBatchRepository lotBatchRepository, IProductRepository productRepository, IUnitOfWork unitOfWork)
    {
        _lotBatchRepository = lotBatchRepository;
        _productRepository = productRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<LotBatchDto>> Handle(CreateLotBatchCommand request, CancellationToken cancellationToken)
    {
        var data = request.Data;

        if (await _lotBatchRepository.ExistsAsync(data.LotNumber, cancellationToken))
        {
            return Result<LotBatchDto>.Failure(new Error("LotBatch.DuplicateLotNumber", $"Lot batch with number '{data.LotNumber}' already exists", ErrorType.Conflict));
        }

        var product = await _productRepository.GetByIdAsync(data.ProductId, cancellationToken);
        if (product == null)
        {
            return Result<LotBatchDto>.Failure(new Error("Product.NotFound", $"Product with ID {data.ProductId} not found", ErrorType.NotFound));
        }

        var lotBatch = new LotBatch(data.LotNumber, data.ProductId, data.InitialQuantity, data.ExpiryDate);
        lotBatch.SetSupplierInfo(data.SupplierId, data.SupplierLotNumber);
        lotBatch.SetDates(data.ManufacturedDate, data.ExpiryDate);
        lotBatch.SetCertificate(data.CertificateNumber);
        lotBatch.SetNotes(data.Notes);

        await _lotBatchRepository.AddAsync(lotBatch, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<LotBatchDto>.Success(new LotBatchDto
        {
            Id = lotBatch.Id,
            LotNumber = lotBatch.LotNumber,
            ProductId = lotBatch.ProductId,
            ProductCode = product.Code,
            ProductName = product.Name,
            Status = lotBatch.Status,
            ManufacturedDate = lotBatch.ManufacturedDate,
            ExpiryDate = lotBatch.ExpiryDate,
            InitialQuantity = lotBatch.InitialQuantity,
            CurrentQuantity = lotBatch.CurrentQuantity,
            ReservedQuantity = lotBatch.ReservedQuantity,
            AvailableQuantity = lotBatch.AvailableQuantity,
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
