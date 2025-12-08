using MediatR;
using Stocker.Modules.Purchase.Application.DTOs;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Purchase.Application.Features.PurchaseInvoices.Commands;

public record CreatePurchaseInvoiceCommand(CreatePurchaseInvoiceDto Dto) : IRequest<Result<PurchaseInvoiceDto>>;

public record UpdatePurchaseInvoiceCommand(Guid Id, UpdatePurchaseInvoiceDto Dto) : IRequest<Result<PurchaseInvoiceDto>>;

public record AddPurchaseInvoiceItemCommand(Guid InvoiceId, CreatePurchaseInvoiceItemDto Item) : IRequest<Result<PurchaseInvoiceDto>>;

public record RemovePurchaseInvoiceItemCommand(Guid InvoiceId, Guid ItemId) : IRequest<Result<PurchaseInvoiceDto>>;

public record SubmitPurchaseInvoiceCommand(Guid Id) : IRequest<Result<PurchaseInvoiceDto>>;

public record ApprovePurchaseInvoiceCommand(Guid Id) : IRequest<Result<PurchaseInvoiceDto>>;

public record RejectPurchaseInvoiceCommand(Guid Id, string Reason) : IRequest<Result<PurchaseInvoiceDto>>;

public record RecordInvoicePaymentCommand(Guid Id, RecordPaymentDto Dto) : IRequest<Result<PurchaseInvoiceDto>>;

public record MarkInvoiceAsPaidCommand(Guid Id) : IRequest<Result<PurchaseInvoiceDto>>;

public record CancelPurchaseInvoiceCommand(Guid Id, string Reason) : IRequest<Result<PurchaseInvoiceDto>>;

public record SetEInvoiceInfoCommand(Guid Id, string EInvoiceId, string EInvoiceUUID) : IRequest<Result<PurchaseInvoiceDto>>;

public record DeletePurchaseInvoiceCommand(Guid Id) : IRequest<Result>;
