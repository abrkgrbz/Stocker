using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.BarcodeDefinitions.Queries;

/// <summary>
/// Query to get all barcode definitions
/// </summary>
public class GetBarcodeDefinitionsQuery : IRequest<Result<List<BarcodeDefinitionDto>>>
{
    public Guid TenantId { get; set; }
    public int? ProductId { get; set; }
    public bool IncludeInactive { get; set; }
}

/// <summary>
/// Handler for GetBarcodeDefinitionsQuery
/// </summary>
public class GetBarcodeDefinitionsQueryHandler : IRequestHandler<GetBarcodeDefinitionsQuery, Result<List<BarcodeDefinitionDto>>>
{
    private readonly IBarcodeDefinitionRepository _repository;

    public GetBarcodeDefinitionsQueryHandler(IBarcodeDefinitionRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<List<BarcodeDefinitionDto>>> Handle(GetBarcodeDefinitionsQuery request, CancellationToken cancellationToken)
    {
        var entities = request.ProductId.HasValue
            ? await _repository.GetByProductAsync(request.ProductId.Value, cancellationToken)
            : request.IncludeInactive
                ? await _repository.GetAllAsync(cancellationToken)
                : await _repository.GetActiveAsync(cancellationToken);

        var dtos = entities.Select(e => new BarcodeDefinitionDto
        {
            Id = e.Id,
            ProductId = e.ProductId,
            ProductName = e.Product?.Name,
            ProductVariantId = e.ProductVariantId,
            Barcode = e.Barcode,
            BarcodeType = e.BarcodeType.ToString(),
            IsPrimary = e.IsPrimary,
            IsActive = e.IsActive,
            UnitId = e.UnitId,
            UnitName = e.Unit?.Name,
            QuantityPerUnit = e.QuantityPerUnit,
            PackagingTypeId = e.PackagingTypeId,
            PackagingTypeName = e.PackagingType?.Name,
            IsManufacturerBarcode = e.IsManufacturerBarcode,
            ManufacturerCode = e.ManufacturerCode,
            Gtin = e.Gtin,
            Description = e.Description,
            ValidFrom = e.ValidFrom,
            ValidUntil = e.ValidUntil,
            CreatedAt = e.CreatedDate,
            UpdatedAt = e.UpdatedDate
        }).ToList();

        return Result<List<BarcodeDefinitionDto>>.Success(dtos);
    }
}
