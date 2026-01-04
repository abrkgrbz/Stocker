using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Finance.Application.DTOs;
using Stocker.Modules.Finance.Domain.Entities;
using Stocker.Modules.Finance.Interfaces;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;
using Stocker.Domain.Common.ValueObjects;

namespace Stocker.Modules.Finance.Application.Features.JournalEntries.Commands;

#region Create Journal Entry

/// <summary>
/// Command to create a new journal entry
/// </summary>
public class CreateJournalEntryCommand : IRequest<Result<JournalEntryDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public CreateJournalEntryDto Data { get; set; } = null!;
}

/// <summary>
/// Handler for CreateJournalEntryCommand
/// </summary>
public class CreateJournalEntryCommandHandler : IRequestHandler<CreateJournalEntryCommand, Result<JournalEntryDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public CreateJournalEntryCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<JournalEntryDto>> Handle(CreateJournalEntryCommand request, CancellationToken cancellationToken)
    {
        // Validate lines
        if (request.Data.Lines == null || !request.Data.Lines.Any())
        {
            return Result<JournalEntryDto>.Failure(
                Error.Validation("JournalEntry.Lines", "Yevmiye kaydı en az bir satır içermelidir"));
        }

        // Validate each line has either debit or credit
        foreach (var lineDto in request.Data.Lines)
        {
            if (!lineDto.DebitAmount.HasValue && !lineDto.CreditAmount.HasValue)
            {
                return Result<JournalEntryDto>.Failure(
                    Error.Validation("JournalEntry.Lines", "Her satırda borç veya alacak tutarı olmalıdır"));
            }

            if (lineDto.DebitAmount.HasValue && lineDto.CreditAmount.HasValue &&
                lineDto.DebitAmount.Value > 0 && lineDto.CreditAmount.Value > 0)
            {
                return Result<JournalEntryDto>.Failure(
                    Error.Validation("JournalEntry.Lines", "Aynı satırda hem borç hem alacak olamaz"));
            }
        }

        // Generate entry number
        var year = request.Data.EntryDate.Year;
        var lastEntry = await _unitOfWork.JournalEntries
            .AsQueryable()
            .Where(j => j.EntryDate.Year == year)
            .OrderByDescending(j => j.EntryNumber)
            .FirstOrDefaultAsync(cancellationToken);

        int nextNumber = 1;
        if (lastEntry != null && lastEntry.EntryNumber.Contains('-'))
        {
            var parts = lastEntry.EntryNumber.Split('-');
            if (parts.Length == 2 && int.TryParse(parts[1], out int lastNum))
            {
                nextNumber = lastNum + 1;
            }
        }

        var entryNumber = $"YEV-{year}-{nextNumber:D6}";

        // Create journal entry
        var journalEntry = new JournalEntry(
            entryNumber,
            request.Data.EntryDate,
            request.Data.EntryType,
            request.Data.Description,
            request.Data.AccountingPeriodId,
            request.Data.Currency);

        // Set reference if provided
        if (!string.IsNullOrEmpty(request.Data.ReferenceType))
        {
            journalEntry.SetReference(
                request.Data.ReferenceType,
                request.Data.ReferenceNumber ?? string.Empty,
                request.Data.ReferenceId);
        }

        // Add lines
        int lineNumber = 1;
        foreach (var lineDto in request.Data.Lines)
        {
            var debitAmount = lineDto.DebitAmount.HasValue
                ? Money.Create(lineDto.DebitAmount.Value, request.Data.Currency)
                : null;
            var creditAmount = lineDto.CreditAmount.HasValue
                ? Money.Create(lineDto.CreditAmount.Value, request.Data.Currency)
                : null;

            var line = new JournalEntryLine(
                journalEntry.Id,
                lineDto.AccountId,
                debitAmount,
                creditAmount,
                lineDto.Description);

            line.SetLineNumber(lineNumber++);

            if (lineDto.CostCenterId.HasValue)
            {
                line.SetCostCenter(lineDto.CostCenterId.Value);
            }

            if (lineDto.ProjectId.HasValue)
            {
                line.SetProject(lineDto.ProjectId.Value);
            }

            if (lineDto.CurrentAccountId.HasValue)
            {
                line.SetCurrentAccount(lineDto.CurrentAccountId.Value);
            }

            journalEntry.AddLine(line);
        }

        // Save journal entry
        await _unitOfWork.JournalEntries.AddAsync(journalEntry, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Map to DTO
        var dto = MapToDto(journalEntry);
        return Result<JournalEntryDto>.Success(dto);
    }

    internal static JournalEntryDto MapToDto(JournalEntry entry)
    {
        return new JournalEntryDto
        {
            Id = entry.Id,
            EntryNumber = entry.EntryNumber,
            EntryDate = entry.EntryDate,
            EntryType = entry.EntryType,
            EntryTypeName = GetEntryTypeName(entry.EntryType),
            Description = entry.Description,
            ReferenceType = entry.ReferenceType,
            ReferenceNumber = entry.ReferenceNumber,
            ReferenceId = entry.ReferenceId,
            TotalDebit = entry.TotalDebit.Amount,
            TotalCredit = entry.TotalCredit.Amount,
            Currency = entry.Currency,
            IsBalanced = entry.IsBalanced(),
            Status = entry.Status,
            StatusName = GetStatusName(entry.Status),
            ApprovedBy = entry.ApprovedBy,
            ApprovalDate = entry.ApprovalDate,
            AccountingPeriodId = entry.AccountingPeriodId,
            AccountingPeriodName = entry.AccountingPeriod?.Name,
            IsAutoGenerated = entry.IsAutoGenerated,
            IsReversal = entry.IsReversal,
            ReversedEntryId = entry.ReversedEntryId,
            ReversedEntryNumber = entry.ReversedEntry?.EntryNumber,
            Lines = entry.Lines.Select(MapLineToDto).ToList(),
            CreatedAt = entry.CreatedDate,
            UpdatedAt = entry.UpdatedDate
        };
    }

    internal static JournalEntryLineDto MapLineToDto(JournalEntryLine line)
    {
        return new JournalEntryLineDto
        {
            Id = line.Id,
            JournalEntryId = line.JournalEntryId,
            LineNumber = line.LineNumber,
            AccountId = line.AccountId,
            AccountCode = line.Account?.Code,
            AccountName = line.Account?.Name,
            DebitAmount = line.DebitAmount?.Amount,
            CreditAmount = line.CreditAmount?.Amount,
            Currency = line.DebitAmount?.Currency ?? line.CreditAmount?.Currency,
            Description = line.Description,
            CostCenterId = line.CostCenterId,
            CostCenterName = line.CostCenter?.Name,
            ProjectId = line.ProjectId,
            CurrentAccountId = line.CurrentAccountId,
            CurrentAccountName = line.CurrentAccount?.Name
        };
    }

    internal static string GetEntryTypeName(JournalEntryType type) => type switch
    {
        JournalEntryType.Opening => "Acilis Fisi",
        JournalEntryType.Collection => "Tahsilat Fisi",
        JournalEntryType.Payment => "Tediye Fisi",
        JournalEntryType.Offset => "Mahsup Fisi",
        JournalEntryType.SalesInvoice => "Satis Faturasi",
        JournalEntryType.PurchaseInvoice => "Alis Faturasi",
        JournalEntryType.ReturnInvoice => "Iade Faturasi",
        JournalEntryType.General => "Genel Muhasebe",
        JournalEntryType.Closing => "Kapanis Fisi",
        JournalEntryType.Adjustment => "Duzeltme Fisi",
        JournalEntryType.Transfer => "Transfer Fisi",
        JournalEntryType.Depreciation => "Amortisman Fisi",
        JournalEntryType.ExchangeRateDifference => "Kur Farki Fisi",
        _ => type.ToString()
    };

    internal static string GetStatusName(JournalEntryStatus status) => status switch
    {
        JournalEntryStatus.Draft => "Taslak",
        JournalEntryStatus.Pending => "Onay Bekliyor",
        JournalEntryStatus.Approved => "Onaylandi",
        JournalEntryStatus.Posted => "Deftere Islendi",
        JournalEntryStatus.Rejected => "Reddedildi",
        JournalEntryStatus.Voided => "Iptal Edildi",
        _ => status.ToString()
    };
}

