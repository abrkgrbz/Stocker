using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Finance.Application.DTOs;
using Stocker.Modules.Finance.Application.Features.CashAccounts.Commands;
using Stocker.Modules.Finance.Domain.Entities;
using Stocker.Modules.Finance.Interfaces;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Finance.Application.Features.CashAccounts.Queries;

#region Get Cash Accounts (Paginated)

/// <summary>
/// Query to get paginated cash accounts
/// </summary>
public class GetCashAccountsQuery : IRequest<Result<PagedResult<CashAccountSummaryDto>>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public CashAccountFilterDto? Filter { get; set; }
    public string? SortBy { get; set; }
    public bool SortDescending { get; set; }
}

/// <summary>
/// Handler for GetCashAccountsQuery
/// </summary>
public class GetCashAccountsQueryHandler : IRequestHandler<GetCashAccountsQuery, Result<PagedResult<CashAccountSummaryDto>>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetCashAccountsQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PagedResult<CashAccountSummaryDto>>> Handle(GetCashAccountsQuery request, CancellationToken cancellationToken)
    {
        var query = _unitOfWork.CashAccounts.AsQueryable();

        // Apply filters
        if (request.Filter != null)
        {
            if (!string.IsNullOrEmpty(request.Filter.SearchTerm))
            {
                var searchTerm = request.Filter.SearchTerm.ToLower();
                query = query.Where(ca =>
                    ca.Code.ToLower().Contains(searchTerm) ||
                    ca.Name.ToLower().Contains(searchTerm) ||
                    (ca.Description != null && ca.Description.ToLower().Contains(searchTerm)));
            }

            if (request.Filter.AccountType.HasValue)
            {
                var accountType = (CashAccountType)(int)request.Filter.AccountType.Value;
                query = query.Where(ca => ca.AccountType == accountType);
            }

            if (request.Filter.IsActive.HasValue)
            {
                query = query.Where(ca => ca.IsActive == request.Filter.IsActive.Value);
            }

            if (request.Filter.IsDefault.HasValue)
            {
                query = query.Where(ca => ca.IsDefault == request.Filter.IsDefault.Value);
            }

            if (request.Filter.BranchId.HasValue)
            {
                query = query.Where(ca => ca.BranchId == request.Filter.BranchId.Value);
            }

            if (request.Filter.WarehouseId.HasValue)
            {
                query = query.Where(ca => ca.WarehouseId == request.Filter.WarehouseId.Value);
            }

            if (request.Filter.ResponsibleUserId.HasValue)
            {
                query = query.Where(ca => ca.ResponsibleUserId == request.Filter.ResponsibleUserId.Value);
            }

            if (!string.IsNullOrEmpty(request.Filter.Currency))
            {
                query = query.Where(ca => ca.Currency == request.Filter.Currency);
            }

            if (request.Filter.HasBalanceAlert.HasValue && request.Filter.HasBalanceAlert.Value)
            {
                query = query.Where(ca =>
                    (ca.MinimumBalance != null && ca.Balance.Amount < ca.MinimumBalance.Amount) ||
                    (ca.MaximumBalance != null && ca.Balance.Amount > ca.MaximumBalance.Amount));
            }
        }

        // Get total count
        var totalCount = await query.CountAsync(cancellationToken);

        // Apply sorting
        var sortBy = request.Filter?.SortBy ?? "Name";
        var sortDesc = request.Filter?.SortDescending ?? false;

        query = sortBy.ToLower() switch
        {
            "code" => sortDesc ? query.OrderByDescending(ca => ca.Code) : query.OrderBy(ca => ca.Code),
            "balance" => sortDesc ? query.OrderByDescending(ca => ca.Balance.Amount) : query.OrderBy(ca => ca.Balance.Amount),
            "accounttype" => sortDesc ? query.OrderByDescending(ca => ca.AccountType) : query.OrderBy(ca => ca.AccountType),
            "isactive" => sortDesc ? query.OrderByDescending(ca => ca.IsActive) : query.OrderBy(ca => ca.IsActive),
            "isdefault" => sortDesc ? query.OrderByDescending(ca => ca.IsDefault) : query.OrderBy(ca => ca.IsDefault),
            _ => sortDesc ? query.OrderByDescending(ca => ca.Name) : query.OrderBy(ca => ca.Name)
        };

        // Apply pagination
        var pageNumber = request.Filter?.PageNumber ?? 1;
        var pageSize = request.Filter?.PageSize ?? 20;
        var cashAccounts = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var dtos = cashAccounts.Select(MapToSummaryDto).ToList();

        return Result<PagedResult<CashAccountSummaryDto>>.Success(
            new PagedResult<CashAccountSummaryDto>(dtos, totalCount, pageNumber, pageSize));
    }

    private static CashAccountSummaryDto MapToSummaryDto(CashAccount cashAccount)
    {
        return new CashAccountSummaryDto
        {
            Id = cashAccount.Id,
            Code = cashAccount.Code,
            Name = cashAccount.Name,
            Currency = cashAccount.Currency,
            AccountType = (CashAccountTypeDto)(int)cashAccount.AccountType,
            AccountTypeName = GetAccountTypeName(cashAccount.AccountType),
            Balance = cashAccount.Balance.Amount,
            IsActive = cashAccount.IsActive,
            IsDefault = cashAccount.IsDefault,
            BranchName = cashAccount.BranchName,
            ResponsibleUserName = cashAccount.ResponsibleUserName,
            IsBelowMinimumBalance = cashAccount.IsBelowMinimumBalance(),
            IsAboveMaximumBalance = cashAccount.IsAboveMaximumBalance()
        };
    }

    private static string GetAccountTypeName(CashAccountType accountType)
    {
        return accountType switch
        {
            CashAccountType.TRY => "TL Kasası",
            CashAccountType.ForeignCurrency => "Döviz Kasası",
            CashAccountType.POS => "POS Kasası",
            CashAccountType.CashRegister => "Yazar Kasa",
            CashAccountType.Branch => "Şube Kasası",
            CashAccountType.Headquarters => "Merkez Kasa",
            _ => accountType.ToString()
        };
    }
}

