using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Finance.Application.DTOs;
using Stocker.Modules.Finance.Application.Features.Expenses.Commands;
using Stocker.Modules.Finance.Domain.Entities;
using Stocker.Modules.Finance.Domain.Enums;
using Stocker.Modules.Finance.Interfaces;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Finance.Application.Features.Expenses.Queries;

/// <summary>
/// Query to get paginated expenses
/// </summary>
public class GetExpensesQuery : IRequest<Result<PagedResult<ExpenseSummaryDto>>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public ExpenseFilterDto? Filter { get; set; }
}

/// <summary>
/// Handler for GetExpensesQuery
/// </summary>
public class GetExpensesQueryHandler : IRequestHandler<GetExpensesQuery, Result<PagedResult<ExpenseSummaryDto>>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetExpensesQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PagedResult<ExpenseSummaryDto>>> Handle(GetExpensesQuery request, CancellationToken cancellationToken)
    {
        var query = _unitOfWork.Expenses.AsQueryable();

        // Apply filters
        if (request.Filter != null)
        {
            if (!string.IsNullOrEmpty(request.Filter.SearchTerm))
            {
                var searchTerm = request.Filter.SearchTerm.ToLower();
                query = query.Where(e =>
                    e.ExpenseNumber.ToLower().Contains(searchTerm) ||
                    e.Description.ToLower().Contains(searchTerm) ||
                    (e.SupplierName != null && e.SupplierName.ToLower().Contains(searchTerm)));
            }

            if (request.Filter.Category.HasValue)
            {
                var mainCategory = MapCategoryTypeToMainCategory(request.Filter.Category.Value);
                query = query.Where(e => e.Category == mainCategory);
            }

            if (request.Filter.Status.HasValue)
            {
                query = query.Where(e => e.Status == request.Filter.Status.Value);
            }

            if (request.Filter.CurrentAccountId.HasValue)
            {
                query = query.Where(e => e.CurrentAccountId == request.Filter.CurrentAccountId.Value);
            }

            if (request.Filter.CostCenterId.HasValue)
            {
                query = query.Where(e => e.CostCenterId == request.Filter.CostCenterId.Value);
            }

            if (request.Filter.ProjectId.HasValue)
            {
                query = query.Where(e => e.ProjectId == request.Filter.ProjectId.Value);
            }

            if (request.Filter.StartDate.HasValue)
            {
                query = query.Where(e => e.ExpenseDate >= request.Filter.StartDate.Value);
            }

            if (request.Filter.EndDate.HasValue)
            {
                query = query.Where(e => e.ExpenseDate <= request.Filter.EndDate.Value);
            }

            if (request.Filter.IsPaid.HasValue)
            {
                query = query.Where(e => e.IsPaid == request.Filter.IsPaid.Value);
            }
        }

        // Get total count
        var totalCount = await query.CountAsync(cancellationToken);

        // Apply sorting
        var sortBy = request.Filter?.SortBy ?? "ExpenseDate";
        var sortDesc = request.Filter?.SortDescending ?? true;

        query = sortBy.ToLower() switch
        {
            "expensenumber" => sortDesc ? query.OrderByDescending(e => e.ExpenseNumber) : query.OrderBy(e => e.ExpenseNumber),
            "amount" => sortDesc ? query.OrderByDescending(e => e.GrossAmount.Amount) : query.OrderBy(e => e.GrossAmount.Amount),
            "category" => sortDesc ? query.OrderByDescending(e => e.Category) : query.OrderBy(e => e.Category),
            "status" => sortDesc ? query.OrderByDescending(e => e.Status) : query.OrderBy(e => e.Status),
            _ => sortDesc ? query.OrderByDescending(e => e.ExpenseDate) : query.OrderBy(e => e.ExpenseDate)
        };

        // Apply pagination
        var pageNumber = request.Filter?.PageNumber ?? 1;
        var pageSize = request.Filter?.PageSize ?? 20;
        var expenses = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var dtos = expenses.Select(MapToSummaryDto).ToList();

        return Result<PagedResult<ExpenseSummaryDto>>.Success(
            new PagedResult<ExpenseSummaryDto>(dtos, totalCount, pageNumber, pageSize));
    }

    private static ExpenseMainCategory MapCategoryTypeToMainCategory(ExpenseCategoryType categoryType)
    {
        return categoryType switch
        {
            ExpenseCategoryType.ResearchAndDevelopment => ExpenseMainCategory.ResearchDevelopment,
            ExpenseCategoryType.MarketingSalesDistribution => ExpenseMainCategory.MarketingSalesDistribution,
            ExpenseCategoryType.GeneralAdministrative => ExpenseMainCategory.GeneralAdministrative,
            ExpenseCategoryType.Personnel => ExpenseMainCategory.Personnel,
            ExpenseCategoryType.Rent => ExpenseMainCategory.Office,
            ExpenseCategoryType.Utilities => ExpenseMainCategory.Office,
            ExpenseCategoryType.Communication => ExpenseMainCategory.Office,
            ExpenseCategoryType.Transportation => ExpenseMainCategory.Vehicle,
            ExpenseCategoryType.TravelAccommodation => ExpenseMainCategory.Travel,
            _ => ExpenseMainCategory.Other
        };
    }

    private static ExpenseSummaryDto MapToSummaryDto(Expense expense)
    {
        return new ExpenseSummaryDto
        {
            Id = expense.Id,
            ExpenseNumber = expense.ExpenseNumber,
            ExpenseDate = expense.ExpenseDate,
            Category = MapMainCategoryToCategoryType(expense.Category),
            CategoryName = expense.Category.ToString(),
            Description = expense.Description,
            GrossAmount = expense.GrossAmount.Amount,
            Currency = expense.Currency,
            Status = expense.Status,
            IsPaid = expense.IsPaid,
            CurrentAccountName = expense.SupplierName
        };
    }

    private static ExpenseCategoryType MapMainCategoryToCategoryType(ExpenseMainCategory category)
    {
        return category switch
        {
            ExpenseMainCategory.ResearchDevelopment => ExpenseCategoryType.ResearchAndDevelopment,
            ExpenseMainCategory.MarketingSalesDistribution => ExpenseCategoryType.MarketingSalesDistribution,
            ExpenseMainCategory.GeneralAdministrative => ExpenseCategoryType.GeneralAdministrative,
            ExpenseMainCategory.Personnel => ExpenseCategoryType.Personnel,
            ExpenseMainCategory.Vehicle => ExpenseCategoryType.Transportation,
            ExpenseMainCategory.Office => ExpenseCategoryType.Rent,
            ExpenseMainCategory.Travel => ExpenseCategoryType.TravelAccommodation,
            _ => ExpenseCategoryType.Other
        };
    }
}

