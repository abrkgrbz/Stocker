using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Finance.Application.DTOs;
using Stocker.Modules.Finance.Domain.Entities;
using Stocker.Modules.Finance.Domain.Enums;
using Stocker.Modules.Finance.Interfaces;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;
using Stocker.Domain.Common.ValueObjects;

namespace Stocker.Modules.Finance.Application.Features.Checks.Commands;

#region Create Received Check

/// <summary>
/// Alınan çek oluşturma komutu
/// </summary>
public class CreateReceivedCheckCommand : IRequest<Result<CheckDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public CreateReceivedCheckDto Data { get; set; } = null!;
}

/// <summary>
/// Handler for CreateReceivedCheckCommand
/// </summary>
public class CreateReceivedCheckCommandHandler : IRequestHandler<CreateReceivedCheckCommand, Result<CheckDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public CreateReceivedCheckCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<CheckDto>> Handle(CreateReceivedCheckCommand request, CancellationToken cancellationToken)
    {
        // Validate current account if provided
        string? currentAccountName = null;
        if (request.Data.CurrentAccountId.HasValue)
        {
            var currentAccount = await _unitOfWork.CurrentAccounts.GetByIdAsync(request.Data.CurrentAccountId.Value, cancellationToken);
            if (currentAccount == null)
            {
                return Result<CheckDto>.Failure(
                    Error.NotFound("CurrentAccount", $"ID {request.Data.CurrentAccountId} ile cari hesap bulunamadı"));
            }
            currentAccountName = currentAccount.Name;
        }

        // Create amount
        var amount = Money.Create(request.Data.Amount, request.Data.Currency);

        // Create received check
        var check = Check.CreateReceivedCheck(
            request.Data.CheckNumber,
            request.Data.PortfolioNumber,
            request.Data.RegistrationDate,
            request.Data.DueDate,
            request.Data.IssueDate,
            amount,
            request.Data.BankName,
            request.Data.DrawerName,
            request.Data.CurrentAccountId,
            currentAccountName);

        // Set optional fields
        if (!string.IsNullOrEmpty(request.Data.SerialNumber))
        {
            check.SetSerialNumber(request.Data.SerialNumber);
        }

        if (request.Data.ExchangeRate.HasValue && request.Data.ExchangeRate.Value != 1)
        {
            check.SetExchangeRate(request.Data.ExchangeRate.Value);
        }

        check.SetBankInfo(
            request.Data.BankName,
            request.Data.BranchName,
            request.Data.BranchCode,
            request.Data.AccountNumber,
            request.Data.Iban);

        check.SetDrawerInfo(
            request.Data.DrawerName,
            request.Data.DrawerTaxId,
            request.Data.DrawerAddress,
            request.Data.DrawerPhone);

        if (!string.IsNullOrEmpty(request.Data.BeneficiaryName))
        {
            check.SetBeneficiaryInfo(request.Data.BeneficiaryName, request.Data.BeneficiaryTaxId);
        }

        if (!string.IsNullOrEmpty(request.Data.Notes))
        {
            check.SetNotes(request.Data.Notes);
        }

        // Save to database
        var dbContext = GetDbContext();
        await dbContext.Set<Check>().AddAsync(check, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = CheckDtoMapper.MapToDto(check);
        return Result<CheckDto>.Success(dto);
    }

    private DbContext GetDbContext()
    {
        return (_unitOfWork as dynamic).Context as DbContext
            ?? throw new InvalidOperationException("DbContext'e erişilemedi");
    }
}

#endregion

#region Create Given Check

/// <summary>
/// Verilen çek oluşturma komutu
/// </summary>
public class CreateGivenCheckCommand : IRequest<Result<CheckDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public CreateGivenCheckDto Data { get; set; } = null!;
}

