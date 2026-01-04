using FluentValidation;
using MediatR;
using Stocker.Modules.Finance.Application.DTOs;
using Stocker.Modules.Finance.Domain.Entities;
using Stocker.Modules.Finance.Interfaces;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Finance.Application.Features.AccountingPeriods.Commands;

#region Create Commands

/// <summary>
/// Command to create a monthly accounting period
/// </summary>
public class CreateMonthlyPeriodCommand : IRequest<Result<AccountingPeriodDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public CreateMonthlyPeriodDto Data { get; set; } = null!;
}

/// <summary>
/// Validator for CreateMonthlyPeriodCommand
/// </summary>
public class CreateMonthlyPeriodCommandValidator : AbstractValidator<CreateMonthlyPeriodCommand>
{
    public CreateMonthlyPeriodCommandValidator()
    {
        RuleFor(x => x.Data).NotNull().WithMessage("Dönem bilgileri gereklidir");
        RuleFor(x => x.Data.FiscalYear)
            .GreaterThan(2000).WithMessage("Mali yıl 2000'den büyük olmalıdır")
            .LessThanOrEqualTo(2100).WithMessage("Mali yıl 2100'den küçük veya eşit olmalıdır");
        RuleFor(x => x.Data.Month)
            .InclusiveBetween(1, 12).WithMessage("Ay 1 ile 12 arasında olmalıdır");
    }
}

/// <summary>
/// Handler for CreateMonthlyPeriodCommand
/// </summary>
public class CreateMonthlyPeriodCommandHandler : IRequestHandler<CreateMonthlyPeriodCommand, Result<AccountingPeriodDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public CreateMonthlyPeriodCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<AccountingPeriodDto>> Handle(CreateMonthlyPeriodCommand request, CancellationToken cancellationToken)
    {
        // Check if period already exists
        var existingPeriod = await _unitOfWork.AccountingPeriods.GetByFiscalYearAndPeriodNumberAsync(
            request.Data.FiscalYear, request.Data.Month, AccountingPeriodType.Monthly, cancellationToken);

        if (existingPeriod != null)
        {
            return Result<AccountingPeriodDto>.Failure(
                Error.Conflict("AccountingPeriod", $"{request.Data.FiscalYear} yılı {request.Data.Month}. ay için dönem zaten mevcut"));
        }

        var period = AccountingPeriod.CreateMonthlyPeriod(request.Data.FiscalYear, request.Data.Month);

        if (!string.IsNullOrEmpty(request.Data.Description))
        {
            period.SetDescription(request.Data.Description);
        }

        if (!string.IsNullOrEmpty(request.Data.Notes))
        {
            period.SetNotes(request.Data.Notes);
        }

        await _unitOfWork.AccountingPeriods.AddAsync(period, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = MapToDto(period);
        return Result<AccountingPeriodDto>.Success(dto);
    }

    internal static AccountingPeriodDto MapToDto(AccountingPeriod period)
    {
        return new AccountingPeriodDto
        {
            Id = period.Id,
            Code = period.Code,
            Name = period.Name,
            FiscalYear = period.FiscalYear,
            PeriodNumber = period.PeriodNumber,
            PeriodType = period.PeriodType,
            PeriodTypeName = GetPeriodTypeName(period.PeriodType),
            StartDate = period.StartDate,
            EndDate = period.EndDate,
            Status = period.Status,
            StatusName = GetStatusName(period.Status),
            IsActive = period.IsActive,
            IsSoftClosed = period.IsSoftClosed,
            IsHardClosed = period.IsHardClosed,
            IsLocked = period.IsLocked,
            CloseDate = period.CloseDate,
            ClosedByUserId = period.ClosedByUserId,
            AllowSales = period.AllowSales,
            AllowPurchases = period.AllowPurchases,
            AllowInventory = period.AllowInventory,
            AllowJournalEntries = period.AllowJournalEntries,
            AllowPayments = period.AllowPayments,
            AllowBankTransactions = period.AllowBankTransactions,
            AllowAdjustments = period.AllowAdjustments,
            IsYearEndPeriod = period.IsYearEndPeriod,
            ClosingEntriesDone = period.ClosingEntriesDone,
            ClosingJournalEntryId = period.ClosingJournalEntryId,
            OpeningEntriesDone = period.OpeningEntriesDone,
            OpeningJournalEntryId = period.OpeningJournalEntryId,
            BalanceCarriedForward = period.BalanceCarriedForward,
            CarryForwardDate = period.CarryForwardDate,
            TotalJournalEntryCount = period.TotalJournalEntryCount,
            TotalInvoiceCount = period.TotalInvoiceCount,
            TotalDebitAmount = period.TotalDebitAmount?.Amount,
            TotalCreditAmount = period.TotalCreditAmount?.Amount,
            LastTransactionDate = period.LastTransactionDate,
            IsVatPeriod = period.IsVatPeriod,
            VatReturnFiled = period.VatReturnFiled,
            VatReturnDate = period.VatReturnDate,
            IsProvisionalTaxPeriod = period.IsProvisionalTaxPeriod,
            ProvisionalTaxFiled = period.ProvisionalTaxFiled,
            ProvisionalTaxDate = period.ProvisionalTaxDate,
            Description = period.Description,
            Notes = period.Notes,
            PreviousPeriodId = period.PreviousPeriodId,
            NextPeriodId = period.NextPeriodId,
            CreatedAt = period.CreatedDate,
            UpdatedAt = period.UpdatedDate
        };
    }

    internal static AccountingPeriodSummaryDto MapToSummaryDto(AccountingPeriod period)
    {
        return new AccountingPeriodSummaryDto
        {
            Id = period.Id,
            Code = period.Code,
            Name = period.Name,
            FiscalYear = period.FiscalYear,
            PeriodNumber = period.PeriodNumber,
            PeriodType = period.PeriodType,
            PeriodTypeName = GetPeriodTypeName(period.PeriodType),
            StartDate = period.StartDate,
            EndDate = period.EndDate,
            Status = period.Status,
            StatusName = GetStatusName(period.Status),
            IsActive = period.IsActive,
            IsLocked = period.IsLocked,
            TotalJournalEntryCount = period.TotalJournalEntryCount,
            TotalInvoiceCount = period.TotalInvoiceCount
        };
    }

    private static string GetPeriodTypeName(AccountingPeriodType periodType)
    {
        return periodType switch
        {
            AccountingPeriodType.Monthly => "Aylık",
            AccountingPeriodType.Quarterly => "Üç Aylık",
            AccountingPeriodType.SemiAnnual => "Altı Aylık",
            AccountingPeriodType.Annual => "Yıllık",
            AccountingPeriodType.Custom => "Özel",
            _ => periodType.ToString()
        };
    }

    private static string GetStatusName(AccountingPeriodStatus status)
    {
        return status switch
        {
            AccountingPeriodStatus.Open => "Açık",
            AccountingPeriodStatus.SoftClosed => "Geçici Kapalı",
            AccountingPeriodStatus.HardClosed => "Kesin Kapalı",
            AccountingPeriodStatus.Archived => "Arşivlenmiş",
            _ => status.ToString()
        };
    }
}

