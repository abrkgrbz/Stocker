using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Finance.Application.DTOs;
using Stocker.Modules.Finance.Application.Features.Checks.Commands;
using Stocker.Modules.Finance.Domain.Entities;
using Stocker.Modules.Finance.Domain.Enums;
using Stocker.Modules.Finance.Interfaces;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Finance.Application.Features.Checks.Queries;

#region Get Checks (Paginated)

/// <summary>
/// Sayfalanmış çek listesi sorgusu
/// </summary>
public class GetChecksQuery : IRequest<Result<PagedResult<CheckSummaryDto>>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public CheckFilterDto? Filter { get; set; }
    public string? SortBy { get; set; }
    public bool SortDescending { get; set; }
}

/// <summary>
/// Handler for GetChecksQuery
/// </summary>
public class GetChecksQueryHandler : IRequestHandler<GetChecksQuery, Result<PagedResult<CheckSummaryDto>>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetChecksQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PagedResult<CheckSummaryDto>>> Handle(GetChecksQuery request, CancellationToken cancellationToken)
    {
        var dbContext = GetDbContext();
        var query = dbContext.Set<Check>().AsQueryable();

        // Apply filters
        if (request.Filter != null)
        {
            if (!string.IsNullOrEmpty(request.Filter.SearchTerm))
            {
                var searchTerm = request.Filter.SearchTerm.ToLower();
                query = query.Where(c =>
                    c.CheckNumber.ToLower().Contains(searchTerm) ||
                    c.PortfolioNumber.ToLower().Contains(searchTerm) ||
                    c.DrawerName.ToLower().Contains(searchTerm) ||
                    c.BankName.ToLower().Contains(searchTerm) ||
                    (c.CurrentAccountName != null && c.CurrentAccountName.ToLower().Contains(searchTerm)));
            }

            if (request.Filter.CheckType.HasValue)
            {
                query = query.Where(c => c.CheckType == request.Filter.CheckType.Value);
            }

            if (request.Filter.Direction.HasValue)
            {
                query = query.Where(c => c.Direction == request.Filter.Direction.Value);
            }

            if (request.Filter.Status.HasValue)
            {
                query = query.Where(c => c.Status == request.Filter.Status.Value);
            }

            if (request.Filter.CurrentAccountId.HasValue)
            {
                query = query.Where(c => c.CurrentAccountId == request.Filter.CurrentAccountId.Value);
            }

            if (request.Filter.DueDateStart.HasValue)
            {
                query = query.Where(c => c.DueDate >= request.Filter.DueDateStart.Value);
            }

            if (request.Filter.DueDateEnd.HasValue)
            {
                query = query.Where(c => c.DueDate <= request.Filter.DueDateEnd.Value);
            }

            if (request.Filter.RegistrationDateStart.HasValue)
            {
                query = query.Where(c => c.RegistrationDate >= request.Filter.RegistrationDateStart.Value);
            }

            if (request.Filter.RegistrationDateEnd.HasValue)
            {
                query = query.Where(c => c.RegistrationDate <= request.Filter.RegistrationDateEnd.Value);
            }

            if (request.Filter.IsGivenToBank.HasValue)
            {
                query = query.Where(c => c.IsGivenToBank == request.Filter.IsGivenToBank.Value);
            }

            if (request.Filter.IsEndorsed.HasValue)
            {
                query = query.Where(c => c.IsEndorsed == request.Filter.IsEndorsed.Value);
            }

            if (request.Filter.IsBounced.HasValue)
            {
                query = query.Where(c => c.IsBounced == request.Filter.IsBounced.Value);
            }
        }

        // Get total count
        var totalCount = await query.CountAsync(cancellationToken);

        // Apply sorting
        var sortBy = request.Filter?.SortBy ?? "DueDate";
        var sortDesc = request.Filter?.SortDescending ?? true;

        query = sortBy.ToLower() switch
        {
            "checknumber" => sortDesc ? query.OrderByDescending(c => c.CheckNumber) : query.OrderBy(c => c.CheckNumber),
            "portfolionumber" => sortDesc ? query.OrderByDescending(c => c.PortfolioNumber) : query.OrderBy(c => c.PortfolioNumber),
            "amount" => sortDesc ? query.OrderByDescending(c => c.Amount.Amount) : query.OrderBy(c => c.Amount.Amount),
            "bankname" => sortDesc ? query.OrderByDescending(c => c.BankName) : query.OrderBy(c => c.BankName),
            "drawername" => sortDesc ? query.OrderByDescending(c => c.DrawerName) : query.OrderBy(c => c.DrawerName),
            "registrationdate" => sortDesc ? query.OrderByDescending(c => c.RegistrationDate) : query.OrderBy(c => c.RegistrationDate),
            "status" => sortDesc ? query.OrderByDescending(c => c.Status) : query.OrderBy(c => c.Status),
            _ => sortDesc ? query.OrderByDescending(c => c.DueDate) : query.OrderBy(c => c.DueDate)
        };

        // Apply pagination
        var pageNumber = request.Filter?.PageNumber ?? 1;
        var pageSize = request.Filter?.PageSize ?? 20;
        var checks = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var dtos = checks.Select(CheckDtoMapper.MapToSummaryDto).ToList();

        return Result<PagedResult<CheckSummaryDto>>.Success(
            new PagedResult<CheckSummaryDto>(dtos, totalCount, pageNumber, pageSize));
    }

    private DbContext GetDbContext()
    {
        return (_unitOfWork as dynamic).Context as DbContext
            ?? throw new InvalidOperationException("DbContext'e erişilemedi");
    }
}

