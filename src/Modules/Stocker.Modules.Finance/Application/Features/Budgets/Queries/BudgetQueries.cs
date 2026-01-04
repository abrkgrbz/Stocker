using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Finance.Application.DTOs;
using Stocker.Modules.Finance.Application.Features.Budgets.Commands;
using Stocker.Modules.Finance.Domain.Entities;
using Stocker.Modules.Finance.Interfaces;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Finance.Application.Features.Budgets.Queries;

/// <summary>
/// Query to get paginated budgets
/// </summary>
public class GetBudgetsQuery : IRequest<Result<PagedResult<BudgetSummaryDto>>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public BudgetFilterDto? Filter { get; set; }
}

/// <summary>
/// Handler for GetBudgetsQuery
/// </summary>
public class GetBudgetsQueryHandler : IRequestHandler<GetBudgetsQuery, Result<PagedResult<BudgetSummaryDto>>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetBudgetsQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PagedResult<BudgetSummaryDto>>> Handle(GetBudgetsQuery request, CancellationToken cancellationToken)
    {
        var query = _unitOfWork.Budgets.AsQueryable();

        // Apply filters
        if (request.Filter != null)
        {
            if (!string.IsNullOrEmpty(request.Filter.SearchTerm))
            {
                var searchTerm = request.Filter.SearchTerm.ToLower();
                query = query.Where(b =>
                    b.Code.ToLower().Contains(searchTerm) ||
                    b.Name.ToLower().Contains(searchTerm) ||
                    (b.Description != null && b.Description.ToLower().Contains(searchTerm)));
            }

            if (request.Filter.Type.HasValue)
            {
                query = query.Where(b => b.Type == request.Filter.Type.Value);
            }

            if (request.Filter.Category.HasValue)
            {
                query = query.Where(b => b.Category == request.Filter.Category.Value);
            }

            if (request.Filter.Status.HasValue)
            {
                query = query.Where(b => b.Status == request.Filter.Status.Value);
            }

            if (request.Filter.FiscalYear.HasValue)
            {
                query = query.Where(b => b.FiscalYear == request.Filter.FiscalYear.Value);
            }

            if (request.Filter.ParentBudgetId.HasValue)
            {
                query = query.Where(b => b.ParentBudgetId == request.Filter.ParentBudgetId.Value);
            }

            if (request.Filter.CostCenterId.HasValue)
            {
                query = query.Where(b => b.CostCenterId == request.Filter.CostCenterId.Value);
            }

            if (request.Filter.DepartmentId.HasValue)
            {
                query = query.Where(b => b.DepartmentId == request.Filter.DepartmentId.Value);
            }

            if (request.Filter.ProjectId.HasValue)
            {
                query = query.Where(b => b.ProjectId == request.Filter.ProjectId.Value);
            }

            if (request.Filter.OwnerUserId.HasValue)
            {
                query = query.Where(b => b.OwnerUserId == request.Filter.OwnerUserId.Value);
            }

            if (request.Filter.IsActive.HasValue)
            {
                query = query.Where(b => b.IsActive == request.Filter.IsActive.Value);
            }

            if (request.Filter.IsLocked.HasValue)
            {
                query = query.Where(b => b.IsLocked == request.Filter.IsLocked.Value);
            }

            if (request.Filter.StartDate.HasValue)
            {
                query = query.Where(b => b.StartDate >= request.Filter.StartDate.Value);
            }

            if (request.Filter.EndDate.HasValue)
            {
                query = query.Where(b => b.EndDate <= request.Filter.EndDate.Value);
            }
        }

        // Get total count
        var totalCount = await query.CountAsync(cancellationToken);

        // Apply sorting
        var sortBy = request.Filter?.SortBy ?? "Code";
        var sortDesc = request.Filter?.SortDescending ?? false;

        query = sortBy.ToLower() switch
        {
            "name" => sortDesc ? query.OrderByDescending(b => b.Name) : query.OrderBy(b => b.Name),
            "fiscalyear" => sortDesc ? query.OrderByDescending(b => b.FiscalYear) : query.OrderBy(b => b.FiscalYear),
            "totalbudget" => sortDesc ? query.OrderByDescending(b => b.TotalBudget.Amount) : query.OrderBy(b => b.TotalBudget.Amount),
            "usedamount" => sortDesc ? query.OrderByDescending(b => b.UsedAmount.Amount) : query.OrderBy(b => b.UsedAmount.Amount),
            "status" => sortDesc ? query.OrderByDescending(b => b.Status) : query.OrderBy(b => b.Status),
            "startdate" => sortDesc ? query.OrderByDescending(b => b.StartDate) : query.OrderBy(b => b.StartDate),
            "enddate" => sortDesc ? query.OrderByDescending(b => b.EndDate) : query.OrderBy(b => b.EndDate),
            _ => sortDesc ? query.OrderByDescending(b => b.Code) : query.OrderBy(b => b.Code)
        };

        // Apply pagination
        var pageNumber = request.Filter?.PageNumber ?? 1;
        var pageSize = request.Filter?.PageSize ?? 20;
        var budgets = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var dtos = budgets.Select(CreateBudgetCommandHandler.MapToSummaryDto).ToList();

        return Result<PagedResult<BudgetSummaryDto>>.Success(
            new PagedResult<BudgetSummaryDto>(dtos, totalCount, pageNumber, pageSize));
    }
}