/// <summary>
/// Handler for CreateGivenCheckCommand
/// </summary>
public class CreateGivenCheckCommandHandler : IRequestHandler<CreateGivenCheckCommand, Result<CheckDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public CreateGivenCheckCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<CheckDto>> Handle(CreateGivenCheckCommand request, CancellationToken cancellationToken)
    {
        // Validate current account if provided
        string? currentAccountName = null;
        if (request.Data.CurrentAccountId.HasValue)
        {
            var currentAccount = await _unitOfWork.CurrentAccounts.GetByIdAsync(request.Data.CurrentAccountId.Value, cancellationToken);
            if (currentAccount == null)
            {
                return Result<CheckDto>.Failure(
                    Error.NotFound("CurrentAccount", $"ID {request.Data.CurrentAccountId} ile cari hesap bulunamadı"));
            }
            currentAccountName = currentAccount.Name;
        }

        // Create amount
        var amount = Money.Create(request.Data.Amount, request.Data.Currency);

        // Create given check
        var check = Check.CreateGivenCheck(
            request.Data.CheckNumber,
            request.Data.PortfolioNumber,
            request.Data.RegistrationDate,
            request.Data.DueDate,
            request.Data.IssueDate,
            amount,
            request.Data.BankName,
            request.Data.DrawerName,
            request.Data.CurrentAccountId,
            currentAccountName);

        // Set optional fields
        if (!string.IsNullOrEmpty(request.Data.SerialNumber))
        {
            check.SetSerialNumber(request.Data.SerialNumber);
        }

        if (request.Data.ExchangeRate.HasValue && request.Data.ExchangeRate.Value != 1)
        {
            check.SetExchangeRate(request.Data.ExchangeRate.Value);
        }

        check.SetBankInfo(
            request.Data.BankName,
            request.Data.BranchName,
            request.Data.BranchCode,
            request.Data.AccountNumber,
            request.Data.Iban);

        check.SetDrawerInfo(
            request.Data.DrawerName,
            request.Data.DrawerTaxId,
            request.Data.DrawerAddress,
            request.Data.DrawerPhone);

        if (!string.IsNullOrEmpty(request.Data.BeneficiaryName))
        {
            check.SetBeneficiaryInfo(request.Data.BeneficiaryName, request.Data.BeneficiaryTaxId);
        }

        if (!string.IsNullOrEmpty(request.Data.Notes))
        {
            check.SetNotes(request.Data.Notes);
        }

        // Save
        var dbContext = GetDbContext();
        await dbContext.Set<Check>().AddAsync(check, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = CheckDtoMapper.MapToDto(check);
        return Result<CheckDto>.Success(dto);
    }

    private DbContext GetDbContext()
    {
        return (_unitOfWork as dynamic).Context as DbContext
            ?? throw new InvalidOperationException("DbContext'e erişilemedi");
    }
}

#endregion

#region Update Check

/// <summary>
/// Çek güncelleme komutu
/// </summary>
public class UpdateCheckCommand : IRequest<Result<CheckDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public UpdateCheckDto Data { get; set; } = null!;
}

