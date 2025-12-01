using MediatR;
using Stocker.Modules.Inventory.Domain.Enums;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.SerialNumbers.Queries;

/// <summary>
/// DTO for serial number listing
/// </summary>
public class SerialNumberListDto
{
    public int Id { get; set; }
    public string Serial { get; set; } = string.Empty;
    public int ProductId { get; set; }
    public string ProductCode { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public string? WarehouseName { get; set; }
    public SerialNumberStatus Status { get; set; }
    public bool IsUnderWarranty { get; set; }
    public int? RemainingWarrantyDays { get; set; }
}

/// <summary>
/// Query to get serial numbers
/// </summary>
public class GetSerialNumbersQuery : IRequest<Result<List<SerialNumberListDto>>>
{
    public int TenantId { get; set; }
    public int? ProductId { get; set; }
    public int? WarehouseId { get; set; }
    public SerialNumberStatus? Status { get; set; }
    public bool UnderWarrantyOnly { get; set; }
}

/// <summary>
/// Handler for GetSerialNumbersQuery
/// </summary>
public class GetSerialNumbersQueryHandler : IRequestHandler<GetSerialNumbersQuery, Result<List<SerialNumberListDto>>>
{
    private readonly ISerialNumberRepository _serialNumberRepository;

    public GetSerialNumbersQueryHandler(ISerialNumberRepository serialNumberRepository)
    {
        _serialNumberRepository = serialNumberRepository;
    }

    public async Task<Result<List<SerialNumberListDto>>> Handle(GetSerialNumbersQuery request, CancellationToken cancellationToken)
    {
        IReadOnlyList<Domain.Entities.SerialNumber> serialNumbers;

        if (request.UnderWarrantyOnly)
        {
            serialNumbers = await _serialNumberRepository.GetUnderWarrantyAsync(cancellationToken);
        }
        else if (request.Status.HasValue)
        {
            serialNumbers = await _serialNumberRepository.GetByStatusAsync(request.Status.Value, cancellationToken);
        }
        else if (request.ProductId.HasValue)
        {
            serialNumbers = await _serialNumberRepository.GetByProductAsync(request.ProductId.Value, cancellationToken);
        }
        else if (request.WarehouseId.HasValue)
        {
            serialNumbers = await _serialNumberRepository.GetByWarehouseAsync(request.WarehouseId.Value, cancellationToken);
        }
        else
        {
            serialNumbers = await _serialNumberRepository.GetAllAsync(cancellationToken);
        }

        var dtos = serialNumbers.Select(s => new SerialNumberListDto
        {
            Id = s.Id,
            Serial = s.Serial,
            ProductId = s.ProductId,
            ProductCode = s.Product?.Code ?? string.Empty,
            ProductName = s.Product?.Name ?? string.Empty,
            WarehouseName = s.Warehouse?.Name,
            Status = s.Status,
            IsUnderWarranty = s.IsUnderWarranty(),
            RemainingWarrantyDays = s.GetRemainingWarrantyDays()
        }).ToList();

        return Result<List<SerialNumberListDto>>.Success(dtos);
    }
}
