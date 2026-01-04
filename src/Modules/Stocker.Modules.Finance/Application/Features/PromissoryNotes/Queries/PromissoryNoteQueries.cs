using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Finance.Application.DTOs;
using Stocker.Modules.Finance.Application.Features.PromissoryNotes.Commands;
using Stocker.Modules.Finance.Domain.Entities;
using Stocker.Modules.Finance.Domain.Enums;
using Stocker.Modules.Finance.Interfaces;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Finance.Application.Features.PromissoryNotes.Queries;

#region Get Promissory Notes (Paginated)

/// <summary>
/// Sayfalanmis senet listesi sorgusu (Get Paginated Promissory Notes Query)
/// </summary>
public class GetPromissoryNotesQuery : IRequest<Result<PagedResult<PromissoryNoteSummaryDto>>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public PromissoryNoteFilterDto? Filter { get; set; }
    public string? SortBy { get; set; }
    public bool SortDescending { get; set; }
}

/// <summary>
/// Handler for GetPromissoryNotesQuery
/// </summary>
public class GetPromissoryNotesQueryHandler : IRequestHandler<GetPromissoryNotesQuery, Result<PagedResult<PromissoryNoteSummaryDto>>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetPromissoryNotesQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PagedResult<PromissoryNoteSummaryDto>>> Handle(GetPromissoryNotesQuery request, CancellationToken cancellationToken)
    {
        var dbContext = GetDbContext();
        var query = dbContext.Set<PromissoryNote>().AsQueryable();

        // Apply filters
        if (request.Filter != null)
        {
            // Search term
            if (!string.IsNullOrEmpty(request.Filter.SearchTerm))
            {
                var searchTerm = request.Filter.SearchTerm.ToLower();
                query = query.Where(n =>
                    n.NoteNumber.ToLower().Contains(searchTerm) ||
                    n.PortfolioNumber.ToLower().Contains(searchTerm) ||
                    n.DebtorName.ToLower().Contains(searchTerm) ||
                    (n.CurrentAccountName != null && n.CurrentAccountName.ToLower().Contains(searchTerm)) ||
                    (n.SerialNumber != null && n.SerialNumber.ToLower().Contains(searchTerm)));
            }

            // Direction filter
            if (request.Filter.Direction.HasValue)
            {
                query = query.Where(n => n.Direction == request.Filter.Direction.Value);
            }

            // Note type filter
            if (request.Filter.NoteType.HasValue)
            {
                query = query.Where(n => n.NoteType == request.Filter.NoteType.Value);
            }

            // Status filter
            if (request.Filter.Status.HasValue)
            {
                query = query.Where(n => n.Status == request.Filter.Status.Value);
            }

            // Current account filter
            if (request.Filter.CurrentAccountId.HasValue)
            {
                query = query.Where(n => n.CurrentAccountId == request.Filter.CurrentAccountId.Value);
            }

            // Due date range filter
            if (request.Filter.DueDateStart.HasValue)
            {
                query = query.Where(n => n.DueDate >= request.Filter.DueDateStart.Value);
            }

            if (request.Filter.DueDateEnd.HasValue)
            {
                query = query.Where(n => n.DueDate <= request.Filter.DueDateEnd.Value);
            }

            // Registration date range filter
            if (request.Filter.RegistrationDateStart.HasValue)
            {
                query = query.Where(n => n.RegistrationDate >= request.Filter.RegistrationDateStart.Value);
            }

            if (request.Filter.RegistrationDateEnd.HasValue)
            {
                query = query.Where(n => n.RegistrationDate <= request.Filter.RegistrationDateEnd.Value);
            }

            // Overdue filter
            if (request.Filter.IsOverdue.HasValue && request.Filter.IsOverdue.Value)
            {
                var today = DateTime.UtcNow.Date;
                query = query.Where(n => n.DueDate < today && n.Status == NegotiableInstrumentStatus.InPortfolio);
            }

            // Status flags
            if (request.Filter.IsGivenToBank.HasValue)
            {
                query = query.Where(n => n.IsGivenToBank == request.Filter.IsGivenToBank.Value);
            }

            if (request.Filter.IsEndorsed.HasValue)
            {
                query = query.Where(n => n.IsEndorsed == request.Filter.IsEndorsed.Value);
            }

            if (request.Filter.IsGivenAsCollateral.HasValue)
            {
                query = query.Where(n => n.IsGivenAsCollateral == request.Filter.IsGivenAsCollateral.Value);
            }

            if (request.Filter.IsProtested.HasValue)
            {
                query = query.Where(n => n.IsProtested == request.Filter.IsProtested.Value);
            }

            // Currency filter
            if (!string.IsNullOrEmpty(request.Filter.Currency))
            {
                query = query.Where(n => n.Currency == request.Filter.Currency);
            }

            // Amount range filter
            if (request.Filter.MinAmount.HasValue)
            {
                query = query.Where(n => n.Amount.Amount >= request.Filter.MinAmount.Value);
            }

            if (request.Filter.MaxAmount.HasValue)
            {
                query = query.Where(n => n.Amount.Amount <= request.Filter.MaxAmount.Value);
            }
        }

        // Get total count
        var totalCount = await query.CountAsync(cancellationToken);

        // Apply sorting
        var sortBy = request.SortBy ?? "DueDate";
        var sortDesc = request.SortDescending;

        query = sortBy.ToLower() switch
        {
            "notenumber" => sortDesc ? query.OrderByDescending(n => n.NoteNumber) : query.OrderBy(n => n.NoteNumber),
            "portfolionumber" => sortDesc ? query.OrderByDescending(n => n.PortfolioNumber) : query.OrderBy(n => n.PortfolioNumber),
            "amount" => sortDesc ? query.OrderByDescending(n => n.Amount.Amount) : query.OrderBy(n => n.Amount.Amount),
            "debtorname" => sortDesc ? query.OrderByDescending(n => n.DebtorName) : query.OrderBy(n => n.DebtorName),
            "registrationdate" => sortDesc ? query.OrderByDescending(n => n.RegistrationDate) : query.OrderBy(n => n.RegistrationDate),
            "status" => sortDesc ? query.OrderByDescending(n => n.Status) : query.OrderBy(n => n.Status),
            _ => sortDesc ? query.OrderByDescending(n => n.DueDate) : query.OrderBy(n => n.DueDate)
        };

        // Apply pagination
        var pageNumber = request.PageNumber;
        var pageSize = request.PageSize;

        var notes = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var dtos = notes.Select(CreateReceivedNoteCommandHandler.MapToSummaryDto).ToList();

        return Result<PagedResult<PromissoryNoteSummaryDto>>.Success(
            new PagedResult<PromissoryNoteSummaryDto>(dtos, totalCount, pageNumber, pageSize));
    }

    private DbContext GetDbContext()
    {
        return (_unitOfWork as dynamic).Context as DbContext
            ?? throw new InvalidOperationException("DbContext'e erisilemedi");
    }
}

