using MediatR;
using Stocker.Modules.Finance.Application.DTOs;
using Stocker.Modules.Finance.Application.Features.TaxDeclarations.Queries;
using Stocker.Modules.Finance.Domain.Entities;
using Stocker.Modules.Finance.Interfaces;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;
using Stocker.Domain.Common.ValueObjects;

namespace Stocker.Modules.Finance.Application.Features.TaxDeclarations.Commands;

/// <summary>
/// Command to create a new tax declaration
/// </summary>
public class CreateTaxDeclarationCommand : IRequest<Result<TaxDeclarationDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public CreateTaxDeclarationDto Data { get; set; } = null!;
}

/// <summary>
/// Handler for CreateTaxDeclarationCommand
/// </summary>
public class CreateTaxDeclarationCommandHandler : IRequestHandler<CreateTaxDeclarationCommand, Result<TaxDeclarationDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public CreateTaxDeclarationCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<TaxDeclarationDto>> Handle(CreateTaxDeclarationCommand request, CancellationToken cancellationToken)
    {
        // Check if declaration already exists for period
        var exists = await _unitOfWork.TaxDeclarations.ExistsForPeriodAsync(
            request.Data.DeclarationType,
            request.Data.TaxYear,
            request.Data.TaxMonth,
            request.Data.TaxQuarter,
            cancellationToken);

        if (exists)
        {
            return Result<TaxDeclarationDto>.Failure(
                Error.Conflict("TaxDeclaration", "Bu dönem için beyanname zaten mevcut"));
        }

        // Generate declaration number
        var declarationNumber = await _unitOfWork.TaxDeclarations.GetNextDeclarationNumberAsync(
            request.Data.DeclarationType,
            request.Data.TaxYear,
            cancellationToken);

        // Create declaration based on type
        TaxDeclaration declaration;
        var taxBase = Money.Create(request.Data.TaxBase, "TRY");
        var calculatedTax = Money.Create(request.Data.CalculatedTax, "TRY");

        switch (request.Data.DeclarationType)
        {
            case TaxDeclarationType.Kdv:
            case TaxDeclarationType.Kdv2:
                var deductibleTax = Money.Create(request.Data.DeductibleTax ?? 0, "TRY");
                var broughtForward = request.Data.BroughtForwardTax.HasValue
                    ? Money.Create(request.Data.BroughtForwardTax.Value, "TRY")
                    : null;

                declaration = TaxDeclaration.CreateVatDeclaration(
                    declarationNumber,
                    request.Data.TaxYear,
                    request.Data.TaxMonth ?? 1,
                    taxBase,
                    calculatedTax,
                    deductibleTax,
                    broughtForward);
                break;

            case TaxDeclarationType.Muhtasar:
            case TaxDeclarationType.MuhtasarPrimHizmet:
                declaration = TaxDeclaration.CreateWithholdingDeclaration(
                    declarationNumber,
                    request.Data.TaxYear,
                    request.Data.TaxMonth ?? 1,
                    taxBase,
                    calculatedTax);
                break;

            case TaxDeclarationType.GeciciVergi:
                var previousPaid = request.Data.BroughtForwardTax.HasValue
                    ? Money.Create(request.Data.BroughtForwardTax.Value, "TRY")
                    : null;

                declaration = TaxDeclaration.CreateProvisionalTaxDeclaration(
                    declarationNumber,
                    request.Data.TaxYear,
                    request.Data.TaxQuarter ?? 1,
                    taxBase,
                    calculatedTax,
                    previousPaid);
                break;

            default:
                // Generic declaration
                declaration = CreateGenericDeclaration(
                    declarationNumber,
                    request.Data.DeclarationType,
                    request.Data.TaxYear,
                    request.Data.TaxMonth,
                    request.Data.TaxQuarter,
                    taxBase,
                    calculatedTax);
                break;
        }

        // Set tax office info
        if (!string.IsNullOrEmpty(request.Data.TaxOfficeCode))
        {
            declaration.SetTaxOffice(request.Data.TaxOfficeCode, request.Data.TaxOfficeName);
        }

        // Set accounting period
        if (request.Data.AccountingPeriodId.HasValue)
        {
            declaration.SetAccountingPeriodId(request.Data.AccountingPeriodId);
        }

        // Set notes
        if (!string.IsNullOrEmpty(request.Data.Notes))
        {
            declaration.SetNotes(request.Data.Notes);
        }

        // Save
        await _unitOfWork.TaxDeclarations.AddAsync(declaration, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Return DTO
        var dto = GetTaxDeclarationByIdQueryHandler.MapToDto(declaration);
        return Result<TaxDeclarationDto>.Success(dto);
    }

    private static TaxDeclaration CreateGenericDeclaration(
        string number, TaxDeclarationType type, int year, int? month, int? quarter,
        Money taxBase, Money calculatedTax)
    {
        // This is a placeholder - in real implementation, you'd use specific factory methods
        // For now, use VAT declaration as base with appropriate modifications
        return TaxDeclaration.CreateVatDeclaration(
            number, year, month ?? 1, taxBase, calculatedTax,
            Money.Zero("TRY"), null);
    }
}

