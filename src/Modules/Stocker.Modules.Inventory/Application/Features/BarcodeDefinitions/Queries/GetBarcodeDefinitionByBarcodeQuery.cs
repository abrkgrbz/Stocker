using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.BarcodeDefinitions.Queries;

/// <summary>
/// Query to lookup a barcode definition by barcode string
/// </summary>
public class GetBarcodeDefinitionByBarcodeQuery : IRequest<Result<BarcodeDefinitionDto>>
{
    public Guid TenantId { get; set; }
    public string Barcode { get; set; } = string.Empty;
}

/// <summary>
/// Handler for GetBarcodeDefinitionByBarcodeQuery
/// </summary>
public class GetBarcodeDefinitionByBarcodeQueryHandler : IRequestHandler<GetBarcodeDefinitionByBarcodeQuery, Result<BarcodeDefinitionDto>>
{
    private readonly IBarcodeDefinitionRepository _repository;

    public GetBarcodeDefinitionByBarcodeQueryHandler(IBarcodeDefinitionRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<BarcodeDefinitionDto>> Handle(GetBarcodeDefinitionByBarcodeQuery request, CancellationToken cancellationToken)
    {
        var entity = await _repository.GetByBarcodeAsync(request.Barcode, cancellationToken);

        if (entity == null)
        {
            return Result<BarcodeDefinitionDto>.Failure(new Error("BarcodeDefinition.NotFound", $"Barcode '{request.Barcode}' not found", ErrorType.NotFound));
        }

        var dto = new BarcodeDefinitionDto
        {
            Id = entity.Id,
            ProductId = entity.ProductId,
            ProductName = entity.Product?.Name,
            ProductCode = entity.Product?.Code,
            ProductVariantId = entity.ProductVariantId,
            Barcode = entity.Barcode,
            BarcodeType = entity.BarcodeType.ToString(),
            IsPrimary = entity.IsPrimary,
            IsActive = entity.IsActive,
            UnitId = entity.UnitId,
            UnitName = entity.Unit?.Name,
            QuantityPerUnit = entity.QuantityPerUnit,
            PackagingTypeId = entity.PackagingTypeId,
            PackagingTypeName = entity.PackagingType?.Name,
            IsManufacturerBarcode = entity.IsManufacturerBarcode,
            ManufacturerCode = entity.ManufacturerCode,
            Gtin = entity.Gtin,
            Description = entity.Description,
            ValidFrom = entity.ValidFrom,
            ValidUntil = entity.ValidUntil,
            CreatedAt = entity.CreatedDate,
            UpdatedAt = entity.UpdatedDate
        };

        return Result<BarcodeDefinitionDto>.Success(dto);
    }
}
