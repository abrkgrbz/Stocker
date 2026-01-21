using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.QualityControls.Commands;

/// <summary>
/// Command to reject a quality control inspection
/// </summary>
public class RejectQualityControlCommand : IRequest<Result<QualityControlDto>>
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public string? Reason { get; set; }
    public RejectionCategory? Category { get; set; }
}

public class RejectQualityControlCommandHandler : IRequestHandler<RejectQualityControlCommand, Result<QualityControlDto>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public RejectQualityControlCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<QualityControlDto>> Handle(RejectQualityControlCommand request, CancellationToken cancellationToken)
    {
        var qc = await _unitOfWork.QualityControls.GetByIdAsync(request.Id, cancellationToken);

        if (qc == null || qc.TenantId != request.TenantId)
        {
            return Result<QualityControlDto>.Failure(
                new Error("QualityControl.NotFound", "Kalite kontrol kaydı bulunamadı", ErrorType.NotFound));
        }

        // Start inspection if pending
        if (qc.Status == QualityControlStatus.Pending)
        {
            qc.StartInspection("System", null);
        }

        // Complete with failed result
        if (qc.Status == QualityControlStatus.InProgress)
        {
            qc.CompleteInspection(
                QualityControlResult.Failed,
                0,
                qc.InspectedQuantity,
                0,
                "F");

            // Set rejection details
            var reason = request.Reason ?? "Kalite kontrol reddedildi";
            var category = request.Category ?? RejectionCategory.Other;
            qc.SetRejection(reason, category);

            // Apply reject action
            qc.ApplyAction(QualityAction.Reject, reason);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = MapToDto(qc);
        return Result<QualityControlDto>.Success(dto);
    }

    private static QualityControlDto MapToDto(QualityControl qc)
    {
        return new QualityControlDto
        {
            Id = qc.Id,
            QcNumber = qc.QcNumber,
            QcType = qc.QcType.ToString(),
            InspectionDate = qc.InspectionDate,
            Status = qc.Status.ToString(),
            ProductId = qc.ProductId,
            LotNumber = qc.LotNumber,
            SupplierId = qc.SupplierId,
            PurchaseOrderNumber = qc.PurchaseOrderNumber,
            WarehouseId = qc.WarehouseId,
            InspectedQuantity = qc.InspectedQuantity,
            AcceptedQuantity = qc.AcceptedQuantity,
            RejectedQuantity = qc.RejectedQuantity,
            Unit = qc.Unit,
            Result = qc.Result.ToString(),
            QualityScore = qc.QualityScore,
            QualityGrade = qc.QualityGrade,
            RejectionReason = qc.RejectionReason,
            InspectorName = qc.InspectorName,
            InspectionNotes = qc.InspectionNotes
        };
    }
}