/// <summary>
/// Command to mark tax declaration as ready
/// </summary>
public class MarkTaxDeclarationReadyCommand : IRequest<Result<TaxDeclarationDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public string PreparedBy { get; set; } = string.Empty;
}

/// <summary>
/// Handler for MarkTaxDeclarationReadyCommand
/// </summary>
public class MarkTaxDeclarationReadyCommandHandler : IRequestHandler<MarkTaxDeclarationReadyCommand, Result<TaxDeclarationDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public MarkTaxDeclarationReadyCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<TaxDeclarationDto>> Handle(MarkTaxDeclarationReadyCommand request, CancellationToken cancellationToken)
    {
        var declaration = await _unitOfWork.TaxDeclarations.GetWithDetailsAsync(request.Id, cancellationToken);
        if (declaration == null)
        {
            return Result<TaxDeclarationDto>.Failure(
                Error.NotFound("TaxDeclaration", $"ID {request.Id} ile vergi beyannamesi bulunamadı"));
        }

        try
        {
            declaration.MarkAsReady(request.PreparedBy);
        }
        catch (InvalidOperationException ex)
        {
            return Result<TaxDeclarationDto>.Failure(
                Error.Validation("TaxDeclaration.MarkReady", ex.Message));
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = GetTaxDeclarationByIdQueryHandler.MapToDto(declaration);
        return Result<TaxDeclarationDto>.Success(dto);
    }
}

/// <summary>
/// Command to approve tax declaration
/// </summary>
public class ApproveTaxDeclarationCommand : IRequest<Result<TaxDeclarationDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public string ApprovedBy { get; set; } = string.Empty;
    public string? Note { get; set; }
}

/// <summary>
/// Handler for ApproveTaxDeclarationCommand
/// </summary>
public class ApproveTaxDeclarationCommandHandler : IRequestHandler<ApproveTaxDeclarationCommand, Result<TaxDeclarationDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public ApproveTaxDeclarationCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<TaxDeclarationDto>> Handle(ApproveTaxDeclarationCommand request, CancellationToken cancellationToken)
    {
        var declaration = await _unitOfWork.TaxDeclarations.GetWithDetailsAsync(request.Id, cancellationToken);
        if (declaration == null)
        {
            return Result<TaxDeclarationDto>.Failure(
                Error.NotFound("TaxDeclaration", $"ID {request.Id} ile vergi beyannamesi bulunamadı"));
        }

        try
        {
            declaration.Approve(request.ApprovedBy);

            if (!string.IsNullOrEmpty(request.Note))
            {
                declaration.SetNotes($"Onay notu: {request.Note}. {declaration.Notes}");
            }
        }
        catch (InvalidOperationException ex)
        {
            return Result<TaxDeclarationDto>.Failure(
                Error.Validation("TaxDeclaration.Approve", ex.Message));
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = GetTaxDeclarationByIdQueryHandler.MapToDto(declaration);
        return Result<TaxDeclarationDto>.Success(dto);
    }
}

/// <summary>
/// Command to file tax declaration
/// </summary>
public class FileTaxDeclarationCommand : IRequest<Result<TaxDeclarationDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public string? GibApprovalNumber { get; set; }
    public string? AccrualSlipNumber { get; set; }
}

