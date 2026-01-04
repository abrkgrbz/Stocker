using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Finance.Application.DTOs;
using Stocker.Modules.Finance.Domain.Entities;
using Stocker.Modules.Finance.Domain.Enums;
using Stocker.Modules.Finance.Interfaces;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;
using Stocker.Domain.Common.ValueObjects;

namespace Stocker.Modules.Finance.Application.Features.PromissoryNotes.Commands;

#region Create Received Note

/// <summary>
/// Alınan senet oluşturma komutu (Create Received Note Command)
/// </summary>
public class CreateReceivedNoteCommand : IRequest<Result<PromissoryNoteDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public CreatePromissoryNoteDto Data { get; set; } = null!;
}

/// <summary>
/// Handler for CreateReceivedNoteCommand
/// </summary>
public class CreateReceivedNoteCommandHandler : IRequestHandler<CreateReceivedNoteCommand, Result<PromissoryNoteDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public CreateReceivedNoteCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PromissoryNoteDto>> Handle(CreateReceivedNoteCommand request, CancellationToken cancellationToken)
    {
        // Validate current account if provided
        string? currentAccountName = null;
        if (request.Data.CurrentAccountId.HasValue)
        {
            var currentAccount = await _unitOfWork.CurrentAccounts.GetByIdAsync(request.Data.CurrentAccountId.Value, cancellationToken);
            if (currentAccount == null)
            {
                return Result<PromissoryNoteDto>.Failure(
                    Error.NotFound("CurrentAccount", $"ID {request.Data.CurrentAccountId} ile cari hesap bulunamadi"));
            }
            currentAccountName = currentAccount.Name;
        }

        // Create amount
        var amount = Money.Create(request.Data.Amount, request.Data.Currency);

        // Create received note using factory method
        var note = PromissoryNote.CreateReceivedNote(
            request.Data.NoteNumber,
            request.Data.PortfolioNumber,
            request.Data.RegistrationDate,
            request.Data.DueDate,
            request.Data.IssueDate,
            amount,
            request.Data.DebtorName,
            request.Data.CurrentAccountId,
            currentAccountName);

        // Set optional fields
        if (!string.IsNullOrEmpty(request.Data.SerialNumber))
        {
            note.SetSerialNumber(request.Data.SerialNumber);
        }

        if (!string.IsNullOrEmpty(request.Data.IssuePlace))
        {
            note.SetIssuePlace(request.Data.IssuePlace);
        }

        if (request.Data.ExchangeRate.HasValue && request.Data.ExchangeRate.Value != 1)
        {
            note.SetExchangeRate(request.Data.ExchangeRate.Value);
        }

        // Set debtor info
        note.SetDebtorInfo(
            request.Data.DebtorName,
            request.Data.DebtorTaxId,
            request.Data.DebtorAddress,
            request.Data.DebtorPhone);

        // Set creditor info
        if (!string.IsNullOrEmpty(request.Data.CreditorName))
        {
            note.SetCreditorInfo(request.Data.CreditorName, request.Data.CreditorTaxId);
        }

        // Set guarantor info
        if (!string.IsNullOrEmpty(request.Data.GuarantorName))
        {
            note.SetGuarantorInfo(
                request.Data.GuarantorName,
                request.Data.GuarantorTaxId,
                request.Data.GuarantorAddress);
        }

        // Set notes
        if (!string.IsNullOrEmpty(request.Data.Notes))
        {
            note.SetNotes(request.Data.Notes);
        }

        // Save to database - using generic approach since we don't have a specific repository yet
        var dbContext = GetDbContext();
        await dbContext.Set<PromissoryNote>().AddAsync(note, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = MapToDto(note);
        return Result<PromissoryNoteDto>.Success(dto);
    }

    private DbContext GetDbContext()
    {
        // Access the underlying DbContext from the unit of work
        // This is a workaround until a proper repository is added
        return (_unitOfWork as dynamic).Context as DbContext
            ?? throw new InvalidOperationException("DbContext'e erisilemedi");
    }

    internal static PromissoryNoteDto MapToDto(PromissoryNote note)
    {
        return new PromissoryNoteDto
        {
            Id = note.Id,
            NoteNumber = note.NoteNumber,
            PortfolioNumber = note.PortfolioNumber,
            SerialNumber = note.SerialNumber,
            NoteType = note.NoteType,
            NoteTypeName = GetNoteTypeName(note.NoteType),
            Direction = note.Direction,
            DirectionName = note.Direction == MovementDirection.Inbound ? "Alinan Senet" : "Verilen Senet",
            Status = note.Status,
            StatusName = GetStatusName(note.Status),
            RegistrationDate = note.RegistrationDate,
            DueDate = note.DueDate,
            IssueDate = note.IssueDate,
            IssuePlace = note.IssuePlace,
            CollectionDate = note.CollectionDate,
            Amount = note.Amount.Amount,
            Currency = note.Currency,
            ExchangeRate = note.ExchangeRate,
            AmountTRY = note.AmountTRY.Amount,
            DebtorName = note.DebtorName,
            DebtorTaxId = note.DebtorTaxId,
            DebtorAddress = note.DebtorAddress,
            DebtorPhone = note.DebtorPhone,
            CreditorName = note.CreditorName,
            CreditorTaxId = note.CreditorTaxId,
            GuarantorName = note.GuarantorName,
            GuarantorTaxId = note.GuarantorTaxId,
            GuarantorAddress = note.GuarantorAddress,
            CurrentAccountId = note.CurrentAccountId,
            CurrentAccountName = note.CurrentAccountName,
            IsGivenToBank = note.IsGivenToBank,
            CollectionBankAccountId = note.CollectionBankAccountId,
            CollectionBankAccountName = note.CollectionBankAccount?.Name,
            GivenToBankDate = note.GivenToBankDate,
            DiscountAmount = note.DiscountAmount?.Amount,
            IsEndorsed = note.IsEndorsed,
            EndorsedToCurrentAccountId = note.EndorsedToCurrentAccountId,
            EndorsedToCurrentAccountName = note.EndorsedToCurrentAccount?.Name,
            EndorsementDate = note.EndorsementDate,
            IsGivenAsCollateral = note.IsGivenAsCollateral,
            CollateralGivenTo = note.CollateralGivenTo,
            CollateralDate = note.CollateralDate,
            IsProtested = note.IsProtested,
            ProtestDate = note.ProtestDate,
            ProtestReason = note.ProtestReason,
            PaymentId = note.PaymentId,
            JournalEntryId = note.JournalEntryId,
            Notes = note.Notes,
            Movements = note.Movements.Select(m => new PromissoryNoteMovementDto
            {
                Id = m.Id,
                PromissoryNoteId = m.PromissoryNoteId,
                MovementType = m.MovementType,
                MovementTypeName = GetMovementTypeName(m.MovementType),
                MovementDate = m.MovementDate,
                Description = m.Description
            }).ToList(),
            CreatedAt = note.CreatedDate,
            UpdatedAt = note.UpdatedDate
        };
    }

    internal static PromissoryNoteSummaryDto MapToSummaryDto(PromissoryNote note)
    {
        var today = DateTime.UtcNow.Date;
        var daysUntilDue = (note.DueDate.Date - today).Days;

        return new PromissoryNoteSummaryDto
        {
            Id = note.Id,
            NoteNumber = note.NoteNumber,
            PortfolioNumber = note.PortfolioNumber,
            NoteType = note.NoteType,
            NoteTypeName = GetNoteTypeName(note.NoteType),
            Direction = note.Direction,
            DirectionName = note.Direction == MovementDirection.Inbound ? "Alinan Senet" : "Verilen Senet",
            Status = note.Status,
            StatusName = GetStatusName(note.Status),
            DueDate = note.DueDate,
            Amount = note.Amount.Amount,
            Currency = note.Currency,
            AmountTRY = note.AmountTRY.Amount,
            DebtorName = note.DebtorName,
            CurrentAccountName = note.CurrentAccountName,
            DaysUntilDue = daysUntilDue,
            IsOverdue = daysUntilDue < 0 && note.Status == NegotiableInstrumentStatus.InPortfolio
        };
    }

    private static string GetNoteTypeName(PromissoryNoteType noteType)
    {
        return noteType switch
        {
            PromissoryNoteType.CustomerNote => "Musteri Senedi",
            PromissoryNoteType.CompanyNote => "Firma Senedi",
            PromissoryNoteType.GuaranteeNote => "Kefalet Senedi",
            _ => noteType.ToString()
        };
    }

    private static string GetStatusName(NegotiableInstrumentStatus status)
    {
        return status switch
        {
            NegotiableInstrumentStatus.InPortfolio => "Portfoyde",
            NegotiableInstrumentStatus.GivenToBank => "Bankaya Verildi",
            NegotiableInstrumentStatus.Endorsed => "Ciro Edildi",
            NegotiableInstrumentStatus.GivenAsCollateral => "Teminata Verildi",
            NegotiableInstrumentStatus.Protested => "Protestolu",
            NegotiableInstrumentStatus.Collected => "Tahsil Edildi",
            NegotiableInstrumentStatus.Bounced => "Karsilıksiz",
            NegotiableInstrumentStatus.Returned => "Iade Edildi",
            _ => status.ToString()
        };
    }

    private static string GetMovementTypeName(PromissoryNoteMovementType movementType)
    {
        return movementType switch
        {
            PromissoryNoteMovementType.Received => "Alindi",
            PromissoryNoteMovementType.Given => "Verildi",
            PromissoryNoteMovementType.GivenToBank => "Bankaya Verildi",
            PromissoryNoteMovementType.Discounted => "Iskontoya Verildi",
            PromissoryNoteMovementType.ReturnedFromBank => "Bankadan Geri Alindi",
            PromissoryNoteMovementType.Endorsed => "Ciro Edildi",
            PromissoryNoteMovementType.GivenAsCollateral => "Teminata Verildi",
            PromissoryNoteMovementType.ReturnedFromCollateral => "Teminattan Geri Alindi",
            PromissoryNoteMovementType.Collected => "Tahsil Edildi",
            PromissoryNoteMovementType.Protested => "Protesto Edildi",
            PromissoryNoteMovementType.Returned => "Iade Edildi",
            PromissoryNoteMovementType.Cancelled => "Iptal Edildi",
            _ => movementType.ToString()
        };
    }
}

