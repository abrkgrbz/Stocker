using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Finance.Application.DTOs;
using Stocker.Modules.Finance.Application.Features.Accounts.Commands;
using Stocker.Modules.Finance.Domain.Entities;
using Stocker.Modules.Finance.Domain.Enums;
using Stocker.Modules.Finance.Interfaces;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Finance.Application.Features.Accounts.Queries;

#region Get Accounts (Paginated)

/// <summary>
/// Sayfalanmış hesap listesi sorgusu
/// </summary>
public class GetAccountsQuery : IRequest<Result<PagedResult<AccountSummaryDto>>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public AccountFilterDto? Filter { get; set; }
}

/// <summary>
/// GetAccountsQuery işleyicisi
/// </summary>
public class GetAccountsQueryHandler : IRequestHandler<GetAccountsQuery, Result<PagedResult<AccountSummaryDto>>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetAccountsQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PagedResult<AccountSummaryDto>>> Handle(GetAccountsQuery request, CancellationToken cancellationToken)
    {
        var query = _unitOfWork.Accounts.AsQueryable();

        // Filtreleri uygula
        if (request.Filter != null)
        {
            if (!string.IsNullOrEmpty(request.Filter.SearchTerm))
            {
                var searchTerm = request.Filter.SearchTerm.ToLower();
                query = query.Where(a =>
                    a.Code.ToLower().Contains(searchTerm) ||
                    a.Name.ToLower().Contains(searchTerm) ||
                    (a.Description != null && a.Description.ToLower().Contains(searchTerm)));
            }

            if (request.Filter.AccountType.HasValue)
            {
                query = query.Where(a => a.AccountType == request.Filter.AccountType.Value);
            }

            if (request.Filter.SubGroup.HasValue)
            {
                query = query.Where(a => a.SubGroup == request.Filter.SubGroup.Value);
            }

            if (!string.IsNullOrEmpty(request.Filter.Currency))
            {
                query = query.Where(a => a.Currency == request.Filter.Currency);
            }

            if (request.Filter.IsActive.HasValue)
            {
                query = query.Where(a => a.IsActive == request.Filter.IsActive.Value);
            }

            if (request.Filter.IsSystemAccount.HasValue)
            {
                query = query.Where(a => a.IsSystemAccount == request.Filter.IsSystemAccount.Value);
            }

            if (request.Filter.AcceptsTransactions.HasValue)
            {
                query = query.Where(a => a.AcceptsTransactions == request.Filter.AcceptsTransactions.Value);
            }

            if (request.Filter.Level.HasValue)
            {
                query = query.Where(a => a.Level == request.Filter.Level.Value);
            }

            if (request.Filter.ParentAccountId.HasValue)
            {
                query = query.Where(a => a.ParentAccountId == request.Filter.ParentAccountId.Value);
            }

            if (request.Filter.RootOnly.HasValue && request.Filter.RootOnly.Value)
            {
                query = query.Where(a => a.ParentAccountId == null);
            }
        }

        // Toplam sayı
        var totalCount = await query.CountAsync(cancellationToken);

        // Sıralama
        var sortBy = request.Filter?.SortBy ?? "Code";
        var sortDesc = request.Filter?.SortDescending ?? false;

        query = sortBy.ToLower() switch
        {
            "name" => sortDesc ? query.OrderByDescending(a => a.Name) : query.OrderBy(a => a.Name),
            "accounttype" => sortDesc ? query.OrderByDescending(a => a.AccountType) : query.OrderBy(a => a.AccountType),
            "balance" => sortDesc ? query.OrderByDescending(a => a.Balance.Amount) : query.OrderBy(a => a.Balance.Amount),
            "level" => sortDesc ? query.OrderByDescending(a => a.Level) : query.OrderBy(a => a.Level),
            "isactive" => sortDesc ? query.OrderByDescending(a => a.IsActive) : query.OrderBy(a => a.IsActive),
            _ => sortDesc ? query.OrderByDescending(a => a.Code) : query.OrderBy(a => a.Code)
        };

        // Sayfalama
        var pageNumber = request.Filter?.PageNumber ?? 1;
        var pageSize = request.Filter?.PageSize ?? 20;
        var accounts = await query
            .Include(a => a.SubAccounts)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var dtos = accounts.Select(CreateAccountCommandHandler.MapToSummaryDto).ToList();

        return Result<PagedResult<AccountSummaryDto>>.Success(
            new PagedResult<AccountSummaryDto>(dtos, totalCount, pageNumber, pageSize));
    }
}

