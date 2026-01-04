using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Finance.Application.DTOs;
using Stocker.Modules.Finance.Domain.Entities;
using Stocker.Modules.Finance.Interfaces;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;
using Stocker.Domain.Common.ValueObjects;

namespace Stocker.Modules.Finance.Application.Features.CashAccounts.Commands;

#region Create Cash Account

/// <summary>
/// Command to create a new cash account
/// </summary>
public class CreateCashAccountCommand : IRequest<Result<CashAccountDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public CreateCashAccountDto Data { get; set; } = null!;
}

/// <summary>
/// Handler for CreateCashAccountCommand
/// </summary>
public class CreateCashAccountCommandHandler : IRequestHandler<CreateCashAccountCommand, Result<CashAccountDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public CreateCashAccountCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<CashAccountDto>> Handle(CreateCashAccountCommand request, CancellationToken cancellationToken)
    {
        // Validate unique code
        if (await _unitOfWork.CashAccounts.ExistsWithCodeAsync(request.Data.Code, null, cancellationToken))
        {
            return Result<CashAccountDto>.Failure(
                Error.Validation("CashAccount.Code", $"'{request.Data.Code}' kodlu kasa hesabı zaten mevcut"));
        }

        // Create cash account entity
        var accountType = (CashAccountType)(int)request.Data.AccountType;
        var cashAccount = new CashAccount(
            request.Data.Code,
            request.Data.Name,
            accountType,
            request.Data.Currency);

        // Set description
        if (!string.IsNullOrEmpty(request.Data.Description))
        {
            cashAccount.UpdateBasicInfo(request.Data.Name, request.Data.Description);
        }

        // Set location
        cashAccount.SetLocation(
            request.Data.BranchId,
            request.Data.BranchName,
            request.Data.WarehouseId,
            request.Data.WarehouseName);

        // Set responsible
        cashAccount.SetResponsible(
            request.Data.ResponsibleUserId,
            request.Data.ResponsibleUserName);

        // Set balance alerts
        Money? minBalance = request.Data.MinimumBalance.HasValue
            ? Money.Create(request.Data.MinimumBalance.Value, request.Data.Currency)
            : null;
        Money? maxBalance = request.Data.MaximumBalance.HasValue
            ? Money.Create(request.Data.MaximumBalance.Value, request.Data.Currency)
            : null;
        cashAccount.SetBalanceAlerts(minBalance, maxBalance);

        // Set limits
        Money? dailyLimit = request.Data.DailyTransactionLimit.HasValue
            ? Money.Create(request.Data.DailyTransactionLimit.Value, request.Data.Currency)
            : null;
        Money? singleLimit = request.Data.SingleTransactionLimit.HasValue
            ? Money.Create(request.Data.SingleTransactionLimit.Value, request.Data.Currency)
            : null;
        cashAccount.SetLimits(dailyLimit, singleLimit);

        // Set opening balance
        if (request.Data.OpeningBalance != 0)
        {
            var openingBalance = Money.Create(request.Data.OpeningBalance, request.Data.Currency);
            cashAccount.SetOpeningBalance(openingBalance);
        }

        // Set accounting account
        if (request.Data.AccountingAccountId.HasValue)
        {
            cashAccount.LinkToAccountingAccount(request.Data.AccountingAccountId.Value);
        }

        // Set notes
        cashAccount.SetNotes(request.Data.Notes);

        // Save
        await _unitOfWork.CashAccounts.AddAsync(cashAccount, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = MapToDto(cashAccount);
        return Result<CashAccountDto>.Success(dto);
    }

    internal static CashAccountDto MapToDto(CashAccount cashAccount)
    {
        return new CashAccountDto
        {
            Id = cashAccount.Id,
            Code = cashAccount.Code,
            Name = cashAccount.Name,
            Description = cashAccount.Description,
            Currency = cashAccount.Currency,
            AccountType = (CashAccountTypeDto)(int)cashAccount.AccountType,
            AccountTypeName = GetAccountTypeName(cashAccount.AccountType),
            Balance = cashAccount.Balance.Amount,
            MinimumBalance = cashAccount.MinimumBalance?.Amount,
            MaximumBalance = cashAccount.MaximumBalance?.Amount,
            OpeningBalance = cashAccount.OpeningBalance.Amount,
            LastCountDate = cashAccount.LastCountDate,
            LastCountBalance = cashAccount.LastCountBalance?.Amount,
            CountDifference = cashAccount.LastCountBalance != null
                ? cashAccount.GetCountDifference().Amount
                : null,
            BranchId = cashAccount.BranchId,
            BranchName = cashAccount.BranchName,
            WarehouseId = cashAccount.WarehouseId,
            WarehouseName = cashAccount.WarehouseName,
            ResponsibleUserId = cashAccount.ResponsibleUserId,
            ResponsibleUserName = cashAccount.ResponsibleUserName,
            IsActive = cashAccount.IsActive,
            IsDefault = cashAccount.IsDefault,
            AccountingAccountId = cashAccount.AccountingAccountId,
            Notes = cashAccount.Notes,
            DailyTransactionLimit = cashAccount.DailyTransactionLimit?.Amount,
            SingleTransactionLimit = cashAccount.SingleTransactionLimit?.Amount,
            IsBelowMinimumBalance = cashAccount.IsBelowMinimumBalance(),
            IsAboveMaximumBalance = cashAccount.IsAboveMaximumBalance(),
            CreatedAt = cashAccount.CreatedDate,
            UpdatedAt = cashAccount.UpdatedDate
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

#region Update Cash Account

/// <summary>
/// Command to update a cash account
/// </summary>
public class UpdateCashAccountCommand : IRequest<Result<CashAccountDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public UpdateCashAccountDto Data { get; set; } = null!;
}

/// <summary>
/// Handler for UpdateCashAccountCommand
/// </summary>
public class UpdateCashAccountCommandHandler : IRequestHandler<UpdateCashAccountCommand, Result<CashAccountDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public UpdateCashAccountCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<CashAccountDto>> Handle(UpdateCashAccountCommand request, CancellationToken cancellationToken)
    {
        var cashAccount = await _unitOfWork.CashAccounts.GetByIdAsync(request.Id, cancellationToken);
        if (cashAccount == null)
        {
            return Result<CashAccountDto>.Failure(
                Error.NotFound("CashAccount", $"ID {request.Id} ile kasa hesabı bulunamadı"));
        }

        // Update basic info
        if (!string.IsNullOrEmpty(request.Data.Name))
        {
            cashAccount.UpdateBasicInfo(request.Data.Name, request.Data.Description ?? cashAccount.Description);
        }
        else if (request.Data.Description != null)
        {
            cashAccount.UpdateBasicInfo(cashAccount.Name, request.Data.Description);
        }

        // Update location
        cashAccount.SetLocation(
            request.Data.BranchId ?? cashAccount.BranchId,
            request.Data.BranchName ?? cashAccount.BranchName,
            request.Data.WarehouseId ?? cashAccount.WarehouseId,
            request.Data.WarehouseName ?? cashAccount.WarehouseName);

        // Update responsible
        if (request.Data.ResponsibleUserId.HasValue || request.Data.ResponsibleUserName != null)
        {
            cashAccount.SetResponsible(
                request.Data.ResponsibleUserId ?? cashAccount.ResponsibleUserId,
                request.Data.ResponsibleUserName ?? cashAccount.ResponsibleUserName);
        }

        // Update balance alerts
        try
        {
            Money? minBalance = request.Data.MinimumBalance.HasValue
                ? Money.Create(request.Data.MinimumBalance.Value, cashAccount.Currency)
                : cashAccount.MinimumBalance;
            Money? maxBalance = request.Data.MaximumBalance.HasValue
                ? Money.Create(request.Data.MaximumBalance.Value, cashAccount.Currency)
                : cashAccount.MaximumBalance;
            cashAccount.SetBalanceAlerts(minBalance, maxBalance);
        }
        catch (InvalidOperationException ex)
        {
            return Result<CashAccountDto>.Failure(
                Error.Validation("CashAccount.BalanceAlerts", ex.Message));
        }

        // Update limits
        try
        {
            Money? dailyLimit = request.Data.DailyTransactionLimit.HasValue
                ? Money.Create(request.Data.DailyTransactionLimit.Value, cashAccount.Currency)
                : cashAccount.DailyTransactionLimit;
            Money? singleLimit = request.Data.SingleTransactionLimit.HasValue
                ? Money.Create(request.Data.SingleTransactionLimit.Value, cashAccount.Currency)
                : cashAccount.SingleTransactionLimit;
            cashAccount.SetLimits(dailyLimit, singleLimit);
        }
        catch (InvalidOperationException ex)
        {
            return Result<CashAccountDto>.Failure(
                Error.Validation("CashAccount.Limits", ex.Message));
        }

        // Update accounting account
        if (request.Data.AccountingAccountId.HasValue)
        {
            cashAccount.LinkToAccountingAccount(request.Data.AccountingAccountId.Value);
        }

        // Update notes
        if (request.Data.Notes != null)
        {
            cashAccount.SetNotes(request.Data.Notes);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = CreateCashAccountCommandHandler.MapToDto(cashAccount);
        return Result<CashAccountDto>.Success(dto);
    }
}

#endregion

#region Delete Cash Account

/// <summary>
/// Command to delete a cash account
/// </summary>
public class DeleteCashAccountCommand : IRequest<Result<bool>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

/// <summary>
/// Handler for DeleteCashAccountCommand
/// </summary>
public class DeleteCashAccountCommandHandler : IRequestHandler<DeleteCashAccountCommand, Result<bool>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public DeleteCashAccountCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(DeleteCashAccountCommand request, CancellationToken cancellationToken)
    {
        var cashAccount = await _unitOfWork.CashAccounts.GetByIdAsync(request.Id, cancellationToken);
        if (cashAccount == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("CashAccount", $"ID {request.Id} ile kasa hesabı bulunamadı"));
        }

        // Check if account has transactions
        if (await _unitOfWork.CashAccounts.HasTransactionsAsync(request.Id, cancellationToken))
        {
            return Result<bool>.Failure(
                Error.Validation("CashAccount.Transactions", "İşlemi bulunan kasa hesabı silinemez"));
        }

        // Check if account has balance
        if (cashAccount.Balance.Amount != 0)
        {
            return Result<bool>.Failure(
                Error.Validation("CashAccount.Balance", "Bakiyesi bulunan kasa hesabı silinemez"));
        }

        // Check if it's the default account
        if (cashAccount.IsDefault)
        {
            return Result<bool>.Failure(
                Error.Validation("CashAccount.Default", "Varsayılan kasa hesabı silinemez. Önce başka bir kasayı varsayılan yapın"));
        }

        _unitOfWork.CashAccounts.Remove(cashAccount);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}

#endregion

#region Activate Cash Account

/// <summary>
/// Command to activate a cash account
/// </summary>
public class ActivateCashAccountCommand : IRequest<Result<CashAccountDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

/// <summary>
/// Handler for ActivateCashAccountCommand
/// </summary>
public class ActivateCashAccountCommandHandler : IRequestHandler<ActivateCashAccountCommand, Result<CashAccountDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public ActivateCashAccountCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<CashAccountDto>> Handle(ActivateCashAccountCommand request, CancellationToken cancellationToken)
    {
        var cashAccount = await _unitOfWork.CashAccounts.GetByIdAsync(request.Id, cancellationToken);
        if (cashAccount == null)
        {
            return Result<CashAccountDto>.Failure(
                Error.NotFound("CashAccount", $"ID {request.Id} ile kasa hesabı bulunamadı"));
        }

        if (cashAccount.IsActive)
        {
            return Result<CashAccountDto>.Failure(
                Error.Validation("CashAccount.IsActive", "Kasa hesabı zaten aktif"));
        }

        cashAccount.Activate();
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = CreateCashAccountCommandHandler.MapToDto(cashAccount);
        return Result<CashAccountDto>.Success(dto);
    }
}