#endregion

#region Get Promissory Note By Id

/// <summary>
/// ID ile senet sorgulama (Get Promissory Note By Id Query)
/// </summary>
public class GetPromissoryNoteByIdQuery : IRequest<Result<PromissoryNoteDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

/// <summary>
/// Handler for GetPromissoryNoteByIdQuery
/// </summary>
public class GetPromissoryNoteByIdQueryHandler : IRequestHandler<GetPromissoryNoteByIdQuery, Result<PromissoryNoteDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetPromissoryNoteByIdQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PromissoryNoteDto>> Handle(GetPromissoryNoteByIdQuery request, CancellationToken cancellationToken)
    {
        var dbContext = GetDbContext();
        var note = await dbContext.Set<PromissoryNote>()
            .Include(n => n.Movements)
            .Include(n => n.CurrentAccount)
            .Include(n => n.EndorsedToCurrentAccount)
            .Include(n => n.CollectionBankAccount)
            .FirstOrDefaultAsync(n => n.Id == request.Id, cancellationToken);

        if (note == null)
        {
            return Result<PromissoryNoteDto>.Failure(
                Error.NotFound("PromissoryNote", $"ID {request.Id} ile senet bulunamadi"));
        }

        var dto = CreateReceivedNoteCommandHandler.MapToDto(note);
        return Result<PromissoryNoteDto>.Success(dto);
    }

    private DbContext GetDbContext()
    {
        return (_unitOfWork as dynamic).Context as DbContext
            ?? throw new InvalidOperationException("DbContext'e erisilemedi");
    }
}

#endregion

#region Get Promissory Notes By Status

/// <summary>
/// Duruma gore senet listesi sorgulama (Get Promissory Notes By Status Query)
/// </summary>
public class GetPromissoryNotesByStatusQuery : IRequest<Result<List<PromissoryNoteSummaryDto>>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public NegotiableInstrumentStatus Status { get; set; }
    public MovementDirection? Direction { get; set; }
}

