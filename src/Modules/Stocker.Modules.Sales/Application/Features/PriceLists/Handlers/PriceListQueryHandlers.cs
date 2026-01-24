using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Application.Features.PriceLists.Queries;
using Stocker.Modules.Sales.Domain.Entities;
using Stocker.Modules.Sales.Interfaces;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Features.PriceLists.Handlers;

public class GetPriceListByIdHandler : IRequestHandler<GetPriceListByIdQuery, Result<PriceListDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public GetPriceListByIdHandler(ISalesUnitOfWork unitOfWork) => _unitOfWork = unitOfWork;

    public async Task<Result<PriceListDto>> Handle(GetPriceListByIdQuery request, CancellationToken cancellationToken)
    {
        var priceList = await _unitOfWork.PriceLists.GetFullAsync(request.Id, cancellationToken);
        if (priceList == null)
            return Result<PriceListDto>.Failure(Error.NotFound("PriceList", "Fiyat listesi bulunamadı."));

        return Result<PriceListDto>.Success(MapToDto(priceList));
    }

    private static PriceListDto MapToDto(PriceList entity) => new()
    {
        Id = entity.Id,
        Code = entity.Code,
        Name = entity.Name,
        Description = entity.Description,
        Type = entity.Type.ToString(),
        CurrencyCode = entity.CurrencyCode,
        ValidFrom = entity.ValidFrom,
        ValidTo = entity.ValidTo,
        IsTaxIncluded = entity.IsTaxIncluded,
        Priority = entity.Priority,
        MinimumOrderAmount = entity.MinimumOrderAmount?.Amount,
        MinimumOrderCurrency = entity.MinimumOrderAmount?.Currency,
        IsActive = entity.IsActive,
        BasePriceListId = entity.BasePriceListId,
        BaseAdjustmentPercentage = entity.BaseAdjustmentPercentage,
        SalesTerritoryId = entity.SalesTerritoryId,
        CustomerSegment = entity.CustomerSegment,
        Items = entity.Items.Select(i => new PriceListItemDto
        {
            Id = i.Id, ProductId = i.ProductId, ProductCode = i.ProductCode,
            ProductName = i.ProductName, UnitPrice = i.UnitPrice.Amount,
            UnitPriceCurrency = i.UnitPrice.Currency, UnitOfMeasure = i.UnitOfMeasure,
            MinimumQuantity = i.MinimumQuantity, MaximumQuantity = i.MaximumQuantity,
            DiscountPercentage = i.DiscountPercentage, LastPriceUpdate = i.LastPriceUpdate,
            PreviousPrice = i.PreviousPrice?.Amount, IsActive = i.IsActive
        }).ToList(),
        AssignedCustomers = entity.AssignedCustomers.Select(c => new PriceListCustomerDto
        {
            Id = c.Id, CustomerId = c.CustomerId, CustomerName = c.CustomerName,
            ValidFrom = c.ValidFrom, ValidTo = c.ValidTo, IsActive = c.IsActive
        }).ToList()
    };
}

public class GetPriceListByCodeHandler : IRequestHandler<GetPriceListByCodeQuery, Result<PriceListDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public GetPriceListByCodeHandler(ISalesUnitOfWork unitOfWork) => _unitOfWork = unitOfWork;

    public async Task<Result<PriceListDto>> Handle(GetPriceListByCodeQuery request, CancellationToken cancellationToken)
    {
        var priceList = await _unitOfWork.PriceLists.GetByCodeAsync(request.Code, cancellationToken);
        if (priceList == null)
            return Result<PriceListDto>.Failure(Error.NotFound("PriceList", "Fiyat listesi bulunamadı."));

        return Result<PriceListDto>.Success(new PriceListDto
        {
            Id = priceList.Id, Code = priceList.Code, Name = priceList.Name,
            Description = priceList.Description, Type = priceList.Type.ToString(),
            CurrencyCode = priceList.CurrencyCode, ValidFrom = priceList.ValidFrom,
            ValidTo = priceList.ValidTo, IsTaxIncluded = priceList.IsTaxIncluded,
            Priority = priceList.Priority, IsActive = priceList.IsActive,
            BasePriceListId = priceList.BasePriceListId,
            BaseAdjustmentPercentage = priceList.BaseAdjustmentPercentage
        });
    }
}

