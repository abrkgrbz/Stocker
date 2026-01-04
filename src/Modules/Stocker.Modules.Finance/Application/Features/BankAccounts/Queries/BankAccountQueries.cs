using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Finance.Application.DTOs;
using Stocker.Modules.Finance.Application.Features.BankAccounts.Commands;
using Stocker.Modules.Finance.Domain.Entities;
using Stocker.Modules.Finance.Domain.Repositories;
using Stocker.Modules.Finance.Interfaces;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Finance.Application.Features.BankAccounts.Queries;

/// <summary>
/// Query to get paginated bank accounts
/// </summary>
public class GetBankAccountsQuery : IRequest<Result<PagedResult<BankAccountSummaryDto>>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public BankAccountFilterDto? Filter { get; set; }
    public string? SortBy { get; set; }
    public bool SortDescending { get; set; }
}

/// <summary>
/// Handler for GetBankAccountsQuery
/// </summary>
public class GetBankAccountsQueryHandler : IRequestHandler<GetBankAccountsQuery, Result<PagedResult<BankAccountSummaryDto>>>
{
    private readonly IFinanceRepository<BankAccount> _bankAccountRepository;

    public GetBankAccountsQueryHandler(IFinanceRepository<BankAccount> bankAccountRepository)
    {
        _bankAccountRepository = bankAccountRepository;
    }

    public async Task<Result<PagedResult<BankAccountSummaryDto>>> Handle(GetBankAccountsQuery request, CancellationToken cancellationToken)
    {
        var query = _bankAccountRepository.AsQueryable();

        // Apply filters
        if (request.Filter != null)
        {
            if (!string.IsNullOrEmpty(request.Filter.SearchTerm))
            {
                var searchTerm = request.Filter.SearchTerm.ToLower();
                query = query.Where(b =>
                    b.Code.ToLower().Contains(searchTerm) ||
                    b.Name.ToLower().Contains(searchTerm) ||
                    b.BankName.ToLower().Contains(searchTerm) ||
                    b.AccountNumber.ToLower().Contains(searchTerm) ||
                    b.Iban.ToLower().Contains(searchTerm));
            }

            if (request.Filter.AccountType.HasValue)
            {
                query = query.Where(b => b.AccountType == request.Filter.AccountType.Value);
            }

            if (!string.IsNullOrEmpty(request.Filter.Currency))
            {
                query = query.Where(b => b.Currency == request.Filter.Currency);
            }

            if (request.Filter.IsActive.HasValue)
            {
                query = query.Where(b => b.IsActive == request.Filter.IsActive.Value);
            }

            if (request.Filter.IsDefault.HasValue)
            {
                query = query.Where(b => b.IsDefault == request.Filter.IsDefault.Value);
            }

            if (request.Filter.IsPosAccount.HasValue)
            {
                query = query.Where(b => b.IsPosAccount == request.Filter.IsPosAccount.Value);
            }

            if (request.Filter.HasBankIntegration.HasValue)
            {
                query = query.Where(b => b.HasBankIntegration == request.Filter.HasBankIntegration.Value);
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
            "bankname" => sortDesc ? query.OrderByDescending(b => b.BankName) : query.OrderBy(b => b.BankName),
            "balance" => sortDesc ? query.OrderByDescending(b => b.Balance.Amount) : query.OrderBy(b => b.Balance.Amount),
            "accounttype" => sortDesc ? query.OrderByDescending(b => b.AccountType) : query.OrderBy(b => b.AccountType),
            "isactive" => sortDesc ? query.OrderByDescending(b => b.IsActive) : query.OrderBy(b => b.IsActive),
            "isdefault" => sortDesc ? query.OrderByDescending(b => b.IsDefault) : query.OrderBy(b => b.IsDefault),
            _ => sortDesc ? query.OrderByDescending(b => b.Code) : query.OrderBy(b => b.Code)
        };

        // Apply pagination
        var pageNumber = request.Filter?.PageNumber ?? 1;
        var pageSize = request.Filter?.PageSize ?? 20;
        var bankAccounts = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var dtos = bankAccounts.Select(CreateBankAccountCommandHandler.MapToSummaryDto).ToList();

        return Result<PagedResult<BankAccountSummaryDto>>.Success(
            new PagedResult<BankAccountSummaryDto>(dtos, totalCount, pageNumber, pageSize));
    }
}

/// <summary>
/// Query to get a bank account by ID
/// </summary>
public class GetBankAccountByIdQuery : IRequest<Result<BankAccountDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

/// <summary>
/// Handler for GetBankAccountByIdQuery
/// </summary>
public class GetBankAccountByIdQueryHandler : IRequestHandler<GetBankAccountByIdQuery, Result<BankAccountDto>>
{
    private readonly IFinanceRepository<BankAccount> _bankAccountRepository;