#endregion

#region Get Cash Account By Id

/// <summary>
/// Query to get a cash account by ID
/// </summary>
public class GetCashAccountByIdQuery : IRequest<Result<CashAccountDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

/// <summary>
/// Handler for GetCashAccountByIdQuery
/// </summary>
public class GetCashAccountByIdQueryHandler : IRequestHandler<GetCashAccountByIdQuery, Result<CashAccountDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetCashAccountByIdQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<CashAccountDto>> Handle(GetCashAccountByIdQuery request, CancellationToken cancellationToken)
    {
        var cashAccount = await _unitOfWork.CashAccounts.GetByIdAsync(request.Id, cancellationToken);
        if (cashAccount == null)
        {
            return Result<CashAccountDto>.Failure(
                Error.NotFound("CashAccount", $"ID {request.Id} ile kasa hesabı bulunamadı"));
        }

        var dto = CreateCashAccountCommandHandler.MapToDto(cashAccount);
        return Result<CashAccountDto>.Success(dto);
    }
}

#endregion

#region Get Active Cash Accounts

/// <summary>
/// Query to get all active cash accounts
/// </summary>
public class GetActiveCashAccountsQuery : IRequest<Result<List<CashAccountSummaryDto>>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public string? Currency { get; set; }
}

/// <summary>
/// Handler for GetActiveCashAccountsQuery
/// </summary>
public class GetActiveCashAccountsQueryHandler : IRequestHandler<GetActiveCashAccountsQuery, Result<List<CashAccountSummaryDto>>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetActiveCashAccountsQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<List<CashAccountSummaryDto>>> Handle(GetActiveCashAccountsQuery request, CancellationToken cancellationToken)
    {
        var cashAccounts = await _unitOfWork.CashAccounts.GetActiveAsync(cancellationToken);

        // Filter by currency if specified
        if (!string.IsNullOrEmpty(request.Currency))
        {
            cashAccounts = cashAccounts.Where(ca => ca.Currency == request.Currency).ToList();
        }

        var dtos = cashAccounts.Select(ca => new CashAccountSummaryDto
        {
            Id = ca.Id,
            Code = ca.Code,
            Name = ca.Name,
            Currency = ca.Currency,
            AccountType = (CashAccountTypeDto)(int)ca.AccountType,
            AccountTypeName = GetAccountTypeName(ca.AccountType),
            Balance = ca.Balance.Amount,
            IsActive = ca.IsActive,
            IsDefault = ca.IsDefault,
            BranchName = ca.BranchName,
            ResponsibleUserName = ca.ResponsibleUserName,
            IsBelowMinimumBalance = ca.IsBelowMinimumBalance(),
            IsAboveMaximumBalance = ca.IsAboveMaximumBalance()
        }).ToList();

        return Result<List<CashAccountSummaryDto>>.Success(dtos);
    }

    private static string GetAccountTypeName(CashAccountType accountType)
    {
        return accountType switch
        {
            CashAccountType.TRY => "TL Kasası",
            CashAccountType.ForeignCurrency => "Döviz Kasası",
            CashAccountType.POS => "POS Kasası",
            CashAccountType.CashRegister => "Yazar Kasa",
            CashAccountType.Branch => "Şube Kasası",
            CashAccountType.Headquarters => "Merkez Kasa",
            _ => accountType.ToString()
        };
    }
}

