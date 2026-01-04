using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Finance.Application.DTOs;
using Stocker.Modules.Finance.Application.Features.AccountingPeriods.Commands;
using Stocker.Modules.Finance.Domain.Entities;
using Stocker.Modules.Finance.Interfaces;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Finance.Application.Features.AccountingPeriods.Queries;

/// <summary>
/// Query to get paginated accounting periods
/// </summary>
public class GetAccountingPeriodsQuery : IRequest<Result<PagedResult<AccountingPeriodSummaryDto>>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public AccountingPeriodFilterDto? Filter { get; set; }
}

/// <summary>
/// Handler for GetAccountingPeriodsQuery
/// </summary>
public class GetAccountingPeriodsQueryHandler : IRequestHandler<GetAccountingPeriodsQuery, Result<PagedResult<AccountingPeriodSummaryDto>>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetAccountingPeriodsQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PagedResult<AccountingPeriodSummaryDto>>> Handle(GetAccountingPeriodsQuery request, CancellationToken cancellationToken)
    {
        var query = _unitOfWork.AccountingPeriods.AsQueryable();

        // Apply filters
        if (request.Filter != null)
        {
            if (!string.IsNullOrEmpty(request.Filter.SearchTerm))
            {
                var searchTerm = request.Filter.SearchTerm.ToLower();
                query = query.Where(p =>
                    p.Code.ToLower().Contains(searchTerm) ||
                    p.Name.ToLower().Contains(searchTerm) ||
                    (p.Description != null && p.Description.ToLower().Contains(searchTerm)));
            }

            if (request.Filter.FiscalYear.HasValue)
            {
                query = query.Where(p => p.FiscalYear == request.Filter.FiscalYear.Value);
            }

            if (request.Filter.PeriodType.HasValue)
            {
                query = query.Where(p => p.PeriodType == request.Filter.PeriodType.Value);
            }

            if (request.Filter.Status.HasValue)
            {
                query = query.Where(p => p.Status == request.Filter.Status.Value);
            }

            if (request.Filter.IsActive.HasValue)
            {
                query = query.Where(p => p.IsActive == request.Filter.IsActive.Value);
            }

            if (request.Filter.IsLocked.HasValue)
            {
                query = query.Where(p => p.IsLocked == request.Filter.IsLocked.Value);
            }

            if (request.Filter.IsOpen.HasValue && request.Filter.IsOpen.Value)
            {
                query = query.Where(p => p.Status == AccountingPeriodStatus.Open);
            }

            if (request.Filter.StartDateFrom.HasValue)
            {
                query = query.Where(p => p.StartDate >= request.Filter.StartDateFrom.Value);
            }

            if (request.Filter.StartDateTo.HasValue)
            {
                query = query.Where(p => p.StartDate <= request.Filter.StartDateTo.Value);
            }

            if (request.Filter.EndDateFrom.HasValue)
            {
                query = query.Where(p => p.EndDate >= request.Filter.EndDateFrom.Value);
            }

            if (request.Filter.EndDateTo.HasValue)
            {
                query = query.Where(p => p.EndDate <= request.Filter.EndDateTo.Value);
            }
        }

        // Get total count
        var totalCount = await query.CountAsync(cancellationToken);

        // Apply sorting
        var sortBy = request.Filter?.SortBy ?? "FiscalYear";
        var sortDesc = request.Filter?.SortDescending ?? true;

        query = sortBy.ToLower() switch
        {
            "code" => sortDesc ? query.OrderByDescending(p => p.Code) : query.OrderBy(p => p.Code),
            "name" => sortDesc ? query.OrderByDescending(p => p.Name) : query.OrderBy(p => p.Name),
            "startdate" => sortDesc ? query.OrderByDescending(p => p.StartDate) : query.OrderBy(p => p.StartDate),
            "enddate" => sortDesc ? query.OrderByDescending(p => p.EndDate) : query.OrderBy(p => p.EndDate),
            "status" => sortDesc ? query.OrderByDescending(p => p.Status) : query.OrderBy(p => p.Status),
            "periodnumber" => sortDesc ? query.OrderByDescending(p => p.PeriodNumber) : query.OrderBy(p => p.PeriodNumber),
            _ => sortDesc
                ? query.OrderByDescending(p => p.FiscalYear).ThenByDescending(p => p.PeriodNumber)
                : query.OrderBy(p => p.FiscalYear).ThenBy(p => p.PeriodNumber)
        };

        // Apply pagination
        var pageNumber = request.Filter?.PageNumber ?? 1;
        var pageSize = request.Filter?.PageSize ?? 20;
        var periods = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var dtos = periods.Select(CreateMonthlyPeriodCommandHandler.MapToSummaryDto).ToList();

        return Result<PagedResult<AccountingPeriodSummaryDto>>.Success(
            new PagedResult<AccountingPeriodSummaryDto>(dtos, totalCount, pageNumber, pageSize));
    }
}

/// <summary>
/// Query to get an accounting period by ID
/// </summary>
public class GetAccountingPeriodByIdQuery : IRequest<Result<AccountingPeriodDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