/// <summary>
/// Query to get a budget by ID
/// </summary>
public class GetBudgetByIdQuery : IRequest<Result<BudgetDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

/// <summary>
/// Handler for GetBudgetByIdQuery
/// </summary>
public class GetBudgetByIdQueryHandler : IRequestHandler<GetBudgetByIdQuery, Result<BudgetDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetBudgetByIdQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<BudgetDto>> Handle(GetBudgetByIdQuery request, CancellationToken cancellationToken)
    {
        var budget = await _unitOfWork.Budgets.GetWithChildrenAsync(request.Id, cancellationToken);
        if (budget == null)
        {
            return Result<BudgetDto>.Failure(
                Error.NotFound("Budget", $"ID {request.Id} ile butce bulunamadi"));
        }

        var dto = CreateBudgetCommandHandler.MapToDto(budget);
        return Result<BudgetDto>.Success(dto);
    }
}

/// <summary>
/// Query to get budgets by period
/// </summary>
public class GetBudgetsByPeriodQuery : IRequest<Result<List<BudgetSummaryDto>>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int FiscalYear { get; set; }
    public BudgetType? Type { get; set; }
    public BudgetCategory? Category { get; set; }
    public bool? ActiveOnly { get; set; }
}

/// <summary>
/// Handler for GetBudgetsByPeriodQuery
/// </summary>
public class GetBudgetsByPeriodQueryHandler : IRequestHandler<GetBudgetsByPeriodQuery, Result<List<BudgetSummaryDto>>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetBudgetsByPeriodQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<List<BudgetSummaryDto>>> Handle(GetBudgetsByPeriodQuery request, CancellationToken cancellationToken)
    {
        var budgets = await _unitOfWork.Budgets.GetByFiscalYearAsync(request.FiscalYear, cancellationToken);

        // Apply additional filters
        var filteredBudgets = budgets.AsEnumerable();

        if (request.Type.HasValue)
        {
            filteredBudgets = filteredBudgets.Where(b => b.Type == request.Type.Value);
        }

        if (request.Category.HasValue)
        {
            filteredBudgets = filteredBudgets.Where(b => b.Category == request.Category.Value);
        }

        if (request.ActiveOnly.HasValue && request.ActiveOnly.Value)
        {
            filteredBudgets = filteredBudgets.Where(b => b.IsActive);
        }

        var dtos = filteredBudgets.Select(CreateBudgetCommandHandler.MapToSummaryDto).ToList();

        return Result<List<BudgetSummaryDto>>.Success(dtos);
    }
}

/// <summary>
/// Query to get budget utilization
/// </summary>
public class GetBudgetUtilizationQuery : IRequest<Result<BudgetUtilizationDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

