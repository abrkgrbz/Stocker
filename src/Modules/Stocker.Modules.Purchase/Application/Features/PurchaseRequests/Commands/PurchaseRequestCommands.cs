using MediatR;
using Stocker.Modules.Purchase.Application.DTOs;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Purchase.Application.Features.PurchaseRequests.Commands;

public record CreatePurchaseRequestCommand(CreatePurchaseRequestDto Dto) : IRequest<Result<PurchaseRequestDto>>;

public record UpdatePurchaseRequestCommand(Guid Id, UpdatePurchaseRequestDto Dto) : IRequest<Result<PurchaseRequestDto>>;

public record AddPurchaseRequestItemCommand(Guid RequestId, CreatePurchaseRequestItemDto Item) : IRequest<Result<PurchaseRequestDto>>;

public record RemovePurchaseRequestItemCommand(Guid RequestId, Guid ItemId) : IRequest<Result<PurchaseRequestDto>>;

public record SubmitPurchaseRequestCommand(Guid Id) : IRequest<Result<PurchaseRequestDto>>;

public record ApprovePurchaseRequestCommand(Guid Id, ApprovePurchaseRequestDto Dto) : IRequest<Result<PurchaseRequestDto>>;

public record RejectPurchaseRequestCommand(Guid Id, RejectPurchaseRequestDto Dto) : IRequest<Result<PurchaseRequestDto>>;

public record ConvertToPurchaseOrderCommand(Guid Id) : IRequest<Result<Guid>>;

public record CancelPurchaseRequestCommand(Guid Id, string Reason) : IRequest<Result<PurchaseRequestDto>>;

public record DeletePurchaseRequestCommand(Guid Id) : IRequest<Result>;