#endregion

#region Deactivate Cash Account

/// <summary>
/// Command to deactivate a cash account
/// </summary>
public class DeactivateCashAccountCommand : IRequest<Result<CashAccountDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

/// <summary>
/// Handler for DeactivateCashAccountCommand
/// </summary>
public class DeactivateCashAccountCommandHandler : IRequestHandler<DeactivateCashAccountCommand, Result<CashAccountDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public DeactivateCashAccountCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<CashAccountDto>> Handle(DeactivateCashAccountCommand request, CancellationToken cancellationToken)
    {
        var cashAccount = await _unitOfWork.CashAccounts.GetByIdAsync(request.Id, cancellationToken);
        if (cashAccount == null)
        {
            return Result<CashAccountDto>.Failure(
                Error.NotFound("CashAccount", $"ID {request.Id} ile kasa hesabı bulunamadı"));
        }

        if (!cashAccount.IsActive)
        {
            return Result<CashAccountDto>.Failure(
                Error.Validation("CashAccount.IsActive", "Kasa hesabı zaten pasif"));
        }

        // Cannot deactivate default account
        if (cashAccount.IsDefault)
        {
            return Result<CashAccountDto>.Failure(
                Error.Validation("CashAccount.Default", "Varsayılan kasa hesabı pasif yapılamaz"));
        }

        // Cannot deactivate account with balance
        if (cashAccount.Balance.Amount != 0)
        {
            return Result<CashAccountDto>.Failure(
                Error.Validation("CashAccount.Balance", "Bakiyesi bulunan kasa hesabı pasif yapılamaz"));
        }

        cashAccount.Deactivate();
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = CreateCashAccountCommandHandler.MapToDto(cashAccount);
        return Result<CashAccountDto>.Success(dto);
    }
}