#endregion

#region Create Given Note

/// <summary>
/// Verilen senet oluşturma komutu (Create Given Note Command)
/// </summary>
public class CreateGivenNoteCommand : IRequest<Result<PromissoryNoteDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public CreatePromissoryNoteDto Data { get; set; } = null!;
}

/// <summary>
/// Handler for CreateGivenNoteCommand
/// </summary>
public class CreateGivenNoteCommandHandler : IRequestHandler<CreateGivenNoteCommand, Result<PromissoryNoteDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public CreateGivenNoteCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PromissoryNoteDto>> Handle(CreateGivenNoteCommand request, CancellationToken cancellationToken)
    {
        // Validate current account if provided
        string? currentAccountName = null;
        if (request.Data.CurrentAccountId.HasValue)
        {
            var currentAccount = await _unitOfWork.CurrentAccounts.GetByIdAsync(request.Data.CurrentAccountId.Value, cancellationToken);
            if (currentAccount == null)
            {
                return Result<PromissoryNoteDto>.Failure(
                    Error.NotFound("CurrentAccount", $"ID {request.Data.CurrentAccountId} ile cari hesap bulunamadi"));
            }
            currentAccountName = currentAccount.Name;
        }

        // Create amount
        var amount = Money.Create(request.Data.Amount, request.Data.Currency);

        // Create given note using factory method
        var note = PromissoryNote.CreateGivenNote(
            request.Data.NoteNumber,
            request.Data.PortfolioNumber,
            request.Data.RegistrationDate,
            request.Data.DueDate,
            request.Data.IssueDate,
            amount,
            request.Data.DebtorName,
            request.Data.CurrentAccountId,
            currentAccountName);

        // Set optional fields
        if (!string.IsNullOrEmpty(request.Data.SerialNumber))
        {
            note.SetSerialNumber(request.Data.SerialNumber);
        }

        if (!string.IsNullOrEmpty(request.Data.IssuePlace))
        {
            note.SetIssuePlace(request.Data.IssuePlace);
        }

        if (request.Data.ExchangeRate.HasValue && request.Data.ExchangeRate.Value != 1)
        {
            note.SetExchangeRate(request.Data.ExchangeRate.Value);
        }

        // Set debtor info
        note.SetDebtorInfo(
            request.Data.DebtorName,
            request.Data.DebtorTaxId,
            request.Data.DebtorAddress,
            request.Data.DebtorPhone);

        // Set creditor info
        if (!string.IsNullOrEmpty(request.Data.CreditorName))
        {
            note.SetCreditorInfo(request.Data.CreditorName, request.Data.CreditorTaxId);
        }

        // Set guarantor info
        if (!string.IsNullOrEmpty(request.Data.GuarantorName))
        {
            note.SetGuarantorInfo(
                request.Data.GuarantorName,
                request.Data.GuarantorTaxId,
                request.Data.GuarantorAddress);
        }

        // Set notes
        if (!string.IsNullOrEmpty(request.Data.Notes))
        {
            note.SetNotes(request.Data.Notes);
        }

        // Save to database
        var dbContext = GetDbContext();
        await dbContext.Set<PromissoryNote>().AddAsync(note, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = CreateReceivedNoteCommandHandler.MapToDto(note);
        return Result<PromissoryNoteDto>.Success(dto);
    }

    private DbContext GetDbContext()
    {
        return (_unitOfWork as dynamic).Context as DbContext
            ?? throw new InvalidOperationException("DbContext'e erisilemedi");
    }
}