public class GetPriceListsHandler : IRequestHandler<GetPriceListsQuery, Result<PagedResult<PriceListListDto>>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public GetPriceListsHandler(ISalesUnitOfWork unitOfWork) => _unitOfWork = unitOfWork;

    public async Task<Result<PagedResult<PriceListListDto>>> Handle(GetPriceListsQuery request, CancellationToken cancellationToken)
    {
        var query = _unitOfWork.ReadRepository<PriceList>().AsQueryable()
            .Include(p => p.Items)
            .Include(p => p.AssignedCustomers)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var term = request.SearchTerm.ToLower();
            query = query.Where(p => p.Code.ToLower().Contains(term) ||
                                     p.Name.ToLower().Contains(term));
        }

        if (request.Type.HasValue)
            query = query.Where(p => p.Type == request.Type.Value);

        if (request.IsActive.HasValue)
            query = query.Where(p => p.IsActive == request.IsActive.Value);

        query = request.SortBy?.ToLower() switch
        {
            "code" => request.SortDescending ? query.OrderByDescending(p => p.Code) : query.OrderBy(p => p.Code),
            "name" => request.SortDescending ? query.OrderByDescending(p => p.Name) : query.OrderBy(p => p.Name),
            "priority" => request.SortDescending ? query.OrderByDescending(p => p.Priority) : query.OrderBy(p => p.Priority),
            "validfrom" => request.SortDescending ? query.OrderByDescending(p => p.ValidFrom) : query.OrderBy(p => p.ValidFrom),
            _ => query.OrderBy(p => p.Priority).ThenBy(p => p.Name)
        };

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(p => new PriceListListDto
            {
                Id = p.Id,
                Code = p.Code,
                Name = p.Name,
                Type = p.Type.ToString(),
                CurrencyCode = p.CurrencyCode,
                ValidFrom = p.ValidFrom,
                ValidTo = p.ValidTo,
                IsActive = p.IsActive,
                Priority = p.Priority,
                ItemCount = p.Items.Count,
                CustomerCount = p.AssignedCustomers.Count(c => c.IsActive)
            })
            .ToListAsync(cancellationToken);

        var pagedResult = new PagedResult<PriceListListDto>(items, totalCount, request.Page, request.PageSize);
        return Result<PagedResult<PriceListListDto>>.Success(pagedResult);
    }
}

public class GetActivePriceListsHandler : IRequestHandler<GetActivePriceListsQuery, Result<List<PriceListListDto>>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public GetActivePriceListsHandler(ISalesUnitOfWork unitOfWork) => _unitOfWork = unitOfWork;

    public async Task<Result<List<PriceListListDto>>> Handle(GetActivePriceListsQuery request, CancellationToken cancellationToken)
    {
        var lists = await _unitOfWork.PriceLists.GetActiveListsAsync(cancellationToken);

        var result = lists.Select(p => new PriceListListDto
        {
            Id = p.Id, Code = p.Code, Name = p.Name, Type = p.Type.ToString(),
            CurrencyCode = p.CurrencyCode, ValidFrom = p.ValidFrom, ValidTo = p.ValidTo,
            IsActive = p.IsActive, Priority = p.Priority,
            ItemCount = p.Items.Count, CustomerCount = p.AssignedCustomers.Count(c => c.IsActive)
        }).ToList();

        return Result<List<PriceListListDto>>.Success(result);
    }
}

public class GetPriceListsByCustomerHandler : IRequestHandler<GetPriceListsByCustomerQuery, Result<List<PriceListListDto>>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public GetPriceListsByCustomerHandler(ISalesUnitOfWork unitOfWork) => _unitOfWork = unitOfWork;

    public async Task<Result<List<PriceListListDto>>> Handle(GetPriceListsByCustomerQuery request, CancellationToken cancellationToken)
    {
        var lists = await _unitOfWork.PriceLists.GetByCustomerIdAsync(request.CustomerId, cancellationToken);

        var result = lists.Select(p => new PriceListListDto
        {
            Id = p.Id, Code = p.Code, Name = p.Name, Type = p.Type.ToString(),
            CurrencyCode = p.CurrencyCode, ValidFrom = p.ValidFrom, ValidTo = p.ValidTo,
            IsActive = p.IsActive, Priority = p.Priority,
            ItemCount = p.Items.Count, CustomerCount = p.AssignedCustomers.Count(c => c.IsActive)
        }).ToList();

        return Result<List<PriceListListDto>>.Success(result);
    }
}

public class GetProductPriceHandler : IRequestHandler<GetProductPriceQuery, Result<ProductPriceResultDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public GetProductPriceHandler(ISalesUnitOfWork unitOfWork) => _unitOfWork = unitOfWork;

    public async Task<Result<ProductPriceResultDto>> Handle(GetProductPriceQuery request, CancellationToken cancellationToken)
    {
        var priceList = await _unitOfWork.PriceLists.GetWithItemsAsync(request.PriceListId, cancellationToken);
        if (priceList == null)
            return Result<ProductPriceResultDto>.Failure(Error.NotFound("PriceList", "Fiyat listesi bulunamadı."));

        var priceResult = priceList.GetProductPrice(request.ProductId, request.Quantity);
        if (!priceResult.IsSuccess)
            return Result<ProductPriceResultDto>.Failure(priceResult.Error);

        return Result<ProductPriceResultDto>.Success(new ProductPriceResultDto
        {
            ProductId = request.ProductId,
            UnitPrice = priceResult.Value!.Amount,
            Currency = priceResult.Value.Currency,
            PriceListCode = priceList.Code,
            PriceListName = priceList.Name
        });
    }
}