#endregion

#region Get Account By Id

/// <summary>
/// ID ile hesap sorgulama
/// </summary>
public class GetAccountByIdQuery : IRequest<Result<AccountDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

/// <summary>
/// GetAccountByIdQuery işleyicisi
/// </summary>
public class GetAccountByIdQueryHandler : IRequestHandler<GetAccountByIdQuery, Result<AccountDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetAccountByIdQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<AccountDto>> Handle(GetAccountByIdQuery request, CancellationToken cancellationToken)
    {
        var account = await _unitOfWork.Accounts.GetWithDetailsAsync(request.Id, cancellationToken);
        if (account == null)
        {
            return Result<AccountDto>.Failure(
                Error.NotFound("Account", $"ID {request.Id} ile hesap bulunamadı"));
        }

        var dto = CreateAccountCommandHandler.MapToDto(account);
        return Result<AccountDto>.Success(dto);
    }
}

#endregion

#region Get Account By Code

/// <summary>
/// Kod ile hesap sorgulama
/// </summary>
public class GetAccountByCodeQuery : IRequest<Result<AccountDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public string Code { get; set; } = string.Empty;
}

/// <summary>
/// GetAccountByCodeQuery işleyicisi
/// </summary>
public class GetAccountByCodeQueryHandler : IRequestHandler<GetAccountByCodeQuery, Result<AccountDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetAccountByCodeQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<AccountDto>> Handle(GetAccountByCodeQuery request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Code))
        {
            return Result<AccountDto>.Failure(
                Error.Validation("Account.Code", "Hesap kodu boş olamaz"));
        }

        var account = await _unitOfWork.Accounts.GetByCodeAsync(request.Code, cancellationToken);
        if (account == null)
        {
            return Result<AccountDto>.Failure(
                Error.NotFound("Account", $"'{request.Code}' kodlu hesap bulunamadı"));
        }

        var dto = CreateAccountCommandHandler.MapToDto(account);
        return Result<AccountDto>.Success(dto);
    }
}

#endregion

#region Get Account Tree

/// <summary>
/// Hesap planı ağaç yapısı sorgusu
/// </summary>
public class GetAccountTreeQuery : IRequest<Result<List<AccountTreeNodeDto>>>, ITenantRequest
{
    public Guid TenantId { get; set; }

    /// <summary>
    /// Belirli bir hesap tipine göre filtrele (opsiyonel)
    /// </summary>
    public AccountType? AccountType { get; set; }

    /// <summary>
    /// Belirli bir üst hesabın altındaki ağacı getir (opsiyonel)
    /// </summary>
    public int? RootAccountId { get; set; }

    /// <summary>
    /// Sadece aktif hesapları getir
    /// </summary>
    public bool ActiveOnly { get; set; } = true;

    /// <summary>
    /// Maksimum derinlik (0 = sınırsız)
    /// </summary>
    public int MaxDepth { get; set; } = 0;
}

