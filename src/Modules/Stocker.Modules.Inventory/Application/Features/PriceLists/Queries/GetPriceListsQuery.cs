using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.PriceLists.Queries;

/// <summary>
/// Query to get all price lists
/// </summary>
public class GetPriceListsQuery : IRequest<Result<List<PriceListListDto>>>
{
    public Guid TenantId { get; set; }
    public bool IncludeInactive { get; set; }
    public bool ValidOnly { get; set; }
}

/// <summary>
/// Handler for GetPriceListsQuery
/// </summary>
public class GetPriceListsQueryHandler : IRequestHandler<GetPriceListsQuery, Result<List<PriceListListDto>>>
{
    private readonly IPriceListRepository _priceListRepository;

    public GetPriceListsQueryHandler(IPriceListRepository priceListRepository)
    {
        _priceListRepository = priceListRepository;
    }

    public async Task<Result<List<PriceListListDto>>> Handle(GetPriceListsQuery request, CancellationToken cancellationToken)
    {
        IReadOnlyList<Domain.Entities.PriceList> priceLists;

        if (request.ValidOnly)
        {
            priceLists = await _priceListRepository.GetValidPriceListsAsync(cancellationToken);
        }
        else if (request.IncludeInactive)
        {
            priceLists = await _priceListRepository.GetAllAsync(cancellationToken);
        }
        else
        {
            priceLists = await _priceListRepository.GetActivePriceListsAsync(cancellationToken);
        }

        var dtos = priceLists.Select(p => new PriceListListDto
        {
            Id = p.Id,
            Code = p.Code,
            Name = p.Name,
            Currency = p.Currency,
            ValidFrom = p.ValidFrom,
            ValidTo = p.ValidTo,
            IsActive = p.IsActive,
            IsDefault = p.IsDefault,
            IsValid = p.IsValid(),
            ItemCount = p.Items?.Count ?? 0
        }).ToList();

        return Result<List<PriceListListDto>>.Success(dtos);
    }
}