#endregion

#region Set Default Cash Account

/// <summary>
/// Command to set a cash account as default
/// </summary>
public class SetDefaultCashAccountCommand : IRequest<Result<CashAccountDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

/// <summary>
/// Handler for SetDefaultCashAccountCommand
/// </summary>
public class SetDefaultCashAccountCommandHandler : IRequestHandler<SetDefaultCashAccountCommand, Result<CashAccountDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public SetDefaultCashAccountCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<CashAccountDto>> Handle(SetDefaultCashAccountCommand request, CancellationToken cancellationToken)
    {
        var cashAccount = await _unitOfWork.CashAccounts.GetByIdAsync(request.Id, cancellationToken);
        if (cashAccount == null)
        {
            return Result<CashAccountDto>.Failure(
                Error.NotFound("CashAccount", $"ID {request.Id} ile kasa hesabı bulunamadı"));
        }

        if (!cashAccount.IsActive)
        {
            return Result<CashAccountDto>.Failure(
                Error.Validation("CashAccount.IsActive", "Pasif kasa hesabı varsayılan yapılamaz"));
        }

        if (cashAccount.IsDefault)
        {
            return Result<CashAccountDto>.Failure(
                Error.Validation("CashAccount.Default", "Kasa hesabı zaten varsayılan"));
        }

        // Remove default from current default account (same currency)
        var currentDefault = await _unitOfWork.CashAccounts.GetDefaultByCurrencyAsync(cashAccount.Currency, cancellationToken);
        if (currentDefault != null)
        {
            currentDefault.RemoveDefault();
        }

        // Set new default
        cashAccount.SetAsDefault();
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = CreateCashAccountCommandHandler.MapToDto(cashAccount);
        return Result<CashAccountDto>.Success(dto);
    }
}

