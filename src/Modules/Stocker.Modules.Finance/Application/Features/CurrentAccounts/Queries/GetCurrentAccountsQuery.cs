using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Finance.Application.DTOs;
using Stocker.Modules.Finance.Domain.Enums;
using Stocker.Modules.Finance.Interfaces;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Finance.Application.Features.CurrentAccounts.Queries;

/// <summary>
/// Query to get all current accounts with optional filtering
/// </summary>
public class GetCurrentAccountsQuery : IRequest<Result<PagedResult<CurrentAccountSummaryDto>>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public string? SearchTerm { get; set; }
    public CurrentAccountType? AccountType { get; set; }
    public CurrentAccountStatus? Status { get; set; }
    public RiskStatus? RiskStatus { get; set; }
    public bool? HasBalance { get; set; }
    public string? SortBy { get; set; }
    public bool SortDescending { get; set; }
}

/// <summary>
/// Handler for GetCurrentAccountsQuery
/// </summary>
public class GetCurrentAccountsQueryHandler : IRequestHandler<GetCurrentAccountsQuery, Result<PagedResult<CurrentAccountSummaryDto>>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetCurrentAccountsQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PagedResult<CurrentAccountSummaryDto>>> Handle(GetCurrentAccountsQuery request, CancellationToken cancellationToken)
    {
        var query = _unitOfWork.CurrentAccounts.AsQueryable();

        // Apply filters
        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var searchLower = request.SearchTerm.ToLower();
            query = query.Where(a =>
                a.Code.ToLower().Contains(searchLower) ||
                a.Name.ToLower().Contains(searchLower) ||
                (a.TaxNumber != null && a.TaxNumber.Contains(searchLower)) ||
                (a.Email != null && a.Email.ToLower().Contains(searchLower)));
        }

        if (request.AccountType.HasValue)
        {
            query = query.Where(a => a.AccountType == request.AccountType.Value);
        }

        if (request.Status.HasValue)
        {
            query = query.Where(a => a.Status == request.Status.Value);
        }

        if (request.RiskStatus.HasValue)
        {
            query = query.Where(a => a.RiskStatus == request.RiskStatus.Value);
        }

        if (request.HasBalance.HasValue)
        {
            if (request.HasBalance.Value)
            {
                query = query.Where(a => a.Balance.Amount != 0);
            }
            else
            {
                query = query.Where(a => a.Balance.Amount == 0);
            }
        }

        // Get total count
        var totalCount = await query.CountAsync(cancellationToken);

        // Apply sorting
        query = request.SortBy?.ToLower() switch
        {
            "code" => request.SortDescending
                ? query.OrderByDescending(a => a.Code)
                : query.OrderBy(a => a.Code),
            "name" => request.SortDescending
                ? query.OrderByDescending(a => a.Name)
                : query.OrderBy(a => a.Name),
            "balance" => request.SortDescending
                ? query.OrderByDescending(a => a.Balance.Amount)
                : query.OrderBy(a => a.Balance.Amount),
            "creditlimit" => request.SortDescending
                ? query.OrderByDescending(a => a.CreditLimit.Amount)
                : query.OrderBy(a => a.CreditLimit.Amount),
            "riskstatus" => request.SortDescending
                ? query.OrderByDescending(a => a.RiskStatus)
                : query.OrderBy(a => a.RiskStatus),
            _ => request.SortDescending
                ? query.OrderByDescending(a => a.CreatedDate)
                : query.OrderBy(a => a.CreatedDate)
        };

        // Apply pagination
        var accounts = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(a => new CurrentAccountSummaryDto
            {
                Id = a.Id,
                Code = a.Code,
                Name = a.Name,
                AccountType = a.AccountType,
                Currency = a.Currency,
                Balance = a.Balance.Amount,
                CreditLimit = a.CreditLimit.Amount,
                AvailableCredit = a.AvailableCredit.Amount,
                RiskStatus = a.RiskStatus,
                Status = a.Status
            })
            .ToListAsync(cancellationToken);

        var result = new PagedResult<CurrentAccountSummaryDto>(
            accounts,
            request.PageNumber,
            request.PageSize,
            totalCount);

        return Result<PagedResult<CurrentAccountSummaryDto>>.Success(result);
    }
}

/// <summary>
/// Query to get a current account by ID
/// </summary>
public class GetCurrentAccountByIdQuery : IRequest<Result<CurrentAccountDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public bool IncludeTransactions { get; set; }
}

