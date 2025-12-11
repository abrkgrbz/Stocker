using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.BarcodeDefinitions.Queries;

/// <summary>
/// Query to get a barcode definition by ID
/// </summary>
public class GetBarcodeDefinitionByIdQuery : IRequest<Result<BarcodeDefinitionDto>>
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

/// <summary>
/// Handler for GetBarcodeDefinitionByIdQuery
/// </summary>
public class GetBarcodeDefinitionByIdQueryHandler : IRequestHandler<GetBarcodeDefinitionByIdQuery, Result<BarcodeDefinitionDto>>
{
    private readonly IBarcodeDefinitionRepository _repository;

    public GetBarcodeDefinitionByIdQueryHandler(IBarcodeDefinitionRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<BarcodeDefinitionDto>> Handle(GetBarcodeDefinitionByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await _repository.GetByIdAsync(request.Id, cancellationToken);

        if (entity == null)
        {
            return Result<BarcodeDefinitionDto>.Failure(new Error("BarcodeDefinition.NotFound", $"Barcode definition with ID {request.Id} not found", ErrorType.NotFound));
        }

        var dto = new BarcodeDefinitionDto
        {
            Id = entity.Id,
            ProductId = entity.ProductId,
            ProductName = entity.Product?.Name,
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
