using MediatR;
using Stocker.Modules.Inventory.Domain.Enums;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.LotBatches.Queries;

/// <summary>
/// DTO for lot batch details
/// </summary>
public class LotBatchDto
{
    public int Id { get; set; }
    public string LotNumber { get; set; } = string.Empty;
    public int ProductId { get; set; }
    public string ProductCode { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public int? SupplierId { get; set; }
    public string? SupplierName { get; set; }
    public LotBatchStatus Status { get; set; }
    public DateTime? ManufacturedDate { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public DateTime? ReceivedDate { get; set; }
    public decimal InitialQuantity { get; set; }
    public decimal CurrentQuantity { get; set; }
    public decimal ReservedQuantity { get; set; }
    public decimal AvailableQuantity { get; set; }
    public string? SupplierLotNumber { get; set; }
    public string? CertificateNumber { get; set; }
    public string? Notes { get; set; }
    public bool IsQuarantined { get; set; }
    public DateTime? QuarantinedDate { get; set; }
    public string? QuarantineReason { get; set; }
    public DateTime? InspectedDate { get; set; }
    public string? InspectionNotes { get; set; }
    public bool IsExpired { get; set; }
    public int? DaysUntilExpiry { get; set; }
    public int? RemainingShelfLifePercentage { get; set; }
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// Query to get a lot batch by ID
/// </summary>
public class GetLotBatchByIdQuery : IRequest<Result<LotBatchDto>>
{
    public int TenantId { get; set; }
    public int LotBatchId { get; set; }
}

/// <summary>
/// Handler for GetLotBatchByIdQuery
/// </summary>
public class GetLotBatchByIdQueryHandler : IRequestHandler<GetLotBatchByIdQuery, Result<LotBatchDto>>
{
    private readonly ILotBatchRepository _lotBatchRepository;

    public GetLotBatchByIdQueryHandler(ILotBatchRepository lotBatchRepository)
    {
        _lotBatchRepository = lotBatchRepository;
    }

    public async Task<Result<LotBatchDto>> Handle(GetLotBatchByIdQuery request, CancellationToken cancellationToken)
    {
        var lotBatch = await _lotBatchRepository.GetByIdAsync(request.LotBatchId, cancellationToken);

        if (lotBatch == null)
        {
            return Result<LotBatchDto>.Failure(new Error("LotBatch.NotFound", $"Lot batch with ID {request.LotBatchId} not found", ErrorType.NotFound));
        }

        var dto = new LotBatchDto
        {
            Id = lotBatch.Id,
            LotNumber = lotBatch.LotNumber,
            ProductId = lotBatch.ProductId,
            ProductCode = lotBatch.Product?.Code ?? string.Empty,
            ProductName = lotBatch.Product?.Name ?? string.Empty,
            SupplierId = lotBatch.SupplierId,
            SupplierName = lotBatch.Supplier?.Name,
            Status = lotBatch.Status,
            ManufacturedDate = lotBatch.ManufacturedDate,
            ExpiryDate = lotBatch.ExpiryDate,
            ReceivedDate = lotBatch.ReceivedDate,
            InitialQuantity = lotBatch.InitialQuantity,
            CurrentQuantity = lotBatch.CurrentQuantity,
            ReservedQuantity = lotBatch.ReservedQuantity,
            AvailableQuantity = lotBatch.AvailableQuantity,
            SupplierLotNumber = lotBatch.SupplierLotNumber,
            CertificateNumber = lotBatch.CertificateNumber,
            Notes = lotBatch.Notes,
            IsQuarantined = lotBatch.IsQuarantined,
            QuarantinedDate = lotBatch.QuarantinedDate,
            QuarantineReason = lotBatch.QuarantineReason,
            InspectedDate = lotBatch.InspectedDate,
            InspectionNotes = lotBatch.InspectionNotes,
            IsExpired = lotBatch.IsExpired(),
            DaysUntilExpiry = lotBatch.GetDaysUntilExpiry(),
            RemainingShelfLifePercentage = lotBatch.GetRemainingShelfLifePercentage(),
            CreatedAt = lotBatch.CreatedDate
        };

        return Result<LotBatchDto>.Success(dto);
    }
}