/// <summary>
/// Query to get an expense by ID
/// </summary>
public class GetExpenseByIdQuery : IRequest<Result<ExpenseDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

/// <summary>
/// Handler for GetExpenseByIdQuery
/// </summary>
public class GetExpenseByIdQueryHandler : IRequestHandler<GetExpenseByIdQuery, Result<ExpenseDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetExpenseByIdQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<ExpenseDto>> Handle(GetExpenseByIdQuery request, CancellationToken cancellationToken)
    {
        var expense = await _unitOfWork.Expenses.GetByIdAsync(request.Id, cancellationToken);
        if (expense == null)
        {
            return Result<ExpenseDto>.Failure(
                Error.NotFound("Expense", $"ID {request.Id} ile gider bulunamadı"));
        }

        var dto = CreateExpenseCommandHandler.MapToDto(expense);
        return Result<ExpenseDto>.Success(dto);
    }
}

/// <summary>
/// Query to get pending approval expenses
/// </summary>
public class GetPendingApprovalExpensesQuery : IRequest<Result<List<ExpenseSummaryDto>>>, ITenantRequest
{
    public Guid TenantId { get; set; }
}

/// <summary>
/// Handler for GetPendingApprovalExpensesQuery
/// </summary>
public class GetPendingApprovalExpensesQueryHandler : IRequestHandler<GetPendingApprovalExpensesQuery, Result<List<ExpenseSummaryDto>>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetPendingApprovalExpensesQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<List<ExpenseSummaryDto>>> Handle(GetPendingApprovalExpensesQuery request, CancellationToken cancellationToken)
    {
        var expenses = await _unitOfWork.Expenses.GetPendingApprovalAsync(cancellationToken);

        var dtos = expenses.Select(e => new ExpenseSummaryDto
        {
            Id = e.Id,
            ExpenseNumber = e.ExpenseNumber,
            ExpenseDate = e.ExpenseDate,
            Category = MapMainCategoryToCategoryType(e.Category),
            CategoryName = e.Category.ToString(),
            Description = e.Description,
            GrossAmount = e.GrossAmount.Amount,
            Currency = e.Currency,
            Status = e.Status,
            IsPaid = e.IsPaid,
            CurrentAccountName = e.SupplierName
        }).ToList();

        return Result<List<ExpenseSummaryDto>>.Success(dtos);
    }

    private static ExpenseCategoryType MapMainCategoryToCategoryType(ExpenseMainCategory category)
    {
        return category switch
        {
            ExpenseMainCategory.ResearchDevelopment => ExpenseCategoryType.ResearchAndDevelopment,
            ExpenseMainCategory.MarketingSalesDistribution => ExpenseCategoryType.MarketingSalesDistribution,
            ExpenseMainCategory.GeneralAdministrative => ExpenseCategoryType.GeneralAdministrative,
            ExpenseMainCategory.Personnel => ExpenseCategoryType.Personnel,
            ExpenseMainCategory.Vehicle => ExpenseCategoryType.Transportation,
            ExpenseMainCategory.Office => ExpenseCategoryType.Rent,
            ExpenseMainCategory.Travel => ExpenseCategoryType.TravelAccommodation,
            _ => ExpenseCategoryType.Other
        };
    }
}

/// <summary>
/// Query to get expense totals by category
/// </summary>
public class GetExpenseTotalsByCategoryQuery : IRequest<Result<Dictionary<string, decimal>>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
}

/// <summary>
/// Handler for GetExpenseTotalsByCategoryQuery
/// </summary>
public class GetExpenseTotalsByCategoryQueryHandler : IRequestHandler<GetExpenseTotalsByCategoryQuery, Result<Dictionary<string, decimal>>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetExpenseTotalsByCategoryQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<Dictionary<string, decimal>>> Handle(GetExpenseTotalsByCategoryQuery request, CancellationToken cancellationToken)
    {
        var totals = await _unitOfWork.Expenses.GetTotalByCategoryAsync(
            request.StartDate,
            request.EndDate,
            cancellationToken);

        // Convert to string-keyed dictionary for DTO
        var result = totals.ToDictionary(
            kvp => kvp.Key.ToString(),
            kvp => kvp.Value);

        return Result<Dictionary<string, decimal>>.Success(result);
    }
}