#endregion

#region Get Check By Id

/// <summary>
/// ID ile çek sorgulama
/// </summary>
public class GetCheckByIdQuery : IRequest<Result<CheckDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

/// <summary>
/// Handler for GetCheckByIdQuery
/// </summary>
public class GetCheckByIdQueryHandler : IRequestHandler<GetCheckByIdQuery, Result<CheckDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetCheckByIdQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<CheckDto>> Handle(GetCheckByIdQuery request, CancellationToken cancellationToken)
    {
        var dbContext = GetDbContext();
        var check = await dbContext.Set<Check>()
            .Include(c => c.Movements)
            .Include(c => c.CurrentAccount)
            .Include(c => c.EndorsedToCurrentAccount)
            .Include(c => c.CollectionBankAccount)
            .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);

        if (check == null)
        {
            return Result<CheckDto>.Failure(
                Error.NotFound("Check", $"ID {request.Id} ile çek bulunamadı"));
        }

        var dto = CheckDtoMapper.MapToDto(check);
        return Result<CheckDto>.Success(dto);
    }

    private DbContext GetDbContext()
    {
        return (_unitOfWork as dynamic).Context as DbContext
            ?? throw new InvalidOperationException("DbContext'e erişilemedi");
    }
}

#endregion

#region Get Checks By Status

/// <summary>
/// Duruma göre çek listesi sorgusu
/// </summary>
public class GetChecksByStatusQuery : IRequest<Result<List<CheckSummaryDto>>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public NegotiableInstrumentStatus Status { get; set; }
}

/// <summary>
/// Handler for GetChecksByStatusQuery
/// </summary>
public class GetChecksByStatusQueryHandler : IRequestHandler<GetChecksByStatusQuery, Result<List<CheckSummaryDto>>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetChecksByStatusQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<List<CheckSummaryDto>>> Handle(GetChecksByStatusQuery request, CancellationToken cancellationToken)
    {
        var dbContext = GetDbContext();
        var checks = await dbContext.Set<Check>()
            .Where(c => c.Status == request.Status)
            .OrderBy(c => c.DueDate)
            .ToListAsync(cancellationToken);

        var dtos = checks.Select(CheckDtoMapper.MapToSummaryDto).ToList();
        return Result<List<CheckSummaryDto>>.Success(dtos);
    }

    private DbContext GetDbContext()
    {
        return (_unitOfWork as dynamic).Context as DbContext
            ?? throw new InvalidOperationException("DbContext'e erişilemedi");
    }
}

#endregion