/// <summary>
/// Command to create a quarterly accounting period
/// </summary>
public class CreateQuarterlyPeriodCommand : IRequest<Result<AccountingPeriodDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public CreateQuarterlyPeriodDto Data { get; set; } = null!;
}

/// <summary>
/// Validator for CreateQuarterlyPeriodCommand
/// </summary>
public class CreateQuarterlyPeriodCommandValidator : AbstractValidator<CreateQuarterlyPeriodCommand>
{
    public CreateQuarterlyPeriodCommandValidator()
    {
        RuleFor(x => x.Data).NotNull().WithMessage("Dönem bilgileri gereklidir");
        RuleFor(x => x.Data.FiscalYear)
            .GreaterThan(2000).WithMessage("Mali yıl 2000'den büyük olmalıdır")
            .LessThanOrEqualTo(2100).WithMessage("Mali yıl 2100'den küçük veya eşit olmalıdır");
        RuleFor(x => x.Data.Quarter)
            .InclusiveBetween(1, 4).WithMessage("Çeyrek 1 ile 4 arasında olmalıdır");
    }
}

/// <summary>
/// Handler for CreateQuarterlyPeriodCommand
/// </summary>
public class CreateQuarterlyPeriodCommandHandler : IRequestHandler<CreateQuarterlyPeriodCommand, Result<AccountingPeriodDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public CreateQuarterlyPeriodCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<AccountingPeriodDto>> Handle(CreateQuarterlyPeriodCommand request, CancellationToken cancellationToken)
    {
        // Check if period already exists
        var existingPeriod = await _unitOfWork.AccountingPeriods.GetByFiscalYearAndPeriodNumberAsync(
            request.Data.FiscalYear, request.Data.Quarter, AccountingPeriodType.Quarterly, cancellationToken);

        if (existingPeriod != null)
        {
            return Result<AccountingPeriodDto>.Failure(
                Error.Conflict("AccountingPeriod", $"{request.Data.FiscalYear} yılı Q{request.Data.Quarter} için dönem zaten mevcut"));
        }

        var period = AccountingPeriod.CreateQuarterlyPeriod(request.Data.FiscalYear, request.Data.Quarter);

        if (!string.IsNullOrEmpty(request.Data.Description))
        {
            period.SetDescription(request.Data.Description);
        }

        if (!string.IsNullOrEmpty(request.Data.Notes))
        {
            period.SetNotes(request.Data.Notes);
        }

        await _unitOfWork.AccountingPeriods.AddAsync(period, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = CreateMonthlyPeriodCommandHandler.MapToDto(period);
        return Result<AccountingPeriodDto>.Success(dto);
    }
}