/// <summary>
/// Handler for UpdateCheckCommand
/// </summary>
public class UpdateCheckCommandHandler : IRequestHandler<UpdateCheckCommand, Result<CheckDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public UpdateCheckCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<CheckDto>> Handle(UpdateCheckCommand request, CancellationToken cancellationToken)
    {
        var dbContext = GetDbContext();
        var check = await dbContext.Set<Check>()
            .Include(c => c.Movements)
            .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);

        if (check == null)
        {
            return Result<CheckDto>.Failure(
                Error.NotFound("Check", $"ID {request.Id} ile çek bulunamadı"));
        }

        // Check if can be updated (not collected, bounced, etc.)
        if (check.Status == NegotiableInstrumentStatus.Collected ||
            check.Status == NegotiableInstrumentStatus.Bounced ||
            check.Status == NegotiableInstrumentStatus.Protested)
        {
            return Result<CheckDto>.Failure(
                Error.Validation("Check.Status", "Tahsil edilmiş, karşılıksız veya protestolu çekler güncellenemez"));
        }

        // Update serial number
        if (request.Data.SerialNumber != null)
        {
            check.SetSerialNumber(request.Data.SerialNumber);
        }

        // Update bank info
        if (!string.IsNullOrEmpty(request.Data.BankName) ||
            request.Data.BranchName != null ||
            request.Data.BranchCode != null ||
            request.Data.AccountNumber != null ||
            request.Data.Iban != null)
        {
            check.SetBankInfo(
                request.Data.BankName ?? check.BankName,
                request.Data.BranchName ?? check.BranchName,
                request.Data.BranchCode ?? check.BranchCode,
                request.Data.AccountNumber ?? check.AccountNumber,
                request.Data.Iban ?? check.Iban);
        }

        // Update drawer info
        if (!string.IsNullOrEmpty(request.Data.DrawerName) ||
            request.Data.DrawerTaxId != null ||
            request.Data.DrawerAddress != null ||
            request.Data.DrawerPhone != null)
        {
            check.SetDrawerInfo(
                request.Data.DrawerName ?? check.DrawerName,
                request.Data.DrawerTaxId ?? check.DrawerTaxId,
                request.Data.DrawerAddress ?? check.DrawerAddress,
                request.Data.DrawerPhone ?? check.DrawerPhone);
        }

        // Update beneficiary info
        if (request.Data.BeneficiaryName != null || request.Data.BeneficiaryTaxId != null)
        {
            check.SetBeneficiaryInfo(
                request.Data.BeneficiaryName ?? check.BeneficiaryName,
                request.Data.BeneficiaryTaxId ?? check.BeneficiaryTaxId);
        }

        // Update current account
        if (request.Data.CurrentAccountId.HasValue)
        {
            var currentAccount = await _unitOfWork.CurrentAccounts.GetByIdAsync(request.Data.CurrentAccountId.Value, cancellationToken);
            if (currentAccount == null)
            {
                return Result<CheckDto>.Failure(
                    Error.NotFound("CurrentAccount", $"ID {request.Data.CurrentAccountId} ile cari hesap bulunamadı"));
            }
            check.LinkToCurrentAccount(currentAccount.Id, currentAccount.Name);
        }

        // Update notes
        if (request.Data.Notes != null)
        {
            check.SetNotes(request.Data.Notes);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = CheckDtoMapper.MapToDto(check);
        return Result<CheckDto>.Success(dto);
    }

    private DbContext GetDbContext()
    {
        return (_unitOfWork as dynamic).Context as DbContext
            ?? throw new InvalidOperationException("DbContext'e erişilemedi");
    }
}

#endregion

#region Delete Check

/// <summary>
/// Çek silme komutu
/// </summary>
public class DeleteCheckCommand : IRequest<Result<bool>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

/// <summary>
/// Handler for DeleteCheckCommand
/// </summary>
public class DeleteCheckCommandHandler : IRequestHandler<DeleteCheckCommand, Result<bool>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public DeleteCheckCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(DeleteCheckCommand request, CancellationToken cancellationToken)
    {
        var dbContext = GetDbContext();
        var check = await dbContext.Set<Check>()
            .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);

        if (check == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("Check", $"ID {request.Id} ile çek bulunamadı"));
        }

        // Check if can be deleted
        if (check.Status != NegotiableInstrumentStatus.InPortfolio)
        {
            return Result<bool>.Failure(
                Error.Validation("Check.Status", "Sadece portföydeki çekler silinebilir"));
        }

        if (check.PaymentId.HasValue)
        {
            return Result<bool>.Failure(
                Error.Validation("Check.Payment", "Ödemeye bağlı çekler silinemez"));
        }

        dbContext.Set<Check>().Remove(check);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }

    private DbContext GetDbContext()
    {
        return (_unitOfWork as dynamic).Context as DbContext
            ?? throw new InvalidOperationException("DbContext'e erişilemedi");
    }
}

#endregion

#region Give to Bank

/// <summary>
/// Bankaya tahsile verme komutu
/// </summary>
public class GiveToBankCommand : IRequest<Result<CheckDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public GiveToBankDto Data { get; set; } = null!;
}