/// <summary>
/// Handler for GetBudgetUtilizationQuery
/// </summary>
public class GetBudgetUtilizationQueryHandler : IRequestHandler<GetBudgetUtilizationQuery, Result<BudgetUtilizationDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetBudgetUtilizationQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<BudgetUtilizationDto>> Handle(GetBudgetUtilizationQuery request, CancellationToken cancellationToken)
    {
        var budget = await _unitOfWork.Budgets.GetByIdAsync(request.Id, cancellationToken);
        if (budget == null)
        {
            return Result<BudgetUtilizationDto>.Failure(
                Error.NotFound("Budget", $"ID {request.Id} ile butce bulunamadi"));
        }

        // Calculate days remaining
        var today = DateTime.UtcNow.Date;
        var daysRemaining = (budget.EndDate.Date - today).Days;
        if (daysRemaining < 0) daysRemaining = 0;

        // Calculate daily burn rate
        var daysElapsed = (today - budget.StartDate.Date).Days;
        var dailyBurnRate = daysElapsed > 0 ? budget.UsedAmount.Amount / daysElapsed : 0;

        // Calculate projected end amount
        var projectedSpending = dailyBurnRate * daysRemaining;
        var projectedEndAmount = budget.RemainingAmount.Amount - projectedSpending;

        var dto = new BudgetUtilizationDto
        {
            BudgetId = budget.Id,
            BudgetCode = budget.Code,
            BudgetName = budget.Name,
            Type = budget.Type,
            FiscalYear = budget.FiscalYear,
            Currency = budget.Currency,
            TotalBudget = budget.TotalBudget.Amount,
            OriginalBudget = budget.OriginalBudget.Amount,
            RevisedBudget = budget.RevisedBudget?.Amount,
            UsedAmount = budget.UsedAmount.Amount,
            CommittedAmount = budget.CommittedAmount.Amount,
            RemainingAmount = budget.RemainingAmount.Amount,
            AvailableAmount = budget.AvailableAmount.Amount,
            UsagePercentage = budget.GetUsagePercentage(),
            CommitmentPercentage = budget.GetCommitmentPercentage(),
            TotalAllocationPercentage = budget.GetTotalAllocationPercentage(),
            HealthStatus = budget.GetHealthStatus(),
            HealthStatusName = GetHealthStatusName(budget.GetHealthStatus()),
            IsAtWarningLevel = budget.IsAtWarningLevel(),
            IsAtCriticalLevel = budget.IsAtCriticalLevel(),
            IsOverBudget = budget.IsOverBudget(),
            WarningThreshold = budget.WarningThreshold,
            CriticalThreshold = budget.CriticalThreshold,
            DaysRemaining = daysRemaining,
            DailyBurnRate = dailyBurnRate,
            ProjectedEndAmount = projectedEndAmount
        };

        return Result<BudgetUtilizationDto>.Success(dto);
    }

    private static string GetHealthStatusName(BudgetHealthStatus healthStatus) => healthStatus switch
    {
        BudgetHealthStatus.Healthy => "Saglikli",
        BudgetHealthStatus.Warning => "Uyari",
        BudgetHealthStatus.Critical => "Kritik",
        BudgetHealthStatus.Exceeded => "Asildi",
        _ => healthStatus.ToString()
    };
}

/// <summary>
/// Query to get budgets at risk (warning or critical level)
/// </summary>
public class GetBudgetsAtRiskQuery : IRequest<Result<List<BudgetSummaryDto>>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int? FiscalYear { get; set; }
}

/// <summary>
/// Handler for GetBudgetsAtRiskQuery
/// </summary>
public class GetBudgetsAtRiskQueryHandler : IRequestHandler<GetBudgetsAtRiskQuery, Result<List<BudgetSummaryDto>>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetBudgetsAtRiskQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<List<BudgetSummaryDto>>> Handle(GetBudgetsAtRiskQuery request, CancellationToken cancellationToken)
    {
        var budgets = await _unitOfWork.Budgets.GetBudgetsAtRiskAsync(cancellationToken);

        // Filter by fiscal year if specified
        if (request.FiscalYear.HasValue)
        {
            budgets = budgets.Where(b => b.FiscalYear == request.FiscalYear.Value).ToList();
        }

        var dtos = budgets.Select(CreateBudgetCommandHandler.MapToSummaryDto).ToList();

        return Result<List<BudgetSummaryDto>>.Success(dtos);
    }
}