#endregion

#region Update Journal Entry

/// <summary>
/// Command to update a journal entry
/// </summary>
public class UpdateJournalEntryCommand : IRequest<Result<JournalEntryDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public UpdateJournalEntryDto Data { get; set; } = null!;
}

/// <summary>
/// Handler for UpdateJournalEntryCommand
/// </summary>
public class UpdateJournalEntryCommandHandler : IRequestHandler<UpdateJournalEntryCommand, Result<JournalEntryDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public UpdateJournalEntryCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<JournalEntryDto>> Handle(UpdateJournalEntryCommand request, CancellationToken cancellationToken)
    {
        var journalEntry = await _unitOfWork.JournalEntries
            .AsQueryable()
            .Include(j => j.Lines)
            .FirstOrDefaultAsync(j => j.Id == request.Id, cancellationToken);

        if (journalEntry == null)
        {
            return Result<JournalEntryDto>.Failure(
                Error.NotFound("JournalEntry", $"ID {request.Id} ile yevmiye kaydi bulunamadi"));
        }

        if (journalEntry.Status != JournalEntryStatus.Draft)
        {
            return Result<JournalEntryDto>.Failure(
                Error.Validation("JournalEntry.Status", "Sadece taslak durumdaki yevmiye kayitlari guncellenebilir"));
        }

        // Update reference if provided
        if (request.Data.ReferenceType != null || request.Data.ReferenceNumber != null)
        {
            journalEntry.SetReference(
                request.Data.ReferenceType ?? journalEntry.ReferenceType ?? string.Empty,
                request.Data.ReferenceNumber ?? journalEntry.ReferenceNumber ?? string.Empty,
                request.Data.ReferenceId ?? journalEntry.ReferenceId);
        }

        // Update lines if provided
        if (request.Data.Lines != null && request.Data.Lines.Any())
        {
            // Remove existing lines
            var existingLines = journalEntry.Lines.ToList();
            foreach (var line in existingLines)
            {
                journalEntry.RemoveLine(line);
            }

            // Add new lines
            int lineNumber = 1;
            foreach (var lineDto in request.Data.Lines)
            {
                var debitAmount = lineDto.DebitAmount.HasValue
                    ? Money.Create(lineDto.DebitAmount.Value, journalEntry.Currency)
                    : null;
                var creditAmount = lineDto.CreditAmount.HasValue
                    ? Money.Create(lineDto.CreditAmount.Value, journalEntry.Currency)
                    : null;

                var line = new JournalEntryLine(
                    journalEntry.Id,
                    lineDto.AccountId,
                    debitAmount,
                    creditAmount,
                    lineDto.Description);

                line.SetLineNumber(lineNumber++);

                if (lineDto.CostCenterId.HasValue)
                {
                    line.SetCostCenter(lineDto.CostCenterId.Value);
                }

                if (lineDto.ProjectId.HasValue)
                {
                    line.SetProject(lineDto.ProjectId.Value);
                }

                if (lineDto.CurrentAccountId.HasValue)
                {
                    line.SetCurrentAccount(lineDto.CurrentAccountId.Value);
                }

                journalEntry.AddLine(line);
            }
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = CreateJournalEntryCommandHandler.MapToDto(journalEntry);
        return Result<JournalEntryDto>.Success(dto);
    }
}