/// <summary>
/// Handler for GetCurrentAccountByIdQuery
/// </summary>
public class GetCurrentAccountByIdQueryHandler : IRequestHandler<GetCurrentAccountByIdQuery, Result<CurrentAccountDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetCurrentAccountByIdQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<CurrentAccountDto>> Handle(GetCurrentAccountByIdQuery request, CancellationToken cancellationToken)
    {
        var account = request.IncludeTransactions
            ? await _unitOfWork.CurrentAccounts.GetWithTransactionsAsync(request.Id, cancellationToken)
            : await _unitOfWork.CurrentAccounts.GetByIdAsync(request.Id, cancellationToken);

        if (account == null)
        {
            return Result<CurrentAccountDto>.Failure(
                Error.NotFound("CurrentAccount", $"ID {request.Id} ile cari hesap bulunamadı"));
        }

        var dto = new CurrentAccountDto
        {
            Id = account.Id,
            Code = account.Code,
            Name = account.Name,
            ShortName = account.ShortName,
            AccountType = account.AccountType,
            TaxLiabilityType = account.TaxLiabilityType,
            TaxOffice = account.TaxOffice,
            TaxNumber = account.TaxNumber,
            IdentityNumber = account.IdentityNumber,
            TradeRegistryNumber = account.TradeRegistryNumber,
            MersisNumber = account.MersisNumber,
            IsEInvoiceRegistered = account.IsEInvoiceRegistered,
            EInvoiceAlias = account.EInvoiceAlias,
            KepAddress = account.KepAddress,
            Email = account.Email,
            Phone = account.Phone,
            Fax = account.Fax,
            Website = account.Website,
            Address = account.Address,
            District = account.District,
            City = account.City,
            Country = account.Country,
            PostalCode = account.PostalCode,
            Currency = account.Currency,
            DebitBalance = account.DebitBalance.Amount,
            CreditBalance = account.CreditBalance.Amount,
            Balance = account.Balance.Amount,
            CreditLimit = account.CreditLimit.Amount,
            UsedCredit = account.UsedCredit.Amount,
            AvailableCredit = account.AvailableCredit.Amount,
            RiskStatus = account.RiskStatus,
            RiskNotes = account.RiskNotes,
            PaymentTermType = account.PaymentTermType,
            PaymentDays = account.PaymentDays,
            DiscountRate = account.DiscountRate,
            DefaultVatRate = account.DefaultVatRate,
            ApplyWithholding = account.ApplyWithholding,
            WithholdingCode = account.WithholdingCode,
            Status = account.Status,
            Category = account.Category,
            Tags = account.Tags,
            Notes = account.Notes,
            ReceivableAccountId = account.ReceivableAccountId,
            PayableAccountId = account.PayableAccountId,
            CrmCustomerId = account.CrmCustomerId,
            PurchaseSupplierId = account.PurchaseSupplierId,
            CreatedAt = account.CreatedDate,
            UpdatedAt = account.UpdatedDate,
            RecentTransactions = request.IncludeTransactions
                ? account.Transactions
                    .OrderByDescending(t => t.TransactionDate)
                    .Take(20)
                    .Select(t => new CurrentAccountTransactionDto
                    {
                        Id = t.Id,
                        CurrentAccountId = t.CurrentAccountId,
                        TransactionType = t.TransactionType,
                        TransactionDate = t.TransactionDate,
                        DueDate = t.DueDate,
                        DocumentNumber = t.TransactionNumber,
                        Description = t.Description,
                        DebitAmount = t.DebitAmount.Amount,
                        CreditAmount = t.CreditAmount.Amount,
                        BalanceAfter = t.RunningBalance.Amount,
                        Currency = t.Currency,
                        ExchangeRate = t.ExchangeRate,
                        CreatedAt = t.CreatedDate
                    }).ToList()
                : new List<CurrentAccountTransactionDto>()
        };

        return Result<CurrentAccountDto>.Success(dto);
    }
}

/// <summary>
/// Query to get current account statement
/// </summary>
public class GetCurrentAccountStatementQuery : IRequest<Result<CurrentAccountStatementDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int CurrentAccountId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
}