#region Get Checks By Due Date Range

/// <summary>
/// Vade tarih aralığına göre çek listesi sorgusu
/// </summary>
public class GetChecksByDueDateRangeQuery : IRequest<Result<List<CheckSummaryDto>>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public MovementDirection? Direction { get; set; }
}

/// <summary>
/// Handler for GetChecksByDueDateRangeQuery
/// </summary>
public class GetChecksByDueDateRangeQueryHandler : IRequestHandler<GetChecksByDueDateRangeQuery, Result<List<CheckSummaryDto>>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetChecksByDueDateRangeQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<List<CheckSummaryDto>>> Handle(GetChecksByDueDateRangeQuery request, CancellationToken cancellationToken)
    {
        var dbContext = GetDbContext();
        var query = dbContext.Set<Check>()
            .Where(c => c.DueDate >= request.StartDate && c.DueDate <= request.EndDate);

        if (request.Direction.HasValue)
        {
            query = query.Where(c => c.Direction == request.Direction.Value);
        }

        var checks = await query
            .OrderBy(c => c.DueDate)
            .ToListAsync(cancellationToken);

        var dtos = checks.Select(CheckDtoMapper.MapToSummaryDto).ToList();
        return Result<List<CheckSummaryDto>>.Success(dtos);
    }

    private DbContext GetDbContext()
    {
        return (_unitOfWork as dynamic).Context as DbContext
            ?? throw new InvalidOperationException("DbContext'e erişilemedi");
    }
}

#endregion

#region Get Received Checks

/// <summary>
/// Alınan çekler sorgusu
/// </summary>
public class GetReceivedChecksQuery : IRequest<Result<PagedResult<CheckSummaryDto>>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public CheckFilterDto? Filter { get; set; }
}

/// <summary>
/// Handler for GetReceivedChecksQuery
/// </summary>
public class GetReceivedChecksQueryHandler : IRequestHandler<GetReceivedChecksQuery, Result<PagedResult<CheckSummaryDto>>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetReceivedChecksQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PagedResult<CheckSummaryDto>>> Handle(GetReceivedChecksQuery request, CancellationToken cancellationToken)
    {
        var dbContext = GetDbContext();
        var query = dbContext.Set<Check>()
            .Where(c => c.Direction == MovementDirection.Inbound);

        // Apply filters
        if (request.Filter != null)
        {
            if (!string.IsNullOrEmpty(request.Filter.SearchTerm))
            {
                var searchTerm = request.Filter.SearchTerm.ToLower();
                query = query.Where(c =>
                    c.CheckNumber.ToLower().Contains(searchTerm) ||
                    c.PortfolioNumber.ToLower().Contains(searchTerm) ||
                    c.DrawerName.ToLower().Contains(searchTerm) ||
                    c.BankName.ToLower().Contains(searchTerm) ||
                    (c.CurrentAccountName != null && c.CurrentAccountName.ToLower().Contains(searchTerm)));
            }

            if (request.Filter.Status.HasValue)
            {
                query = query.Where(c => c.Status == request.Filter.Status.Value);
            }

            if (request.Filter.CurrentAccountId.HasValue)
            {
                query = query.Where(c => c.CurrentAccountId == request.Filter.CurrentAccountId.Value);
            }

            if (request.Filter.DueDateStart.HasValue)
            {
                query = query.Where(c => c.DueDate >= request.Filter.DueDateStart.Value);
            }

            if (request.Filter.DueDateEnd.HasValue)
            {
                query = query.Where(c => c.DueDate <= request.Filter.DueDateEnd.Value);
            }

            if (request.Filter.IsGivenToBank.HasValue)
            {
                query = query.Where(c => c.IsGivenToBank == request.Filter.IsGivenToBank.Value);
            }

            if (request.Filter.IsEndorsed.HasValue)
            {
                query = query.Where(c => c.IsEndorsed == request.Filter.IsEndorsed.Value);
            }

            if (request.Filter.IsBounced.HasValue)
            {
                query = query.Where(c => c.IsBounced == request.Filter.IsBounced.Value);
            }
        }

        // Get total count
        var totalCount = await query.CountAsync(cancellationToken);

        // Apply sorting
        var sortBy = request.Filter?.SortBy ?? "DueDate";
        var sortDesc = request.Filter?.SortDescending ?? true;

        query = sortBy.ToLower() switch
        {
            "checknumber" => sortDesc ? query.OrderByDescending(c => c.CheckNumber) : query.OrderBy(c => c.CheckNumber),
            "amount" => sortDesc ? query.OrderByDescending(c => c.Amount.Amount) : query.OrderBy(c => c.Amount.Amount),
            "bankname" => sortDesc ? query.OrderByDescending(c => c.BankName) : query.OrderBy(c => c.BankName),
            "drawername" => sortDesc ? query.OrderByDescending(c => c.DrawerName) : query.OrderBy(c => c.DrawerName),
            "status" => sortDesc ? query.OrderByDescending(c => c.Status) : query.OrderBy(c => c.Status),
            _ => sortDesc ? query.OrderByDescending(c => c.DueDate) : query.OrderBy(c => c.DueDate)
        };

        // Apply pagination
        var pageNumber = request.Filter?.PageNumber ?? 1;
        var pageSize = request.Filter?.PageSize ?? 20;
        var checks = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var dtos = checks.Select(CheckDtoMapper.MapToSummaryDto).ToList();

        return Result<PagedResult<CheckSummaryDto>>.Success(
            new PagedResult<CheckSummaryDto>(dtos, totalCount, pageNumber, pageSize));
    }

    private DbContext GetDbContext()
    {
        return (_unitOfWork as dynamic).Context as DbContext
            ?? throw new InvalidOperationException("DbContext'e erişilemedi");
    }
}

