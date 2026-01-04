using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Finance.Application.DTOs;
using Stocker.Modules.Finance.Domain.Entities;
using Stocker.Modules.Finance.Domain.Repositories;
using Stocker.Modules.Finance.Interfaces;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;
using Stocker.Domain.Common.ValueObjects;

namespace Stocker.Modules.Finance.Application.Features.BankAccounts.Commands;

/// <summary>
/// Command to create a new bank account
/// </summary>
public class CreateBankAccountCommand : IRequest<Result<BankAccountDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public CreateBankAccountDto Data { get; set; } = null!;
}

/// <summary>
/// Handler for CreateBankAccountCommand
/// </summary>
public class CreateBankAccountCommandHandler : IRequestHandler<CreateBankAccountCommand, Result<BankAccountDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;
    private readonly IFinanceRepository<BankAccount> _bankAccountRepository;

    public CreateBankAccountCommandHandler(
        IFinanceUnitOfWork unitOfWork,
        IFinanceRepository<BankAccount> bankAccountRepository)
    {
        _unitOfWork = unitOfWork;
        _bankAccountRepository = bankAccountRepository;
    }

    public async Task<Result<BankAccountDto>> Handle(CreateBankAccountCommand request, CancellationToken cancellationToken)
    {
        // Check if code already exists
        var existingByCode = await _bankAccountRepository.FirstOrDefaultAsync(
            x => x.Code == request.Data.Code, cancellationToken);
        if (existingByCode != null)
        {
            return Result<BankAccountDto>.Failure(
                Error.Conflict("BankAccount.Code", $"'{request.Data.Code}' kodlu banka hesabi zaten mevcut"));
        }

        // Check if IBAN already exists
        var normalizedIban = request.Data.Iban.Replace(" ", "").ToUpperInvariant();
        var existingByIban = await _bankAccountRepository.FirstOrDefaultAsync(
            x => x.Iban == normalizedIban, cancellationToken);
        if (existingByIban != null)
        {
            return Result<BankAccountDto>.Failure(
                Error.Conflict("BankAccount.Iban", $"'{request.Data.Iban}' IBAN numarali banka hesabi zaten mevcut"));
        }

        // Create bank account entity
        var bankAccount = new BankAccount(
            request.Data.Code,
            request.Data.Name,
            request.Data.BankName,
            request.Data.AccountNumber,
            request.Data.Iban,
            request.Data.AccountType,
            request.Data.Currency);

        // Set branch information
        if (!string.IsNullOrEmpty(request.Data.BranchName) || !string.IsNullOrEmpty(request.Data.BranchCode) || !string.IsNullOrEmpty(request.Data.SwiftCode))
        {
            bankAccount.UpdateBasicInfo(
                request.Data.Name,
                request.Data.BankName,
                request.Data.BranchName,
                request.Data.BranchCode,
                request.Data.SwiftCode);
        }

        // Set opening date
        if (request.Data.OpeningDate.HasValue)
        {
            bankAccount.SetOpeningDate(request.Data.OpeningDate.Value);
        }

        // Set notes
        if (!string.IsNullOrEmpty(request.Data.Notes))
        {
            bankAccount.SetNotes(request.Data.Notes);
        }

        // Link to accounting account
        if (request.Data.AccountingAccountId.HasValue)
        {
            bankAccount.LinkToAccountingAccount(request.Data.AccountingAccountId.Value);
        }

        // Set as deposit account if maturity date is provided
        if (request.Data.DepositMaturityDate.HasValue && request.Data.InterestRate.HasValue)
        {
            bankAccount.SetAsDepositAccount(request.Data.DepositMaturityDate.Value, request.Data.InterestRate.Value);
        }

        // Set POS info
        if (request.Data.IsPosAccount)
        {
            bankAccount.SetPosInfo(
                true,
                request.Data.PosCommissionRate,
                request.Data.PosTerminalId,
                request.Data.PosMerchantId);
        }

        // Set limits
        Money? dailyLimit = request.Data.DailyTransferLimit.HasValue
            ? Money.Create(request.Data.DailyTransferLimit.Value, request.Data.Currency)
            : null;
        Money? singleLimit = request.Data.SingleTransferLimit.HasValue
            ? Money.Create(request.Data.SingleTransferLimit.Value, request.Data.Currency)
            : null;
        Money? creditLimit = request.Data.CreditLimit.HasValue
            ? Money.Create(request.Data.CreditLimit.Value, request.Data.Currency)
            : null;

        if (dailyLimit != null || singleLimit != null || creditLimit != null)
        {
            bankAccount.SetLimits(dailyLimit, singleLimit, creditLimit);
        }

        // Save
        await _bankAccountRepository.AddAsync(bankAccount, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Map to DTO
        var dto = MapToDto(bankAccount);
        return Result<BankAccountDto>.Success(dto);
    }

    internal static BankAccountDto MapToDto(BankAccount bankAccount)
    {
        return new BankAccountDto
        {
            Id = bankAccount.Id,
            Code = bankAccount.Code,
            Name = bankAccount.Name,
            BankName = bankAccount.BankName,
            BranchName = bankAccount.BranchName,
            BranchCode = bankAccount.BranchCode,
            AccountNumber = bankAccount.AccountNumber,
            Iban = bankAccount.Iban,
            SwiftCode = bankAccount.SwiftCode,
            Currency = bankAccount.Currency,
            Balance = bankAccount.Balance.Amount,
            BlockedBalance = bankAccount.BlockedBalance.Amount,
            AvailableBalance = bankAccount.AvailableBalance.Amount,
            LastReconciliationDate = bankAccount.LastReconciliationDate,
            ReconciledBalance = bankAccount.ReconciledBalance?.Amount,
            AccountType = bankAccount.AccountType,
            AccountTypeName = GetAccountTypeName(bankAccount.AccountType),
            IsDemandAccount = bankAccount.IsDemandAccount,
            DepositMaturityDate = bankAccount.DepositMaturityDate,
            InterestRate = bankAccount.InterestRate,
            IsPosAccount = bankAccount.IsPosAccount,
            PosCommissionRate = bankAccount.PosCommissionRate,
            PosTerminalId = bankAccount.PosTerminalId,
            PosMerchantId = bankAccount.PosMerchantId,
            HasBankIntegration = bankAccount.HasBankIntegration,
            IntegrationType = bankAccount.IntegrationType,
            LastIntegrationDate = bankAccount.LastIntegrationDate,
            IsAutoMatchingEnabled = bankAccount.IsAutoMatchingEnabled,
            DailyTransferLimit = bankAccount.DailyTransferLimit?.Amount,
            SingleTransferLimit = bankAccount.SingleTransferLimit?.Amount,
            CreditLimit = bankAccount.CreditLimit?.Amount,
            IsActive = bankAccount.IsActive,
            IsDefault = bankAccount.IsDefault,
            AccountingAccountId = bankAccount.AccountingAccountId,
            OpeningDate = bankAccount.OpeningDate,
            ClosingDate = bankAccount.ClosingDate,
            Notes = bankAccount.Notes,
            CreatedAt = bankAccount.CreatedDate,
            UpdatedAt = bankAccount.UpdatedDate
        };
    }

    internal static BankAccountSummaryDto MapToSummaryDto(BankAccount bankAccount)
    {
        return new BankAccountSummaryDto
        {
            Id = bankAccount.Id,
            Code = bankAccount.Code,
            Name = bankAccount.Name,
            BankName = bankAccount.BankName,
            BranchName = bankAccount.BranchName,
            AccountNumber = bankAccount.AccountNumber,
            Iban = bankAccount.Iban,
            Currency = bankAccount.Currency,
            Balance = bankAccount.Balance.Amount,
            AvailableBalance = bankAccount.AvailableBalance.Amount,
            AccountType = bankAccount.AccountType,
            AccountTypeName = GetAccountTypeName(bankAccount.AccountType),
            IsActive = bankAccount.IsActive,
            IsDefault = bankAccount.IsDefault,
            IsPosAccount = bankAccount.IsPosAccount
        };
    }

    private static string GetAccountTypeName(BankAccountType accountType)
    {
        return accountType switch
        {
            BankAccountType.DemandDeposit => "Vadesiz Mevduat",
            BankAccountType.TimeDeposit => "Vadeli Mevduat",
            BankAccountType.ForeignCurrency => "Doviz Hesabi",
            BankAccountType.Loan => "Kredi Hesabi",
            BankAccountType.POS => "POS Hesabi",
            BankAccountType.Investment => "Yatirim Hesabi",
            BankAccountType.CreditCard => "Kredi Karti Hesabi",
            _ => "Diger"
        };
    }
}

