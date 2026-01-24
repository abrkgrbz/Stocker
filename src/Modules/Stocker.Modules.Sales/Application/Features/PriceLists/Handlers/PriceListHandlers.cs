using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Application.Features.PriceLists.Commands;
using Stocker.Modules.Sales.Application.Features.PriceLists.Queries;
using Stocker.Modules.Sales.Domain.Entities;
using Stocker.Modules.Sales.Interfaces;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Features.PriceLists.Handlers;

public class CreatePriceListHandler : IRequestHandler<CreatePriceListCommand, Result<PriceListDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public CreatePriceListHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PriceListDto>> Handle(CreatePriceListCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var existing = await _unitOfWork.PriceLists.GetByCodeAsync(request.Dto.Code, cancellationToken);
        if (existing != null)
            return Result<PriceListDto>.Failure(Error.Conflict("PriceList.Code", "Bu kodla bir fiyat listesi zaten mevcut."));

        var result = PriceList.Create(
            tenantId,
            request.Dto.Code,
            request.Dto.Name,
            request.Dto.Type,
            request.Dto.CurrencyCode,
            request.Dto.ValidFrom,
            request.Dto.ValidTo,
            request.Dto.IsTaxIncluded,
            request.Dto.Priority,
            request.Dto.Description
        );

        if (!result.IsSuccess)
            return Result<PriceListDto>.Failure(result.Error);

        await _unitOfWork.PriceLists.AddAsync(result.Value!, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<PriceListDto>.Success(MapToDto(result.Value!));
    }

    private static PriceListDto MapToDto(PriceList entity)
    {
        return new PriceListDto
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
            Items = entity.Items.Select(MapItemToDto).ToList(),
            AssignedCustomers = entity.AssignedCustomers.Select(MapCustomerToDto).ToList()
        };
    }

    private static PriceListItemDto MapItemToDto(PriceListItem item)
    {
        return new PriceListItemDto
        {
            Id = item.Id,
            ProductId = item.ProductId,
            ProductCode = item.ProductCode,
            ProductName = item.ProductName,
            UnitPrice = item.UnitPrice.Amount,
            UnitPriceCurrency = item.UnitPrice.Currency,
            UnitOfMeasure = item.UnitOfMeasure,
            MinimumQuantity = item.MinimumQuantity,
            MaximumQuantity = item.MaximumQuantity,
            DiscountPercentage = item.DiscountPercentage,
            LastPriceUpdate = item.LastPriceUpdate,
            PreviousPrice = item.PreviousPrice?.Amount,
            IsActive = item.IsActive
        };
    }

    private static PriceListCustomerDto MapCustomerToDto(PriceListCustomer customer)
    {
        return new PriceListCustomerDto
        {
            Id = customer.Id,
            CustomerId = customer.CustomerId,
            CustomerName = customer.CustomerName,
            ValidFrom = customer.ValidFrom,
            ValidTo = customer.ValidTo,
            IsActive = customer.IsActive
        };
    }
}

public class UpdatePriceListHandler : IRequestHandler<UpdatePriceListCommand, Result<PriceListDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public UpdatePriceListHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PriceListDto>> Handle(UpdatePriceListCommand request, CancellationToken cancellationToken)
    {
        var priceList = await _unitOfWork.PriceLists.GetFullAsync(request.Id, cancellationToken);
        if (priceList == null)
            return Result<PriceListDto>.Failure(Error.NotFound("PriceList", "Fiyat listesi bulunamadı."));

        var validityResult = priceList.UpdateValidityPeriod(request.Dto.ValidFrom, request.Dto.ValidTo);
        if (!validityResult.IsSuccess)
            return Result<PriceListDto>.Failure(validityResult.Error);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

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

public class ActivatePriceListHandler : IRequestHandler<ActivatePriceListCommand, Result<PriceListDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public ActivatePriceListHandler(ISalesUnitOfWork unitOfWork) => _unitOfWork = unitOfWork;

    public async Task<Result<PriceListDto>> Handle(ActivatePriceListCommand request, CancellationToken cancellationToken)
    {
        var priceList = await _unitOfWork.PriceLists.GetByIdAsync(request.Id, cancellationToken);
        if (priceList == null)
            return Result<PriceListDto>.Failure(Error.NotFound("PriceList", "Fiyat listesi bulunamadı."));

        priceList.Activate();
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<PriceListDto>.Success(new PriceListDto
        {
            Id = priceList.Id, Code = priceList.Code, Name = priceList.Name,
            Type = priceList.Type.ToString(), IsActive = priceList.IsActive,
            CurrencyCode = priceList.CurrencyCode, ValidFrom = priceList.ValidFrom,
            ValidTo = priceList.ValidTo, Priority = priceList.Priority,
            IsTaxIncluded = priceList.IsTaxIncluded
        });
    }
}