/// <summary>
/// Command to create an annual accounting period
/// </summary>
public class CreateAnnualPeriodCommand : IRequest<Result<AccountingPeriodDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public CreateAnnualPeriodDto Data { get; set; } = null!;
}

/// <summary>
/// Validator for CreateAnnualPeriodCommand
/// </summary>
public class CreateAnnualPeriodCommandValidator : AbstractValidator<CreateAnnualPeriodCommand>
{
    public CreateAnnualPeriodCommandValidator()
    {
        RuleFor(x => x.Data).NotNull().WithMessage("Dönem bilgileri gereklidir");
        RuleFor(x => x.Data.FiscalYear)
            .GreaterThan(2000).WithMessage("Mali yıl 2000'den büyük olmalıdır")
            .LessThanOrEqualTo(2100).WithMessage("Mali yıl 2100'den küçük veya eşit olmalıdır");
    }
}

/// <summary>
/// Handler for CreateAnnualPeriodCommand
/// </summary>
public class CreateAnnualPeriodCommandHandler : IRequestHandler<CreateAnnualPeriodCommand, Result<AccountingPeriodDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public CreateAnnualPeriodCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<AccountingPeriodDto>> Handle(CreateAnnualPeriodCommand request, CancellationToken cancellationToken)
    {
        // Check if period already exists
        var existingPeriod = await _unitOfWork.AccountingPeriods.GetByFiscalYearAndPeriodNumberAsync(
            request.Data.FiscalYear, 1, AccountingPeriodType.Annual, cancellationToken);

        if (existingPeriod != null)
        {
            return Result<AccountingPeriodDto>.Failure(
                Error.Conflict("AccountingPeriod", $"{request.Data.FiscalYear} yılı için yıllık dönem zaten mevcut"));
        }

        var period = AccountingPeriod.CreateAnnualPeriod(request.Data.FiscalYear);

        if (!string.IsNullOrEmpty(request.Data.Description))
        {
            period.SetDescription(request.Data.Description);
        }

        if (!string.IsNullOrEmpty(request.Data.Notes))
        {
            period.SetNotes(request.Data.Notes);
        }

        await _unitOfWork.AccountingPeriods.AddAsync(period, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = CreateMonthlyPeriodCommandHandler.MapToDto(period);
        return Result<AccountingPeriodDto>.Success(dto);
    }
}

/// <summary>
/// Command to create a custom accounting period
/// </summary>
public class CreateCustomPeriodCommand : IRequest<Result<AccountingPeriodDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public CreateCustomPeriodDto Data { get; set; } = null!;
}

/// <summary>
/// Validator for CreateCustomPeriodCommand
/// </summary>
public class CreateCustomPeriodCommandValidator : AbstractValidator<CreateCustomPeriodCommand>
{
    public CreateCustomPeriodCommandValidator()
    {
        RuleFor(x => x.Data).NotNull().WithMessage("Dönem bilgileri gereklidir");
        RuleFor(x => x.Data.Code)
            .NotEmpty().WithMessage("Dönem kodu gereklidir")
            .MaximumLength(50).WithMessage("Dönem kodu en fazla 50 karakter olabilir");
        RuleFor(x => x.Data.Name)
            .NotEmpty().WithMessage("Dönem adı gereklidir")
            .MaximumLength(200).WithMessage("Dönem adı en fazla 200 karakter olabilir");
        RuleFor(x => x.Data.FiscalYear)
            .GreaterThan(2000).WithMessage("Mali yıl 2000'den büyük olmalıdır")
            .LessThanOrEqualTo(2100).WithMessage("Mali yıl 2100'den küçük veya eşit olmalıdır");
        RuleFor(x => x.Data.PeriodNumber)
            .GreaterThan(0).WithMessage("Dönem numarası sıfırdan büyük olmalıdır");
        RuleFor(x => x.Data.StartDate)
            .NotEmpty().WithMessage("Başlangıç tarihi gereklidir");
        RuleFor(x => x.Data.EndDate)
            .NotEmpty().WithMessage("Bitiş tarihi gereklidir")
            .GreaterThan(x => x.Data.StartDate).WithMessage("Bitiş tarihi başlangıç tarihinden sonra olmalıdır");
    }
}