#endregion

#region Update Promissory Note

/// <summary>
/// Senet güncelleme komutu (Update Promissory Note Command)
/// </summary>
public class UpdatePromissoryNoteCommand : IRequest<Result<PromissoryNoteDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public UpdatePromissoryNoteDto Data { get; set; } = null!;
}

/// <summary>
/// Handler for UpdatePromissoryNoteCommand
/// </summary>
public class UpdatePromissoryNoteCommandHandler : IRequestHandler<UpdatePromissoryNoteCommand, Result<PromissoryNoteDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public UpdatePromissoryNoteCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PromissoryNoteDto>> Handle(UpdatePromissoryNoteCommand request, CancellationToken cancellationToken)
    {
        var dbContext = GetDbContext();
        var note = await dbContext.Set<PromissoryNote>()
            .Include(n => n.Movements)
            .FirstOrDefaultAsync(n => n.Id == request.Id, cancellationToken);

        if (note == null)
        {
            return Result<PromissoryNoteDto>.Failure(
                Error.NotFound("PromissoryNote", $"ID {request.Id} ile senet bulunamadi"));
        }

        // Only allow updates if note is in portfolio
        if (note.Status != NegotiableInstrumentStatus.InPortfolio)
        {
            return Result<PromissoryNoteDto>.Failure(
                Error.Validation("PromissoryNote.Status", "Sadece portfoydeki senetler guncellenebilir"));
        }

        // Update fields
        if (!string.IsNullOrEmpty(request.Data.SerialNumber))
        {
            note.SetSerialNumber(request.Data.SerialNumber);
        }

        if (!string.IsNullOrEmpty(request.Data.IssuePlace))
        {
            note.SetIssuePlace(request.Data.IssuePlace);
        }

        if (request.Data.ExchangeRate.HasValue)
        {
            note.SetExchangeRate(request.Data.ExchangeRate.Value);
        }

        // Update debtor info if provided
        if (!string.IsNullOrEmpty(request.Data.DebtorName))
        {
            note.SetDebtorInfo(
                request.Data.DebtorName,
                request.Data.DebtorTaxId,
                request.Data.DebtorAddress,
                request.Data.DebtorPhone);
        }

        // Update creditor info
        if (request.Data.CreditorName != null)
        {
            note.SetCreditorInfo(request.Data.CreditorName, request.Data.CreditorTaxId);
        }

        // Update guarantor info
        if (request.Data.GuarantorName != null)
        {
            note.SetGuarantorInfo(
                request.Data.GuarantorName,
                request.Data.GuarantorTaxId,
                request.Data.GuarantorAddress);
        }

        // Update current account if provided
        if (request.Data.CurrentAccountId.HasValue)
        {
            var currentAccount = await _unitOfWork.CurrentAccounts.GetByIdAsync(request.Data.CurrentAccountId.Value, cancellationToken);
            if (currentAccount == null)
            {
                return Result<PromissoryNoteDto>.Failure(
                    Error.NotFound("CurrentAccount", $"ID {request.Data.CurrentAccountId} ile cari hesap bulunamadi"));
            }
            note.LinkToCurrentAccount(request.Data.CurrentAccountId.Value, currentAccount.Name);
        }

        // Update notes
        if (request.Data.Notes != null)
        {
            note.SetNotes(request.Data.Notes);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = CreateReceivedNoteCommandHandler.MapToDto(note);
        return Result<PromissoryNoteDto>.Success(dto);
    }

    private DbContext GetDbContext()
    {
        return (_unitOfWork as dynamic).Context as DbContext
            ?? throw new InvalidOperationException("DbContext'e erisilemedi");
    }
}

