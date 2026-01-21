using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.QualityControls.Commands;

/// <summary>
/// Command to approve a quality control inspection
/// </summary>
public class ApproveQualityControlCommand : IRequest<Result<QualityControlDto>>
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public string? Notes { get; set; }
}

public class ApproveQualityControlCommandHandler : IRequestHandler<ApproveQualityControlCommand, Result<QualityControlDto>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public ApproveQualityControlCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<QualityControlDto>> Handle(ApproveQualityControlCommand request, CancellationToken cancellationToken)
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

        // Complete with passed result
        if (qc.Status == QualityControlStatus.InProgress)
        {
            qc.CompleteInspection(
                QualityControlResult.Passed,
                qc.InspectedQuantity,
                0,
                100,
                "A");

            // Apply accept action
            qc.ApplyAction(QualityAction.Accept, request.Notes ?? "Kalite kontrol onaylandı");
        }

        if (!string.IsNullOrEmpty(request.Notes))
        {
            qc.SetInspectionNotes(request.Notes);
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