public class DeactivatePriceListHandler : IRequestHandler<DeactivatePriceListCommand, Result<PriceListDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public DeactivatePriceListHandler(ISalesUnitOfWork unitOfWork) => _unitOfWork = unitOfWork;

    public async Task<Result<PriceListDto>> Handle(DeactivatePriceListCommand request, CancellationToken cancellationToken)
    {
        var priceList = await _unitOfWork.PriceLists.GetByIdAsync(request.Id, cancellationToken);
        if (priceList == null)
            return Result<PriceListDto>.Failure(Error.NotFound("PriceList", "Fiyat listesi bulunamadı."));

        priceList.Deactivate();
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<PriceListDto>.Success(new PriceListDto
        {
            Id = priceList.Id, Code = priceList.Code, Name = priceList.Name,
            Type = priceList.Type.ToString(), IsActive = priceList.IsActive,
            CurrencyCode = priceList.CurrencyCode, ValidFrom = priceList.ValidFrom,
            ValidTo = priceList.ValidTo, Priority = priceList.Priority,
            IsTaxIncluded = priceList.IsTaxIncluded
        });
    }
}

public class DeletePriceListHandler : IRequestHandler<DeletePriceListCommand, Result>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public DeletePriceListHandler(ISalesUnitOfWork unitOfWork) => _unitOfWork = unitOfWork;

    public async Task<Result> Handle(DeletePriceListCommand request, CancellationToken cancellationToken)
    {
        var priceList = await _unitOfWork.PriceLists.GetByIdAsync(request.Id, cancellationToken);
        if (priceList == null)
            return Result.Failure(Error.NotFound("PriceList", "Fiyat listesi bulunamadı."));

        _unitOfWork.PriceLists.Remove(priceList);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}

public class AddPriceListItemHandler : IRequestHandler<AddPriceListItemCommand, Result<PriceListItemDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public AddPriceListItemHandler(ISalesUnitOfWork unitOfWork) => _unitOfWork = unitOfWork;

    public async Task<Result<PriceListItemDto>> Handle(AddPriceListItemCommand request, CancellationToken cancellationToken)
    {
        var priceList = await _unitOfWork.PriceLists.GetWithItemsAsync(request.PriceListId, cancellationToken);
        if (priceList == null)
            return Result<PriceListItemDto>.Failure(Error.NotFound("PriceList", "Fiyat listesi bulunamadı."));

        var unitPrice = Money.Create(request.Dto.UnitPrice, request.Dto.Currency);

        var result = priceList.AddItem(
            request.Dto.ProductId,
            request.Dto.ProductCode,
            request.Dto.ProductName,
            unitPrice,
            request.Dto.UnitOfMeasure,
            request.Dto.MinimumQuantity,
            request.Dto.MaximumQuantity
        );

        if (!result.IsSuccess)
            return Result<PriceListItemDto>.Failure(result.Error);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var item = result.Value!;
        return Result<PriceListItemDto>.Success(new PriceListItemDto
        {
            Id = item.Id, ProductId = item.ProductId, ProductCode = item.ProductCode,
            ProductName = item.ProductName, UnitPrice = item.UnitPrice.Amount,
            UnitPriceCurrency = item.UnitPrice.Currency, UnitOfMeasure = item.UnitOfMeasure,
            MinimumQuantity = item.MinimumQuantity, MaximumQuantity = item.MaximumQuantity,
            LastPriceUpdate = item.LastPriceUpdate, IsActive = item.IsActive
        });
    }
}

public class UpdatePriceListItemPriceHandler : IRequestHandler<UpdatePriceListItemPriceCommand, Result>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public UpdatePriceListItemPriceHandler(ISalesUnitOfWork unitOfWork) => _unitOfWork = unitOfWork;

    public async Task<Result> Handle(UpdatePriceListItemPriceCommand request, CancellationToken cancellationToken)
    {
        var priceList = await _unitOfWork.PriceLists.GetWithItemsAsync(request.PriceListId, cancellationToken);
        if (priceList == null)
            return Result.Failure(Error.NotFound("PriceList", "Fiyat listesi bulunamadı."));

        var newPrice = Money.Create(request.Dto.UnitPrice, request.Dto.Currency);
        var result = priceList.UpdateItemPrice(request.ProductId, newPrice);

        if (!result.IsSuccess)
            return result;

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}