/// <summary>
/// Handler for GetPromissoryNotesByStatusQuery
/// </summary>
public class GetPromissoryNotesByStatusQueryHandler : IRequestHandler<GetPromissoryNotesByStatusQuery, Result<List<PromissoryNoteSummaryDto>>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetPromissoryNotesByStatusQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<List<PromissoryNoteSummaryDto>>> Handle(GetPromissoryNotesByStatusQuery request, CancellationToken cancellationToken)
    {
        var dbContext = GetDbContext();
        var query = dbContext.Set<PromissoryNote>()
            .Where(n => n.Status == request.Status);

        if (request.Direction.HasValue)
        {
            query = query.Where(n => n.Direction == request.Direction.Value);
        }

        var notes = await query
            .OrderBy(n => n.DueDate)
            .ToListAsync(cancellationToken);

        var dtos = notes.Select(CreateReceivedNoteCommandHandler.MapToSummaryDto).ToList();

        return Result<List<PromissoryNoteSummaryDto>>.Success(dtos);
    }

    private DbContext GetDbContext()
    {
        return (_unitOfWork as dynamic).Context as DbContext
            ?? throw new InvalidOperationException("DbContext'e erisilemedi");
    }
}

#endregion

#region Get Promissory Notes By Due Date Range

/// <summary>
/// Vade tarihine gore senet listesi sorgulama (Get Promissory Notes By Due Date Range Query)
/// </summary>
public class GetPromissoryNotesByDueDateRangeQuery : IRequest<Result<List<PromissoryNoteSummaryDto>>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public MovementDirection? Direction { get; set; }
    public NegotiableInstrumentStatus? Status { get; set; }
}

/// <summary>
/// Handler for GetPromissoryNotesByDueDateRangeQuery
/// </summary>
public class GetPromissoryNotesByDueDateRangeQueryHandler : IRequestHandler<GetPromissoryNotesByDueDateRangeQuery, Result<List<PromissoryNoteSummaryDto>>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetPromissoryNotesByDueDateRangeQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<List<PromissoryNoteSummaryDto>>> Handle(GetPromissoryNotesByDueDateRangeQuery request, CancellationToken cancellationToken)
    {
        var dbContext = GetDbContext();
        var query = dbContext.Set<PromissoryNote>()
            .Where(n => n.DueDate >= request.StartDate && n.DueDate <= request.EndDate);

        if (request.Direction.HasValue)
        {
            query = query.Where(n => n.Direction == request.Direction.Value);
        }

        if (request.Status.HasValue)
        {
            query = query.Where(n => n.Status == request.Status.Value);
        }

        var notes = await query
            .OrderBy(n => n.DueDate)
            .ToListAsync(cancellationToken);

        var dtos = notes.Select(CreateReceivedNoteCommandHandler.MapToSummaryDto).ToList();

        return Result<List<PromissoryNoteSummaryDto>>.Success(dtos);
    }

    private DbContext GetDbContext()
    {
        return (_unitOfWork as dynamic).Context as DbContext
            ?? throw new InvalidOperationException("DbContext'e erisilemedi");
    }
}

#endregion

#region Get Overdue Promissory Notes

/// <summary>
/// Vadesi gecmis senet listesi sorgulama (Get Overdue Promissory Notes Query)
/// </summary>
public class GetOverduePromissoryNotesQuery : IRequest<Result<List<PromissoryNoteSummaryDto>>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public MovementDirection? Direction { get; set; }
}

/// <summary>
/// Handler for GetOverduePromissoryNotesQuery
/// </summary>
public class GetOverduePromissoryNotesQueryHandler : IRequestHandler<GetOverduePromissoryNotesQuery, Result<List<PromissoryNoteSummaryDto>>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetOverduePromissoryNotesQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<List<PromissoryNoteSummaryDto>>> Handle(GetOverduePromissoryNotesQuery request, CancellationToken cancellationToken)
    {
        var dbContext = GetDbContext();
        var today = DateTime.UtcNow.Date;

        var query = dbContext.Set<PromissoryNote>()
            .Where(n => n.DueDate < today && n.Status == NegotiableInstrumentStatus.InPortfolio);

        if (request.Direction.HasValue)
        {
            query = query.Where(n => n.Direction == request.Direction.Value);
        }

        var notes = await query
            .OrderBy(n => n.DueDate)
            .ToListAsync(cancellationToken);

        var dtos = notes.Select(CreateReceivedNoteCommandHandler.MapToSummaryDto).ToList();

        return Result<List<PromissoryNoteSummaryDto>>.Success(dtos);
    }

    private DbContext GetDbContext()
    {
        return (_unitOfWork as dynamic).Context as DbContext
            ?? throw new InvalidOperationException("DbContext'e erisilemedi");
    }
}

#endregion

#region Get Promissory Notes By Current Account