#endregion

#region Get Given Checks

/// <summary>
/// Verilen çekler sorgusu
/// </summary>
public class GetGivenChecksQuery : IRequest<Result<PagedResult<CheckSummaryDto>>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public CheckFilterDto? Filter { get; set; }
}

/// <summary>
/// Handler for GetGivenChecksQuery
/// </summary>
public class GetGivenChecksQueryHandler : IRequestHandler<GetGivenChecksQuery, Result<PagedResult<CheckSummaryDto>>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetGivenChecksQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PagedResult<CheckSummaryDto>>> Handle(GetGivenChecksQuery request, CancellationToken cancellationToken)
    {
        var dbContext = GetDbContext();
        var query = dbContext.Set<Check>()
            .Where(c => c.Direction == MovementDirection.Outbound);

        // Apply filters
        if (request.Filter != null)
        {
            if (!string.IsNullOrEmpty(request.Filter.SearchTerm))
            {
                var searchTerm = request.Filter.SearchTerm.ToLower();
                query = query.Where(c =>
                    c.CheckNumber.ToLower().Contains(searchTerm) ||
                    c.PortfolioNumber.ToLower().Contains(searchTerm) ||
                    c.DrawerName.ToLower().Contains(searchTerm) ||
                    c.BankName.ToLower().Contains(searchTerm) ||
                    (c.CurrentAccountName != null && c.CurrentAccountName.ToLower().Contains(searchTerm)));
            }

            if (request.Filter.Status.HasValue)
            {
                query = query.Where(c => c.Status == request.Filter.Status.Value);
            }

            if (request.Filter.CurrentAccountId.HasValue)
            {
                query = query.Where(c => c.CurrentAccountId == request.Filter.CurrentAccountId.Value);
            }

            if (request.Filter.DueDateStart.HasValue)
            {
                query = query.Where(c => c.DueDate >= request.Filter.DueDateStart.Value);
            }

            if (request.Filter.DueDateEnd.HasValue)
            {
                query = query.Where(c => c.DueDate <= request.Filter.DueDateEnd.Value);
            }

            if (request.Filter.IsBounced.HasValue)
            {
                query = query.Where(c => c.IsBounced == request.Filter.IsBounced.Value);
            }
        }

        // Get total count
        var totalCount = await query.CountAsync(cancellationToken);

        // Apply sorting
        var sortBy = request.Filter?.SortBy ?? "DueDate";
        var sortDesc = request.Filter?.SortDescending ?? true;

        query = sortBy.ToLower() switch
        {
            "checknumber" => sortDesc ? query.OrderByDescending(c => c.CheckNumber) : query.OrderBy(c => c.CheckNumber),
            "amount" => sortDesc ? query.OrderByDescending(c => c.Amount.Amount) : query.OrderBy(c => c.Amount.Amount),
            "bankname" => sortDesc ? query.OrderByDescending(c => c.BankName) : query.OrderBy(c => c.BankName),
            "status" => sortDesc ? query.OrderByDescending(c => c.Status) : query.OrderBy(c => c.Status),
            _ => sortDesc ? query.OrderByDescending(c => c.DueDate) : query.OrderBy(c => c.DueDate)
        };

        // Apply pagination
        var pageNumber = request.Filter?.PageNumber ?? 1;
        var pageSize = request.Filter?.PageSize ?? 20;
        var checks = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var dtos = checks.Select(CheckDtoMapper.MapToSummaryDto).ToList();

        return Result<PagedResult<CheckSummaryDto>>.Success(
            new PagedResult<CheckSummaryDto>(dtos, totalCount, pageNumber, pageSize));
    }

    private DbContext GetDbContext()
    {
        return (_unitOfWork as dynamic).Context as DbContext
            ?? throw new InvalidOperationException("DbContext'e erişilemedi");
    }
}

