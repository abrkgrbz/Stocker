using MediatR;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Features.CreditNotes.Queries;

public record GetCreditNotesQuery : IRequest<Result<PagedResult<CreditNoteListDto>>>
{
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    public string? SearchTerm { get; init; }
    public string? Status { get; init; }
    public string? Type { get; init; }
    public string? Reason { get; init; }
    public Guid? CustomerId { get; init; }
    public Guid? InvoiceId { get; init; }
    public DateTime? FromDate { get; init; }
    public DateTime? ToDate { get; init; }
    public bool? IsApproved { get; init; }
    public string? SortBy { get; init; } = "CreditNoteDate";
    public bool SortDescending { get; init; } = true;
}

public record GetCreditNoteByIdQuery : IRequest<Result<CreditNoteDto>>
{
    public Guid Id { get; init; }
}

public record GetCreditNoteByNumberQuery : IRequest<Result<CreditNoteDto>>
{
    public string CreditNoteNumber { get; init; } = string.Empty;
}

public record GetCreditNoteStatisticsQuery : IRequest<Result<CreditNoteStatisticsDto>>
{
    public DateTime? FromDate { get; init; }
    public DateTime? ToDate { get; init; }
}

public record CreditNoteStatisticsDto
{
    public int TotalCreditNotes { get; init; }
    public int DraftCreditNotes { get; init; }
    public int PendingApprovalCreditNotes { get; init; }
    public int ApprovedCreditNotes { get; init; }
    public int IssuedCreditNotes { get; init; }
    public int AppliedCreditNotes { get; init; }
    public decimal TotalAmount { get; init; }
    public decimal AppliedAmount { get; init; }
    public decimal RemainingAmount { get; init; }
    public string Currency { get; init; } = "TRY";
}