/// <summary>
/// Handler for CreateCustomPeriodCommand
/// </summary>
public class CreateCustomPeriodCommandHandler : IRequestHandler<CreateCustomPeriodCommand, Result<AccountingPeriodDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public CreateCustomPeriodCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<AccountingPeriodDto>> Handle(CreateCustomPeriodCommand request, CancellationToken cancellationToken)
    {
        // Check if period code already exists
        var existingPeriod = await _unitOfWork.AccountingPeriods.GetByCodeAsync(request.Data.Code, cancellationToken);

        if (existingPeriod != null)
        {
            return Result<AccountingPeriodDto>.Failure(
                Error.Conflict("AccountingPeriod", $"'{request.Data.Code}' kodlu dönem zaten mevcut"));
        }

        var period = AccountingPeriod.CreateCustomPeriod(
            request.Data.Code,
            request.Data.Name,
            request.Data.FiscalYear,
            request.Data.PeriodNumber,
            request.Data.StartDate,
            request.Data.EndDate);

        if (!string.IsNullOrEmpty(request.Data.Description))
        {
            period.SetDescription(request.Data.Description);
        }

        if (!string.IsNullOrEmpty(request.Data.Notes))
        {
            period.SetNotes(request.Data.Notes);
        }

        await _unitOfWork.AccountingPeriods.AddAsync(period, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = CreateMonthlyPeriodCommandHandler.MapToDto(period);
        return Result<AccountingPeriodDto>.Success(dto);
    }
}

#endregion

#region Update Command

/// <summary>
/// Command to update an accounting period
/// </summary>
public class UpdateAccountingPeriodCommand : IRequest<Result<AccountingPeriodDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public UpdateAccountingPeriodDto Data { get; set; } = null!;
}

/// <summary>
/// Validator for UpdateAccountingPeriodCommand
/// </summary>
public class UpdateAccountingPeriodCommandValidator : AbstractValidator<UpdateAccountingPeriodCommand>
{
    public UpdateAccountingPeriodCommandValidator()
    {
        RuleFor(x => x.Id).GreaterThan(0).WithMessage("Geçerli bir dönem ID'si gereklidir");
        RuleFor(x => x.Data).NotNull().WithMessage("Güncelleme bilgileri gereklidir");
        RuleFor(x => x.Data.Name)
            .MaximumLength(200).WithMessage("Dönem adı en fazla 200 karakter olabilir")
            .When(x => x.Data?.Name != null);
    }
}

/// <summary>
/// Handler for UpdateAccountingPeriodCommand
/// </summary>
public class UpdateAccountingPeriodCommandHandler : IRequestHandler<UpdateAccountingPeriodCommand, Result<AccountingPeriodDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public UpdateAccountingPeriodCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<AccountingPeriodDto>> Handle(UpdateAccountingPeriodCommand request, CancellationToken cancellationToken)
    {
        var period = await _unitOfWork.AccountingPeriods.GetByIdAsync(request.Id, cancellationToken);
        if (period == null)
        {
            return Result<AccountingPeriodDto>.Failure(
                Error.NotFound("AccountingPeriod", $"ID {request.Id} ile muhasebe dönemi bulunamadı"));
        }

        if (period.IsHardClosed)
        {
            return Result<AccountingPeriodDto>.Failure(
                Error.Validation("AccountingPeriod.Status", "Kesin kapalı dönemler güncellenemez"));
        }

        if (!string.IsNullOrEmpty(request.Data.Description))
        {
            period.SetDescription(request.Data.Description);
        }

        if (!string.IsNullOrEmpty(request.Data.Notes))
        {
            period.SetNotes(request.Data.Notes);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = CreateMonthlyPeriodCommandHandler.MapToDto(period);
        return Result<AccountingPeriodDto>.Success(dto);
    }
}

#endregion

#region Activate/Deactivate Commands