/// <summary>
/// Handler for GetCurrentAccountStatementQuery
/// </summary>
public class GetCurrentAccountStatementQueryHandler : IRequestHandler<GetCurrentAccountStatementQuery, Result<CurrentAccountStatementDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetCurrentAccountStatementQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<CurrentAccountStatementDto>> Handle(GetCurrentAccountStatementQuery request, CancellationToken cancellationToken)
    {
        var account = await _unitOfWork.CurrentAccounts.GetWithTransactionsAsync(request.CurrentAccountId, cancellationToken);

        if (account == null)
        {
            return Result<CurrentAccountStatementDto>.Failure(
                Error.NotFound("CurrentAccount", $"ID {request.CurrentAccountId} ile cari hesap bulunamadı"));
        }

        // Get transactions before start date for opening balance
        var transactionsBeforeStart = account.Transactions
            .Where(t => t.TransactionDate < request.StartDate)
            .ToList();

        var openingBalance = transactionsBeforeStart.Sum(t => t.DebitAmount.Amount - t.CreditAmount.Amount);

        // Get transactions in date range
        var transactions = account.Transactions
            .Where(t => t.TransactionDate >= request.StartDate && t.TransactionDate <= request.EndDate)
            .OrderBy(t => t.TransactionDate)
            .ThenBy(t => t.Id)
            .ToList();

        var totalDebit = transactions.Sum(t => t.DebitAmount.Amount);
        var totalCredit = transactions.Sum(t => t.CreditAmount.Amount);
        var closingBalance = openingBalance + totalDebit - totalCredit;

        // Calculate running balance
        var runningBalance = openingBalance;
        var transactionDtos = transactions.Select(t =>
        {
            runningBalance += t.DebitAmount.Amount - t.CreditAmount.Amount;
            return new CurrentAccountTransactionDto
            {
                Id = t.Id,
                CurrentAccountId = t.CurrentAccountId,
                CurrentAccountName = account.Name,
                TransactionType = t.TransactionType,
                TransactionTypeName = GetTransactionTypeName(t.TransactionType),
                TransactionDate = t.TransactionDate,
                DueDate = t.DueDate,
                DocumentNumber = t.TransactionNumber,
                Description = t.Description,
                DebitAmount = t.DebitAmount.Amount,
                CreditAmount = t.CreditAmount.Amount,
                BalanceAfter = runningBalance,
                Currency = t.Currency,
                ExchangeRate = t.ExchangeRate,
                CreatedAt = t.CreatedDate
            };
        }).ToList();

        var statement = new CurrentAccountStatementDto
        {
            CurrentAccountId = account.Id,
            Code = account.Code,
            Name = account.Name,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            OpeningBalance = openingBalance,
            TotalDebit = totalDebit,
            TotalCredit = totalCredit,
            ClosingBalance = closingBalance,
            Currency = account.Currency,
            Transactions = transactionDtos
        };

        return Result<CurrentAccountStatementDto>.Success(statement);
    }

    private static string GetTransactionTypeName(CurrentAccountTransactionType type)
    {
        return type switch
        {
            CurrentAccountTransactionType.SalesInvoice => "Satış Faturası",
            CurrentAccountTransactionType.PurchaseInvoice => "Alış Faturası",
            CurrentAccountTransactionType.SalesReturnInvoice => "Satış İade Faturası",
            CurrentAccountTransactionType.PurchaseReturnInvoice => "Alış İade Faturası",
            CurrentAccountTransactionType.Collection => "Tahsilat",
            CurrentAccountTransactionType.Payment => "Ödeme",
            CurrentAccountTransactionType.CheckReceived => "Çek Alındı",
            CurrentAccountTransactionType.CheckGiven => "Çek Verildi",
            CurrentAccountTransactionType.NoteReceived => "Senet Alındı",
            CurrentAccountTransactionType.NoteGiven => "Senet Verildi",
            CurrentAccountTransactionType.Transfer => "Virman",
            CurrentAccountTransactionType.OpeningEntry => "Açılış Fişi",
            CurrentAccountTransactionType.CreditMemo => "Alacak Dekontu",
            CurrentAccountTransactionType.DebitMemo => "Borç Dekontu",
            CurrentAccountTransactionType.ExpenseReflection => "Masraf Yansıtma",
            CurrentAccountTransactionType.ExchangeRateDifference => "Kur Farkı",
            CurrentAccountTransactionType.MaturityDifference => "Vade Farkı",
            CurrentAccountTransactionType.Interest => "Faiz",
            _ => "Diğer"
        };
    }
}