/// <summary>
/// Query to get child budgets of a parent
/// </summary>
public class GetChildBudgetsQuery : IRequest<Result<List<BudgetSummaryDto>>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int ParentBudgetId { get; set; }
}

/// <summary>
/// Handler for GetChildBudgetsQuery
/// </summary>
public class GetChildBudgetsQueryHandler : IRequestHandler<GetChildBudgetsQuery, Result<List<BudgetSummaryDto>>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetChildBudgetsQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<List<BudgetSummaryDto>>> Handle(GetChildBudgetsQuery request, CancellationToken cancellationToken)
    {
        // Verify parent exists
        var parentBudget = await _unitOfWork.Budgets.GetByIdAsync(request.ParentBudgetId, cancellationToken);
        if (parentBudget == null)
        {
            return Result<List<BudgetSummaryDto>>.Failure(
                Error.NotFound("Budget", $"ID {request.ParentBudgetId} ile ust butce bulunamadi"));
        }

        var childBudgets = await _unitOfWork.Budgets.GetChildBudgetsAsync(request.ParentBudgetId, cancellationToken);
        var dtos = childBudgets.Select(CreateBudgetCommandHandler.MapToSummaryDto).ToList();

        return Result<List<BudgetSummaryDto>>.Success(dtos);
    }
}

/// <summary>
/// Query to get budget by code
/// </summary>
public class GetBudgetByCodeQuery : IRequest<Result<BudgetDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public string Code { get; set; } = string.Empty;
}

/// <summary>
/// Handler for GetBudgetByCodeQuery
/// </summary>
public class GetBudgetByCodeQueryHandler : IRequestHandler<GetBudgetByCodeQuery, Result<BudgetDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetBudgetByCodeQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<BudgetDto>> Handle(GetBudgetByCodeQuery request, CancellationToken cancellationToken)
    {
        var budget = await _unitOfWork.Budgets.GetByCodeAsync(request.Code, cancellationToken);
        if (budget == null)
        {
            return Result<BudgetDto>.Failure(
                Error.NotFound("Budget", $"'{request.Code}' kodlu butce bulunamadi"));
        }

        var dto = CreateBudgetCommandHandler.MapToDto(budget);
        return Result<BudgetDto>.Success(dto);
    }
}

/// <summary>
/// Query to get budgets by department
/// </summary>
public class GetBudgetsByDepartmentQuery : IRequest<Result<List<BudgetSummaryDto>>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int DepartmentId { get; set; }
    public int? FiscalYear { get; set; }
}

/// <summary>
/// Handler for GetBudgetsByDepartmentQuery
/// </summary>
public class GetBudgetsByDepartmentQueryHandler : IRequestHandler<GetBudgetsByDepartmentQuery, Result<List<BudgetSummaryDto>>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetBudgetsByDepartmentQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<List<BudgetSummaryDto>>> Handle(GetBudgetsByDepartmentQuery request, CancellationToken cancellationToken)
    {
        var budgets = await _unitOfWork.Budgets.GetByDepartmentAsync(request.DepartmentId, cancellationToken);

        // Filter by fiscal year if specified
        if (request.FiscalYear.HasValue)
        {
            budgets = budgets.Where(b => b.FiscalYear == request.FiscalYear.Value).ToList();
        }

        var dtos = budgets.Select(CreateBudgetCommandHandler.MapToSummaryDto).ToList();

        return Result<List<BudgetSummaryDto>>.Success(dtos);
    }
}

/// <summary>
/// Query to get budgets by project
/// </summary>
public class GetBudgetsByProjectQuery : IRequest<Result<List<BudgetSummaryDto>>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int ProjectId { get; set; }
}

