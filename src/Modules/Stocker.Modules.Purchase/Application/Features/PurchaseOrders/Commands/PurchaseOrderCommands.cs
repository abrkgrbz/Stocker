using MediatR;
using Stocker.Modules.Purchase.Application.DTOs;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Purchase.Application.Features.PurchaseOrders.Commands;

public record CreatePurchaseOrderCommand(CreatePurchaseOrderDto Dto) : IRequest<Result<PurchaseOrderDto>>;

public record UpdatePurchaseOrderCommand(Guid Id, UpdatePurchaseOrderDto Dto) : IRequest<Result<PurchaseOrderDto>>;

public record AddPurchaseOrderItemCommand(Guid OrderId, CreatePurchaseOrderItemDto Item) : IRequest<Result<PurchaseOrderDto>>;

public record RemovePurchaseOrderItemCommand(Guid OrderId, Guid ItemId) : IRequest<Result<PurchaseOrderDto>>;

public record UpdatePurchaseOrderItemCommand(Guid OrderId, Guid ItemId, CreatePurchaseOrderItemDto Item) : IRequest<Result<PurchaseOrderDto>>;

public record SubmitPurchaseOrderCommand(Guid Id) : IRequest<Result<PurchaseOrderDto>>;

public record ApprovePurchaseOrderCommand(Guid Id) : IRequest<Result<PurchaseOrderDto>>;

public record ConfirmPurchaseOrderCommand(Guid Id) : IRequest<Result<PurchaseOrderDto>>;

public record SendPurchaseOrderCommand(Guid Id) : IRequest<Result<PurchaseOrderDto>>;

public record ReceivePartialCommand(Guid Id, Guid ItemId, decimal Quantity) : IRequest<Result<PurchaseOrderDto>>;

public record ReceiveAllCommand(Guid Id) : IRequest<Result<PurchaseOrderDto>>;

public record CompletePurchaseOrderCommand(Guid Id) : IRequest<Result<PurchaseOrderDto>>;

public record CancelPurchaseOrderCommand(Guid Id, string Reason) : IRequest<Result<PurchaseOrderDto>>;

public record DeletePurchaseOrderCommand(Guid Id) : IRequest<Result>;