#endregion

#region Delete Promissory Note

/// <summary>
/// Senet silme komutu (Delete Promissory Note Command)
/// </summary>
public class DeletePromissoryNoteCommand : IRequest<Result<bool>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

/// <summary>
/// Handler for DeletePromissoryNoteCommand
/// </summary>
public class DeletePromissoryNoteCommandHandler : IRequestHandler<DeletePromissoryNoteCommand, Result<bool>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public DeletePromissoryNoteCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(DeletePromissoryNoteCommand request, CancellationToken cancellationToken)
    {
        var dbContext = GetDbContext();
        var note = await dbContext.Set<PromissoryNote>()
            .FirstOrDefaultAsync(n => n.Id == request.Id, cancellationToken);

        if (note == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("PromissoryNote", $"ID {request.Id} ile senet bulunamadi"));
        }

        // Only allow deletion if note is in portfolio and has no linked payment
        if (note.Status != NegotiableInstrumentStatus.InPortfolio)
        {
            return Result<bool>.Failure(
                Error.Validation("PromissoryNote.Status", "Sadece portfoydeki senetler silinebilir"));
        }

        if (note.PaymentId.HasValue)
        {
            return Result<bool>.Failure(
                Error.Validation("PromissoryNote.Payment", "Odemeye bagli senetler silinemez"));
        }

        if (note.JournalEntryId.HasValue)
        {
            return Result<bool>.Failure(
                Error.Validation("PromissoryNote.JournalEntry", "Muhasebe fisine bagli senetler silinemez"));
        }

        dbContext.Set<PromissoryNote>().Remove(note);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }

    private DbContext GetDbContext()
    {
        return (_unitOfWork as dynamic).Context as DbContext
            ?? throw new InvalidOperationException("DbContext'e erisilemedi");
    }
}