/// <summary>
/// GetAccountTreeQuery işleyicisi
/// </summary>
public class GetAccountTreeQueryHandler : IRequestHandler<GetAccountTreeQuery, Result<List<AccountTreeNodeDto>>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetAccountTreeQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<List<AccountTreeNodeDto>>> Handle(GetAccountTreeQuery request, CancellationToken cancellationToken)
    {
        var query = _unitOfWork.Accounts.AsQueryable();

        // Aktiflik filtresi
        if (request.ActiveOnly)
        {
            query = query.Where(a => a.IsActive);
        }

        // Hesap tipi filtresi
        if (request.AccountType.HasValue)
        {
            query = query.Where(a => a.AccountType == request.AccountType.Value);
        }

        // Tüm hesapları getir
        var allAccounts = await query
            .OrderBy(a => a.Code)
            .ToListAsync(cancellationToken);

        // Ağaç yapısını oluştur
        List<AccountTreeNodeDto> tree;

        if (request.RootAccountId.HasValue)
        {
            // Belirli bir kökten başla
            var rootAccount = allAccounts.FirstOrDefault(a => a.Id == request.RootAccountId.Value);
            if (rootAccount == null)
            {
                return Result<List<AccountTreeNodeDto>>.Failure(
                    Error.NotFound("Account", $"ID {request.RootAccountId} ile kök hesap bulunamadı"));
            }

            var rootNode = MapToTreeNode(rootAccount, allAccounts, 1, request.MaxDepth);
            tree = new List<AccountTreeNodeDto> { rootNode };
        }
        else
        {
            // Kök hesapları bul (ParentAccountId = null)
            var rootAccounts = allAccounts.Where(a => a.ParentAccountId == null).ToList();
            tree = rootAccounts.Select(a => MapToTreeNode(a, allAccounts, 1, request.MaxDepth)).ToList();
        }

        return Result<List<AccountTreeNodeDto>>.Success(tree);
    }

    private AccountTreeNodeDto MapToTreeNode(Account account, List<Account> allAccounts, int currentDepth, int maxDepth)
    {
        var node = new AccountTreeNodeDto
        {
            Id = account.Id,
            Code = account.Code,
            Name = account.Name,
            FullPath = BuildFullPath(account, allAccounts),
            ParentAccountId = account.ParentAccountId,
            AccountType = account.AccountType,
            AccountTypeName = GetAccountTypeName(account.AccountType),
            SubGroup = account.SubGroup,
            Currency = account.Currency,
            Balance = account.Balance.Amount,
            IsActive = account.IsActive,
            Level = account.Level,
            AcceptsTransactions = account.AcceptsTransactions,
            IsExpanded = false,
            HasChildren = allAccounts.Any(a => a.ParentAccountId == account.Id),
            Children = new List<AccountTreeNodeDto>()
        };

        // Alt hesapları ekle (derinlik sınırı kontrolü)
        if (maxDepth == 0 || currentDepth < maxDepth)
        {
            var children = allAccounts.Where(a => a.ParentAccountId == account.Id).ToList();
            node.Children = children.Select(c => MapToTreeNode(c, allAccounts, currentDepth + 1, maxDepth)).ToList();
        }

        return node;
    }

    private string BuildFullPath(Account account, List<Account> allAccounts)
    {
        var parts = new List<string> { account.Name };
        var currentAccount = account;

        while (currentAccount.ParentAccountId.HasValue)
        {
            var parent = allAccounts.FirstOrDefault(a => a.Id == currentAccount.ParentAccountId.Value);
            if (parent == null) break;
            parts.Insert(0, parent.Name);
            currentAccount = parent;
        }

        return string.Join(" > ", parts);
    }

    private static string GetAccountTypeName(AccountType type)
    {
        return type switch
        {
            AccountType.CurrentAssets => "Dönen Varlıklar",
            AccountType.NonCurrentAssets => "Duran Varlıklar",
            AccountType.ShortTermLiabilities => "Kısa Vadeli Yabancı Kaynaklar",
            AccountType.LongTermLiabilities => "Uzun Vadeli Yabancı Kaynaklar",
            AccountType.Equity => "Özkaynaklar",
            AccountType.Revenue => "Gelir Tablosu Hesapları",
            AccountType.Cost => "Maliyet Hesapları",
            AccountType.Reserved => "Serbest",
            AccountType.OffBalanceSheet => "Nazım Hesaplar",
            _ => type.ToString()
        };
    }
}

#endregion

#region Get Active Accounts

/// <summary>
/// Aktif hesapları listele (dropdown/seçim için)
/// </summary>
public class GetActiveAccountsQuery : IRequest<Result<List<AccountSummaryDto>>>, ITenantRequest
{
    public Guid TenantId { get; set; }

    /// <summary>
    /// Belirli bir hesap tipine göre filtrele (opsiyonel)
    /// </summary>
    public AccountType? AccountType { get; set; }

    /// <summary>
    /// Belirli bir alt gruba göre filtrele (opsiyonel)
    /// </summary>
    public AccountSubGroup? SubGroup { get; set; }

    /// <summary>
    /// Sadece hareket kabul eden hesapları getir
    /// </summary>
    public bool TransactionAccountsOnly { get; set; } = true;

    /// <summary>
    /// Para birimi filtresi (opsiyonel)
    /// </summary>
    public string? Currency { get; set; }
}

/// <summary>
/// GetActiveAccountsQuery işleyicisi
/// </summary>
public class GetActiveAccountsQueryHandler : IRequestHandler<GetActiveAccountsQuery, Result<List<AccountSummaryDto>>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetActiveAccountsQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<List<AccountSummaryDto>>> Handle(GetActiveAccountsQuery request, CancellationToken cancellationToken)
    {
        var query = _unitOfWork.Accounts.AsQueryable()
            .Where(a => a.IsActive);

        // Filtreler
        if (request.AccountType.HasValue)
        {
            query = query.Where(a => a.AccountType == request.AccountType.Value);
        }

        if (request.SubGroup.HasValue)
        {
            query = query.Where(a => a.SubGroup == request.SubGroup.Value);
        }

        if (request.TransactionAccountsOnly)
        {
            query = query.Where(a => a.AcceptsTransactions);
        }

        if (!string.IsNullOrEmpty(request.Currency))
        {
            query = query.Where(a => a.Currency == request.Currency);
        }

        var accounts = await query
            .OrderBy(a => a.Code)
            .ToListAsync(cancellationToken);

        var dtos = accounts.Select(CreateAccountCommandHandler.MapToSummaryDto).ToList();

        return Result<List<AccountSummaryDto>>.Success(dtos);
    }
}

