using MediatR;
using Stocker.Modules.Purchase.Application.DTOs;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Purchase.Application.Features.PurchaseReturns.Commands;

public record CreatePurchaseReturnCommand(CreatePurchaseReturnDto Dto) : IRequest<Result<PurchaseReturnDto>>;

public record UpdatePurchaseReturnCommand(Guid Id, UpdatePurchaseReturnDto Dto) : IRequest<Result<PurchaseReturnDto>>;

public record AddPurchaseReturnItemCommand(Guid ReturnId, CreatePurchaseReturnItemDto Item) : IRequest<Result<PurchaseReturnDto>>;

public record RemovePurchaseReturnItemCommand(Guid ReturnId, Guid ItemId) : IRequest<Result<PurchaseReturnDto>>;

public record SubmitPurchaseReturnCommand(Guid Id) : IRequest<Result<PurchaseReturnDto>>;

public record ApprovePurchaseReturnCommand(Guid Id) : IRequest<Result<PurchaseReturnDto>>;

public record RejectPurchaseReturnCommand(Guid Id, string Reason) : IRequest<Result<PurchaseReturnDto>>;

public record ShipPurchaseReturnCommand(Guid Id, ShipReturnDto Dto) : IRequest<Result<PurchaseReturnDto>>;

public record MarkReturnReceivedCommand(Guid Id) : IRequest<Result<PurchaseReturnDto>>;

public record ProcessReturnRefundCommand(Guid Id, ProcessRefundDto Dto) : IRequest<Result<PurchaseReturnDto>>;

public record CompletePurchaseReturnCommand(Guid Id) : IRequest<Result<PurchaseReturnDto>>;

public record CancelPurchaseReturnCommand(Guid Id, string Reason) : IRequest<Result<PurchaseReturnDto>>;

public record SetRmaNumberCommand(Guid Id, string RmaNumber) : IRequest<Result<PurchaseReturnDto>>;

public record DeletePurchaseReturnCommand(Guid Id) : IRequest<Result>;