#endregion

#region Collect Promissory Note

/// <summary>
/// Senet tahsil komutu (Collect Promissory Note Command)
/// </summary>
public class CollectPromissoryNoteCommand : IRequest<Result<PromissoryNoteDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public CollectPromissoryNoteDto Data { get; set; } = null!;
}

/// <summary>
/// Handler for CollectPromissoryNoteCommand
/// </summary>
public class CollectPromissoryNoteCommandHandler : IRequestHandler<CollectPromissoryNoteCommand, Result<PromissoryNoteDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public CollectPromissoryNoteCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PromissoryNoteDto>> Handle(CollectPromissoryNoteCommand request, CancellationToken cancellationToken)
    {
        var dbContext = GetDbContext();
        var note = await dbContext.Set<PromissoryNote>()
            .Include(n => n.Movements)
            .FirstOrDefaultAsync(n => n.Id == request.Id, cancellationToken);

        if (note == null)
        {
            return Result<PromissoryNoteDto>.Failure(
                Error.NotFound("PromissoryNote", $"ID {request.Id} ile senet bulunamadi"));
        }

        try
        {
            note.Collect(request.Data.CollectionDate);

            if (!string.IsNullOrEmpty(request.Data.Notes))
            {
                note.SetNotes(note.Notes + Environment.NewLine + request.Data.Notes);
            }
        }
        catch (InvalidOperationException ex)
        {
            return Result<PromissoryNoteDto>.Failure(
                Error.Validation("PromissoryNote.Collect", ex.Message));
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = CreateReceivedNoteCommandHandler.MapToDto(note);
        return Result<PromissoryNoteDto>.Success(dto);
    }

    private DbContext GetDbContext()
    {
        return (_unitOfWork as dynamic).Context as DbContext
            ?? throw new InvalidOperationException("DbContext'e erisilemedi");
    }
}

#endregion

#region Protest Promissory Note

/// <summary>
/// Senet protesto komutu (Protest Promissory Note Command)
/// </summary>
public class ProtestPromissoryNoteCommand : IRequest<Result<PromissoryNoteDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public ProtestPromissoryNoteDto Data { get; set; } = null!;
}

/// <summary>
/// Handler for ProtestPromissoryNoteCommand
/// </summary>
public class ProtestPromissoryNoteCommandHandler : IRequestHandler<ProtestPromissoryNoteCommand, Result<PromissoryNoteDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public ProtestPromissoryNoteCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PromissoryNoteDto>> Handle(ProtestPromissoryNoteCommand request, CancellationToken cancellationToken)
    {
        var dbContext = GetDbContext();
        var note = await dbContext.Set<PromissoryNote>()
            .Include(n => n.Movements)
            .FirstOrDefaultAsync(n => n.Id == request.Id, cancellationToken);

        if (note == null)
        {
            return Result<PromissoryNoteDto>.Failure(
                Error.NotFound("PromissoryNote", $"ID {request.Id} ile senet bulunamadi"));
        }

        if (string.IsNullOrWhiteSpace(request.Data.Reason))
        {
            return Result<PromissoryNoteDto>.Failure(
                Error.Validation("PromissoryNote.Protest", "Protesto nedeni zorunludur"));
        }

        try
        {
            note.Protest(request.Data.ProtestDate, request.Data.Reason);
        }
        catch (InvalidOperationException ex)
        {
            return Result<PromissoryNoteDto>.Failure(
                Error.Validation("PromissoryNote.Protest", ex.Message));
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = CreateReceivedNoteCommandHandler.MapToDto(note);
        return Result<PromissoryNoteDto>.Success(dto);
    }

    private DbContext GetDbContext()
    {
        return (_unitOfWork as dynamic).Context as DbContext
            ?? throw new InvalidOperationException("DbContext'e erisilemedi");
    }
}

#endregion

#region Give to Bank

/// <summary>
/// Senedi bankaya tahsile verme komutu (Give to Bank Command)
/// </summary>
public class GiveToBankCommand : IRequest<Result<PromissoryNoteDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public PromissoryNoteGiveToBankDto Data { get; set; } = null!;
}