#endregion

#region Record Cash Count

/// <summary>
/// Command to record a cash count
/// </summary>
public class RecordCashCountCommand : IRequest<Result<CashAccountDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public RecordCashCountDto Data { get; set; } = null!;
}

/// <summary>
/// Handler for RecordCashCountCommand
/// </summary>
public class RecordCashCountCommandHandler : IRequestHandler<RecordCashCountCommand, Result<CashAccountDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public RecordCashCountCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<CashAccountDto>> Handle(RecordCashCountCommand request, CancellationToken cancellationToken)
    {
        var cashAccount = await _unitOfWork.CashAccounts.GetByIdAsync(request.Id, cancellationToken);
        if (cashAccount == null)
        {
            return Result<CashAccountDto>.Failure(
                Error.NotFound("CashAccount", $"ID {request.Id} ile kasa hesabı bulunamadı"));
        }

        if (!cashAccount.IsActive)
        {
            return Result<CashAccountDto>.Failure(
                Error.Validation("CashAccount.IsActive", "Pasif kasa hesabında sayım yapılamaz"));
        }

        try
        {
            var countedBalance = Money.Create(request.Data.CountedBalance, cashAccount.Currency);
            cashAccount.RecordCount(countedBalance, request.Data.CountDate);

            // Add notes if provided
            if (!string.IsNullOrEmpty(request.Data.Notes))
            {
                var existingNotes = cashAccount.Notes ?? string.Empty;
                var countNote = $"[{request.Data.CountDate:dd.MM.yyyy}] Sayım: {request.Data.CountedBalance:N2} {cashAccount.Currency}";
                if (!string.IsNullOrEmpty(request.Data.Notes))
                {
                    countNote += $" - {request.Data.Notes}";
                }
                var newNotes = string.IsNullOrEmpty(existingNotes)
                    ? countNote
                    : $"{countNote}\n{existingNotes}";
                cashAccount.SetNotes(newNotes);
            }
        }
        catch (InvalidOperationException ex)
        {
            return Result<CashAccountDto>.Failure(
                Error.Validation("CashAccount.Count", ex.Message));
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = CreateCashAccountCommandHandler.MapToDto(cashAccount);
        return Result<CashAccountDto>.Success(dto);
    }
}

