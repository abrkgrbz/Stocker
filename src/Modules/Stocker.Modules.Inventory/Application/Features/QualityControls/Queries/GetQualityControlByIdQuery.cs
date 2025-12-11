using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.QualityControls.Queries;

/// <summary>
/// Query to get a quality control record by ID
/// </summary>
public class GetQualityControlByIdQuery : IRequest<Result<QualityControlDto>>
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

/// <summary>
/// Handler for GetQualityControlByIdQuery
/// </summary>
public class GetQualityControlByIdQueryHandler : IRequestHandler<GetQualityControlByIdQuery, Result<QualityControlDto>>
{
    private readonly IQualityControlRepository _repository;

    public GetQualityControlByIdQueryHandler(IQualityControlRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<QualityControlDto>> Handle(GetQualityControlByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await _repository.GetByIdAsync(request.Id, cancellationToken);

        if (entity == null)
        {
            return Result<QualityControlDto>.Failure(new Error("QualityControl.NotFound", $"Quality control with ID {request.Id} not found", ErrorType.NotFound));
        }

        var dto = new QualityControlDto
        {
            Id = entity.Id,
            QcNumber = entity.QcNumber,
            QcType = entity.QcType.ToString(),
            InspectionDate = entity.InspectionDate,
            Status = entity.Status.ToString(),
            ProductId = entity.ProductId,
            ProductName = entity.Product?.Name,
            LotNumber = entity.LotNumber,
            SupplierId = entity.SupplierId,
            SupplierName = entity.Supplier?.Name,
            PurchaseOrderNumber = entity.PurchaseOrderNumber,
            WarehouseId = entity.WarehouseId,
            WarehouseName = entity.Warehouse?.Name,
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
            Items = entity.Items?.Select(i => new QualityControlItemDto
            {
                Id = i.Id,
                CheckName = i.CheckName,
                Specification = i.Specification,
                AcceptanceCriteria = i.AcceptanceCriteria,
                MeasuredValue = i.MeasuredValue,
                IsPassed = i.IsPassed,
                Notes = i.Notes,
                SortOrder = i.SortOrder
            }).ToList(),
            CreatedAt = entity.CreatedDate,
            UpdatedAt = entity.UpdatedDate
        };

        return Result<QualityControlDto>.Success(dto);
    }
}