#endregion

#region Get Check By Number

/// <summary>
/// Çek numarasına göre çek sorgulama
/// </summary>
public class GetCheckByNumberQuery : IRequest<Result<CheckDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public string CheckNumber { get; set; } = string.Empty;
}

/// <summary>
/// Handler for GetCheckByNumberQuery
/// </summary>
public class GetCheckByNumberQueryHandler : IRequestHandler<GetCheckByNumberQuery, Result<CheckDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetCheckByNumberQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<CheckDto>> Handle(GetCheckByNumberQuery request, CancellationToken cancellationToken)
    {
        var dbContext = GetDbContext();
        var check = await dbContext.Set<Check>()
            .Include(c => c.Movements)
            .FirstOrDefaultAsync(c => c.CheckNumber == request.CheckNumber, cancellationToken);

        if (check == null)
        {
            return Result<CheckDto>.Failure(
                Error.NotFound("Check", $"'{request.CheckNumber}' numaralı çek bulunamadı"));
        }

        var dto = CheckDtoMapper.MapToDto(check);
        return Result<CheckDto>.Success(dto);
    }

    private DbContext GetDbContext()
    {
        return (_unitOfWork as dynamic).Context as DbContext
            ?? throw new InvalidOperationException("DbContext'e erişilemedi");
    }
}

#endregion

#region Get Checks Due

/// <summary>
/// Vadesi gelen çekler sorgusu
/// </summary>
public class GetChecksDueQuery : IRequest<Result<List<CheckSummaryDto>>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
}

/// <summary>
/// Handler for GetChecksDueQuery
/// </summary>
public class GetChecksDueQueryHandler : IRequestHandler<GetChecksDueQuery, Result<List<CheckSummaryDto>>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetChecksDueQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<List<CheckSummaryDto>>> Handle(GetChecksDueQuery request, CancellationToken cancellationToken)
    {
        var dbContext = GetDbContext();
        var checks = await dbContext.Set<Check>()
            .Where(c => c.DueDate >= request.StartDate && c.DueDate <= request.EndDate)
            .Where(c => c.Status == NegotiableInstrumentStatus.InPortfolio || c.Status == NegotiableInstrumentStatus.GivenToBank)
            .OrderBy(c => c.DueDate)
            .ToListAsync(cancellationToken);

        var dtos = checks.Select(CheckDtoMapper.MapToSummaryDto).ToList();
        return Result<List<CheckSummaryDto>>.Success(dtos);
    }

    private DbContext GetDbContext()
    {
        return (_unitOfWork as dynamic).Context as DbContext
            ?? throw new InvalidOperationException("DbContext'e erişilemedi");
    }
}