/// <summary>
/// Command to activate an accounting period
/// </summary>
public class ActivateAccountingPeriodCommand : IRequest<Result<AccountingPeriodDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

/// <summary>
/// Handler for ActivateAccountingPeriodCommand
/// </summary>
public class ActivateAccountingPeriodCommandHandler : IRequestHandler<ActivateAccountingPeriodCommand, Result<AccountingPeriodDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public ActivateAccountingPeriodCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<AccountingPeriodDto>> Handle(ActivateAccountingPeriodCommand request, CancellationToken cancellationToken)
    {
        var period = await _unitOfWork.AccountingPeriods.GetByIdAsync(request.Id, cancellationToken);
        if (period == null)
        {
            return Result<AccountingPeriodDto>.Failure(
                Error.NotFound("AccountingPeriod", $"ID {request.Id} ile muhasebe dönemi bulunamadı"));
        }

        try
        {
            period.Activate();
        }
        catch (InvalidOperationException ex)
        {
            return Result<AccountingPeriodDto>.Failure(
                Error.Validation("AccountingPeriod.Activate", ex.Message));
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = CreateMonthlyPeriodCommandHandler.MapToDto(period);
        return Result<AccountingPeriodDto>.Success(dto);
    }
}

/// <summary>
/// Command to deactivate an accounting period
/// </summary>
public class DeactivateAccountingPeriodCommand : IRequest<Result<AccountingPeriodDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

/// <summary>
/// Handler for DeactivateAccountingPeriodCommand
/// </summary>
public class DeactivateAccountingPeriodCommandHandler : IRequestHandler<DeactivateAccountingPeriodCommand, Result<AccountingPeriodDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public DeactivateAccountingPeriodCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<AccountingPeriodDto>> Handle(DeactivateAccountingPeriodCommand request, CancellationToken cancellationToken)
    {
        var period = await _unitOfWork.AccountingPeriods.GetByIdAsync(request.Id, cancellationToken);
        if (period == null)
        {
            return Result<AccountingPeriodDto>.Failure(
                Error.NotFound("AccountingPeriod", $"ID {request.Id} ile muhasebe dönemi bulunamadı"));
        }

        period.Deactivate();

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = CreateMonthlyPeriodCommandHandler.MapToDto(period);
        return Result<AccountingPeriodDto>.Success(dto);
    }
}

#endregion

#region Close/Reopen Commands

/// <summary>
/// Command to soft close an accounting period
/// </summary>
public class SoftCloseAccountingPeriodCommand : IRequest<Result<AccountingPeriodDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

/// <summary>
/// Handler for SoftCloseAccountingPeriodCommand
/// </summary>
public class SoftCloseAccountingPeriodCommandHandler : IRequestHandler<SoftCloseAccountingPeriodCommand, Result<AccountingPeriodDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public SoftCloseAccountingPeriodCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<AccountingPeriodDto>> Handle(SoftCloseAccountingPeriodCommand request, CancellationToken cancellationToken)
    {
        var period = await _unitOfWork.AccountingPeriods.GetByIdAsync(request.Id, cancellationToken);
        if (period == null)
        {
            return Result<AccountingPeriodDto>.Failure(
                Error.NotFound("AccountingPeriod", $"ID {request.Id} ile muhasebe dönemi bulunamadı"));
        }

        try
        {
            period.SoftClose();
        }
        catch (InvalidOperationException ex)
        {
            return Result<AccountingPeriodDto>.Failure(
                Error.Validation("AccountingPeriod.SoftClose", ex.Message));
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = CreateMonthlyPeriodCommandHandler.MapToDto(period);
        return Result<AccountingPeriodDto>.Success(dto);
    }
}

/// <summary>
/// Command to hard close an accounting period
/// </summary>
public class HardCloseAccountingPeriodCommand : IRequest<Result<AccountingPeriodDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public Guid ClosedByUserId { get; set; }
}

/// <summary>
/// Handler for HardCloseAccountingPeriodCommand
/// </summary>
public class HardCloseAccountingPeriodCommandHandler : IRequestHandler<HardCloseAccountingPeriodCommand, Result<AccountingPeriodDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public HardCloseAccountingPeriodCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<AccountingPeriodDto>> Handle(HardCloseAccountingPeriodCommand request, CancellationToken cancellationToken)
    {
        var period = await _unitOfWork.AccountingPeriods.GetByIdAsync(request.Id, cancellationToken);
        if (period == null)
        {
            return Result<AccountingPeriodDto>.Failure(
                Error.NotFound("AccountingPeriod", $"ID {request.Id} ile muhasebe dönemi bulunamadı"));
        }

        try
        {
            var userIdInt = (int)(request.ClosedByUserId.GetHashCode() & 0x7FFFFFFF);
            period.HardClose(userIdInt);
        }
        catch (InvalidOperationException ex)
        {
            return Result<AccountingPeriodDto>.Failure(
                Error.Validation("AccountingPeriod.HardClose", ex.Message));
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = CreateMonthlyPeriodCommandHandler.MapToDto(period);
        return Result<AccountingPeriodDto>.Success(dto);
    }
}

