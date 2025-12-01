using MediatR;
using Stocker.Modules.Inventory.Domain.Enums;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.LotBatches.Queries;

/// <summary>
/// DTO for lot batch listing
/// </summary>
public class LotBatchListDto
{
    public int Id { get; set; }
    public string LotNumber { get; set; } = string.Empty;
    public int ProductId { get; set; }
    public string ProductCode { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public LotBatchStatus Status { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public decimal CurrentQuantity { get; set; }
    public decimal AvailableQuantity { get; set; }
    public bool IsQuarantined { get; set; }
    public bool IsExpired { get; set; }
    public int? DaysUntilExpiry { get; set; }
}

/// <summary>
/// Query to get lot batches
/// </summary>
public class GetLotBatchesQuery : IRequest<Result<List<LotBatchListDto>>>
{
    public int TenantId { get; set; }
    public int? ProductId { get; set; }
    public LotBatchStatus? Status { get; set; }
    public bool ExpiredOnly { get; set; }
    public int? ExpiringWithinDays { get; set; }
}

/// <summary>
/// Handler for GetLotBatchesQuery
/// </summary>
public class GetLotBatchesQueryHandler : IRequestHandler<GetLotBatchesQuery, Result<List<LotBatchListDto>>>
{
    private readonly ILotBatchRepository _lotBatchRepository;

    public GetLotBatchesQueryHandler(ILotBatchRepository lotBatchRepository)
    {
        _lotBatchRepository = lotBatchRepository;
    }

    public async Task<Result<List<LotBatchListDto>>> Handle(GetLotBatchesQuery request, CancellationToken cancellationToken)
    {
        IReadOnlyList<Domain.Entities.LotBatch> lotBatches;

        if (request.ExpiredOnly)
        {
            lotBatches = await _lotBatchRepository.GetExpiredLotsAsync(cancellationToken);
        }
        else if (request.ExpiringWithinDays.HasValue)
        {
            lotBatches = await _lotBatchRepository.GetExpiringLotsAsync(request.ExpiringWithinDays.Value, cancellationToken);
        }
        else if (request.Status.HasValue)
        {
            lotBatches = await _lotBatchRepository.GetByStatusAsync(request.Status.Value, cancellationToken);
        }
        else if (request.ProductId.HasValue)
        {
            lotBatches = await _lotBatchRepository.GetByProductAsync(request.ProductId.Value, cancellationToken);
        }
        else
        {
            lotBatches = await _lotBatchRepository.GetAllAsync(cancellationToken);
        }

        var dtos = lotBatches.Select(l => new LotBatchListDto
        {
            Id = l.Id,
            LotNumber = l.LotNumber,
            ProductId = l.ProductId,
            ProductCode = l.Product?.Code ?? string.Empty,
            ProductName = l.Product?.Name ?? string.Empty,
            Status = l.Status,
            ExpiryDate = l.ExpiryDate,
            CurrentQuantity = l.CurrentQuantity,
            AvailableQuantity = l.AvailableQuantity,
            IsQuarantined = l.IsQuarantined,
            IsExpired = l.IsExpired(),
            DaysUntilExpiry = l.GetDaysUntilExpiry()
        }).ToList();

        return Result<List<LotBatchListDto>>.Success(dtos);
    }
}
