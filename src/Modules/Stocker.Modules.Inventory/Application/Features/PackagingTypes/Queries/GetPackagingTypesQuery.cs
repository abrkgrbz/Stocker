using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.PackagingTypes.Queries;

/// <summary>
/// Query to get all packaging types
/// </summary>
public class GetPackagingTypesQuery : IRequest<Result<List<PackagingTypeDto>>>
{
    public Guid TenantId { get; set; }
    public string? Category { get; set; }
    public bool IncludeInactive { get; set; }
}

/// <summary>
/// Handler for GetPackagingTypesQuery
/// </summary>
public class GetPackagingTypesQueryHandler : IRequestHandler<GetPackagingTypesQuery, Result<List<PackagingTypeDto>>>
{
    private readonly IPackagingTypeRepository _repository;

    public GetPackagingTypesQueryHandler(IPackagingTypeRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<List<PackagingTypeDto>>> Handle(GetPackagingTypesQuery request, CancellationToken cancellationToken)
    {
        var entities = request.IncludeInactive
            ? await _repository.GetAllAsync(cancellationToken)
            : await _repository.GetActiveAsync(cancellationToken);

        var dtos = entities.Select(e => new PackagingTypeDto
        {
            Id = e.Id,
            Code = e.Code,
            Name = e.Name,
            Description = e.Description,
            Category = e.Category.ToString(),
            IsActive = e.IsActive,
            Length = e.Length,
            Width = e.Width,
            Height = e.Height,
            Volume = e.Volume,
            EmptyWeight = e.EmptyWeight,
            MaxWeightCapacity = e.MaxWeightCapacity,
            DefaultQuantity = e.DefaultQuantity,
            MaxQuantity = e.MaxQuantity,
            IsStackable = e.IsStackable,
            StackableCount = e.StackableCount,
            UnitsPerPallet = e.UnitsPerPallet,
            UnitsPerPalletLayer = e.UnitsPerPalletLayer,
            BarcodePrefix = e.BarcodePrefix,
            DefaultBarcodeType = e.DefaultBarcodeType?.ToString(),
            MaterialType = e.MaterialType,
            IsRecyclable = e.IsRecyclable,
            IsReturnable = e.IsReturnable,
            DepositAmount = e.DepositAmount,
            CreatedAt = e.CreatedDate,
            UpdatedAt = e.UpdatedDate
        }).ToList();

        return Result<List<PackagingTypeDto>>.Success(dtos);
    }
}