/// <summary>
/// Cari hesaba gore senet listesi sorgulama (Get Promissory Notes By Current Account Query)
/// </summary>
public class GetPromissoryNotesByCurrentAccountQuery : IRequest<Result<List<PromissoryNoteSummaryDto>>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int CurrentAccountId { get; set; }
    public MovementDirection? Direction { get; set; }
    public NegotiableInstrumentStatus? Status { get; set; }
}

/// <summary>
/// Handler for GetPromissoryNotesByCurrentAccountQuery
/// </summary>
public class GetPromissoryNotesByCurrentAccountQueryHandler : IRequestHandler<GetPromissoryNotesByCurrentAccountQuery, Result<List<PromissoryNoteSummaryDto>>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetPromissoryNotesByCurrentAccountQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<List<PromissoryNoteSummaryDto>>> Handle(GetPromissoryNotesByCurrentAccountQuery request, CancellationToken cancellationToken)
    {
        // Validate current account exists
        var currentAccount = await _unitOfWork.CurrentAccounts.GetByIdAsync(request.CurrentAccountId, cancellationToken);
        if (currentAccount == null)
        {
            return Result<List<PromissoryNoteSummaryDto>>.Failure(
                Error.NotFound("CurrentAccount", $"ID {request.CurrentAccountId} ile cari hesap bulunamadi"));
        }

        var dbContext = GetDbContext();
        var query = dbContext.Set<PromissoryNote>()
            .Where(n => n.CurrentAccountId == request.CurrentAccountId);

        if (request.Direction.HasValue)
        {
            query = query.Where(n => n.Direction == request.Direction.Value);
        }

        if (request.Status.HasValue)
        {
            query = query.Where(n => n.Status == request.Status.Value);
        }

        var notes = await query
            .OrderByDescending(n => n.DueDate)
            .ToListAsync(cancellationToken);

        var dtos = notes.Select(CreateReceivedNoteCommandHandler.MapToSummaryDto).ToList();

        return Result<List<PromissoryNoteSummaryDto>>.Success(dtos);
    }

    private DbContext GetDbContext()
    {
        return (_unitOfWork as dynamic).Context as DbContext
            ?? throw new InvalidOperationException("DbContext'e erisilemedi");
    }
}

#endregion

#region Get Promissory Note By Number

/// <summary>
/// Numara ile senet sorgulama (Get Promissory Note By Number Query)
/// </summary>
public class GetPromissoryNoteByNumberQuery : IRequest<Result<PromissoryNoteDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public string NoteNumber { get; set; } = string.Empty;
}

/// <summary>
/// Handler for GetPromissoryNoteByNumberQuery
/// </summary>
public class GetPromissoryNoteByNumberQueryHandler : IRequestHandler<GetPromissoryNoteByNumberQuery, Result<PromissoryNoteDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetPromissoryNoteByNumberQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PromissoryNoteDto>> Handle(GetPromissoryNoteByNumberQuery request, CancellationToken cancellationToken)
    {
        var dbContext = GetDbContext();
        var note = await dbContext.Set<PromissoryNote>()
            .Include(n => n.Movements)
            .Include(n => n.CurrentAccount)
            .Include(n => n.EndorsedToCurrentAccount)
            .Include(n => n.CollectionBankAccount)
            .FirstOrDefaultAsync(n => n.NoteNumber == request.NoteNumber, cancellationToken);

        if (note == null)
        {
            return Result<PromissoryNoteDto>.Failure(
                Error.NotFound("PromissoryNote", $"Numara {request.NoteNumber} ile senet bulunamadi"));
        }

        var dto = CreateReceivedNoteCommandHandler.MapToDto(note);
        return Result<PromissoryNoteDto>.Success(dto);
    }

    private DbContext GetDbContext()
    {
        return (_unitOfWork as dynamic).Context as DbContext
            ?? throw new InvalidOperationException("DbContext'e erisilemedi");
    }
}

#endregion

#region Get Promissory Notes Due

/// <summary>
/// Vadesi gelen senet listesi sorgulama (Get Promissory Notes Due Query)
/// </summary>
public class GetPromissoryNotesDueQuery : IRequest<Result<List<PromissoryNoteSummaryDto>>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
}