#endregion

#region Get Default Cash Account

/// <summary>
/// Query to get the default cash account
/// </summary>
public class GetDefaultCashAccountQuery : IRequest<Result<CashAccountDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public string? Currency { get; set; }
}

/// <summary>
/// Handler for GetDefaultCashAccountQuery
/// </summary>
public class GetDefaultCashAccountQueryHandler : IRequestHandler<GetDefaultCashAccountQuery, Result<CashAccountDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetDefaultCashAccountQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<CashAccountDto>> Handle(GetDefaultCashAccountQuery request, CancellationToken cancellationToken)
    {
        CashAccount? cashAccount;

        if (!string.IsNullOrEmpty(request.Currency))
        {
            cashAccount = await _unitOfWork.CashAccounts.GetDefaultByCurrencyAsync(request.Currency, cancellationToken);
        }
        else
        {
            cashAccount = await _unitOfWork.CashAccounts.GetDefaultAsync(cancellationToken);
        }

        if (cashAccount == null)
        {
            var currencyMessage = !string.IsNullOrEmpty(request.Currency)
                ? $" ({request.Currency} para birimi için)"
                : string.Empty;
            return Result<CashAccountDto>.Failure(
                Error.NotFound("CashAccount", $"Varsayılan kasa hesabı bulunamadı{currencyMessage}"));
        }

        var dto = CreateCashAccountCommandHandler.MapToDto(cashAccount);
        return Result<CashAccountDto>.Success(dto);
    }
}

#endregion

#region Get Cash Accounts With Balance Alerts

/// <summary>
/// Query to get cash accounts with balance alerts
/// </summary>
public class GetCashAccountsWithBalanceAlertsQuery : IRequest<Result<List<CashAccountSummaryDto>>>, ITenantRequest
{
    public Guid TenantId { get; set; }
}

/// <summary>
/// Handler for GetCashAccountsWithBalanceAlertsQuery
/// </summary>
public class GetCashAccountsWithBalanceAlertsQueryHandler : IRequestHandler<GetCashAccountsWithBalanceAlertsQuery, Result<List<CashAccountSummaryDto>>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetCashAccountsWithBalanceAlertsQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<List<CashAccountSummaryDto>>> Handle(GetCashAccountsWithBalanceAlertsQuery request, CancellationToken cancellationToken)
    {
        var cashAccounts = await _unitOfWork.CashAccounts.GetWithBalanceAlertsAsync(cancellationToken);

        var dtos = cashAccounts.Select(ca => new CashAccountSummaryDto
        {
            Id = ca.Id,
            Code = ca.Code,
            Name = ca.Name,
            Currency = ca.Currency,
            AccountType = (CashAccountTypeDto)(int)ca.AccountType,
            AccountTypeName = GetAccountTypeName(ca.AccountType),
            Balance = ca.Balance.Amount,
            IsActive = ca.IsActive,
            IsDefault = ca.IsDefault,
            BranchName = ca.BranchName,
            ResponsibleUserName = ca.ResponsibleUserName,
            IsBelowMinimumBalance = ca.IsBelowMinimumBalance(),
            IsAboveMaximumBalance = ca.IsAboveMaximumBalance()
        }).ToList();

        return Result<List<CashAccountSummaryDto>>.Success(dtos);
    }

    private static string GetAccountTypeName(CashAccountType accountType)
    {
        return accountType switch
        {
            CashAccountType.TRY => "TL Kasası",
            CashAccountType.ForeignCurrency => "Döviz Kasası",
            CashAccountType.POS => "POS Kasası",
            CashAccountType.CashRegister => "Yazar Kasa",
            CashAccountType.Branch => "Şube Kasası",
            CashAccountType.Headquarters => "Merkez Kasa",
            _ => accountType.ToString()
        };
    }
}

#endregion

#region Get Cash Account By Code

/// <summary>
/// Query to get a cash account by code
/// </summary>
public class GetCashAccountByCodeQuery : IRequest<Result<CashAccountDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public string Code { get; set; } = string.Empty;
}

