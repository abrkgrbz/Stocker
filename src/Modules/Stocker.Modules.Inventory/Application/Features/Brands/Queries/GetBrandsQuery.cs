using MediatR;
using Stocker.Application.Common.Interfaces;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.Brands.Queries;

/// <summary>
/// Query to get all brands - Cache destekli
/// </summary>
public class GetBrandsQuery : IRequest<Result<List<BrandDto>>>, ICacheableQuery
{
    public Guid TenantId { get; set; }
    public bool IncludeInactive { get; set; }

    // ICacheableQuery implementation
    public string CacheKey => $"inventory:brands:{TenantId}:{IncludeInactive}";
    public int CacheDurationMinutes => 10; // Markalar orta sıklıkta değişir
    public bool BypassCache { get; set; } = false;
}

/// <summary>
/// Handler for GetBrandsQuery
/// </summary>
public class GetBrandsQueryHandler : IRequestHandler<GetBrandsQuery, Result<List<BrandDto>>>
{
    private readonly IBrandRepository _brandRepository;

    public GetBrandsQueryHandler(IBrandRepository brandRepository)
    {
        _brandRepository = brandRepository;
    }

    public async Task<Result<List<BrandDto>>> Handle(GetBrandsQuery request, CancellationToken cancellationToken)
    {
        var brands = request.IncludeInactive
            ? await _brandRepository.GetAllAsync(cancellationToken)
            : await _brandRepository.GetActiveBrandsAsync(cancellationToken);

        var dtos = brands.Select(b => new BrandDto
        {
            Id = b.Id,
            Code = b.Code,
            Name = b.Name,
            Description = b.Description,
            LogoUrl = b.LogoUrl,
            Website = b.Website,
            IsActive = b.IsActive,
            CreatedAt = b.CreatedDate,
            UpdatedAt = b.UpdatedDate,
            ProductCount = b.Products?.Count ?? 0
        }).ToList();

        return Result<List<BrandDto>>.Success(dtos);
    }
}