/// <summary>
/// Command to reopen an accounting period from soft close
/// </summary>
public class ReopenAccountingPeriodCommand : IRequest<Result<AccountingPeriodDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

/// <summary>
/// Handler for ReopenAccountingPeriodCommand
/// </summary>
public class ReopenAccountingPeriodCommandHandler : IRequestHandler<ReopenAccountingPeriodCommand, Result<AccountingPeriodDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public ReopenAccountingPeriodCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<AccountingPeriodDto>> Handle(ReopenAccountingPeriodCommand request, CancellationToken cancellationToken)
    {
        var period = await _unitOfWork.AccountingPeriods.GetByIdAsync(request.Id, cancellationToken);
        if (period == null)
        {
            return Result<AccountingPeriodDto>.Failure(
                Error.NotFound("AccountingPeriod", $"ID {request.Id} ile muhasebe dönemi bulunamadı"));
        }

        try
        {
            period.ReopenFromSoftClose();
        }
        catch (InvalidOperationException ex)
        {
            return Result<AccountingPeriodDto>.Failure(
                Error.Validation("AccountingPeriod.Reopen", ex.Message));
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = CreateMonthlyPeriodCommandHandler.MapToDto(period);
        return Result<AccountingPeriodDto>.Success(dto);
    }
}

#endregion

#region Lock/Unlock Commands

/// <summary>
/// Command to lock an accounting period
/// </summary>
public class LockAccountingPeriodCommand : IRequest<Result<AccountingPeriodDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

/// <summary>
/// Handler for LockAccountingPeriodCommand
/// </summary>
public class LockAccountingPeriodCommandHandler : IRequestHandler<LockAccountingPeriodCommand, Result<AccountingPeriodDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public LockAccountingPeriodCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<AccountingPeriodDto>> Handle(LockAccountingPeriodCommand request, CancellationToken cancellationToken)
    {
        var period = await _unitOfWork.AccountingPeriods.GetByIdAsync(request.Id, cancellationToken);
        if (period == null)
        {
            return Result<AccountingPeriodDto>.Failure(
                Error.NotFound("AccountingPeriod", $"ID {request.Id} ile muhasebe dönemi bulunamadı"));
        }

        period.Lock();

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = CreateMonthlyPeriodCommandHandler.MapToDto(period);
        return Result<AccountingPeriodDto>.Success(dto);
    }
}

/// <summary>
/// Command to unlock an accounting period
/// </summary>
public class UnlockAccountingPeriodCommand : IRequest<Result<AccountingPeriodDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

/// <summary>
/// Handler for UnlockAccountingPeriodCommand
/// </summary>
public class UnlockAccountingPeriodCommandHandler : IRequestHandler<UnlockAccountingPeriodCommand, Result<AccountingPeriodDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public UnlockAccountingPeriodCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<AccountingPeriodDto>> Handle(UnlockAccountingPeriodCommand request, CancellationToken cancellationToken)
    {
        var period = await _unitOfWork.AccountingPeriods.GetByIdAsync(request.Id, cancellationToken);
        if (period == null)
        {
            return Result<AccountingPeriodDto>.Failure(
                Error.NotFound("AccountingPeriod", $"ID {request.Id} ile muhasebe dönemi bulunamadı"));
        }

        try
        {
            period.Unlock();
        }
        catch (InvalidOperationException ex)
        {
            return Result<AccountingPeriodDto>.Failure(
                Error.Validation("AccountingPeriod.Unlock", ex.Message));
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = CreateMonthlyPeriodCommandHandler.MapToDto(period);
        return Result<AccountingPeriodDto>.Success(dto);
    }
}

#endregion

#region Restrictions Command

/// <summary>
/// Command to set restrictions on an accounting period
/// </summary>
public class SetRestrictionsCommand : IRequest<Result<AccountingPeriodDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public SetPeriodRestrictionsDto Data { get; set; } = null!;
}

