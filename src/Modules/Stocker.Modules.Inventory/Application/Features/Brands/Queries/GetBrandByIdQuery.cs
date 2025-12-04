using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.Brands.Queries;

/// <summary>
/// Query to get a brand by ID
/// </summary>
public class GetBrandByIdQuery : IRequest<Result<BrandDto>>
{
    public Guid TenantId { get; set; }
    public int BrandId { get; set; }
}

/// <summary>
/// Handler for GetBrandByIdQuery
/// </summary>
public class GetBrandByIdQueryHandler : IRequestHandler<GetBrandByIdQuery, Result<BrandDto>>
{
    private readonly IBrandRepository _brandRepository;

    public GetBrandByIdQueryHandler(IBrandRepository brandRepository)
    {
        _brandRepository = brandRepository;
    }

    public async Task<Result<BrandDto>> Handle(GetBrandByIdQuery request, CancellationToken cancellationToken)
    {
        var brand = await _brandRepository.GetByIdAsync(request.BrandId, cancellationToken);

        if (brand == null)
        {
            return Result<BrandDto>.Failure(new Error("Brand.NotFound", $"Brand with ID {request.BrandId} not found", ErrorType.NotFound));
        }

        var dto = new BrandDto
        {
            Id = brand.Id,
            Code = brand.Code,
            Name = brand.Name,
            Description = brand.Description,
            LogoUrl = brand.LogoUrl,
            Website = brand.Website,
            IsActive = brand.IsActive,
            CreatedAt = brand.CreatedDate,
            UpdatedAt = brand.UpdatedDate,
            ProductCount = brand.Products?.Count ?? 0
        };

        return Result<BrandDto>.Success(dto);
    }
}
