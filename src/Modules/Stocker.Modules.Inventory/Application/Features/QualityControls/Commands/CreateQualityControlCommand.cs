using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.QualityControls.Commands;

/// <summary>
/// Command to create a new quality control inspection
/// </summary>
public class CreateQualityControlCommand : IRequest<Result<QualityControlDto>>
{
    public Guid TenantId { get; set; }
    public CreateQualityControlDto Data { get; set; } = null!;
}

/// <summary>
/// Validator for CreateQualityControlCommand
/// </summary>
public class CreateQualityControlCommandValidator : AbstractValidator<CreateQualityControlCommand>
{
    public CreateQualityControlCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty();
        RuleFor(x => x.Data).NotNull();
        RuleFor(x => x.Data.ProductId).GreaterThan(0);
        RuleFor(x => x.Data.QcType).NotEmpty();
        RuleFor(x => x.Data.InspectedQuantity).GreaterThan(0);
        RuleFor(x => x.Data.Unit).NotEmpty().MaximumLength(20);
        RuleFor(x => x.Data.LotNumber).MaximumLength(50);
        RuleFor(x => x.Data.PurchaseOrderNumber).MaximumLength(50);
        RuleFor(x => x.Data.InspectionLocation).MaximumLength(100);
        RuleFor(x => x.Data.InspectionStandard).MaximumLength(100);
    }
}

/// <summary>
/// Handler for CreateQualityControlCommand
/// </summary>
public class CreateQualityControlCommandHandler : IRequestHandler<CreateQualityControlCommand, Result<QualityControlDto>>
{
    private readonly IQualityControlRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateQualityControlCommandHandler(IQualityControlRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<QualityControlDto>> Handle(CreateQualityControlCommand request, CancellationToken cancellationToken)
    {
        var data = request.Data;

        // Generate QC number
        var qcNumber = $"QC-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..6].ToUpper()}";

        // Check if QC number already exists
        var existingQc = await _repository.GetByQcNumberAsync(qcNumber, cancellationToken);
        if (existingQc != null)
        {
            return Result<QualityControlDto>.Failure(new Error("QualityControl.DuplicateNumber", $"Quality control with number '{qcNumber}' already exists", ErrorType.Conflict));
        }

        var qcType = Enum.Parse<QualityControlType>(data.QcType);
        var entity = new QualityControl(qcNumber, data.ProductId, qcType, data.InspectedQuantity, data.Unit);

        entity.SetLotNumber(data.LotNumber);
        entity.SetWarehouse(data.WarehouseId);
        entity.SetSampleQuantity(data.SampleQuantity);
        entity.SetInspectionLocation(data.InspectionLocation);
        entity.SetInspectionStandard(data.InspectionStandard);
        entity.SetInspectionNotes(data.InspectionNotes);

        await _repository.AddAsync(entity, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = new QualityControlDto
        {
            Id = entity.Id,
            QcNumber = entity.QcNumber,
            QcType = entity.QcType.ToString(),
            InspectionDate = entity.InspectionDate,
            Status = entity.Status.ToString(),
            ProductId = entity.ProductId,
            LotNumber = entity.LotNumber,
            SupplierId = entity.SupplierId,
            PurchaseOrderNumber = entity.PurchaseOrderNumber,
            WarehouseId = entity.WarehouseId,
            InspectedQuantity = entity.InspectedQuantity,
            AcceptedQuantity = entity.AcceptedQuantity,
            RejectedQuantity = entity.RejectedQuantity,
            SampleQuantity = entity.SampleQuantity,
            Unit = entity.Unit,
            Result = entity.Result.ToString(),
            QualityScore = entity.QualityScore,
            QualityGrade = entity.QualityGrade,
            RecommendedAction = entity.RecommendedAction.ToString(),
            InspectionLocation = entity.InspectionLocation,
            InspectionStandard = entity.InspectionStandard,
            InspectionNotes = entity.InspectionNotes,
            CreatedAt = entity.CreatedDate
        };

        return Result<QualityControlDto>.Success(dto);
    }
}