/// <summary>
/// Handler for FileTaxDeclarationCommand
/// </summary>
public class FileTaxDeclarationCommandHandler : IRequestHandler<FileTaxDeclarationCommand, Result<TaxDeclarationDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public FileTaxDeclarationCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<TaxDeclarationDto>> Handle(FileTaxDeclarationCommand request, CancellationToken cancellationToken)
    {
        var declaration = await _unitOfWork.TaxDeclarations.GetWithDetailsAsync(request.Id, cancellationToken);
        if (declaration == null)
        {
            return Result<TaxDeclarationDto>.Failure(
                Error.NotFound("TaxDeclaration", $"ID {request.Id} ile vergi beyannamesi bulunamadı"));
        }

        try
        {
            declaration.File(DateTime.UtcNow, request.GibApprovalNumber);
            if (!string.IsNullOrEmpty(request.AccrualSlipNumber))
            {
                declaration.SetAccrualSlipNumber(request.AccrualSlipNumber);
            }
        }
        catch (InvalidOperationException ex)
        {
            return Result<TaxDeclarationDto>.Failure(
                Error.Validation("TaxDeclaration.File", ex.Message));
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = GetTaxDeclarationByIdQueryHandler.MapToDto(declaration);
        return Result<TaxDeclarationDto>.Success(dto);
    }
}

/// <summary>
/// Command to record payment for tax declaration
/// </summary>
public class RecordTaxPaymentCommand : IRequest<Result<TaxDeclarationDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public RecordTaxPaymentDto Payment { get; set; } = null!;
}

/// <summary>
/// Handler for RecordTaxPaymentCommand
/// </summary>
public class RecordTaxPaymentCommandHandler : IRequestHandler<RecordTaxPaymentCommand, Result<TaxDeclarationDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public RecordTaxPaymentCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<TaxDeclarationDto>> Handle(RecordTaxPaymentCommand request, CancellationToken cancellationToken)
    {
        var declaration = await _unitOfWork.TaxDeclarations.GetWithDetailsAsync(request.Id, cancellationToken);
        if (declaration == null)
        {
            return Result<TaxDeclarationDto>.Failure(
                Error.NotFound("TaxDeclaration", $"ID {request.Id} ile vergi beyannamesi bulunamadı"));
        }

        try
        {
            var paymentAmount = Money.Create(request.Payment.Amount, "TRY");
            declaration.RecordPayment(
                request.Payment.PaymentDate,
                paymentAmount,
                request.Payment.PaymentMethod,
                request.Payment.ReceiptNumber);
        }
        catch (InvalidOperationException ex)
        {
            return Result<TaxDeclarationDto>.Failure(
                Error.Validation("TaxDeclaration.RecordPayment", ex.Message));
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = GetTaxDeclarationByIdQueryHandler.MapToDto(declaration);
        return Result<TaxDeclarationDto>.Success(dto);
    }
}

/// <summary>
/// Command to create amendment for tax declaration
/// </summary>
public class CreateTaxAmendmentCommand : IRequest<Result<TaxDeclarationDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int OriginalDeclarationId { get; set; }
    public CreateTaxAmendmentDto Amendment { get; set; } = null!;
}