/// <summary>
/// Command to update a bank account
/// </summary>
public class UpdateBankAccountCommand : IRequest<Result<BankAccountDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public UpdateBankAccountDto Data { get; set; } = null!;
}

/// <summary>
/// Handler for UpdateBankAccountCommand
/// </summary>
public class UpdateBankAccountCommandHandler : IRequestHandler<UpdateBankAccountCommand, Result<BankAccountDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;
    private readonly IFinanceRepository<BankAccount> _bankAccountRepository;

    public UpdateBankAccountCommandHandler(
        IFinanceUnitOfWork unitOfWork,
        IFinanceRepository<BankAccount> bankAccountRepository)
    {
        _unitOfWork = unitOfWork;
        _bankAccountRepository = bankAccountRepository;
    }

    public async Task<Result<BankAccountDto>> Handle(UpdateBankAccountCommand request, CancellationToken cancellationToken)
    {
        var bankAccount = await _bankAccountRepository.GetByIdAsync(request.Id, cancellationToken);
        if (bankAccount == null)
        {
            return Result<BankAccountDto>.Failure(
                Error.NotFound("BankAccount", $"ID {request.Id} ile banka hesabi bulunamadi"));
        }

        if (!bankAccount.IsActive)
        {
            return Result<BankAccountDto>.Failure(
                Error.Validation("BankAccount.Status", "Pasif banka hesaplari guncellenemez"));
        }

        // Update basic info
        var name = request.Data.Name ?? bankAccount.Name;
        var bankName = request.Data.BankName ?? bankAccount.BankName;
        var branchName = request.Data.BranchName ?? bankAccount.BranchName;
        var branchCode = request.Data.BranchCode ?? bankAccount.BranchCode;
        var swiftCode = request.Data.SwiftCode ?? bankAccount.SwiftCode;

        bankAccount.UpdateBasicInfo(name, bankName, branchName, branchCode, swiftCode);

        // Update account numbers if provided
        if (!string.IsNullOrEmpty(request.Data.AccountNumber) || !string.IsNullOrEmpty(request.Data.Iban))
        {
            var accountNumber = request.Data.AccountNumber ?? bankAccount.AccountNumber;
            var iban = request.Data.Iban ?? bankAccount.Iban;

            // Check if new IBAN already exists (excluding current account)
            if (!string.IsNullOrEmpty(request.Data.Iban))
            {
                var normalizedIban = request.Data.Iban.Replace(" ", "").ToUpperInvariant();
                var existingByIban = await _bankAccountRepository.FirstOrDefaultAsync(
                    x => x.Iban == normalizedIban && x.Id != request.Id, cancellationToken);
                if (existingByIban != null)
                {
                    return Result<BankAccountDto>.Failure(
                        Error.Conflict("BankAccount.Iban", $"'{request.Data.Iban}' IBAN numarali baska bir banka hesabi zaten mevcut"));
                }
            }

            bankAccount.UpdateAccountNumbers(accountNumber, iban);
        }

        // Update notes
        if (request.Data.Notes != null)
        {
            bankAccount.SetNotes(request.Data.Notes);
        }

        // Update accounting account link
        if (request.Data.AccountingAccountId.HasValue)
        {
            bankAccount.LinkToAccountingAccount(request.Data.AccountingAccountId.Value);
        }

        // Update POS info
        if (request.Data.IsPosAccount.HasValue)
        {
            bankAccount.SetPosInfo(
                request.Data.IsPosAccount.Value,
                request.Data.PosCommissionRate ?? bankAccount.PosCommissionRate,
                request.Data.PosTerminalId ?? bankAccount.PosTerminalId,
                request.Data.PosMerchantId ?? bankAccount.PosMerchantId);
        }

        // Update integration info
        if (request.Data.HasBankIntegration.HasValue)
        {
            bankAccount.SetIntegration(
                request.Data.HasBankIntegration.Value,
                request.Data.IntegrationType ?? bankAccount.IntegrationType,
                request.Data.IsAutoMatchingEnabled ?? bankAccount.IsAutoMatchingEnabled);
        }

        // Update limits
        if (request.Data.DailyTransferLimit.HasValue || request.Data.SingleTransferLimit.HasValue || request.Data.CreditLimit.HasValue)
        {
            Money? dailyLimit = request.Data.DailyTransferLimit.HasValue
                ? Money.Create(request.Data.DailyTransferLimit.Value, bankAccount.Currency)
                : bankAccount.DailyTransferLimit;
            Money? singleLimit = request.Data.SingleTransferLimit.HasValue
                ? Money.Create(request.Data.SingleTransferLimit.Value, bankAccount.Currency)
                : bankAccount.SingleTransferLimit;
            Money? creditLimit = request.Data.CreditLimit.HasValue
                ? Money.Create(request.Data.CreditLimit.Value, bankAccount.Currency)
                : bankAccount.CreditLimit;

            bankAccount.SetLimits(dailyLimit, singleLimit, creditLimit);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = CreateBankAccountCommandHandler.MapToDto(bankAccount);
        return Result<BankAccountDto>.Success(dto);
    }
}

