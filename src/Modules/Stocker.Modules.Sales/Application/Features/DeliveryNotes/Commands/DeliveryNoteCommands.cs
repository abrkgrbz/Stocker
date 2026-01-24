using MediatR;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Features.DeliveryNotes.Commands;

public record CreateDeliveryNoteCommand(CreateDeliveryNoteDto Dto) : IRequest<Result<DeliveryNoteDto>>;

public record ApproveDeliveryNoteCommand(Guid Id) : IRequest<Result<DeliveryNoteDto>>;

public record DispatchDeliveryNoteCommand(Guid Id, DispatchDeliveryNoteDto Dto) : IRequest<Result<DeliveryNoteDto>>;

public record DeliverDeliveryNoteCommand(Guid Id, DeliverDeliveryNoteDto Dto) : IRequest<Result<DeliveryNoteDto>>;

public record CancelDeliveryNoteCommand(Guid Id, CancelDeliveryNoteDto Dto) : IRequest<Result>;

public record PrintDeliveryNoteCommand(Guid Id) : IRequest<Result<DeliveryNoteDto>>;

public record AddDeliveryNoteItemCommand(Guid DeliveryNoteId, CreateDeliveryNoteItemDto Dto) : IRequest<Result<DeliveryNoteItemDto>>;

public record LinkInvoiceCommand(Guid DeliveryNoteId, Guid InvoiceId, string InvoiceNumber) : IRequest<Result>;