/// <summary>
/// Handler for CreateTaxAmendmentCommand
/// </summary>
public class CreateTaxAmendmentCommandHandler : IRequestHandler<CreateTaxAmendmentCommand, Result<TaxDeclarationDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public CreateTaxAmendmentCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<TaxDeclarationDto>> Handle(CreateTaxAmendmentCommand request, CancellationToken cancellationToken)
    {
        var originalDeclaration = await _unitOfWork.TaxDeclarations.GetWithDetailsAsync(request.OriginalDeclarationId, cancellationToken);
        if (originalDeclaration == null)
        {
            return Result<TaxDeclarationDto>.Failure(
                Error.NotFound("TaxDeclaration", $"ID {request.OriginalDeclarationId} ile vergi beyannamesi bulunamadı"));
        }

        // Generate amendment number
        var amendmentNumber = await _unitOfWork.TaxDeclarations.GetNextDeclarationNumberAsync(
            originalDeclaration.DeclarationType,
            originalDeclaration.TaxYear,
            cancellationToken);

        try
        {
            var amendment = originalDeclaration.CreateAmendment(
                amendmentNumber,
                request.Amendment.AmendmentReason);

            // Update tax amounts if provided
            if (request.Amendment.NewTaxBase.HasValue || request.Amendment.NewCalculatedTax.HasValue)
            {
                Money newTaxBase = request.Amendment.NewTaxBase.HasValue
                    ? Money.Create(request.Amendment.NewTaxBase.Value, "TRY")
                    : originalDeclaration.TaxBase;
                Money newCalculatedTax = request.Amendment.NewCalculatedTax.HasValue
                    ? Money.Create(request.Amendment.NewCalculatedTax.Value, "TRY")
                    : originalDeclaration.CalculatedTax;
                Money? newDeductibleTax = request.Amendment.NewDeductibleTax.HasValue
                    ? Money.Create(request.Amendment.NewDeductibleTax.Value, "TRY")
                    : originalDeclaration.DeductibleTax;

                amendment.UpdateTaxAmounts(newTaxBase, newCalculatedTax, newDeductibleTax);
            }

            await _unitOfWork.TaxDeclarations.AddAsync(amendment, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            var dto = GetTaxDeclarationByIdQueryHandler.MapToDto(amendment);
            return Result<TaxDeclarationDto>.Success(dto);
        }
        catch (InvalidOperationException ex)
        {
            return Result<TaxDeclarationDto>.Failure(
                Error.Validation("TaxDeclaration.CreateAmendment", ex.Message));
        }
    }
}

/// <summary>
/// Command to cancel tax declaration
/// </summary>
public class CancelTaxDeclarationCommand : IRequest<Result<TaxDeclarationDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public string Reason { get; set; } = string.Empty;
}

/// <summary>
/// Handler for CancelTaxDeclarationCommand
/// </summary>
public class CancelTaxDeclarationCommandHandler : IRequestHandler<CancelTaxDeclarationCommand, Result<TaxDeclarationDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public CancelTaxDeclarationCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<TaxDeclarationDto>> Handle(CancelTaxDeclarationCommand request, CancellationToken cancellationToken)
    {
        var declaration = await _unitOfWork.TaxDeclarations.GetWithDetailsAsync(request.Id, cancellationToken);
        if (declaration == null)
        {
            return Result<TaxDeclarationDto>.Failure(
                Error.NotFound("TaxDeclaration", $"ID {request.Id} ile vergi beyannamesi bulunamadı"));
        }

        try
        {
            declaration.Cancel(request.Reason);
        }
        catch (InvalidOperationException ex)
        {
            return Result<TaxDeclarationDto>.Failure(
                Error.Validation("TaxDeclaration.Cancel", ex.Message));
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = GetTaxDeclarationByIdQueryHandler.MapToDto(declaration);
        return Result<TaxDeclarationDto>.Success(dto);
    }
}

/// <summary>
/// Command to delete tax declaration
/// </summary>
public class DeleteTaxDeclarationCommand : IRequest<Result<bool>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

/// <summary>
/// Handler for DeleteTaxDeclarationCommand
/// </summary>
public class DeleteTaxDeclarationCommandHandler : IRequestHandler<DeleteTaxDeclarationCommand, Result<bool>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public DeleteTaxDeclarationCommandHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(DeleteTaxDeclarationCommand request, CancellationToken cancellationToken)
    {
        var declaration = await _unitOfWork.TaxDeclarations.GetWithDetailsAsync(request.Id, cancellationToken);
        if (declaration == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("TaxDeclaration", $"ID {request.Id} ile vergi beyannamesi bulunamadı"));
        }

        if (declaration.Status != TaxDeclarationStatus.Draft && declaration.Status != TaxDeclarationStatus.Cancelled)
        {
            return Result<bool>.Failure(
                Error.Validation("TaxDeclaration.Delete", "Sadece taslak veya iptal edilmiş beyannameler silinebilir"));
        }

        if (declaration.Payments.Any())
        {
            return Result<bool>.Failure(
                Error.Validation("TaxDeclaration.Delete", "Ödeme kaydı olan beyannameler silinemez"));
        }

        _unitOfWork.TaxDeclarations.Remove(declaration);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