/// <summary>
/// Handler for GiveToBankCommand
/// </summary>
public class GiveToBankCommandHandler : IRequestHandler<GiveToBankCommand, Result<PromissoryNoteDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GiveToBankCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PromissoryNoteDto>> Handle(GiveToBankCommand request, CancellationToken cancellationToken)
    {
        var dbContext = GetDbContext();
        var note = await dbContext.Set<PromissoryNote>()
            .Include(n => n.Movements)
            .FirstOrDefaultAsync(n => n.Id == request.Id, cancellationToken);

        if (note == null)
        {
            return Result<PromissoryNoteDto>.Failure(
                Error.NotFound("PromissoryNote", $"ID {request.Id} ile senet bulunamadi"));
        }

        try
        {
            if (request.Data.DiscountAmount.HasValue)
            {
                var discountMoney = Money.Create(request.Data.DiscountAmount.Value, note.Currency);
                note.GiveToBankForDiscount(request.Data.BankAccountId, request.Data.Date, discountMoney);
            }
            else
            {
                note.GiveToBank(request.Data.BankAccountId, request.Data.Date);
            }

            if (!string.IsNullOrEmpty(request.Data.Notes))
            {
                note.SetNotes(note.Notes + Environment.NewLine + request.Data.Notes);
            }
        }
        catch (InvalidOperationException ex)
        {
            return Result<PromissoryNoteDto>.Failure(
                Error.Validation("PromissoryNote.GiveToBank", ex.Message));
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = CreateReceivedNoteCommandHandler.MapToDto(note);
        return Result<PromissoryNoteDto>.Success(dto);
    }

    private DbContext GetDbContext()
    {
        return (_unitOfWork as dynamic).Context as DbContext
            ?? throw new InvalidOperationException("DbContext'e erisilemedi");
    }
}

#endregion

#region Return from Bank

/// <summary>
/// Senedi bankadan geri alma komutu (Return from Bank Command)
/// </summary>
public class ReturnFromBankCommand : IRequest<Result<PromissoryNoteDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public DateTime ReturnDate { get; set; }
    public string? Notes { get; set; }
}

/// <summary>
/// Handler for ReturnFromBankCommand
/// </summary>
public class ReturnFromBankCommandHandler : IRequestHandler<ReturnFromBankCommand, Result<PromissoryNoteDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public ReturnFromBankCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PromissoryNoteDto>> Handle(ReturnFromBankCommand request, CancellationToken cancellationToken)
    {
        var dbContext = GetDbContext();
        var note = await dbContext.Set<PromissoryNote>()
            .Include(n => n.Movements)
            .FirstOrDefaultAsync(n => n.Id == request.Id, cancellationToken);

        if (note == null)
        {
            return Result<PromissoryNoteDto>.Failure(
                Error.NotFound("PromissoryNote", $"ID {request.Id} ile senet bulunamadi"));
        }

        try
        {
            note.ReturnFromBank(request.ReturnDate);

            if (!string.IsNullOrEmpty(request.Notes))
            {
                note.SetNotes(note.Notes + Environment.NewLine + request.Notes);
            }
        }
        catch (InvalidOperationException ex)
        {
            return Result<PromissoryNoteDto>.Failure(
                Error.Validation("PromissoryNote.ReturnFromBank", ex.Message));
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = CreateReceivedNoteCommandHandler.MapToDto(note);
        return Result<PromissoryNoteDto>.Success(dto);
    }

    private DbContext GetDbContext()
    {
        return (_unitOfWork as dynamic).Context as DbContext
            ?? throw new InvalidOperationException("DbContext'e erisilemedi");
    }
}

#endregion

#region Endorse Promissory Note

/// <summary>
/// Senet ciro komutu (Endorse Promissory Note Command)
/// </summary>
public class EndorsePromissoryNoteCommand : IRequest<Result<PromissoryNoteDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public EndorsePromissoryNoteDto Data { get; set; } = null!;
}