#endregion

#region Delete Journal Entry

/// <summary>
/// Command to delete a journal entry
/// </summary>
public class DeleteJournalEntryCommand : IRequest<Result<bool>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

/// <summary>
/// Handler for DeleteJournalEntryCommand
/// </summary>
public class DeleteJournalEntryCommandHandler : IRequestHandler<DeleteJournalEntryCommand, Result<bool>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public DeleteJournalEntryCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(DeleteJournalEntryCommand request, CancellationToken cancellationToken)
    {
        var journalEntry = await _unitOfWork.JournalEntries
            .AsQueryable()
            .Include(j => j.Lines)
            .FirstOrDefaultAsync(j => j.Id == request.Id, cancellationToken);

        if (journalEntry == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("JournalEntry", $"ID {request.Id} ile yevmiye kaydi bulunamadi"));
        }

        if (journalEntry.Status == JournalEntryStatus.Posted)
        {
            return Result<bool>.Failure(
                Error.Validation("JournalEntry.Status", "Deftere islenmis yevmiye kayitlari silinemez"));
        }

        if (journalEntry.IsAutoGenerated)
        {
            return Result<bool>.Failure(
                Error.Validation("JournalEntry.AutoGenerated", "Otomatik olusturulan yevmiye kayitlari silinemez"));
        }

        _unitOfWork.JournalEntries.Remove(journalEntry);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}

