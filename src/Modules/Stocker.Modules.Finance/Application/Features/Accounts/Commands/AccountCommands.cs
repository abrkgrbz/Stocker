using MediatR;
using Stocker.Modules.Finance.Application.DTOs;
using Stocker.Modules.Finance.Domain.Entities;
using Stocker.Modules.Finance.Domain.Enums;
using Stocker.Modules.Finance.Interfaces;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Finance.Application.Features.Accounts.Commands;

#region Create Account

/// <summary>
/// Yeni muhasebe hesabı oluşturma komutu
/// </summary>
public class CreateAccountCommand : IRequest<Result<AccountDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public CreateAccountDto Data { get; set; } = null!;
}

/// <summary>
/// CreateAccountCommand işleyicisi
/// </summary>
public class CreateAccountCommandHandler : IRequestHandler<CreateAccountCommand, Result<AccountDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public CreateAccountCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<AccountDto>> Handle(CreateAccountCommand request, CancellationToken cancellationToken)
    {
        // Hesap kodu kontrolü
        var existingAccount = await _unitOfWork.Accounts.GetByCodeAsync(request.Data.Code, cancellationToken);
        if (existingAccount != null)
        {
            return Result<AccountDto>.Failure(
                Error.Conflict("Account.Code", $"'{request.Data.Code}' kodlu hesap zaten mevcut"));
        }

        // Üst hesap kontrolü
        Account? parentAccount = null;
        if (request.Data.ParentAccountId.HasValue)
        {
            parentAccount = await _unitOfWork.Accounts.GetByIdAsync(request.Data.ParentAccountId.Value, cancellationToken);
            if (parentAccount == null)
            {
                return Result<AccountDto>.Failure(
                    Error.NotFound("Account.Parent", $"ID {request.Data.ParentAccountId} ile üst hesap bulunamadı"));
            }

            if (!parentAccount.AcceptsSubAccounts)
            {
                return Result<AccountDto>.Failure(
                    Error.Validation("Account.Parent", $"'{parentAccount.Code}' hesabı alt hesap kabul etmiyor"));
            }

            // Üst hesabın para birimi ile eşleşme kontrolü
            if (parentAccount.Currency != request.Data.Currency)
            {
                return Result<AccountDto>.Failure(
                    Error.Validation("Account.Currency", $"Para birimi üst hesabın para birimi ({parentAccount.Currency}) ile eşleşmelidir"));
            }
        }

        // Hesap oluştur
        var account = new Account(
            request.Data.Code,
            request.Data.Name,
            request.Data.AccountType,
            request.Data.Currency,
            request.Data.ParentAccountId,
            request.Data.SubGroup);

        // Opsiyonel alanları ayarla
        if (!string.IsNullOrEmpty(request.Data.Description) ||
            request.Data.AcceptsSubAccounts != true ||
            request.Data.AcceptsTransactions != false)
        {
            account.Update(
                request.Data.Name,
                request.Data.Description,
                request.Data.AcceptsSubAccounts,
                request.Data.AcceptsTransactions);
        }

        // Kaydet
        await _unitOfWork.Accounts.AddAsync(account, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // DTO'ya dönüştür
        var dto = MapToDto(account, parentAccount);
        return Result<AccountDto>.Success(dto);
    }

    internal static AccountDto MapToDto(Account account, Account? parentAccount = null)
    {
        return new AccountDto
        {
            Id = account.Id,
            Code = account.Code,
            Name = account.Name,
            Description = account.Description,
            ParentAccountId = account.ParentAccountId,
            ParentAccountCode = parentAccount?.Code ?? account.ParentAccount?.Code,
            ParentAccountName = parentAccount?.Name ?? account.ParentAccount?.Name,
            AccountType = account.AccountType,
            AccountTypeName = GetAccountTypeName(account.AccountType),
            SubGroup = account.SubGroup,
            SubGroupName = account.SubGroup.HasValue ? GetSubGroupName(account.SubGroup.Value) : null,
            Currency = account.Currency,
            DebitBalance = account.DebitBalance.Amount,
            CreditBalance = account.CreditBalance.Amount,
            Balance = account.Balance.Amount,
            IsActive = account.IsActive,
            IsSystemAccount = account.IsSystemAccount,
            Level = account.Level,
            AcceptsSubAccounts = account.AcceptsSubAccounts,
            AcceptsTransactions = account.AcceptsTransactions,
            IsDebitNatured = account.IsDebitNatured,
            ClosesAtPeriodEnd = account.ClosesAtPeriodEnd,
            LinkedBankAccountId = account.LinkedBankAccountId,
            LinkedCashAccountId = account.LinkedCashAccountId,
            LinkedCurrentAccountId = account.LinkedCurrentAccountId,
            SubAccounts = account.SubAccounts?.Select(MapToSummaryDto).ToList() ?? new List<AccountSummaryDto>(),
            CreatedAt = account.CreatedDate,
            UpdatedAt = account.UpdatedDate
        };
    }

    internal static AccountSummaryDto MapToSummaryDto(Account account)
    {
        return new AccountSummaryDto
        {
            Id = account.Id,
            Code = account.Code,
            Name = account.Name,
            ParentAccountId = account.ParentAccountId,
            AccountType = account.AccountType,
            AccountTypeName = GetAccountTypeName(account.AccountType),
            SubGroup = account.SubGroup,
            Currency = account.Currency,
            Balance = account.Balance.Amount,
            IsActive = account.IsActive,
            IsSystemAccount = account.IsSystemAccount,
            Level = account.Level,
            AcceptsSubAccounts = account.AcceptsSubAccounts,
            AcceptsTransactions = account.AcceptsTransactions,
            HasChildren = account.SubAccounts?.Any() ?? false,
            Children = new List<AccountSummaryDto>()
        };
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

    private static string GetSubGroupName(AccountSubGroup subGroup)
    {
        return subGroup switch
        {
            AccountSubGroup.CashAndCashEquivalents => "Hazır Değerler",
            AccountSubGroup.MarketableSecurities => "Menkul Kıymetler",
            AccountSubGroup.TradeReceivables => "Ticari Alacaklar",
            AccountSubGroup.OtherReceivables => "Diğer Alacaklar",
            AccountSubGroup.Inventories => "Stoklar",
            AccountSubGroup.ConstructionCosts => "Yıllara Yaygın İnşaat Maliyetleri",
            AccountSubGroup.PrepaidExpenses => "Gelecek Aylara Ait Giderler",
            AccountSubGroup.OtherCurrentAssets => "Diğer Dönen Varlıklar",
            AccountSubGroup.LongTermTradeReceivables => "Uzun Vadeli Ticari Alacaklar",
            AccountSubGroup.FinancialFixedAssets => "Mali Duran Varlıklar",
            AccountSubGroup.TangibleFixedAssets => "Maddi Duran Varlıklar",
            AccountSubGroup.IntangibleFixedAssets => "Maddi Olmayan Duran Varlıklar",
            AccountSubGroup.FinancialLiabilities => "Mali Borçlar",
            AccountSubGroup.TradePayables => "Ticari Borçlar",
            AccountSubGroup.OtherPayables => "Diğer Borçlar",
            AccountSubGroup.AdvancesReceived => "Alınan Avanslar",
            AccountSubGroup.TaxesPayable => "Ödenecek Vergi ve Yükümlülükler",
            AccountSubGroup.Provisions => "Borç ve Gider Karşılıkları",
            AccountSubGroup.DeferredIncome => "Gelecek Aylara Ait Gelirler",
            AccountSubGroup.PaidInCapital => "Ödenmiş Sermaye",
            AccountSubGroup.CapitalReserves => "Sermaye Yedekleri",
            AccountSubGroup.RetainedEarnings => "Kâr Yedekleri",
            AccountSubGroup.PriorYearsProfits => "Geçmiş Yıllar Kârları",
            AccountSubGroup.PriorYearsLosses => "Geçmiş Yıllar Zararları",
            AccountSubGroup.NetIncomeLoss => "Dönem Net Kârı/Zararı",
            AccountSubGroup.GrossSales => "Brüt Satışlar",
            AccountSubGroup.SalesDiscounts => "Satış İndirimleri",
            AccountSubGroup.CostOfSales => "Satışların Maliyeti",
            AccountSubGroup.OperatingExpenses => "Faaliyet Giderleri",
            AccountSubGroup.OtherOperatingIncome => "Diğer Faaliyet Gelirleri",
            AccountSubGroup.OtherOperatingExpenses => "Diğer Faaliyet Giderleri",
            AccountSubGroup.FinanceCosts => "Finansman Giderleri",
            AccountSubGroup.ExtraordinaryIncome => "Olağandışı Gelirler",
            AccountSubGroup.ExtraordinaryExpenses => "Olağandışı Giderler",
            AccountSubGroup.PeriodNetIncome => "Dönem Net Kârı/Zararı",
            AccountSubGroup.DirectMaterialCosts => "Direkt İlk Madde Giderleri",
            AccountSubGroup.DirectLaborCosts => "Direkt İşçilik Giderleri",
            AccountSubGroup.ManufacturingOverhead => "Genel Üretim Giderleri",
            _ => subGroup.ToString()
        };
    }
}

#endregion

#region Update Account

/// <summary>
/// Muhasebe hesabı güncelleme komutu
/// </summary>
public class UpdateAccountCommand : IRequest<Result<AccountDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public UpdateAccountDto Data { get; set; } = null!;
}