/// <summary>
/// Handler for EndorsePromissoryNoteCommand
/// </summary>
public class EndorsePromissoryNoteCommandHandler : IRequestHandler<EndorsePromissoryNoteCommand, Result<PromissoryNoteDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public EndorsePromissoryNoteCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PromissoryNoteDto>> Handle(EndorsePromissoryNoteCommand request, CancellationToken cancellationToken)
    {
        var dbContext = GetDbContext();
        var note = await dbContext.Set<PromissoryNote>()
            .Include(n => n.Movements)
            .FirstOrDefaultAsync(n => n.Id == request.Id, cancellationToken);

        if (note == null)
        {
            return Result<PromissoryNoteDto>.Failure(
                Error.NotFound("PromissoryNote", $"ID {request.Id} ile senet bulunamadi"));
        }

        // Validate the target current account
        var targetAccount = await _unitOfWork.CurrentAccounts.GetByIdAsync(request.Data.EndorsedToCurrentAccountId, cancellationToken);
        if (targetAccount == null)
        {
            return Result<PromissoryNoteDto>.Failure(
                Error.NotFound("CurrentAccount", $"ID {request.Data.EndorsedToCurrentAccountId} ile cari hesap bulunamadi"));
        }

        try
        {
            note.Endorse(request.Data.EndorsedToCurrentAccountId, request.Data.EndorsementDate);

            if (!string.IsNullOrEmpty(request.Data.Notes))
            {
                note.SetNotes(note.Notes + Environment.NewLine + request.Data.Notes);
            }
        }
        catch (InvalidOperationException ex)
        {
            return Result<PromissoryNoteDto>.Failure(
                Error.Validation("PromissoryNote.Endorse", ex.Message));
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = CreateReceivedNoteCommandHandler.MapToDto(note);
        return Result<PromissoryNoteDto>.Success(dto);
    }

    private DbContext GetDbContext()
    {
        return (_unitOfWork as dynamic).Context as DbContext
            ?? throw new InvalidOperationException("DbContext'e erisilemedi");
    }
}

#endregion

#region Give as Collateral

/// <summary>
/// Senedi teminata verme komutu (Give as Collateral Command)
/// </summary>
public class GiveAsCollateralCommand : IRequest<Result<PromissoryNoteDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public GiveAsCollateralDto Data { get; set; } = null!;
}

/// <summary>
/// Handler for GiveAsCollateralCommand
/// </summary>
public class GiveAsCollateralCommandHandler : IRequestHandler<GiveAsCollateralCommand, Result<PromissoryNoteDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GiveAsCollateralCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PromissoryNoteDto>> Handle(GiveAsCollateralCommand request, CancellationToken cancellationToken)
    {
        var dbContext = GetDbContext();
        var note = await dbContext.Set<PromissoryNote>()
            .Include(n => n.Movements)
            .FirstOrDefaultAsync(n => n.Id == request.Id, cancellationToken);

        if (note == null)
        {
            return Result<PromissoryNoteDto>.Failure(
                Error.NotFound("PromissoryNote", $"ID {request.Id} ile senet bulunamadi"));
        }

        if (string.IsNullOrWhiteSpace(request.Data.CollateralGivenTo))
        {
            return Result<PromissoryNoteDto>.Failure(
                Error.Validation("PromissoryNote.GiveAsCollateral", "Teminat verilen yer zorunludur"));
        }

        try
        {
            note.GiveAsCollateral(request.Data.CollateralGivenTo, request.Data.CollateralDate);

            if (!string.IsNullOrEmpty(request.Data.Notes))
            {
                note.SetNotes(note.Notes + Environment.NewLine + request.Data.Notes);
            }
        }
        catch (InvalidOperationException ex)
        {
            return Result<PromissoryNoteDto>.Failure(
                Error.Validation("PromissoryNote.GiveAsCollateral", ex.Message));
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = CreateReceivedNoteCommandHandler.MapToDto(note);
        return Result<PromissoryNoteDto>.Success(dto);
    }

    private DbContext GetDbContext()
    {
        return (_unitOfWork as dynamic).Context as DbContext
            ?? throw new InvalidOperationException("DbContext'e erisilemedi");
    }
}

#endregion

#region Return Promissory Note

/// <summary>
/// Senet iade komutu (Return Promissory Note Command)
/// </summary>
public class ReturnPromissoryNoteCommand : IRequest<Result<PromissoryNoteDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public DateTime ReturnDate { get; set; }
    public string Reason { get; set; } = string.Empty;
}

/// <summary>
/// Handler for ReturnPromissoryNoteCommand
/// </summary>
public class ReturnPromissoryNoteCommandHandler : IRequestHandler<ReturnPromissoryNoteCommand, Result<PromissoryNoteDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public ReturnPromissoryNoteCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PromissoryNoteDto>> Handle(ReturnPromissoryNoteCommand request, CancellationToken cancellationToken)
    {
        var dbContext = GetDbContext();
        var note = await dbContext.Set<PromissoryNote>()
            .Include(n => n.Movements)
            .FirstOrDefaultAsync(n => n.Id == request.Id, cancellationToken);

        if (note == null)
        {
            return Result<PromissoryNoteDto>.Failure(
                Error.NotFound("PromissoryNote", $"ID {request.Id} ile senet bulunamadi"));
        }

        try
        {
            note.Return(request.ReturnDate, request.Reason);
        }
        catch (InvalidOperationException ex)
        {
            return Result<PromissoryNoteDto>.Failure(
                Error.Validation("PromissoryNote.Return", ex.Message));
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = CreateReceivedNoteCommandHandler.MapToDto(note);
        return Result<PromissoryNoteDto>.Success(dto);
    }

    private DbContext GetDbContext()
    {
        return (_unitOfWork as dynamic).Context as DbContext
            ?? throw new InvalidOperationException("DbContext'e erisilemedi");
    }
}