#endregion

#region Submit Journal Entry

/// <summary>
/// Command to submit a journal entry for approval
/// </summary>
public class SubmitJournalEntryCommand : IRequest<Result<JournalEntryDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

/// <summary>
/// Handler for SubmitJournalEntryCommand
/// </summary>
public class SubmitJournalEntryCommandHandler : IRequestHandler<SubmitJournalEntryCommand, Result<JournalEntryDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public SubmitJournalEntryCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<JournalEntryDto>> Handle(SubmitJournalEntryCommand request, CancellationToken cancellationToken)
    {
        var journalEntry = await _unitOfWork.JournalEntries
            .AsQueryable()
            .Include(j => j.Lines)
            .FirstOrDefaultAsync(j => j.Id == request.Id, cancellationToken);

        if (journalEntry == null)
        {
            return Result<JournalEntryDto>.Failure(
                Error.NotFound("JournalEntry", $"ID {request.Id} ile yevmiye kaydi bulunamadi"));
        }

        if (!journalEntry.Lines.Any())
        {
            return Result<JournalEntryDto>.Failure(
                Error.Validation("JournalEntry.Lines", "Yevmiye kaydi en az bir satir icermelidir"));
        }

        try
        {
            journalEntry.Submit();
        }
        catch (InvalidOperationException ex)
        {
            return Result<JournalEntryDto>.Failure(
                Error.Validation("JournalEntry.Submit", ex.Message));
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = CreateJournalEntryCommandHandler.MapToDto(journalEntry);
        return Result<JournalEntryDto>.Success(dto);
    }
}

#endregion

#region Approve Journal Entry

/// <summary>
/// Command to approve a journal entry
/// </summary>
public class ApproveJournalEntryCommand : IRequest<Result<JournalEntryDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public string ApprovedBy { get; set; } = string.Empty;
}

/// <summary>
/// Handler for ApproveJournalEntryCommand
/// </summary>
public class ApproveJournalEntryCommandHandler : IRequestHandler<ApproveJournalEntryCommand, Result<JournalEntryDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public ApproveJournalEntryCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<JournalEntryDto>> Handle(ApproveJournalEntryCommand request, CancellationToken cancellationToken)
    {
        var journalEntry = await _unitOfWork.JournalEntries
            .AsQueryable()
            .Include(j => j.Lines)
            .FirstOrDefaultAsync(j => j.Id == request.Id, cancellationToken);

        if (journalEntry == null)
        {
            return Result<JournalEntryDto>.Failure(
                Error.NotFound("JournalEntry", $"ID {request.Id} ile yevmiye kaydi bulunamadi"));
        }

        if (string.IsNullOrEmpty(request.ApprovedBy))
        {
            return Result<JournalEntryDto>.Failure(
                Error.Validation("JournalEntry.ApprovedBy", "Onaylayan bilgisi zorunludur"));
        }

        try
        {
            journalEntry.Approve(request.ApprovedBy);
        }
        catch (InvalidOperationException ex)
        {
            return Result<JournalEntryDto>.Failure(
                Error.Validation("JournalEntry.Approve", ex.Message));
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = CreateJournalEntryCommandHandler.MapToDto(journalEntry);
        return Result<JournalEntryDto>.Success(dto);
    }
}