/// <summary>
/// UpdateAccountCommand işleyicisi
/// </summary>
public class UpdateAccountCommandHandler : IRequestHandler<UpdateAccountCommand, Result<AccountDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public UpdateAccountCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<AccountDto>> Handle(UpdateAccountCommand request, CancellationToken cancellationToken)
    {
        var account = await _unitOfWork.Accounts.GetByIdAsync(request.Id, cancellationToken);
        if (account == null)
        {
            return Result<AccountDto>.Failure(
                Error.NotFound("Account", $"ID {request.Id} ile hesap bulunamadı"));
        }

        // Güncelleme verilerini hazırla
        var name = request.Data.Name ?? account.Name;
        var description = request.Data.Description ?? account.Description;
        var acceptsSubAccounts = request.Data.AcceptsSubAccounts ?? account.AcceptsSubAccounts;
        var acceptsTransactions = request.Data.AcceptsTransactions ?? account.AcceptsTransactions;

        // Alt hesap kontrolü - eğer alt hesaplar varsa AcceptsSubAccounts false yapılamaz
        if (!acceptsSubAccounts)
        {
            var hasSubAccounts = await _unitOfWork.Accounts.HasSubAccountsAsync(account.Id, cancellationToken);
            if (hasSubAccounts)
            {
                return Result<AccountDto>.Failure(
                    Error.Validation("Account.AcceptsSubAccounts", "Alt hesapları bulunan bir hesabın 'Alt Hesap Kabul Eder' özelliği kapatılamaz"));
            }
        }

        // Hareket kontrolü - eğer hareketler varsa AcceptsTransactions false yapılamaz
        if (!acceptsTransactions && account.AcceptsTransactions)
        {
            var hasTransactions = await _unitOfWork.Accounts.HasTransactionsAsync(account.Id, cancellationToken);
            if (hasTransactions)
            {
                return Result<AccountDto>.Failure(
                    Error.Validation("Account.AcceptsTransactions", "Hareketi bulunan bir hesabın 'Hareket Kabul Eder' özelliği kapatılamaz"));
            }
        }

        // Güncelle
        account.Update(name, description, acceptsSubAccounts, acceptsTransactions);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = CreateAccountCommandHandler.MapToDto(account);
        return Result<AccountDto>.Success(dto);
    }
}