/// <summary>
/// Handler for GiveToBankCommand
/// </summary>
public class GiveToBankCommandHandler : IRequestHandler<GiveToBankCommand, Result<CheckDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GiveToBankCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<CheckDto>> Handle(GiveToBankCommand request, CancellationToken cancellationToken)
    {
        var dbContext = GetDbContext();
        var check = await dbContext.Set<Check>()
            .Include(c => c.Movements)
            .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);

        if (check == null)
        {
            return Result<CheckDto>.Failure(
                Error.NotFound("Check", $"ID {request.Id} ile çek bulunamadı"));
        }

        try
        {
            check.GiveToBank(request.Data.BankAccountId, request.Data.Date);
        }
        catch (InvalidOperationException ex)
        {
            return Result<CheckDto>.Failure(
                Error.Validation("Check.GiveToBank", ex.Message));
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = CheckDtoMapper.MapToDto(check);
        return Result<CheckDto>.Success(dto);
    }

    private DbContext GetDbContext()
    {
        return (_unitOfWork as dynamic).Context as DbContext
            ?? throw new InvalidOperationException("DbContext'e erişilemedi");
    }
}

#endregion

#region Return from Bank

/// <summary>
/// Bankadan geri alma komutu
/// </summary>
public class ReturnFromBankCommand : IRequest<Result<CheckDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public ReturnFromBankDto Data { get; set; } = null!;
}

/// <summary>
/// Handler for ReturnFromBankCommand
/// </summary>
public class ReturnFromBankCommandHandler : IRequestHandler<ReturnFromBankCommand, Result<CheckDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public ReturnFromBankCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<CheckDto>> Handle(ReturnFromBankCommand request, CancellationToken cancellationToken)
    {
        var dbContext = GetDbContext();
        var check = await dbContext.Set<Check>()
            .Include(c => c.Movements)
            .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);

        if (check == null)
        {
            return Result<CheckDto>.Failure(
                Error.NotFound("Check", $"ID {request.Id} ile çek bulunamadı"));
        }

        try
        {
            check.ReturnFromBank(request.Data.Date);
        }
        catch (InvalidOperationException ex)
        {
            return Result<CheckDto>.Failure(
                Error.Validation("Check.ReturnFromBank", ex.Message));
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = CheckDtoMapper.MapToDto(check);
        return Result<CheckDto>.Success(dto);
    }

    private DbContext GetDbContext()
    {
        return (_unitOfWork as dynamic).Context as DbContext
            ?? throw new InvalidOperationException("DbContext'e erişilemedi");
    }
}

#endregion

#region Endorse Check

/// <summary>
/// Ciro etme komutu
/// </summary>
public class EndorseCheckCommand : IRequest<Result<CheckDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public EndorseCheckDto Data { get; set; } = null!;
}

/// <summary>
/// Handler for EndorseCheckCommand
/// </summary>
public class EndorseCheckCommandHandler : IRequestHandler<EndorseCheckCommand, Result<CheckDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public EndorseCheckCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<CheckDto>> Handle(EndorseCheckCommand request, CancellationToken cancellationToken)
    {
        var dbContext = GetDbContext();
        var check = await dbContext.Set<Check>()
            .Include(c => c.Movements)
            .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);

        if (check == null)
        {
            return Result<CheckDto>.Failure(
                Error.NotFound("Check", $"ID {request.Id} ile çek bulunamadı"));
        }

        // Validate endorsed to current account
        var endorsedToAccount = await _unitOfWork.CurrentAccounts.GetByIdAsync(request.Data.EndorsedToCurrentAccountId, cancellationToken);
        if (endorsedToAccount == null)
        {
            return Result<CheckDto>.Failure(
                Error.NotFound("CurrentAccount", $"ID {request.Data.EndorsedToCurrentAccountId} ile cari hesap bulunamadı"));
        }

        try
        {
            check.Endorse(request.Data.EndorsedToCurrentAccountId, request.Data.Date);
        }
        catch (InvalidOperationException ex)
        {
            return Result<CheckDto>.Failure(
                Error.Validation("Check.Endorse", ex.Message));
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = CheckDtoMapper.MapToDto(check);
        return Result<CheckDto>.Success(dto);
    }

    private DbContext GetDbContext()
    {
        return (_unitOfWork as dynamic).Context as DbContext
            ?? throw new InvalidOperationException("DbContext'e erişilemedi");
    }
}

#endregion

#region Collect Check

/// <summary>
/// Tahsil etme komutu
/// </summary>
public class CollectCheckCommand : IRequest<Result<CheckDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public CollectCheckDto Data { get; set; } = null!;
}