    public GetBankAccountByIdQueryHandler(IFinanceRepository<BankAccount> bankAccountRepository)
    {
        _bankAccountRepository = bankAccountRepository;
    }

    public async Task<Result<BankAccountDto>> Handle(GetBankAccountByIdQuery request, CancellationToken cancellationToken)
    {
        var bankAccount = await _bankAccountRepository.GetByIdAsync(request.Id, cancellationToken);
        if (bankAccount == null)
        {
            return Result<BankAccountDto>.Failure(
                Error.NotFound("BankAccount", $"ID {request.Id} ile banka hesabi bulunamadi"));
        }

        var dto = CreateBankAccountCommandHandler.MapToDto(bankAccount);
        return Result<BankAccountDto>.Success(dto);
    }
}

/// <summary>
/// Query to get active bank accounts
/// </summary>
public class GetActiveBankAccountsQuery : IRequest<Result<List<BankAccountSummaryDto>>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public string? Currency { get; set; }
}

/// <summary>
/// Handler for GetActiveBankAccountsQuery
/// </summary>
public class GetActiveBankAccountsQueryHandler : IRequestHandler<GetActiveBankAccountsQuery, Result<List<BankAccountSummaryDto>>>
{
    private readonly IFinanceRepository<BankAccount> _bankAccountRepository;

    public GetActiveBankAccountsQueryHandler(IFinanceRepository<BankAccount> bankAccountRepository)
    {
        _bankAccountRepository = bankAccountRepository;
    }

    public async Task<Result<List<BankAccountSummaryDto>>> Handle(GetActiveBankAccountsQuery request, CancellationToken cancellationToken)
    {
        var query = _bankAccountRepository.AsQueryable()
            .Where(b => b.IsActive);

        // Filter by currency if specified
        if (!string.IsNullOrEmpty(request.Currency))
        {
            query = query.Where(b => b.Currency == request.Currency);
        }

        var bankAccounts = await query
            .OrderByDescending(b => b.IsDefault)
            .ThenBy(b => b.Code)
            .ToListAsync(cancellationToken);

        var dtos = bankAccounts.Select(CreateBankAccountCommandHandler.MapToSummaryDto).ToList();

        return Result<List<BankAccountSummaryDto>>.Success(dtos);
    }
}

/// <summary>
/// Query to get the default bank account
/// </summary>
public class GetDefaultBankAccountQuery : IRequest<Result<BankAccountDto?>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public string? Currency { get; set; }
}

/// <summary>
/// Handler for GetDefaultBankAccountQuery
/// </summary>
public class GetDefaultBankAccountQueryHandler : IRequestHandler<GetDefaultBankAccountQuery, Result<BankAccountDto?>>
{
    private readonly IFinanceRepository<BankAccount> _bankAccountRepository;

    public GetDefaultBankAccountQueryHandler(IFinanceRepository<BankAccount> bankAccountRepository)
    {
        _bankAccountRepository = bankAccountRepository;
    }

    public async Task<Result<BankAccountDto?>> Handle(GetDefaultBankAccountQuery request, CancellationToken cancellationToken)
    {
        var query = _bankAccountRepository.AsQueryable()
            .Where(b => b.IsDefault && b.IsActive);

        // Filter by currency if specified
        if (!string.IsNullOrEmpty(request.Currency))
        {
            query = query.Where(b => b.Currency == request.Currency);
        }
        else
        {
            // Default to TRY if no currency specified
            query = query.Where(b => b.Currency == "TRY");
        }

        var bankAccount = await query.FirstOrDefaultAsync(cancellationToken);

        if (bankAccount == null)
        {
            return Result<BankAccountDto?>.Success(null);
        }

        var dto = CreateBankAccountCommandHandler.MapToDto(bankAccount);
        return Result<BankAccountDto?>.Success(dto);
    }
}

/// <summary>
/// Query to get a bank account by IBAN
/// </summary>
public class GetBankAccountByIbanQuery : IRequest<Result<BankAccountDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public string Iban { get; set; } = string.Empty;
}

/// <summary>
/// Handler for GetBankAccountByIbanQuery
/// </summary>
public class GetBankAccountByIbanQueryHandler : IRequestHandler<GetBankAccountByIbanQuery, Result<BankAccountDto>>
{
    private readonly IFinanceRepository<BankAccount> _bankAccountRepository;

