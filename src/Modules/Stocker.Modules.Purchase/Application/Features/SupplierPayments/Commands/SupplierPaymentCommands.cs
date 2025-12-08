using MediatR;
using Stocker.Modules.Purchase.Application.DTOs;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Purchase.Application.Features.SupplierPayments.Commands;

public record CreateSupplierPaymentCommand(CreateSupplierPaymentDto Dto) : IRequest<Result<SupplierPaymentDto>>;

public record UpdateSupplierPaymentCommand(Guid Id, UpdateSupplierPaymentDto Dto) : IRequest<Result<SupplierPaymentDto>>;

public record SubmitSupplierPaymentCommand(Guid Id) : IRequest<Result<SupplierPaymentDto>>;

public record ApproveSupplierPaymentCommand(Guid Id, ApprovePaymentDto Dto) : IRequest<Result<SupplierPaymentDto>>;

public record RejectSupplierPaymentCommand(Guid Id, RejectPaymentDto Dto) : IRequest<Result<SupplierPaymentDto>>;

public record ProcessSupplierPaymentCommand(Guid Id, ProcessPaymentDto Dto) : IRequest<Result<SupplierPaymentDto>>;

public record CompleteSupplierPaymentCommand(Guid Id) : IRequest<Result<SupplierPaymentDto>>;

public record CancelSupplierPaymentCommand(Guid Id, string Reason) : IRequest<Result<SupplierPaymentDto>>;

public record ReverseSupplierPaymentCommand(Guid Id, string Reason) : IRequest<Result<SupplierPaymentDto>>;

public record ReconcileSupplierPaymentCommand(Guid Id, ReconcilePaymentDto Dto) : IRequest<Result<SupplierPaymentDto>>;

public record LinkPaymentToInvoiceCommand(Guid PaymentId, Guid InvoiceId, string? InvoiceNumber) : IRequest<Result<SupplierPaymentDto>>;

public record DeleteSupplierPaymentCommand(Guid Id) : IRequest<Result>;