#endregion

#region Reject Journal Entry

/// <summary>
/// Command to reject a journal entry
/// </summary>
public class RejectJournalEntryCommand : IRequest<Result<JournalEntryDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public string Reason { get; set; } = string.Empty;
}

/// <summary>
/// Handler for RejectJournalEntryCommand
/// </summary>
public class RejectJournalEntryCommandHandler : IRequestHandler<RejectJournalEntryCommand, Result<JournalEntryDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public RejectJournalEntryCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<JournalEntryDto>> Handle(RejectJournalEntryCommand request, CancellationToken cancellationToken)
    {
        var journalEntry = await _unitOfWork.JournalEntries
            .AsQueryable()
            .Include(j => j.Lines)
            .FirstOrDefaultAsync(j => j.Id == request.Id, cancellationToken);

        if (journalEntry == null)
        {
            return Result<JournalEntryDto>.Failure(
                Error.NotFound("JournalEntry", $"ID {request.Id} ile yevmiye kaydi bulunamadi"));
        }

        if (string.IsNullOrEmpty(request.Reason))
        {
            return Result<JournalEntryDto>.Failure(
                Error.Validation("JournalEntry.Reason", "Red nedeni zorunludur"));
        }

        try
        {
            journalEntry.Reject(request.Reason);
        }
        catch (InvalidOperationException ex)
        {
            return Result<JournalEntryDto>.Failure(
                Error.Validation("JournalEntry.Reject", ex.Message));
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = CreateJournalEntryCommandHandler.MapToDto(journalEntry);
        return Result<JournalEntryDto>.Success(dto);
    }
}

#endregion

#region Post Journal Entry

/// <summary>
/// Command to post a journal entry to the ledger
/// </summary>
public class PostJournalEntryCommand : IRequest<Result<JournalEntryDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

/// <summary>
/// Handler for PostJournalEntryCommand
/// </summary>
public class PostJournalEntryCommandHandler : IRequestHandler<PostJournalEntryCommand, Result<JournalEntryDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public PostJournalEntryCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<JournalEntryDto>> Handle(PostJournalEntryCommand request, CancellationToken cancellationToken)
    {
        var journalEntry = await _unitOfWork.JournalEntries
            .AsQueryable()
            .Include(j => j.Lines)
                .ThenInclude(l => l.Account)
            .FirstOrDefaultAsync(j => j.Id == request.Id, cancellationToken);

        if (journalEntry == null)
        {
            return Result<JournalEntryDto>.Failure(
                Error.NotFound("JournalEntry", $"ID {request.Id} ile yevmiye kaydi bulunamadi"));
        }

        if (!journalEntry.IsBalanced())
        {
            return Result<JournalEntryDto>.Failure(
                Error.Validation("JournalEntry.Balance", "Yevmiye kaydi dengeli degil. Toplam borc ve alacak esit olmalidir"));
        }

        try
        {
            journalEntry.Post();
        }
        catch (InvalidOperationException ex)
        {
            return Result<JournalEntryDto>.Failure(
                Error.Validation("JournalEntry.Post", ex.Message));
        }

        // TODO: Update account balances based on journal entry lines
        // This would typically update the Account.Balance for each account in the lines

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = CreateJournalEntryCommandHandler.MapToDto(journalEntry);
        return Result<JournalEntryDto>.Success(dto);
    }
}

#endregion

#region Void Journal Entry

/// <summary>
/// Command to void a journal entry
/// </summary>
public class VoidJournalEntryCommand : IRequest<Result<JournalEntryDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public string? Reason { get; set; }
}

