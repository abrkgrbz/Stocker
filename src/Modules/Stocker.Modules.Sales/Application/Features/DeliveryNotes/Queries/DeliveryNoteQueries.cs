using MediatR;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Domain.Entities;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Features.DeliveryNotes.Queries;

public record GetDeliveryNoteByIdQuery(Guid Id) : IRequest<Result<DeliveryNoteDto>>;

public record GetDeliveryNoteByNumberQuery(string DeliveryNoteNumber) : IRequest<Result<DeliveryNoteDto>>;

public record GetDeliveryNotesQuery(
    int Page = 1,
    int PageSize = 20,
    string? SearchTerm = null,
    DeliveryNoteStatus? Status = null,
    DeliveryNoteType? Type = null,
    DateTime? FromDate = null,
    DateTime? ToDate = null,
    string? SortBy = null,
    bool SortDescending = false
) : IRequest<Result<PagedResult<DeliveryNoteListDto>>>;

public record GetDeliveryNotesBySalesOrderQuery(Guid SalesOrderId) : IRequest<Result<List<DeliveryNoteListDto>>>;

public record GetDeliveryNotesByReceiverQuery(Guid ReceiverId) : IRequest<Result<List<DeliveryNoteListDto>>>;

public record GetDeliveryNotesByStatusQuery(DeliveryNoteStatus Status) : IRequest<Result<List<DeliveryNoteListDto>>>;