#endregion

#region Get Check Portfolio Summary

/// <summary>
/// Çek portföy özeti sorgusu
/// </summary>
public class GetCheckPortfolioSummaryQuery : IRequest<Result<CheckPortfolioSummaryDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
}

/// <summary>
/// Handler for GetCheckPortfolioSummaryQuery
/// </summary>
public class GetCheckPortfolioSummaryQueryHandler : IRequestHandler<GetCheckPortfolioSummaryQuery, Result<CheckPortfolioSummaryDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetCheckPortfolioSummaryQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<CheckPortfolioSummaryDto>> Handle(GetCheckPortfolioSummaryQuery request, CancellationToken cancellationToken)
    {
        var dbContext = GetDbContext();
        var allChecks = await dbContext.Set<Check>().ToListAsync(cancellationToken);

        var receivedChecks = allChecks.Where(c => c.Direction == MovementDirection.Inbound).ToList();
        var givenChecks = allChecks.Where(c => c.Direction == MovementDirection.Outbound).ToList();
        var today = DateTime.UtcNow.Date;
        var weekEnd = today.AddDays(7);
        var monthEnd = new DateTime(today.Year, today.Month, 1).AddMonths(1).AddDays(-1);

        var summary = new CheckPortfolioSummaryDto
        {
            TotalCheckCount = allChecks.Count,
            ReceivedCheckCount = receivedChecks.Count,
            GivenCheckCount = givenChecks.Count,
            InPortfolioCount = allChecks.Count(c => c.Status == NegotiableInstrumentStatus.InPortfolio),
            InBankCount = allChecks.Count(c => c.Status == NegotiableInstrumentStatus.GivenToBank),
            EndorsedCount = allChecks.Count(c => c.IsEndorsed),
            CollectedCount = allChecks.Count(c => c.Status == NegotiableInstrumentStatus.Collected),
            BouncedCount = allChecks.Count(c => c.IsBounced),
            TotalReceivedAmount = receivedChecks.Sum(c => c.Amount.Amount),
            TotalGivenAmount = givenChecks.Sum(c => c.Amount.Amount),
            TotalInPortfolioAmount = allChecks.Where(c => c.Status == NegotiableInstrumentStatus.InPortfolio).Sum(c => c.Amount.Amount),
            TotalInBankAmount = allChecks.Where(c => c.Status == NegotiableInstrumentStatus.GivenToBank).Sum(c => c.Amount.Amount),
            Currency = "TRY",
            ChecksDueTodayCount = allChecks.Count(c => c.DueDate.Date == today && (c.Status == NegotiableInstrumentStatus.InPortfolio || c.Status == NegotiableInstrumentStatus.GivenToBank)),
            ChecksDueThisWeekCount = allChecks.Count(c => c.DueDate.Date >= today && c.DueDate.Date <= weekEnd && (c.Status == NegotiableInstrumentStatus.InPortfolio || c.Status == NegotiableInstrumentStatus.GivenToBank)),
            ChecksDueThisMonthCount = allChecks.Count(c => c.DueDate.Date >= today && c.DueDate.Date <= monthEnd && (c.Status == NegotiableInstrumentStatus.InPortfolio || c.Status == NegotiableInstrumentStatus.GivenToBank)),
            OverdueChecksCount = allChecks.Count(c => c.DueDate.Date < today && (c.Status == NegotiableInstrumentStatus.InPortfolio || c.Status == NegotiableInstrumentStatus.GivenToBank)),
            OverdueChecksAmount = allChecks.Where(c => c.DueDate.Date < today && (c.Status == NegotiableInstrumentStatus.InPortfolio || c.Status == NegotiableInstrumentStatus.GivenToBank)).Sum(c => c.Amount.Amount)
        };

        return Result<CheckPortfolioSummaryDto>.Success(summary);
    }

    private DbContext GetDbContext()
    {
        return (_unitOfWork as dynamic).Context as DbContext
            ?? throw new InvalidOperationException("DbContext'e erişilemedi");
    }
}

#endregion