/// <summary>
/// Command to delete a bank account
/// </summary>
public class DeleteBankAccountCommand : IRequest<Result<bool>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

/// <summary>
/// Handler for DeleteBankAccountCommand
/// </summary>
public class DeleteBankAccountCommandHandler : IRequestHandler<DeleteBankAccountCommand, Result<bool>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;
    private readonly IFinanceRepository<BankAccount> _bankAccountRepository;

    public DeleteBankAccountCommandHandler(
        IFinanceUnitOfWork unitOfWork,
        IFinanceRepository<BankAccount> bankAccountRepository)
    {
        _unitOfWork = unitOfWork;
        _bankAccountRepository = bankAccountRepository;
    }

    public async Task<Result<bool>> Handle(DeleteBankAccountCommand request, CancellationToken cancellationToken)
    {
        var bankAccount = await _bankAccountRepository.GetByIdAsync(request.Id, cancellationToken);
        if (bankAccount == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("BankAccount", $"ID {request.Id} ile banka hesabi bulunamadi"));
        }

        // Check if account has non-zero balance
        if (bankAccount.Balance.Amount != 0)
        {
            return Result<bool>.Failure(
                Error.Validation("BankAccount.Balance", "Bakiyesi sifir olmayan banka hesaplari silinemez"));
        }

        // Check if it's the default account
        if (bankAccount.IsDefault)
        {
            return Result<bool>.Failure(
                Error.Validation("BankAccount.IsDefault", "Varsayilan banka hesabi silinemez. Once baska bir hesabi varsayilan yapin"));
        }

        _bankAccountRepository.Remove(bankAccount);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}