/// <summary>
/// Handler for GetBudgetsByProjectQuery
/// </summary>
public class GetBudgetsByProjectQueryHandler : IRequestHandler<GetBudgetsByProjectQuery, Result<List<BudgetSummaryDto>>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetBudgetsByProjectQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<List<BudgetSummaryDto>>> Handle(GetBudgetsByProjectQuery request, CancellationToken cancellationToken)
    {
        var budgets = await _unitOfWork.Budgets.GetByProjectAsync(request.ProjectId, cancellationToken);
        var dtos = budgets.Select(CreateBudgetCommandHandler.MapToSummaryDto).ToList();

        return Result<List<BudgetSummaryDto>>.Success(dtos);
    }
}

/// <summary>
/// Query to get budgets by cost center
/// </summary>
public class GetBudgetsByCostCenterQuery : IRequest<Result<List<BudgetSummaryDto>>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int CostCenterId { get; set; }
    public int? FiscalYear { get; set; }
}

/// <summary>
/// Handler for GetBudgetsByCostCenterQuery
/// </summary>
public class GetBudgetsByCostCenterQueryHandler : IRequestHandler<GetBudgetsByCostCenterQuery, Result<List<BudgetSummaryDto>>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetBudgetsByCostCenterQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<List<BudgetSummaryDto>>> Handle(GetBudgetsByCostCenterQuery request, CancellationToken cancellationToken)
    {
        var budgets = await _unitOfWork.Budgets.GetByCostCenterAsync(request.CostCenterId, cancellationToken);

        // Filter by fiscal year if specified
        if (request.FiscalYear.HasValue)
        {
            budgets = budgets.Where(b => b.FiscalYear == request.FiscalYear.Value).ToList();
        }

        var dtos = budgets.Select(CreateBudgetCommandHandler.MapToSummaryDto).ToList();

        return Result<List<BudgetSummaryDto>>.Success(dtos);
    }
}

/// <summary>
/// Query to get budgets by fiscal year
/// </summary>
public class GetBudgetsByFiscalYearQuery : IRequest<Result<List<BudgetSummaryDto>>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int FiscalYear { get; set; }
}

/// <summary>
/// Handler for GetBudgetsByFiscalYearQuery
/// </summary>
public class GetBudgetsByFiscalYearQueryHandler : IRequestHandler<GetBudgetsByFiscalYearQuery, Result<List<BudgetSummaryDto>>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetBudgetsByFiscalYearQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<List<BudgetSummaryDto>>> Handle(GetBudgetsByFiscalYearQuery request, CancellationToken cancellationToken)
    {
        var budgets = await _unitOfWork.Budgets.GetByFiscalYearAsync(request.FiscalYear, cancellationToken);
        var dtos = budgets.Select(CreateBudgetCommandHandler.MapToSummaryDto).ToList();
        return Result<List<BudgetSummaryDto>>.Success(dtos);
    }
}

/// <summary>
/// Query to get active budgets
/// </summary>
public class GetActiveBudgetsQuery : IRequest<Result<List<BudgetSummaryDto>>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int? FiscalYear { get; set; }
}

/// <summary>
/// Handler for GetActiveBudgetsQuery
/// </summary>
public class GetActiveBudgetsQueryHandler : IRequestHandler<GetActiveBudgetsQuery, Result<List<BudgetSummaryDto>>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetActiveBudgetsQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<List<BudgetSummaryDto>>> Handle(GetActiveBudgetsQuery request, CancellationToken cancellationToken)
    {
        var query = _unitOfWork.Budgets.AsQueryable()
            .Where(b => b.IsActive);

        if (request.FiscalYear.HasValue)
        {
            query = query.Where(b => b.FiscalYear == request.FiscalYear.Value);
        }

        var budgets = await query.ToListAsync(cancellationToken);
        var dtos = budgets.Select(CreateBudgetCommandHandler.MapToSummaryDto).ToList();
        return Result<List<BudgetSummaryDto>>.Success(dtos);
    }
}
