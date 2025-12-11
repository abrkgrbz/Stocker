using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.QualityControls.Queries;

/// <summary>
/// Query to get all quality control records
/// </summary>
public class GetQualityControlsQuery : IRequest<Result<List<QualityControlDto>>>
{
    public Guid TenantId { get; set; }
    public int? ProductId { get; set; }
    public int? SupplierId { get; set; }
    public string? Status { get; set; }
    public string? QcType { get; set; }
}

/// <summary>
/// Handler for GetQualityControlsQuery
/// </summary>
public class GetQualityControlsQueryHandler : IRequestHandler<GetQualityControlsQuery, Result<List<QualityControlDto>>>
{
    private readonly IQualityControlRepository _repository;

    public GetQualityControlsQueryHandler(IQualityControlRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<List<QualityControlDto>>> Handle(GetQualityControlsQuery request, CancellationToken cancellationToken)
    {
        IReadOnlyList<QualityControl> entities;

        if (request.ProductId.HasValue)
        {
            entities = await _repository.GetByProductAsync(request.ProductId.Value, cancellationToken);
        }
        else if (request.SupplierId.HasValue)
        {
            entities = await _repository.GetBySupplierAsync(request.SupplierId.Value, cancellationToken);
        }
        else if (!string.IsNullOrEmpty(request.Status))
        {
            var status = Enum.Parse<QualityControlStatus>(request.Status);
            entities = await _repository.GetByStatusAsync(status, cancellationToken);
        }
        else
        {
            entities = await _repository.GetAllAsync(cancellationToken);
        }

        var dtos = entities.Select(e => new QualityControlDto
        {
            Id = e.Id,
            QcNumber = e.QcNumber,
            QcType = e.QcType.ToString(),
            InspectionDate = e.InspectionDate,
            Status = e.Status.ToString(),
            ProductId = e.ProductId,
            ProductName = e.Product?.Name,
            LotNumber = e.LotNumber,
            SupplierId = e.SupplierId,
            SupplierName = e.Supplier?.Name,
            PurchaseOrderNumber = e.PurchaseOrderNumber,
            WarehouseId = e.WarehouseId,
            WarehouseName = e.Warehouse?.Name,
            InspectedQuantity = e.InspectedQuantity,
            AcceptedQuantity = e.AcceptedQuantity,
            RejectedQuantity = e.RejectedQuantity,
            SampleQuantity = e.SampleQuantity,
            Unit = e.Unit,
            Result = e.Result.ToString(),
            QualityScore = e.QualityScore,
            QualityGrade = e.QualityGrade,
            RejectionReason = e.RejectionReason,
            RejectionCategory = e.RejectionCategory?.ToString(),
            InspectorName = e.InspectorName,
            InspectorUserId = e.InspectorUserId,
            InspectionDurationMinutes = e.InspectionDurationMinutes,
            InspectionLocation = e.InspectionLocation,
            InspectionStandard = e.InspectionStandard,
            RecommendedAction = e.RecommendedAction.ToString(),
            AppliedAction = e.AppliedAction?.ToString(),
            ActionDescription = e.ActionDescription,
            ActionDate = e.ActionDate,
            InspectionNotes = e.InspectionNotes,
            CreatedAt = e.CreatedDate,
            UpdatedAt = e.UpdatedDate
        }).ToList();

        return Result<List<QualityControlDto>>.Success(dtos);
    }
}