/// <summary>
/// Handler for CollectCheckCommand
/// </summary>
public class CollectCheckCommandHandler : IRequestHandler<CollectCheckCommand, Result<CheckDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public CollectCheckCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<CheckDto>> Handle(CollectCheckCommand request, CancellationToken cancellationToken)
    {
        var dbContext = GetDbContext();
        var check = await dbContext.Set<Check>()
            .Include(c => c.Movements)
            .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);

        if (check == null)
        {
            return Result<CheckDto>.Failure(
                Error.NotFound("Check", $"ID {request.Id} ile çek bulunamadı"));
        }

        try
        {
            check.Collect(request.Data.Date);
        }
        catch (InvalidOperationException ex)
        {
            return Result<CheckDto>.Failure(
                Error.Validation("Check.Collect", ex.Message));
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = CheckDtoMapper.MapToDto(check);
        return Result<CheckDto>.Success(dto);
    }

    private DbContext GetDbContext()
    {
        return (_unitOfWork as dynamic).Context as DbContext
            ?? throw new InvalidOperationException("DbContext'e erişilemedi");
    }
}

#endregion

#region Mark as Bounced

/// <summary>
/// Karşılıksız işaretleme komutu
/// </summary>
public class MarkAsBouncedCommand : IRequest<Result<CheckDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public MarkAsBouncedDto Data { get; set; } = null!;
}

/// <summary>
/// Handler for MarkAsBouncedCommand
/// </summary>
public class MarkAsBouncedCommandHandler : IRequestHandler<MarkAsBouncedCommand, Result<CheckDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public MarkAsBouncedCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<CheckDto>> Handle(MarkAsBouncedCommand request, CancellationToken cancellationToken)
    {
        var dbContext = GetDbContext();
        var check = await dbContext.Set<Check>()
            .Include(c => c.Movements)
            .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);

        if (check == null)
        {
            return Result<CheckDto>.Failure(
                Error.NotFound("Check", $"ID {request.Id} ile çek bulunamadı"));
        }

        if (string.IsNullOrWhiteSpace(request.Data.Reason))
        {
            return Result<CheckDto>.Failure(
                Error.Validation("Check.MarkAsBounced", "Karşılıksız nedeni belirtilmelidir"));
        }

        try
        {
            check.MarkAsBounced(request.Data.Date, request.Data.Reason);
        }
        catch (InvalidOperationException ex)
        {
            return Result<CheckDto>.Failure(
                Error.Validation("Check.MarkAsBounced", ex.Message));
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = CheckDtoMapper.MapToDto(check);
        return Result<CheckDto>.Success(dto);
    }

    private DbContext GetDbContext()
    {
        return (_unitOfWork as dynamic).Context as DbContext
            ?? throw new InvalidOperationException("DbContext'e erişilemedi");
    }
}

#endregion

#region DTO Mapper