#endregion

#region Create Promissory Note

/// <summary>
/// Genel senet oluşturma komutu (Create Promissory Note Command)
/// </summary>
public class CreatePromissoryNoteCommand : IRequest<Result<PromissoryNoteDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public CreatePromissoryNoteDto Data { get; set; } = null!;
}

/// <summary>
/// Handler for CreatePromissoryNoteCommand
/// </summary>
public class CreatePromissoryNoteCommandHandler : IRequestHandler<CreatePromissoryNoteCommand, Result<PromissoryNoteDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public CreatePromissoryNoteCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PromissoryNoteDto>> Handle(CreatePromissoryNoteCommand request, CancellationToken cancellationToken)
    {
        // Use the received note command for general creation (defaults to received)
        var receivedNoteCommand = new CreateReceivedNoteCommand
        {
            TenantId = request.TenantId,
            Data = request.Data
        };

        var handler = new CreateReceivedNoteCommandHandler(_unitOfWork);
        return await handler.Handle(receivedNoteCommand, cancellationToken);
    }
}

#endregion

#region Give Promissory Note To Bank

/// <summary>
/// Senedi bankaya tahsile verme komutu
/// </summary>
public class GivePromissoryNoteToBankCommand : IRequest<Result<PromissoryNoteDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public PromissoryNoteGiveToBankDto Data { get; set; } = null!;
}

/// <summary>
/// Handler for GivePromissoryNoteToBankCommand
/// </summary>
public class GivePromissoryNoteToBankCommandHandler : IRequestHandler<GivePromissoryNoteToBankCommand, Result<PromissoryNoteDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GivePromissoryNoteToBankCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PromissoryNoteDto>> Handle(GivePromissoryNoteToBankCommand request, CancellationToken cancellationToken)
    {
        var giveToBankCommand = new GiveToBankCommand
        {
            TenantId = request.TenantId,
            Id = request.Id,
            Data = request.Data
        };

        var handler = new GiveToBankCommandHandler(_unitOfWork);
        return await handler.Handle(giveToBankCommand, cancellationToken);
    }
}

#endregion

#region Cancel Promissory Note

/// <summary>
/// Senet iptal komutu (Cancel Promissory Note Command)
/// </summary>
public class CancelPromissoryNoteCommand : IRequest<Result<PromissoryNoteDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public CancelPromissoryNoteDto Data { get; set; } = null!;
}

/// <summary>
/// Handler for CancelPromissoryNoteCommand
/// </summary>
public class CancelPromissoryNoteCommandHandler : IRequestHandler<CancelPromissoryNoteCommand, Result<PromissoryNoteDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public CancelPromissoryNoteCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PromissoryNoteDto>> Handle(CancelPromissoryNoteCommand request, CancellationToken cancellationToken)
    {
        var dbContext = GetDbContext();
        var note = await dbContext.Set<PromissoryNote>()
            .Include(n => n.Movements)
            .FirstOrDefaultAsync(n => n.Id == request.Id, cancellationToken);

        if (note == null)
        {
            return Result<PromissoryNoteDto>.Failure(
                Error.NotFound("PromissoryNote", $"ID {request.Id} ile senet bulunamadi"));
        }

        if (note.Status != NegotiableInstrumentStatus.InPortfolio)
        {
            return Result<PromissoryNoteDto>.Failure(
                Error.Validation("PromissoryNote.Cancel", "Sadece portfoydeki senetler iptal edilebilir"));
        }

        if (string.IsNullOrWhiteSpace(request.Data.Reason))
        {
            return Result<PromissoryNoteDto>.Failure(
                Error.Validation("PromissoryNote.Cancel", "Iptal nedeni zorunludur"));
        }

        try
        {
            note.Cancel(request.Data.CancellationDate, request.Data.Reason);

            if (!string.IsNullOrEmpty(request.Data.Notes))
            {
                note.SetNotes(note.Notes + Environment.NewLine + request.Data.Notes);
            }
        }
        catch (InvalidOperationException ex)
        {
            return Result<PromissoryNoteDto>.Failure(
                Error.Validation("PromissoryNote.Cancel", ex.Message));
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = CreateReceivedNoteCommandHandler.MapToDto(note);
        return Result<PromissoryNoteDto>.Success(dto);
    }

    private DbContext GetDbContext()
    {
        return (_unitOfWork as dynamic).Context as DbContext
            ?? throw new InvalidOperationException("DbContext'e erisilemedi");
    }
}

#endregion
