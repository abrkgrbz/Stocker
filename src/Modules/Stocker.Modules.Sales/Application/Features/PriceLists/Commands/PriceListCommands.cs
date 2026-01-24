using MediatR;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Features.PriceLists.Commands;

public record CreatePriceListCommand(CreatePriceListDto Dto) : IRequest<Result<PriceListDto>>;

public record UpdatePriceListCommand(Guid Id, UpdatePriceListDto Dto) : IRequest<Result<PriceListDto>>;

public record ActivatePriceListCommand(Guid Id) : IRequest<Result<PriceListDto>>;

public record DeactivatePriceListCommand(Guid Id) : IRequest<Result<PriceListDto>>;

public record DeletePriceListCommand(Guid Id) : IRequest<Result>;

public record AddPriceListItemCommand(Guid PriceListId, AddPriceListItemDto Dto) : IRequest<Result<PriceListItemDto>>;

public record UpdatePriceListItemPriceCommand(Guid PriceListId, Guid ProductId, UpdatePriceListItemDto Dto) : IRequest<Result>;

public record RemovePriceListItemCommand(Guid PriceListId, Guid ItemId) : IRequest<Result>;

public record AssignCustomerCommand(Guid PriceListId, AssignCustomerDto Dto) : IRequest<Result<PriceListCustomerDto>>;

public record RemoveCustomerAssignmentCommand(Guid PriceListId, Guid CustomerId) : IRequest<Result>;

public record ApplyBulkAdjustmentCommand(Guid PriceListId, BulkAdjustmentDto Dto) : IRequest<Result<PriceListDto>>;