/// <summary>
/// Command to activate a bank account
/// </summary>
public class ActivateBankAccountCommand : IRequest<Result<BankAccountDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

/// <summary>
/// Handler for ActivateBankAccountCommand
/// </summary>
public class ActivateBankAccountCommandHandler : IRequestHandler<ActivateBankAccountCommand, Result<BankAccountDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;
    private readonly IFinanceRepository<BankAccount> _bankAccountRepository;

    public ActivateBankAccountCommandHandler(
        IFinanceUnitOfWork unitOfWork,
        IFinanceRepository<BankAccount> bankAccountRepository)
    {
        _unitOfWork = unitOfWork;
        _bankAccountRepository = bankAccountRepository;
    }

    public async Task<Result<BankAccountDto>> Handle(ActivateBankAccountCommand request, CancellationToken cancellationToken)
    {
        var bankAccount = await _bankAccountRepository.GetByIdAsync(request.Id, cancellationToken);
        if (bankAccount == null)
        {
            return Result<BankAccountDto>.Failure(
                Error.NotFound("BankAccount", $"ID {request.Id} ile banka hesabi bulunamadi"));
        }

        if (bankAccount.IsActive)
        {
            return Result<BankAccountDto>.Failure(
                Error.Validation("BankAccount.Status", "Banka hesabi zaten aktif"));
        }

        bankAccount.Activate();
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = CreateBankAccountCommandHandler.MapToDto(bankAccount);
        return Result<BankAccountDto>.Success(dto);
    }
}