#endregion

#region Delete Account

/// <summary>
/// Muhasebe hesabı silme komutu
/// </summary>
public class DeleteAccountCommand : IRequest<Result<bool>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

/// <summary>
/// DeleteAccountCommand işleyicisi
/// </summary>
public class DeleteAccountCommandHandler : IRequestHandler<DeleteAccountCommand, Result<bool>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public DeleteAccountCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(DeleteAccountCommand request, CancellationToken cancellationToken)
    {
        var account = await _unitOfWork.Accounts.GetByIdAsync(request.Id, cancellationToken);
        if (account == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("Account", $"ID {request.Id} ile hesap bulunamadı"));
        }

        // Sistem hesabı kontrolü
        if (account.IsSystemAccount)
        {
            return Result<bool>.Failure(
                Error.Validation("Account.IsSystemAccount", "Sistem hesapları silinemez"));
        }

        // Alt hesap kontrolü
        var hasSubAccounts = await _unitOfWork.Accounts.HasSubAccountsAsync(account.Id, cancellationToken);
        if (hasSubAccounts)
        {
            return Result<bool>.Failure(
                Error.Validation("Account.SubAccounts", "Alt hesapları bulunan hesaplar silinemez. Önce alt hesapları silin"));
        }

        // Hareket kontrolü
        var hasTransactions = await _unitOfWork.Accounts.HasTransactionsAsync(account.Id, cancellationToken);
        if (hasTransactions)
        {
            return Result<bool>.Failure(
                Error.Validation("Account.Transactions", "Hareketi bulunan hesaplar silinemez. Hesabı pasif yapabilirsiniz"));
        }

        // Bakiye kontrolü
        if (account.Balance.Amount != 0)
        {
            return Result<bool>.Failure(
                Error.Validation("Account.Balance", "Bakiyesi sıfır olmayan hesaplar silinemez"));
        }

        _unitOfWork.Accounts.Remove(account);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}