/// <summary>
/// Handler for GetAccountingPeriodByIdQuery
/// </summary>
public class GetAccountingPeriodByIdQueryHandler : IRequestHandler<GetAccountingPeriodByIdQuery, Result<AccountingPeriodDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetAccountingPeriodByIdQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<AccountingPeriodDto>> Handle(GetAccountingPeriodByIdQuery request, CancellationToken cancellationToken)
    {
        var period = await _unitOfWork.AccountingPeriods.GetByIdAsync(request.Id, cancellationToken);
        if (period == null)
        {
            return Result<AccountingPeriodDto>.Failure(
                Error.NotFound("AccountingPeriod", $"ID {request.Id} ile muhasebe dönemi bulunamadı"));
        }

        var dto = CreateMonthlyPeriodCommandHandler.MapToDto(period);
        return Result<AccountingPeriodDto>.Success(dto);
    }
}

/// <summary>
/// Query to get the active accounting period
/// </summary>
public class GetActiveAccountingPeriodQuery : IRequest<Result<AccountingPeriodDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
}

/// <summary>
/// Handler for GetActiveAccountingPeriodQuery
/// </summary>
public class GetActiveAccountingPeriodQueryHandler : IRequestHandler<GetActiveAccountingPeriodQuery, Result<AccountingPeriodDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetActiveAccountingPeriodQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<AccountingPeriodDto>> Handle(GetActiveAccountingPeriodQuery request, CancellationToken cancellationToken)
    {
        var period = await _unitOfWork.AccountingPeriods.GetActiveAsync(cancellationToken);
        if (period == null)
        {
            return Result<AccountingPeriodDto>.Failure(
                Error.NotFound("AccountingPeriod", "Aktif muhasebe dönemi bulunamadı"));
        }

        var dto = CreateMonthlyPeriodCommandHandler.MapToDto(period);
        return Result<AccountingPeriodDto>.Success(dto);
    }
}

/// <summary>
/// Query to get accounting period by a specific date
/// </summary>
public class GetAccountingPeriodByDateQuery : IRequest<Result<AccountingPeriodDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public DateTime Date { get; set; }
}

/// <summary>
/// Handler for GetAccountingPeriodByDateQuery
/// </summary>
public class GetAccountingPeriodByDateQueryHandler : IRequestHandler<GetAccountingPeriodByDateQuery, Result<AccountingPeriodDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetAccountingPeriodByDateQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<AccountingPeriodDto>> Handle(GetAccountingPeriodByDateQuery request, CancellationToken cancellationToken)
    {
        var period = await _unitOfWork.AccountingPeriods.GetByDateAsync(request.Date, cancellationToken);
        if (period == null)
        {
            return Result<AccountingPeriodDto>.Failure(
                Error.NotFound("AccountingPeriod", $"{request.Date:dd.MM.yyyy} tarihi için muhasebe dönemi bulunamadı"));
        }

        var dto = CreateMonthlyPeriodCommandHandler.MapToDto(period);
        return Result<AccountingPeriodDto>.Success(dto);
    }
}

/// <summary>
/// Query to get accounting periods by fiscal year
/// </summary>
public class GetAccountingPeriodsByFiscalYearQuery : IRequest<Result<List<AccountingPeriodSummaryDto>>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int FiscalYear { get; set; }
}

/// <summary>
/// Handler for GetAccountingPeriodsByFiscalYearQuery
/// </summary>
public class GetAccountingPeriodsByFiscalYearQueryHandler : IRequestHandler<GetAccountingPeriodsByFiscalYearQuery, Result<List<AccountingPeriodSummaryDto>>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetAccountingPeriodsByFiscalYearQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<List<AccountingPeriodSummaryDto>>> Handle(GetAccountingPeriodsByFiscalYearQuery request, CancellationToken cancellationToken)
    {
        var periods = await _unitOfWork.AccountingPeriods.GetByFiscalYearAsync(request.FiscalYear, cancellationToken);

        var dtos = periods
            .OrderBy(p => p.PeriodNumber)
            .Select(CreateMonthlyPeriodCommandHandler.MapToSummaryDto)
            .ToList();

        return Result<List<AccountingPeriodSummaryDto>>.Success(dtos);
    }
}

/// <summary>
/// Query to get open accounting periods
/// </summary>
public class GetOpenAccountingPeriodsQuery : IRequest<Result<List<AccountingPeriodSummaryDto>>>, ITenantRequest
{
    public Guid TenantId { get; set; }
}

/// <summary>
/// Handler for GetOpenAccountingPeriodsQuery
/// </summary>
public class GetOpenAccountingPeriodsQueryHandler : IRequestHandler<GetOpenAccountingPeriodsQuery, Result<List<AccountingPeriodSummaryDto>>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetOpenAccountingPeriodsQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<List<AccountingPeriodSummaryDto>>> Handle(GetOpenAccountingPeriodsQuery request, CancellationToken cancellationToken)
    {
        var periods = await _unitOfWork.AccountingPeriods.GetOpenPeriodsAsync(cancellationToken);

        var dtos = periods
            .OrderByDescending(p => p.FiscalYear)
            .ThenByDescending(p => p.PeriodNumber)
            .Select(CreateMonthlyPeriodCommandHandler.MapToSummaryDto)
            .ToList();

        return Result<List<AccountingPeriodSummaryDto>>.Success(dtos);
    }
}