/// <summary>
/// Command to deactivate a bank account
/// </summary>
public class DeactivateBankAccountCommand : IRequest<Result<BankAccountDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

/// <summary>
/// Handler for DeactivateBankAccountCommand
/// </summary>
public class DeactivateBankAccountCommandHandler : IRequestHandler<DeactivateBankAccountCommand, Result<BankAccountDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;
    private readonly IFinanceRepository<BankAccount> _bankAccountRepository;

    public DeactivateBankAccountCommandHandler(
        IFinanceUnitOfWork unitOfWork,
        IFinanceRepository<BankAccount> bankAccountRepository)
    {
        _unitOfWork = unitOfWork;
        _bankAccountRepository = bankAccountRepository;
    }

    public async Task<Result<BankAccountDto>> Handle(DeactivateBankAccountCommand request, CancellationToken cancellationToken)
    {
        var bankAccount = await _bankAccountRepository.GetByIdAsync(request.Id, cancellationToken);
        if (bankAccount == null)
        {
            return Result<BankAccountDto>.Failure(
                Error.NotFound("BankAccount", $"ID {request.Id} ile banka hesabi bulunamadi"));
        }

        if (!bankAccount.IsActive)
        {
            return Result<BankAccountDto>.Failure(
                Error.Validation("BankAccount.Status", "Banka hesabi zaten pasif"));
        }

        if (bankAccount.IsDefault)
        {
            return Result<BankAccountDto>.Failure(
                Error.Validation("BankAccount.IsDefault", "Varsayilan banka hesabi pasif yapilamaz. Once baska bir hesabi varsayilan yapin"));
        }

        bankAccount.Deactivate();
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = CreateBankAccountCommandHandler.MapToDto(bankAccount);
        return Result<BankAccountDto>.Success(dto);
    }
}

/// <summary>
/// Command to set a bank account as default
/// </summary>
public class SetDefaultBankAccountCommand : IRequest<Result<BankAccountDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

