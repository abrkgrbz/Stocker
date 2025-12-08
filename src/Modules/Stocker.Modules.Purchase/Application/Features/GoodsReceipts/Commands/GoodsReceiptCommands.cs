using MediatR;
using Stocker.Modules.Purchase.Application.DTOs;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Purchase.Application.Features.GoodsReceipts.Commands;

public record CreateGoodsReceiptCommand(CreateGoodsReceiptDto Dto) : IRequest<Result<GoodsReceiptDto>>;

public record UpdateGoodsReceiptCommand(Guid Id, UpdateGoodsReceiptDto Dto) : IRequest<Result<GoodsReceiptDto>>;

public record AddGoodsReceiptItemCommand(Guid ReceiptId, CreateGoodsReceiptItemDto Item) : IRequest<Result<GoodsReceiptDto>>;

public record RemoveGoodsReceiptItemCommand(Guid ReceiptId, Guid ItemId) : IRequest<Result<GoodsReceiptDto>>;

public record SubmitGoodsReceiptCommand(Guid Id) : IRequest<Result<GoodsReceiptDto>>;

public record PerformQualityCheckCommand(Guid Id, QualityCheckDto Dto) : IRequest<Result<GoodsReceiptDto>>;

public record ApproveGoodsReceiptCommand(Guid Id) : IRequest<Result<GoodsReceiptDto>>;

public record CompleteGoodsReceiptCommand(Guid Id) : IRequest<Result<GoodsReceiptDto>>;

public record RejectGoodsReceiptCommand(Guid Id, string Reason) : IRequest<Result<GoodsReceiptDto>>;

public record CancelGoodsReceiptCommand(Guid Id, string Reason) : IRequest<Result<GoodsReceiptDto>>;

public record DeleteGoodsReceiptCommand(Guid Id) : IRequest<Result>;