#endregion

#region Activate Account

/// <summary>
/// Muhasebe hesabı aktifleştirme komutu
/// </summary>
public class ActivateAccountCommand : IRequest<Result<AccountDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

/// <summary>
/// ActivateAccountCommand işleyicisi
/// </summary>
public class ActivateAccountCommandHandler : IRequestHandler<ActivateAccountCommand, Result<AccountDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public ActivateAccountCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<AccountDto>> Handle(ActivateAccountCommand request, CancellationToken cancellationToken)
    {
        var account = await _unitOfWork.Accounts.GetByIdAsync(request.Id, cancellationToken);
        if (account == null)
        {
            return Result<AccountDto>.Failure(
                Error.NotFound("Account", $"ID {request.Id} ile hesap bulunamadı"));
        }

        if (account.IsActive)
        {
            return Result<AccountDto>.Failure(
                Error.Validation("Account.IsActive", "Hesap zaten aktif"));
        }

        // Üst hesap aktif mi kontrolü
        if (account.ParentAccountId.HasValue)
        {
            var parentAccount = await _unitOfWork.Accounts.GetByIdAsync(account.ParentAccountId.Value, cancellationToken);
            if (parentAccount != null && !parentAccount.IsActive)
            {
                return Result<AccountDto>.Failure(
                    Error.Validation("Account.Parent", "Üst hesap pasif durumda. Önce üst hesabı aktifleştirin"));
            }
        }

        account.Activate();
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = CreateAccountCommandHandler.MapToDto(account);
        return Result<AccountDto>.Success(dto);
    }
}

#endregion

#region Deactivate Account

/// <summary>
/// Muhasebe hesabı pasifleştirme komutu
/// </summary>
public class DeactivateAccountCommand : IRequest<Result<AccountDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

/// <summary>
/// DeactivateAccountCommand işleyicisi
/// </summary>
public class DeactivateAccountCommandHandler : IRequestHandler<DeactivateAccountCommand, Result<AccountDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public DeactivateAccountCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<AccountDto>> Handle(DeactivateAccountCommand request, CancellationToken cancellationToken)
    {
        var account = await _unitOfWork.Accounts.GetByIdAsync(request.Id, cancellationToken);
        if (account == null)
        {
            return Result<AccountDto>.Failure(
                Error.NotFound("Account", $"ID {request.Id} ile hesap bulunamadı"));
        }

        if (!account.IsActive)
        {
            return Result<AccountDto>.Failure(
                Error.Validation("Account.IsActive", "Hesap zaten pasif"));
        }

        // Sistem hesabı kontrolü
        if (account.IsSystemAccount)
        {
            return Result<AccountDto>.Failure(
                Error.Validation("Account.IsSystemAccount", "Sistem hesapları pasifleştirilemez"));
        }

        // Aktif alt hesap kontrolü
        var hasActiveSubAccounts = await _unitOfWork.Accounts.HasActiveSubAccountsAsync(account.Id, cancellationToken);
        if (hasActiveSubAccounts)
        {
            return Result<AccountDto>.Failure(
                Error.Validation("Account.SubAccounts", "Aktif alt hesapları bulunan hesaplar pasifleştirilemez. Önce alt hesapları pasifleştirin"));
        }

        // Bakiye kontrolü
        if (account.Balance.Amount != 0)
        {
            return Result<AccountDto>.Failure(
                Error.Validation("Account.Balance", "Bakiyesi sıfır olmayan hesaplar pasifleştirilemez"));
        }

        account.Deactivate();
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = CreateAccountCommandHandler.MapToDto(account);
        return Result<AccountDto>.Success(dto);
    }
}

#endregion