/// <summary>
/// Handler for SetRestrictionsCommand
/// </summary>
public class SetRestrictionsCommandHandler : IRequestHandler<SetRestrictionsCommand, Result<AccountingPeriodDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public SetRestrictionsCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<AccountingPeriodDto>> Handle(SetRestrictionsCommand request, CancellationToken cancellationToken)
    {
        var period = await _unitOfWork.AccountingPeriods.GetByIdAsync(request.Id, cancellationToken);
        if (period == null)
        {
            return Result<AccountingPeriodDto>.Failure(
                Error.NotFound("AccountingPeriod", $"ID {request.Id} ile muhasebe dönemi bulunamadı"));
        }

        if (period.IsHardClosed)
        {
            return Result<AccountingPeriodDto>.Failure(
                Error.Validation("AccountingPeriod.Status", "Kesin kapalı dönemlerin kısıtlamaları değiştirilemez"));
        }

        period.SetRestrictions(
            request.Data.AllowSales,
            request.Data.AllowPurchases,
            request.Data.AllowInventory,
            request.Data.AllowJournalEntries,
            request.Data.AllowPayments,
            request.Data.AllowBankTransactions,
            request.Data.AllowAdjustments);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = CreateMonthlyPeriodCommandHandler.MapToDto(period);
        return Result<AccountingPeriodDto>.Success(dto);
    }
}

#endregion

#region Year End Processing Commands

/// <summary>
/// Command to process closing entries for an accounting period
/// </summary>
public class ProcessClosingEntriesCommand : IRequest<Result<AccountingPeriodDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public int ClosingJournalEntryId { get; set; }
}

/// <summary>
/// Validator for ProcessClosingEntriesCommand
/// </summary>
public class ProcessClosingEntriesCommandValidator : AbstractValidator<ProcessClosingEntriesCommand>
{
    public ProcessClosingEntriesCommandValidator()
    {
        RuleFor(x => x.Id).GreaterThan(0).WithMessage("Geçerli bir dönem ID'si gereklidir");
        RuleFor(x => x.ClosingJournalEntryId).GreaterThan(0).WithMessage("Geçerli bir kapanış fişi ID'si gereklidir");
    }
}

/// <summary>
/// Handler for ProcessClosingEntriesCommand
/// </summary>
public class ProcessClosingEntriesCommandHandler : IRequestHandler<ProcessClosingEntriesCommand, Result<AccountingPeriodDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public ProcessClosingEntriesCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<AccountingPeriodDto>> Handle(ProcessClosingEntriesCommand request, CancellationToken cancellationToken)
    {
        var period = await _unitOfWork.AccountingPeriods.GetByIdAsync(request.Id, cancellationToken);
        if (period == null)
        {
            return Result<AccountingPeriodDto>.Failure(
                Error.NotFound("AccountingPeriod", $"ID {request.Id} ile muhasebe dönemi bulunamadı"));
        }

        try
        {
            period.ProcessClosingEntries(request.ClosingJournalEntryId);
        }
        catch (InvalidOperationException ex)
        {
            return Result<AccountingPeriodDto>.Failure(
                Error.Validation("AccountingPeriod.ProcessClosingEntries", ex.Message));
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = CreateMonthlyPeriodCommandHandler.MapToDto(period);
        return Result<AccountingPeriodDto>.Success(dto);
    }
}

/// <summary>
/// Command to process opening entries for an accounting period
/// </summary>
public class ProcessOpeningEntriesCommand : IRequest<Result<AccountingPeriodDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public int OpeningJournalEntryId { get; set; }
}

/// <summary>
/// Validator for ProcessOpeningEntriesCommand
/// </summary>
public class ProcessOpeningEntriesCommandValidator : AbstractValidator<ProcessOpeningEntriesCommand>
{
    public ProcessOpeningEntriesCommandValidator()
    {
        RuleFor(x => x.Id).GreaterThan(0).WithMessage("Geçerli bir dönem ID'si gereklidir");
        RuleFor(x => x.OpeningJournalEntryId).GreaterThan(0).WithMessage("Geçerli bir açılış fişi ID'si gereklidir");
    }
}