/// <summary>
/// Check entity to DTO mapper
/// </summary>
internal static class CheckDtoMapper
{
    public static CheckDto MapToDto(Check check)
    {
        return new CheckDto
        {
            Id = check.Id,
            CheckNumber = check.CheckNumber,
            PortfolioNumber = check.PortfolioNumber,
            SerialNumber = check.SerialNumber,
            CheckType = check.CheckType,
            CheckTypeName = GetCheckTypeName(check.CheckType),
            Direction = check.Direction,
            DirectionName = check.Direction == MovementDirection.Inbound ? "Alınan Çek" : "Verilen Çek",
            Status = check.Status,
            StatusName = GetStatusName(check.Status),
            RegistrationDate = check.RegistrationDate,
            DueDate = check.DueDate,
            IssueDate = check.IssueDate,
            CollectionDate = check.CollectionDate,
            Amount = check.Amount.Amount,
            Currency = check.Currency,
            ExchangeRate = check.ExchangeRate,
            AmountTRY = check.AmountTRY.Amount,
            BankName = check.BankName,
            BranchName = check.BranchName,
            BranchCode = check.BranchCode,
            AccountNumber = check.AccountNumber,
            Iban = check.Iban,
            DrawerName = check.DrawerName,
            DrawerTaxId = check.DrawerTaxId,
            DrawerAddress = check.DrawerAddress,
            DrawerPhone = check.DrawerPhone,
            BeneficiaryName = check.BeneficiaryName,
            BeneficiaryTaxId = check.BeneficiaryTaxId,
            CurrentAccountId = check.CurrentAccountId,
            CurrentAccountName = check.CurrentAccountName,
            IsGivenToBank = check.IsGivenToBank,
            CollectionBankAccountId = check.CollectionBankAccountId,
            CollectionBankAccountName = check.CollectionBankAccount?.Name,
            GivenToBankDate = check.GivenToBankDate,
            IsEndorsed = check.IsEndorsed,
            EndorsedToCurrentAccountId = check.EndorsedToCurrentAccountId,
            EndorsedToCurrentAccountName = check.EndorsedToCurrentAccount?.Name,
            EndorsementDate = check.EndorsementDate,
            IsGivenAsCollateral = check.IsGivenAsCollateral,
            CollateralGivenTo = check.CollateralGivenTo,
            CollateralDate = check.CollateralDate,
            IsBounced = check.IsBounced,
            BouncedDate = check.BouncedDate,
            BouncedReason = check.BouncedReason,
            IsProtested = check.IsProtested,
            ProtestDate = check.ProtestDate,
            PaymentId = check.PaymentId,
            JournalEntryId = check.JournalEntryId,
            Notes = check.Notes,
            Movements = check.Movements.Select(MapMovementToDto).ToList(),
            CreatedAt = check.CreatedDate,
            UpdatedAt = check.UpdatedDate
        };
    }

    public static CheckSummaryDto MapToSummaryDto(Check check)
    {
        return new CheckSummaryDto
        {
            Id = check.Id,
            CheckNumber = check.CheckNumber,
            PortfolioNumber = check.PortfolioNumber,
            CheckType = check.CheckType,
            Direction = check.Direction,
            DirectionName = check.Direction == MovementDirection.Inbound ? "Alınan Çek" : "Verilen Çek",
            Status = check.Status,
            StatusName = GetStatusName(check.Status),
            DueDate = check.DueDate,
            Amount = check.Amount.Amount,
            Currency = check.Currency,
            BankName = check.BankName,
            DrawerName = check.DrawerName,
            CurrentAccountName = check.CurrentAccountName
        };
    }

    private static CheckMovementDto MapMovementToDto(CheckMovement movement)
    {
        return new CheckMovementDto
        {
            Id = movement.Id,
            CheckId = movement.CheckId,
            MovementType = movement.MovementType,
            MovementTypeName = GetMovementTypeName(movement.MovementType),
            MovementDate = movement.MovementDate,
            Description = movement.Description
        };
    }

    private static string GetCheckTypeName(CheckType checkType)
    {
        return checkType switch
        {
            CheckType.CustomerCheck => "Müşteri Çeki",
            CheckType.CompanyCheck => "Firma Çeki",
            CheckType.GuaranteeCheck => "Kefalet Çeki",
            CheckType.BankCheck => "Banka Çeki",
            _ => checkType.ToString()
        };
    }

    private static string GetStatusName(NegotiableInstrumentStatus status)
    {
        return status switch
        {
            NegotiableInstrumentStatus.InPortfolio => "Portföyde",
            NegotiableInstrumentStatus.GivenToBank => "Bankaya Verildi",
            NegotiableInstrumentStatus.Endorsed => "Ciro Edildi",
            NegotiableInstrumentStatus.GivenAsCollateral => "Teminata Verildi",
            NegotiableInstrumentStatus.Protested => "Protestolu",
            NegotiableInstrumentStatus.Collected => "Tahsil Edildi",
            NegotiableInstrumentStatus.Bounced => "Karşılıksız",
            NegotiableInstrumentStatus.Returned => "İade Edildi",
            _ => status.ToString()
        };
    }