/// <summary>
/// Handler for GetPromissoryNotesDueQuery
/// </summary>
public class GetPromissoryNotesDueQueryHandler : IRequestHandler<GetPromissoryNotesDueQuery, Result<List<PromissoryNoteSummaryDto>>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetPromissoryNotesDueQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<List<PromissoryNoteSummaryDto>>> Handle(GetPromissoryNotesDueQuery request, CancellationToken cancellationToken)
    {
        var dbContext = GetDbContext();
        var notes = await dbContext.Set<PromissoryNote>()
            .Where(n => n.DueDate >= request.StartDate && n.DueDate <= request.EndDate)
            .Where(n => n.Status == NegotiableInstrumentStatus.InPortfolio || n.Status == NegotiableInstrumentStatus.GivenToBank)
            .OrderBy(n => n.DueDate)
            .ToListAsync(cancellationToken);

        var dtos = notes.Select(CreateReceivedNoteCommandHandler.MapToSummaryDto).ToList();

        return Result<List<PromissoryNoteSummaryDto>>.Success(dtos);
    }

    private DbContext GetDbContext()
    {
        return (_unitOfWork as dynamic).Context as DbContext
            ?? throw new InvalidOperationException("DbContext'e erisilemedi");
    }
}

#endregion

#region Get Portfolio Summary

/// <summary>
/// Senet portfoy ozeti sorgulama (Get Portfolio Summary Query)
/// </summary>
public class GetPromissoryNotePortfolioSummaryQuery : IRequest<Result<PromissoryNotePortfolioSummaryDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
}

/// <summary>
/// Handler for GetPromissoryNotePortfolioSummaryQuery
/// </summary>
public class GetPromissoryNotePortfolioSummaryQueryHandler : IRequestHandler<GetPromissoryNotePortfolioSummaryQuery, Result<PromissoryNotePortfolioSummaryDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetPromissoryNotePortfolioSummaryQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PromissoryNotePortfolioSummaryDto>> Handle(GetPromissoryNotePortfolioSummaryQuery request, CancellationToken cancellationToken)
    {
        var dbContext = GetDbContext();
        var today = DateTime.UtcNow.Date;
        var weekEnd = today.AddDays(7);
        var monthEnd = today.AddDays(30);

        var notes = await dbContext.Set<PromissoryNote>()
            .ToListAsync(cancellationToken);

        var receivedNotes = notes.Where(n => n.Direction == MovementDirection.Inbound).ToList();
        var givenNotes = notes.Where(n => n.Direction == MovementDirection.Outbound).ToList();

        var summary = new PromissoryNotePortfolioSummaryDto
        {
            TotalNoteCount = notes.Count,
            ReceivedNoteCount = receivedNotes.Count,
            GivenNoteCount = givenNotes.Count,
            TotalReceivedAmount = receivedNotes.Sum(n => n.AmountTRY.Amount),
            TotalGivenAmount = givenNotes.Sum(n => n.AmountTRY.Amount),

            InPortfolioCount = notes.Count(n => n.Status == NegotiableInstrumentStatus.InPortfolio),
            TotalInPortfolioAmount = notes.Where(n => n.Status == NegotiableInstrumentStatus.InPortfolio).Sum(n => n.AmountTRY.Amount),

            InBankCount = notes.Count(n => n.Status == NegotiableInstrumentStatus.GivenToBank),
            TotalInBankAmount = notes.Where(n => n.Status == NegotiableInstrumentStatus.GivenToBank).Sum(n => n.AmountTRY.Amount),

            EndorsedCount = notes.Count(n => n.Status == NegotiableInstrumentStatus.Endorsed),
            CollectedCount = notes.Count(n => n.Status == NegotiableInstrumentStatus.Collected),
            ProtestedCount = notes.Count(n => n.Status == NegotiableInstrumentStatus.Protested),
            AsCollateralCount = notes.Count(n => n.IsGivenAsCollateral),

            OverdueNotesCount = notes.Count(n => n.DueDate < today && n.Status == NegotiableInstrumentStatus.InPortfolio),
            OverdueNotesAmount = notes.Where(n => n.DueDate < today && n.Status == NegotiableInstrumentStatus.InPortfolio).Sum(n => n.AmountTRY.Amount),

            NotesDueTodayCount = notes.Count(n => n.DueDate == today && n.Status == NegotiableInstrumentStatus.InPortfolio),
            NotesDueThisWeekCount = notes.Count(n => n.DueDate >= today && n.DueDate <= weekEnd && n.Status == NegotiableInstrumentStatus.InPortfolio),
            NotesDueThisMonthCount = notes.Count(n => n.DueDate >= today && n.DueDate <= monthEnd && n.Status == NegotiableInstrumentStatus.InPortfolio),

            Currency = "TRY"
        };

        return Result<PromissoryNotePortfolioSummaryDto>.Success(summary);
    }

    private DbContext GetDbContext()
    {
        return (_unitOfWork as dynamic).Context as DbContext
            ?? throw new InvalidOperationException("DbContext'e erisilemedi");
    }
}

#endregion