    public GetBankAccountByIbanQueryHandler(IFinanceRepository<BankAccount> bankAccountRepository)
    {
        _bankAccountRepository = bankAccountRepository;
    }

    public async Task<Result<BankAccountDto>> Handle(GetBankAccountByIbanQuery request, CancellationToken cancellationToken)
    {
        var bankAccount = await _bankAccountRepository.AsQueryable()
            .FirstOrDefaultAsync(b => b.Iban == request.Iban, cancellationToken);

        if (bankAccount == null)
        {
            return Result<BankAccountDto>.Failure(
                Error.NotFound("BankAccount", $"IBAN {request.Iban} ile banka hesabi bulunamadi"));
        }

        var dto = CreateBankAccountCommandHandler.MapToDto(bankAccount);
        return Result<BankAccountDto>.Success(dto);
    }
}

/// <summary>
/// Query to get bank accounts by currency
/// </summary>
public class GetBankAccountsByCurrencyQuery : IRequest<Result<List<BankAccountSummaryDto>>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public string Currency { get; set; } = "TRY";
}

/// <summary>
/// Handler for GetBankAccountsByCurrencyQuery
/// </summary>
public class GetBankAccountsByCurrencyQueryHandler : IRequestHandler<GetBankAccountsByCurrencyQuery, Result<List<BankAccountSummaryDto>>>
{
    private readonly IFinanceRepository<BankAccount> _bankAccountRepository;

    public GetBankAccountsByCurrencyQueryHandler(IFinanceRepository<BankAccount> bankAccountRepository)
    {
        _bankAccountRepository = bankAccountRepository;
    }

    public async Task<Result<List<BankAccountSummaryDto>>> Handle(GetBankAccountsByCurrencyQuery request, CancellationToken cancellationToken)
    {
        var bankAccounts = await _bankAccountRepository.AsQueryable()
            .Where(b => b.Currency == request.Currency && b.IsActive)
            .OrderByDescending(b => b.IsDefault)
            .ThenBy(b => b.Code)
            .ToListAsync(cancellationToken);

        var dtos = bankAccounts.Select(CreateBankAccountCommandHandler.MapToSummaryDto).ToList();
        return Result<List<BankAccountSummaryDto>>.Success(dtos);
    }
}

/// <summary>
/// Query to get bank account balance summary
/// </summary>
public class GetBankAccountBalanceSummaryQuery : IRequest<Result<BankAccountBalanceSummaryDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public string? Currency { get; set; }
}

/// <summary>
/// Handler for GetBankAccountBalanceSummaryQuery
/// </summary>
public class GetBankAccountBalanceSummaryQueryHandler : IRequestHandler<GetBankAccountBalanceSummaryQuery, Result<BankAccountBalanceSummaryDto>>
{
    private readonly IFinanceRepository<BankAccount> _bankAccountRepository;

    public GetBankAccountBalanceSummaryQueryHandler(IFinanceRepository<BankAccount> bankAccountRepository)
    {
        _bankAccountRepository = bankAccountRepository;
    }

    public async Task<Result<BankAccountBalanceSummaryDto>> Handle(GetBankAccountBalanceSummaryQuery request, CancellationToken cancellationToken)
    {
        var bankAccounts = await _bankAccountRepository.AsQueryable()
            .ToListAsync(cancellationToken);

        var activeAccounts = bankAccounts.Where(b => b.IsActive).ToList();

        // Group by currency
        var balancesByCurrency = activeAccounts
            .GroupBy(b => b.Currency)
            .Select(g => new CurrencyBalanceDto
            {
                Currency = g.Key,
                Balance = g.Sum(b => b.Balance.Amount),
                AvailableBalance = g.Sum(b => b.AvailableBalance.Amount),
                AccountCount = g.Count()
            })
            .ToList();

        var summary = new BankAccountBalanceSummaryDto
        {
            TotalBalance = activeAccounts.Sum(b => b.Balance.Amount),
            TotalAvailableBalance = activeAccounts.Sum(b => b.AvailableBalance.Amount),
            TotalBlockedBalance = activeAccounts.Sum(b => b.BlockedBalance?.Amount ?? 0),
            Currency = "TRY",
            ActiveAccountCount = activeAccounts.Count,
            TotalAccountCount = bankAccounts.Count,
            BalancesByCurrency = balancesByCurrency
        };

        return Result<BankAccountBalanceSummaryDto>.Success(summary);
    }
}
