using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.QualityControls.Commands;

/// <summary>
/// Command to complete a quality control inspection
/// </summary>
public class CompleteQualityControlCommand : IRequest<Result<QualityControlDto>>
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public string Result { get; set; } = null!;
    public decimal AcceptedQuantity { get; set; }
    public decimal RejectedQuantity { get; set; }
    public decimal? QualityScore { get; set; }
    public string? QualityGrade { get; set; }
    public string? RejectionReason { get; set; }
    public string? RejectionCategory { get; set; }
}

/// <summary>
/// Validator for CompleteQualityControlCommand
/// </summary>
public class CompleteQualityControlCommandValidator : AbstractValidator<CompleteQualityControlCommand>
{
    public CompleteQualityControlCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty();
        RuleFor(x => x.Id).GreaterThan(0);
        RuleFor(x => x.Result).NotEmpty();
        RuleFor(x => x.AcceptedQuantity).GreaterThanOrEqualTo(0);
        RuleFor(x => x.RejectedQuantity).GreaterThanOrEqualTo(0);
        RuleFor(x => x.QualityScore).InclusiveBetween(0, 100).When(x => x.QualityScore.HasValue);
    }
}

/// <summary>
/// Handler for CompleteQualityControlCommand
/// </summary>
public class CompleteQualityControlCommandHandler : IRequestHandler<CompleteQualityControlCommand, Result<QualityControlDto>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public CompleteQualityControlCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<QualityControlDto>> Handle(CompleteQualityControlCommand request, CancellationToken cancellationToken)
    {
        var entity = await _unitOfWork.QualityControls.GetByIdAsync(request.Id, cancellationToken);
        if (entity == null)
        {
            return Result<QualityControlDto>.Failure(new Error("QualityControl.NotFound", $"Quality control with ID {request.Id} not found", ErrorType.NotFound));
        }

        try
        {
            var result = Enum.Parse<QualityControlResult>(request.Result);
            entity.CompleteInspection(result, request.AcceptedQuantity, request.RejectedQuantity, request.QualityScore, request.QualityGrade);

            if (!string.IsNullOrEmpty(request.RejectionReason) && !string.IsNullOrEmpty(request.RejectionCategory))
            {
                var rejectionCategory = Enum.Parse<RejectionCategory>(request.RejectionCategory);
                entity.SetRejection(request.RejectionReason, rejectionCategory);
            }
        }
        catch (InvalidOperationException ex)
        {
            return Result<QualityControlDto>.Failure(new Error("QualityControl.InvalidOperation", ex.Message, ErrorType.Validation));
        }

        await _unitOfWork.QualityControls.UpdateAsync(entity, cancellationToken);
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