/// <summary>
/// Handler for VoidJournalEntryCommand
/// </summary>
public class VoidJournalEntryCommandHandler : IRequestHandler<VoidJournalEntryCommand, Result<JournalEntryDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public VoidJournalEntryCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<JournalEntryDto>> Handle(VoidJournalEntryCommand request, CancellationToken cancellationToken)
    {
        var journalEntry = await _unitOfWork.JournalEntries
            .AsQueryable()
            .Include(j => j.Lines)
            .FirstOrDefaultAsync(j => j.Id == request.Id, cancellationToken);

        if (journalEntry == null)
        {
            return Result<JournalEntryDto>.Failure(
                Error.NotFound("JournalEntry", $"ID {request.Id} ile yevmiye kaydi bulunamadi"));
        }

        try
        {
            journalEntry.Void();
        }
        catch (InvalidOperationException ex)
        {
            return Result<JournalEntryDto>.Failure(
                Error.Validation("JournalEntry.Void", ex.Message));
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = CreateJournalEntryCommandHandler.MapToDto(journalEntry);
        return Result<JournalEntryDto>.Success(dto);
    }
}

#endregion

#region Create Reversal Entry

/// <summary>
/// Command to create a reversal entry for an existing journal entry
/// </summary>
public class CreateReversalEntryCommand : IRequest<Result<JournalEntryDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int OriginalEntryId { get; set; }
    public DateTime ReversalDate { get; set; }
    public string? Description { get; set; }
}

/// <summary>
/// Handler for CreateReversalEntryCommand
/// </summary>
public class CreateReversalEntryCommandHandler : IRequestHandler<CreateReversalEntryCommand, Result<JournalEntryDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public CreateReversalEntryCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<JournalEntryDto>> Handle(CreateReversalEntryCommand request, CancellationToken cancellationToken)
    {
        var originalEntry = await _unitOfWork.JournalEntries
            .AsQueryable()
            .Include(j => j.Lines)
            .FirstOrDefaultAsync(j => j.Id == request.OriginalEntryId, cancellationToken);

        if (originalEntry == null)
        {
            return Result<JournalEntryDto>.Failure(
                Error.NotFound("JournalEntry", $"ID {request.OriginalEntryId} ile yevmiye kaydi bulunamadi"));
        }

        if (originalEntry.Status != JournalEntryStatus.Posted)
        {
            return Result<JournalEntryDto>.Failure(
                Error.Validation("JournalEntry.Status", "Sadece deftere islenmis yevmiye kayitlari ters kayit ile iptal edilebilir"));
        }

        if (originalEntry.IsReversal)
        {
            return Result<JournalEntryDto>.Failure(
                Error.Validation("JournalEntry.IsReversal", "Ters kayit icin tekrar ters kayit olusturulamaz"));
        }

        // Generate reversal entry number
        var year = request.ReversalDate.Year;
        var lastEntry = await _unitOfWork.JournalEntries
            .AsQueryable()
            .Where(j => j.EntryDate.Year == year)
            .OrderByDescending(j => j.EntryNumber)
            .FirstOrDefaultAsync(cancellationToken);

        int nextNumber = 1;
        if (lastEntry != null && lastEntry.EntryNumber.Contains('-'))
        {
            var parts = lastEntry.EntryNumber.Split('-');
            if (parts.Length >= 2 && int.TryParse(parts[^1], out int lastNum))
            {
                nextNumber = lastNum + 1;
            }
        }

        var reversalNumber = $"YEV-{year}-{nextNumber:D6}";

        // Create reversal entry using the entity method
        var reversalEntry = originalEntry.CreateReversal(reversalNumber, request.ReversalDate);

        // Override description if provided
        if (!string.IsNullOrEmpty(request.Description))
        {
            // Since Description is private set, we need to create a new entry with custom description
            // For now, we use the default reversal description from the entity
        }

        // Save reversal entry
        await _unitOfWork.JournalEntries.AddAsync(reversalEntry, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = CreateJournalEntryCommandHandler.MapToDto(reversalEntry);
        return Result<JournalEntryDto>.Success(dto);
    }
}

#endregion