/// <summary>
/// Handler for GetCashAccountByCodeQuery
/// </summary>
public class GetCashAccountByCodeQueryHandler : IRequestHandler<GetCashAccountByCodeQuery, Result<CashAccountDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetCashAccountByCodeQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<CashAccountDto>> Handle(GetCashAccountByCodeQuery request, CancellationToken cancellationToken)
    {
        var cashAccount = await _unitOfWork.CashAccounts.GetByCodeAsync(request.Code, cancellationToken);
        if (cashAccount == null)
        {
            return Result<CashAccountDto>.Failure(
                Error.NotFound("CashAccount", $"'{request.Code}' kodlu kasa hesabı bulunamadı"));
        }

        var dto = CreateCashAccountCommandHandler.MapToDto(cashAccount);
        return Result<CashAccountDto>.Success(dto);
    }
}

#endregion

#region Get Cash Accounts By Currency

/// <summary>
/// Query to get cash accounts by currency
/// </summary>
public class GetCashAccountsByCurrencyQuery : IRequest<Result<List<CashAccountSummaryDto>>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public string Currency { get; set; } = "TRY";
}

/// <summary>
/// Handler for GetCashAccountsByCurrencyQuery
/// </summary>
public class GetCashAccountsByCurrencyQueryHandler : IRequestHandler<GetCashAccountsByCurrencyQuery, Result<List<CashAccountSummaryDto>>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetCashAccountsByCurrencyQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<List<CashAccountSummaryDto>>> Handle(GetCashAccountsByCurrencyQuery request, CancellationToken cancellationToken)
    {
        var cashAccounts = await _unitOfWork.CashAccounts.AsQueryable()
            .Where(c => c.Currency == request.Currency && c.IsActive)
            .ToListAsync(cancellationToken);

        var dtos = cashAccounts.Select(ca => new CashAccountSummaryDto
        {
            Id = ca.Id,
            Code = ca.Code,
            Name = ca.Name,
            Currency = ca.Currency,
            AccountType = (CashAccountTypeDto)(int)ca.AccountType,
            AccountTypeName = GetCashAccountTypeName(ca.AccountType),
            Balance = ca.Balance.Amount,
            IsActive = ca.IsActive,
            IsDefault = ca.IsDefault,
            BranchName = ca.BranchName,
            ResponsibleUserName = ca.ResponsibleUserName,
            IsBelowMinimumBalance = ca.IsBelowMinimumBalance(),
            IsAboveMaximumBalance = ca.IsAboveMaximumBalance()
        }).ToList();

        return Result<List<CashAccountSummaryDto>>.Success(dtos);
    }

    private static string GetCashAccountTypeName(CashAccountType accountType)
    {
        return accountType switch
        {
            CashAccountType.TRY => "TL Kasası",
            CashAccountType.ForeignCurrency => "Döviz Kasası",
            CashAccountType.POS => "POS Kasası",
            CashAccountType.CashRegister => "Yazar Kasa",
            CashAccountType.Branch => "Şube Kasası",
            CashAccountType.Headquarters => "Merkez Kasa",
            _ => accountType.ToString()
        };
    }
}

#endregion

#region Get Cash Account Balance Summary

/// <summary>
/// Query to get cash account balance summary
/// </summary>
public class GetCashAccountBalanceSummaryQuery : IRequest<Result<CashAccountBalanceSummaryDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public string? Currency { get; set; }
}

/// <summary>
/// Handler for GetCashAccountBalanceSummaryQuery
/// </summary>
public class GetCashAccountBalanceSummaryQueryHandler : IRequestHandler<GetCashAccountBalanceSummaryQuery, Result<CashAccountBalanceSummaryDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetCashAccountBalanceSummaryQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<CashAccountBalanceSummaryDto>> Handle(GetCashAccountBalanceSummaryQuery request, CancellationToken cancellationToken)
    {
        var allCashAccounts = await _unitOfWork.CashAccounts.GetAllAsync(cancellationToken);
        var activeAccounts = allCashAccounts.Where(ca => ca.IsActive).ToList();

        // Group by currency
        var balancesByCurrency = activeAccounts
            .GroupBy(ca => ca.Currency)
            .Select(g => new CashCurrencyBalanceDto
            {
                Currency = g.Key,
                TotalBalance = g.Sum(ca => ca.Balance.Amount),
                AccountCount = g.Count()
            })
            .ToList();

        var summary = new CashAccountBalanceSummaryDto
        {
            TotalBalance = activeAccounts.Sum(ca => ca.Balance.Amount),
            Currency = "TRY",
            ActiveAccountCount = activeAccounts.Count,
            TotalAccountCount = allCashAccounts.Count(),
            BalancesByCurrency = balancesByCurrency,
            AccountsBelowMinimumCount = activeAccounts.Count(ca => ca.IsBelowMinimumBalance()),
            AccountsAboveMaximumCount = activeAccounts.Count(ca => ca.IsAboveMaximumBalance())
        };

        return Result<CashAccountBalanceSummaryDto>.Success(summary);
    }
}

#endregion
