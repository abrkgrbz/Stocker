using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.QualityControls.Commands;

/// <summary>
/// Command to update an existing quality control inspection
/// </summary>
public class UpdateQualityControlCommand : IRequest<Result<QualityControlDto>>
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public UpdateQualityControlDto Data { get; set; } = null!;
}

/// <summary>
/// Validator for UpdateQualityControlCommand
/// </summary>
public class UpdateQualityControlCommandValidator : AbstractValidator<UpdateQualityControlCommand>
{
    public UpdateQualityControlCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty();
        RuleFor(x => x.Id).GreaterThan(0);
        RuleFor(x => x.Data).NotNull();
        RuleFor(x => x.Data.LotNumber).MaximumLength(50);
        RuleFor(x => x.Data.InspectionLocation).MaximumLength(100);
        RuleFor(x => x.Data.InspectionStandard).MaximumLength(100);
    }
}

/// <summary>
/// Handler for UpdateQualityControlCommand
/// </summary>
public class UpdateQualityControlCommandHandler : IRequestHandler<UpdateQualityControlCommand, Result<QualityControlDto>>
{
    private readonly IQualityControlRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateQualityControlCommandHandler(IQualityControlRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<QualityControlDto>> Handle(UpdateQualityControlCommand request, CancellationToken cancellationToken)
    {
        var entity = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (entity == null)
        {
            return Result<QualityControlDto>.Failure(new Error("QualityControl.NotFound", $"Quality control with ID {request.Id} not found", ErrorType.NotFound));
        }

        var data = request.Data;

        entity.SetLotNumber(data.LotNumber);
        entity.SetSampleQuantity(data.SampleQuantity);
        entity.SetInspectionLocation(data.InspectionLocation);
        entity.SetInspectionStandard(data.InspectionStandard);
        entity.SetInspectionNotes(data.InspectionNotes);
        entity.SetInternalNotes(data.InternalNotes);

        await _repository.UpdateAsync(entity, cancellationToken);
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
            RejectionReason = entity.RejectionReason,
            RejectionCategory = entity.RejectionCategory?.ToString(),
            InspectorName = entity.InspectorName,
            InspectorUserId = entity.InspectorUserId,
            InspectionDurationMinutes = entity.InspectionDurationMinutes,
            InspectionLocation = entity.InspectionLocation,
            InspectionStandard = entity.InspectionStandard,
            RecommendedAction = entity.RecommendedAction.ToString(),
            AppliedAction = entity.AppliedAction?.ToString(),
            ActionDescription = entity.ActionDescription,
            ActionDate = entity.ActionDate,
            InspectionNotes = entity.InspectionNotes,
            InternalNotes = entity.InternalNotes,
            CreatedAt = entity.CreatedDate,
            UpdatedAt = entity.UpdatedDate
        };

        return Result<QualityControlDto>.Success(dto);
    }
}