#endregion

#region Add Cash Command

/// <summary>
/// Command to add cash to a cash account
/// </summary>
public class AddCashCommand : IRequest<Result<CashAccountDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public AddCashDto Data { get; set; } = null!;
}

/// <summary>
/// Handler for AddCashCommand
/// </summary>
public class AddCashCommandHandler : IRequestHandler<AddCashCommand, Result<CashAccountDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public AddCashCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<CashAccountDto>> Handle(AddCashCommand request, CancellationToken cancellationToken)
    {
        var cashAccount = await _unitOfWork.CashAccounts.GetByIdAsync(request.Id, cancellationToken);
        if (cashAccount == null)
        {
            return Result<CashAccountDto>.Failure(
                Error.NotFound("CashAccount", $"ID {request.Id} ile kasa hesabı bulunamadı"));
        }

        if (!cashAccount.IsActive)
        {
            return Result<CashAccountDto>.Failure(
                Error.Validation("CashAccount.IsActive", "Pasif kasa hesabına para eklenemez"));
        }

        try
        {
            var amount = Money.Create(request.Data.Amount, cashAccount.Currency);
            cashAccount.Deposit(amount);

            // Add transaction note
            if (!string.IsNullOrEmpty(request.Data.Description))
            {
                var existingNotes = cashAccount.Notes ?? "";
                var cashNote = $"[{request.Data.TransactionDate:yyyy-MM-dd}] Para eklendi: {request.Data.Amount:N2} {cashAccount.Currency} - {request.Data.Description}";
                cashAccount.SetNotes(string.IsNullOrEmpty(existingNotes) ? cashNote : $"{cashNote}\n{existingNotes}");
            }
        }
        catch (InvalidOperationException ex)
        {
            return Result<CashAccountDto>.Failure(
                Error.Validation("CashAccount.AddCash", ex.Message));
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = CreateCashAccountCommandHandler.MapToDto(cashAccount);
        return Result<CashAccountDto>.Success(dto);
    }
}

#endregion

#region Withdraw Cash Command

/// <summary>
/// Command to withdraw cash from a cash account
/// </summary>
public class WithdrawCashCommand : IRequest<Result<CashAccountDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public WithdrawCashDto Data { get; set; } = null!;
}

/// <summary>
/// Handler for WithdrawCashCommand
/// </summary>
public class WithdrawCashCommandHandler : IRequestHandler<WithdrawCashCommand, Result<CashAccountDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public WithdrawCashCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<CashAccountDto>> Handle(WithdrawCashCommand request, CancellationToken cancellationToken)
    {
        var cashAccount = await _unitOfWork.CashAccounts.GetByIdAsync(request.Id, cancellationToken);
        if (cashAccount == null)
        {
            return Result<CashAccountDto>.Failure(
                Error.NotFound("CashAccount", $"ID {request.Id} ile kasa hesabı bulunamadı"));
        }

        if (!cashAccount.IsActive)
        {
            return Result<CashAccountDto>.Failure(
                Error.Validation("CashAccount.IsActive", "Pasif kasa hesabından para çekilemez"));
        }

        try
        {
            var amount = Money.Create(request.Data.Amount, cashAccount.Currency);
            cashAccount.Withdraw(amount);

            // Add transaction note
            if (!string.IsNullOrEmpty(request.Data.Description))
            {
                var existingNotes = cashAccount.Notes ?? "";
                var cashNote = $"[{request.Data.TransactionDate:yyyy-MM-dd}] Para çekildi: {request.Data.Amount:N2} {cashAccount.Currency} - {request.Data.Description}";
                cashAccount.SetNotes(string.IsNullOrEmpty(existingNotes) ? cashNote : $"{cashNote}\n{existingNotes}");
            }
        }
        catch (InvalidOperationException ex)
        {
            return Result<CashAccountDto>.Failure(
                Error.Validation("CashAccount.WithdrawCash", ex.Message));
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = CreateCashAccountCommandHandler.MapToDto(cashAccount);
        return Result<CashAccountDto>.Success(dto);
    }
}

#endregion