    private static string GetMovementTypeName(CheckMovementType movementType)
    {
        return movementType switch
        {
            CheckMovementType.Received => "Alındı",
            CheckMovementType.Given => "Verildi",
            CheckMovementType.GivenToBank => "Bankaya Verildi",
            CheckMovementType.ReturnedFromBank => "Bankadan Geri Alındı",
            CheckMovementType.Endorsed => "Ciro Edildi",
            CheckMovementType.GivenAsCollateral => "Teminata Verildi",
            CheckMovementType.ReturnedFromCollateral => "Teminattan Geri Alındı",
            CheckMovementType.Collected => "Tahsil Edildi",
            CheckMovementType.Bounced => "Karşılıksız",
            CheckMovementType.Protested => "Protesto Edildi",
            CheckMovementType.Returned => "İade Edildi",
            CheckMovementType.Cancelled => "İptal Edildi",
            _ => movementType.ToString()
        };
    }
}

#endregion

#region Create Check (General)

/// <summary>
/// Genel çek oluşturma komutu - direction'a göre alınan veya verilen çek oluşturur
/// </summary>
public class CreateCheckCommand : IRequest<Result<CheckDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public CreateCheckDto Data { get; set; } = null!;
}

/// <summary>
/// Handler for CreateCheckCommand
/// </summary>
public class CreateCheckCommandHandler : IRequestHandler<CreateCheckCommand, Result<CheckDto>>
{
    private readonly IMediator _mediator;

    public CreateCheckCommandHandler(IMediator mediator)
    {
        _mediator = mediator;
    }

    public async Task<Result<CheckDto>> Handle(CreateCheckCommand request, CancellationToken cancellationToken)
    {
        // Delegate to appropriate command based on direction
        if (request.Data.Direction == MovementDirection.Inbound)
        {
            var receivedDto = new CreateReceivedCheckDto
            {
                CheckNumber = request.Data.CheckNumber,
                PortfolioNumber = request.Data.PortfolioNumber,
                SerialNumber = request.Data.SerialNumber,
                RegistrationDate = request.Data.RegistrationDate,
                DueDate = request.Data.DueDate,
                IssueDate = request.Data.IssueDate,
                Amount = request.Data.Amount,
                Currency = request.Data.Currency,
                ExchangeRate = request.Data.ExchangeRate,
                BankName = request.Data.BankName,
                BranchName = request.Data.BranchName,
                BranchCode = request.Data.BranchCode,
                AccountNumber = request.Data.AccountNumber,
                Iban = request.Data.Iban,
                DrawerName = request.Data.DrawerName,
                DrawerTaxId = request.Data.DrawerTaxId,
                DrawerAddress = request.Data.DrawerAddress,
                DrawerPhone = request.Data.DrawerPhone,
                BeneficiaryName = request.Data.BeneficiaryName,
                BeneficiaryTaxId = request.Data.BeneficiaryTaxId,
                CurrentAccountId = request.Data.CurrentAccountId,
                Notes = request.Data.Notes
            };
            return await _mediator.Send(new CreateReceivedCheckCommand { TenantId = request.TenantId, Data = receivedDto }, cancellationToken);
        }
        else
        {
            var givenDto = new CreateGivenCheckDto
            {
                CheckNumber = request.Data.CheckNumber,
                PortfolioNumber = request.Data.PortfolioNumber,
                SerialNumber = request.Data.SerialNumber,
                RegistrationDate = request.Data.RegistrationDate,
                DueDate = request.Data.DueDate,
                IssueDate = request.Data.IssueDate,
                Amount = request.Data.Amount,
                Currency = request.Data.Currency,
                ExchangeRate = request.Data.ExchangeRate,
                BankName = request.Data.BankName,
                BranchName = request.Data.BranchName,
                BranchCode = request.Data.BranchCode,
                AccountNumber = request.Data.AccountNumber,
                Iban = request.Data.Iban,
                DrawerName = request.Data.DrawerName,
                DrawerTaxId = request.Data.DrawerTaxId,
                DrawerAddress = request.Data.DrawerAddress,
                DrawerPhone = request.Data.DrawerPhone,
                BeneficiaryName = request.Data.BeneficiaryName,
                BeneficiaryTaxId = request.Data.BeneficiaryTaxId,
                CurrentAccountId = request.Data.CurrentAccountId,
                Notes = request.Data.Notes
            };
            return await _mediator.Send(new CreateGivenCheckCommand { TenantId = request.TenantId, Data = givenDto }, cancellationToken);
        }
    }
}