#endregion

#region Get Accounts By Type

/// <summary>
/// Hesap tipine göre hesapları listele
/// </summary>
public class GetAccountsByTypeQuery : IRequest<Result<List<AccountSummaryDto>>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public AccountType AccountType { get; set; }
    public bool ActiveOnly { get; set; } = true;
}

/// <summary>
/// GetAccountsByTypeQuery işleyicisi
/// </summary>
public class GetAccountsByTypeQueryHandler : IRequestHandler<GetAccountsByTypeQuery, Result<List<AccountSummaryDto>>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetAccountsByTypeQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<List<AccountSummaryDto>>> Handle(GetAccountsByTypeQuery request, CancellationToken cancellationToken)
    {
        var query = _unitOfWork.Accounts.AsQueryable()
            .Where(a => a.AccountType == request.AccountType);

        if (request.ActiveOnly)
        {
            query = query.Where(a => a.IsActive);
        }

        var accounts = await query
            .OrderBy(a => a.Code)
            .ToListAsync(cancellationToken);

        var dtos = accounts.Select(CreateAccountCommandHandler.MapToSummaryDto).ToList();

        return Result<List<AccountSummaryDto>>.Success(dtos);
    }
}

#endregion

#region Get Child Accounts

/// <summary>
/// Bir hesabın alt hesaplarını listele
/// </summary>
public class GetChildAccountsQuery : IRequest<Result<List<AccountSummaryDto>>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int ParentAccountId { get; set; }
    public bool ActiveOnly { get; set; } = true;
    public bool Recursive { get; set; } = false;
}

/// <summary>
/// GetChildAccountsQuery işleyicisi
/// </summary>
public class GetChildAccountsQueryHandler : IRequestHandler<GetChildAccountsQuery, Result<List<AccountSummaryDto>>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetChildAccountsQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<List<AccountSummaryDto>>> Handle(GetChildAccountsQuery request, CancellationToken cancellationToken)
    {
        // Üst hesap kontrolü
        var parentAccount = await _unitOfWork.Accounts.GetByIdAsync(request.ParentAccountId, cancellationToken);
        if (parentAccount == null)
        {
            return Result<List<AccountSummaryDto>>.Failure(
                Error.NotFound("Account", $"ID {request.ParentAccountId} ile üst hesap bulunamadı"));
        }

        List<Account> accounts;

        if (request.Recursive)
        {
            // Tüm alt hesapları recursive olarak getir
            accounts = await GetAllDescendantsAsync(request.ParentAccountId, request.ActiveOnly, cancellationToken);
        }
        else
        {
            // Sadece direkt alt hesapları getir
            var query = _unitOfWork.Accounts.AsQueryable()
                .Where(a => a.ParentAccountId == request.ParentAccountId);

            if (request.ActiveOnly)
            {
                query = query.Where(a => a.IsActive);
            }

            accounts = await query
                .OrderBy(a => a.Code)
                .ToListAsync(cancellationToken);
        }

        var dtos = accounts.Select(CreateAccountCommandHandler.MapToSummaryDto).ToList();

        return Result<List<AccountSummaryDto>>.Success(dtos);
    }

    private async Task<List<Account>> GetAllDescendantsAsync(int parentId, bool activeOnly, CancellationToken cancellationToken)
    {
        var result = new List<Account>();

        var query = _unitOfWork.Accounts.AsQueryable()
            .Where(a => a.ParentAccountId == parentId);

        if (activeOnly)
        {
            query = query.Where(a => a.IsActive);
        }

        var directChildren = await query
            .OrderBy(a => a.Code)
            .ToListAsync(cancellationToken);

        foreach (var child in directChildren)
        {
            result.Add(child);
            var descendants = await GetAllDescendantsAsync(child.Id, activeOnly, cancellationToken);
            result.AddRange(descendants);
        }

        return result;
    }
}

#endregion