public class RemovePriceListItemHandler : IRequestHandler<RemovePriceListItemCommand, Result>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public RemovePriceListItemHandler(ISalesUnitOfWork unitOfWork) => _unitOfWork = unitOfWork;

    public async Task<Result> Handle(RemovePriceListItemCommand request, CancellationToken cancellationToken)
    {
        var priceList = await _unitOfWork.PriceLists.GetWithItemsAsync(request.PriceListId, cancellationToken);
        if (priceList == null)
            return Result.Failure(Error.NotFound("PriceList", "Fiyat listesi bulunamadı."));

        var result = priceList.RemoveItem(request.ItemId);
        if (!result.IsSuccess)
            return result;

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}

public class AssignCustomerHandler : IRequestHandler<AssignCustomerCommand, Result<PriceListCustomerDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public AssignCustomerHandler(ISalesUnitOfWork unitOfWork) => _unitOfWork = unitOfWork;

    public async Task<Result<PriceListCustomerDto>> Handle(AssignCustomerCommand request, CancellationToken cancellationToken)
    {
        var priceList = await _unitOfWork.PriceLists.GetWithCustomersAsync(request.PriceListId, cancellationToken);
        if (priceList == null)
            return Result<PriceListCustomerDto>.Failure(Error.NotFound("PriceList", "Fiyat listesi bulunamadı."));

        var result = priceList.AssignToCustomer(
            request.Dto.CustomerId,
            request.Dto.CustomerName,
            request.Dto.ValidFrom,
            request.Dto.ValidTo
        );

        if (!result.IsSuccess)
            return Result<PriceListCustomerDto>.Failure(result.Error);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var customer = result.Value!;
        return Result<PriceListCustomerDto>.Success(new PriceListCustomerDto
        {
            Id = customer.Id, CustomerId = customer.CustomerId,
            CustomerName = customer.CustomerName, ValidFrom = customer.ValidFrom,
            ValidTo = customer.ValidTo, IsActive = customer.IsActive
        });
    }
}

public class RemoveCustomerAssignmentHandler : IRequestHandler<RemoveCustomerAssignmentCommand, Result>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public RemoveCustomerAssignmentHandler(ISalesUnitOfWork unitOfWork) => _unitOfWork = unitOfWork;

    public async Task<Result> Handle(RemoveCustomerAssignmentCommand request, CancellationToken cancellationToken)
    {
        var priceList = await _unitOfWork.PriceLists.GetWithCustomersAsync(request.PriceListId, cancellationToken);
        if (priceList == null)
            return Result.Failure(Error.NotFound("PriceList", "Fiyat listesi bulunamadı."));

        var result = priceList.RemoveCustomerAssignment(request.CustomerId);
        if (!result.IsSuccess)
            return result;

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}

public class ApplyBulkAdjustmentHandler : IRequestHandler<ApplyBulkAdjustmentCommand, Result<PriceListDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public ApplyBulkAdjustmentHandler(ISalesUnitOfWork unitOfWork) => _unitOfWork = unitOfWork;

    public async Task<Result<PriceListDto>> Handle(ApplyBulkAdjustmentCommand request, CancellationToken cancellationToken)
    {
        var priceList = await _unitOfWork.PriceLists.GetWithItemsAsync(request.PriceListId, cancellationToken);
        if (priceList == null)
            return Result<PriceListDto>.Failure(Error.NotFound("PriceList", "Fiyat listesi bulunamadı."));

        var result = priceList.ApplyBulkAdjustment(request.Dto.PercentageChange);
        if (!result.IsSuccess)
            return Result<PriceListDto>.Failure(result.Error);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<PriceListDto>.Success(new PriceListDto
        {
            Id = priceList.Id, Code = priceList.Code, Name = priceList.Name,
            Type = priceList.Type.ToString(), IsActive = priceList.IsActive,
            CurrencyCode = priceList.CurrencyCode, ValidFrom = priceList.ValidFrom,
            ValidTo = priceList.ValidTo, Priority = priceList.Priority,
            IsTaxIncluded = priceList.IsTaxIncluded,
            Items = priceList.Items.Select(i => new PriceListItemDto
            {
                Id = i.Id, ProductId = i.ProductId, ProductCode = i.ProductCode,
                ProductName = i.ProductName, UnitPrice = i.UnitPrice.Amount,
                UnitPriceCurrency = i.UnitPrice.Currency, UnitOfMeasure = i.UnitOfMeasure,
                MinimumQuantity = i.MinimumQuantity, MaximumQuantity = i.MaximumQuantity,
                DiscountPercentage = i.DiscountPercentage, LastPriceUpdate = i.LastPriceUpdate,
                PreviousPrice = i.PreviousPrice?.Amount, IsActive = i.IsActive
            }).ToList()
        });
    }
}