#endregion

#region Bounce Check

/// <summary>
/// Çeki karşılıksız işaretleme komutu (alias for MarkAsBounced)
/// </summary>
public class BounceCheckCommand : IRequest<Result<CheckDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public BounceCheckDto Data { get; set; } = null!;
}

/// <summary>
/// Handler for BounceCheckCommand
/// </summary>
public class BounceCheckCommandHandler : IRequestHandler<BounceCheckCommand, Result<CheckDto>>
{
    private readonly IMediator _mediator;

    public BounceCheckCommandHandler(IMediator mediator)
    {
        _mediator = mediator;
    }

    public async Task<Result<CheckDto>> Handle(BounceCheckCommand request, CancellationToken cancellationToken)
    {
        var markAsBouncedDto = new MarkAsBouncedDto
        {
            Date = request.Data.BounceDate,
            Reason = request.Data.Reason
        };
        return await _mediator.Send(new MarkAsBouncedCommand { TenantId = request.TenantId, Id = request.Id, Data = markAsBouncedDto }, cancellationToken);
    }
}

#endregion

#region Give Check To Bank

/// <summary>
/// Çeki bankaya tahsile verme komutu (alias for GiveToBank)
/// </summary>
public class GiveCheckToBankCommand : IRequest<Result<CheckDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public CheckGiveToBankDto Data { get; set; } = null!;
}

/// <summary>
/// Handler for GiveCheckToBankCommand
/// </summary>
public class GiveCheckToBankCommandHandler : IRequestHandler<GiveCheckToBankCommand, Result<CheckDto>>
{
    private readonly IMediator _mediator;

    public GiveCheckToBankCommandHandler(IMediator mediator)
    {
        _mediator = mediator;
    }

    public async Task<Result<CheckDto>> Handle(GiveCheckToBankCommand request, CancellationToken cancellationToken)
    {
        var giveToBankDto = new GiveToBankDto
        {
            BankAccountId = request.Data.BankAccountId,
            Date = request.Data.Date
        };
        return await _mediator.Send(new GiveToBankCommand { TenantId = request.TenantId, Id = request.Id, Data = giveToBankDto }, cancellationToken);
    }
}

#endregion

#region Cancel Check

/// <summary>
/// Çek iptal komutu
/// </summary>
public class CancelCheckCommand : IRequest<Result<CheckDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public CancelCheckDto Data { get; set; } = null!;
}

/// <summary>
/// Handler for CancelCheckCommand
/// </summary>
public class CancelCheckCommandHandler : IRequestHandler<CancelCheckCommand, Result<CheckDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public CancelCheckCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<CheckDto>> Handle(CancelCheckCommand request, CancellationToken cancellationToken)
    {
        var dbContext = GetDbContext();
        var check = await dbContext.Set<Check>()
            .Include(c => c.Movements)
            .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);

        if (check == null)
        {
            return Result<CheckDto>.Failure(
                Error.NotFound("Check", $"ID {request.Id} ile çek bulunamadı"));
        }

        // Only InPortfolio checks can be cancelled
        if (check.Status != NegotiableInstrumentStatus.InPortfolio)
        {
            return Result<CheckDto>.Failure(
                Error.Validation("Check.Cancel", "Sadece portföydeki çekler iptal edilebilir"));
        }

        // Set notes to include cancellation reason
        var reason = request.Data.Reason ?? "İptal edildi";
        var cancellationNote = $"[İPTAL - {request.Data.CancellationDate:dd.MM.yyyy}] {reason}";
        check.SetNotes(string.IsNullOrEmpty(check.Notes) ? cancellationNote : $"{check.Notes}\n{cancellationNote}");

        // Remove the check from the database (cancelled checks are deleted)
        dbContext.Set<Check>().Remove(check);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Return the last state of the check before deletion
        var dto = CheckDtoMapper.MapToDto(check);
        return Result<CheckDto>.Success(dto);
    }

    private DbContext GetDbContext()
    {
        return (_unitOfWork as dynamic).Context as DbContext
            ?? throw new InvalidOperationException("DbContext'e erişilemedi");
    }
}

#endregion