/// <summary>
/// Handler for SetDefaultBankAccountCommand
/// </summary>
public class SetDefaultBankAccountCommandHandler : IRequestHandler<SetDefaultBankAccountCommand, Result<BankAccountDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;
    private readonly IFinanceRepository<BankAccount> _bankAccountRepository;

    public SetDefaultBankAccountCommandHandler(
        IFinanceUnitOfWork unitOfWork,
        IFinanceRepository<BankAccount> bankAccountRepository)
    {
        _unitOfWork = unitOfWork;
        _bankAccountRepository = bankAccountRepository;
    }

    public async Task<Result<BankAccountDto>> Handle(SetDefaultBankAccountCommand request, CancellationToken cancellationToken)
    {
        var bankAccount = await _bankAccountRepository.GetByIdAsync(request.Id, cancellationToken);
        if (bankAccount == null)
        {
            return Result<BankAccountDto>.Failure(
                Error.NotFound("BankAccount", $"ID {request.Id} ile banka hesabi bulunamadi"));
        }

        if (!bankAccount.IsActive)
        {
            return Result<BankAccountDto>.Failure(
                Error.Validation("BankAccount.Status", "Pasif banka hesabi varsayilan yapilamaz"));
        }

        if (bankAccount.IsDefault)
        {
            return Result<BankAccountDto>.Failure(
                Error.Validation("BankAccount.IsDefault", "Banka hesabi zaten varsayilan"));
        }

        // Remove default flag from current default accounts with same currency
        var currentDefaults = await _bankAccountRepository.FindAsync(
            x => x.IsDefault && x.Currency == bankAccount.Currency && x.Id != request.Id,
            cancellationToken);

        foreach (var defaultAccount in currentDefaults)
        {
            defaultAccount.RemoveDefault();
        }

        // Set new default
        bankAccount.SetAsDefault();
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = CreateBankAccountCommandHandler.MapToDto(bankAccount);
        return Result<BankAccountDto>.Success(dto);
    }
}

/// <summary>
/// Command to update bank account balance
/// </summary>
public class UpdateBankAccountBalanceCommand : IRequest<Result<BankAccountDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public UpdateBankAccountBalanceDto Data { get; set; } = null!;
}

/// <summary>
/// Handler for UpdateBankAccountBalanceCommand
/// </summary>
public class UpdateBankAccountBalanceCommandHandler : IRequestHandler<UpdateBankAccountBalanceCommand, Result<BankAccountDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;
    private readonly IFinanceRepository<BankAccount> _bankAccountRepository;

    public UpdateBankAccountBalanceCommandHandler(IFinanceUnitOfWork unitOfWork, IFinanceRepository<BankAccount> bankAccountRepository)
    {
        _unitOfWork = unitOfWork;
        _bankAccountRepository = bankAccountRepository;
    }

    public async Task<Result<BankAccountDto>> Handle(UpdateBankAccountBalanceCommand request, CancellationToken cancellationToken)
    {
        var bankAccount = await _bankAccountRepository.GetByIdAsync(request.Id, cancellationToken);
        if (bankAccount == null)
        {
            return Result<BankAccountDto>.Failure(
                Error.NotFound("BankAccount", $"ID {request.Id} ile banka hesabı bulunamadı"));
        }

        // Calculate the adjustment amount
        var currentBalance = bankAccount.Balance.Amount;
        var adjustmentAmount = request.Data.NewBalance - currentBalance;

        if (adjustmentAmount != 0)
        {
            var adjustmentMoney = Money.Create(Math.Abs(adjustmentAmount), bankAccount.Currency);
            if (adjustmentAmount > 0)
            {
                bankAccount.Deposit(adjustmentMoney);
            }
            else
            {
                bankAccount.Withdraw(adjustmentMoney);
            }
        }

        if (!string.IsNullOrEmpty(request.Data.Notes))
        {
            var existingNotes = bankAccount.Notes ?? "";
            var balanceNote = $"[{DateTime.UtcNow:yyyy-MM-dd HH:mm}] Bakiye güncellendi: {request.Data.Notes}";
            bankAccount.SetNotes(string.IsNullOrEmpty(existingNotes) ? balanceNote : $"{balanceNote}\n{existingNotes}");
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = CreateBankAccountCommandHandler.MapToDto(bankAccount);
        return Result<BankAccountDto>.Success(dto);
    }
}