/// <summary>
/// Handler for ProcessOpeningEntriesCommand
/// </summary>
public class ProcessOpeningEntriesCommandHandler : IRequestHandler<ProcessOpeningEntriesCommand, Result<AccountingPeriodDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public ProcessOpeningEntriesCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<AccountingPeriodDto>> Handle(ProcessOpeningEntriesCommand request, CancellationToken cancellationToken)
    {
        var period = await _unitOfWork.AccountingPeriods.GetByIdAsync(request.Id, cancellationToken);
        if (period == null)
        {
            return Result<AccountingPeriodDto>.Failure(
                Error.NotFound("AccountingPeriod", $"ID {request.Id} ile muhasebe dönemi bulunamadı"));
        }

        period.ProcessOpeningEntries(request.OpeningJournalEntryId);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = CreateMonthlyPeriodCommandHandler.MapToDto(period);
        return Result<AccountingPeriodDto>.Success(dto);
    }
}

#endregion

#region Tax Return Commands

/// <summary>
/// Command to mark VAT return as filed
/// </summary>
public class MarkVatReturnFiledCommand : IRequest<Result<AccountingPeriodDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public DateTime FilingDate { get; set; }
}

/// <summary>
/// Validator for MarkVatReturnFiledCommand
/// </summary>
public class MarkVatReturnFiledCommandValidator : AbstractValidator<MarkVatReturnFiledCommand>
{
    public MarkVatReturnFiledCommandValidator()
    {
        RuleFor(x => x.Id).GreaterThan(0).WithMessage("Geçerli bir dönem ID'si gereklidir");
        RuleFor(x => x.FilingDate).NotEmpty().WithMessage("Beyanname tarihi gereklidir");
    }
}

/// <summary>
/// Handler for MarkVatReturnFiledCommand
/// </summary>
public class MarkVatReturnFiledCommandHandler : IRequestHandler<MarkVatReturnFiledCommand, Result<AccountingPeriodDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public MarkVatReturnFiledCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<AccountingPeriodDto>> Handle(MarkVatReturnFiledCommand request, CancellationToken cancellationToken)
    {
        var period = await _unitOfWork.AccountingPeriods.GetByIdAsync(request.Id, cancellationToken);
        if (period == null)
        {
            return Result<AccountingPeriodDto>.Failure(
                Error.NotFound("AccountingPeriod", $"ID {request.Id} ile muhasebe dönemi bulunamadı"));
        }

        try
        {
            period.MarkVatReturnFiled(request.FilingDate);
        }
        catch (InvalidOperationException ex)
        {
            return Result<AccountingPeriodDto>.Failure(
                Error.Validation("AccountingPeriod.MarkVatReturnFiled", ex.Message));
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = CreateMonthlyPeriodCommandHandler.MapToDto(period);
        return Result<AccountingPeriodDto>.Success(dto);
    }
}

/// <summary>
/// Command to mark provisional tax return as filed
/// </summary>
public class MarkProvisionalTaxFiledCommand : IRequest<Result<AccountingPeriodDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public DateTime FilingDate { get; set; }
}

/// <summary>
/// Validator for MarkProvisionalTaxFiledCommand
/// </summary>
public class MarkProvisionalTaxFiledCommandValidator : AbstractValidator<MarkProvisionalTaxFiledCommand>
{
    public MarkProvisionalTaxFiledCommandValidator()
    {
        RuleFor(x => x.Id).GreaterThan(0).WithMessage("Geçerli bir dönem ID'si gereklidir");
        RuleFor(x => x.FilingDate).NotEmpty().WithMessage("Beyanname tarihi gereklidir");
    }
}

/// <summary>
/// Handler for MarkProvisionalTaxFiledCommand
/// </summary>
public class MarkProvisionalTaxFiledCommandHandler : IRequestHandler<MarkProvisionalTaxFiledCommand, Result<AccountingPeriodDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public MarkProvisionalTaxFiledCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<AccountingPeriodDto>> Handle(MarkProvisionalTaxFiledCommand request, CancellationToken cancellationToken)
    {
        var period = await _unitOfWork.AccountingPeriods.GetByIdAsync(request.Id, cancellationToken);
        if (period == null)
        {
            return Result<AccountingPeriodDto>.Failure(
                Error.NotFound("AccountingPeriod", $"ID {request.Id} ile muhasebe dönemi bulunamadı"));
        }

        try
        {
            period.MarkProvisionalTaxFiled(request.FilingDate);
        }
        catch (InvalidOperationException ex)
        {
            return Result<AccountingPeriodDto>.Failure(
                Error.Validation("AccountingPeriod.MarkProvisionalTaxFiled", ex.Message));
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = CreateMonthlyPeriodCommandHandler.MapToDto(period);
        return Result<AccountingPeriodDto>.Success(dto);
    }
}

#endregion
