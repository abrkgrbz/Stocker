using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.PackagingTypes.Queries;

/// <summary>
/// Query to get a packaging type by ID
/// </summary>
public class GetPackagingTypeByIdQuery : IRequest<Result<PackagingTypeDto>>
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

/// <summary>
/// Handler for GetPackagingTypeByIdQuery
/// </summary>
public class GetPackagingTypeByIdQueryHandler : IRequestHandler<GetPackagingTypeByIdQuery, Result<PackagingTypeDto>>
{
    private readonly IPackagingTypeRepository _repository;

    public GetPackagingTypeByIdQueryHandler(IPackagingTypeRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<PackagingTypeDto>> Handle(GetPackagingTypeByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await _repository.GetByIdAsync(request.Id, cancellationToken);

        if (entity == null)
        {
            return Result<PackagingTypeDto>.Failure(new Error("PackagingType.NotFound", $"Packaging type with ID {request.Id} not found", ErrorType.NotFound));
        }

        var dto = new PackagingTypeDto
        {
            Id = entity.Id,
            Code = entity.Code,
            Name = entity.Name,
            Description = entity.Description,
            Category = entity.Category.ToString(),
            IsActive = entity.IsActive,
            Length = entity.Length,
            Width = entity.Width,
            Height = entity.Height,
            Volume = entity.Volume,
            EmptyWeight = entity.EmptyWeight,
            MaxWeightCapacity = entity.MaxWeightCapacity,
            DefaultQuantity = entity.DefaultQuantity,
            MaxQuantity = entity.MaxQuantity,
            IsStackable = entity.IsStackable,
            StackableCount = entity.StackableCount,
            UnitsPerPallet = entity.UnitsPerPallet,
            UnitsPerPalletLayer = entity.UnitsPerPalletLayer,
            BarcodePrefix = entity.BarcodePrefix,
            DefaultBarcodeType = entity.DefaultBarcodeType?.ToString(),
            MaterialType = entity.MaterialType,
            IsRecyclable = entity.IsRecyclable,
            IsReturnable = entity.IsReturnable,
            DepositAmount = entity.DepositAmount,
            CreatedAt = entity.CreatedDate,
            UpdatedAt = entity.UpdatedDate
        };

        return Result<PackagingTypeDto>.Success(dto);
    }
}
